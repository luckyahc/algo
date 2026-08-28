# 아키텍처 결정

이 문서는 스프린트 전반에서 따를 기술 결정을 정리한다. PRD는 "무엇을"만 규정하므로, "어떻게"는 여기서 확정한다. `(구현됨)` 표시가 없는 항목은 아직 계획 단계다.

> 2026-08-28 갱신: Sprint 0~1에서 §1(AI 연동)과 §2/§3의 알고리즘 쪽(`/api/algorithm`, `AlgorithmDetailSchema`)이 실제로 구현되었다. 실제 코드와 다르게 남아 있던 부분(패키지 버전, 스키마 필드 구성)을 이 문서에서 바로잡았다. §2의 `/api/problem`과 §4의 상태 머신 리팩터링은 각각 Sprint 2, Sprint 3에서 아직 손대지 않았다.

## 1. AI 연동 방식 (구현됨)

- **Vercel AI SDK(`ai` 패키지, 설치된 버전은 `ai@7`) + AI Gateway**를 사용한다. 프로바이더 SDK(`@ai-sdk/anthropic` 등)를 직접 설치하지 않고, `"provider/model"` 문자열로 Gateway를 통해 호출한다. 실제 사용 모델은 `anthropic/claude-sonnet-5`(`app/api/algorithm/route.ts`의 `MODEL` 상수).
- **구조화 출력**은 `generateObject` + Zod 스키마를 사용한다. PRD 5.7("형식에 맞지 않는 응답 파싱 실패")이 요구하는 스키마 검증을 AI SDK가 기본 제공하므로, 이 조합이 예외 처리 요구사항과 가장 직접적으로 맞아떨어진다.
- 별도 프론트엔드 스트리밍은 필수 아님(결과가 카드 단위로 한 번에 렌더링되는 구조이므로). 다만 지연 상태 UX(5.4)를 위해 요청 시작 시각 기준 클라이언트 타이머만 사용하고, 서버 응답 자체는 단일 JSON으로 받는다.
- 실행 런타임은 Node.js(Fluid Compute) 기본값을 사용한다. Edge 런타임은 사용하지 않는다.

## 2. API 라우트 설계

Route Handler는 Next.js App Router 방식(`app/api/*/route.ts`)을 쓴다:

- `POST /api/algorithm` — `{ name: string }` → `AlgorithmDetail` **(구현됨)**
- `POST /api/problem` — `{ description: string }` → `ProblemAnalysis` (Sprint 2 예정, 아직 없음)
- `POST /api/algorithm/code` — `{ algorithmId: string, lang: string }` → 언어 1개 코드만 재생성 (5.19 부분 재시도용, Sprint 3 예정, 아직 없음)

각 라우트는:
1. 입력 검증(빈 값, 유효 알고리즘 목록 대조 등)을 **AI 호출 전에** 서버에서도 한 번 더 수행한다(클라이언트 검증 우회 방지). `/api/algorithm`은 이미 이렇게 동작한다 — 빈 값은 400, 카탈로그에 없는 이름은 404 + 유사 후보를 AI 호출 없이 즉시 반환.
2. `generateObject`로 AI 호출, Zod 스키마로 파싱.
3. 실패 시 에러 코드를 포함한 JSON을 반환해 프론트엔드가 5장의 상태 문구와 매핑할 수 있게 한다. 현재 `/api/algorithm`이 실제로 반환하는 코드는 `INVALID_INPUT`(400) / `NOT_FOUND`(404, `suggestions` 동봉) / `UPSTREAM_ERROR`(502, AI 호출 실패·인증 오류 등을 모두 뭉뚱그림)뿐이다. `TIMEOUT`과 `PARSE_ERROR`를 별도 코드로 분리해 5.5(타임아웃)·5.7(부분 파싱 실패)에 맞게 세분화하는 작업은 아직 하지 않았다 — Sprint 3에서 처리.

## 3. 데이터 스키마

### 3.1 알고리즘 카탈로그 (정적, 검증용) — 구현됨

`lib/algorithm-catalog.ts` — 이름/별칭/카테고리만 담은 **경량 목록**(현재 82개 항목)으로, AI가 생성하는 상세 내용과 분리한다. 이 목록이 PRD 3.1/5.3이 말하는 "사전 정의된 유효 알고리즘 집합"이 된다.

```ts
export type CatalogEntry = {
  id: string
  name: string
  aliases: string[]
  category: '정렬' | '탐색' | '그래프' | '트리' | '동적계획법' | '그리디'
    | '분할정복' | '백트래킹' | '문자열' | '수학' | '자료구조' | '배열'
}
```

자동완성/유사도 매칭(5.3, 5.9)은 전부 이 정적 목록에 대해 클라이언트(`searchCatalog`, `findClosestEntries` — 편집 거리 기반)에서 수행하며 AI 호출이 필요 없다. `findExactMatch`가 5.3의 "정확히 일치하는지" 검증을, `isValidAlgorithmId`가 5.9의 유효성 검증을 담당한다.

### 3.2 알고리즘 상세 (AI 생성, Zod 스키마) — 구현됨

실제 정의는 `lib/schemas.ts`에 있다. 계획 단계와 달라진 점: **`id`/`name`은 AI에게 생성시키지 않는다.** 어차피 카탈로그에 이미 있는 정적 값이라, AI가 스키마 필드로 다시 만들게 하면 오타·재구성 위험만 생긴다. 라우트 핸들러가 AI 응답(`AlgorithmDetail`)에 카탈로그 항목(`id`/`name`/`category`)을 병합해 `AlgorithmResultData`를 만들어 응답한다.

```ts
const AlgorithmDetailSchema = z.object({
  description: z.string().min(1),
  difficulty: z.enum(['하', '중', '상']),
  difficultyReason: z.string().min(1),
  useCases: z.array(z.string().min(1)).min(1),
  code: z.object({
    c: z.string().nullable(),
    cpp: z.string().nullable(),
    java: z.string().nullable(),
    python: z.string().nullable(),
  }),
  related: z.array(z.string()).max(6), // catalog id 참조
})

// 응답 시점에 라우트가 병합:
// { id, name, category, ...AlgorithmDetail, related: <자기참조/무효id 필터링됨> }
```

`code`의 각 언어 필드는 `nullable`로 두어, 5.19(언어별 부분 실패)를 "필드가 없으면 그 탭만 실패로 표시"로 자연스럽게 처리한다. `related`는 라우트 핸들러가 응답 직후 카탈로그에 존재하지 않는 id와 자기 자신의 id를 필터링한다(5.9, 5.10) — 클라이언트도 렌더링 시 방어적으로 한 번 더 필터링한다.

### 3.3 문제 분석 (AI 생성, Zod 스키마) — 스키마만 정의됨, `/api/problem` 연동은 Sprint 2

`lib/schemas.ts`에 정의는 이미 있다. 계획과 달라진 점: 문제 설명(`description`)은 AI가 다시 만들지 않고 **사용자가 입력한 원문을 그대로 화면에 쓴다** — 재생성하면 사용자가 입력한 문장과 미묘하게 달라질 위험이 있고, 카드에 표시할 값은 어차피 클라이언트가 이미 들고 있기 때문이다. 같은 이유로 `algorithmName`도 스키마에 없다 — `algorithmId`로 카탈로그를 조회해 이름을 얻는다(`getCatalogEntry`).

```ts
export const ProblemSolutionSchema = z.object({
  algorithmId: z.string(), // catalog id 참조, 버튼 유효성 검증(5.9)에 사용
  label: z.string().min(1),        // 예: "풀이 1: 그리디"
  explanation: z.string().min(1),  // 문제의 어느 부분이 이 알고리즘을 암시하는지
  timeComplexity: z.string().min(1),
  recommended: z.boolean(), // 기본 활성 탭 판단
})

export const ProblemAnalysisSchema = z.object({
  difficulty: z.enum(['하', '중', '상']),
  difficultyReason: z.string().min(1),
  matched: z.boolean(), // false면 5.8(매칭 알고리즘 없음) — 정상 성공으로 취급
  solutions: z.array(ProblemSolutionSchema).max(5),
})
```

## 4. 프론트엔드 상태 관리

- 별도 상태 관리 라이브러리 없이 `page.tsx`의 React state로 충분하다(단일 화면, DB 없음, 새로고침 시 초기화 원칙과 일치).
- **현재 상태(Sprint 1까지)**: `type Status = 'idle' | 'loading' | 'success' | 'error' | 'invalid'` 라는 단순한 5분기 enum이다. `invalid`는 5.3/5.9(카탈로그에 없는 이름)를 표현한다. 아직 5.4(지연)·5.12(오프라인)처럼 시간이 지나면서 바뀌는 상태나, 우선순위 계산이 필요한 상태는 없다 — 그래서 지금은 이 정도로 충분하다.
- **계획(Sprint 3에서 리팩터링)**: 5장의 나머지 항목(지연/오프라인/타임아웃 등)이 들어오면 분기가 늘어나 개별 `setStatus` 호출만으로는 우선순위가 꼬이기 쉽다. 그때 `type StatusState = { kind: 'idle' | 'input-error' | 'offline' | 'loading' | 'slow' | 'success' | 'server-error' | 'timeout' | 'invalid', message: string }` 형태로 확장하고, PRD 5.18의 우선순위 규칙(입력검증 > 오프라인 > 로딩/지연 > 서버오류)을 계산하는 **하나의 순수 함수**로 통합한다. 요청 취소/타임아웃은 `AbortController` + `setTimeout`으로 구현(5.5)하고, 지연 문구 전환(5.4)은 별도의 짧은 타이머(3~5초)로 상태 문구만 갱신하며 요청 자체는 계속 진행한다.
- **언어 탭 선택(구현됨)**: 3.2의 "세션 내 유지" 요구는 `page.tsx` 최상위의 `preferredLang` state(`LanguageKey`, 최초값 `cpp`)로 구현했다. 새 알고리즘 결과를 렌더링할 때마다 이 값을 기본 탭으로 쓴다.

## 5. 검증/보안

- XSS(5.14)는 React의 기본 이스케이프에 의존한다. `dangerouslySetInnerHTML`은 코드베이스 어디에도 사용하지 않는다(코드 블록도 `<pre><code>{text}</code></pre>` 형태의 텍스트 렌더링만 사용). 별도 검증 없이도 이미 만족되지만, Sprint 4에서 악성 입력을 실제로 넣어보고 최종 확인한다.
- 서버 측 빈 값 재검증(5.1)은 `/api/algorithm`에 구현되어 있다(클라이언트를 우회해 API를 직접 호출해도 400을 받는다). **글자 수 제한(5.13)은 클라이언트·서버 어디에도 아직 없다** — Sprint 3에서 함께 구현한다.

## 6. 배포

- Vercel 프로젝트로 배포. AI Gateway 관련 환경변수는 `vercel env`로 관리하고 `.env*`는 `.gitignore`에 포함되어 있으므로 커밋하지 않는다. 로컬 개발자를 위해 어떤 키가 필요한지만 알려주는 `.env.local.example`(값은 비움)은 `.gitignore`에 예외로 추가해 커밋한다.
- 아직 Vercel 프로젝트로 실제 배포는 하지 않았다 — Sprint 5 대상.

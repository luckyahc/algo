# 아키텍처 결정

이 문서는 남은 스프린트에서 따를 기술 결정을 정리한다. PRD는 "무엇을"만 규정하므로, "어떻게"는 여기서 확정한다.

## 1. AI 연동 방식

- **Vercel AI SDK (v6) + AI Gateway**를 사용한다. 프로바이더 SDK(`@ai-sdk/anthropic` 등)를 직접 설치하지 않고, `"provider/model"` 문자열로 Gateway를 통해 호출한다.
- **구조화 출력**은 `generateObject` + Zod 스키마를 사용한다. PRD 5.7("형식에 맞지 않는 응답 파싱 실패")이 요구하는 스키마 검증을 AI SDK가 기본 제공하므로, 이 조합이 예외 처리 요구사항과 가장 직접적으로 맞아떨어진다.
- 별도 프론트엔드 스트리밍은 필수 아님(결과가 카드 단위로 한 번에 렌더링되는 구조이므로). 다만 지연 상태 UX(5.4)를 위해 요청 시작 시각 기준 클라이언트 타이머만 사용하고, 서버 응답 자체는 단일 JSON으로 받는다.
- 실행 런타임은 Node.js(Fluid Compute) 기본값을 사용한다. Edge 런타임은 사용하지 않는다.

## 2. API 라우트 설계

두 개의 Route Handler를 둔다 (Next.js App Router, `app/api/*/route.ts`):

- `POST /api/algorithm` — `{ name: string }` → `AlgorithmDetail`
- `POST /api/problem` — `{ description: string }` → `ProblemAnalysis`
- (Sprint 3에서 추가) `POST /api/algorithm/code` — `{ algorithmId: string, lang: string }` → 언어 1개 코드만 재생성 (5.19 부분 재시도용)

각 라우트는:
1. 입력 검증(빈 값, 유효 알고리즘 목록 대조 등)을 **AI 호출 전에** 서버에서도 한 번 더 수행한다(클라이언트 검증 우회 방지).
2. `generateObject`로 AI 호출, Zod 스키마로 파싱.
3. 실패 시 명확한 에러 코드(`INVALID_INPUT` / `NOT_FOUND` / `TIMEOUT` / `UPSTREAM_ERROR` / `PARSE_ERROR`)를 포함한 JSON을 반환해, 프론트엔드가 5장의 상태 문구와 1:1로 매핑할 수 있게 한다.

## 3. 데이터 스키마

### 3.1 알고리즘 카탈로그 (정적, 검증용)

`lib/algorithm-catalog.ts` — 이름/별칭/카테고리만 담은 **경량 목록**으로, AI가 생성하는 상세 내용과 분리한다. 이 목록이 PRD 3.1/5.3이 말하는 "사전 정의된 유효 알고리즘 집합"이 된다.

```ts
type AlgorithmCatalogEntry = {
  id: string
  name: string
  aliases: string[]
  category: '정렬' | '탐색' | '그래프' | '트리' | '동적계획법' | '그리디'
    | '분할정복' | '백트래킹' | '문자열' | '수학' | '자료구조'
}
```

자동완성/유사도 매칭(5.3, 5.9)은 전부 이 정적 목록에 대해 클라이언트에서 수행하며 AI 호출이 필요 없다.

### 3.2 알고리즘 상세 (AI 생성, Zod 스키마)

```ts
const AlgorithmDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  difficulty: z.enum(['하', '중', '상']),
  difficultyReason: z.string(),
  useCases: z.array(z.string()).min(1),
  code: z.object({
    c: z.string().nullable(),
    cpp: z.string().nullable(),
    java: z.string().nullable(),
    python: z.string().nullable(),
  }),
  related: z.array(z.string()).max(6), // catalog id 참조
})
```

`code`의 각 언어 필드는 `nullable`로 두어, 5.19(언어별 부분 실패)를 "필드가 없으면 그 탭만 실패로 표시"로 자연스럽게 처리한다.

### 3.3 문제 분석 (AI 생성, Zod 스키마)

```ts
const ProblemAnalysisSchema = z.object({
  description: z.string(),
  difficulty: z.enum(['하', '중', '상']),
  difficultyReason: z.string(),
  matched: z.boolean(), // false면 5.8(매칭 알고리즘 없음)
  solutions: z.array(z.object({
    algorithmId: z.string(), // catalog id 참조, 버튼 유효성 검증(5.9)에 사용
    algorithmName: z.string(),
    label: z.string(),        // 예: "풀이 1: 그리디"
    explanation: z.string(),  // 문제의 어느 부분이 이 알고리즘을 암시하는지
    timeComplexity: z.string(),
    recommended: z.boolean(), // 기본 활성 탭 판단
  })).max(5),
})
```

## 4. 프론트엔드 상태 관리

- 별도 상태 관리 라이브러리 없이 `page.tsx`의 React state로 충분하다(단일 화면, DB 없음, 새로고침 시 초기화 원칙과 일치).
- **상태 표시줄은 단일 상태 머신**으로 통합한다: `type StatusState = { kind: 'idle' | 'input-error' | 'offline' | 'loading' | 'slow' | 'success' | 'server-error' | 'timeout', message: string }`. PRD 5.18의 우선순위 규칙(입력검증 > 오프라인 > 로딩/지연 > 서버오류)은 이 상태를 계산하는 **하나의 순수 함수**로 구현해, 여러 곳에서 개별적으로 상태를 set하다가 우선순위가 꼬이는 것을 방지한다.
- 요청 취소/타임아웃은 `AbortController` + `setTimeout`으로 구현(5.5). 지연 문구 전환(5.4)은 별도의 짧은 타이머(3~5초)로 상태 문구만 갱신하고 요청은 계속 진행한다.
- 언어 탭 선택(3.2, "세션 내 유지")은 `page.tsx` 최상위에 `preferredLang` state로 보관하고, 새 알고리즘 결과를 렌더링할 때마다 그 값을 기본 탭으로 사용한다(최초값은 `cpp`).

## 5. 검증/보안

- XSS(5.14)는 React의 기본 이스케이프에 의존한다. `dangerouslySetInnerHTML`은 코드베이스 어디에도 사용하지 않는다(코드 블록도 `<pre><code>{text}</code></pre>` 형태의 텍스트 렌더링만 사용).
- 서버 측에서도 입력 길이(5.13)와 빈 값(5.1)을 재검증한다.

## 6. 배포

- Vercel 프로젝트로 배포. AI Gateway 관련 환경변수는 `vercel env`로 관리하고 `.env*`는 `.gitignore`에 이미 포함되어 있으므로 커밋하지 않는다.

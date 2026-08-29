# 아키텍처 결정

이 문서는 스프린트 전반에서 따를 기술 결정을 정리한다. PRD는 "무엇을"만 규정하므로, "어떻게"는 여기서 확정한다. `(구현됨)` 표시가 없는 항목은 아직 계획 단계다.

> 2026-08-28 갱신: Sprint 0~3에서 이 문서가 계획했던 것이 사실상 전부 구현되었다 — §1(AI 연동), §2(세 라우트 모두), §3(두 스키마 모두 + partial 복구), §4(상태 머신)까지. 실제 코드와 다르게 남아 있던 부분을 이 문서에서 바로잡았다. 아직 안 한 것은 §5의 XSS 육안 검증(Sprint 4)과 §6의 실제 배포(Sprint 5)뿐이다.

## 1. AI 연동 방식 (구현됨)

> **2026-08-28 변경**: 처음엔 Vercel AI Gateway(`AI_GATEWAY_API_KEY` + `anthropic/claude-sonnet-5`)로 설계했으나, 그 키가 실제로는 Gateway 인증에 계속 실패했다. 대신 사용자가 보유한 **Google Gemini API 키**로 전환했다 — `@ai-sdk/google`을 설치해 Gateway를 거치지 않고 Google Generative AI를 직접 호출한다. 이 절의 나머지 설명(구조화 출력, 스트리밍 미사용, 런타임)은 프로바이더가 바뀌어도 그대로 유효하다.

- **Vercel AI SDK(`ai` 패키지, `ai@7`) + `@ai-sdk/google`**을 사용한다. `lib/ai.ts`의 `MODEL = google('gemini-3.6-flash')`를 `/api/algorithm`·`/api/problem`·`/api/algorithm/code` 세 라우트가 공유한다. 인증은 `GOOGLE_GENERATIVE_AI_API_KEY` 환경변수(`@ai-sdk/google`이 자동으로 읽음)로 한다 — Vercel AI Gateway는 더 이상 쓰지 않는다.
- **모델 선정 근거**: `GET generativelanguage.googleapis.com/v1beta/models`를 그 키로 직접 호출해 실제 계정에서 쓸 수 있는 모델 목록을 확인했다. 가장 최신인 `gemini-3.7-flash`는 이 시점 기준 계속 503(수요 과다)을 반환했고, 기존에 쓰려던 `gemini-2.5-flash`는 신규 사용자 대상으로 제공이 끊겨 있었다(API 응답이 직접 `gemini-3.6-flash`로 갈아타라고 안내). 실제로 `gemini-3.6-flash`가 안정적으로 응답해 이걸 선택했다. **모델이 다시 불안정해지면 `lib/ai.ts`의 `MODEL` 한 줄만 바꾸면 된다.**
- **구조화 출력**은 `generateObject` + Zod 스키마를 사용한다. PRD 5.7("형식에 맞지 않는 응답 파싱 실패")이 요구하는 스키마 검증을 AI SDK가 기본 제공하므로, 이 조합이 예외 처리 요구사항과 가장 직접적으로 맞아떨어진다.
- 별도 프론트엔드 스트리밍은 필수 아님(결과가 카드 단위로 한 번에 렌더링되는 구조이므로). 다만 지연 상태 UX(5.4)를 위해 요청 시작 시각 기준 클라이언트 타이머만 사용하고, 서버 응답 자체는 단일 JSON으로 받는다.
- 실행 런타임은 Node.js(Fluid Compute) 기본값을 사용한다. Edge 런타임은 사용하지 않는다.

## 2. API 라우트 설계

Route Handler는 Next.js App Router 방식(`app/api/*/route.ts`)을 쓴다:

- `POST /api/algorithm` — `{ name: string }` → `AlgorithmDetail`(기본 언어 C++ 코드 하나만 포함) **(구현됨)**
- `POST /api/problem` — `{ description: string }` → `ProblemAnalysis`(추천 풀이 하나에만 C++ 코드 포함) **(구현됨)**
- `POST /api/algorithm/code` — `{ algorithmId: string, lang: string }` → 언어 1개 코드만 (재)생성, 최초 검색 시 기본 언어 외 언어를 탭으로 열 때도 이 라우트를 쓴다 (5.19) **(구현됨, Sprint 3·9)**
- `POST /api/problem/code` — `{ problem: string, algorithmId: string, label: string, explanation: string }` → 특정 풀이 하나의 C++ 코드만 (재)생성. 문제/풀이가 서버에 저장되지 않으므로 클라이언트가 맥락을 매번 그대로 다시 보낸다 **(구현됨, Sprint 10)**

`lib/ai.ts`에 네 라우트가 공유하는 `MODEL`(`google('gemini-3.6-flash')`, `@ai-sdk/google` 직접 호출), `CATALOG_ID_LIST`(프롬프트에 넣는 카탈로그 id 목록 문자열), `generatePartialSafe`(아래 §3.2 참고)를 모아 중복을 없앴다.

각 라우트는:
1. 입력 검증(빈 값, 유효 알고리즘 목록 대조, 무의미한 텍스트, 글자 수 등)을 **AI 호출 전에** 서버에서도 한 번 더 수행한다(클라이언트 검증 우회 방지). `/api/algorithm`은 빈 값은 400, 카탈로그에 없는 이름은 404 + 유사 후보를 반환하고, `/api/problem`은 빈 값·3000자 초과(`TOO_LONG`)·무의미한 텍스트(`lib/validation.ts`의 `hasMeaningfulContent`)를 모두 400으로 반환한다 — 전부 AI 호출 없이 즉시 응답한다.
2. `generatePartialSafe`(내부적으로 `generateObject`를 감쌈)로 AI 호출, Zod 스키마로 파싱.
3. 실패 시 에러 코드를 포함한 JSON을 반환해 프론트엔드가 5장의 상태 문구와 매핑할 수 있게 한다. 네 라우트가 실제로 반환하는 코드: `INVALID_INPUT`(400, 공통) / `NOT_FOUND`(404, `/api/algorithm`·`/api/algorithm/code`, `suggestions` 동봉은 전자만) / `MEANINGLESS_INPUT`(400, `/api/problem`만) / `TOO_LONG`(400, `/api/problem`·`/api/problem/code`) / `RATE_LIMITED`(429, Google API 429 감지 시 네 라우트 공통) / `UPSTREAM_ERROR`(502, AI 호출이 완전히 실패했을 때 — 인증 오류든 부분 파싱조차 실패했든 전부 여기로 뭉뚱그린다). 별도의 `TIMEOUT` 코드는 서버에 없다 — 타임아웃은 클라이언트가 `AbortController`로 직접 만들어내는 상태이지 서버 응답 코드가 아니기 때문이다(§4 참고).

## 3. 데이터 스키마

### 3.1 알고리즘 카탈로그 (정적, 검증용) — 구현됨

`lib/algorithm-catalog.ts` — 이름/별칭/카테고리만 담은 **경량 목록**(현재 273개 항목)으로, AI가 생성하는 상세 내용과 분리한다. 이 목록이 PRD 3.1/5.3이 말하는 "사전 정의된 유효 알고리즘 집합"이 된다.

> **2026-08-28 확장(2차례)**: 기초 82개에 ① QOJ(Universal Online Judge, ICPC World Finals/IOI/CCPC/Petrozavodsk 캠프 수준) 문제 에디토리얼에서 실제 도구로 쓰이는 고급 알고리즘/기법 143개, ② 사용자가 제시한 USACO Guide류 종합 커리큘럼 목록에서 병합한 48개를 순서대로 추가했다(카테고리도 기하/다항식/게임이론/기초 4개 신설). 항목이 늘면서 `CATALOG_ID_LIST`(`lib/ai.ts`, 프롬프트에 넣는 id 목록)도 함께 커졌다는 점에 주의 — 알고리즘 상세/문제 분석 요청 프롬프트 토큰 수가 그만큼 늘어나고, 실측 응답 시간도 최대 2분 가까이 걸리는 사례가 관찰됐다(`03-sprint-plan.md` Sprint 7 참고).

```ts
export type CatalogEntry = {
  id: string
  name: string
  aliases: string[]
  category: '기초' | '정렬' | '탐색' | '그래프' | '트리' | '동적계획법' | '그리디'
    | '분할정복' | '백트래킹' | '문자열' | '수학' | '자료구조' | '배열'
    | '기하' | '다항식' | '게임이론'
}
```

자동완성/유사도 매칭(5.3, 5.9)은 전부 이 정적 목록에 대해 클라이언트(`searchCatalog`, `findClosestEntries` — 편집 거리 기반)에서 수행하며 AI 호출이 필요 없다. `findExactMatch`가 5.3의 "정확히 일치하는지" 검증을, `isValidAlgorithmId`가 5.9의 유효성 검증을 담당한다.

### 3.2 알고리즘 상세 (AI 생성, Zod 스키마) — 구현됨

실제 정의는 `lib/schemas.ts`에 있다. 계획 단계와 달라진 점: **`id`/`name`은 AI에게 생성시키지 않는다.** 어차피 카탈로그에 이미 있는 정적 값이라, AI가 스키마 필드로 다시 만들게 하면 오타·재구성 위험만 생긴다. 라우트 핸들러가 AI 응답(`AlgorithmDetail`)에 카탈로그 항목(`id`/`name`/`category`)을 병합해 `AlgorithmResultData`를 만들어 응답한다.

> **2026-08-28 변경**: `code`는 원래 4개 언어를 전부 한 번에 요청했으나, 카탈로그가 273개로 커지면서 실측 응답이 정상적으로도 10초~2분씩 걸리는 문제가 있었다. 4개 언어 코드를 한 번에 생성하는 게 출력 토큰을 가장 많이 잡아먹는 부분이라, **최초 요청은 기본 언어(C++, `DEFAULT_LANGUAGE`) 코드 하나만** 받고 나머지 언어는 그 탭을 열 때 `/api/algorithm/code`로 그때그때 요청하도록 바꿨다. 아래 스키마의 `code`가 그래서 객체가 아니라 문자열 하나다.

```ts
const AlgorithmDetailSchema = z.object({
  description: z.string().min(1),
  difficulty: DifficultySchema, // 1~10 정수, 아래 참고
  difficultyReason: z.string().min(1),
  useCases: z.array(z.string().min(1)).min(1),
  code: z.string().min(1), // 기본 언어(C++) 코드 하나만
  related: z.array(z.string()).max(6), // catalog id 참조
})

// 응답 시점에 라우트가 병합:
// { id, name, category, ...AlgorithmDetail,
//   code: { c: null, cpp: <생성됨>, java: null, python: null },
//   related: <자기참조/무효id 필터링됨> }
```

와이어 타입(`AlgorithmResultData.code`)은 여전히 4개 언어를 다 담는 `AlgorithmCodeSchema` 객체 그대로다 — 화면(`LanguageTabs`)이 4개 언어 슬롯을 이미 그렇게 다루도록 만들어져 있어서, "아직 안 불러온 언어"를 그냥 `null`로 두면 되기 때문이다. 즉 AI에게 무엇을 요청하는지(스키마)만 바뀌었고, 화면에 내려주는 데이터 모양은 그대로다.

`code`의 각 언어 필드는 `nullable`로 두어, 5.19(언어별 부분 실패)를 "필드가 없으면 그 탭만 실패로 표시"로 자연스럽게 처리한다. `related`는 라우트 핸들러가 응답 직후 카탈로그에 존재하지 않는 id와 자기 자신의 id를 필터링한다(5.9, 5.10) — 클라이언트도 렌더링 시 방어적으로 한 번 더 필터링한다.

**5.7(부분 파싱 실패) — `generatePartialSafe`(`lib/ai.ts`, Sprint 3에서 추가)**: `generateObject`가 스키마 검증에 완전히 실패해도(AI SDK의 `NoObjectGeneratedError`) 바로 502로 포기하지 않는다. 에러가 들고 있는 원문(`err.text`)을 다시 JSON으로 파싱한 뒤, **필드 하나하나를 그 필드의 Zod 스키마로 개별 검증**해 통과하는 필드만 건진다(전체를 한 번에 `.partial().safeParse()`하면 필드 하나가 깨졌을 때 전부 실패로 취급되어 버리므로 반드시 필드 단위로 나눠 검사한다). 이 때문에 실제 wire 타입(`AlgorithmResultData`)은 `AlgorithmDetail`을 그대로 쓰지 않고 `description`/`difficulty`/`difficultyReason`/`useCases`를 전부 `| null`로 다시 정의했다 — 살아남지 못한 필드는 `null`로 내려가고, 컴포넌트가 `MISSING_FIELD_PLACEHOLDER`("이 항목은 준비되지 않았습니다.")로 대체 렌더링한다.

### 3.3 문제 분석 (AI 생성, Zod 스키마) — 구현됨

`lib/schemas.ts`에 정의는 이미 있다. 계획과 달라진 점: 문제 설명(`description`)은 AI가 다시 만들지 않고 **사용자가 입력한 원문을 그대로 화면에 쓴다** — 재생성하면 사용자가 입력한 문장과 미묘하게 달라질 위험이 있고, 카드에 표시할 값은 어차피 클라이언트가 이미 들고 있기 때문이다. 같은 이유로 `algorithmName`도 스키마에 없다 — `algorithmId`로 카탈로그를 조회해 이름을 얻는다(`getCatalogEntry`).

```ts
export const ProblemSolutionSchema = z.object({
  algorithmId: z.string(), // catalog id 참조, 버튼 유효성 검증(5.9)에 사용
  label: z.string().min(1),        // 예: "풀이 1: 그리디"
  explanation: z.string().min(1),  // 문제의 어느 부분이 이 알고리즘을 암시하는지
  timeComplexity: z.string().min(1),
  recommended: z.boolean(), // 기본 활성 탭 판단
  code: z.string().nullable(), // 추천 풀이 하나에만 채워짐(아래 참고)
})

export const ProblemAnalysisSchema = z.object({
  difficulty: DifficultySchema, // 1~10 정수, 아래 참고
  difficultyReason: z.string().min(1),
  matched: z.boolean(), // false면 5.8(매칭 알고리즘 없음) — 정상 성공으로 취급
  solutions: z.array(ProblemSolutionSchema).max(5),
})
```

여기도 `generatePartialSafe`를 거친다(위 §3.2 참고). `ProblemResultData`의 `difficulty`/`difficultyReason`은 `| null`로 정의해 실패 시 placeholder를 보여준다. 다만 `solutions`는 **부분 항목을 만들지 않는다** — 배열 필드 자체가 필드 단위 검증 대상이라, 배열 안의 풀이 하나라도 스키마를 어기면 `solutions` 필드 전체가 통째로 탈락한다(빈 배열 취급). 풀이 하나만 절반만 채워진 상태로 보여주는 것보다, 아예 안 보여주고 5.8("매칭 알고리즘 없음")과 같은 안내로 대체하는 편이 사용자에게 덜 혼란스럽다고 판단했다.

**Sprint 11: 난이도를 하/중/상 3단계에서 1~10 10단계로 바꿨다.** 사용자 요청 — "10단계로 나눠줘. 10단계의 기준은 현재까지 나온 알고리즘 중 최악의 난이도를 기준으로 해줘." `lib/schemas.ts`의 `DifficultySchema = z.number().int().min(1).max(10)`으로 교체(`AlgorithmDetailSchema`·`ProblemAnalysisSchema` 둘 다 공유). 채점 기준은 `lib/ai.ts`의 `DIFFICULTY_SCALE_PROMPT` 하나로 두 라우트가 공유해 기준이 어긋나지 않게 했다 — **10점은 카탈로그에서 가장 어려운 축의 실제 항목(블라섬 알고리즘/매트로이드 교차/링크-컷 트리/Gomory-Hu 트리/일반화 접미사 자동자)에 명시적으로 앵커링**하고, 1~2점은 반복문 수준(선형 탐색 등)에 앵커링했다. `clampDifficulty`(`lib/schemas.ts`)로 서버 응답 시점에 한 번, `DifficultyBadge`(`components/difficulty-badge.tsx`)에서 렌더링 직전에 한 번 더 1~10으로 방어적 클램프한다. 배지 색상은 기존 `--easy/--medium/--hard`(3단계, 다른 배지에서 재사용 중이라 건드리지 않음) 대신 `app/globals.css`에 새로 추가한 `--diff-1-bg/-fg` ~ `--diff-10-bg/-fg`(초록 155도 → 빨강 20도 10단 그라데이션, 라이트/다크 모드 각각) CSS 변수를 인라인 스타일로 직접 참조한다. 실제 검증(로컬, 실제 Gemini 응답): 선형 탐색 → 1, 다익스트라 → 5, 블라섬 알고리즘 → 10 — 앵커가 의도대로 작동함을 확인.

**Sprint 10: 문제 검색 결과에도 예시 코드를 추가했다.** 사용자가 "문제를 넣거나 리스트에 없는 알고리즘을 넣어도 코드 블록을 생성해줬으면 좋겠다"고 요청 — `/api/algorithm`이 기본 언어 코드 하나만 upfront로 생성하는 것과 동일한 패턴으로, `/api/problem`의 프롬프트가 **recommended 풀이 하나에만** C++ 코드를 채우도록 지시하고 나머지 풀이는 `code: null`로 둔다(5개 풀이 전부에 코드를 매번 생성하면 Sprint 9에서 고친 것과 같은 지연 문제가 재발할 수 있어서). 사용자가 비추천 풀이 탭을 열면(또는 재시도하면) `POST /api/problem/code`가 그 풀이의 문제/설명 맥락을 그대로 받아 코드 하나만 다시 생성한다 — 문제/풀이는 서버에 저장되지 않는 stateless 구조라 클라이언트가 필요한 정보(`problem`, `algorithmId`, `label`, `explanation`)를 매번 다시 보낸다. `algorithmId`가 카탈로그에 없는 경우도 있을 수 있어(자유 텍스트 설명이 카탈로그 밖 개념을 가리킬 때) 라우트는 `getCatalogEntry`로 카탈로그 이름을 찾되 실패하면 `label`을 그대로 프롬프트에 쓴다.

## 4. 프론트엔드 상태 관리 (구현됨, Sprint 3에서 계획대로 리팩터링 완료)

- 별도 상태 관리 라이브러리 없이 `page.tsx`의 React state로 충분하다(단일 화면, DB 없음, 새로고침 시 초기화 원칙과 일치).
- **원시 상태 4가지**를 따로 두고, 화면에 보여줄 상태는 매번 그 조합으로 계산한다.
  - `inputError: { title, description } | null` — 클라이언트 검증 실패(5.1 빈 입력, 5.3 카탈로그 불일치, 5.13 글자 수 초과, 서버가 되돌려준 5.2/5.9 사례 포함). 사용자가 입력을 다시 고치면(`onChange`) 즉시 지운다.
  - `isOffline: boolean` — `window`의 `online`/`offline` 이벤트로 갱신(5.12).
  - `requestPhase: 'idle' | 'loading' | 'timeout' | 'server-error' | 'success'` — 진행 중인 요청의 실제 단계.
  - `isSlow: boolean` — `requestPhase === 'loading'`인 동안 `SLOW_AFTER_MS`(4초, `lib/request-timing.ts`)가 지나면 켜진다(5.4). 요청 자체는 계속 진행된다.
- **`getDisplay()`**: 이 네 값을 받아 PRD 5.18의 우선순위(1. 입력 검증 오류 > 2. 오프라인 > 3. 로딩/지연 > 4. 타임아웃/서버 오류 > 성공/대기)대로 **항상 하나의 표시 상태만** 반환하는 순수 함수. 여러 조건이 동시에 참이어도(예: 오프라인 상태에서 빈 입력 제출) 이 함수 하나가 어떤 문구를 보여줄지 결정하므로, 여러 곳에서 개별적으로 상태를 set하다가 우선순위가 꼬이는 문제가 생기지 않는다.
- **타임아웃/재시도(5.5, 5.6)**: 요청마다 새 `AbortController`를 만들고, `REQUEST_TIMEOUT_MS`(18초)가 지나면 abort한다. `catch` 블록에서 "우리가 스스로 abort한 것인지" 여부(`didTimeout` 클로저 변수)로 `timeout`과 `server-error`를 구분한다. 재시도 버튼은 `lastAction` ref에 저장해 둔 마지막 요청 함수를 그대로 다시 호출한다 — 횟수 제한 없음.
- **로딩 중 잠금(5.11)**: `isBusy = requestPhase === 'loading'`. 검색창·버튼뿐 아니라 **탭 전환(`switchTab`)도** 이 값이 true면 막는다 — `requestPhase`가 두 탭이 공유하는 단일 상태라, 로딩 중 탭을 바꾸면 요청이 끝났을 때 엉뚱한 탭에 결과가 표시될 수 있어서다.
- **언어 탭 선택(3.2, "세션 내 유지")**: `page.tsx` 최상위의 `preferredLang` state(`LanguageKey`, 최초값 `cpp`)로 구현했다. 새 알고리즘 결과를 렌더링할 때마다 이 값을 기본 탭으로 쓴다.
- **클립보드 피드백(5.15, 5.16, Sprint 4에서 추가)**: `lib/use-copy.ts`의 `useCopyToClipboard()` 훅이 `idle`/`copied`/`failed` 세 상태를 관리한다. `CopyButton`(카드 우측 상단 아이콘)과 `CodeBlock`(코드 블록 자체 헤더의 복사 버튼)이 각자 따로 구현하던 동일한 로직을 이 훅 하나로 합쳤다. 실패 시에는 버튼 근처에 짧은 토스트(`"복사에 실패했어요..."`)를 띄운다 — 이 토스트는 `absolute` 포지셔닝을 쓰므로, 조상 요소에 `overflow-hidden`이 있으면 잘려 보이지 않는다는 점에 주의해야 한다(실제로 `AlgorithmResult`의 코드 카드에서 이 문제가 있어 불필요한 `overflow-hidden`을 제거했다).

## 5. 검증/보안

- XSS(5.14)는 React의 기본 이스케이프에 의존한다. `dangerouslySetInnerHTML`은 코드베이스 어디에도 사용하지 않는다(코드 블록도 `<pre><code>{text}</code></pre>` 형태의 텍스트 렌더링만 사용). 별도 검증 없이도 이미 만족되지만, Sprint 4에서 악성 입력을 실제로 넣어보고 최종 확인한다.
- 서버 측 재검증은 `/api/algorithm`(빈 값→400, 카탈로그 불일치→404)과 `/api/problem`(빈 값→400, 3000자 초과→400 `TOO_LONG`, 무의미한 텍스트→400) 둘 다 구현되어 있다(클라이언트를 우회해 API를 직접 호출해도 동일하게 막힌다). 클라이언트 쪽 글자 수 카운터·버튼 비활성화(5.13)도 `lib/request-timing.ts`의 `MAX_PROBLEM_LENGTH`(3000, 2026-08-29 1000→3000 상향)를 공유해서 구현했다.

## 6. 배포

- Vercel 프로젝트로 배포. `GOOGLE_GENERATIVE_AI_API_KEY`는 `vercel env`로 관리하고 `.env*`는 `.gitignore`에 포함되어 있으므로 커밋하지 않는다. 로컬 개발자를 위해 어떤 키가 필요한지만 알려주는 `.env.local.example`(값은 비움)은 `.gitignore`에 예외로 추가해 커밋한다.
- 아직 Vercel 프로젝트로 실제 배포는 하지 않았다 — Sprint 5 대상.

# 스프린트 계획

전제: 1 스프린트 ≈ 1주, 시작일 2026-08-31(월) 가정. 실제 진행 속도에 따라 기간은 조정 가능하나 **순서(의존성)는 유지**해야 한다 — 예를 들어 Sprint 2(문제 검색)는 Sprint 1의 알고리즘 상세 화면이 있어야 "사용해야 되는 알고리즘" 버튼의 목적지가 존재한다.

각 스프린트는 완료 시 `01-current-state.md`를 갱신하고, 예외 처리 관련 작업은 `04-exception-checklist.md`에 체크한다.

---

## Sprint 0 — 기반 정비: AI 연동 배관 + 데이터 스키마 ✅ 완료 (2026-08-28)

**목표**: 화면을 건드리기 전에, AI 호출이 가능한 백엔드 골격과 확장된 데이터 구조를 먼저 세운다.

**작업**
- [x] AI SDK(`ai@7`) 설치, Vercel AI Gateway 연동(`model: 'anthropic/claude-sonnet-5'` 문자열로 기본 provider 사용), `.env.local.example`에 `AI_GATEWAY_API_KEY` 문서화 (`02-architecture.md` §1 참고)
- [x] `lib/algorithm-catalog.ts` 작성: 정렬/탐색/그래프/트리/DP/그리디/분할정복/백트래킹·완전탐색/문자열/수학·정수론/자료구조/배열 전 분야, 82개 항목의 알고리즘 이름·별칭·카테고리 목록 (PRD 3.1)
- [x] `AlgorithmDetailSchema`, `ProblemAnalysisSchema` (Zod, `lib/schemas.ts`) 작성 — `ProblemAnalysisSchema`는 정의만 해두고 실제 연동은 Sprint 2에서 (`02-architecture.md` §3)
- [x] `app/api/algorithm/route.ts` 작성 (`generateObject` 연동). `app/api/problem/route.ts`는 Sprint 2로 미룸(아직 문제 검색이 mock이라 불필요)
- [x] `lib/algorithms.ts`의 하드코딩 상세 데이터 제거, 문제 검색용 mock 타입/데이터만 남김

**완료 기준**: ✅ `POST /api/algorithm`을 빈 값/무효 이름/유효 이름으로 각각 호출했을 때 400/404/(AI 키가 있다면 200, 없으면 502)가 스키마에 맞게 반환됨을 확인 (node fetch로 검증). 화면 연동은 Sprint 1에서 진행.

---

## Sprint 1 — 기능 A: 알고리즘 검색 실동작 ✅ 코드 완료 · ⚠️ AI 응답 미검증 (2026-08-28)

**목표**: PRD 4장 "기능 A" 전체와 Done Criteria #1, #3.

**작업**
- [x] `page.tsx`의 mock `setTimeout` 로직을 `/api/algorithm` 실제 호출로 교체
- [x] `AlgorithmCombobox`가 `algorithm-catalog.ts` 전체(82개)를 대상으로 부분 문자열 매칭 자동완성 제공, 페이지가 값을 제어(controlled)하도록 리팩터링 (PRD 3.1)
- [x] `CodeBlock`/`LanguageTabs`를 언어 탭(C/C++/Java/Python) 구조로 확장, 최초 진입 시 C++ 기본, 이후 세션 내(`page.tsx`의 `preferredLang` state) 선택 유지 (PRD 3.2)
- [x] 관련 알고리즘 버튼: 서버(`route.ts`)에서 자기 자신·무효 id 필터링(5.10) + 클라이언트에서 방어적으로 한 번 더 필터링, 그래도 무효하면 5.3과 동일한 `invalid` 상태로 전환 + 검색창 자동 채움 (5.9)
- [x] 검색 실행 시점에 입력값이 카탈로그와 정확히 일치하는지 클라이언트(`findExactMatch`)와 서버 양쪽에서 검증, 불일치 시 AI 호출 차단 + 전용 안내 상태 표시(이 컴포넌트는 Sprint 2에서 `InvalidInputState`로 일반화됨), 유사 후보는 자동완성 드롭다운에 그대로 노출 (5.3)
- [x] 카드 우측 상단 복사 버튼이 "현재 활성 언어 탭의 코드만" 복사하도록 `activeLang` 기준으로 연결

**완료 기준 검증 상태**: 서버 로직은 node fetch로 3가지 케이스(빈 입력→400, 목록에 없는 이름→404+추천, 유효한 이름→AI 호출 시도) 모두 의도대로 동작함을 확인. `pnpm build`/`tsc --noEmit` 통과. **다만 로컬에 `AI_GATEWAY_API_KEY`가 설정되어 있지 않아, 실제 AI가 생성한 알고리즘 상세 내용이 화면에 정상적으로 렌더링되는지(성공 경로)는 아직 눈으로 검증하지 못했다.** 키가 있다면 유효한 이름 호출이 200과 `AlgorithmDetailSchema`를 반환하는지, 화면의 4개 언어 탭/관련 알고리즘 버튼이 실제로 채워지는지 재확인이 필요하다.

---

## Sprint 2 — 기능 B: 문제 검색 실동작 (다중 풀이 탭) ✅ 코드 완료 · ⚠️ AI 응답 미검증 (2026-08-28)

**목표**: PRD 4장 "기능 B" 전체와 Done Criteria #2.

**작업**
- [x] `app/api/problem/route.ts` 신설(`generateObject` + `ProblemAnalysisSchema`), `page.tsx`에서 mock 대신 실제 호출로 교체
- [x] `ProblemResult` 컴포넌트를 풀이별 탭 구조로 재작성: 각 탭에 해설 + 시간복잡도 표시, `recommended: true`인 풀이가 기본 활성 탭(새 검색 결과가 오면 `useEffect`로 재계산)
- [x] 활성 탭이 바뀌면 하단 "이 풀이의 핵심 알고리즘" 버튼의 타겟(`targetAlgo`)도 `activeSol`을 따라 함께 갱신
- [x] 버튼 클릭 시 [알고리즘 검색] 탭으로 전환 + 기능 A 실행 (Sprint 1의 `goToAlgorithm` 재사용)
- [x] 매칭 알고리즘 없음(`matched: false` 또는 필터링 후 풀이 0개, 5.8)을 오류가 아닌 정상 성공 상태로 렌더링, 이 경우 버튼 미노출
- [x] 문제 검색 카드의 복사 버튼이 활성 풀이 탭(라벨+해설+시간복잡도)만 복사하도록 연결
- [x] 문제 텍스트 최소 유효성 검증(5.2): `lib/validation.ts`의 `hasMeaningfulContent`(완성형 한글/영문/숫자 1자 이상)를 클라이언트(`searchProblem`)와 서버(`/api/problem`) 양쪽에서 적용, 실패 시 `invalid` 상태로 전용 안내 문구 표시

**완료 기준 검증 상태**: `/api/problem`을 node fetch로 4가지 케이스(빈 입력→400, 마침표만→400, 자음만→400, 유효한 문제→AI 호출 시도) 모두 확인. `tsc --noEmit`/`pnpm build` 통과, `/api/problem`이 dynamic 라우트로 정상 등록됨. **Sprint 1과 동일하게 `AI_GATEWAY_API_KEY`가 없어 AI 성공 응답(200, 실제 풀이 탭 렌더링)은 아직 육안 검증 전이다.**

---

## Sprint 3 — 예외 처리 전면 구현 (PRD 5장) ✅ 코드 완료 · ⚠️ 일부 육안 미검증 (2026-08-28)

**목표**: `04-exception-checklist.md`의 남은 모든 항목. Done Criteria #4, #6.

**작업**
- [x] 상태 표시줄을 `02-architecture.md` §4의 단일 상태 머신으로 리팩터링: `inputError` / `isOffline` / `requestPhase` / `isSlow` 네 가지 원시 상태를 `getDisplay()` 순수 함수 하나가 우선순위(입력오류 > 오프라인 > 로딩/지연 > 타임아웃/서버오류 > 성공)대로 조합해 항상 하나의 표시 상태만 반환 (5.18)
- [x] 5.1 빈 입력: 상태 표시줄에 전용 문구 + 콤보박스/텍스트박스 테두리 강조 + 자동 포커스(`highlightError` prop, `problemTextareaRef`)
- [x] 5.13 글자 수 제한: 문제 텍스트박스 하단 `OOO/1000자` 카운터, 초과 시 경고색 + 검색 버튼 비활성화, `/api/problem`도 1000자 초과를 서버에서 별도로 재검증(`TOO_LONG`)
- [x] 5.4/5.5 지연(4초)·타임아웃(18초) 타이머 + `AbortController` 구현(`lib/request-timing.ts`), 지연 시 상태 문구만 갱신하고 요청은 계속 진행, 타임아웃 시 abort 후 전용 재시도 화면 표시
- [x] 5.6 네트워크/서버 오류 처리 + 무제한 재시도: `ErrorState`의 재시도 버튼이 `lastAction` ref를 다시 호출, 횟수 제한 없음
- [x] 5.7 부분 파싱 실패 시 있는 필드만 표시: `lib/ai.ts`의 `generatePartialSafe`가 `NoObjectGeneratedError.text`를 다시 JSON 파싱해 **필드 단위로 개별 검증**, 통과한 필드만 살리고 나머지는 `null`로 응답 → 컴포넌트가 `MISSING_FIELD_PLACEHOLDER`("이 항목은 준비되지 않았습니다.")로 대체 렌더링. `AlgorithmResultData`/`ProblemResultData`의 관련 필드를 전부 nullable로 재정의
- [x] 5.11 로딩 중 모든 검색/버튼 클릭 차단: 콤보박스·텍스트박스·검색 버튼에 더해, 로딩 중 **탭 전환도 차단**하도록 새로 추가(전환을 허용하면 요청이 끝났을 때 엉뚱한 탭에 결과가 표시되는 버그가 있어 막음)
- [x] 5.12 온라인/오프라인 이벤트 감지 + 문구 전환: `window`의 `online`/`offline` 리스너로 `isOffline` 갱신, `OfflineState` 컴포넌트 추가, 재연결 시 자동 재요청 없이 안내만 사라짐
- [x] 5.19 언어별 코드 개별 실패 표시 + 탭 내 재시도 아이콘: `app/api/algorithm/code/route.ts` 신설, `LanguageTabs`에 재시도 버튼(스피너 포함) 추가, 성공 시 `algoResult.code`의 해당 언어만 갱신

**완료 기준 검증 상태**: `tsc --noEmit`/`pnpm build` 통과. node fetch로 `/api/algorithm/code`(값 누락→400, 무효 id→404, 유효 요청→AI 호출 시도), `/api/problem`의 1000자 초과(→400 `TOO_LONG`) 모두 확인. **AI_GATEWAY_API_KEY가 없어 5.4(지연 문구 전환)·5.5(실제 18초 타임아웃)·5.7(진짜 부분 파싱 상황)·5.19(재시도 성공)는 실제 AI 트래픽으로는 아직 재현/육안 검증하지 못했다** — 로직과 배선만 확인됨. 5.12(오프라인)는 브라우저 devtools로 별도 재현 필요.

---

## Sprint 4 — 클립보드/접근성/모바일 마감 ✅ 코드 완료 · ⚠️ 실기기/육안 미검증 (2026-08-28)

**목표**: Done Criteria #5, #8, PRD 3.4/5.14/5.15/5.16/5.17.

**작업**
- [x] 5.15/5.16 클립보드 성공/실패 피드백: `lib/use-copy.ts`(`useCopyToClipboard`) 훅으로 `CopyButton`·`CodeBlock`의 중복 로직을 통합. 성공 시 기존처럼 체크 아이콘(1.6초), **실패 시 "복사에 실패했어요. 직접 선택해 복사해주세요." 토스트를 새로 추가**(이전에는 조용히 무시했음)
  - 부수 발견: `AlgorithmResult`의 "예시 코드" 카드에 있던 `overflow-hidden`이 이 토스트를 잘라내는 버그를 발견해 제거(`CodeBlock`이 이미 자체적으로 모서리를 잘라내므로 카드 쪽엔 불필요했음)
- [x] 5.14 XSS: `dangerouslySetInnerHTML` 전체 검색 결과 0건 확인. `<script>alert(1)</script>` 등을 실제로 `/api/problem`에 넣어 서버가 그대로 텍스트로 다루는지 node fetch로 확인(화면 렌더링은 모든 사용자 텍스트가 JSX 텍스트 노드로만 출력되어 React가 자동 이스케이프)
- [x] 5.17 모바일: 탭 2등분(기존)·콤보박스 `max-height`+스크롤(기존) 외에, **입력 포커스 시 스크롤**(`scrollIntoView`, 알고리즘 콤보박스+문제 텍스트박스)과 **터치 타겟 확대**(`CopyButton`/`CodeBlock` 복사 버튼/`ThemeToggle`/언어 재시도 버튼에 `after:-inset-*` 가상요소로 시각적 크기는 유지한 채 클릭 영역만 ~44px로 확장, 언어 탭·풀이 서브탭은 패딩을 늘려 44px에 더 가깝게 조정)을 새로 추가
- [x] 3.4 로딩 오버레이 범위: `display.kind==='loading'`일 때는 `<LoadingState/>`만 렌더링되고 `AlgorithmResult`/`ProblemResult`(하단 버튼 포함)는 `success`에서만 렌더링되는 구조라 이미 요구사항을 만족함을 코드 감사로 확인(수정 불필요)
- [x] 라이트/다크 테마: 새로 쓴 토큰(`bg-medium`, `border-medium`, `bg-foreground`/`text-background` 등)이 `app/globals.css`의 라이트·다크 두 블록 모두에 정의되어 있음을 코드로 확인

**완료 기준 검증 상태**: `tsc --noEmit`/`pnpm build` 통과, node fetch로 XSS 페이로드 라운드트립 + 기존 라우트 회귀 테스트 확인. **브라우저를 통한 실제 모바일 반응형 QA와 라이트/다크 육안 확인은 이번 세션에서 브라우저 자동화 도구를 사용할 수 없어 수행하지 못했다** — 코드 레벨 검토와 토큰 존재 확인까지만 했다.

---

## Sprint 5 — 통합 QA 및 배포 ⚠️ 부분 완료 — 배포는 사용자 인증 필요 (2026-08-28)

**목표**: PRD 6장 Done Criteria 1~8 전체 충족 확인, 프로덕션 배포.

**작업**
- [x] Done Criteria #1~#8 각각에 대한 수동 테스트 시나리오 작성 및 실행 (결과는 아래 "QA 결과" 참고) — 코드/API 레벨로 실행 가능한 것은 전부 실행, AI 응답 렌더링·브라우저 상호작용이 필요한 항목은 실행 못 함(도구 제약, 아래 비고란에 명시)
- [x] 회귀 버그 수정: QA 도중 **`app/page.tsx`에 React 에러 바운더리가 없다는 것을 발견** — 결과 렌더링 중 예기치 못한 오류가 나면 헤더·탭·입력창까지 통째로 죽어 Done Criteria #6("항상 상태 표시줄과 입력 UI는 살아있어야 한다")을 위반할 수 있었다. `components/result-error-boundary.tsx`(`ResultErrorBoundary`)를 새로 만들어 결과 렌더링 구간만 감싸도록 수정 — 이제 그 구간에서 오류가 나도 헤더/탭/입력/상태 표시줄은 그대로 살아있고 결과 영역만 재시도 화면으로 바뀐다.
- [x] 회귀 테스트: 세 API 라우트(`/api/algorithm`, `/api/problem`, `/api/algorithm/code`)의 성공/실패 케이스 10가지를 한 번에 다시 실행해 이전 스프린트 대비 회귀가 없음을 확인. `tsc --noEmit`/`pnpm build` 통과.
- [x] Vercel CLI 설치(`npm i -g vercel`, 로컬 도구 설치라 되돌리기 쉬운 안전한 작업) — 배포 준비.
- [ ] **AI Gateway 등 환경변수를 Vercel 프로젝트에 설정(`vercel env`)** — **차단됨**. `vercel login`은 사용자 본인 브라우저에서 진행되는 OAuth 흐름이라 에이전트가 대신 로그인할 수 없다. 사용자가 `! vercel login` → `! vercel link` → `! vercel env add AI_GATEWAY_API_KEY` 순으로 직접 진행해야 한다.
- [ ] **Preview 배포 → 확인 → Production 배포** — **차단됨**, 같은 이유(사용자 로그인 필요) + 프로덕션 배포는 외부에 공개되는 되돌리기 어려운 작업이라 사용자의 명시적 승인 없이 임의로 실행하지 않는다.

**완료 기준**: 프로덕션 URL에서 PRD의 모든 Done Criteria가 재현 가능 — **아직 미충족**(배포 자체가 안 됨). 로컬 개발 서버 기준으로는 코드/API 레벨 검증을 모두 통과했다.

---

## QA 결과

| # | Done Criteria | 결과 | 비고 |
|---|---|---|---|
| 1 | 알고리즘 검색 결과 전체 렌더링 | **API 레벨 검증됨** | 2026-08-28 Gemini 전환 후 `POST /api/algorithm`(이진 탐색)이 실제 200과 함께 description/difficulty/difficultyReason/useCases(4개)/C·C++·Java·Python 코드를 전부 채워 반환함을 확인. 화면에 그대로 렌더링되는지 브라우저 육안 확인은 아직 못 함 |
| 2 | 문제 검색 결과 전체 렌더링 | **API 레벨 검증됨** | `POST /api/problem`(회의실 배정 문제)이 실제 200과 함께 matched:true, 풀이 2개(활동 선택/그리디, 둘 다 카탈로그에 실재하는 algorithmId, 시간복잡도 O(N log N))를 반환함을 확인. 브라우저 육안 확인은 아직 못 함 |
| 3 | 관련 알고리즘 순환 탐색 | 코드 검증됨 · E2E 블록됨 | 자기참조 필터링(서버+클라이언트), 무효 id 시 5.3과 동일 처리 등 상태 전이 로직은 코드 감사로 확인. #1 테스트에서 `related` 필드 자체까지는 확인 안 함(출력 절단). 여러 알고리즘을 실제로 몇 단계 클릭해 순환 탐색하는 것은 브라우저 필요 |
| 4 | 모든 예외 상황 상태 표시 | 실행됨(API 레벨) | 10개 케이스(빈 입력/무효 이름/무의미 입력/글자수 초과/AI 오류 등) 재실행, 전부 의도한 상태 코드·문구 반환 확인. 화면에 정확히 그 문구가 뜨는지 육안 확인은 미실행 |
| 5 | 로딩 오버레이 범위 | 코드 검증됨 | `loading` 상태에서 결과+버튼 영역이 전부 `LoadingState`로 대체되는 구조를 코드 감사로 확인 |
| 6 | White Screen 없음 | **보강됨** | 에러 바운더리가 없던 것을 발견해 `ResultErrorBoundary` 신규 추가(위 참고). 실제 브라우저에서 강제로 오류를 유발해 헤더/입력이 살아있는지 육안 확인은 못 함 |
| 7 | Out of Scope UI 부재 | **실행됨 · 통과** | `login/signup/payment/checkout/password/upload/저장하기/공유하기` 등 키워드로 `app/`·`components/`·`lib/` 전체 검색 0건, `package.json`에 DB 관련 의존성(prisma/postgres/redis 등) 0건 확인 |
| 8 | 복사 기능 성공/실패 피드백 | 코드 검증됨 · 브라우저 미실행 | `useCopyToClipboard`로 구현. 실제 클립보드 API 성공/실패를 브라우저에서 눌러 확인하는 것은 못 함 |

**요약**: 2026-08-28 Gemini API 키 확보로 #1/#2가 "블록됨"에서 "API 레벨 검증됨"으로 올라갔다 — AI가 실제로 스키마에 맞는 완결된 응답을 준다는 것이 처음으로 증명됐다. 8개 중 실제로 실행까지 완료된 건 #1/#2(API 레벨)·#4(API 레벨)·#7(코드 검증)이고, #3/#5/#6/#8은 코드 감사로 뒷받침되지만 브라우저 실행은 아니다. **남은 병목은 브라우저 접근뿐이다** — AI 키 문제는 해결됐다.

---

## Sprint 6 — Gemini 전환 후속: 실사용 검증 + 마무리 (신규, 2026-08-28)

**배경**: Sprint 0~5는 전부 Vercel AI Gateway(`AI_GATEWAY_API_KEY`) 기준으로 설계·구현됐으나, 그 키가 실제로는 인증에 실패해 AI 성공 응답을 한 번도 못 봤다. 2026-08-28에 사용자가 보유한 **Google Gemini API 키**로 전환하면서(`02-architecture.md` §1 참고) `/api/algorithm`·`/api/problem`·`/api/algorithm/code` 세 라우트 모두 실제 200 응답을 처음으로 확인했다. 이 스프린트는 "AI가 진짜로 동작한다"는 사실 위에서 남은 검증·마무리 작업을 정리한다.

**작업**
- [ ] **실제 AI 응답으로 브라우저 QA 재시도**: Sprint 3~5에서 "로직은 있지만 미검증"으로 남겨둔 5.1(빈 입력 강조)·5.9/5.10(관련 알고리즘 필터링·자기참조)·5.12(오프라인)·5.15(클립보드 실패)·5.17(모바일) 등을 이제는 실제 AI 응답이 뜨는 화면에서 브라우저로 확인할 수 있다. 브라우저 자동화 도구가 연결되면 우선순위로 진행.
- [ ] **5.4/5.5(지연·타임아웃) 실측**: 지금까지 관찰한 정상 응답은 전부 수 초~20초 내에 끝났다(빠른 것은 2~3초, 느린 것은 15초 안팎). `lib/request-timing.ts`의 `SLOW_AFTER_MS`(4초)는 실제로 종종 발동할 만한 범위이니, 몇 차례 더 호출해 지연 문구 전환이 실제로 뜨는지 확인. `REQUEST_TIMEOUT_MS`(18초)는 정상 응답이 대체로 그 안에 끝나 실제로 타임아웃까지 가는 사례는 드물 것으로 보임 — 필요하면 임시로 상수를 낮춰 타이머 분기 자체만 검증.
- [ ] **5.7(부분 파싱 복구) 실측**: 지금까지 관찰된 응답은 전부 스키마를 완전히 만족했다(`generatePartialSafe`가 `'ok'` 경로만 탐). `'partial'` 경로(필드 단위 salvage)는 아직 실제 AI 응답으로 발동한 적이 없다 — Gemini가 스키마를 깨는 경우가 드물다면 이 안전장치가 얼마나 자주 필요한지 계속 지켜볼 것.
- [ ] **출력 품질 점검**: 관찰된 응답 중 `difficultyReason`에 "구현할 me 수 있습니다"처럼 사소한 언어 혼입 오타가 한 번 있었다. 반복되는지 몇 차례 더 호출해 지켜보고, 자주 발생하면 프롬프트에 "정확한 한국어로만 작성" 같은 지침을 보강하는 것을 고려. 지금 당장 조치가 필요한 수준은 아님(스키마 검증은 통과, 사용성에 큰 지장 없음).
- [ ] **레이트리밋/할당량 대응 검토**: Vercel AI Gateway를 거치지 않고 Google API를 직접 호출하므로, Gateway가 주던 통합 레이트리밋·관측 기능이 없다. Google 쪽 429(Too Many Requests)를 받으면 현재는 다른 실패와 마찬가지로 `UPSTREAM_ERROR`(502)로 뭉뚱그려진다 — 트래픽이 늘면 429 전용 처리(예: 백오프 재시도, 전용 안내 문구)를 고려.
- [ ] **Vercel 배포**: `GOOGLE_GENERATIVE_AI_API_KEY`를 Vercel 프로젝트 환경변수로 등록하고 배포 — Sprint 5에서 막혔던 부분과 동일(사용자의 `vercel login` 필요).

**완료 기준**: 브라우저로 Done Criteria #1~#8을 실제 화면에서 최소 한 번씩 재현하고, 5.4/5.5/5.7의 실제 발동 여부를 관찰해 기록한다.

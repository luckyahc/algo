# 현재 상태 (Baseline Audit)

작성일: 2026-08-28 (Sprint 0~3 완료 시점 기준)

PRD가 요구하는 최종 형태와, 지금 리포지토리에 실제로 존재하는 것 사이의 간극을 정리한다. 스프린트 계획(`03-sprint-plan.md`)은 이 간극을 메우는 순서다. 스프린트가 끝날 때마다 이 문서 전체를 그 시점 기준으로 다시 쓴다(이력은 git으로 추적).

## 구현되어 있는 것

- **알고리즘 검색(기능 A)** — 실제 AI 연동으로 동작한다.
  - `lib/algorithm-catalog.ts`: 정렬/탐색/그래프/트리/동적계획법/그리디/분할정복/백트래킹/문자열/수학/자료구조/배열 전 분야, 82개 항목의 유효 알고리즘 목록(PRD 3.1).
  - `app/api/algorithm/route.ts`: Vercel AI Gateway(`generateObject` + Zod, 모델 `anthropic/claude-sonnet-5`)로 설명·난이도·근거·사용처·C/C++/Java/Python 코드·관련 알고리즘을 생성. 빈 입력(400)·카탈로그 불일치(404 + 유사 후보)는 AI 호출 전에 서버가 차단.
  - `app/api/algorithm/code/route.ts`(신규, Sprint 3): 언어 하나만 다시 생성하는 전용 라우트. `LanguageTabs`에 탭 안 재시도 버튼(스피너 포함)이 붙어, 실패한 언어만 개별 재요청할 수 있다(PRD 5.19).
  - `components/language-tabs.tsx`: C/C++/Java/Python 탭, 최초 진입 시 C++ 기본, `page.tsx`의 `preferredLang` state로 세션 내 선택 유지(PRD 3.2). 언어 코드가 없으면 그 탭에 재시도 버튼이 있는 플레이스홀더를 보여준다.
  - 관련 알고리즘 버튼: 서버·클라이언트 이중으로 자기 자신/무효 id를 필터링(5.9, 5.10).
- **문제 검색(기능 B)** — 실제 AI 연동으로 동작한다.
  - `app/api/problem/route.ts`: 문제 난이도·근거·매칭 여부(`matched`)·풀이별(algorithmId/해설/시간복잡도/추천 여부) 목록을 생성. 카탈로그에 없는 `algorithmId`를 참조하는 풀이는 걸러내고, 걸러낸 뒤 추천 풀이가 없으면 첫 풀이를 승격.
  - `components/problem-result.tsx`: 풀이가 여러 개면 탭 + 시간복잡도, 매칭 없음(`matched:false`)은 오류가 아닌 안내 카드로 정상 렌더링(5.8).
- **예외 처리(PRD 5장, Sprint 3에서 대거 추가)**
  - **단일 상태 계산 함수**: `app/page.tsx`의 `getDisplay()`가 `inputError`(클라이언트 검증 실패) / `isOffline` / `requestPhase`(idle·loading·timeout·server-error·success) / `isSlow` 네 원시 상태를 우선순위(입력오류 > 오프라인 > 로딩·지연 > 타임아웃·서버오류 > 성공)로 조합해 항상 하나의 표시 상태만 반환한다(5.18).
  - **5.1**: 빈 입력 시 전용 문구 + 콤보박스/텍스트박스 포커스 이동·테두리 강조.
  - **5.4/5.5**: `lib/request-timing.ts`(지연 4초, 타임아웃 18초) + `AbortController`. 지연되면 문구만 바뀌고 요청은 계속되며, 타임아웃되면 abort 후 전용 재시도 화면.
  - **5.6**: 서버/네트워크 오류 시 `ErrorState` + 무제한 재시도(`lastAction` ref로 마지막 요청 재실행). 실제로 `AI_GATEWAY_API_KEY` 없이 502를 유발해 이 경로가 정확히 동작함을 확인.
  - **5.7**: `lib/ai.ts`의 `generatePartialSafe`가 AI 응답이 스키마를 통째로 만족 못 해도 **필드 단위로 개별 재검증**해 살릴 수 있는 필드만 살리고, 나머지는 `null`로 응답 → 컴포넌트가 `MISSING_FIELD_PLACEHOLDER`로 대체 렌더링. 이를 위해 `AlgorithmResultData`/`ProblemResultData`의 대부분 필드를 nullable로 재정의.
  - **5.11**: 로딩 중 검색창·버튼뿐 아니라 **탭 전환도 차단**(전환을 허용하면 요청이 끝났을 때 엉뚱한 탭에 결과가 표시되는 버그가 있어 막음).
  - **5.12**: `online`/`offline` 이벤트 구독 + `OfflineState`, 재연결 시 자동 재요청 없이 안내만 사라짐.
  - **5.13**: 문제 텍스트박스 하단 `OOO/1000자` 카운터 + 초과 시 버튼 비활성화, 서버(`/api/problem`)도 1000자 초과를 별도 재검증(`TOO_LONG`).
- **검증 완료 범위**: `tsc --noEmit`, `pnpm build` 모두 통과. node fetch로 `/api/algorithm`(400/404/502), `/api/problem`(400 `INVALID_INPUT`/`MEANINGLESS_INPUT`/`TOO_LONG`, 502), `/api/algorithm/code`(400/404/502) 전부 확인. 5.6과 5.13은 실제 트래픽으로 검증됨; 나머지 Sprint 3 항목(5.1, 5.4, 5.5, 5.7, 5.11, 5.12, 5.18, 5.19)은 로직·배선은 갖춰졌으나 브라우저에서 육안으로, 또는(5.4/5.5/5.7/5.19는) 실제 AI 트래픽으로 아직 재현하지 못했다.

## PRD 대비 남은 간극

| 영역 | PRD 요구 | 현재 상태 |
|---|---|---|
| XSS 최종 검증 | 악성 입력을 실제로 넣어 텍스트로만 렌더링되는지 확인 (5.14) | React 기본 이스케이프로 이미 충족되지만 수동 검증 안 함 — **Sprint 4** |
| 클립보드 실패 피드백 | 실패 시 토스트 안내 (5.15) | 실패 시 조용히 무시(성공 피드백은 있음) — **Sprint 4** |
| 모바일 레이아웃 검증 | 콤보박스 스크롤, 키보드 회피, 44px 터치 타겟 (5.17) | 반응형 클래스는 있으나 실기기/에뮬레이터 검증 안 함 — **Sprint 4** |
| AI 성공 응답 육안 확인 | 실제 200 응답이 화면에 의도대로 채워지는지 | `AI_GATEWAY_API_KEY`가 없어 두 기능 모두 아직 못 봄 — 키가 생기는 대로 아무 때나 가능 |
| 프로덕션 배포 | Vercel 배포 + Done Criteria 전체 재검증 | 아직 로컬 개발 서버까지만 — **Sprint 5** |

## 결론

Sprint 0~3으로 PRD 4장(핵심 파이프라인)과 5장(예외 처리) 19개 항목 대부분의 **코드**가 갖춰졌다. 5.2/5.3/5.6/5.9/5.10/5.11/5.13/5.19는 node fetch 또는 코드 감사로 검증됐고, 5.1/5.4/5.5/5.7/5.8/5.12/5.18은 로직은 있지만 브라우저 육안 또는 실제 AI 트래픽으로는 아직 재현하지 못한 상태다. 남은 작업은 (1) 클립보드·XSS·모바일 마감(Sprint 4), (2) `AI_GATEWAY_API_KEY`가 생기는 대로 미검증 항목들을 실제로 눈으로 확인, (3) 통합 QA와 배포(Sprint 5)다. 다음 착수 지점은 `03-sprint-plan.md`의 Sprint 4.

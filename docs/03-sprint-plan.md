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

## Sprint 3 — 예외 처리 전면 구현 (PRD 5장)

**목표**: `04-exception-checklist.md`의 남은 모든 항목. Done Criteria #4, #6.

**작업**
- [ ] 상태 표시줄을 `02-architecture.md` §4의 단일 상태 머신으로 리팩터링 (우선순위 규칙 5.18 포함)
- [ ] 5.1 빈 입력, 5.13 글자 수 제한(카운터+버튼 비활성화) 구현
- [ ] 5.4/5.5 지연(3~5초)·타임아웃(15~20초) 타이머 + `AbortController` 구현, "다시 시도" 버튼 연결
- [ ] 5.6 네트워크/서버 오류 처리 + 무제한 재시도
- [ ] 5.7 부분 파싱 실패 시 있는 필드만 표시 + 없는 필드 플레이스홀더
- [ ] 5.11 로딩 중 모든 검색/버튼 클릭 차단 재검증(이미 있는 disable 로직 감사)
- [ ] 5.12 온라인/오프라인 이벤트 감지 + 문구 전환
- [ ] 5.19 언어별 코드 개별 실패 표시 + 탭 내 재시도 아이콘 (`app/api/algorithm/code` 라우트 연동)

**완료 기준**: 체크리스트 19개 항목을 각각 의도적으로 재현했을 때 PRD가 명시한 문구/동작이 정확히 나타난다.

---

## Sprint 4 — 클립보드/접근성/모바일 마감

**목표**: Done Criteria #5, #8, PRD 3.4/5.14/5.15/5.16/5.17.

**작업**
- [ ] 5.15/5.16 클립보드 성공(체크 아이콘 1.5초)/실패(토스트) 피드백 재검증
- [ ] 5.14 XSS: `dangerouslySetInnerHTML` 미사용 전수 확인, 악성 입력(`<script>` 등) 수동 테스트
- [ ] 5.17 모바일: 탭 2등분 레이아웃, 콤보박스 `max-height`+내부 스크롤, 입력 포커스 시 가상 키보드 회피 스크롤, 터치 타겟 ≥44px
- [ ] 3.4 로딩 시 상태 표시줄 아래 전체(결과부+버튼부)가 로딩 오버레이로 덮이는지 최종 점검
- [ ] 라이트/다크 테마 모두에서 위 항목 재확인

**완료 기준**: 실기기 또는 브라우저 반응형 모드에서 모바일 QA 통과, 클립보드 성공/실패 시나리오 모두 확인.

---

## Sprint 5 — 통합 QA 및 배포

**목표**: PRD 6장 Done Criteria 1~8 전체 충족 확인, 프로덕션 배포.

**작업**
- [ ] Done Criteria #1~#8 각각에 대한 수동 테스트 시나리오 작성 및 실행 (결과를 이 문서 하단 "QA 결과"에 기록)
- [ ] AI Gateway 등 환경변수 Vercel 프로젝트에 설정 (`vercel env`)
- [ ] Preview 배포 → 확인 → Production 배포
- [ ] 회귀 버그 수정 및 최종 커밋

**완료 기준**: 프로덕션 URL에서 PRD의 모든 Done Criteria가 재현 가능.

---

## QA 결과 (Sprint 5에서 채움)

| # | Done Criteria | 결과 | 비고 |
|---|---|---|---|
| 1 | 알고리즘 검색 결과 전체 렌더링 | 미실행 | |
| 2 | 문제 검색 결과 전체 렌더링 | 미실행 | |
| 3 | 관련 알고리즘 순환 탐색 | 미실행 | |
| 4 | 모든 예외 상황 상태 표시 | 미실행 | |
| 5 | 로딩 오버레이 범위 | 미실행 | |
| 6 | White Screen 없음 | 미실행 | |
| 7 | Out of Scope UI 부재 | 미실행 | |
| 8 | 복사 기능 성공/실패 피드백 | 미실행 | |

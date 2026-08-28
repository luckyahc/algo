# 개발 문서 인덱스

이 폴더는 `PRD.md`(루트)를 이행하기 위한 개발 계획과 진행 상황을 관리한다.
PRD가 요구사항의 원본(source of truth)이며, 이 문서들은 그것을 스프린트 단위 실행 계획으로 분해한 것이다.

## 문서 구성

| 문서 | 용도 |
|---|---|
| [01-current-state.md](./01-current-state.md) | 현재 코드베이스가 PRD 대비 어디까지 구현되어 있는지의 스냅샷(베이스라인 감사) |
| [02-architecture.md](./02-architecture.md) | 남은 작업을 구현하기 위한 기술 결정(AI 연동 방식, 데이터 스키마, 상태 관리 구조) |
| [03-sprint-plan.md](./03-sprint-plan.md) | Sprint 0~6 실행 계획. 각 스프린트의 목표/작업/완료 기준(PRD 조항 매핑) |
| [04-exception-checklist.md](./04-exception-checklist.md) | PRD 5장(예외 처리) 19개 항목 구현 여부를 추적하는 체크리스트 |

## 사용 방법

- 새 스프린트를 시작하기 전, `03-sprint-plan.md`에서 해당 스프린트의 작업 목록을 확인한다.
- 예외 처리 관련 작업은 `04-exception-checklist.md`의 체크박스를 갱신하며 진행한다.
- 아키텍처가 바뀌면(예: AI 프로바이더 변경) `02-architecture.md`를 먼저 갱신하고 계획에 반영한다.
- 스프린트가 끝나면 `01-current-state.md`를 최신 상태로 갱신해 다음 스프린트의 기준선을 정확히 유지한다.

## 현재 상태 요약 (2026-08-28 기준 — AI 실사용 검증 완료, 배포 미완료)

**알고리즘 검색(기능 A)**과 **문제 검색(기능 B)** 모두 실제 AI 연동이 끝났고, **PRD 5장 예외 처리 19개 항목 전부 코드로 구현됐다.** 상태 표시줄은 `app/page.tsx`의 `getDisplay()` 하나가 입력오류 > 오프라인 > 로딩/지연 > 타임아웃/서버오류 > 성공 순으로 항상 단일 상태만 계산한다(5.18).

**2026-08-28: AI 프로바이더를 Vercel AI Gateway에서 Google Gemini 직접 호출로 전환했다.** 원래 쓰려던 Gateway 키가 계속 인증에 실패해, 사용자가 보유한 Gemini API 키로 갈아탔다(`@ai-sdk/google`, 모델 `gemini-3.6-flash`, 환경변수 `GOOGLE_GENERATIVE_AI_API_KEY`). 그 결과 **세 API 라우트(`/api/algorithm`, `/api/problem`, `/api/algorithm/code`) 모두 처음으로 실제 200 성공 응답을 확인했다** — Sprint 0~5 내내 가장 큰 미검증 항목이었던 "AI가 실제로 스키마에 맞는 응답을 주는가"가 이제 증명됐다.

**Sprint 5(통합 QA)**에서 실제 버그를 하나 발견해 고쳤다: `app/page.tsx`에 React 에러 바운더리가 없어 결과 렌더링 중 오류가 나면 헤더·입력창까지 통째로 죽을 수 있었다 — `components/result-error-boundary.tsx`를 추가해 결과 영역만 격리했다(Done Criteria #6).

**남은 병목은 이제 하나뿐이다** — 사용자 본인의 Vercel 로그인(OAuth는 에이전트가 대신할 수 없음, CLI 설치까지만 완료). 이번 세션은 브라우저 자동화 도구 없이 진행돼 실제 화면 렌더링·모바일 반응형 등의 육안 확인은 남아 있다(**Sprint 6**에서 정리).

Done Criteria 1~8 중 #1/#2/#4가 API 레벨로 검증됐고, #7은 코드 검증, #3/#5/#6/#8은 코드 검증만 남았다. 자세한 QA 결과표와 후속 계획은 [03-sprint-plan.md](./03-sprint-plan.md)의 "QA 결과"·"Sprint 6", 남은 간극은 [01-current-state.md](./01-current-state.md), 예외 항목별 상태는 [04-exception-checklist.md](./04-exception-checklist.md) 참고.

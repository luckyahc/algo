# 개발 문서 인덱스

이 폴더는 `PRD.md`(루트)를 이행하기 위한 개발 계획과 진행 상황을 관리한다.
PRD가 요구사항의 원본(source of truth)이며, 이 문서들은 그것을 스프린트 단위 실행 계획으로 분해한 것이다.

## 문서 구성

| 문서 | 용도 |
|---|---|
| [01-current-state.md](./01-current-state.md) | 현재 코드베이스가 PRD 대비 어디까지 구현되어 있는지의 스냅샷(베이스라인 감사) |
| [02-architecture.md](./02-architecture.md) | 남은 작업을 구현하기 위한 기술 결정(AI 연동 방식, 데이터 스키마, 상태 관리 구조) |
| [03-sprint-plan.md](./03-sprint-plan.md) | Sprint 0~5 실행 계획. 각 스프린트의 목표/작업/완료 기준(PRD 조항 매핑) |
| [04-exception-checklist.md](./04-exception-checklist.md) | PRD 5장(예외 처리) 19개 항목 구현 여부를 추적하는 체크리스트 |

## 사용 방법

- 새 스프린트를 시작하기 전, `03-sprint-plan.md`에서 해당 스프린트의 작업 목록을 확인한다.
- 예외 처리 관련 작업은 `04-exception-checklist.md`의 체크박스를 갱신하며 진행한다.
- 아키텍처가 바뀌면(예: AI 프로바이더 변경) `02-architecture.md`를 먼저 갱신하고 계획에 반영한다.
- 스프린트가 끝나면 `01-current-state.md`를 최신 상태로 갱신해 다음 스프린트의 기준선을 정확히 유지한다.

## 현재 상태 요약 (2026-08-28 기준, Sprint 0~5 — 개발 완료 · 배포 미완료)

**알고리즘 검색(기능 A)**과 **문제 검색(기능 B)** 모두 `app/api/algorithm`·`app/api/problem`(Vercel AI Gateway + `generateObject`)으로 실제 AI 연동이 끝났고, **PRD 5장 예외 처리 19개 항목 전부 코드로 구현됐다.** 상태 표시줄은 `app/page.tsx`의 `getDisplay()` 하나가 입력오류 > 오프라인 > 로딩/지연 > 타임아웃/서버오류 > 성공 순으로 항상 단일 상태만 계산한다(5.18).

**Sprint 5(통합 QA)**에서 실제 버그를 하나 발견해 고쳤다: `app/page.tsx`에 React 에러 바운더리가 없어 결과 렌더링 중 오류가 나면 헤더·입력창까지 통째로 죽을 수 있었다 — `components/result-error-boundary.tsx`를 추가해 결과 영역만 격리했다(Done Criteria #6). 세 API 라우트의 성공/실패 케이스 10가지를 다시 실행해 회귀 없음도 확인했다.

**남은 건 코드가 아니라 두 가지 외부 자원이다.** (1) `AI_GATEWAY_API_KEY`가 없어 AI 성공 응답이 실제로 화면을 채우는지 아직 못 봤고, (2) 이번 세션은 브라우저 자동화 도구 없이 진행돼 지연/타임아웃/오프라인/클립보드/모바일 반응형 등 다수 항목의 육안 확인을 못 했으며, (3) Vercel 배포는 사용자 본인의 로그인(OAuth)이 필요해 CLI 설치까지만 해두고 진행하지 못했다.

Done Criteria 1~8 중 실제로 실행까지 완료된 건 #4(API 레벨)·#7(코드 검증)이고, #3/#5/#6/#8은 코드 검증만, #1/#2는 AI 키로 전면 블록이다. 자세한 QA 결과표는 [03-sprint-plan.md](./03-sprint-plan.md), 남은 간극은 [01-current-state.md](./01-current-state.md), 예외 항목별 상태는 [04-exception-checklist.md](./04-exception-checklist.md) 참고.

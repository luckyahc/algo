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

## 현재 상태 요약 (2026-08-28 기준)

리포지토리에는 shadcn/Tailwind 기반의 **정적 UI 목업**만 존재한다. 알고리즘 데이터는 `lib/algorithms.ts`에 하드코딩되어 있고, 문제 검색은 고정된 mock 결과 하나만 반환하며, AI 연동/백엔드는 전혀 없다. 자세한 내용은 [01-current-state.md](./01-current-state.md) 참고.

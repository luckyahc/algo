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

## 현재 상태 요약 (2026-08-28 기준, Sprint 2 완료)

**알고리즘 검색(기능 A)**은 `lib/algorithm-catalog.ts`(82개 항목 유효 목록)와 `app/api/algorithm`(Vercel AI Gateway + `generateObject`)로 실제 AI 연동까지 배선이 끝났다. C/C++/Java/Python 언어 탭, 세션 내 언어 선택 유지, 관련 알고리즘 자기참조/무효 id 필터링(5.9, 5.10), 목록에 없는 이름 입력 처리(5.3)까지 구현·검증됨.

**문제 검색(기능 B)**도 `app/api/problem`으로 실제 AI 연동이 끝났다. 풀이가 여러 개면 탭 + 시간복잡도(3.2), 매칭되는 알고리즘이 없으면 오류가 아닌 정상 결과로 안내(5.8), 공백/무의미 입력 차단(5.2)까지 구현·검증됨.

두 기능 모두 **로컬에 `AI_GATEWAY_API_KEY`가 없어 AI 성공 응답 렌더링 자체는 아직 육안 검증 전**이다(입력 검증·에러 코드·필터링 로직은 서버 단에서 확인됨).

예외 처리(PRD 5장) 19개 항목 중 5.2/5.3/5.8/5.9/5.10 다섯 개가 구현·검증됐고, 나머지(빈 입력 안내·지연·타임아웃·오프라인·글자 수 제한·클립보드 실패·모바일 등)는 Sprint 3~4에서 처리한다. 자세한 내용과 남은 간극은 [01-current-state.md](./01-current-state.md), 스프린트별 체크박스는 [03-sprint-plan.md](./03-sprint-plan.md), 예외 항목별 상태는 [04-exception-checklist.md](./04-exception-checklist.md) 참고.

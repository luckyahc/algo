// PRD 5.4: 이 시간이 지나면 "지연" 문구로 갱신한다 (요청은 계속 진행).
export const SLOW_AFTER_MS = 4000
// PRD 5.5: 이 시간을 넘기면 요청을 abort하고 타임아웃으로 처리한다.
// PRD가 제시한 예시값은 15~20초였지만, 카탈로그가 273개로 커지면서 프롬프트에 담기는
// CATALOG_ID_LIST가 커졌고, 4개 언어 코드를 전부 생성하는 /api/algorithm은 실측상 정상적으로도
// 10초~2분 가까이 걸리는 사례가 관찰됐다(2026-08-28). 18초로 두면 정상적으로 진행 중인 요청까지
// 계속 타임아웃으로 끊겨 버려서 120초로 올렸다.
export const REQUEST_TIMEOUT_MS = 120000
// PRD 5.13: 문제 검색란의 최대 글자 수.
export const MAX_PROBLEM_LENGTH = 1000

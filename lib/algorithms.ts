// 문제 검색(기능 B)용 타입과 목업 데이터.
// 알고리즘 상세 데이터는 더 이상 여기 하드코딩하지 않는다 — lib/algorithm-catalog.ts(유효 목록) +
// app/api/algorithm(AI 생성)으로 대체되었다 (Sprint 0/1).
// 문제 검색의 실제 AI 연동은 Sprint 2에서 진행하며, 그 전까지는 이 목업으로 화면을 유지한다.

import type { Difficulty } from '@/lib/schemas'

export type { Difficulty }

export type Solution = {
  id: string
  label: string
  algorithmId: string
  explanation: string
  timeComplexity: string
}

export type ProblemResult = {
  problem: string
  difficulty: Difficulty
  difficultyReason: string
  solutions: Solution[]
}

export const MOCK_PROBLEM_RESULT: ProblemResult = {
  problem:
    'N개의 회의 시작·종료 시간이 주어질 때, 한 회의실에서 시간이 겹치지 않게 진행할 수 있는 회의의 최대 개수를 구하세요.',
  difficulty: '중',
  difficultyReason:
    '정렬 후 규칙을 찾으면 코드는 짧지만, "왜 끝나는 시간 기준 정렬이 최적인지"를 떠올리는 통찰이 필요합니다. 그리디의 정당성을 이해하면 쉽지만 모르면 헤매기 쉬운 중급 문제입니다.',
  solutions: [
    {
      id: 'sol-greedy',
      label: '풀이 1 · 그리디',
      algorithmId: 'greedy',
      explanation:
        '회의를 "끝나는 시간"이 빠른 순으로 정렬한 뒤, 앞에서부터 현재까지 선택한 회의의 종료 시간과 겹치지 않는 회의를 차례로 고릅니다. 가장 빨리 끝나는 회의를 고를수록 남는 시간이 많아져 더 많은 회의를 넣을 수 있다는 것이 핵심 통찰입니다. 이 방식이 항상 최적임이 증명되어 있어 그리디로 안전하게 풀 수 있습니다.',
      timeComplexity: 'O(N log N)',
    },
    {
      id: 'sol-dp',
      label: '풀이 2 · DP',
      algorithmId: 'dynamic-programming',
      explanation:
        '가중치(중요도)가 회의마다 다른 확장 버전(가중 활동 선택)이라면 단순 그리디로는 최적이 보장되지 않습니다. 이때는 끝나는 시간 순 정렬 후, 각 회의에 대해 "이 회의를 포함할 때 겹치지 않는 가장 늦은 이전 회의"를 이진 탐색으로 찾아 dp[i] = max(dp[i-1], value[i] + dp[prev]) 점화식으로 풀 수 있습니다.',
      timeComplexity: 'O(N log N)',
    },
  ],
}

import { z } from 'zod'
import type { AlgorithmCategory } from '@/lib/algorithm-catalog'

// 1(가장 쉬움) ~ 10(카탈로그에서 가장 어려운 알고리즘 수준)의 10단계 난이도.
// 기준 문구는 lib/ai.ts의 DIFFICULTY_SCALE_PROMPT 참고 — 두 라우트가 이 문구를 공유해
// 같은 기준으로 채점하도록 한다.
export const DIFFICULTY_MIN = 1
export const DIFFICULTY_MAX = 10
export const DifficultySchema = z
  .number()
  .int()
  .min(DIFFICULTY_MIN)
  .max(DIFFICULTY_MAX)
export type Difficulty = z.infer<typeof DifficultySchema>

// 5.7(부분 파싱) 경로로 살아남은 값이나 모델이 드물게 범위를 벗어나게 준 값을 방어적으로
// 1~10 안으로 눌러 담는다. 두 라우트(app/api/algorithm, app/api/problem)가 공유한다.
export function clampDifficulty(value: number | undefined): Difficulty | null {
  if (value === undefined || Number.isNaN(value)) return null
  return Math.min(DIFFICULTY_MAX, Math.max(DIFFICULTY_MIN, Math.round(value)))
}

export const LANGUAGES = ['c', 'cpp', 'java', 'python'] as const
export type LanguageKey = (typeof LANGUAGES)[number]

export const LANGUAGE_LABELS: Record<LanguageKey, string> = {
  c: 'C',
  cpp: 'C++',
  java: 'Java',
  python: 'Python',
}

// 최초 진입 시 기본으로 보여주는 언어. PRD 3.2 — 세션 내 다른 언어를 선택하면 그게 유지된다.
export const DEFAULT_LANGUAGE: LanguageKey = 'cpp'

// 언어별 코드는 nullable — 아직 안 불러왔거나(5.19 관점에서 "필요할 때만 요청") AI가 생성에
// 실패해도 그 필드만 비어있게 되어 카드 전체가 아니라 해당 언어 탭만 영향을 받는다 (PRD 5.19).
export const AlgorithmCodeSchema = z.object({
  c: z.string().nullable(),
  cpp: z.string().nullable(),
  java: z.string().nullable(),
  python: z.string().nullable(),
})

// 최초 알고리즘 검색 시 AI에게는 기본 언어(C++) 코드 하나만 요청한다 — 4개 언어를 한 번에
// 요청하면 출력 토큰이 크게 늘어 응답이 느려지기 때문이다. 나머지 언어는 사용자가 그 탭을
// 열 때 /api/algorithm/code로 그때그때 요청한다.
export const AlgorithmDetailSchema = z.object({
  description: z.string().min(1),
  difficulty: DifficultySchema,
  difficultyReason: z.string().min(1),
  useCases: z.array(z.string().min(1)).min(1),
  code: z.string().min(1), // 기본 언어(C++) 코드
  // 카탈로그 id를 참조한다. 자기 자신/무효 id 필터링은 서버에서 한 번,
  // 버튼 클릭 시 클라이언트에서 한 번 더 검증한다 (PRD 5.9, 5.10).
  related: z.array(z.string()).max(6),
})

export type AlgorithmDetail = z.infer<typeof AlgorithmDetailSchema>
export type AlgorithmCode = z.infer<typeof AlgorithmCodeSchema>

// PRD 5.7: AI 응답이 스키마를 완전히 만족하지 못해도, 파싱에 성공한 필드만
// 그대로 쓰고 실패한 필드는 null로 내려보내 화면에서 개별적으로 placeholder를 표시한다.
export const MISSING_FIELD_PLACEHOLDER = '이 항목은 준비되지 않았습니다.'

// 카탈로그(정적 메타데이터) + AI가 생성한 상세 내용을 합친, 화면에 렌더링되는 최종 형태.
export type AlgorithmResultData = {
  id: string
  name: string
  category: AlgorithmCategory
  description: string | null
  difficulty: Difficulty | null
  difficultyReason: string | null
  useCases: string[] | null
  code: AlgorithmCode
  related: string[]
}

// code는 추천 풀이(recommended:true) 하나에만 채워서 최초 응답을 가볍게 유지하고,
// 나머지 풀이의 code는 null로 두었다가 사용자가 그 풀이 탭을 열 때 /api/problem/code로
// 그때그때 요청한다 (PRD 5.19와 동일한 온디맨드 패턴, algorithm 코드 필드 참고).
export const ProblemSolutionSchema = z.object({
  algorithmId: z.string(),
  label: z.string().min(1),
  explanation: z.string().min(1),
  timeComplexity: z.string().min(1),
  recommended: z.boolean(),
  code: z.string().nullable(),
})

export const ProblemAnalysisSchema = z.object({
  difficulty: DifficultySchema,
  difficultyReason: z.string().min(1),
  matched: z.boolean(),
  solutions: z.array(ProblemSolutionSchema).max(5),
})

export type ProblemAnalysis = z.infer<typeof ProblemAnalysisSchema>
export type ProblemSolution = z.infer<typeof ProblemSolutionSchema>

// 사용자가 입력한 문제 원문 + AI가 생성한 분석 결과를 합친, 화면에 렌더링되는 최종 형태.
// (원문은 AI가 다시 생성하지 않고 그대로 재사용한다 — lib/ai.ts, app/api/problem/route.ts 참고)
// difficulty/difficultyReason은 5.7(부분 파싱 실패) 시 null이 될 수 있다.
// solutions는 부분 항목을 만들지 않는다 — 필드가 덜 채워진 풀이는 통째로 걸러낸다.
export type ProblemResultData = {
  problem: string
  difficulty: Difficulty | null
  difficultyReason: string | null
  matched: boolean
  solutions: ProblemSolution[]
}

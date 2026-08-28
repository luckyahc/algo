import { z } from 'zod'
import type { AlgorithmCategory } from '@/lib/algorithm-catalog'

export const DIFFICULTIES = ['하', '중', '상'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

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
  difficulty: z.enum(DIFFICULTIES),
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

export const ProblemSolutionSchema = z.object({
  algorithmId: z.string(),
  label: z.string().min(1),
  explanation: z.string().min(1),
  timeComplexity: z.string().min(1),
  recommended: z.boolean(),
})

export const ProblemAnalysisSchema = z.object({
  difficulty: z.enum(DIFFICULTIES),
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

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

// 언어별 코드는 nullable — AI가 특정 언어 생성에 실패해도 그 필드만 비어있게 되어
// 카드 전체가 아니라 해당 언어 탭만 실패로 처리할 수 있다 (PRD 5.19).
export const AlgorithmCodeSchema = z.object({
  c: z.string().nullable(),
  cpp: z.string().nullable(),
  java: z.string().nullable(),
  python: z.string().nullable(),
})

export const AlgorithmDetailSchema = z.object({
  description: z.string().min(1),
  difficulty: z.enum(DIFFICULTIES),
  difficultyReason: z.string().min(1),
  useCases: z.array(z.string().min(1)).min(1),
  code: AlgorithmCodeSchema,
  // 카탈로그 id를 참조한다. 자기 자신/무효 id 필터링은 서버에서 한 번,
  // 버튼 클릭 시 클라이언트에서 한 번 더 검증한다 (PRD 5.9, 5.10).
  related: z.array(z.string()).max(6),
})

export type AlgorithmDetail = z.infer<typeof AlgorithmDetailSchema>

// 카탈로그(정적 메타데이터) + AI가 생성한 상세 내용을 합친, 화면에 렌더링되는 최종 형태.
export type AlgorithmResultData = AlgorithmDetail & {
  id: string
  name: string
  category: AlgorithmCategory
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

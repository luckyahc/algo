import { z } from 'zod'
import { DIFFICULTY_SCALE_PROMPT, generatePartialSafe } from '@/lib/ai'
import { clampDifficulty, DifficultySchema } from '@/lib/schemas'
import { MAX_PROBLEM_LENGTH } from '@/lib/request-timing'

export const runtime = 'nodejs'

const DifficultyOnlySchema = z.object({
  difficulty: DifficultySchema,
  difficultyReason: z.string().min(1),
})

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: code, message }, { status })
}

// /api/algorithm·/api/problem의 최초 응답은 description/useCases/code/solutions 등 필드가
// 많아서, 5.7(부분 파싱) 경로를 타면 그중 difficulty만 개별적으로 탈락하는 경우가 있다
// (사용자 보고: "문제 입력할 때 난이도가 안 나올 때가 있다"). 필드 2개짜리 이 작은 스키마는
// 실패할 표면적이 훨씬 작아서, 클라이언트가 difficulty가 null로 온 것을 보면 자동으로 이
// 라우트 하나만 다시 불러 채운다 (fetchLanguageCode/fetchSolutionCode와 동일한 온디맨드 패턴).
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, 'INVALID_INPUT', '요청 본문을 읽을 수 없습니다.')
  }

  const context =
    typeof body === 'object' && body !== null && 'context' in body
      ? String((body as { context: unknown }).context ?? '')
      : ''
  const trimmed = context.trim()

  if (!trimmed) {
    return jsonError(400, 'INVALID_INPUT', '요청 값이 올바르지 않습니다.')
  }
  if (trimmed.length > MAX_PROBLEM_LENGTH) {
    return jsonError(
      400,
      'TOO_LONG',
      `내용은 ${MAX_PROBLEM_LENGTH}자 이내여야 합니다.`,
    )
  }

  const result = await generatePartialSafe(
    DifficultyOnlySchema,
    `당신은 알고리즘 교육 콘텐츠 작성자입니다. 아래 알고리즘 또는 문제의 난이도를 한국어로 판단하세요.

내용: ${trimmed}

작성 지침:
- ${DIFFICULTY_SCALE_PROMPT}
- difficultyReason: 그 난이도로 판단한 근거를 2~3문장으로 설명한다.`,
  )

  if (result.status === 'rate-limited') {
    return jsonError(
      429,
      'RATE_LIMITED',
      '요청이 몰려 잠시 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
    )
  }
  if (result.status === 'failed') {
    return jsonError(
      502,
      'UPSTREAM_ERROR',
      '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    )
  }

  const difficulty = clampDifficulty(result.data.difficulty)
  if (difficulty === null || !result.data.difficultyReason) {
    return jsonError(
      502,
      'UPSTREAM_ERROR',
      '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    )
  }

  return Response.json({ difficulty, difficultyReason: result.data.difficultyReason })
}

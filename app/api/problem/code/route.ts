import { z } from 'zod'
import { getCatalogEntry } from '@/lib/algorithm-catalog'
import { generatePartialSafe } from '@/lib/ai'
import { MAX_PROBLEM_LENGTH } from '@/lib/request-timing'

export const runtime = 'nodejs'

const CodeOnlySchema = z.object({
  code: z.string().min(1),
})

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: code, message }, { status })
}

function readString(body: unknown, key: string): string {
  return typeof body === 'object' && body !== null && key in body
    ? String((body as Record<string, unknown>)[key] ?? '')
    : ''
}

// /api/problem 초기 응답에는 추천 풀이의 C++ 코드만 담는다(응답 지연 완화, 5.19와 동일한
// 온디맨드 패턴). 나머지 풀이 탭을 열거나 추천 풀이 코드 생성이 실패해 재시도할 때 이 라우트로
// 문제/풀이 맥락을 그대로 다시 보내 해당 풀이 하나의 코드만 생성한다.
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, 'INVALID_INPUT', '요청 본문을 읽을 수 없습니다.')
  }

  const problem = readString(body, 'problem').trim()
  const algorithmId = readString(body, 'algorithmId').trim()
  const label = readString(body, 'label').trim()
  const explanation = readString(body, 'explanation').trim()

  if (!problem || !algorithmId || !label || !explanation) {
    return jsonError(400, 'INVALID_INPUT', '요청 값이 올바르지 않습니다.')
  }
  if (problem.length > MAX_PROBLEM_LENGTH) {
    return jsonError(
      400,
      'TOO_LONG',
      `문제 설명은 ${MAX_PROBLEM_LENGTH}자 이내로 입력해주세요.`,
    )
  }

  const entry = getCatalogEntry(algorithmId)
  const algoName = entry?.name ?? label

  const result = await generatePartialSafe(
    CodeOnlySchema,
    `당신은 알고리즘 교육 콘텐츠 작성자입니다. 아래 문제를 "${algoName}"(${label}) 풀이로 해결하는 예시 코드를 C++로 작성하세요.

문제: ${problem}

풀이 설명: ${explanation}

코드는 그대로 컴파일/실행 가능한 수준이어야 하며, 핵심 로직에 짧은 한국어 주석을 답니다. 코드 외의 설명은 포함하지 마세요.`,
  )

  if (result.status === 'rate-limited') {
    return jsonError(
      429,
      'RATE_LIMITED',
      '요청이 몰려 잠시 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
    )
  }
  if (result.status === 'failed' || !result.data.code) {
    return jsonError(
      502,
      'UPSTREAM_ERROR',
      '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    )
  }

  return Response.json({ code: result.data.code })
}

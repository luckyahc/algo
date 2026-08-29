import { ALGORITHM_CATALOG } from '@/lib/algorithm-catalog'
import { CATALOG_ID_LIST, DIFFICULTY_SCALE_PROMPT, generatePartialSafe } from '@/lib/ai'
import { MAX_PROBLEM_LENGTH } from '@/lib/request-timing'
import { clampDifficulty, ProblemAnalysisSchema } from '@/lib/schemas'
import { hasMeaningfulContent } from '@/lib/validation'

export const runtime = 'nodejs'

function jsonError(
  status: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>,
) {
  return Response.json({ error: code, message, ...extra }, { status })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, 'INVALID_INPUT', '요청 본문을 읽을 수 없습니다.')
  }

  const description =
    typeof body === 'object' && body !== null && 'description' in body
      ? String((body as { description: unknown }).description ?? '')
      : ''
  const trimmed = description.trim()

  if (!trimmed) {
    return jsonError(400, 'INVALID_INPUT', '검색어를 입력해주세요.')
  }

  if (trimmed.length > MAX_PROBLEM_LENGTH) {
    return jsonError(
      400,
      'TOO_LONG',
      `문제 설명은 ${MAX_PROBLEM_LENGTH}자 이내로 입력해주세요.`,
    )
  }

  if (!hasMeaningfulContent(trimmed)) {
    return jsonError(
      400,
      'MEANINGLESS_INPUT',
      '문제 내용을 조금 더 구체적으로 입력해주세요.',
    )
  }

  const result = await generatePartialSafe(
    ProblemAnalysisSchema,
    `당신은 알고리즘 코딩테스트 문제 분석가입니다. 아래 문제를 분석해 한국어로 응답하세요.

문제: ${trimmed}

작성 지침:
- ${DIFFICULTY_SCALE_PROMPT}
- difficultyReason: 그 난이도로 판단한 근거를 2~3문장으로 설명한다.
- matched: 이 문제가 아래 카탈로그의 알고리즘 중 하나 이상으로 명확히 풀 수 있으면 true, 문제 자체가 불명확하거나 특정 알고리즘과 뚜렷하게 연결되지 않으면 false로 판단한다.
- solutions: matched가 true일 때만 채운다. 서로 다른 풀이 방법이 여러 개 있으면(예: 그리디 vs DP) 최대 5개까지 모두 적되, 각 풀이마다 다음을 포함한다.
  - algorithmId: 아래 카탈로그 id 목록 중 정확히 하나만 사용한다. 목록에 없는 id는 절대 만들지 않는다.
  - label: 예) "풀이 1 · 그리디"
  - explanation: 문제의 어느 부분이 이 알고리즘을 써야 함을 암시하는지 구체적으로 설명한다.
  - timeComplexity: 예) "O(N log N)"
  - recommended: 가장 효율적이거나 널리 쓰이는 풀이 하나에만 true를 준다(나머지는 false).
  - code: recommended가 true인 풀이 딱 하나에만, 그 알고리즘으로 이 문제를 실제로 푸는 실행 가능한 C++ 코드를 작성한다(핵심 로직에 짧은 한국어 주석 포함, 코드 외 설명 금지). 나머지 풀이는 code를 null로 둔다.
- matched가 false이면 solutions는 빈 배열로 둔다.

카탈로그 id 목록:
${CATALOG_ID_LIST}`,
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

  const data = result.data

  // 카탈로그에 없는 algorithmId를 참조하는 풀이는 버린다 (PRD 5.9와 동일한 원칙).
  let solutions = (data.solutions ?? []).filter((s) =>
    ALGORITHM_CATALOG.some((a) => a.id === s.algorithmId),
  )
  // 필터링으로 추천 풀이가 사라졌다면 첫 번째 풀이를 기본 탭으로 승격한다.
  if (solutions.length > 0 && !solutions.some((s) => s.recommended)) {
    solutions = solutions.map((s, i) => ({ ...s, recommended: i === 0 }))
  }
  // 풀이가 모두 걸러졌다면 "매칭 알고리즘 없음"(5.8)과 동일하게 취급한다.
  const matched = Boolean(data.matched) && solutions.length > 0

  return Response.json({
    problem: trimmed,
    difficulty: clampDifficulty(data.difficulty),
    difficultyReason: data.difficultyReason ?? null,
    matched,
    solutions,
  })
}

import { generateObject } from 'ai'
import { ALGORITHM_CATALOG } from '@/lib/algorithm-catalog'
import { CATALOG_ID_LIST, MODEL } from '@/lib/ai'
import { ProblemAnalysisSchema } from '@/lib/schemas'
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

  if (!hasMeaningfulContent(trimmed)) {
    return jsonError(
      400,
      'MEANINGLESS_INPUT',
      '문제 내용을 조금 더 구체적으로 입력해주세요.',
    )
  }

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: ProblemAnalysisSchema,
      prompt: `당신은 알고리즘 코딩테스트 문제 분석가입니다. 아래 문제를 분석해 한국어로 응답하세요.

문제: ${trimmed}

작성 지침:
- difficulty: 학부 알고리즘 수업/코딩테스트 기준으로 "하", "중", "상" 중 하나를 판단한다.
- difficultyReason: 그 난이도로 판단한 근거를 2~3문장으로 설명한다.
- matched: 이 문제가 아래 카탈로그의 알고리즘 중 하나 이상으로 명확히 풀 수 있으면 true, 문제 자체가 불명확하거나 특정 알고리즘과 뚜렷하게 연결되지 않으면 false로 판단한다.
- solutions: matched가 true일 때만 채운다. 서로 다른 풀이 방법이 여러 개 있으면(예: 그리디 vs DP) 최대 5개까지 모두 적되, 각 풀이마다 다음을 포함한다.
  - algorithmId: 아래 카탈로그 id 목록 중 정확히 하나만 사용한다. 목록에 없는 id는 절대 만들지 않는다.
  - label: 예) "풀이 1 · 그리디"
  - explanation: 문제의 어느 부분이 이 알고리즘을 써야 함을 암시하는지 구체적으로 설명한다.
  - timeComplexity: 예) "O(N log N)"
  - recommended: 가장 효율적이거나 널리 쓰이는 풀이 하나에만 true를 준다(나머지는 false).
- matched가 false이면 solutions는 빈 배열로 둔다.

카탈로그 id 목록:
${CATALOG_ID_LIST}`,
    })

    // 카탈로그에 없는 algorithmId를 참조하는 풀이는 버린다 (PRD 5.9와 동일한 원칙).
    let solutions = object.solutions.filter((s) =>
      ALGORITHM_CATALOG.some((a) => a.id === s.algorithmId),
    )
    // 필터링으로 추천 풀이가 사라졌다면 첫 번째 풀이를 기본 탭으로 승격한다.
    if (solutions.length > 0 && !solutions.some((s) => s.recommended)) {
      solutions = solutions.map((s, i) => ({ ...s, recommended: i === 0 }))
    }
    // 풀이가 모두 걸러졌다면 "매칭 알고리즘 없음"(5.8)과 동일하게 취급한다.
    const matched = object.matched && solutions.length > 0

    return Response.json({
      problem: trimmed,
      difficulty: object.difficulty,
      difficultyReason: object.difficultyReason,
      matched,
      solutions,
    })
  } catch (err) {
    console.error('[api/problem] generation failed', err)
    return jsonError(
      502,
      'UPSTREAM_ERROR',
      '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    )
  }
}

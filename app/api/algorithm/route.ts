import { generateObject } from 'ai'
import {
  ALGORITHM_CATALOG,
  findClosestEntries,
  findExactMatch,
} from '@/lib/algorithm-catalog'
import { CATALOG_ID_LIST, MODEL } from '@/lib/ai'
import { AlgorithmDetailSchema } from '@/lib/schemas'

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

  const name =
    typeof body === 'object' && body !== null && 'name' in body
      ? String((body as { name: unknown }).name ?? '')
      : ''
  const trimmed = name.trim()

  if (!trimmed) {
    return jsonError(400, 'INVALID_INPUT', '검색어를 입력해주세요.')
  }

  const entry = findExactMatch(trimmed)
  if (!entry) {
    return jsonError(
      404,
      'NOT_FOUND',
      '일치하는 알고리즘을 찾을 수 없어요. 목록에서 선택해주세요.',
      { suggestions: findClosestEntries(trimmed, 5) },
    )
  }

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: AlgorithmDetailSchema,
      prompt: `당신은 알고리즘 교육 콘텐츠 작성자입니다. 아래 알고리즘에 대해 한국어로 응답하세요.

알고리즘: ${entry.name} (카테고리: ${entry.category})

작성 지침:
- description: 이 알고리즘의 동작 원리를 다른 알고리즘과 혼동되지 않을 만큼 구체적으로 3~5문장으로 설명한다.
- difficulty: 학부 알고리즘 수업/코딩테스트 기준으로 "하", "중", "상" 중 하나를 판단한다.
- difficultyReason: 그 난이도로 판단한 근거를 2~3문장으로 설명한다.
- useCases: 이 알고리즘이 실제로 적용되는 문제 유형을 3~5개 나열한다.
- code: C, C++, Java, Python 네 언어 모두로 이 알고리즘을 구현한 예시 코드를 작성한다. 각 코드는 그대로 컴파일/실행 가능한 수준이어야 하며, 핵심 로직에 짧은 한국어 주석을 단다.
- related: 아래 카탈로그 id 목록 중에서만 골라, 이 알고리즘과 실제로 관련 있는 항목을 최대 6개 적는다. "${entry.id}"(자기 자신)는 절대 포함하지 않는다.

카탈로그 id 목록:
${CATALOG_ID_LIST}`,
    })

    const related = object.related.filter(
      (id) => id !== entry.id && ALGORITHM_CATALOG.some((a) => a.id === id),
    )

    return Response.json({
      id: entry.id,
      name: entry.name,
      category: entry.category,
      ...object,
      related,
    })
  } catch (err) {
    console.error('[api/algorithm] generation failed', err)
    return jsonError(
      502,
      'UPSTREAM_ERROR',
      '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    )
  }
}

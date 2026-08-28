import { z } from 'zod'
import { getCatalogEntry } from '@/lib/algorithm-catalog'
import { generatePartialSafe } from '@/lib/ai'
import { LANGUAGES, LANGUAGE_LABELS, type LanguageKey } from '@/lib/schemas'

export const runtime = 'nodejs'

const CodeOnlySchema = z.object({
  code: z.string().min(1),
})

function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: code, message }, { status })
}

function isLanguageKey(value: unknown): value is LanguageKey {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value)
}

// PRD 5.19: 특정 언어의 예시 코드만 다시 생성한다 (탭 안의 재시도 아이콘용).
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError(400, 'INVALID_INPUT', '요청 본문을 읽을 수 없습니다.')
  }

  const algorithmId =
    typeof body === 'object' && body !== null && 'algorithmId' in body
      ? String((body as { algorithmId: unknown }).algorithmId ?? '')
      : ''
  const lang =
    typeof body === 'object' && body !== null && 'lang' in body
      ? (body as { lang: unknown }).lang
      : undefined

  if (!algorithmId || !isLanguageKey(lang)) {
    return jsonError(400, 'INVALID_INPUT', '요청 값이 올바르지 않습니다.')
  }

  const entry = getCatalogEntry(algorithmId)
  if (!entry) {
    return jsonError(404, 'NOT_FOUND', '일치하는 알고리즘을 찾을 수 없어요.')
  }

  const result = await generatePartialSafe(
    CodeOnlySchema,
    `당신은 알고리즘 교육 콘텐츠 작성자입니다. "${entry.name}" 알고리즘을 ${LANGUAGE_LABELS[lang]}로 구현한 예시 코드를 작성하세요.
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

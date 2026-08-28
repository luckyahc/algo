import { generateObject, NoObjectGeneratedError } from 'ai'
import type { z } from 'zod'
import { ALGORITHM_CATALOG } from '@/lib/algorithm-catalog'

// Vercel AI Gateway를 통해 호출한다 ("provider/model" 문자열 = 기본 provider).
export const MODEL = 'anthropic/claude-sonnet-5'

// AI가 related/algorithmId 필드에서 참조할 수 있는 유효 id 목록을 프롬프트에 함께 넣는다.
export const CATALOG_ID_LIST = ALGORITHM_CATALOG.map(
  (a) => `${a.id}: ${a.name}`,
).join('\n')

export type GenerationResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'partial'; data: Partial<T> }
  | { status: 'failed' }

/**
 * generateObject를 호출하되, 스키마 검증에 완전히 실패해도 바로 포기하지 않는다.
 * 모델이 반환한 원문(NoObjectGeneratedError.text)을 JSON으로 다시 파싱한 뒤,
 * 필드 하나하나를 그 필드의 스키마로 개별 검증해 통과하는 필드만 건져낸다.
 * (필드 전체를 한 번에 `.partial().safeParse()`하면 다른 필드 하나가 깨졌을 때
 * 전체가 실패로 취급되어 버리므로, 반드시 필드 단위로 따로 검사한다.)
 * PRD 5.7 — "설명은 있는데 예시코드가 없음"처럼 부분적으로만 파싱 가능한 경우,
 * 있는 필드만 표시하고 나머지는 null로 내려 화면에서 placeholder로 대체한다.
 */
export async function generatePartialSafe<Schema extends z.ZodObject<z.ZodRawShape>>(
  schema: Schema,
  prompt: string,
): Promise<GenerationResult<z.infer<Schema>>> {
  try {
    const { object } = await generateObject({ model: MODEL, schema, prompt })
    return { status: 'ok', data: object as z.infer<Schema> }
  } catch (err) {
    if (NoObjectGeneratedError.isInstance(err) && err.text) {
      try {
        const raw = JSON.parse(err.text) as Record<string, unknown>
        const salvaged: Record<string, unknown> = {}
        for (const [key, fieldSchema] of Object.entries(schema.shape)) {
          if (!(key in raw)) continue
          const fieldResult = (fieldSchema as z.ZodTypeAny).safeParse(raw[key])
          if (fieldResult.success) salvaged[key] = fieldResult.data
        }
        if (Object.keys(salvaged).length > 0) {
          return { status: 'partial', data: salvaged as Partial<z.infer<Schema>> }
        }
      } catch {
        // 모델이 준 텍스트조차 JSON이 아니었다 — 건질 것이 없다.
      }
    }
    console.error('[generatePartialSafe] generation failed', err)
    return { status: 'failed' }
  }
}

import { ALGORITHM_CATALOG } from '@/lib/algorithm-catalog'

// Vercel AI Gateway를 통해 호출한다 ("provider/model" 문자열 = 기본 provider).
export const MODEL = 'anthropic/claude-sonnet-5'

// AI가 related/algorithmId 필드에서 참조할 수 있는 유효 id 목록을 프롬프트에 함께 넣는다.
export const CATALOG_ID_LIST = ALGORITHM_CATALOG.map(
  (a) => `${a.id}: ${a.name}`,
).join('\n')

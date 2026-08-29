import { DIFFICULTY_MAX, DIFFICULTY_MIN, type Difficulty } from '@/lib/schemas'
import { cn } from '@/lib/utils'

// 1~10을 5개 구간으로 묶어 짧은 한글 티어명을 붙인다. 색상은 구간이 아니라 레벨 하나하나마다
// app/globals.css의 --diff-N-bg/-fg 그라데이션(10단계, 초록→빨강)을 그대로 쓴다.
const TIER_LABELS: [max: number, label: string][] = [
  [2, '입문'],
  [4, '초급'],
  [6, '중급'],
  [8, '고급'],
  [10, '최상급'],
]

function tierLabel(level: number): string {
  return TIER_LABELS.find(([max]) => level <= max)?.[1] ?? '최상급'
}

export function DifficultyBadge({
  level,
  loading,
  className,
}: {
  level: Difficulty | null
  // 최초 응답에서 난이도만 빠졌을 때 /api/difficulty로 조용히 자동 재요청하는 동안 true.
  // "정보 없음"으로 단정짓지 않고 확인 중임을 보여준다 — 거의 항상 채워지고 끝난다.
  loading?: boolean
  className?: string
}) {
  if (loading) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold tracking-tight text-muted-foreground',
          className,
        )}
      >
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground" aria-hidden />
        난이도 확인 중...
      </span>
    )
  }

  // PRD 5.7: 난이도 필드가 파싱에 실패하면 null로 내려온다. 자동 재요청(loading)까지 실패한
  // 경우에만 여기로 와서 카드 전체를 죽이지 않고 이 배지만 "준비되지 않음" 상태로 보여준다.
  if (level === null) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold tracking-tight text-muted-foreground',
          className,
        )}
      >
        난이도 정보 없음
      </span>
    )
  }

  // 방어적 클램프 — 서버가 clampDifficulty로 이미 1~10에 가두지만, 표시 직전에도 한 번 더.
  const clamped = Math.min(DIFFICULTY_MAX, Math.max(DIFFICULTY_MIN, Math.round(level)))

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight',
        className,
      )}
      style={{
        backgroundColor: `var(--diff-${clamped}-bg)`,
        color: `var(--diff-${clamped}-fg)`,
      }}
    >
      난이도 · {tierLabel(clamped)} ({clamped}/10)
    </span>
  )
}

export function ComplexityBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 font-mono text-xs font-medium text-secondary-foreground">
      <span className="text-muted-foreground">시간복잡도</span>
      {value}
    </span>
  )
}

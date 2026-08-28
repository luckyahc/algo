import type { Difficulty } from '@/lib/schemas'
import { cn } from '@/lib/utils'

const STYLES: Record<Difficulty, string> = {
  하: 'bg-easy text-easy-foreground',
  중: 'bg-medium text-medium-foreground',
  상: 'bg-hard text-hard-foreground',
}

const LABELS: Record<Difficulty, string> = {
  하: '난이도 · 하',
  중: '난이도 · 중',
  상: '난이도 · 상',
}

export function DifficultyBadge({
  level,
  className,
}: {
  level: Difficulty | null
  className?: string
}) {
  // PRD 5.7: 난이도 필드가 파싱에 실패하면 null로 내려온다 — 카드 전체를 죽이지 않고
  // 이 배지만 "준비되지 않음" 상태로 보여준다.
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

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight',
        STYLES[level],
        className,
      )}
    >
      {LABELS[level]}
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

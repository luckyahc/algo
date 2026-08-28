import type { Difficulty } from '@/lib/algorithms'
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
  level: Difficulty
  className?: string
}) {
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

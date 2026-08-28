'use client'

import { ArrowRight, Info, ListChecks, Sparkles } from 'lucide-react'
import { type Algorithm, getAlgorithm } from '@/lib/algorithms'
import { CodeBlock } from '@/components/code-block'
import { CopyButton } from '@/components/copy-button'
import { ComplexityBadge, DifficultyBadge } from '@/components/difficulty-badge'

function Card({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`relative rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 ${className ?? ''}`}
    >
      {children}
    </section>
  )
}

export function AlgorithmResult({
  algo,
  onSelectRelated,
}: {
  algo: Algorithm
  onSelectRelated: (algo: Algorithm) => void
}) {
  const related = algo.related
    .map((id) => getAlgorithm(id))
    .filter((a): a is Algorithm => Boolean(a))

  return (
    <div className="flex flex-col gap-4">
      {/* 1. 이름 + 설명 */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-primary">
              {algo.category}
            </span>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground">
              {algo.name}
            </h2>
          </div>
          <CopyButton text={`${algo.name}\n\n${algo.description}`} label="설명" />
        </div>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          {algo.description}
        </p>
      </Card>

      {/* 2. 난이도 */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge level={algo.difficulty} />
              <ComplexityBadge value={algo.timeComplexity} />
            </div>
            <div className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-pretty">{algo.difficultyReason}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. 사용처 */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="size-4.5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            사용처 · 적용 가능한 문제
          </h3>
        </div>
        <ul className="flex flex-col gap-2">
          {algo.useCases.map((use, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 rounded-lg bg-secondary/60 px-3 py-2.5 text-sm text-secondary-foreground"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-[11px] font-semibold text-primary">
                {i + 1}
              </span>
              <span className="text-pretty leading-relaxed">{use}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* 4. 예시 코드 */}
      <Card className="overflow-hidden">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4.5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">예시 코드</h3>
          </div>
          <CopyButton text={algo.code.source} label="코드" />
        </div>
        <CodeBlock source={algo.code.source} label={algo.code.label} />
      </Card>

      {/* 관련 알고리즘 */}
      {related.length > 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            관련된 알고리즘 보기
          </h3>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRelated(r)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
              >
                {r.name}
                <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

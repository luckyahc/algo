'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Info, Lightbulb, Puzzle, SearchX } from 'lucide-react'
import { getCatalogEntry } from '@/lib/algorithm-catalog'
import type { ProblemResultData } from '@/lib/schemas'
import { CopyButton } from '@/components/copy-button'
import { ComplexityBadge, DifficultyBadge } from '@/components/difficulty-badge'
import { cn } from '@/lib/utils'

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

function defaultSolutionIndex(result: ProblemResultData) {
  const i = result.solutions.findIndex((s) => s.recommended)
  return i === -1 ? 0 : i
}

export function ProblemResult({
  result,
  onGoToAlgorithm,
}: {
  result: ProblemResultData
  onGoToAlgorithm: (algorithmId: string) => void
}) {
  const [activeSol, setActiveSol] = useState(() => defaultSolutionIndex(result))

  // 새 검색 결과가 들어오면 추천 풀이 탭으로 다시 초기화한다.
  useEffect(() => {
    setActiveSol(defaultSolutionIndex(result))
  }, [result])

  const hasSolution = result.matched && result.solutions.length > 0
  const solution = hasSolution ? result.solutions[activeSol] : undefined
  const targetAlgo = solution ? getCatalogEntry(solution.algorithmId) : undefined

  return (
    <div className="flex flex-col gap-4">
      {/* 1. 문제 설명 */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Puzzle className="size-4.5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">입력한 문제</h2>
          </div>
          <CopyButton text={result.problem} label="문제" />
        </div>
        <p className="mt-3 text-pretty leading-relaxed text-foreground">
          {result.problem}
        </p>
      </Card>

      {/* 2. 난이도 */}
      <Card>
        <div className="flex flex-col gap-3">
          <DifficultyBadge level={result.difficulty} />
          <div className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-pretty">{result.difficultyReason}</p>
          </div>
        </div>
      </Card>

      {/* 3. 어떤 알고리즘을 써야 하는지 */}
      {hasSolution && solution ? (
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="size-4.5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                어떤 알고리즘을 써야 할까?
              </h3>
            </div>
            <CopyButton
              text={`${solution.label}\n\n${solution.explanation}\n\n시간복잡도: ${solution.timeComplexity}`}
              label="풀이"
            />
          </div>

          {/* 풀이 서브탭 */}
          {result.solutions.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-1.5 rounded-xl bg-secondary p-1">
              {result.solutions.map((sol, i) => (
                <button
                  key={`${sol.algorithmId}-${i}`}
                  type="button"
                  onClick={() => setActiveSol(i)}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    i === activeSol
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {sol.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <ComplexityBadge value={solution.timeComplexity} />
            <p className="text-pretty leading-relaxed text-muted-foreground">
              {solution.explanation}
            </p>
          </div>

          {/* 알고리즘 보러가기 */}
          {targetAlgo && (
            <button
              type="button"
              onClick={() => onGoToAlgorithm(targetAlgo.id)}
              className="group mt-5 inline-flex w-full items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-left transition-colors hover:bg-primary/10 sm:w-auto"
            >
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  이 풀이의 핵심 알고리즘
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {targetAlgo.name} 보러가기
                </span>
              </span>
              <ArrowRight className="size-4.5 text-primary transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </Card>
      ) : (
        // PRD 5.8: 매칭되는 알고리즘이 없어도 오류가 아닌 정상 결과로 취급한다.
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
          <SearchX className="size-6 text-muted-foreground" />
          <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            이 문제에 뚜렷하게 대응하는 알고리즘을 찾지 못했어요. 문제 설명을 더
            구체적으로 입력해보세요.
          </p>
        </div>
      )}
    </div>
  )
}

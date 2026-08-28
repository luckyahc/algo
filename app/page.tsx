'use client'

import { useRef, useState } from 'react'
import { Binary, Search, SendHorizonal } from 'lucide-react'
import {
  type Algorithm,
  getAlgorithm,
  MOCK_PROBLEM_RESULT,
  type ProblemResult as ProblemResultType,
} from '@/lib/algorithms'
import { AlgorithmCombobox } from '@/components/algorithm-combobox'
import { AlgorithmResult } from '@/components/algorithm-result'
import { ProblemResult } from '@/components/problem-result'
import {
  ErrorState,
  IdleState,
  LoadingState,
} from '@/components/result-states'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

type Tab = 'algorithm' | 'problem'
type Status = 'idle' | 'loading' | 'success' | 'error'

export default function Home() {
  const [tab, setTab] = useState<Tab>('algorithm')
  const [status, setStatus] = useState<Status>('idle')
  const [algoResult, setAlgoResult] = useState<Algorithm | null>(null)
  const [problemResult, setProblemResult] = useState<ProblemResultType | null>(
    null,
  )
  const [problemText, setProblemText] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastAction = useRef<(() => void) | null>(null)

  function runWithLoading(action: () => void) {
    if (timer.current) clearTimeout(timer.current)
    lastAction.current = () => runWithLoading(action)
    setStatus('loading')
    timer.current = setTimeout(() => {
      action()
      setStatus('success')
    }, 650)
  }

  function selectAlgorithm(algo: Algorithm) {
    setTab('algorithm')
    runWithLoading(() => setAlgoResult(algo))
  }

  function goToAlgorithm(id: string) {
    const algo = getAlgorithm(id)
    if (!algo) return
    setTab('algorithm')
    runWithLoading(() => setAlgoResult(algo))
  }

  function searchProblem() {
    if (!problemText.trim()) return
    runWithLoading(() => setProblemResult(MOCK_PROBLEM_RESULT))
  }

  function switchTab(next: Tab) {
    if (next === tab) return
    setTab(next)
    if (status === 'loading') return
    const hasResult = next === 'algorithm' ? algoResult : problemResult
    setStatus(hasResult ? 'success' : 'idle')
  }

  const statusMeta: Record<Status, { label: string; dot: string }> = {
    idle: { label: '대기 중', dot: 'bg-muted-foreground/50' },
    loading: { label: '불러오는 중', dot: 'bg-medium-foreground animate-pulse' },
    success: { label: '결과 표시됨', dot: 'bg-easy-foreground' },
    error: { label: '오류 발생', dot: 'bg-destructive' },
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        {/* 헤더 */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Binary className="size-5.5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                algo
              </h1>
              <p className="text-xs text-muted-foreground">알고리즘 학습 도우미</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* 입력부 */}
        <div className="flex flex-col gap-4">
          {/* 탭 */}
          <div
            role="tablist"
            aria-label="검색 방식"
            className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-sm"
          >
            <button
              role="tab"
              aria-selected={tab === 'algorithm'}
              onClick={() => switchTab('algorithm')}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                tab === 'algorithm'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Search className="size-4" />
              알고리즘 검색
            </button>
            <button
              role="tab"
              aria-selected={tab === 'problem'}
              onClick={() => switchTab('problem')}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                tab === 'problem'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <SendHorizonal className="size-4" />
              문제 검색
            </button>
          </div>

          {/* 입력 필드 */}
          {tab === 'algorithm' ? (
            <AlgorithmCombobox onSelect={selectAlgorithm} />
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                rows={5}
                placeholder="풀고 싶은 문제 상황을 자유롭게 적어보세요. 예) 정렬된 수열에서 합이 특정 값이 되는 두 수를 찾고 싶어요."
                className="w-full resize-y rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="button"
                onClick={searchProblem}
                disabled={!problemText.trim()}
                className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SendHorizonal className="size-4" />
                어떤 알고리즘인지 찾기
              </button>
            </div>
          )}
        </div>

        {/* 결과부 */}
        <div className="flex flex-col gap-4">
          {/* 상태 표시줄 */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span
                className={cn('size-2 rounded-full', statusMeta[status].dot)}
                aria-hidden
              />
              <span className="text-sm font-medium text-foreground">
                {statusMeta[status].label}
              </span>
            </div>
            {/* 디자인 초안용 상태 미리보기 */}
            <div className="flex items-center gap-1 rounded-lg bg-secondary p-0.5">
              <span className="px-1.5 text-[11px] text-muted-foreground">
                상태 미리보기
              </span>
              {(['idle', 'loading', 'error'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (timer.current) clearTimeout(timer.current)
                    setStatus(s)
                  }}
                  className={cn(
                    'rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors',
                    status === s
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 상태별 콘텐츠 */}
          {status === 'idle' && <IdleState />}
          {status === 'loading' && <LoadingState />}
          {status === 'error' && (
            <ErrorState
              onRetry={() => {
                if (lastAction.current) lastAction.current()
                else setStatus('idle')
              }}
            />
          )}
          {status === 'success' &&
            (tab === 'algorithm' ? (
              algoResult ? (
                <AlgorithmResult
                  algo={algoResult}
                  onSelectRelated={selectAlgorithm}
                />
              ) : (
                <IdleState />
              )
            ) : problemResult ? (
              <ProblemResult
                result={problemResult}
                onGoToAlgorithm={goToAlgorithm}
              />
            ) : (
              <IdleState />
            ))}
        </div>

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          모든 데이터는 학습용 예시(mock)이며 실제 판단과 다를 수 있습니다.
        </footer>
      </div>
    </div>
  )
}

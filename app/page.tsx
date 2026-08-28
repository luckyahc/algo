'use client'

import { useRef, useState } from 'react'
import { Binary, Search, SendHorizonal } from 'lucide-react'
import {
  type CatalogEntry,
  findExactMatch,
  getCatalogEntry,
} from '@/lib/algorithm-catalog'
import type {
  AlgorithmResultData,
  LanguageKey,
  ProblemResultData,
} from '@/lib/schemas'
import { hasMeaningfulContent } from '@/lib/validation'
import { AlgorithmCombobox } from '@/components/algorithm-combobox'
import { AlgorithmResult } from '@/components/algorithm-result'
import { ProblemResult } from '@/components/problem-result'
import {
  ErrorState,
  IdleState,
  InvalidInputState,
  LoadingState,
} from '@/components/result-states'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

type Tab = 'algorithm' | 'problem'
type Status = 'idle' | 'loading' | 'success' | 'error' | 'invalid'

export default function Home() {
  const [tab, setTab] = useState<Tab>('algorithm')
  const [status, setStatus] = useState<Status>('idle')
  const [query, setQuery] = useState('')
  const [algoResult, setAlgoResult] = useState<AlgorithmResultData | null>(null)
  const [problemResult, setProblemResult] = useState<ProblemResultData | null>(
    null,
  )
  const [problemText, setProblemText] = useState('')
  // 최초 진입 시 C++ 기본, 이후 선택한 언어는 세션 동안 유지된다 (PRD 3.2).
  const [preferredLang, setPreferredLang] = useState<LanguageKey>('cpp')
  const lastAction = useRef<(() => void) | null>(null)

  const isLoading = status === 'loading'

  async function runAlgorithmFetch(entry: CatalogEntry) {
    lastAction.current = () => runAlgorithmFetch(entry)
    setStatus('loading')
    try {
      const res = await fetch('/api/algorithm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: entry.name }),
      })
      if (!res.ok) {
        if (res.status === 404) {
          setStatus('invalid')
          return
        }
        setStatus('error')
        return
      }
      const data = (await res.json()) as AlgorithmResultData
      setAlgoResult(data)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  function selectAlgorithm(entry: CatalogEntry) {
    setTab('algorithm')
    setQuery(entry.name)
    runAlgorithmFetch(entry)
  }

  function handleAlgorithmSubmit(raw: string) {
    if (isLoading) return
    const trimmed = raw.trim()
    if (!trimmed) return // 빈 입력 처리(문구/포커스 강조)는 Sprint 3에서 보강
    const entry = findExactMatch(trimmed)
    if (!entry) {
      setStatus('invalid')
      return
    }
    selectAlgorithm(entry)
  }

  // 관련 알고리즘 / "사용해야 되는 알고리즘" 버튼 클릭 공통 처리.
  // 서버가 이미 카탈로그에 없는 id는 걸러서 내려주지만(5.10), 방어적으로 한 번 더
  // 유효성을 검증한다 — 무효하면 5.3과 동일한 상태로 전환한다 (PRD 5.9).
  function goToAlgorithm(id: string, rawName?: string) {
    const entry = getCatalogEntry(id)
    setTab('algorithm')
    if (!entry) {
      setQuery(rawName ?? id)
      setStatus('invalid')
      return
    }
    selectAlgorithm(entry)
  }

  async function runProblemFetch(description: string) {
    lastAction.current = () => runProblemFetch(description)
    setStatus('loading')
    try {
      const res = await fetch('/api/problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
      if (!res.ok) {
        if (res.status === 400) {
          setStatus('invalid')
          return
        }
        setStatus('error')
        return
      }
      const data = (await res.json()) as ProblemResultData
      setProblemResult(data)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  function searchProblem() {
    if (isLoading) return
    const trimmed = problemText.trim()
    if (!trimmed) return // 빈 입력 처리(문구/포커스 강조)는 Sprint 3에서 보강
    if (!hasMeaningfulContent(trimmed)) {
      setStatus('invalid') // "문제 내용을 조금 더 구체적으로 입력해주세요" (PRD 5.2)
      return
    }
    runProblemFetch(trimmed)
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
    invalid: { label: '검색어 확인 필요', dot: 'bg-medium-foreground' },
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
            <AlgorithmCombobox
              value={query}
              onValueChange={setQuery}
              onSelect={selectAlgorithm}
              onSubmit={handleAlgorithmSubmit}
              disabled={isLoading}
            />
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                rows={5}
                disabled={isLoading}
                placeholder="풀고 싶은 문제 상황을 자유롭게 적어보세요. 예) 정렬된 수열에서 합이 특정 값이 되는 두 수를 찾고 싶어요."
                className="w-full resize-y rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                onClick={searchProblem}
                disabled={isLoading || !problemText.trim()}
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
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span
              className={cn('size-2 rounded-full', statusMeta[status].dot)}
              aria-hidden
            />
            <span className="text-sm font-medium text-foreground">
              {statusMeta[status].label}
            </span>
          </div>

          {/* 상태별 콘텐츠 */}
          {status === 'idle' && <IdleState />}
          {status === 'loading' && <LoadingState />}
          {status === 'invalid' && tab === 'algorithm' && (
            <InvalidInputState
              title="일치하는 알고리즘을 찾을 수 없어요"
              description="위 검색창의 자동완성 목록에서 원하는 알고리즘을 선택해주세요."
            />
          )}
          {status === 'invalid' && tab === 'problem' && (
            <InvalidInputState
              title="문제 내용을 조금 더 구체적으로 입력해주세요"
              description="공백이나 의미 없는 문자만으로는 어떤 알고리즘이 필요한지 판단할 수 없어요."
            />
          )}
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
                  activeLang={preferredLang}
                  onChangeLang={setPreferredLang}
                  onSelectRelated={goToAlgorithm}
                />
              ) : (
                <IdleState />
              )
            ) : problemResult ? (
              <ProblemResult
                result={problemResult}
                onGoToAlgorithm={(id) => goToAlgorithm(id)}
              />
            ) : (
              <IdleState />
            ))}
        </div>

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          모든 설명은 AI가 생성하며 실제와 다를 수 있습니다.
        </footer>
      </div>
    </div>
  )
}

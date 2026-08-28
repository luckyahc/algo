'use client'

import { useEffect, useRef, useState } from 'react'
import { Binary, Search, SendHorizonal } from 'lucide-react'
import {
  type CatalogEntry,
  findExactMatch,
  getCatalogEntry,
} from '@/lib/algorithm-catalog'
import {
  MAX_PROBLEM_LENGTH,
  REQUEST_TIMEOUT_MS,
  SLOW_AFTER_MS,
} from '@/lib/request-timing'
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
  OfflineState,
} from '@/components/result-states'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

type Tab = 'algorithm' | 'problem'

// 요청이 실제로 어느 단계에 있는지. UI에 바로 노출되는 상태는 아니다 —
// 오프라인/입력오류와 조합해 아래 getDisplay()가 최종 표시 상태를 계산한다 (PRD 5.18).
type RequestPhase = 'idle' | 'loading' | 'timeout' | 'server-error' | 'success'

type InputError = { title: string; description: string }

const NOT_FOUND_ERROR: InputError = {
  title: '일치하는 알고리즘을 찾을 수 없어요',
  description: '위 검색창의 자동완성 목록에서 원하는 알고리즘을 선택해주세요.',
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('algorithm')
  const [query, setQuery] = useState('')
  const [algoResult, setAlgoResult] = useState<AlgorithmResultData | null>(null)
  const [problemResult, setProblemResult] = useState<ProblemResultData | null>(
    null,
  )
  const [problemText, setProblemText] = useState('')
  // 최초 진입 시 C++ 기본, 이후 선택한 언어는 세션 동안 유지된다 (PRD 3.2).
  const [preferredLang, setPreferredLang] = useState<LanguageKey>('cpp')
  const [retryingLang, setRetryingLang] = useState<LanguageKey | null>(null)

  const [inputError, setInputError] = useState<InputError | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [requestPhase, setRequestPhase] = useState<RequestPhase>('idle')
  const [isSlow, setIsSlow] = useState(false)

  const lastAction = useRef<(() => void) | null>(null)
  const problemTextareaRef = useRef<HTMLTextAreaElement>(null)

  const isBusy = requestPhase === 'loading'

  // PRD 5.12: 온라인/오프라인 이벤트를 구독한다. 재연결되면 안내만 사라질 뿐
  // 자동으로 재요청하지는 않는다 — 사용자가 직접 다시 시도한다.
  useEffect(() => {
    function update() {
      setIsOffline(!navigator.onLine)
    }
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  // PRD 5.1: 빈 입력으로 검색 시도 시 포커스 이동 + 테두리 강조.
  useEffect(() => {
    if (inputError && tab === 'problem') problemTextareaRef.current?.focus()
  }, [inputError, tab])

  function clearInputError() {
    if (inputError) setInputError(null)
  }

  async function runAlgorithmFetch(entry: CatalogEntry) {
    lastAction.current = () => runAlgorithmFetch(entry)
    setInputError(null)
    setIsSlow(false)
    setRequestPhase('loading')

    const controller = new AbortController()
    let didTimeout = false
    const slowTimer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS)
    const timeoutTimer = setTimeout(() => {
      didTimeout = true
      controller.abort()
    }, REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch('/api/algorithm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: entry.name }),
        signal: controller.signal,
      })
      if (!res.ok) {
        if (res.status === 404) {
          setInputError(NOT_FOUND_ERROR)
          setRequestPhase('idle')
          return
        }
        setRequestPhase('server-error')
        return
      }
      const data = (await res.json()) as AlgorithmResultData
      setAlgoResult(data)
      setRequestPhase('success')
    } catch {
      setRequestPhase(didTimeout ? 'timeout' : 'server-error')
    } finally {
      clearTimeout(slowTimer)
      clearTimeout(timeoutTimer)
    }
  }

  function selectAlgorithm(entry: CatalogEntry) {
    setTab('algorithm')
    setQuery(entry.name)
    runAlgorithmFetch(entry)
  }

  function handleAlgorithmSubmit(raw: string) {
    if (isBusy) return
    const trimmed = raw.trim()
    if (!trimmed) {
      setInputError({
        title: '검색어를 입력해주세요',
        description: '알고리즘 이름을 입력한 뒤 다시 검색해주세요.',
      })
      return
    }
    const entry = findExactMatch(trimmed)
    if (!entry) {
      setInputError(NOT_FOUND_ERROR)
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
      setInputError(NOT_FOUND_ERROR)
      return
    }
    selectAlgorithm(entry)
  }

  async function retryLanguageCode(lang: LanguageKey) {
    if (!algoResult || retryingLang) return
    const algorithmId = algoResult.id
    setRetryingLang(lang)
    try {
      const res = await fetch('/api/algorithm/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithmId, lang }),
      })
      if (!res.ok) return
      const data = (await res.json()) as { code: string }
      setAlgoResult((prev) =>
        prev && prev.id === algorithmId
          ? { ...prev, code: { ...prev.code, [lang]: data.code } }
          : prev,
      )
    } finally {
      setRetryingLang(null)
    }
  }

  async function runProblemFetch(description: string) {
    lastAction.current = () => runProblemFetch(description)
    setInputError(null)
    setIsSlow(false)
    setRequestPhase('loading')

    const controller = new AbortController()
    let didTimeout = false
    const slowTimer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS)
    const timeoutTimer = setTimeout(() => {
      didTimeout = true
      controller.abort()
    }, REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch('/api/problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
        signal: controller.signal,
      })
      if (!res.ok) {
        if (res.status === 400) {
          const body = (await res.json().catch(() => null)) as
            | { message?: string }
            | null
          setInputError({
            title: '문제 내용을 확인해주세요',
            description: body?.message ?? '문제 내용을 조금 더 구체적으로 입력해주세요.',
          })
          setRequestPhase('idle')
          return
        }
        setRequestPhase('server-error')
        return
      }
      const data = (await res.json()) as ProblemResultData
      setProblemResult(data)
      setRequestPhase('success')
    } catch {
      setRequestPhase(didTimeout ? 'timeout' : 'server-error')
    } finally {
      clearTimeout(slowTimer)
      clearTimeout(timeoutTimer)
    }
  }

  function searchProblem() {
    if (isBusy) return
    const trimmed = problemText.trim()
    if (!trimmed) {
      setInputError({
        title: '검색어를 입력해주세요',
        description: '풀고 싶은 문제 상황을 입력한 뒤 다시 검색해주세요.',
      })
      return
    }
    if (trimmed.length > MAX_PROBLEM_LENGTH) {
      setInputError({
        title: '문제 설명이 너무 길어요',
        description: `문제 설명은 ${MAX_PROBLEM_LENGTH}자 이내로 입력해주세요.`,
      })
      return
    }
    if (!hasMeaningfulContent(trimmed)) {
      setInputError({
        title: '문제 내용을 조금 더 구체적으로 입력해주세요',
        description: '공백이나 의미 없는 문자만으로는 어떤 알고리즘이 필요한지 판단할 수 없어요.',
      })
      return
    }
    runProblemFetch(trimmed)
  }

  function switchTab(next: Tab) {
    // 로딩 중에는 탭 전환도 막는다 — requestPhase가 두 탭이 공유하는 단일 상태라,
    // 도중에 다른 탭으로 옮기면 요청이 끝났을 때 엉뚱한 탭에 결과가 표시될 수 있다 (PRD 5.11).
    if (next === tab || isBusy) return
    setTab(next)
    setInputError(null)
    const hasResult = next === 'algorithm' ? algoResult : problemResult
    setRequestPhase(hasResult ? 'success' : 'idle')
  }

  // PRD 5.18 우선순위: 1) 클라이언트 입력 검증 > 2) 오프라인 > 3) 로딩/지연 > 4) 서버 오류.
  // 여러 조건이 동시에 참이어도 이 함수 하나가 항상 하나의 표시 상태만 골라낸다.
  function getDisplay() {
    if (inputError) return { kind: 'input-error' as const }
    if (isOffline) return { kind: 'offline' as const }
    if (requestPhase === 'loading') return { kind: 'loading' as const }
    if (requestPhase === 'timeout') return { kind: 'timeout' as const }
    if (requestPhase === 'server-error') return { kind: 'server-error' as const }
    if (requestPhase === 'success') return { kind: 'success' as const }
    return { kind: 'idle' as const }
  }

  const display = getDisplay()

  const statusLabel: Record<typeof display.kind, string> = {
    idle: '대기 중',
    'input-error': inputError?.title ?? '입력을 확인해주세요',
    offline: '인터넷 연결 끊김',
    loading: isSlow
      ? '예상보다 시간이 걸리고 있어요. 계속 기다리는 중입니다'
      : '답변을 생성하는 중입니다...',
    timeout: '응답 시간 초과',
    'server-error': '오류 발생',
    success: '결과 표시됨',
  }

  const statusDot: Record<typeof display.kind, string> = {
    idle: 'bg-muted-foreground/50',
    'input-error': 'bg-medium-foreground',
    offline: 'bg-muted-foreground',
    loading: 'bg-medium-foreground animate-pulse',
    timeout: 'bg-destructive',
    'server-error': 'bg-destructive',
    success: 'bg-easy-foreground',
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
              disabled={isBusy}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
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
              disabled={isBusy}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
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
              onValueChange={(v) => {
                setQuery(v)
                clearInputError()
              }}
              onSelect={selectAlgorithm}
              onSubmit={handleAlgorithmSubmit}
              disabled={isBusy}
              highlightError={display.kind === 'input-error'}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <textarea
                ref={problemTextareaRef}
                value={problemText}
                onChange={(e) => {
                  setProblemText(e.target.value)
                  clearInputError()
                }}
                rows={5}
                disabled={isBusy}
                onFocus={(e) => {
                  // PRD 5.17: 모바일 가상 키보드가 입력창을 가리지 않도록 포커스 시 스크롤한다.
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
                placeholder="풀고 싶은 문제 상황을 자유롭게 적어보세요. 예) 정렬된 수열에서 합이 특정 값이 되는 두 수를 찾고 싶어요."
                className={cn(
                  'w-full resize-y rounded-xl border bg-card p-4 text-sm leading-relaxed text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
                  display.kind === 'input-error'
                    ? 'border-medium focus:border-medium focus:ring-medium/30'
                    : 'border-border focus:border-ring focus:ring-ring/30',
                )}
              />
              <div className="flex items-center justify-between px-1">
                <span
                  className={cn(
                    'text-xs text-muted-foreground',
                    problemText.length > MAX_PROBLEM_LENGTH &&
                      'font-semibold text-medium-foreground',
                  )}
                >
                  {problemText.length}/{MAX_PROBLEM_LENGTH}자
                </span>
              </div>
              <button
                type="button"
                onClick={searchProblem}
                disabled={
                  isBusy ||
                  !problemText.trim() ||
                  problemText.length > MAX_PROBLEM_LENGTH
                }
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
              className={cn('size-2 rounded-full', statusDot[display.kind])}
              aria-hidden
            />
            <span className="text-sm font-medium text-foreground">
              {statusLabel[display.kind]}
            </span>
          </div>

          {/* 상태별 콘텐츠 */}
          {display.kind === 'idle' && <IdleState />}
          {display.kind === 'loading' && <LoadingState />}
          {display.kind === 'offline' && <OfflineState />}
          {display.kind === 'input-error' && inputError && (
            <InvalidInputState
              title={inputError.title}
              description={inputError.description}
            />
          )}
          {display.kind === 'timeout' && (
            <ErrorState
              title="응답 시간이 초과되었습니다"
              message="다시 시도해주세요."
              onRetry={() => {
                if (lastAction.current) lastAction.current()
                else setRequestPhase('idle')
              }}
            />
          )}
          {display.kind === 'server-error' && (
            <ErrorState
              onRetry={() => {
                if (lastAction.current) lastAction.current()
                else setRequestPhase('idle')
              }}
            />
          )}
          {display.kind === 'success' &&
            (tab === 'algorithm' ? (
              algoResult ? (
                <AlgorithmResult
                  algo={algoResult}
                  activeLang={preferredLang}
                  onChangeLang={setPreferredLang}
                  onSelectRelated={goToAlgorithm}
                  retryingLang={retryingLang}
                  onRetryLang={retryLanguageCode}
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

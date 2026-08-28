'use client'

import { AlertTriangle, RotateCw, SearchX, TerminalSquare } from 'lucide-react'

export function IdleState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <TerminalSquare className="size-8 text-primary" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-foreground">
          알고리즘 이름이나 문제를 입력해보세요
        </p>
        <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          이름으로 검색하면 설명·난이도·예시 코드를, 문제를 서술하면 어떤 알고리즘을
          써야 하는지 알려드립니다.
        </p>
      </div>
    </div>
  )
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-secondary ${className ?? ''}`} />
  )
}

export function LoadingState() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <SkeletonBar className="h-3 w-20" />
        <SkeletonBar className="mt-3 h-6 w-1/2" />
        <SkeletonBar className="mt-4 h-3 w-full" />
        <SkeletonBar className="mt-2 h-3 w-11/12" />
        <SkeletonBar className="mt-2 h-3 w-4/5" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex gap-2">
          <SkeletonBar className="h-6 w-24 rounded-full" />
          <SkeletonBar className="h-6 w-32 rounded-full" />
        </div>
        <SkeletonBar className="mt-4 h-3 w-full" />
        <SkeletonBar className="mt-2 h-3 w-3/4" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <SkeletonBar className="h-40 w-full rounded-lg" />
      </div>
      <span className="sr-only">결과를 불러오는 중입니다</span>
    </div>
  )
}

export function InvalidAlgorithmState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-medium/40 bg-medium/5 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-medium/10">
        <SearchX className="size-8 text-medium-foreground" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-foreground">
          일치하는 알고리즘을 찾을 수 없어요
        </p>
        <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          위 검색창의 자동완성 목록에서 원하는 알고리즘을 선택해주세요.
        </p>
      </div>
    </div>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-foreground">
          결과를 불러오지 못했어요
        </p>
        <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <RotateCw className="size-4" />
        다시 시도
      </button>
    </div>
  )
}

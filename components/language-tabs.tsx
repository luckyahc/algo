'use client'

import { RotateCw } from 'lucide-react'
import { LANGUAGES, LANGUAGE_LABELS, type LanguageKey } from '@/lib/schemas'
import { CodeBlock } from '@/components/code-block'
import { cn } from '@/lib/utils'

export function LanguageTabs({
  code,
  activeLang,
  onChangeLang,
  retryingLang,
  onRetryLang,
}: {
  code: Record<LanguageKey, string | null>
  activeLang: LanguageKey
  onChangeLang: (lang: LanguageKey) => void
  retryingLang: LanguageKey | null
  onRetryLang: (lang: LanguageKey) => void
}) {
  const current = code[activeLang]
  const isRetrying = retryingLang === activeLang

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-secondary p-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => onChangeLang(lang)}
            className={cn(
              'flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              lang === activeLang
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
              !code[lang] && 'italic opacity-70',
            )}
          >
            {LANGUAGE_LABELS[lang]}
          </button>
        ))}
      </div>

      {current ? (
        <CodeBlock source={current} label={LANGUAGE_LABELS[activeLang]} lang={activeLang} />
      ) : isRetrying ? (
        // 이 언어 탭을 처음 열어서 그때그때 요청 중인 상태 (5.19의 "필요한 언어만 요청").
        // "실패" 문구를 보여주지 않는다 — 아직 실패한 게 아니라 지금 막 불러오는 중이다.
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
          <RotateCw className="size-4 animate-spin" />
          <p>{LANGUAGE_LABELS[activeLang]} 코드를 불러오는 중입니다...</p>
        </div>
      ) : (
        // PRD 5.19: 특정 언어만 실패했다고 카드 전체를 오류로 처리하지 않는다 — 이 탭 안에서만
        // 안내 + 재시도 아이콘을 보여주고, 다른 언어 탭은 그대로 정상 동작한다.
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
          <p>이 언어의 예시 코드를 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => onRetryLang(activeLang)}
            className="relative inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors after:absolute after:-inset-1.5 after:content-['']  hover:bg-accent"
          >
            <RotateCw className="size-3.5" />
            다시 시도
          </button>
        </div>
      )}
    </div>
  )
}

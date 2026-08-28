'use client'

import { LANGUAGES, LANGUAGE_LABELS, type LanguageKey } from '@/lib/schemas'
import { CodeBlock } from '@/components/code-block'
import { cn } from '@/lib/utils'

export function LanguageTabs({
  code,
  activeLang,
  onChangeLang,
}: {
  code: Record<LanguageKey, string | null>
  activeLang: LanguageKey
  onChangeLang: (lang: LanguageKey) => void
}) {
  const current = code[activeLang]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-secondary p-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => code[lang] && onChangeLang(lang)}
            disabled={!code[lang]}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
              lang === activeLang
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {LANGUAGE_LABELS[lang]}
          </button>
        ))}
      </div>

      {current ? (
        <CodeBlock source={current} label={LANGUAGE_LABELS[activeLang]} lang={activeLang} />
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
          이 언어의 예시 코드를 불러오지 못했습니다.
        </div>
      )}
    </div>
  )
}

'use client'

import { ArrowRight, Info, ListChecks, Sparkles } from 'lucide-react'
import { getCatalogEntry } from '@/lib/algorithm-catalog'
import {
  type AlgorithmResultData,
  type LanguageKey,
  MISSING_FIELD_PLACEHOLDER,
} from '@/lib/schemas'
import { CopyButton } from '@/components/copy-button'
import { DifficultyBadge } from '@/components/difficulty-badge'
import { LanguageTabs } from '@/components/language-tabs'

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
  activeLang,
  onChangeLang,
  onSelectRelated,
  retryingLang,
  onRetryLang,
}: {
  algo: AlgorithmResultData
  activeLang: LanguageKey
  onChangeLang: (lang: LanguageKey) => void
  onSelectRelated: (id: string, rawName: string) => void
  retryingLang: LanguageKey | null
  onRetryLang: (lang: LanguageKey) => void
}) {
  // 자기 자신을 가리키는 관련 알고리즘은 화면에 만들지 않는다 (PRD 5.10) — 서버에서도
  // 걸러내지만, 방어적으로 한 번 더 제거한다.
  const related = algo.related
    .filter((id) => id !== algo.id)
    .map((id) => getCatalogEntry(id))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  const activeCode = algo.code[activeLang]

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
          <CopyButton
            text={`${algo.name}\n\n${algo.description ?? MISSING_FIELD_PLACEHOLDER}`}
            label="설명"
          />
        </div>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          {algo.description ?? MISSING_FIELD_PLACEHOLDER}
        </p>
      </Card>

      {/* 2. 난이도 */}
      <Card>
        <div className="flex flex-col gap-3">
          <DifficultyBadge level={algo.difficulty} />
          <div className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-pretty">
              {algo.difficultyReason ?? MISSING_FIELD_PLACEHOLDER}
            </p>
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
        {algo.useCases && algo.useCases.length > 0 ? (
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
        ) : (
          <p className="text-sm text-muted-foreground">{MISSING_FIELD_PLACEHOLDER}</p>
        )}
      </Card>

      {/* 4. 예시 코드 (언어 탭) */}
      <Card className="overflow-hidden">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4.5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">예시 코드</h3>
          </div>
          <CopyButton text={activeCode ?? ''} label="코드" />
        </div>
        <LanguageTabs
          code={algo.code}
          activeLang={activeLang}
          onChangeLang={onChangeLang}
          retryingLang={retryingLang}
          onRetryLang={onRetryLang}
        />
      </Card>

      {/* 관련 알고리즘 */}
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          관련된 알고리즘 보기
        </h3>
        {related.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRelated(r.id, r.name)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
              >
                {r.name}
                <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">관련된 알고리즘이 없습니다.</p>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { type CatalogEntry, searchCatalog } from '@/lib/algorithm-catalog'
import { cn } from '@/lib/utils'

export function AlgorithmCombobox({
  value,
  onValueChange,
  onSelect,
  onSubmit,
  disabled,
}: {
  value: string
  onValueChange: (value: string) => void
  onSelect: (entry: CatalogEntry) => void
  onSubmit: (rawQuery: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const matches = useMemo(() => searchCatalog(value).slice(0, 8), [value])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    setActive(0)
  }, [value])

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${active}"]`,
    )
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function choose(entry: CatalogEntry) {
    onValueChange(entry.name)
    setOpen(false)
    onSelect(entry)
  }

  function submit() {
    setOpen(false)
    onSubmit(value)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && matches[active]) choose(matches[active])
      else submit()
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            disabled={disabled}
            onChange={(e) => {
              onValueChange(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="알고리즘 이름을 입력하세요 (예: 이진 탐색, DFS, 다익스트라)"
            className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
            role="combobox"
            aria-expanded={open}
            aria-controls="algo-listbox"
            aria-autocomplete="list"
          />
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={submit}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Search className="size-4" />
          검색
        </button>
      </div>

      {open && (
        <ul
          ref={listRef}
          id="algo-listbox"
          role="listbox"
          className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              일치하는 알고리즘이 없습니다.
            </li>
          ) : (
            matches.map((entry, i) => (
              <li key={entry.id} data-index={i} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(entry)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    i === active ? 'bg-accent' : 'hover:bg-secondary',
                  )}
                >
                  <span className="text-sm font-medium text-foreground">
                    {entry.name}
                  </span>
                  <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {entry.category}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

'use client'

import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import type { LanguageKey } from '@/lib/schemas'
import { cn } from '@/lib/utils'

const PYTHON_KEYWORDS = new Set([
  'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'and', 'or',
  'not', 'import', 'from', 'class', 'lambda', 'continue', 'break', 'pass',
  'None', 'True', 'False', 'range', 'len', 'max', 'min', 'sum', 'print',
  'set', 'sort', 'append', 'float', 'int',
])

const C_KEYWORDS = new Set([
  'int', 'char', 'float', 'double', 'long', 'short', 'unsigned', 'signed',
  'void', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
  'break', 'continue', 'return', 'struct', 'typedef', 'union', 'enum',
  'const', 'static', 'extern', 'sizeof', 'NULL', 'include', 'define',
  'printf', 'scanf', 'malloc', 'free', 'main',
])

const CPP_KEYWORDS = new Set([
  ...C_KEYWORDS,
  'class', 'public', 'private', 'protected', 'namespace', 'using', 'std',
  'cout', 'cin', 'endl', 'new', 'delete', 'template', 'typename', 'vector',
  'string', 'bool', 'true', 'false', 'nullptr', 'auto', 'virtual',
  'override', 'this', 'try', 'catch', 'throw', 'push_back', 'begin', 'end',
])

const JAVA_KEYWORDS = new Set([
  'public', 'private', 'protected', 'class', 'static', 'void', 'int',
  'long', 'double', 'float', 'boolean', 'char', 'String', 'new', 'if',
  'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break',
  'continue', 'return', 'import', 'package', 'System', 'out', 'println',
  'ArrayList', 'List', 'Map', 'HashMap', 'true', 'false', 'null', 'try',
  'catch', 'throw', 'extends', 'implements', 'interface', 'final',
])

const KEYWORDS_BY_LANG: Record<LanguageKey, Set<string>> = {
  python: PYTHON_KEYWORDS,
  c: C_KEYWORDS,
  cpp: CPP_KEYWORDS,
  java: JAVA_KEYWORDS,
}

const TOKEN_RE =
  /(#[^\n]*|\/\/[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+\.?\d*\b)|([A-Za-z_]\w*)|(\s+)|([^\s\w])/g

function highlightLine(
  line: string,
  keyPrefix: string,
  keywords: Set<string>,
): ReactNode[] {
  const nodes: ReactNode[] = []
  let match: RegExpExecArray | null
  let idx = 0
  TOKEN_RE.lastIndex = 0
  while ((match = TOKEN_RE.exec(line)) !== null) {
    const [full, comment, str, num, word, ws] = match
    const key = `${keyPrefix}-${idx++}`
    if (comment) {
      nodes.push(
        <span key={key} className="text-code-comment italic">
          {comment}
        </span>,
      )
    } else if (str) {
      nodes.push(
        <span key={key} className="text-code-string">
          {str}
        </span>,
      )
    } else if (num) {
      nodes.push(
        <span key={key} className="text-code-number">
          {num}
        </span>,
      )
    } else if (word) {
      if (keywords.has(word)) {
        nodes.push(
          <span key={key} className="text-code-keyword">
            {word}
          </span>,
        )
      } else {
        // function call heuristic: word directly followed by "("
        const after = line[match.index + full.length]
        if (after === '(') {
          nodes.push(
            <span key={key} className="text-code-func">
              {word}
            </span>,
          )
        } else {
          nodes.push(<span key={key}>{word}</span>)
        }
      }
    } else if (ws) {
      nodes.push(<span key={key}>{ws}</span>)
    } else {
      nodes.push(<span key={key}>{full}</span>)
    }
  }
  return nodes
}

export function CodeBlock({
  source,
  label,
  lang = 'python',
  className,
}: {
  source: string
  label?: string
  lang?: LanguageKey
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const lines = source.replace(/\n$/, '').split('\n')
  const keywords = KEYWORDS_BY_LANG[lang]

  async function copy() {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-white/10 bg-code-bg',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f56]" aria-hidden />
          <span className="size-3 rounded-full bg-[#ffbd2e]" aria-hidden />
          <span className="size-3 rounded-full bg-[#27c93f]" aria-hidden />
          {label ? (
            <span className="ml-3 font-mono text-xs text-code-gutter">
              {label}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs text-code-fg/70 transition-colors hover:bg-white/10 hover:text-code-fg"
          aria-label="코드 복사"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-code-string" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              복사
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="min-w-full py-3 font-mono text-[13px] leading-relaxed text-code-fg">
          <code className="grid">
            {lines.map((line, i) => (
              <span key={i} className="grid grid-cols-[2.5rem_1fr] px-1">
                <span className="select-none pr-3 text-right text-code-gutter">
                  {i + 1}
                </span>
                <span className="whitespace-pre pr-4">
                  {line ? highlightLine(line, `l${i}`, keywords) : ' '}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}

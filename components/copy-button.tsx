'use client'

import { Check, Copy } from 'lucide-react'
import { useCopyToClipboard } from '@/lib/use-copy'
import { cn } from '@/lib/utils'

export function CopyButton({
  text,
  label = '복사',
  className,
}: {
  text: string
  label?: string
  className?: string
}) {
  const { status, copy } = useCopyToClipboard()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => copy(text)}
        className={cn(
          // after 가상요소로 시각적 크기는 그대로 두고 터치 영역만 약 44px까지 넓힌다 (PRD 5.17).
          "relative inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors after:absolute after:-inset-2 after:content-[''] hover:bg-secondary hover:text-foreground",
          className,
        )}
        aria-label={`${label} 복사`}
        title={`${label} 복사`}
      >
        {status === 'copied' ? (
          <Check className="size-4 text-easy-foreground" />
        ) : (
          <Copy className="size-4" />
        )}
      </button>
      {status === 'failed' && (
        <span
          role="status"
          className="absolute right-0 top-full z-10 mt-1.5 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg"
        >
          복사에 실패했어요. 직접 선택해 복사해주세요.
        </span>
      )}
    </div>
  )
}

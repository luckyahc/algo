'use client'

import { useState } from 'react'

export type CopyStatus = 'idle' | 'copied' | 'failed'

/**
 * 클립보드 복사 + 성공/실패 피드백 상태를 관리하는 공용 훅.
 * PRD 5.15(실패 시 안내)·5.16(성공 시 체크 아이콘)을 컴포넌트마다 따로
 * 구현하지 않도록 한 곳으로 모았다.
 */
export function useCopyToClipboard(resetMs = 1600) {
  const [status, setStatus] = useState<CopyStatus>('idle')

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
    setTimeout(() => setStatus('idle'), resetMs)
  }

  return { status, copy }
}

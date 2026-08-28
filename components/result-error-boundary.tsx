'use client'

import { Component, type ReactNode } from 'react'
import { ErrorState } from '@/components/result-states'

type Props = {
  children: ReactNode
  onReset: () => void
}

type State = {
  hasError: boolean
}

/**
 * 결과 렌더링(AlgorithmResult/ProblemResult) 구간만 감싼다.
 * 여기서 예기치 못한 렌더링 오류가 나도 헤더·탭·입력창·상태 표시줄은 그대로 살아있고,
 * 이 구간만 재시도 화면으로 대체된다 (PRD 6.6 — "White Screen 없음").
 */
export class ResultErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('[ResultErrorBoundary] render crashed', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="결과를 표시하지 못했어요"
          message="예상치 못한 오류가 발생했습니다. 다시 시도해주세요."
          onRetry={() => {
            this.setState({ hasError: false })
            this.props.onReset()
          }}
        />
      )
    }
    return this.props.children
  }
}

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../BaseHeader', () => ({
  default: () => <div data-testid="base-header" />,
}))
vi.mock('../BusinessHeader', () => ({
  default: () => <div data-testid="business-header" />,
}))
vi.mock('../MicroAppHeader', () => ({
  default: () => <div data-testid="micro-app-header" />,
}))
vi.mock('../SystemHeader', () => ({
  default: () => <div data-testid="system-header" />,
}))

import Header from '../index'

describe('Header', () => {
  it('headerType 为 home 时不渲染顶栏', () => {
    const { container } = render(<Header headerType="home" />)
    expect(container.firstChild).toBeNull()
  })

  it('headerType 为 micro-app 时渲染 MicroAppHeader', () => {
    render(<Header headerType="micro-app" />)
    expect(screen.getByTestId('micro-app-header')).toBeInTheDocument()
    expect(screen.queryByTestId('base-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('business-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('system-header')).not.toBeInTheDocument()
  })

  it('headerType 为 business 时渲染 BusinessHeader', () => {
    render(<Header headerType="business" />)
    expect(screen.getByTestId('business-header')).toBeInTheDocument()
    expect(screen.queryByTestId('base-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('micro-app-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('system-header')).not.toBeInTheDocument()
  })

  it('headerType 为 system 时渲染 SystemHeader', () => {
    render(<Header headerType="system" />)
    expect(screen.getByTestId('system-header')).toBeInTheDocument()
    expect(screen.queryByTestId('base-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('micro-app-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('business-header')).not.toBeInTheDocument()
  })

  it('headerType 为 store / studio / initial-configuration 时渲染 BaseHeader', () => {
    for (const headerType of ['store', 'studio', 'initial-configuration'] as const) {
      const { unmount } = render(<Header headerType={headerType} />)
      expect(screen.getByTestId('base-header')).toBeInTheDocument()
      expect(screen.queryByTestId('micro-app-header')).not.toBeInTheDocument()
      expect(screen.queryByTestId('business-header')).not.toBeInTheDocument()
      expect(screen.queryByTestId('system-header')).not.toBeInTheDocument()
      unmount()
    }
  })
})

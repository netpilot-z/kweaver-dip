import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('antd', () => ({
  Dropdown: ({
    children,
    menu,
  }: {
    children: ReactNode
    menu?: { items?: Array<{ key: string; label: ReactNode } | null> }
  }) => (
    <div>
      {children}
      <div data-testid="dropdown-items">
        {menu?.items?.filter(Boolean).map((item) => (
          <span key={String(item?.key)}>{item?.label}</span>
        ))}
      </div>
    </div>
  ),
  Modal: {
    useModal: () => [{ confirm: vi.fn() }, <div key="modal-holder" />],
  },
}))

vi.mock('@/components/IconFont', () => ({
  default: () => <span data-testid="icon-font" />,
}))

import PlanListItem from './PlanListItem'

describe('WorkPlanList/PlanListItem', () => {
  it('ended at plan only exposes delete action and ended status', () => {
    render(
      <PlanListItem
        job={{
          id: 'job-1',
          agentId: 'agent-1',
          sessionKey: 'session-1',
          name: '一次性任务',
          enabled: true,
          createdAtMs: 0,
          updatedAtMs: 0,
          schedule: { kind: 'at' },
          state: { lastRunAtMs: 1 },
        }}
      />,
    )

    expect(screen.getByText('workPlan.list.statusEndedBracketed')).toBeInTheDocument()
    expect(screen.getByText('workPlan.common.delete')).toBeInTheDocument()
    expect(screen.queryByText('workPlan.common.start')).not.toBeInTheDocument()
    expect(screen.queryByText('workPlan.common.pause')).not.toBeInTheDocument()
    expect(screen.queryByText('workPlan.common.edit')).not.toBeInTheDocument()
  })
})

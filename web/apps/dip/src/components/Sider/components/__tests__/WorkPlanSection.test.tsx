import { fireEvent, render, screen } from '@testing-library/react'
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
  message: {
    useMessage: () => [{ success: vi.fn(), error: vi.fn() }, <div key="msg-holder" />],
  },
}))
vi.mock('@/components/IconFont', () => ({
  default: () => <span data-testid="icon-font" />,
}))
vi.mock('@/components/WorkPlanList/utils', () => ({
  getPlanJobDisplayStatus: (plan: { __status?: string }) => plan.__status ?? 'running',
  isEndedAtPlan: (plan: { __ended?: boolean }) => Boolean(plan.__ended),
}))

import { WorkPlanSection } from '../WorkPlanSection'

describe('Sider/WorkPlanSection', () => {
  it('空列表显示占位文案', () => {
    render(
      <WorkPlanSection
        plans={[]}
        hasMore={false}
        total={0}
        onMore={() => {}}
        onOpenPlanDetail={() => {}}
        onPausePlan={async () => true}
        onResumePlan={async () => true}
        onDeletePlan={async () => true}
      />,
    )
    expect(screen.getByText('sider.workPlan.empty')).toBeInTheDocument()
  })

  it('点击更多与计划项触发对应回调，并显示状态文案', () => {
    const onMore = vi.fn()
    const onOpenPlanDetail = vi.fn()
    const plan = {
      id: 'p1',
      agentId: 'a1',
      sessionKey: 's1',
      name: '计划一',
      enabled: true,
      createdAtMs: 1,
      updatedAtMs: 1,
      schedule: {},
      __status: 'running',
    } as any

    render(
      <WorkPlanSection
        plans={[plan]}
        hasMore
        total={1}
        selectedPlanId="p1"
        onMore={onMore}
        onOpenPlanDetail={onOpenPlanDetail}
        onPausePlan={async () => true}
        onResumePlan={async () => true}
        onDeletePlan={async () => true}
      />,
    )

    expect(screen.getByText('sider.workPlan.statusRunning')).toBeInTheDocument()

    fireEvent.click(screen.getByText('sider.workPlan.more'))
    expect(onMore).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTitle('计划一'))
    expect(onOpenPlanDetail).toHaveBeenCalledWith('p1', 'a1', 's1')
  })

  it('ended plan only exposes delete action', () => {
    const plan = {
      id: 'p2',
      agentId: 'a2',
      sessionKey: 's2',
      name: '计划二',
      enabled: false,
      createdAtMs: 1,
      updatedAtMs: 1,
      schedule: {},
      __status: 'ended',
      __ended: true,
    } as any

    render(
      <WorkPlanSection
        plans={[plan]}
        hasMore={false}
        total={1}
        onMore={() => {}}
        onOpenPlanDetail={() => {}}
        onPausePlan={async () => true}
        onResumePlan={async () => true}
        onDeletePlan={async () => true}
      />,
    )

    expect(screen.getByText('sider.workPlan.statusEnded')).toBeInTheDocument()
    expect(screen.getByText('sider.workPlan.actionDelete')).toBeInTheDocument()
    expect(screen.queryByText('sider.workPlan.actionEnable')).not.toBeInTheDocument()
    expect(screen.queryByText('sider.workPlan.actionPause')).not.toBeInTheDocument()
  })
})

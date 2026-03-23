import { MoreOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Dropdown, Popconfirm } from 'antd'
import type { CronJob } from '@/apis/dip-studio/plan'

interface WorkPlanSectionProps {
  plans: CronJob[]
  hasMore: boolean
  onMore: () => void
  onOpenPlanDetail: (planId: string, agentId: string, sessionId: string) => void
  onPausePlan: (id: string) => Promise<boolean>
  onDeletePlan: (id: string) => Promise<boolean>
}

export const WorkPlanSection = ({
  plans,
  hasMore,
  onMore,
  onOpenPlanDetail,
  onPausePlan,
  onDeletePlan,
}: WorkPlanSectionProps) => {
  return (
    <div className="px-2 pb-2">
      {/* <div className="h-px bg-[--dip-line-color-10] mb-1.5" /> */}
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-xs leading-[20px] text-[--dip-text-color-45]">工作计划</span>
        {hasMore ? (
          <button
            type="button"
            className="text-xs text-[--dip-primary-color] bg-transparent border-0 cursor-pointer hover:underline"
            onClick={onMore}
          >
            更多
          </button>
        ) : null}
      </div>
      <div className="flex flex-col gap-0.5">
        {plans.length === 0 ? (
          <div className="text-xs text-[--dip-text-color-45] px-2 py-2">暂无计划</div>
        ) : (
          plans.map((plan) => {
            const statusPrefix = plan.enabled ? '[执行中]' : '[已暂停]'
            const operationItems: MenuProps['items'] = [
              {
                key: 'pause',
                label: '暂停',
                disabled: !plan.enabled,
                onClick: (e) => {
                  e.domEvent.stopPropagation()
                  void onPausePlan(plan.id)
                },
              },
              {
                key: 'delete',
                label: (
                  <Popconfirm
                    title="确认删除该计划吗？"
                    okText="删除"
                    cancelText="取消"
                    onConfirm={() => {
                      void onDeletePlan(plan.id)
                    }}
                    onPopupClick={(event) => event.stopPropagation()}
                  >
                    <span>删除</span>
                  </Popconfirm>
                ),
              },
            ]
            return (
              <button
                key={`work-plan-${plan.id}`}
                type="button"
                onClick={() => onOpenPlanDetail(plan.id, plan.agentId, plan.sessionKey)}
                className="group w-full text-left min-h-[44px] px-2 py-1.5 rounded-md relative border-0 bg-transparent hover:bg-[--dip-hover-bg-color]"
              >
                <div className="pr-7">
                  <div
                    className="truncate text-sm leading-5 text-[--dip-text-color]"
                    title={plan.name}
                  >
                    {plan.name}
                  </div>
                  <div
                    className="mt-0.5 truncate text-xs leading-4 text-[--dip-text-color-45]"
                    title={`${statusPrefix}${plan.name}`}
                  >
                    {statusPrefix}
                    {plan.name}
                  </div>
                </div>
                <Dropdown menu={{ items: operationItems }} trigger={['click']}>
                  <button
                    type="button"
                    className="w-5 h-5 absolute right-1.5 top-1.5 inline-flex items-center justify-center rounded border-0 bg-transparent text-[--dip-text-color-45] opacity-0 group-hover:opacity-100 hover:bg-[rgba(0,0,0,0.06)]"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MoreOutlined />
                  </button>
                </Dropdown>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

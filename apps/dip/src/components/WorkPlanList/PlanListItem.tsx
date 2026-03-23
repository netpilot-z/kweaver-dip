import { CalendarOutlined, ClockCircleOutlined, SnippetsOutlined } from '@ant-design/icons'
import { memo, type ReactNode } from 'react'
import type { PlanListItemProps } from './types'
import { formatPlanRelativeDayTime, planExecutionConditionText, planJobDescription } from './utils'

function PlanMetaColumn({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 max-w-[140px] flex-col gap-1">
      <div className="flex items-center justify-center gap-1 text-xs leading-[18px] text-[--dip-text-color-45]">
        <span className="inline-flex shrink-0 text-[10px]">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <div
        className="truncate text-xs leading-[18px] text-[--dip-text-color-45]"
        title={value === '—' ? undefined : value}
      >
        {value}
      </div>
    </div>
  )
}

function PlanListItemInner({ job, onClick }: PlanListItemProps) {
  const description = planJobDescription(job)
  const isPeriodic = job.schedule?.kind === 'every'
  const conditionText = planExecutionConditionText(job)
  const lastRun = formatPlanRelativeDayTime(job.state?.lastRunAtMs)
  const nextRun = formatPlanRelativeDayTime(job.state?.nextRunAtMs)

  return (
    <button
      type="button"
      onClick={() => onClick?.(job)}
      className="max-w-[880px] mx-auto flex w-full items-center gap-4 rounded-lg border border-[var(--dip-line-color-10)] bg-[--dip-white] px-4 py-3 text-left transition-[border-color,background-color] hover:border-[#BEDBFF] hover:bg-[#EFF6FF]"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#60AEFF]">
        <SnippetsOutlined className="text-lg text-white" />
      </div>

      <div className="min-w-0 flex-1 flex flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="truncate text-sm font-medium leading-[22px] text-[--dip-text-color]"
            title={job.name}
          >
            {job.name}
          </span>
          {isPeriodic ? (
            <span className="inline-flex shrink-0 items-center rounded bg-[#F9F0FF] px-1.5 py-0.5 text-xs font-normal leading-[18px] text-[#722ED1]">
              周期任务
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center rounded bg-[#E6FFFB] px-1.5 py-0.5 text-xs font-normal leading-[18px] text-[#08979C]">
              条件计划
            </span>
          )}
        </div>
        {description ? (
          <p
            className="truncate text-xs leading-[18px] text-[--dip-text-color-45]"
            title={description}
          >
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-start justify-end gap-6 gap-y-2 max-w-[min(100%,420px)]">
        <PlanMetaColumn icon={<CalendarOutlined />} label="执行条件" value={conditionText} />
        <PlanMetaColumn icon={<ClockCircleOutlined />} label="最近执行" value={lastRun} />
        <PlanMetaColumn icon={<ClockCircleOutlined />} label="下次执行" value={nextRun} />
      </div>
    </button>
  )
}

const PlanListItem = memo(PlanListItemInner)
export default PlanListItem

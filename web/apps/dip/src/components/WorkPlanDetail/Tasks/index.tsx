import { CheckCircleFilled } from '@ant-design/icons'
import { Spin } from 'antd'
import { throttle } from 'lodash'
import { memo, useEffect, useMemo, useState } from 'react'
import intl from 'react-intl-universal'
import { getPlanContent } from '@/apis/dip-studio/plan'
import Empty from '@/components/Empty'
import ScrollBarContainer from '@/components/ScrollBarContainer'
import type { ArchivePreviewState } from '@/components/WorkPlanDetail/Outcome/Preview'
import { ArchivePreviewPanel } from '@/components/WorkPlanDetail/Outcome/Preview'
import TaskRunRow from './components/TaskRunRow'
import { PreviewDrawerContainerContext } from './previewDrawerContainerContext'
import { TASKS_SCROLL_THRESHOLD_PX, type TasksPanelProps } from './types'
import { useTaskRuns } from './useTaskRuns'

const PLAN_PREVIEW_SUBPATH = 'plan.md'
const PLAN_PREVIEW_TITLE = intl.get('workPlan.detail.planDocTitle')

function TasksPanelInner({
  planId,
  dhId,
  sessionId: _sessionId,
  previewDrawerGetContainer,
}: TasksPanelProps) {
  const [planPreview, setPlanPreview] = useState<ArchivePreviewState>({
    title: PLAN_PREVIEW_TITLE,
    subpath: PLAN_PREVIEW_SUBPATH,
    body: '',
    loading: true,
    viewer: 'markdown',
    error: null,
  })
  const { entries, total, initialLoading, loadingMore, loadError, loadMore } = useTaskRuns(planId)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const handleListScroll = useMemo(
    () =>
      throttle((event: React.UIEvent<HTMLElement>) => {
        const target = event.currentTarget
        const { scrollTop, clientHeight, scrollHeight } = target
        if (scrollHeight - scrollTop - clientHeight > TASKS_SCROLL_THRESHOLD_PX) return
        loadMore()
      }, 150),
    [loadMore],
  )

  useEffect(() => () => handleListScroll.cancel(), [handleListScroll])

  useEffect(() => {
    let cancelled = false
    const planIdTrimmed = planId?.trim()

    const basePreview: ArchivePreviewState = {
      title: PLAN_PREVIEW_TITLE,
      subpath: PLAN_PREVIEW_SUBPATH,
      body: '',
      loading: false,
      viewer: 'markdown',
      error: null,
    }

    if (!planIdTrimmed) {
      setPlanPreview({
        ...basePreview,
        body: intl.get('workPlan.detail.planDocNotGenerated'),
        error: null,
      })
      return
    }

    setPlanPreview({ ...basePreview, loading: true })

    const loadPlanPreview = async () => {
      try {
        const res = await getPlanContent(planIdTrimmed)
        const body = res.content ?? ''
        if (!cancelled) {
          setPlanPreview({
            ...basePreview,
            body,
            error: null,
            emptyText: body?.trim() ? undefined : intl.get('workPlan.detail.planDocNotGenerated'),
          })
        }
      } catch {
        if (!cancelled) {
          setPlanPreview({
            ...basePreview,
            body: '',
            error: intl.get('workPlan.detail.planDocPreviewLoadFailed'),
          })
        }
      }
    }

    void loadPlanPreview()
    return () => {
      cancelled = true
    }
  }, [planId])

  if (!planId?.trim()) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6">
        <Empty title={intl.get('workPlan.detail.noPlan')} />
      </div>
    )
  }

  return (
    <PreviewDrawerContainerContext.Provider value={previewDrawerGetContainer ?? undefined}>
      <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-[--dip-border-color] bg-[#FAFAF9]">
          <ScrollBarContainer className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 flex-col gap-4 px-5">
              {planPreview.body?.trim() ? (
                <div className="flex items-start gap-2 mt-4 rounded-lg border border-[#d9f7be] px-3 py-[9px] bg-[--dip-white]">
                  <CheckCircleFilled
                    className="mt-0.5 shrink-0 text-base text-[#52c41a]"
                    aria-hidden
                  />
                  <p className="m-0 min-w-0 flex-1 text-sm leading-[1.57] text-[--dip-text-color]">
                    {intl.get('workPlan.detail.bannerTip')}
                  </p>
                </div>
              ) : null}
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col pl-1">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col border-l-0">
                <ArchivePreviewPanel preview={planPreview} />
              </div>
            </div>
          </ScrollBarContainer>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[--dip-white]">
          <ScrollBarContainer
            onScroll={handleListScroll}
            className="flex min-h-0 flex-1 flex-col px-6 py-4 relative"
            style={{ overscrollBehavior: 'contain' }}
          >
            <div className="mx-auto flex h-full w-full max-w-[720px] flex-col gap-5 pb-2">
              {initialLoading ? (
                <div className="inset-0 flex h-full w-full items-center justify-center py-20">
                  <Spin />
                </div>
              ) : loadError && entries.length === 0 ? (
                <div className="inset-0 flex items-center justify-center py-12">
                  <Empty type="failed" title={intl.get('workPlan.common.loadFailed')} />
                </div>
              ) : (
                <>
                  <h2 className="m-0 text-base font-bold leading-normal text-[--dip-text-color]">
                    {intl.get('workPlan.detail.executionRecords', { count: total })}
                  </h2>

                  {entries.length === 0 ? (
                    <div className="inset-0 flex justify-center py-12">
                      <Empty title={intl.get('workPlan.common.noData')} />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 pb-2">
                      {entries.map((entry, i) => {
                        const rowKey = `${entry.jobId}-${entry.ts}-${i}`
                        return (
                          <TaskRunRow
                            key={rowKey}
                            entry={entry}
                            digitalHumanId={dhId}
                            expanded={expandedKey === rowKey}
                            onToggle={() =>
                              setExpandedKey((prev) => (prev === rowKey ? null : rowKey))
                            }
                          />
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollBarContainer>
          {loadingMore ? (
            <div className="flex shrink-0 justify-center px-6 py-2">
              <Spin size="small" />
            </div>
          ) : null}
        </div>
      </div>
    </PreviewDrawerContainerContext.Provider>
  )
}

const TasksPanel = memo(TasksPanelInner)
export default TasksPanel

import { message, Spin } from 'antd'
import { throttle } from 'lodash'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { List } from 'react-window'
import { type CronJob, getCronJobList, getDigitalHumanPlanList } from '@/apis/dip-studio/plan'
import Empty from '@/components/Empty'
import ScrollBarContainer from '@/components/ScrollBarContainer'
import { mockFetchPlanListPage, PLAN_LIST_USE_MOCK } from './mockPlanList'
import PlanListItem from './PlanListItem'
import {
  DEFAULT_PAGE_SIZE,
  PLAN_LIST_ROW_HEIGHT,
  type PlanListProps,
  SCROLL_THRESHOLD_PX,
} from './types'

function PlanListInner({
  source,
  pageSize = DEFAULT_PAGE_SIZE,
  className,
  onPlanClick,
}: PlanListProps) {
  const offsetRef = useRef(0)
  const hasMoreRef = useRef(true)
  const isLoadingMoreRef = useRef(false)
  const requestIdRef = useRef(0)

  const [jobs, setJobs] = useState<CronJob[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchPage = useCallback(
    async (isLoadMore: boolean) => {
      if (source.mode === 'digitalHuman' && !source.digitalHumanId.trim()) {
        setJobs([])
        setInitialLoading(false)
        return
      }

      if (isLoadMore) {
        if (!hasMoreRef.current || isLoadingMoreRef.current) return
        isLoadingMoreRef.current = true
        setLoadingMore(true)
      } else {
        hasMoreRef.current = true
        offsetRef.current = 0
        isLoadingMoreRef.current = false
        setInitialLoading(true)
      }

      const currentOffset = isLoadMore ? offsetRef.current : 0
      const reqId = ++requestIdRef.current

      try {
        const params = { offset: currentOffset, limit: pageSize }
        const res = PLAN_LIST_USE_MOCK
          ? await mockFetchPlanListPage(currentOffset, pageSize)
          : source.mode === 'global'
            ? await getCronJobList(params)
            : await getDigitalHumanPlanList(source.digitalHumanId, params)

        if (reqId !== requestIdRef.current) return

        hasMoreRef.current = res.hasMore
        offsetRef.current = res.nextOffset ?? currentOffset + res.jobs.length

        if (isLoadMore) {
          setJobs((prev) => [...prev, ...res.jobs])
        } else {
          setJobs(res.jobs)
        }
      } catch {
        if (reqId !== requestIdRef.current) return
        // message.error(err?.description)
        if (!isLoadMore) setJobs([])
      } finally {
        if (reqId === requestIdRef.current) {
          isLoadingMoreRef.current = false
          setLoadingMore(false)
          setInitialLoading(false)
        }
      }
    },
    [pageSize, source],
  )

  useEffect(() => {
    fetchPage(false)
  }, [fetchPage])

  const handleScroll = useMemo(
    () =>
      throttle((params: { target?: HTMLElement }) => {
        const target = params?.target
        if (!target || isLoadingMoreRef.current || !hasMoreRef.current) return
        const { scrollTop, clientHeight, scrollHeight } = target
        if (scrollHeight - scrollTop - clientHeight > SCROLL_THRESHOLD_PX) return
        void fetchPage(true)
      }, 150),
    [fetchPage],
  )

  useEffect(() => () => handleScroll.cancel(), [handleScroll])

  const getRow = useCallback(
    ({ index, style, data }: any) => {
      const job = data[index] as CronJob | undefined
      if (!job) return null
      return (
        <div style={style} className="box-border px-6 pb-3 mx-auto">
          <PlanListItem job={job} onClick={onPlanClick} />
        </div>
      )
    },
    [onPlanClick],
  )

  if (source.mode === 'digitalHuman' && !source.digitalHumanId.trim()) {
    return (
      <div className={`flex flex-1 min-h-0 items-center justify-center px-6 ${className ?? ''}`}>
        <Empty title="暂无数据" />
      </div>
    )
  }

  if (initialLoading) {
    return (
      <div className={`flex flex-1 min-h-0 items-center justify-center ${className ?? ''}`}>
        <Spin />
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className={`flex flex-1 min-h-0 items-center justify-center px-6 ${className ?? ''}`}>
        <Empty title="暂无数据" />
      </div>
    )
  }

  return (
    <div className={`flex flex-1 min-h-0 flex-col overflow-hidden ${className ?? ''}`}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1">
          <List
            tagName={ScrollBarContainer as any}
            className="h-full w-full"
            rowComponent={getRow}
            rowCount={jobs.length}
            rowHeight={PLAN_LIST_ROW_HEIGHT}
            rowProps={{
              data: jobs,
            }}
            style={{ height: '100%', width: '100%' }}
            onScroll={(e) => {
              handleScroll({ target: e.currentTarget })
            }}
          />
        </div>
        {loadingMore ? (
          <div className="flex shrink-0 justify-center px-6 py-2">
            <Spin size="small" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

const WorkPlanList = memo(PlanListInner)
export default WorkPlanList

import { Spin } from 'antd'
import { memo, useEffect, useState } from 'react'
import {
  getDigitalHumanSessionArchiveSubpath,
  getDigitalHumanSessionArchives,
  type SessionArchiveEntry,
  type SessionArchivesResponse,
} from '@/apis/dip-studio/sessions'
import Empty from '@/components/Empty'

export type TaskOutcomeListProps = {
  digitalHumanId?: string
  sessionId?: string
}

type SessionArchiveFileItem = {
  path: string
  name: string
  type: SessionArchiveEntry['type']
}

async function resolveFilesInDirectory(
  dhId: string,
  sessionId: string,
  currentPath: string,
): Promise<SessionArchiveFileItem[]> {
  const res = (await getDigitalHumanSessionArchiveSubpath(sessionId, currentPath, {
    responseType: 'json',
  })) as SessionArchivesResponse

  const items = res.contents ?? []
  const nested = await Promise.all(
    items.map(async (item) => {
      const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name
      if (item.type === 'directory') {
        return resolveFilesInDirectory(dhId, sessionId, fullPath)
      }
      return [{ path: fullPath, name: item.name, type: item.type }]
    }),
  )
  return nested.flat()
}

function TaskOutcomeListInner({ digitalHumanId, sessionId }: TaskOutcomeListProps) {
  const dhId = digitalHumanId?.trim()
  const sessionIdTrimmed = sessionId?.trim()
  const canFetch = Boolean(dhId && sessionIdTrimmed)

  const [entries, setEntries] = useState<SessionArchiveFileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setEntries([])
    setError(false)
  }, [dhId, sessionIdTrimmed])

  useEffect(() => {
    if (!(dhId && sessionIdTrimmed)) return
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError(false)

        // 1) 先拉目录级（root）产物
        const root = await getDigitalHumanSessionArchives(sessionIdTrimmed)
        const rootItems = root.contents ?? []

        // 2) 再通过 subpath 拉文件级产物，并汇总为文件列表
        const nested = await Promise.all(
          rootItems.map(async (item) => {
            if (item.type === 'directory') {
              return resolveFilesInDirectory(dhId, sessionIdTrimmed, item.name)
            }
            return [{ path: item.name, name: item.name, type: item.type }]
          }),
        )
        if (!cancelled) setEntries(nested.flat())
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [dhId, sessionIdTrimmed])

  if (!canFetch) {
    return <Empty title="暂无产物" desc="缺少数字员工 ID 或本次执行的会话 ID" />
  }
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spin />
      </div>
    )
  }
  if (error) {
    return <Empty type="failed" title="加载失败" desc="归档产物拉取失败" />
  }
  if (entries.length === 0) {
    return <Empty title="暂无产物" />
  }
  return (
    <ul className="m-0 list-none space-y-1 p-0">
      {entries.map((item) => (
        <li key={`${item.type}-${item.path}`} className="text-sm text-black/85">
          <span className="text-black/45">{item.type}</span> {item.path}
        </li>
      ))}
    </ul>
  )
}

const TaskOutcomeList = memo(TaskOutcomeListInner)
export default TaskOutcomeList

import { Spin } from 'antd'
import { memo, useEffect, useState } from 'react'
import { getDigitalHumanSessionMessages, type SessionMessage } from '@/apis/dip-studio/sessions'
import Empty from '@/components/Empty'

export type TaskSessionMessagesProps = {
  digitalHumanId?: string
  sessionId?: string
}

function formatSessionMessageContent(content: unknown): string {
  if (typeof content === 'string') return content
  if (content == null) return ''
  return JSON.stringify(content)
}

function TaskSessionMessagesInner({ digitalHumanId, sessionId }: TaskSessionMessagesProps) {
  const dhId = digitalHumanId?.trim()
  const sessionIdTrimmed = sessionId?.trim()
  const canFetch = Boolean(dhId && sessionIdTrimmed)

  const [messages, setMessages] = useState<SessionMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setMessages([])
    setError(false)
  }, [dhId, sessionIdTrimmed])

  useEffect(() => {
    if (!(dhId && sessionIdTrimmed)) return
    let cancelled = false
    setLoading(true)
    setError(false)
    getDigitalHumanSessionMessages(sessionIdTrimmed)
      .then((res) => {
        if (!cancelled) setMessages(res.messages ?? [])
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [dhId, sessionIdTrimmed])

  if (!canFetch) {
    return <Empty title="暂无会话数据" desc="缺少数字员工 ID 或本次执行的会话 ID" />
  }
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spin />
      </div>
    )
  }
  if (error) {
    return <Empty type="failed" title="加载失败" desc="会话消息拉取失败" />
  }
  if (messages.length === 0) {
    return <Empty title="暂无消息" />
  }
  return (
    <ul className="m-0 list-none space-y-2 p-0">
      {messages.map((msg, i) => (
        <li key={msg.id ?? `m-${i}`} className="text-sm leading-normal text-black/85">
          {msg.role != null ? <span className="text-black/45">{String(msg.role)} · </span> : null}
          <span className="break-words">{formatSessionMessageContent(msg.content)}</span>
        </li>
      ))}
    </ul>
  )
}

const TaskSessionMessages = memo(TaskSessionMessagesInner)
export default TaskSessionMessages

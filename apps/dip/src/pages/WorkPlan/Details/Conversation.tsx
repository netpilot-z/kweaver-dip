import DipChatKit from '@/components/DipChatKit'

export type ConversationProps = {
  planId?: string
  dhId: string
  sessionId: string
}

/** 对话 Tab（接入会话 API 后替换） */
const Conversation = ({ planId: _planId, dhId, sessionId }: ConversationProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <DipChatKit
        // defaultMessageTurns={defaultMessageTurns}
        defaultEmployeeValue={dhId}
      />
    </div>
  )
}

export default Conversation

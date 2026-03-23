import DipChatKit from '@/components/DipChatKit'

export type TaskConversationProps = {
  digitalHumanId: string
  sessionId: string
}

const TaskConversation = ({ digitalHumanId, sessionId }: TaskConversationProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <DipChatKit
        // defaultMessageTurns={defaultMessageTurns}
        defaultEmployeeValue={digitalHumanId}
        className="!bg-transparent"
      />
    </div>
  )
}

export default TaskConversation

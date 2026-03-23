import DipChatKit from '@/components/DipChatKit'

/** 新会话页面 */
const Conversation = ({ digitalHumanId }: { digitalHumanId: string }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <DipChatKit
        // defaultMessageTurns={defaultMessageTurns}
        defaultEmployeeValue={digitalHumanId}
      />
    </div>
  )
}

export default Conversation

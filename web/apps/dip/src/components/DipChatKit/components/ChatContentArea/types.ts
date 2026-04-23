import type { AiPromptMentionOption } from '../AiPromptInput/types'

export interface ChatContentAreaProps {
  sessionId?: string
  assignEmployeeValue?: string
  employeeOptions?: AiPromptMentionOption[]
  defaultEmployeeValue?: string
  inputPlaceholder?: string
  inputDisabled?: boolean
  hideFirstUserMessage?: boolean
  onSessionKeyReady?: (sessionKey: string) => void
}

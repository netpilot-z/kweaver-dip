import { Drawer } from 'antd'
import { useMemo } from 'react'
import DipChatKit from '@/components/DipChatKit'
import type { AiPromptSubmitPayload } from '@/components/DipChatKit/components/AiPromptInput/types'
import type { DipChatKitAttachment, DipChatKitMessageTurn } from '@/components/DipChatKit/types'

export interface AddSkillDrawerProps {
  open: boolean
  onClose: () => void
  payload: AiPromptSubmitPayload | null
}

const mapFilesToAttachments = (files: File[]): DipChatKitAttachment[] => {
  return files.map((file) => ({
    uid: `${file.name}_${file.size}_${file.lastModified}`,
    name: file.name,
    size: file.size,
    type: file.type,
    file,
  }))
}

const AddSkillDrawer = ({ open, onClose, payload }: AddSkillDrawerProps) => {
  const defaultMessageTurns = useMemo<DipChatKitMessageTurn[]>(() => {
    if (!payload) return []

    return [
      {
        id: `seed_${Date.now()}`,
        question: payload.content,
        questionEmployees: payload.employees,
        questionAttachments: mapFilesToAttachments(payload.files),
        answerMarkdown: '',
        answerLoading: false,
        answerStreaming: false,
        createdAt: new Date().toISOString(),
        pendingSend: true,
      },
    ]
  }, [payload])

  return (
    <Drawer
      title="新建技能"
      open={open}
      onClose={onClose}
      closable={{ placement: 'end' }}
      mask={{ closable: false }}
      destroyOnHidden
      styles={{
        // DigitalHumanSetting 左侧菜单固定宽度 `w-60`（15rem），抽屉只覆盖右侧内容区
        wrapper: { width: 'calc(100% - 15rem)', minWidth: 0 },
        header: { borderBottom: 'none' },
        body: { padding: 0 },
      }}
      getContainer={() => document.getElementById('digital-human-setting-container') as HTMLElement}
    >
      <div className="flex flex-col h-full min-h-0">
        {/* 注意：DipChatKit 高度依赖父容器；同时用 seedKey 触发重建对话初始状态 */}
        <div className="flex flex-1 min-h-0">
          <DipChatKit
            onSend={() => {}}
            defaultMessageTurns={defaultMessageTurns}
            defaultEmployeeValue="__internal_skill_agent__"
          />
        </div>
      </div>
    </Drawer>
  )
}

export default AddSkillDrawer

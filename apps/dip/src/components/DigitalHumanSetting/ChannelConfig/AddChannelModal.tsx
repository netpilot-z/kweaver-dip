import type { ModalProps } from 'antd'
import { Form, Input, Modal, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import type { ChannelConfig, ChannelType } from '@/apis/dip-studio/digital-human'
import IconFont from '@/components/IconFont'

export interface AddChannelModalProps extends Omit<ModalProps, 'onCancel' | 'onOk'> {
  /** 确定成功的回调，传递通道配置 */
  onOk: (result: ChannelConfig) => void
  /** 取消回调 */
  onCancel: () => void
}

const CHANNEL_OPTIONS: Array<{ type: ChannelType; name: string; desc: string }> = [
  { type: 'feishu', name: '飞书', desc: '配置飞书应用信息' },
  { type: 'dingtalk', name: '钉钉', desc: '配置钉钉应用信息' },
]

/** 添加通道弹窗 */
const AddChannelModal = ({ open, onOk, onCancel }: AddChannelModalProps) => {
  const [form] = Form.useForm()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedType, setSelectedType] = useState<ChannelType | undefined>(undefined)
  const [, messageContextHolder] = message.useMessage()

  const selectedOption = useMemo(() => {
    return CHANNEL_OPTIONS.find((o) => o.type === selectedType)
  }, [selectedType])

  useEffect(() => {
    if (!open) return
    setStep(1)
    setSelectedType(undefined)
    form.resetFields()
  }, [open, form])

  const handleBack = () => {
    setStep(1)
    setSelectedType(undefined)
    form.resetFields()
  }

  const handleSelectChannel = (type: ChannelType) => {
    setSelectedType(type)
    setStep(2)
    form.resetFields()
  }

  const handleOk = async () => {
    if (step !== 2) return
    if (!selectedType) {
      message.error('请先选择通道类型')
      return
    }

    try {
      const values = await form.validateFields()
      const appId = (values.app_id as string | undefined)?.trim() ?? ''
      const appSecret = (values.app_secret as string | undefined)?.trim() ?? ''

      onOk({
        type: selectedType,
        appId,
        appSecret,
      })
      onCancel()
    } catch (err: any) {
      // 表单校验失败时不额外打断
      if (err?.errorFields) return
      message.error(err?.description || '配置失败，请稍后重试')
    }
  }

  return (
    <>
      {messageContextHolder}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {step === 2 && <IconFont type="icon-dip-left" onClick={handleBack} />}
            <span className="font-medium">
              {step === 1 ? '添加通道' : `配置${selectedOption?.name ?? ''}应用信息`}
            </span>
          </div>
        }
        open={open}
        onCancel={onCancel}
        onOk={handleOk}
        closable
        mask={{ closable: false }}
        destroyOnHidden
        width={520}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ disabled: step === 1 }}
        footer={
          step === 2
            ? (_, { OkBtn, CancelBtn }) => (
                <>
                  <OkBtn />
                  <CancelBtn />
                </>
              )
            : null
        }
      >
        {step === 1 ? (
          <div className="w-full flex flex-col gap-y-3">
            {CHANNEL_OPTIONS.map((option) => {
              const selected = option.type === selectedType
              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => handleSelectChannel(option.type)}
                  className={`w-full text-left rounded-[10px] border p-4 transition-colors ${
                    selected
                      ? 'border-[var(--dip-primary-color)] bg-[rgba(18,110,227,0.06)]'
                      : 'border-[--dip-border-color] hover:bg-[rgba(0,0,0,0.04)]'
                  }`}
                >
                  <div className="flex items-start gap-x-3">
                    <div className="w-10 h-10 rounded-md bg-[rgb(var(--dip-primary-color-rgb-space)/10%)] flex items-center justify-center flex-shrink-0">
                      <span className="text-[--dip-primary-color] font-medium">{option.name}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[--dip-text-color]">{option.name}</div>
                      <div className="text-xs text-[--dip-text-color-45] mt-1">{option.desc}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="w-full">
            <Form form={form} layout="vertical" className="mt-2">
              <Form.Item
                label="app_id"
                name="app_id"
                rules={[{ required: true, message: '请输入app_id' }]}
              >
                <Input placeholder="请输入应用的 app_id" autoComplete="off" />
              </Form.Item>

              <Form.Item
                label="app_secret"
                name="app_secret"
                rules={[{ required: true, message: '请输入app_secret' }]}
              >
                <Input.Password placeholder="请输入应用的 app_secret" autoComplete="off" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </>
  )
}

export default AddChannelModal

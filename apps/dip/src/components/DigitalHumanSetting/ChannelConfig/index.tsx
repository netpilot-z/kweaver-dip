import { Button, Tooltip } from 'antd'
import { memo, useState } from 'react'
import type { ChannelConfig as DhChannelConfig } from '@/apis/dip-studio/digital-human'
import Empty from '@/components/Empty'
import IconFont from '@/components/IconFont'
import ScrollBarContainer from '@/components/ScrollBarContainer'
import { useDigitalHumanStore } from '../digitalHumanStore'
import AddChannelModal from './AddChannelModal'

const CHANNEL_TYPE_LABEL: Record<NonNullable<DhChannelConfig['type']>, string> = {
  feishu: '飞书',
  dingtalk: '钉钉',
}

const ChannelConfig = ({ readonly }: { readonly?: boolean }) => {
  const { channel, updateChannel, deleteChannel } = useDigitalHumanStore()
  const [addChannelModalOpen, setAddChannelModalOpen] = useState(false)

  /** 添加通道 */
  const handleAddChannel = () => {
    setAddChannelModalOpen(true)
  }

  /** 添加通道结果 */
  const handleAddChannelResult = (result: DhChannelConfig) => {
    updateChannel(result)
  }

  /** 渲染通道列表 */
  const renderChannelList = () => {
    if (!channel) return null
    const label = CHANNEL_TYPE_LABEL[channel.type ?? 'feishu']
    return (
      <ScrollBarContainer className="mt-4 w-full flex flex-col gap-y-1 px-6">
        <div className="w-full flex items-center gap-x-2 border border-[--dip-border-color] rounded p-2 pl-3">
          <IconFont type="icon-dip-KG1" />
          <span className="truncate flex-1" title={label}>
            {label}
          </span>
          <Tooltip title="删除">
            <IconFont
              type="icon-dip-trash"
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center hover:bg-[--dip-hover-bg-color-4] rounded"
              onClick={() => deleteChannel()}
            />
          </Tooltip>
        </div>
      </ScrollBarContainer>
    )
  }

  /** 渲染状态内容 */
  const renderStateContent = () => {
    if (!channel) {
      return (
        <Empty title="暂无通道">
          {readonly ? undefined : (
            <Button
              className="mt-2"
              type="primary"
              icon={<IconFont type="icon-dip-add" />}
              onClick={() => {
                handleAddChannel()
              }}
            >
              添加通道
            </Button>
          )}
        </Empty>
      )
    }

    return null
  }

  const renderContent = () => {
    const stateContent = renderStateContent()

    if (stateContent) {
      return (
        <div className="absolute inset-0 flex items-center justify-center min-h-[340px]">
          {stateContent}
        </div>
      )
    }

    return renderChannelList()
  }

  return (
    <ScrollBarContainer className="h-full flex flex-col py-6 relative flex-1">
      <div className="flex justify-between px-6">
        <div className="flex flex-col gap-y-1">
          <div className="font-medium text-[--dip-text-color]">通道接入</div>
          <div className="text-[--dip-text-color-45]">
            配置数字员工可接入的通信通道，如企业微信、钉钉、飞书等。
          </div>
        </div>
        {channel && (
          <div className="flex items-end gap-x-3">
            <Button
              type="primary"
              icon={<IconFont type="icon-dip-add" />}
              onClick={handleAddChannel}
            >
              添加通道
            </Button>
          </div>
        )}
      </div>
      {renderContent()}

      {/* 添加通道弹窗 */}
      <AddChannelModal
        open={addChannelModalOpen}
        onOk={handleAddChannelResult}
        onCancel={() => setAddChannelModalOpen(false)}
      />
    </ScrollBarContainer>
  )
}

export default memo(ChannelConfig)

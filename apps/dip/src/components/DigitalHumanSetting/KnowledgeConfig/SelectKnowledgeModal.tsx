import type { ModalProps } from 'antd'
import { Button, Checkbox, Modal, message, Spin } from 'antd'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { getKnowledgeNetworks, type KnowledgeNetworkInfo } from '@/apis'
import AppIcon from '@/components/AppIcon'
import AiPromptInput from '@/components/DipChatKit/components/AiPromptInput'
import type { AiPromptSubmitPayload } from '@/components/DipChatKit/components/AiPromptInput/types'
import Empty from '@/components/Empty'
import IconFont from '@/components/IconFont'
import ScrollBarContainer from '@/components/ScrollBarContainer'
import { LoadStatus } from '@/types/enums'
import { formatTimeSlash } from '@/utils/handle-function/FormatTime'

export interface SelectKnowledgeModalProps extends Omit<ModalProps, 'onCancel' | 'onOk'> {
  /** 确定成功的回调，传递信息 */
  onOk: (result: KnowledgeNetworkInfo[]) => void
  /** 取消回调 */
  onCancel: () => void
  /** 默认选中的知识网络IDs */
  defaultSelectedIds?: string[]
}

/** 选择知识网络弹窗 */
const SelectKnowledgeModal = ({
  open,
  onOk,
  onCancel,
  defaultSelectedIds = [],
}: SelectKnowledgeModalProps) => {
  const [status, setStatus] = useState<LoadStatus>(LoadStatus.Empty)
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeNetworkInfo[]>([])
  const [selectedList, setSelectedList] = useState<KnowledgeNetworkInfo[]>([])
  const [messageApi, messageContextHolder] = message.useMessage()

  useEffect(() => {
    setSelectedList(knowledgeList.filter((item) => defaultSelectedIds?.includes(item.id)))
  }, [knowledgeList, defaultSelectedIds])

  // 获取知识网络列表
  const fetchKnowledgeNetworks = async () => {
    if (status === LoadStatus.Loading) return // 防止重复请求
    setStatus(LoadStatus.Loading)
    try {
      const result = await getKnowledgeNetworks({ limit: -1 })
      setKnowledgeList(result.entries)
      setStatus(result.total_count > 0 ? LoadStatus.Normal : LoadStatus.Empty)
    } catch (error: any) {
      messageApi.error(error?.description || '获取知识网络列表失败')
      setKnowledgeList([])
      setStatus(LoadStatus.Failed)
    }
  }

  useEffect(() => {
    if (open) {
      fetchKnowledgeNetworks()
    }
  }, [open])

  // 选择知识网络
  const handleSelect = (item: KnowledgeNetworkInfo) => {
    if (selectedList.some((selected) => selected.id === item.id)) {
      setSelectedList(selectedList.filter((selected) => selected.id !== item.id))
    } else {
      setSelectedList([...selectedList, item])
    }
  }

  // 确定
  const handleOk = () => {
    onOk(selectedList)
    onCancel()
  }

  const handleSubmit = (payload: AiPromptSubmitPayload) => {
    console.log(payload)
  }

  const renderStateContent = () => {
    if (status === LoadStatus.Loading) {
      return <Spin />
    }

    if (status === LoadStatus.Failed) {
      return <Empty type="failed" title="加载失败" />
    }

    if (status === LoadStatus.Empty) {
      return <Empty title="暂无知识" />
    }

    return null
  }

  const renderKnowledgeList = () => {
    return (
      <div className="grid grid-cols-2 gap-[14px]">
        {knowledgeList.map((item) => {
          const isSelected = selectedList.some((selected) => selected.id === item.id)
          return (
            <button
              key={item.id}
              type="button"
              className={clsx(
                'relative flex min-h-[94px] flex-col rounded-lg border border-[--dip-border-color] px-5 py-4 text-left outline-none transition-colors hover:bg-[rgba(0,0,0,0.02)]',
                isSelected &&
                  '!border-[--dip-primary-color] !bg-[rgba(18,110,227,0.06)] !hover:bg-[rgba(18,110,227,0.1)]',
              )}
              onClick={() => handleSelect(item)}
            >
              <div className="flex items-center gap-x-3">
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex overflow-hidden">
                  <AppIcon name={item.name} size={48} className="w-full h-full" shape="square" />
                </div>
                <div className="flex flex-col gap-y-2 flex-1">
                  <div className="flex items-center gap-x-2">
                    <span
                      className="text-base font-bold leading-[22px] text-[--dip-text-color-85] truncate flex-1"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <Checkbox
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleSelect(item)}
                    />
                  </div>
                  <div
                    className="mt-2 line-clamp-2 text-xs text-[--dip-text-color-65]"
                    title={item.comment}
                  >
                    {item.comment?.trim() || '[暂无描述]'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-end flex-1 h-0">
                <div className="h-px bg-[--dip-line-color-10] my-2" />
                <div className="text-right mt-2 text-xs text-[--dip-text-color-45]">
                  更新：{formatTimeSlash(item.update_time || '') || '--'}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  const renderContent = () => {
    const stateContent = renderStateContent()

    if (stateContent) {
      return <div className="absolute inset-0 flex items-center justify-center">{stateContent}</div>
    }

    return renderKnowledgeList()
  }

  return (
    <>
      {messageContextHolder}
      <Modal
        title="新建知识网络"
        open={open}
        onCancel={onCancel}
        closable
        mask={{ closable: false }}
        destroyOnHidden
        width={744}
        styles={{
          body: { paddingTop: 8 },
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="primary"
              className="h-8 min-w-[74px] rounded-md px-3 py-1 text-sm leading-[22px]"
              onClick={handleOk}
              disabled={status === LoadStatus.Loading}
            >
              确定
            </Button>
            <Button
              className="h-8 min-w-[74px] rounded-md px-3 py-1 text-sm leading-[22px]"
              onClick={onCancel}
            >
              取消
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-y-6">
          <AiPromptInput
            mentionOptions={[]}
            placeholder="可以直接输入你想要创建的业务知识网络，也可以直接选择下方的业务知识网络"
            onSubmit={handleSubmit}
            autoSize={{ minRows: 2, maxRows: 2 }}
          />

          <ScrollBarContainer className="grid max-h-[400px] overflow-y-auto relative min-h-[180px] mx-[-24px] px-6">
            {renderContent()}
          </ScrollBarContainer>
        </div>
      </Modal>
    </>
  )
}

export default SelectKnowledgeModal

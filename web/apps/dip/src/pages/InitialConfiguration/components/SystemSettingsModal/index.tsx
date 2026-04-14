import { Modal } from 'antd'
import clsx from 'classnames'
import { useEffect, useState } from 'react'
import intl from 'react-intl-universal'
import FuwulianjieIcon from '@/assets/icons/fuwulianjie.svg?react'
import IconFont from '../../../../components/IconFont'
import SystemConnectOpenClawPanel from './SystemConnectOpenClawPanel'
import SystemPresetResourcePanel from './SystemPresetResourcePanel'

interface SystemSettingsModalProps {
  open: boolean
  onClose: () => void
}

const SystemSettingsModal = ({ open, onClose }: SystemSettingsModalProps) => {
  const [activeMenuKey, setActiveMenuKey] = useState<'connect' | 'preset'>('connect')

  useEffect(() => {
    if (open) setActiveMenuKey('connect')
  }, [open])

  return (
    <Modal
      width={1020}
      open={open}
      centered
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      styles={{
        container: {
          height: '85vh',
          maxHeight: '648px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          padding: '0',
        },
        body: {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
        },
      }}
    >
      <div className="min-h-0 h-full flex overflow-hidden">
        <div className="w-60 px-3 py-5 bg-[#F5F5F4]">
          <div className="text-[17px] text-black font-semibold mb-6">
            {intl.get('sider.systemSettings')}
          </div>
          <button
            type="button"
            className={clsx(
              'w-full text-left rounded-md px-3 py-2 text-sm mb-2 text-[#4A5565] flex gap-x-2 items-center',
              activeMenuKey === 'connect'
                ? 'bg-[#E5E6EB] !text-[#1E2939] font-medium'
                : 'hover:bg-black/[0.04]',
            )}
            onClick={() => setActiveMenuKey('connect')}
          >
            <FuwulianjieIcon /> 服务连接配置
          </button>
          <button
            type="button"
            className={clsx(
              'w-full text-left rounded-md px-3 py-2 text-sm text-[#4A5565] flex gap-x-2 items-center',
              activeMenuKey === 'preset'
                ? 'bg-[#E5E6EB] !text-[#1E2939] font-medium'
                : 'hover:bg-black/[0.04]',
            )}
            onClick={() => setActiveMenuKey('preset')}
          >
            <IconFont type="icon-digital-human" /> 预置资源管理
          </button>
        </div>
        <div className="flex-1 min-w-0 py-5 overflow-auto">
          {activeMenuKey === 'connect' ? (
            <SystemConnectOpenClawPanel onCancel={onClose} />
          ) : (
            <SystemPresetResourcePanel onConfirmSuccess={onClose} />
          )}
        </div>
      </div>
    </Modal>
  )
}

export default SystemSettingsModal

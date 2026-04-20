import type { MenuProps } from 'antd'
import { Dropdown } from 'antd'
import clsx from 'classnames'
import { useState } from 'react'
import intl from 'react-intl-universal'
import AvatarIcon from '@/assets/images/sider/avatar.svg?react'
import type { RouteModule } from '@/routes/types'
import { useUserInfoStore } from '@/stores'
import SystemSettingsModal from '../../../pages/InitialConfiguration/components/SystemSettingsModal'
import IconFont from '../../IconFont'
export interface UserMenuItemProps {
  /** 是否折叠 */
  collapsed: boolean
  /** 模块 */
  module?: RouteModule
}

export const UserMenuItem = ({ collapsed, module }: UserMenuItemProps) => {
  const { userInfo, logout } = useUserInfoStore()
  const showSystemSettings =
    useUserInfoStore((s) => s.isAdmin && s.modules.includes('studio')) &&
    module !== 'system' &&
    module !== 'business'
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const displayName =
    userInfo?.email || userInfo?.vision_name || userInfo?.account || intl.get('sider.defaultUser')

  const menuItems: MenuProps['items'] = [
    ...(showSystemSettings
      ? [
          {
            key: 'system-settings',
            label: (
              <span className="flex items-center justify-between gap-2">
                {intl.get('sider.systemSettings')}
                <IconFont type="icon-right" className="text-xs" />
              </span>
            ),
            title: '',
            onClick: () => {
              setOpen(true)
            },
          },
        ]
      : []),
    {
      key: 'logout',
      label: intl.get('sider.logout'),
      title: '',
      onClick: handleLogout,
    },
  ]

  const trigger = (
    <div
      className={clsx(
        'flex items-center gap-2 min-w-0 w-full cursor-pointer',
        collapsed ? 'h-10 min-h-10 justify-center' : 'justify-start',
      )}
    >
      <AvatarIcon className="w-4 h-4 shrink-0" />
      {!collapsed && (
        <span
          className="flex-1 min-w-0 truncate text-sm text-[var(--dip-text-color)]"
          title={displayName}
        >
          {displayName}
        </span>
      )}
    </div>
  )

  return (
    <div className={clsx(collapsed && 'flex min-w-0 w-full flex-1')}>
      <Dropdown
        menu={{
          items: menuItems,
          inlineCollapsed: false,
        }}
        placement="topLeft"
        trigger={['click']}
      >
        {trigger}
      </Dropdown>
      <SystemSettingsModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

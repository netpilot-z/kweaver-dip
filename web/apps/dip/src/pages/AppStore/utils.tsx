import type { MenuProps } from 'antd'
import intl from 'react-intl-universal'
import type { ApplicationInfo } from '@/apis'
import IconFont from '@/components/IconFont'
import { WENSHU_APP_KEY } from '@/routes/types'
import { AppStoreActionEnum } from './types'

/** 应用商店操作菜单项 */
export const getAppStoreMenuItems = (
  app: ApplicationInfo,
  onMenuClick: (key: AppStoreActionEnum) => void,
): MenuProps['items'] => {
  const isWenshuApp = app.key === WENSHU_APP_KEY
  const items: any = [
    {
      key: AppStoreActionEnum.Config,
      icon: <IconFont type="icon-settings" />,
      label: intl.get('application.menu.config'),
      onClick: () => onMenuClick(AppStoreActionEnum.Config),
    },
    {
      key: AppStoreActionEnum.Run,
      icon: <IconFont type="icon-run" />,
      label: intl.get('application.menu.run'),
      onClick: () => onMenuClick(AppStoreActionEnum.Run),
    },
  ]
  if (!isWenshuApp) {
    items.push(
      ...[
        { type: 'divider' },
        {
          key: AppStoreActionEnum.Uninstall,
          icon: <IconFont type="icon-trash" />,
          danger: true,
          label: intl.get('application.menu.uninstall'),
          onClick: () => onMenuClick(AppStoreActionEnum.Uninstall),
        },
      ],
    )
  }
  return items
}

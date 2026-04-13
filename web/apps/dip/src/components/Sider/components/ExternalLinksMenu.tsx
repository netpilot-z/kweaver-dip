import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { useMemo } from 'react';
import intl from 'react-intl-universal';
import SidebarSystemIcon from '@/assets/images/sider/proton.svg?react';
import { useUserInfoStore } from '@/stores/userInfoStore';
import { BUSINESS_NETWORK_BASE_PATH } from '@/components/Sider/BusinessSider/menus';
import { getFullPath } from '@/utils/config';
import { getAccessToken, getRefreshToken } from '@/utils/http/token-config';
import { canAccessSystemWorkbench } from '@/pages/SystemWorkbench/access';
import IconFont from '../../IconFont';
import { SYSTEM_WORKBENCH_BASE_PATH } from '../SystemSider/menus';

export interface ExternalLinksMenuProps {
  /** 是否折叠侧栏 */
  collapsed: boolean;
  /** 可见路由角色（与主菜单一致） */
  roleIds?: Set<string>;
}

/**
 * 侧栏底部外链：业务知识网络 SSO、系统工作台
 */
export const ExternalLinksSection = ({ collapsed }: ExternalLinksMenuProps) => {
  const { userInfo } = useUserInfoStore();
  const items = useMemo<MenuProps['items']>(() => {
    const redirectUrl = '/studio/home';
    const token = getAccessToken();
    const refreshToken = getRefreshToken();
    const ssoSearchParams = new URLSearchParams({
      redirect_url: redirectUrl,
      product: 'adp',
    });
    if (token) {
      if (process.env.NODE_ENV === 'development') {
        // TODO: 测试使用
        ssoSearchParams.set(
          'token',
          'ory_at_1Ol1cd_wZVPwYNCr50AiR9dctvUvM1_mI2C-f481n6Y.uikVUF3c1Rf5KFBivT8JbYDE6VDFLplv_1KRiihWqWU'
        );
        ssoSearchParams.set(
          'refreshToken',
          'ory_rt_b1VBSySehSNQro5ZPZPTxScOEYVkNwaVpzTVk0tgCZI.8lJkppPN97yZSGWTlZOSxqz3fpoTg0dKTR8MwCWr5Uo'
        );
      } else {
        ssoSearchParams.set('token', token);
        ssoSearchParams.set('refreshToken', refreshToken);
      }
    }
    const businessNetworkHref = getFullPath(BUSINESS_NETWORK_BASE_PATH);
    const deployWorkbenchHref = getFullPath(SYSTEM_WORKBENCH_BASE_PATH);

    const baseItems: NonNullable<MenuProps['items']> = [
      {
        key: 'data-platform',
        title: intl.get('sider.externalBusinessNetwork'),
        label: (
          <a
            href={businessNetworkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 justify-between"
          >
            <span>{intl.get('sider.externalBusinessNetwork')}</span>
            <IconFont type="icon-arrowup" rotate={45} />
          </a>
        ),
        icon: <IconFont type="icon-graph" />,
      },
    ];

    if (canAccessSystemWorkbench(userInfo)) {
      baseItems.push({
        key: 'system',
        title: intl.get('sider.externalSystemWorkbench'),
        label: (
          <a
            href={deployWorkbenchHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 justify-between"
          >
            <span>{intl.get('sider.externalSystemWorkbench')}</span>
            <IconFont type="icon-arrowup" rotate={45} />
          </a>
        ),
        icon: <SidebarSystemIcon />,
      });
    }

    return baseItems;
  }, [userInfo]);

  return (
    <div className="shrink-0">
      <Menu mode="inline" selectedKeys={[]} items={items} inlineCollapsed={collapsed} selectable={false} />
    </div>
  );
};

export const ExternalLinksMenu = ExternalLinksSection;

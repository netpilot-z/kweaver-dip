import type { FunctionComponent, SVGProps } from 'react'
import type { UserRole } from '@/apis/dip-hub/user'
import auditIcon from '@/assets/icons/audit.svg?react'
import authIcon from '@/assets/icons/auth.svg?react'
import mailIcon from '@/assets/icons/mail.svg?react'
import defaultModelIcon from '@/assets/icons/model-default.svg?react'
import modelManagerIcon from '@/assets/icons/model-manager.svg?react'
import modelQuotaIcon from '@/assets/icons/model-quota.svg?react'
import modelStatisticsIcon from '@/assets/icons/model-statistics.svg?react'
import rolePolicyIcon from '@/assets/icons/role-policy.svg?react'
import thirdPartyMessagingPluginIcon from '@/assets/icons/third-party-messaging-plugin.svg?react'

/** 与 `*.svg?react` 默认导出一致，用于侧栏菜单 SVG 图标 */
export type SystemMenuIcon = FunctionComponent<SVGProps<SVGSVGElement>>

export interface SystemMenuLeafItem {
  key: string
  icon?: SystemMenuIcon
  label: string
  path: string
  page:
    | {
        type: 'micro-app'
        app: {
          name: string
          entry: string
        }
      }
    | {
        type: 'component'
        componentKey: string
      }
  roles?: UserRole[]
}

export interface SystemMenuGroupItem {
  key: string
  icon?: SystemMenuIcon
  label: string
  type?: 'group'
  children: SystemMenuItem[]
}

export type SystemMenuItem = SystemMenuLeafItem | SystemMenuGroupItem

export type SystemRoleFlags = Partial<Record<UserRole, boolean>>

export const SYSTEM_WORKBENCH_BASE_PATH = '/system-workbench'
export const buildSystemWorkbenchPath = (suffix = ''): string =>
  `${SYSTEM_WORKBENCH_BASE_PATH}${suffix}`

/**
 * business 菜单单一数据源：
 * - Sider 渲染读取这里
 * - 路由注册也读取这里
 * 新增菜单时只改这一处。
 */
export const systemMenuItems: SystemMenuItem[] = [
  {
    key: 'information-security',
    label: '信息安全管理',
    type: 'group',
    children: [
      {
        key: 'auth',
        label: '统一身份认证',
        icon: authIcon,
        children: [
          {
            key: 'user-org',
            label: '账户',
            path: buildSystemWorkbenchPath('/user-org'),
            page: {
              type: 'micro-app',
              app: {
                name: 'user-org',
                entry: '//ip:port/isfweb/userorgmgnt.html',
              },
            },
            roles: ['super_admin', 'sys_admin', 'sec_admin', 'org_manager'],
          },
          {
            key: 'cert-manage',
            label: '认证',
            path: buildSystemWorkbenchPath('/cert-manage'),
            page: {
              type: 'micro-app',
              app: {
                name: 'cert-manage',
                entry: '//ip:port/isfweb/certifictionmgnt.html',
              },
            },
            roles: ['super_admin', 'sys_admin', 'sec_admin'],
          },
        ],
      },
      {
        key: 'security',
        label: '角色与访问策略',
        icon: rolePolicyIcon,
        children: [
          {
            key: 'role-manage',
            label: '角色管理',
            path: buildSystemWorkbenchPath('/role-manage'),
            page: {
              type: 'micro-app',
              app: {
                name: 'role-manage',
                entry: '//ip:port/isfweb/rolemgnt.html',
              },
            },
            roles: ['super_admin', 'sec_admin'],
          },
        ],
      },
      {
        key: 'audit',
        label: '日志及审计',
        icon: auditIcon,
        children: [
          {
            key: 'auditlog',
            label: '审计日志',
            path: buildSystemWorkbenchPath('/auditlog'),
            page: {
              type: 'micro-app',
              app: {
                name: 'auditlog',
                entry: '//ip:port/isfweb/auditlog.html',
              },
            },
            roles: ['super_admin', 'sec_admin', 'audit_admin', 'org_audit'],
          },
        ],
      },
    ],
  },
  {
    key: 'model-authorization',
    label: '模型',
    type: 'group',
    children: [
      {
        key: 'model-manager',
        label: '模型管理',
        icon: modelManagerIcon,
        path: buildSystemWorkbenchPath('/model-authorization/mf-model-manager/model/list2'),
        page: {
          type: 'micro-app',
          app: {
            name: 'mf-model-manager/model/list2',
            entry: '//ip:port/mf-model-manager/index.html',
          },
        },
        roles: ['super_admin', 'sys_admin'],
      },
      {
        key: 'model-quota',
        label: '配额管理',
        icon: modelQuotaIcon,
        path: buildSystemWorkbenchPath('/model-authorization/mf-model-manager/model/quota'),
        page: {
          type: 'micro-app',
          app: {
            name: 'mf-model-manager/model/quota',
            entry: '//ip:port/mf-model-manager/index.html',
          },
        },
        roles: ['super_admin', 'sys_admin'],
      },
      {
        key: 'default-model',
        label: '默认模型',
        icon: defaultModelIcon,
        path: buildSystemWorkbenchPath('/model-authorization/mf-model-manager/model/default'),
        page: {
          type: 'micro-app',
          app: {
            name: 'mf-model-manager/model/default',
            entry: '//ip:port/mf-model-manager/index.html',
          },
        },
        roles: ['super_admin', 'sys_admin'],
      },
      {
        key: 'model-statistics',
        label: '模型统计',
        icon: modelStatisticsIcon,
        path: buildSystemWorkbenchPath('/model-authorization/mf-model-manager/model/statistics'),
        page: {
          type: 'micro-app',
          app: {
            name: 'mf-model-manager/model/statistics',
            entry: '//ip:port/mf-model-manager/index.html',
          },
        },
        roles: ['super_admin', 'sys_admin'],
      },
    ],
  },
  {
    key: 'public-service',
    label: '公共服务',
    type: 'group',
    children: [
      {
        key: 'mailconfig',
        label: '邮件服务',
        icon: mailIcon,
        path: buildSystemWorkbenchPath('/mailconfig'),
        page: {
          type: 'micro-app',
          app: {
            name: 'mailconfig',
            entry: '//ip:port/isfweb/mailconfig.html',
          },
        },
        roles: ['super_admin', 'sys_admin'],
      },
      {
        key: 'third-party-messaging-plugin',
        label: '第三方消息插件',
        icon: thirdPartyMessagingPluginIcon,
        path: buildSystemWorkbenchPath('/third-party-messaging-plugin'),
        page: {
          type: 'micro-app',
          app: {
            name: 'third-party-messaging-plugin',
            entry: '//ip:port/isfweb/third-party-messaging-plugin.html',
          },
        },
        roles: ['super_admin', 'sys_admin'],
      },
    ],
  },
]

const flattenLeafItems = (items: SystemMenuItem[]): SystemMenuLeafItem[] =>
  items.flatMap((item) => ('children' in item ? flattenLeafItems(item.children) : item))

export const systemLeafMenuItems: SystemMenuLeafItem[] = flattenLeafItems(systemMenuItems)

const hasAnyAllowedRole = (
  itemRoles: UserRole[] | undefined,
  roleFlags: SystemRoleFlags,
): boolean => {
  if (!itemRoles || itemRoles.length === 0) {
    return true
  }
  return itemRoles.some((role) => roleFlags[role])
}

export const filterSystemMenuItemsByRoles = (
  items: SystemMenuItem[],
  roleFlags: SystemRoleFlags,
): SystemMenuItem[] =>
  items.reduce<SystemMenuItem[]>((acc, item) => {
    if ('children' in item) {
      const filteredChildren = filterSystemMenuItemsByRoles(item.children, roleFlags)
      if (filteredChildren.length === 0) {
        return acc
      }
      acc.push({ ...item, children: filteredChildren })
      return acc
    }
    if (hasAnyAllowedRole(item.roles, roleFlags)) {
      acc.push(item)
    }
    return acc
  }, [])

const findAncestorKeysByPath = (
  items: SystemMenuItem[],
  pathname: string,
  parentKeys: string[] = [],
): string[] => {
  for (const item of items) {
    if ('children' in item) {
      const nextKeys = item.type === 'group' ? parentKeys : [...parentKeys, item.key]
      const found = findAncestorKeysByPath(item.children, pathname, nextKeys)
      if (found.length > 0) {
        return found
      }
      continue
    }
    if (pathname.startsWith(item.path)) {
      return parentKeys
    }
  }
  return []
}

export const getSystemWorkbenchAncestorKeysByPath = (
  pathname: string,
  items: SystemMenuItem[] = systemMenuItems,
): string[] => findAncestorKeysByPath(items, pathname)

export const defaultSystemMenuItem = systemLeafMenuItems[0]

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
// import thirdPartyMessagingPluginIcon from '@/assets/icons/third-party-messaging-plugin.svg?react'

/** 与 `*.svg?react` 默认导出一致，用于侧栏菜单 SVG 图标 */
export type SystemMenuIcon = FunctionComponent<SVGProps<SVGSVGElement>>

export interface SystemMenuLeafItem {
  key: string
  icon?: SystemMenuIcon
  labelKey: string
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
  labelKey: string
  type?: 'group'
  children: SystemMenuItem[]
}

export type SystemMenuItem = SystemMenuLeafItem | SystemMenuGroupItem

export type SystemRoleFlags = Partial<Record<UserRole, boolean>>

export const SYSTEM_WORKBENCH_BASE_PATH = '/system-workbench'
export const buildSystemWorkbenchPath = (suffix = ''): string =>
  `${SYSTEM_WORKBENCH_BASE_PATH}${suffix}`

/**
 * system 菜单单一数据源：
 * - Sider 渲染读取这里
 * - 路由注册也读取这里
 * 新增菜单时只改这一处。
 */
export const systemMenuItems: SystemMenuItem[] = [
  {
    key: 'information-security',
    labelKey: 'routes.systemMenu.information-security',
    type: 'group',
    children: [
      {
        key: 'auth',
        labelKey: 'routes.systemMenu.auth',
        icon: authIcon,
        children: [
          {
            key: 'user-org',
            labelKey: 'routes.systemMenu.user-org',
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
            labelKey: 'routes.systemMenu.cert-manage',
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
        labelKey: 'routes.systemMenu.security',
        icon: rolePolicyIcon,
        children: [
          {
            key: 'role-manage',
            labelKey: 'routes.systemMenu.role-manage',
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
        labelKey: 'routes.systemMenu.audit',
        icon: auditIcon,
        children: [
          {
            key: 'auditlog',
            labelKey: 'routes.systemMenu.auditlog',
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
    labelKey: 'routes.systemMenu.model-authorization',
    type: 'group',
    children: [
      {
        key: 'model-manager',
        labelKey: 'routes.systemMenu.model-manager',
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
        labelKey: 'routes.systemMenu.model-quota',
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
        labelKey: 'routes.systemMenu.default-model',
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
        labelKey: 'routes.systemMenu.model-statistics',
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
    labelKey: 'routes.systemMenu.public-service',
    type: 'group',
    children: [
      {
        key: 'mailconfig',
        labelKey: 'routes.systemMenu.mailconfig',
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
      // {
      //   key: 'third-party-messaging-plugin',
      //   labelKey: 'routes.systemMenu.third-party-messaging-plugin',
      //   icon: thirdPartyMessagingPluginIcon,
      //   path: buildSystemWorkbenchPath('/third-party-messaging-plugin'),
      //   page: {
      //     type: 'micro-app',
      //     app: {
      //       name: 'third-party-messaging-plugin',
      //       entry: '//ip:port/isfweb/third-party-messaging-plugin.html',
      //     },
      //   },
      //   roles: ['super_admin', 'sys_admin'],
      // },
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

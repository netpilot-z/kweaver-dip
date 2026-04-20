import { useCallback, useMemo } from 'react'
import intl from 'react-intl-universal'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  SYSTEM_WORKBENCH_BASE_PATH,
  systemLeafMenuItems,
} from '@/components/Sider/SystemSider/menus'
import type { RouteConfig } from '@/routes/types'
import { getRouteLabel, routeHasDisplayLabel } from '@/routes/utils'
import { useLanguageStore, useOEMConfigStore } from '@/stores'
import type { BreadcrumbItem } from '@/utils/micro-app/globalState'
import { Breadcrumb } from '../components/Breadcrumb'
import { UserInfo } from '../components/UserInfo'

/**
 * 系统工作台顶栏：与 BusinessHeader 同构（菜单最长路径匹配、Logo + 面包屑 + 侧栏隐藏时顶栏用户）
 */
const SystemHeader = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const { getOEMResourceConfig } = useOEMConfigStore()
  const { language } = useLanguageStore()
  const oemResourceConfig = getOEMResourceConfig(language)

  // 系统工作台当前无 URL 隐藏侧栏能力时，用户入口始终在侧栏
  const showHeaderUserInfo = false

  const homePath = '/'

  const currentRoute = useMemo(() => {
    const matchedSystemMenu = systemLeafMenuItems
      .filter((item) => location.pathname.startsWith(item.path))
      .sort((a, b) => b.path.length - a.path.length)[0]

    if (matchedSystemMenu) {
      return {
        key: matchedSystemMenu.key,
        labelKey: matchedSystemMenu.labelKey,
        path: matchedSystemMenu.path.replace(/^\//, ''),
        sidebarMode: 'hidden',
      } as RouteConfig
    }

    return undefined
  }, [location.pathname])

  const breadcrumbMode = (location.state as { breadcrumbMode?: string } | null)?.breadcrumbMode
  const isInitialConfigOnlyMode =
    currentRoute?.key === 'initial-configuration' && breadcrumbMode === 'init-only'

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [
      {
        key: 'section-system',
        name: intl.get('sider.externalSystemWorkbench'),
        path: SYSTEM_WORKBENCH_BASE_PATH,
      },
    ]

    if (currentRoute && routeHasDisplayLabel(currentRoute)) {
      items.push({
        key: currentRoute.key || `route-${currentRoute.path}`,
        name: getRouteLabel(currentRoute),
        path: currentRoute.path ? `/${currentRoute.path}` : undefined,
      })
    }

    return items
  }, [currentRoute, language])

  const handleBreadcrumbNavigate = useCallback(
    (item: BreadcrumbItem) => {
      if (!item.path) return
      navigate(item.path)
    },
    [navigate],
  )

  const logoUrl = oemResourceConfig?.['logo.png']

  return (
    <>
      <div className="flex items-center gap-x-8">
        <img src={logoUrl} alt="logo" className="h-8 w-auto" />
        <Breadcrumb
          type="system"
          items={breadcrumbItems}
          homePath={homePath}
          onNavigate={handleBreadcrumbNavigate}
          showHomeIcon={!isInitialConfigOnlyMode}
        />
      </div>

      <div className="flex items-center gap-x-4 h-full">
        {showHeaderUserInfo ? <UserInfo /> : null}
      </div>
    </>
  )
}

export default SystemHeader

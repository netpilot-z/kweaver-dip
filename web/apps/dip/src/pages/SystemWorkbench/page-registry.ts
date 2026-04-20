import type { ComponentType, LazyExoticComponent } from 'react'
import type { MenuWorkbenchComponentPageProps } from '@/pages/_shared/menu-workbench/types'

export type SystemWorkbenchComponentPageProps = MenuWorkbenchComponentPageProps

// 系统工作台组件页面注册
export const systemWorkbenchComponentPageRegistry: Record<
  string,
  | ComponentType<SystemWorkbenchComponentPageProps>
  | LazyExoticComponent<ComponentType<SystemWorkbenchComponentPageProps>>
> = {
  // "xx-page": React.lazy(() => import("./xx-page")),
}

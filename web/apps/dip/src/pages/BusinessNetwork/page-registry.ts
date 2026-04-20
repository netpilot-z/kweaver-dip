import type { ComponentType, LazyExoticComponent } from 'react'
import type { MenuWorkbenchComponentPageProps } from '@/pages/_shared/menu-workbench/types'

export type BusinessComponentPageProps = MenuWorkbenchComponentPageProps

// 业务组件页面注册
export const businessComponentPageRegistry: Record<
  string,
  | ComponentType<BusinessComponentPageProps>
  | LazyExoticComponent<ComponentType<BusinessComponentPageProps>>
> = {
  // "xx-page": React.lazy(() => import("./xx-page")),
}

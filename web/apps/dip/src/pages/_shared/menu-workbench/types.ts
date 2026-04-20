import type { ComponentType, LazyExoticComponent } from 'react'
import type { CurrentMicroAppInfo } from '@/stores/microAppStore'

export interface NavigateToMicroWidgetParams {
  name: string
  path: string
  isNewTab: boolean
}

/** 菜单叶子项（Business / System 工作台菜单与路由解析） */
export interface MenuWorkbenchLeafItem {
  key: string
  labelKey: string
  path: string
  page:
    | { type: 'micro-app'; app: { name: string; entry: string } }
    | { type: 'component'; componentKey: string }
}

export interface MenuWorkbenchComponentPageProps {
  appBasicInfo: CurrentMicroAppInfo | null
  homeRoute: string
  customProps: Record<string, unknown>
}

export type MenuWorkbenchComponentPageEntry =
  | ComponentType<MenuWorkbenchComponentPageProps>
  | LazyExoticComponent<ComponentType<MenuWorkbenchComponentPageProps>>

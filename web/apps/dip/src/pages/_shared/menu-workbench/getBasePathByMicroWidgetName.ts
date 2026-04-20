import { BASE_PATH } from '@/utils/config'
import type { MenuWorkbenchLeafItem } from './types'

export const resolveMicroWidgetMenuNameAlias = (microWidgetName: string): string => {
  if (microWidgetName === 'agent-web-dataagent') return 'agent-square'
  return microWidgetName
}

/** 从菜单叶子中按 micro-app 的 app.name 解析主应用下的完整 base path */
export async function getMenuWorkbenchBasePathByMicroWidgetName(
  leafMenuItems: MenuWorkbenchLeafItem[],
  microWidgetName: string,
): Promise<string> {
  const newName = resolveMicroWidgetMenuNameAlias(microWidgetName)
  const item = leafMenuItems.find(
    (menuItem) => menuItem.page?.type === 'micro-app' && menuItem.page?.app?.name === newName,
  )
  if (!item) return ''
  return `${BASE_PATH}${item.path}`
}

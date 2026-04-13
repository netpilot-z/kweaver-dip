import type { NavigateFunction } from 'react-router-dom';
import { getFullPath } from '@/utils/config';
import type { MenuWorkbenchLeafItem, NavigateToMicroWidgetParams } from './types';

/** 按菜单里 micro-app 的 app.name 解析跳转（新标签或路由内 navigate） */
export function createNavigateToMicroWidgetHandler(
  leafMenuItems: MenuWorkbenchLeafItem[],
  navigate: NavigateFunction,
  currentPath?: string
): (params: NavigateToMicroWidgetParams) => void {
  return params => {
    const item = leafMenuItems.find(
      menuItem => menuItem.page?.type === 'micro-app' && menuItem.page?.app?.name === params.name
    );
    if (!item) return;

    const targetPath = item.path + (params.path || '');
    if (params.isNewTab) {
      const url = `${window.location.origin}${getFullPath(targetPath)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      if (currentPath && item.path === currentPath) {
        // 如果当前路径是目标路径，navigate(targetPath)不会刷新页面，只是更新query参数，所以需要navigate(0)来刷新页面
        navigate(targetPath);
        navigate(0);
        return;
      }
      navigate(targetPath);
    }
  };
}

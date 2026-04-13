import { Spin } from 'antd';
import { memo, Suspense } from 'react';
import MicroAppComponent from '@/components/MicroAppComponent';
import type { CurrentMicroAppInfo } from '@/stores/microAppStore';
import { getFullPath } from '@/utils/config';
import type { MenuWorkbenchComponentPageEntry, MenuWorkbenchLeafItem } from './types';

export interface MenuWorkbenchContentProps {
  currentMenu: MenuWorkbenchLeafItem;
  microAppInfo: CurrentMicroAppInfo | null;
  customProps: Record<string, unknown>;
  /** 用于 getFullPath，如 /business-network、/system-workbench */
  sectionBasePath: string;
  microAppScopeClassName: string;
  componentRegistry: Record<string, MenuWorkbenchComponentPageEntry>;
  /**
   * 部分子应用在切换时会出现重复挂载问题：当 basename 包含该片段且当前菜单 key 与 microAppInfo 不一致时先不渲染
   */
  duplicateLoadGuardBasenameIncludes: string | string[];
}

export const MenuWorkbenchContent = memo(
  ({
    currentMenu,
    microAppInfo,
    customProps,
    sectionBasePath,
    microAppScopeClassName,
    componentRegistry,
    duplicateLoadGuardBasenameIncludes,
  }: MenuWorkbenchContentProps) => {
    if (
      currentMenu.key !== microAppInfo?.key &&
      (Array.isArray(duplicateLoadGuardBasenameIncludes)
        ? duplicateLoadGuardBasenameIncludes.some(basename => microAppInfo?.routeBasename?.includes(basename))
        : microAppInfo?.routeBasename?.includes(duplicateLoadGuardBasenameIncludes))
    ) {
      return null;
    }

    if (currentMenu.page.type === 'micro-app') {
      if (!microAppInfo) {
        return (
          <div className="h-full w-full flex items-center justify-center">
            <Spin />
          </div>
        );
      }
      return (
        <div className={microAppScopeClassName}>
          <MicroAppComponent
            appBasicInfo={microAppInfo}
            homeRoute={getFullPath(sectionBasePath)}
            customProps={customProps}
          />
        </div>
      );
    }

    const ComponentPage = componentRegistry[currentMenu.page.componentKey];
    if (ComponentPage) {
      return (
        <Suspense
          fallback={
            <div className="h-full w-full flex items-center justify-center">
              <Spin />
            </div>
          }
        >
          <ComponentPage
            appBasicInfo={microAppInfo}
            homeRoute={getFullPath(sectionBasePath)}
            customProps={customProps}
          />
        </Suspense>
      );
    }

    return (
      <div className="h-full w-full p-6">
        <div className="rounded-lg border border-[var(--dip-border-color)] bg-white p-6">
          未实现的组件页面：{currentMenu.page.componentKey}
        </div>
      </div>
    );
  }
);

MenuWorkbenchContent.displayName = 'MenuWorkbenchContent';

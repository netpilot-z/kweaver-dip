import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  SYSTEM_WORKBENCH_BASE_PATH,
  filterSystemMenuItemsByRoles,
  systemLeafMenuItems,
  systemMenuItems,
  type SystemMenuItem,
  type SystemMenuLeafItem,
} from '@/components/Sider/SystemSider/menus';
import { MenuWorkbenchContent } from '@/pages/_shared/menu-workbench/MenuWorkbenchContent';
import { createNavigateToMicroWidgetHandler } from '@/pages/_shared/menu-workbench/navigateToMicroWidget';
import { useMenuWorkbenchMicroAppInfo } from '@/pages/_shared/menu-workbench/useMenuWorkbenchMicroAppInfo';
import { useRedirectToDefaultMenuWhenAtRoot } from '@/pages/_shared/menu-workbench/useRedirectToDefaultMenuWhenAtRoot';
import { useLanguageStore, useUserInfoStore } from '@/stores';
import { BASE_PATH } from '@/utils/config';
import { canAccessSystemWorkbench } from './access';
import { SYSTEM_WORKBENCH_DUPLICATE_LOAD_GUARD_BASENAME_INCLUDES } from './duplicateLoadGuardBasenames';
import styles from './index.module.less';
import { buildSystemWorkbenchMicroAppProps } from './micro-app-props';
import { systemWorkbenchComponentPageRegistry } from './page-registry';
import SystemWorkbenchNoAccess from './SystemWorkbenchNoAccess';

const SystemWorkbenchAuthorized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { userInfo } = useUserInfoStore();
  const roleFlags = userInfo?.roles ?? {};

  const flattenLeafItems = (items: SystemMenuItem[]): SystemMenuLeafItem[] =>
    items.flatMap(item => ('children' in item ? flattenLeafItems(item.children) : item));

  const visibleSystemLeafMenuItems = useMemo(
    () => flattenLeafItems(filterSystemMenuItemsByRoles(systemMenuItems, roleFlags)),
    [roleFlags]
  );
  const defaultVisibleMenuItem = visibleSystemLeafMenuItems[0] ?? systemLeafMenuItems[0];
  const hasVisibleRouteMatch = visibleSystemLeafMenuItems.some(item => location.pathname.startsWith(item.path));
  const currentMenu =
    visibleSystemLeafMenuItems.find(item => location.pathname.startsWith(item.path)) ?? defaultVisibleMenuItem;

  const microAppInfo = useMenuWorkbenchMicroAppInfo(currentMenu);

  const navigateToMicroWidget = useMemo(
    () => createNavigateToMicroWidgetHandler(visibleSystemLeafMenuItems, navigate, location.pathname),
    [navigate, visibleSystemLeafMenuItems]
  );

  const customProps = useMemo(() => {
    return buildSystemWorkbenchMicroAppProps({
      basePath: `${BASE_PATH}${currentMenu.path}`,
      language,
      userInfo: userInfo ?? undefined,
      navigateToMicroWidget,
      navigate: (path: string) => {
        const newPath = path.replace(BASE_PATH, '');
        navigate(newPath);
      },
    });
  }, [currentMenu.path, language, navigate, navigateToMicroWidget, userInfo?.id]);

  useRedirectToDefaultMenuWhenAtRoot(
    location.pathname,
    SYSTEM_WORKBENCH_BASE_PATH,
    defaultVisibleMenuItem.path,
    navigate
  );

  useEffect(() => {
    const inSystemWorkbench =
      location.pathname === SYSTEM_WORKBENCH_BASE_PATH ||
      location.pathname.startsWith(`${SYSTEM_WORKBENCH_BASE_PATH}/`);
    if (!inSystemWorkbench || hasVisibleRouteMatch || !defaultVisibleMenuItem) {
      return;
    }
    navigate(defaultVisibleMenuItem.path, { replace: true });
  }, [defaultVisibleMenuItem, hasVisibleRouteMatch, location.pathname, navigate]);

  return (
    <div className="w-full h-full">
      <MenuWorkbenchContent
        currentMenu={currentMenu}
        microAppInfo={microAppInfo}
        customProps={customProps}
        sectionBasePath={SYSTEM_WORKBENCH_BASE_PATH}
        microAppScopeClassName={styles.microAppScope}
        componentRegistry={systemWorkbenchComponentPageRegistry}
        duplicateLoadGuardBasenameIncludes={SYSTEM_WORKBENCH_DUPLICATE_LOAD_GUARD_BASENAME_INCLUDES}
      />
    </div>
  );
};

const SystemWorkbench = () => {
  const { userInfo } = useUserInfoStore();
  // 仅按 userInfo.roles 中管理员角色判断，不用 isAdmin
  const allowed = canAccessSystemWorkbench(userInfo);
  if (!allowed) {
    return <SystemWorkbenchNoAccess />;
  }
  return <SystemWorkbenchAuthorized />;
};

export default SystemWorkbench;

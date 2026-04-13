import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  defaultSystemMenuItem,
  SYSTEM_WORKBENCH_BASE_PATH,
  systemLeafMenuItems,
} from '@/components/Sider/SystemSider/menus';
import { MenuWorkbenchContent } from '@/pages/_shared/menu-workbench/MenuWorkbenchContent';
import { createNavigateToMicroWidgetHandler } from '@/pages/_shared/menu-workbench/navigateToMicroWidget';
import { useMenuWorkbenchMicroAppInfo } from '@/pages/_shared/menu-workbench/useMenuWorkbenchMicroAppInfo';
import { useRedirectToDefaultMenuWhenAtRoot } from '@/pages/_shared/menu-workbench/useRedirectToDefaultMenuWhenAtRoot';
import { useLanguageStore, useUserInfoStore } from '@/stores';
import { BASE_PATH } from '@/utils/config';
import { canAccessSystemWorkbench } from './access';
import styles from './index.module.less';
import { buildSystemWorkbenchMicroAppProps } from './micro-app-props';
import { systemWorkbenchComponentPageRegistry } from './page-registry';
import SystemWorkbenchNoAccess from './SystemWorkbenchNoAccess';

const SystemWorkbenchAuthorized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { userInfo } = useUserInfoStore();
  const currentMenu =
    systemLeafMenuItems.find(item => location.pathname.startsWith(item.path)) ?? defaultSystemMenuItem;

  const microAppInfo = useMenuWorkbenchMicroAppInfo(currentMenu);

  const navigateToMicroWidget = useMemo(
    () => createNavigateToMicroWidgetHandler(systemLeafMenuItems, navigate),
    [navigate]
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
    defaultSystemMenuItem.path,
    navigate
  );

  return (
    <div className="w-full h-full">
      <MenuWorkbenchContent
        currentMenu={currentMenu}
        microAppInfo={microAppInfo}
        customProps={customProps}
        sectionBasePath={SYSTEM_WORKBENCH_BASE_PATH}
        microAppScopeClassName={styles.microAppScope}
        componentRegistry={systemWorkbenchComponentPageRegistry}
        duplicateLoadGuardBasenameIncludes="/mf-model-manager/"
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

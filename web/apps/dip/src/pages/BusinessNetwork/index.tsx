import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BUSINESS_NETWORK_BASE_PATH,
  businessLeafMenuItems,
  defaultBusinessMenuItem,
} from '@/components/Sider/BusinessSider/menus';
import { MenuWorkbenchContent } from '@/pages/_shared/menu-workbench/MenuWorkbenchContent';
import { createNavigateToMicroWidgetHandler } from '@/pages/_shared/menu-workbench/navigateToMicroWidget';
import { useMenuWorkbenchMicroAppInfo } from '@/pages/_shared/menu-workbench/useMenuWorkbenchMicroAppInfo';
import { useRedirectToDefaultMenuWhenAtRoot } from '@/pages/_shared/menu-workbench/useRedirectToDefaultMenuWhenAtRoot';
import { useLanguageStore, useUserInfoStore } from '@/stores';
import { useGlobalLayoutStore } from '@/stores/globalLayoutStore';
import { BASE_PATH } from '@/utils/config';
import styles from './index.module.less';
import { buildBusinessMicroAppProps } from './micro-app-props';
import { businessComponentPageRegistry } from './page-registry';

const BusinessNetwork = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { userInfo } = useUserInfoStore();
  const currentMenu =
    businessLeafMenuItems.find(item => location.pathname.startsWith(item.path)) ?? defaultBusinessMenuItem;

  const microAppInfo = useMenuWorkbenchMicroAppInfo(currentMenu);

  const navigateToMicroWidget = useMemo(
    () => createNavigateToMicroWidgetHandler(businessLeafMenuItems, navigate),
    [navigate]
  );

  const customProps = useMemo(() => {
    return buildBusinessMicroAppProps({
      basePath: `${BASE_PATH}${currentMenu.path}`,
      language,
      userInfo: userInfo ?? undefined,
      navigateToMicroWidget,
      toggleSideBarShow: (show: boolean) => {
        useGlobalLayoutStore.getState().setBusinessSiderHidden(!show);
      },
      navigate: (path: string) => {
        let newPath = path.replace(BASE_PATH, '');

        // 解决从agent无法跳转回业务知识网络页面的问题
        if (newPath.endsWith('/vega')) {
          newPath = `${newPath}/ontology`;
        }
        navigate(newPath);
      },
      changeCustomPathComponent: (param: { label: string } | null) => {
        useGlobalLayoutStore.getState().setBusinessHeaderCustomBreadcrumbLabel(param?.label ?? null);
      },
    });
  }, [currentMenu.path, language, navigate, navigateToMicroWidget, userInfo?.id]);

  /** URL：?hidesidebar=true 隐藏侧栏；?hideHeaderPath=true 隐藏顶栏面包屑；离开本页时恢复 */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hideSidebar = params.get('hidesidebar') === 'true';
    const hideHeaderBreadcrumb = params.get('hideHeaderPath') === 'true';
    const store = useGlobalLayoutStore.getState();
    store.setBusinessSiderHidden(hideSidebar);
    store.setBusinessHeaderBreadcrumbHidden(hideHeaderBreadcrumb);
    return () => {
      store.setBusinessSiderHidden(false);
      store.setBusinessHeaderBreadcrumbHidden(false);
      store.setBusinessHeaderCustomBreadcrumbLabel(null);
    };
  }, []);

  useRedirectToDefaultMenuWhenAtRoot(
    location.pathname,
    BUSINESS_NETWORK_BASE_PATH,
    defaultBusinessMenuItem.path,
    navigate
  );

  return (
    <div className="w-full h-full">
      <MenuWorkbenchContent
        currentMenu={currentMenu}
        microAppInfo={microAppInfo}
        customProps={customProps}
        sectionBasePath={BUSINESS_NETWORK_BASE_PATH}
        microAppScopeClassName={styles.microAppScope}
        componentRegistry={businessComponentPageRegistry}
        duplicateLoadGuardBasenameIncludes="/vega/"
      />
    </div>
  );
};

export default BusinessNetwork;

import { loadMicroApp } from 'qiankun';
import type { UserInfo } from '@/apis/dip-hub/user';
import { businessLeafMenuItems } from '@/components/Sider/BusinessSider/menus';
import { getMenuWorkbenchBasePathByMicroWidgetName } from '@/pages/_shared/menu-workbench/getBasePathByMicroWidgetName';
import { buildMicroWidgetUserInfoPayload, mapWorkbenchLanguage } from '@/pages/_shared/menu-workbench/isfUserContext';
import { createMenuWorkbenchToastApi } from '@/pages/_shared/menu-workbench/micro-app-toast';
import type { NavigateToMicroWidgetParams } from '@/pages/_shared/menu-workbench/types';
import { themeColors } from '@/styles/themeColors';
import { getAccessToken, getRefreshToken, httpConfig } from '@/utils/http/token-config';

export type { NavigateToMicroWidgetParams };

interface BuildBusinessMicroAppPropsOptions {
  basePath: string;
  language: string;
  userInfo?: UserInfo;
  navigateToMicroWidget: (params: NavigateToMicroWidgetParams) => void;
  toggleSideBarShow: (show: boolean) => void;
  navigate: (path: string) => void;
  changeCustomPathComponent: (param: { label: string } | null) => void;
}

/** 如 /dip-hub/business-network/vega|mdl/xxx → /dip-hub/business-network/vega|mdl */
const normalizeVegaBasePath = (basePath: string): string => {
  const prefixes = ['/vega/', '/mdl/'];
  const matchedPrefix = prefixes.find(prefix => basePath.includes(prefix));
  if (!matchedPrefix) return basePath;
  const idx = basePath.indexOf(matchedPrefix);
  return basePath.slice(0, idx + matchedPrefix.length - 1);
};

const plugins = {
  'operator-flow-detail': {
    app: {
      icon: '',
      pathname: '/operator-flow-detail',
      textENUS: '算子编排日志',
      textZHCN: '算子编排日志',
      textZHTW: '算子编排日志',
    },
    meta: {
      type: 'normal',
    },
    name: 'operator-flow-detail',
    orderIndex: 0,
    parent: 'plugins',
    subapp: {
      activeRule: '/',
      baseRouter: '',
      children: {},
      entry: '//ip:port/flow-web/operatorFlowDetail.html',
    },
  },
  'flow-web-operator': {
    app: {
      icon: '',
      pathname: '/flow-web-operator',
      textENUS: '算子编排',
      textZHCN: '算子编排',
      textZHTW: '算子编排',
    },
    meta: {
      type: 'normal',
    },
    name: 'flow-web-operator',
    orderIndex: 0,
    parent: 'plugins',
    subapp: {
      activeRule: '/',
      baseRouter: '',
      children: {},
      entry: '//ip:port/flow-web/operatorFlow.html',
    },
  },
  'doc-audit-client': {
    app: {
      icon: '//ip:port/doc-audit-client/taskbar-audit.svg',
      pathname: '/doc-audit-client',
      textENUS: '审核流程',
      textZHCN: '审核流程',
      textZHTW: '审核流程',
    },
    meta: {
      type: 'normal',
    },
    name: 'doc-audit-client',
    orderIndex: 0,
    parent: 'plugins',
    subapp: {
      activeRule: '/',
      baseRouter: '',
      children: {},
      entry: '//ip:port/doc-audit-client/',
    },
  },
  'workflow-manage-client': {
    app: {
      icon: '//ip:port/workflow-manage-client/taskbar-audit.svg',
      pathname: '/workflow-manage-client',
      textENUS: '审核模板',
      textZHCN: '审核模板',
      textZHTW: '审核模板',
    },
    meta: {
      type: 'normal',
    },
    name: 'workflow-manage-client',
    orderIndex: 0,
    parent: 'plugins',
    subapp: {
      activeRule: '/',
      baseRouter: '',
      children: {},
      entry: '//ip:port/workflow-manage-client/index.html',
    },
  },
};

/** 构建业务微应用 props */
export const buildBusinessMicroAppProps = ({
  basePath,
  language,
  userInfo,
  navigateToMicroWidget,
  toggleSideBarShow,
  navigate,
  changeCustomPathComponent,
}: BuildBusinessMicroAppPropsOptions) => {
  const resolvedBasePath = normalizeVegaBasePath(basePath);
  const userInfoPayload = buildMicroWidgetUserInfoPayload(userInfo);
  const lang = mapWorkbenchLanguage(language);
  const theme = themeColors.primary;

  return {
    lang,
    username: userInfo?.account ?? '',
    userid: userInfo?.id ?? '',
    prefix: '',
    toggleSideBarShow,
    changeCustomPathComponent,
    businessDomainID: 'bd_public',
    changeBusinessDomain: () => {},
    _qiankun: {
      loadMicroApp,
    },
    config: {
      get systemInfo() {
        const config = {
          location: window.location,
          as_access_prefix: '',
        };
        return config;
      },
      getTheme: {
        normal: theme,
        active: '#064fbd',
        activeRgba: '6,79,189',
        disabled: '#65b1fc',
        disabledRgba: '101,177,252',
        hover: '#3a8ff0',
        hoverRgba: '58,143,240',
        normalRgba: '18,110,227',
      },
      getMicroWidgetByName: (name: string) => {
        const plugin = plugins[name as keyof typeof plugins];
        if (!plugin) return undefined;

        return {
          ...plugin,
          subapp: {
            ...plugin.subapp,
            entry: plugin.subapp.entry.replace('ip:port', window.location.host),
          },
        };
      },
      getMicroWidgets() {
        return plugins;
      },
      userInfo: userInfoPayload,
    },
    language: {
      getLanguage: lang,
    },
    token: {
      onTokenExpired: httpConfig.onTokenExpired,
      refreshOauth2Token: httpConfig.refreshToken || (async () => ({ accessToken: '' })),
      getToken: {
        get access_token() {
          return getAccessToken();
        },
        get refresh_token() {
          return getRefreshToken();
        },
        id_token: '',
      },
    },
    theme,
    userInfo: userInfoPayload,
    history: {
      getBasePath: resolvedBasePath,
      async getBasePathByName(microWidgetName: string) {
        return getMenuWorkbenchBasePathByMicroWidgetName(businessLeafMenuItems, microWidgetName);
      },
      navigateToMicroWidget,
    },
    component: {
      toast: () => createMenuWorkbenchToastApi(),
    },
    navigate,
    oemConfigs: {
      theme,
    },
  };
};

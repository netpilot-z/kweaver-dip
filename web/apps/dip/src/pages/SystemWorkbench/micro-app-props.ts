import { loadMicroApp } from 'qiankun'
import type { UserInfo } from '@/apis/dip-hub/user'
import { systemLeafMenuItems } from '@/components/Sider/SystemSider/menus'
import { getMenuWorkbenchBasePathByMicroWidgetName } from '@/pages/_shared/menu-workbench/getBasePathByMicroWidgetName'
import {
  buildMicroWidgetUserInfoPayload,
  mapWorkbenchLanguage,
} from '@/pages/_shared/menu-workbench/isfUserContext'
import { createMenuWorkbenchToastApi } from '@/pages/_shared/menu-workbench/micro-app-toast'
import type { NavigateToMicroWidgetParams } from '@/pages/_shared/menu-workbench/types'
import { themeColors } from '@/styles/themeColors'
import { getAccessToken, getRefreshToken, httpConfig } from '@/utils/http/token-config'

export type { NavigateToMicroWidgetParams }

interface BuildSystemWorkbenchMicroAppPropsOptions {
  basePath: string
  language: string
  userInfo?: UserInfo
  navigateToMicroWidget: (params: NavigateToMicroWidgetParams) => void
  navigate: (path: string) => void
}

/** 构建系统工作台微应用 props */
export const buildSystemWorkbenchMicroAppProps = ({
  basePath,
  language,
  userInfo,
  navigateToMicroWidget,
  navigate,
}: BuildSystemWorkbenchMicroAppPropsOptions) => {
  const userInfoPayload = buildMicroWidgetUserInfoPayload(userInfo)
  const lang = mapWorkbenchLanguage(language)
  const theme = themeColors.primary

  return {
    lang,
    username: userInfo?.account ?? '',
    userid: userInfo?.id ?? '',
    prefix: '',
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
        }
        return config
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
      getMicroWidgetByName: () => {
        return undefined
      },
      getMicroWidgets() {
        return []
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
          return getAccessToken()
        },
        get refresh_token() {
          return getRefreshToken()
        },
        id_token: '',
      },
    },
    theme,
    userInfo: userInfoPayload,
    history: {
      getBasePath: basePath,
      async getBasePathByName(microWidgetName: string) {
        return getMenuWorkbenchBasePathByMicroWidgetName(systemLeafMenuItems, microWidgetName)
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
  }
}

import '../../public-path'
import React from 'react'
import ReactDOM from 'react-dom'
import 'normalize.css'
import 'antd/dist/antd.less'
import '../../common.less'
import '../../font/iconfont.css'
import '../../font/iconfont.js'
import { ConfigProvider, message } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import App from './App'
import {
    MicroAppPropsProvider,
    type IMicroAppProps,
} from '@/context/MicroAppPropsProvider'

ConfigProvider.config({
    prefixCls: 'any-fabric-ant',
    iconPrefixCls: 'any-fabric-anticon',
})

message.config({
    maxCount: 1,
    duration: 3,
})

// eslint-disable-next-line no-underscore-dangle
window.__MICRO_APP_TYPE__ = 'chat-copilot'

function transformPropsToMicroAppProps(props: any): IMicroAppProps {
    if (
        props?.token?.accessToken ||
        props?.user?.id ||
        props?.route?.basename
    ) {
        return props
    }

    const microWidgetProps = props?.microWidgetProps || props

    return {
        token: {
            get accessToken(): string {
                return microWidgetProps?.token?.getToken?.access_token || ''
            },
            refreshToken: async () => {
                const result =
                    await microWidgetProps?.token?.refreshOauth2Token?.()

                return {
                    accessToken: result?.access_token || '',
                }
            },
            onTokenExpired: microWidgetProps?.token?.onTokenExpired,
        },
        route: {
            basename:
                microWidgetProps?.history?.getBasePath || 'chatCopilot.html',
        },
        user: {
            id: microWidgetProps?.config?.userInfo?.id || '',
            get vision_name(): string {
                return (
                    microWidgetProps?.config?.userInfo?.user?.displayName || ''
                )
            },
            get account(): string {
                return microWidgetProps?.config?.userInfo?.user?.loginName || ''
            },
        },
        application: microWidgetProps?.application,
        renderAppMenu: microWidgetProps?.renderAppMenu,
        logout: microWidgetProps?.logout,
        setMicroAppState: microWidgetProps?.setMicroAppState,
        onMicroAppStateChange: microWidgetProps?.onMicroAppStateChange,
        container: microWidgetProps?.container,
        toggleSideBarShow: microWidgetProps?.toggleSideBarShow,
    }
}

function render(props?: any) {
    const { container } = props || {}
    const microAppProps = transformPropsToMicroAppProps(props)
    const mountNode =
        container?.querySelector('#chat-copilot-root') ||
        document.querySelector('#chat-copilot-root')

    ReactDOM.render(
        <ConfigProvider
            locale={zhCN}
            prefixCls="any-fabric-ant"
            iconPrefixCls="any-fabric-anticon"
            autoInsertSpaceInButton={false}
            getPopupContainer={() => mountNode || document.body}
        >
            <MicroAppPropsProvider initMicroAppProps={microAppProps}>
                <App />
            </MicroAppPropsProvider>
        </ConfigProvider>,
        mountNode,
    )
}

// eslint-disable-next-line no-underscore-dangle
if (!window.__POWERED_BY_QIANKUN__) {
    render({})
}

export function bootstrap() {
    return Promise.resolve()
}

export async function mount(props: any) {
    render(props)
}

export async function unmount(props: any) {
    const { container } = props || {}
    const mountNode =
        container?.querySelector('#chat-copilot-root') ||
        document.querySelector('#chat-copilot-root')

    if (mountNode) {
        ReactDOM.unmountComponentAtNode(mountNode)
    }
}

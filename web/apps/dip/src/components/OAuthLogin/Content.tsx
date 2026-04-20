import { memo, useEffect, useMemo, useRef } from 'react'
import intl from 'react-intl-universal'
import { useSearchParams } from 'react-router-dom'
import { getLoginUrl } from '@/apis'
import { useLanguageStore } from '@/stores/languageStore'
import { useOEMConfigStore } from '@/stores/oemConfigStore'

interface ContentProps {
  iframeHeight: number
  width?: number | string
}

function Content({ iframeHeight, width = 560 }: ContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [searchParams] = useSearchParams()
  const { getOEMResourceConfig } = useOEMConfigStore()
  const { language } = useLanguageStore()
  const oemResourceConfig = getOEMResourceConfig(language)

  // 获取重定向地址（登录成功后跳转）
  const asredirect = searchParams.get('asredirect') || undefined

  // 构建登录 URL
  const loginUrl = getLoginUrl(asredirect)

  // 开发环境下直接跳转到登录URL（登录回调会由后端处理并重定向到/login-success）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.location.href = loginUrl
    }
  }, [loginUrl])

  const widthStyle =
    typeof width === 'number' ? `${width}px` : typeof width === 'string' ? width : '560px'

  const logoUrl = useMemo(() => {
    return oemResourceConfig?.['logo.png']
  }, [oemResourceConfig])

  return (
    <>
      <img src={logoUrl} alt="logo" className="h-8 w-full mx-auto" />
      {/* <span className="text-center text-base text-gray-500 mx-auto">决策智能体平台</span> */}
      <iframe
        src={loginUrl}
        ref={iframeRef}
        className="border-none"
        style={{ height: `${iframeHeight}px`, width: widthStyle }}
        title={intl.get('oauthLogin.iframeTitle')}
      />
    </>
  )
}

export default memo(Content)

import { useEffect } from 'react'
import type { NavigateFunction } from 'react-router-dom'

/** 访问工作台根路径（如 /business-network）时重定向到默认菜单 */
export function useRedirectToDefaultMenuWhenAtRoot(
  pathname: string,
  sectionBasePath: string,
  defaultMenuPath: string,
  navigate: NavigateFunction,
) {
  useEffect(() => {
    if (pathname === sectionBasePath) {
      navigate(defaultMenuPath, { replace: true })
    }
  }, [pathname, navigate, sectionBasePath, defaultMenuPath])
}

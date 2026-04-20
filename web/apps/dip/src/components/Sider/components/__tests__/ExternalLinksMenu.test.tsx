import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { UserInfo } from '@/apis'
import { BUSINESS_NETWORK_BASE_PATH } from '@/components/Sider/BusinessSider/menus'
import { SYSTEM_WORKBENCH_BASE_PATH } from '@/components/Sider/SystemSider/menus'
import { getFullPath } from '@/utils/config'

const userInfoFixture = { userInfo: null as UserInfo | null }
vi.mock('@/stores/userInfoStore', () => ({
  useUserInfoStore: () => ({ userInfo: userInfoFixture.userInfo }),
}))

vi.mock('@/utils/http/token-config', () => ({
  getAccessToken: () => 'token',
  getRefreshToken: () => 'refresh',
}))
vi.mock('@/components/IconFont', () => ({
  default: () => <span data-testid="icon-font" />,
}))
vi.mock('@/assets/images/sider/proton.svg?react', () => ({
  default: () => <span data-testid="system-icon" />,
}))

import { ExternalLinksSection } from '../ExternalLinksMenu'

describe('Sider/ExternalLinksMenu', () => {
  beforeEach(() => {
    userInfoFixture.userInfo = null
  })

  it('管理员渲染系统工作台外链并带正确 href', () => {
    userInfoFixture.userInfo = { roles: { sys_admin: true } } as UserInfo
    render(<ExternalLinksSection collapsed={false} />)
    const sso = screen.getByRole('link', { name: /sider.externalBusinessNetwork/ })
    const deploy = screen.getByRole('link', { name: /sider.externalSystemWorkbench/ })

    expect(sso).toHaveAttribute('href', getFullPath(BUSINESS_NETWORK_BASE_PATH))
    expect(deploy).toHaveAttribute('href', getFullPath(SYSTEM_WORKBENCH_BASE_PATH))
    expect(sso).toHaveAttribute('target', '_blank')
    expect(deploy).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('非管理员不展示系统工作台', () => {
    userInfoFixture.userInfo = { roles: { normal_user: true } } as UserInfo
    render(<ExternalLinksSection collapsed={false} />)
    expect(screen.getByRole('link', { name: /全局业务知识网络/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /系统工作台/ })).not.toBeInTheDocument()
  })
})

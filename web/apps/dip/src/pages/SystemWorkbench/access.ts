import type { UserInfo, UserRole } from '@/apis/dip-hub/user'

/** 可进入系统工作台的管理类角色（与侧栏/微应用侧约定一致） */
const SYSTEM_WORKBENCH_ROLES: readonly Exclude<UserRole, 'normal_user'>[] = [
  'super_admin',
  'sys_admin',
  'audit_admin',
  'sec_admin',
  'org_manager',
  'org_audit',
]

/**
 * 是否允许访问系统工作台（普通用户仅 normal_user 时为 false）
 */
export function canAccessSystemWorkbench(userInfo: UserInfo | null | undefined): boolean {
  const roles = userInfo?.roles
  if (!roles) return false
  return SYSTEM_WORKBENCH_ROLES.some((role) => roles[role])
}

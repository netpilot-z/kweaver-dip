/** 用户角色 */
export type UserRole =
  | 'normal_user'
  | 'super_admin'
  | 'org_manager'
  | 'org_audit'
  | 'sys_admin'
  | 'audit_admin'
  | 'sec_admin'

/** 用户信息 */
export interface UserInfo {
  /** 用户ID */
  id: string
  /** 账号 */
  account: string
  /** 显示名称 */
  vision_name: string
  /** 邮箱 */
  email?: string
  /** 角色 */
  roles?: Record<UserRole, boolean>
}

/** 角色对象 */
export interface RoleInfo {
  /** 角色ID */
  role_id: string
  /** 角色名称 */
  role_name: string
}

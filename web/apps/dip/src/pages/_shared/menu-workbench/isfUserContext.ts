import type { UserInfo, UserRole } from '@/apis/dip-hub/user'

export const mapWorkbenchLanguage = (language: string): 'zh-cn' | 'zh-tw' | 'en-us' => {
  if (language === 'zh-TW') return 'zh-tw'
  if (language === 'en-US') return 'en-us'
  return 'zh-cn'
}

const roleIdMap: Record<Exclude<UserRole, 'normal_user'>, string> = {
  super_admin: '7dcfcc9c-ad02-11e8-aa06-000c29358ad6',
  sys_admin: 'd2bd2082-ad03-11e8-aa06-000c29358ad6',
  audit_admin: 'def246f2-ad03-11e8-aa06-000c29358ad6',
  sec_admin: 'd8998f72-ad03-11e8-aa06-000c29358ad6',
  org_manager: 'e63e1c88-ad03-11e8-aa06-000c29358ad6',
  org_audit: 'f06ac18e-ad03-11e8-aa06-000c29358ad6',
}

/** 微应用侧 ISF 等协议需要的角色列表 */
export const formatUserRolesForIsf = (
  roles: Partial<Record<UserRole, boolean>>,
): Array<{ id: string }> => {
  return Object.entries(roles).reduce((acc: Array<{ id: string }>, [key, value]) => {
    if (key !== 'normal_user' && value) {
      const roleId = roleIdMap[key as Exclude<UserRole, 'normal_user'>]
      if (roleId) {
        acc.push({ id: roleId })
      }
    }
    return acc
  }, [])
}

/** 兼容微应用里读取的 microWidgetProps.config.userInfo */
export const buildMicroWidgetUserInfoPayload = (userInfo?: UserInfo) => {
  const loginName = userInfo?.account ?? ''
  const userid = userInfo?.id ?? ''
  return {
    id: userid,
    user: {
      loginName,
      displayName: userInfo?.vision_name ?? '',
      email: userInfo?.email ?? '',
      roles: formatUserRolesForIsf(userInfo?.roles ?? {}),
    },
  }
}

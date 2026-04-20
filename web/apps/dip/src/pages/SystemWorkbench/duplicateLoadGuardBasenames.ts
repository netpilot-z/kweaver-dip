/**
 * 系统工作台内部分子应用切换时会出现重复挂载：basename 含以下任一片段且菜单 key 与当前微应用不一致时先不渲染。
 * 与 MenuWorkbenchContent 的 duplicateLoadGuardBasenameIncludes 约定一致。
 */
export const SYSTEM_WORKBENCH_DUPLICATE_LOAD_GUARD_BASENAME_INCLUDES: string[] = [
  '/mf-model-manager/',
  '/user-org',
  '/cert-manage',
  '/role-manage',
  '/auditlog',
  '/mailconfig',
  '/third-party-messaging-plugin',
]

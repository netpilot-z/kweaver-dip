import { isPublicChannelVisible } from '@/utils/publicEnv'
import { type DESettingMenuItem, DESettingMenuKey } from './types'

export const deSettingMenuItems: DESettingMenuItem[] = [
  { key: DESettingMenuKey.BASIC, label: '基本设定' },
  { key: DESettingMenuKey.SKILL, label: '技能配置' },
  {
    key: DESettingMenuKey.KNOWLEDGE,
    label: '知识配置',
  },
  { key: DESettingMenuKey.CHANNEL, label: '通道接入' },
]

/** 侧栏菜单项（受 `PUBLIC_CHANNEL_VISIBLE` 影响时去掉「通道接入」） */
export const getDeSettingMenuItems = (): DESettingMenuItem[] => {
  if (!isPublicChannelVisible) {
    return deSettingMenuItems.filter((i) => i.key !== DESettingMenuKey.CHANNEL)
  }
  return deSettingMenuItems
}

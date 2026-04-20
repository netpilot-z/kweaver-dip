import intl from 'react-intl-universal'
import { ConfigMenuType } from './types'

/** 配置菜单项 */
export const getConfigMenuItems = (): Array<{ key: ConfigMenuType; label: string }> => [
  { key: ConfigMenuType.BASIC, label: intl.get('application.config.menuBasic') },
  { key: ConfigMenuType.ONTOLOGY, label: intl.get('application.config.menuOntology') },
  { key: ConfigMenuType.AGENT, label: intl.get('application.config.menuAgent') },
]

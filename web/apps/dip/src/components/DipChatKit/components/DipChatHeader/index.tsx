import { Tag, Tooltip } from 'antd'
import clsx from 'clsx'
import type React from 'react'
import intl from 'react-intl-universal'
import IconFont from '@/components/IconFont'
import styles from './index.module.less'
import type { DipChatHeaderProps } from './types'

const DipChatHeader: React.FC<DipChatHeaderProps> = ({
  title,
  digitalHumanName,
  digitalHumanAvatarSrc,
  digitalHumanDeleted = false,
}) => {
  const digitalHumanLabel = intl.get('dipChatKit.digitalHumanLabel').d('数字员工') as string
  const deletedLabel = intl.get('dipChatKit.deletedTag').d('已删除') as string
  const subtitle = `${digitalHumanLabel}：${digitalHumanName || '-'}`
  const subtitleTooltip = digitalHumanDeleted ? `${subtitle} ${deletedLabel}` : subtitle

  return (
    <div className={clsx('DipChatHeader', styles.root)}>
      {digitalHumanAvatarSrc ? (
        <img
          src={digitalHumanAvatarSrc}
          alt={digitalHumanName || ''}
          className={styles.titleAvatar}
        />
      ) : (
        <IconFont type="icon-digital-human" className={styles.titleIcon} />
      )}
      <div className={styles.textWrap}>
        <Tooltip title={title} placement="right">
          <span className={styles.titleText}>{title}</span>
        </Tooltip>
        <Tooltip title={subtitleTooltip} placement="right">
          <div className={styles.subtitleText}>
            <span className={styles.subtitleValue}>{subtitle}</span>
            {digitalHumanDeleted && (
              <Tag bordered={false} color="default" className={styles.deletedTag}>
                {deletedLabel}
              </Tag>
            )}
          </div>
        </Tooltip>
      </div>
    </div>
  )
}

export default DipChatHeader

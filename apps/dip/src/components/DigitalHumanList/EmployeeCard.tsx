import { Card, Dropdown, type MenuProps } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import type { DigitalHuman } from '@/apis'
import dh1 from '@/assets/icons/avator/dh_1.svg'
import dh2 from '@/assets/icons/avator/dh_2.svg'
import dh3 from '@/assets/icons/avator/dh_3.svg'
import dh4 from '@/assets/icons/avator/dh_4.svg'
import dh5 from '@/assets/icons/avator/dh_5.svg'
import dh6 from '@/assets/icons/avator/dh_6.svg'
import dh7 from '@/assets/icons/avator/dh_7.svg'
import dh8 from '@/assets/icons/avator/dh_8.svg'
import AppIcon from '../AppIcon'
import IconFont from '../IconFont'

const avatarIconMap: Record<string, string> = {
  dh_1: dh1,
  dh_2: dh2,
  dh_3: dh3,
  dh_4: dh4,
  dh_5: dh5,
  dh_6: dh6,
  dh_7: dh7,
  dh_8: dh8,
}

interface EmployeeCardProps {
  digitalHuman: DigitalHuman
  width: number
  menuItems?: MenuProps['items']
  /** 卡片菜单点击回调 */
  onCardClick?: (digitalHuman: DigitalHuman) => void
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ digitalHuman, menuItems, onCardClick }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const avatarSrc = digitalHuman.icon_id ? avatarIconMap[digitalHuman.icon_id] : undefined
  const ext = digitalHuman as DigitalHuman & {
    skills?: unknown[]
    bkn?: unknown[]
    channel?: unknown
  }
  const skillCount = Array.isArray(ext.skills) ? ext.skills.length : 0
  const knowledgeCount = Array.isArray(ext.bkn) ? ext.bkn.length : 0
  const channelCount = ext.channel ? 1 : 0

  return (
    <Card
      className="group w-full cursor-pointer rounded-[20px] transition-all"
      styles={{
        root: {
          height: 282,
          border: '1px solid #E2E8F0',
          boxShadow: hovered
            ? '0 20px 40px -18px rgba(0, 0, 0, 0.1), 0 12px 24px -12px rgba(0, 0, 0, 0.25)'
            : '0px 10px 15px -3px rgba(0, 0, 0, 0.1)',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
          overflow: 'hidden',
        },
        body: {
          height: '100%',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      onClick={() => {
        onCardClick?.(digitalHuman)
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-xl">
          {avatarSrc ? (
            <img src={avatarSrc} alt={digitalHuman.name} className="w-14 h-14 object-cover" />
          ) : (
            <AppIcon name={digitalHuman.name} size={56} className="w-14 h-14" shape="square" />
          )}
        </div>
        {menuItems && menuItems.length > 0 && (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
            onOpenChange={(open) => {
              setMenuOpen(open)
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
              }}
              className={clsx(
                'w-6 h-6 flex items-center justify-center rounded-md text-[var(--dip-text-color-45)] hover:text-[var(--dip-text-color-85)] hover:bg-[--dip-hover-bg-color] transition-colors',
                menuOpen && 'text-[var(--dip-text-color-85)] bg-[--dip-hover-bg-color]',
              )}
            >
              <IconFont type="icon-more" />
            </button>
          </Dropdown>
        )}
      </div>

      <div className="mt-6 text-[22px] leading-[22px] font-bold truncate" title={digitalHuman.name}>
        {digitalHuman.name}
      </div>
      <p
        className="mt-8 text-sm leading-[22px] text-[rgba(0,0,0,0.5)] line-clamp-2 min-h-[44px]"
        title={digitalHuman.creature}
      >
        {digitalHuman.creature || '[暂无简介]'}
      </p>

      <div className="mt-auto -mx-6 -mb-6 px-6 h-12 bg-[#F8FAFC] flex items-center gap-7 text-xs leading-6 text-[rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-1">
          <IconFont type="icon-think" className="text-base text-black mr-0.5" />
          <span>{skillCount} 个技能</span>
        </div>
        <div className="flex items-center gap-1">
          <IconFont type="icon-graph" className="text-base text-black mr-0.5" />
          <span>{knowledgeCount} 个知识网络</span>
        </div>
        <div className="flex items-center gap-1">
          <IconFont type="icon-index-management" className="text-base text-black mr-0.5" />
          <span>{channelCount} 个通道</span>
        </div>
      </div>
    </Card>
  )
}

export default EmployeeCard

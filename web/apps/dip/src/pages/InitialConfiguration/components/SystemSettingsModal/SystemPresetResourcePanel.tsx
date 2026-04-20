import { Button, message, Spin } from 'antd'
import { memo, useEffect, useMemo, useState } from 'react'
import intl from 'react-intl-universal'
import {
  type BuiltInDigitalHuman,
  createBuiltInDigitalHuman,
  getBuiltInDigitalHumanList,
  getDigitalHumanList,
} from '@/apis/dip-studio/digital-human'
import defaultDigitalHumanAvatar from '@/assets/images/bkn-creator.png'
import Empty from '@/components/Empty'
import { resolveDigitalHumanIconSrc } from '@/utils/digital-human/resolveDigitalHumanIcon'

type SystemPresetResourcePanelProps = {
  onConfirmSuccess: () => void
}

const SystemPresetResourcePanel = ({ onConfirmSuccess }: SystemPresetResourcePanelProps) => {
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<BuiltInDigitalHuman[]>([])
  const [presetExists, setPresetExists] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setListLoading(true)
      setListError(null)
      try {
        const [builtInList, digitalHumanList] = await Promise.all([
          getBuiltInDigitalHumanList(),
          getDigitalHumanList(),
        ])
        if (cancelled) return
        const nextTemplates = Array.isArray(builtInList) ? builtInList : []
        setTemplates(nextTemplates)

        const firstTemplate = nextTemplates[0]
        if (!firstTemplate) {
          setPresetExists(false)
          return
        }

        const exists = Array.isArray(digitalHumanList)
          ? digitalHumanList.some(
              (item) => item.id === firstTemplate.id || item.name === firstTemplate.name,
            )
          : false
        setPresetExists(exists)
      } catch (error: any) {
        if (cancelled) return
        setTemplates([])
        setPresetExists(false)
        setListError(
          error?.description || intl.get('initialConfiguration.selectPreset.listLoadFailed'),
        )
      } finally {
        if (!cancelled) setListLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const first = templates[0]
  const avatarSrc = useMemo(
    () => resolveDigitalHumanIconSrc(first?.icon_id, defaultDigitalHumanAvatar),
    [first?.icon_id],
  )

  const handleConfirm = async () => {
    if (!first || listLoading || listError) return
    if (presetExists) {
      onConfirmSuccess()
      return
    }
    setCreating(true)
    try {
      await createBuiltInDigitalHuman(first.id)
      onConfirmSuccess()
    } catch (e: unknown) {
      const desc = e && typeof e === 'object' && 'description' in e ? String(e.description) : ''
      message.error(desc || intl.get('initialConfiguration.selectPreset.createFailed'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold text-[--dip-text-color] text-[17px] px-6">
        {intl.get('initialConfiguration.selectPreset.presetDigitalHuman')}
      </div>
      <div className="text-black/50 mt-2 px-6">
        {intl.get('initialConfiguration.selectPreset.subtitle')}
      </div>

      <div className="mt-7 mx-6 flex items-start justify-start min-h-[208px]">
        {listLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[208px] w-full">
            <Spin />
          </div>
        ) : listError ? (
          <Empty
            title={intl.get('initialConfiguration.selectPreset.loadFailedTitle')}
            desc={listError}
            type="failed"
          />
        ) : !first ? (
          <Empty title={intl.get('initialConfiguration.selectPreset.emptyTitle')} />
        ) : (
          <div className="flex flex-col items-center justify-center w-[264px] bg-black/[0.03] rounded-md px-5 py-5 text-left">
            <div className="w-[64px] h-[64px] rounded-full overflow-hidden flex items-center justify-center">
              <img src={avatarSrc} alt={first.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-base font-medium text-[--dip-text-color] mt-1">{first.name}</div>
            <div className="mt-2 mb-4 text-black/65 leading-6 text-center">
              {first.description?.trim()}
            </div>
            <Button
              type="primary"
              onClick={() => void handleConfirm()}
              loading={creating}
              disabled={presetExists}
            >
              {presetExists
                ? intl.get('initialConfiguration.selectPreset.installed')
                : intl.get('initialConfiguration.selectPreset.installNow')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(SystemPresetResourcePanel)

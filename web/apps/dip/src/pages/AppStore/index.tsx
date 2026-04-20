import { ExclamationCircleFilled } from '@ant-design/icons'
import { Button, Modal, message, Spin, Tooltip } from 'antd'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import intl from 'react-intl-universal'
import { useNavigate } from 'react-router-dom'
import { type ApplicationInfo, deleteApplications } from '@/apis'
import AppConfigDrawer from '@/components/AppConfigDrawer'
import AppList from '@/components/AppList'
import { ModeEnum } from '@/components/AppList/types'
import AppUploadModal from '@/components/AppUploadModal'
import Empty from '@/components/Empty'
import GradientContainer from '@/components/GradientContainer'
import IconFont from '@/components/IconFont'
import SearchInput from '@/components/SearchInput'
import { useApplicationsService } from '@/hooks/useApplicationsService'
import { usePreferenceStore } from '@/stores'
import styles from './index.module.less'
import { AppStoreActionEnum } from './types'
import { getAppStoreMenuItems } from './utils'

const AppStore = () => {
  const { apps, loading, error, searchValue, handleSearch, handleRefresh } =
    useApplicationsService()
  const { unpinMicroApp } = usePreferenceStore()
  const navigate = useNavigate()
  const [messageApi, messageContextHolder] = message.useMessage()
  const [installModalVisible, setInstallModalVisible] = useState(false)
  const [configModalVisible, setConfigModalVisible] = useState(false)
  const [selectedApp, setSelectedApp] = useState<ApplicationInfo | null>(null)
  const [hasLoadedData, setHasLoadedData] = useState(false) // 记录是否已经成功加载过数据（有数据的情况）
  const hasEverHadDataRef = useRef(false) // 使用 ref 追踪是否曾经有过数据，避免循环依赖
  const prevSearchValueRef = useRef('') // 追踪上一次的搜索值，用于判断是否是从搜索状态清空
  const [modal, contextHolder] = Modal.useModal()
  // 当数据加载完成且有数据时，标记为已加载过数据；所有应用卸载后重置
  useEffect(() => {
    // 在开始处理前，先保存上一次的搜索值用于判断
    const wasSearching = prevSearchValueRef.current !== ''

    if (!loading) {
      if (apps.length > 0) {
        // 有数据时，设置为 true 并记录
        setHasLoadedData(true)
        hasEverHadDataRef.current = true
      } else if (!searchValue && hasEverHadDataRef.current) {
        // 没有数据且没有搜索值且之前有过数据时，需要判断是否是从搜索状态清空
        // 只有当上一次也没有搜索值（说明不是从搜索状态清空，而是真正的空状态）时，才重置
        if (!wasSearching) {
          // 不是从搜索状态清空，说明是真正的空状态（所有应用被卸载），重置
          setHasLoadedData(false)
          hasEverHadDataRef.current = false
        }
        // 如果是从搜索状态清空（wasSearching === true），保持 hasLoadedData 不变
        // 因为数据会重新加载，如果原来有数据，加载后 apps.length > 0，hasLoadedData 会保持 true
      }
      // 如果有搜索值但 apps.length === 0，保持 hasLoadedData 不变（显示搜索框）
    }

    // 更新上一次的搜索值（在 useEffect 结束时更新，确保下次执行时能正确判断）
    prevSearchValueRef.current = searchValue
  }, [loading, apps.length, searchValue])

  /** 处理卡片菜单操作 */
  const handleMenuClick = useCallback(
    async (action: string, _app: ApplicationInfo) => {
      try {
        switch (action) {
          /** 卸载应用 */
          case AppStoreActionEnum.Uninstall:
            modal.confirm({
              title: intl.get('application.appStore.confirmUninstallTitle'),
              icon: <ExclamationCircleFilled />,
              content: intl.get('application.appStore.confirmUninstallContent'),
              okText: intl.get('global.ok'),
              okType: 'primary',
              okButtonProps: { danger: true },
              cancelText: intl.get('global.cancel'),
              footer: (_, { OkBtn, CancelBtn }) => (
                <>
                  <OkBtn />
                  <CancelBtn />
                </>
              ),
              onOk: async () => {
                try {
                  await deleteApplications(_app.key)
                  messageApi.success(intl.get('application.appStore.uninstallSuccess'))
                  handleRefresh()
                  unpinMicroApp(_app.key, false)
                } catch (err: any) {
                  if (err?.description) {
                    messageApi.error(err.description)
                    return
                  }
                }
              },
            })
            break

          /** 配置应用 */
          case AppStoreActionEnum.Config:
            setSelectedApp(_app)
            setConfigModalVisible(true)
            break

          /** 运行应用 */
          case AppStoreActionEnum.Run:
            navigate(`/application/${encodeURIComponent(_app.key)}`)
            break

          /** 授权管理 */
          case AppStoreActionEnum.Auth:
            // TODO: 跳转授权管理
            break

          default:
            break
        }
      } catch (err: any) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Failed to handle app action:', err)
        }
      }
    },
    [handleRefresh],
  )

  /** 渲染状态内容（loading/error/empty） */
  const renderStateContent = () => {
    if (loading) {
      return <Spin />
    }

    if (error) {
      return (
        <Empty type="failed" title={intl.get('application.loadFailed')}>
          <Button className="mt-1" type="primary" onClick={handleRefresh}>
            {intl.get('application.retry')}
          </Button>
        </Empty>
      )
    }

    if (apps.length === 0) {
      if (searchValue) {
        return <Empty type="search" desc={intl.get('global.noResult')} />
      }
      return (
        <Empty
          title={intl.get('application.appStore.emptyTitle')}
          subDesc={intl.get('application.appStore.emptySubDesc')}
        >
          <Button
            className="mt-1"
            type="primary"
            icon={<IconFont type="icon-upload" />}
            onClick={() => {
              setInstallModalVisible(true)
            }}
          >
            {intl.get('application.appStore.installApp')}
          </Button>
        </Empty>
      )
    }

    return null
  }

  /** 渲染内容区域 */
  const renderContent = () => {
    const stateContent = renderStateContent()

    if (stateContent) {
      return <div className="absolute inset-0 flex items-center justify-center">{stateContent}</div>
    }

    return (
      <AppList
        mode={ModeEnum.AppStore}
        apps={apps}
        menuItems={(app) => getAppStoreMenuItems(app, (key) => handleMenuClick(key, app))}
      />
    )
  }

  return (
    <GradientContainer className="h-full p-6 pb-0 flex flex-col relative">
      {contextHolder}
      {messageContextHolder}
      <div className="flex justify-between mb-6 flex-shrink-0 z-20">
        <div className="flex flex-col gap-y-3">
          <span className="text-base font-bold text-[--dip-text-color]">
            {intl.get('application.appStore.title')}
          </span>
          <span className="text-sm text-[--dip-text-color-65]">
            {intl.get('application.appStore.subtitle')}
          </span>
        </div>
        {(hasLoadedData || searchValue) && (
          <div className="flex items-center gap-x-2">
            <SearchInput
              variant="borderless"
              className="!rounded-2xl"
              onSearch={handleSearch}
              placeholder={intl.get('application.searchPlaceholder')}
            />
            <Tooltip title={intl.get('global.refresh')}>
              <Button type="text" icon={<IconFont type="icon-refresh" />} onClick={handleRefresh} />
            </Tooltip>
            <Button
              type="primary"
              icon={<IconFont type="icon-upload" />}
              onClick={() => setInstallModalVisible(true)}
            >
              {intl.get('application.appStore.installApp')}
            </Button>
          </div>
        )}
      </div>
      {/* 预留占位，避免 loading→列表 切换时产生 CLS */}
      <div className="flex-1 min-h-0 relative flex flex-col">{renderContent()}</div>
      <AppConfigDrawer
        appData={selectedApp ?? undefined}
        open={configModalVisible}
        onClose={() => setConfigModalVisible(false)}
      />
      <AppUploadModal
        open={installModalVisible}
        onCancel={() => setInstallModalVisible(false)}
        onSuccess={(appInfo) => {
          setInstallModalVisible(false)
          handleRefresh()
          // 显示成功提示
          const key = `upload-success-${Date.now()}`
          messageApi.success({
            key,
            className: styles.uploadSuccessMessage,
            content: (
              <div className="flex items-center gap-2">
                <span>
                  {intl.get('application.appStore.uploadSuccessBefore')}
                  <span className="inline-block max-w-md truncate align-bottom">
                    {appInfo.name}
                  </span>
                  {intl.get('application.appStore.uploadSuccessAfter')}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApp(appInfo)
                      setConfigModalVisible(true)
                      messageApi.destroy(key)
                    }}
                    className="text-[--dip-primary-color]"
                  >
                    {intl.get('application.appStore.goToConfig')}
                  </button>
                </span>
              </div>
            ),
          })
        }}
      />
    </GradientContainer>
  )
}

export default memo(AppStore)

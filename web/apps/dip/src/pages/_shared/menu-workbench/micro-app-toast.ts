import { message } from 'antd'

/** 微应用内 toast 占位实现（与 antd message API 形态对齐） */
export const createMenuWorkbenchToastApi = () => {
  const config = () => {
    console.error('toast未开放config配置')
  }
  const destroy = () => {
    console.error('toast未开放destroy方法')
  }
  return { ...message, config, destroy }
}

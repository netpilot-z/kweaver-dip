import intl from 'react-intl-universal'
import type { FileInfo } from './types'

const fileSizeUnitKeys = [
  'application.upload.unitB',
  'application.upload.unitKB',
  'application.upload.unitMB',
  'application.upload.unitGB',
] as const

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  const maxIdx = fileSizeUnitKeys.length - 1
  if (bytes === 0) return `0 ${intl.get(fileSizeUnitKeys[0])}`
  const k = 1024
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), maxIdx)
  const unit = intl.get(fileSizeUnitKeys[i])
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${unit}`
}

/**
 * 验证文件格式
 */
export const validateFileFormat = (file: File): boolean => {
  return file.name.toLowerCase().endsWith('.dip')
}

/**
 * 验证文件大小（1GB = 1024 * 1024 * 1024 bytes）
 */
export const validateFileSize = (file: File): boolean => {
  const maxSize = 1024 * 1024 * 1024 // 1GB
  return file.size <= maxSize
}

/**
 * 获取文件信息
 */
export const getFileInfo = (file: File): FileInfo => {
  return {
    name: file.name,
    size: file.size,
    file,
  }
}

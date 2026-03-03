/**
 * 应用信息工具：统一从 @/manifest.json 获取应用名与版本号
 * 目的：避免在页面/逻辑中写死版本号（例如 v1.0.0）
 */
import manifest from '@/manifest.json'

function safeString(v) {
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * 获取 manifest.json 中的 versionName（原样，可能不带 v）
 * @returns {string} 例如 "1.1.1"
 */
export function getManifestVersionNameRaw() {
  const versionName = safeString(manifest?.versionName)
  return versionName
}

/**
 * 获取标准化版本号（保证带 v 前缀）
 * @returns {string} 例如 "v1.1.1"
 */
export function getManifestVersionName() {
  const raw = getManifestVersionNameRaw()
  if (!raw) return 'v0.0.0'
  return /^v/i.test(raw) ? raw : `v${raw}`
}

/**
 * 获取不带 v 的版本号（用于“版本号: 1.1.1”这类展示）
 * @returns {string} 例如 "1.1.1"
 */
export function getManifestVersionNamePlain() {
  const raw = getManifestVersionNameRaw()
  if (!raw) return '0.0.0'
  return raw.replace(/^v/i, '')
}

/**
 * 获取应用名称
 * @returns {string}
 */
export function getAppName() {
  const name = safeString(manifest?.name)
  return name || '冷链验证APP'
}

/**
 * 获取“应用名 + 版本号”显示字符串（版本号带 v）
 * @returns {string} 例如 "冷链验证APP v1.1.1"
 */
export function getAppNameWithVersion() {
  const name = getAppName()
  const version = getManifestVersionName()
  return `${name} ${version}`
}



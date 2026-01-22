/**
 * 版本检查工具
 * 用于检查应用是否有新版本可用
 */

import apiService from '@/common/api.js'
import storageManager from '@/common/storage.js'

/**
 * 比较版本号
 * @param {string} currentVersion - 当前版本号，如 "v1.0.0"
 * @param {string} latestVersion - 最新版本号，如 "v1.0.1"
 * @returns {boolean} 是否有新版本
 */
function compareVersion(currentVersion, latestVersion) {
	// 移除 'v' 前缀并分割版本号
	const current = currentVersion.replace(/^v/i, '').split('.').map(Number);
	const latest = latestVersion.replace(/^v/i, '').split('.').map(Number);
	
	// 补齐版本号长度
	const maxLength = Math.max(current.length, latest.length);
	while (current.length < maxLength) current.push(0);
	while (latest.length < maxLength) latest.push(0);
	
	// 比较版本号
	for (let i = 0; i < maxLength; i++) {
		if (latest[i] > current[i]) {
			return true; // 有新版本
		} else if (latest[i] < current[i]) {
			return false; // 当前版本更新
		}
	}
	return false; // 版本相同
}

/**
 * 获取当前应用版本号
 * @returns {string} 当前版本号
 */
function getCurrentVersion() {
	// #ifdef APP-PLUS
	try {
		const systemInfo = uni.getSystemInfoSync();
		// 尝试获取 appWgtVersion（应用版本号）
		if (systemInfo.appWgtVersion) {
			return systemInfo.appWgtVersion;
		}
		// 如果没有，尝试从 plus.runtime 获取
		if (plus && plus.runtime && plus.runtime.version) {
			return plus.runtime.version;
		}
	} catch (e) {
		console.error('获取应用版本号失败:', e);
	}
	// #endif
	
	// 默认版本号（可以从 package.json 或 manifest.json 读取）
	return 'v1.0.0';
}

/**
 * 检查是否有新版本
 * @param {boolean} showUpdateDialog - 是否显示更新对话框（默认true）
 * @param {boolean} ignoreSkipped - 是否忽略跳过状态（默认false，手动检查时设为true）
 * @returns {Promise<Object|null>} 如果有新版本返回版本信息，否则返回null
 */
export async function checkAppVersion(showUpdateDialog = true, ignoreSkipped = false) {
	try {
		// 获取当前版本
		const currentVersion = getCurrentVersion();
		console.log('当前版本:', currentVersion);
		
		// 获取最新版本信息
		const latestVersionInfo = await apiService.getLatestVersion();
		
		if (!latestVersionInfo || !latestVersionInfo.versionName) {
			console.log('未获取到版本信息');
			return null;
		}
		
		const latestVersion = latestVersionInfo.versionName;
		console.log('最新版本:', latestVersion);
		
		// 检查该版本是否已被跳过（手动检查时忽略跳过状态）
		if (!ignoreSkipped && storageManager.isVersionSkipped(latestVersion)) {
			console.log('该版本已被跳过，不再提示升级');
			return null;
		}
		
		// 比较版本号
		const hasUpdate = compareVersion(currentVersion, latestVersion);
		
		if (hasUpdate && showUpdateDialog) {
			// 有新版本，跳转到升级页面
			const upgradeInfo = {
				versionName: latestVersionInfo.versionName,
				versionDesc: latestVersionInfo.versionDesc || '修复若干bug',
				downloadUrl: latestVersionInfo.downloadUrl,
				is_mandatory: latestVersionInfo.is_mandatory || false // 从接口获取，默认非强制更新
			};
			
			uni.navigateTo({
				url: '/pages/upgrade/index?obj=' + encodeURIComponent(JSON.stringify(upgradeInfo))
			});
		}
		
		return hasUpdate ? latestVersionInfo : null;
	} catch (error) {
		console.error('检查版本失败:', error);
		// 检查失败不阻塞应用启动，静默失败
		return null;
	}
}

/**
 * 获取当前版本号（供外部调用）
 * @returns {string} 当前版本号
 */
export function getAppVersion() {
	return getCurrentVersion();
}


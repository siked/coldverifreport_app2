<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar">
        <text class="avatar-text">{{ userInitials }}</text>
      </view>
      <view class="user-info">
        <text class="username">{{ userInfo.username }}</text>
        <text class="user-id">用户ID: {{ userInfo.id }}</text>
      </view>
    </view>

    <!-- 服务器信息 -->
    <view class="info-section">
      <view class="info-item">
        <text class="info-label">服务器地址</text>
        <text class="info-value">{{ serverUrl }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">登录状态</text>
        <text class="info-value online">在线</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="goToGatewayManagement">
        <view class="menu-left">
          <text class="menu-icon">📡</text>
          <text class="menu-text">网关设备管理</text>
          <view class="unsynced-badge" v-if="hasUnsyncedData">
            <text class="unsynced-badge-text">未上传</text>
          </view>
        </view>
        <text class="menu-arrow">▶</text>
      </view>
      
      <view class="menu-item" @click="clearCache">
        <view class="menu-left">
          <text class="menu-icon">🗑️</text>
          <text class="menu-text">清除缓存</text>
        </view>
        <text class="menu-arrow">▶</text>
      </view>
      
      <view class="menu-item" @click="checkVersionUpdate">
        <view class="menu-left">
          <text class="menu-icon">🔄</text>
          <text class="menu-text">版本更新</text>
          <view class="update-badge" v-if="hasNewVersion">
            <text class="update-badge-text">新</text>
          </view>
        </view>
        <view class="menu-right">
          <text class="version-text-small">{{ currentVersion }}</text>
          <text class="menu-arrow">▶</text>
        </view>
      </view>
      
      <view class="menu-item" @click="aboutApp">
        <view class="menu-left">
          <text class="menu-icon">ℹ️</text>
          <text class="menu-text">关于应用</text>
        </view>
        <text class="menu-arrow">▶</text>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <button class="logout-btn" @click="logout">退出登录</button>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text class="version-text">{{ appNameVersionText }}</text>
    </view>
  </view>
</template>

<script>
import storageManager from '@/common/storage.js'
import apiService from '@/common/api.js'
import { checkAppVersion, getAppVersion } from '@/common/version-check.js'
import { getManifestVersionName } from '@/common/app-info.js'

export default {
  data() {
    return {
      userInfo: {},
      serverUrl: '',
      hasUnsyncedData: false,
      currentVersion: getAppVersion(),
      hasNewVersion: false,
      latestVersionInfo: null
    }
  },

  computed: {
    // 底部展示用：应用名 + 版本号（从 manifest.json 获取）
    appNameVersionText() {
      return `冷链验证APP ${getManifestVersionName()}`;
    },
    // 用户姓名首字母
    userInitials() {
      if (this.userInfo.username) {
        return this.userInfo.username.charAt(0).toUpperCase();
      }
      return 'U';
    }
  },

  onLoad() {
    this.loadUserData();
    this.checkUnsyncedData();
    this.initVersionInfo();
  },

  onShow() {
    // 从其他页面返回时检查未同步数据
    this.checkUnsyncedData();
    // 检查版本更新
    this.checkVersionStatus();
  },

  methods: {
    // 加载用户数据
    loadUserData() {
      this.userInfo = storageManager.getUserInfo() || {};
      this.serverUrl = storageManager.getServerUrl() || '未设置';
    },

    // 检查是否有未同步的数据
    checkUnsyncedData() {
      this.hasUnsyncedData = storageManager.getHasUnsyncedData();
    },

    // 跳转到网关设备管理
    goToGatewayManagement() {
      uni.navigateTo({
        url: '/pages/gateway/gateway-list'
      });
    },

    // 清除缓存
    clearCache() {
      uni.showModal({
        title: '确认清除缓存',
        content: '此操作将清除所有本地缓存数据，但不会影响登录状态',
        success: (res) => {
          if (res.confirm) {
            try {
              // 清除除了认证信息外的其他缓存
              // 这里可以根据需要具体实现
              uni.showToast({
                title: '缓存清除成功',
                icon: 'success'
              });
            } catch (error) {
              uni.showToast({
                title: '清除缓存失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },

    // 初始化版本信息
    initVersionInfo() {
      this.currentVersion = getAppVersion();
    },

    // 检查版本状态
    async checkVersionStatus() {
      try {
        const versionInfo = await checkAppVersion(false); // 不自动显示对话框
        if (versionInfo) {
          this.hasNewVersion = true;
          this.latestVersionInfo = versionInfo;
        } else {
          this.hasNewVersion = false;
          this.latestVersionInfo = null;
        }
      } catch (error) {
        console.error('检查版本状态失败:', error);
        this.hasNewVersion = false;
      }
    },

    // 检查版本更新（手动检查，忽略跳过状态）
    async checkVersionUpdate() {
      try {
        uni.showLoading({ title: '检查更新中...' });
        // 手动检查时，忽略跳过状态，强制显示升级弹窗
        const versionInfo = await checkAppVersion(true, true); // 显示更新对话框，忽略跳过状态
        uni.hideLoading();
        
        if (!versionInfo) {
          uni.showToast({
            title: '已是最新版本',
            icon: 'success'
          });
          this.hasNewVersion = false;
        } else {
          this.hasNewVersion = true;
          this.latestVersionInfo = versionInfo;
        }
      } catch (error) {
        uni.hideLoading();
        console.error('检查版本更新失败:', error);
        uni.showToast({
          title: '检查更新失败',
          icon: 'none'
        });
      }
    },

    // 关于应用
    aboutApp() {
      uni.showModal({
        title: '关于冷链验证APP',
        content: `版本: ${this.currentVersion}\n这是一个专业的冷链验证实施过程记录应用，帮助用户高效管理冷链验证任务。`,
        showCancel: false
      });
    },

    // 退出登录
    async logout() {
      // 检查是否有未上传的数据
      const hasUnsynced = storageManager.getHasUnsyncedData();
      const cachedList = storageManager.getGatewayDeviceSnList();
      
      if (hasUnsynced && cachedList && cachedList.length > 0) {
        // 尝试上传缓存的数据
        try {
          uni.showLoading({ title: '正在上传数据...' });
          await apiService.updateGatewayDevices(cachedList, true);
          uni.hideLoading();
          
          // 上传成功，清除标记
          storageManager.setHasUnsyncedData(false);
          
          // 清除认证数据并退出
          this.doLogout();
        } catch (error) {
          uni.hideLoading();
          
          // 上传失败，询问是否强制退出
          uni.showModal({
            title: '数据未上传',
            content: '仍有未上传的数据，退出后将被清除。是否强制退出？',
            success: (res) => {
              if (res.confirm) {
                // 强制退出，清除所有数据
                storageManager.clearAuthData();
                this.showLogoutSuccess();
              }
            }
          });
        }
      } else {
        // 没有未上传数据，直接退出
        this.doLogout();
      }
    },

    // 执行退出登录
    doLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除认证数据
            storageManager.clearAuthData();
            this.showLogoutSuccess();
          }
        }
      });
    },

    // 显示退出成功提示并跳转
    showLogoutSuccess() {
      uni.showToast({
        title: '已退出登录',
        icon: 'success'
      });
      
      // 延迟跳转到登录页面
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/login/login'
        });
      }, 1000);
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 50rpx 30rpx;
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.3);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  background: white;
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.avatar-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 10rpx;
}

.user-id {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.info-section {
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
}

.info-value.online {
  color: #4caf50;
  font-weight: bold;
}

.menu-section {
  background: white;
  border-radius: 15rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-text {
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  color: #ccc;
  font-size: 28rpx;
}

.logout-section {
  padding: 0 20rpx;
  margin-bottom: 30rpx;
}

.logout-btn {
  width: 100%;
  height: 80rpx;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.logout-btn:active {
  background: #ff2e4a;
}

.version-info {
  text-align: center;
  padding: 30rpx 0;
}

.version-text {
  font-size: 24rpx;
  color: #999;
}

.unsynced-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60rpx;
  height: 32rpx;
  padding: 0 12rpx;
  background: #ff4757;
  border-radius: 16rpx;
  margin-left: 12rpx;
}

.unsynced-badge-text {
  font-size: 20rpx;
  color: white;
  font-weight: 500;
}

.update-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40rpx;
  height: 28rpx;
  padding: 0 10rpx;
  background: #ff4757;
  border-radius: 14rpx;
  margin-left: 12rpx;
}

.update-badge-text {
  font-size: 18rpx;
  color: white;
  font-weight: 500;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.version-text-small {
  font-size: 24rpx;
  color: #999;
}
</style>
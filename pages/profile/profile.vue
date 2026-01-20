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
      <view class="menu-item" @click="clearCache">
        <view class="menu-left">
          <text class="menu-icon">🗑️</text>
          <text class="menu-text">清除缓存</text>
        </view>
        <text class="menu-arrow">▶</text>
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
      <text class="version-text">冷链验证系统 v1.0.0</text>
    </view>
  </view>
</template>

<script>
import storageManager from '@/common/storage.js'

export default {
  data() {
    return {
      userInfo: {},
      serverUrl: ''
    }
  },

  computed: {
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
  },

  methods: {
    // 加载用户数据
    loadUserData() {
      this.userInfo = storageManager.getUserInfo() || {};
      this.serverUrl = storageManager.getServerUrl() || '未设置';
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

    // 关于应用
    aboutApp() {
      uni.showModal({
        title: '关于冷链验证系统',
        content: '版本: 1.0.0\n这是一个专业的冷链验证实施过程记录应用，帮助用户高效管理冷链验证任务。',
        showCancel: false
      });
    },

    // 退出登录
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除认证数据
            storageManager.clearAuthData();
            
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
      });
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
</style>
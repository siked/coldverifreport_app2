<template>
  <view class="login-container">
    <!-- 页面标题 -->
    <view class="header">
      <text class="title">冷链验证系统</text>
      <text class="subtitle">Cold Chain Verification System</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 服务器地址选择/输入 -->
      <view class="form-item">
        <text class="label">服务器地址</text>
        <picker 
          v-if="serverHistory.length > 0" 
          :range="serverHistoryWithCustom" 
          @change="onServerChange"
          class="server-picker"
        >
          <view class="picker-display">
            <text>{{ selectedServer || '请选择或输入服务器地址' }}</text>
            <text class="arrow">▼</text>
          </view>
        </picker>
        <input 
          v-else
          v-model="serverUrl" 
          @input="validateServerUrl"
          placeholder="请输入服务器地址 (http:// 或 https:// 开头)" 
          class="input"
        />
      </view>

      <!-- 自定义服务器地址输入 -->
      <view v-if="showCustomServer" class="form-item">
        <input 
          v-model="customServerUrl" 
          placeholder="请输入服务器地址" 
          class="input"
          @blur="validateServerUrl"
        />
        <button 
          size="mini" 
          type="primary" 
          @click="confirmCustomServer"
          :disabled="!isValidServerUrl"
        >确定</button>
      </view>

      <!-- 用户名 -->
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          v-model="username" 
          placeholder="请输入用户名" 
          class="input"
        />
      </view>

      <!-- 密码 -->
      <view class="form-item">
        <text class="label">密码</text>
        <input 
          v-model="password" 
          placeholder="请输入密码" 
          password 
          class="input"
        />
      </view>

      <!-- 登录按钮 -->
      <button 
        class="login-btn" 
        type="primary" 
        :loading="loggingIn" 
        :disabled="!canLogin"
        @click="handleLogin"
      >
        {{ loggingIn ? '登录中...' : '登录' }}
      </button>


    </view>

    <!-- 底部信息 -->
    <view class="footer">
      <text class="version">版本号: 1.0.0</text>
    </view>
  </view>
</template>

<script>
import apiService from '@/common/api.js'
import storageManager from '@/common/storage.js'

export default {
  data() {
    return {
      serverUrl: '',
      customServerUrl: '',
      username: '',
      password: '',
      loggingIn: false,

      serverHistory: [],
      selectedServer: '',
      showCustomServer: false,
      isValidServerUrl: false
    }
  },

  computed: {
    // 计算属性：是否可以登录
    canLogin() {
      return this.serverUrl && 
             this.username && 
             this.password && 
             !this.loggingIn &&
             this.isValidServerUrl;
    },
    
    // 带自定义选项的服务器历史记录
    serverHistoryWithCustom() {
      return [...this.serverHistory, '自定义服务器地址'];
    }
  },

  onLoad() {
    this.loadStoredData();
  },

  methods: {
    // 加载已存储的数据
    loadStoredData() {
      // 加载服务器历史记录
      this.serverHistory = storageManager.getServerHistory();
      
      // 加载上次使用的服务器地址
      const savedServerUrl = storageManager.getServerUrl();
      if (savedServerUrl) {
        this.serverUrl = savedServerUrl;
        this.selectedServer = savedServerUrl;
        this.validateServerUrl();
        
        // 根据服务器地址加载对应的账号密码
        this.loadCredentialsForServer(savedServerUrl);
      } else if (this.serverHistory.length > 0) {
        // 如果没有保存的服务器地址但有历史记录，加载第一个服务器的账号密码
        const firstServer = this.serverHistory[0];
        this.serverUrl = firstServer;
        this.selectedServer = firstServer;
        this.validateServerUrl();
        this.loadCredentialsForServer(firstServer);
      } else {
        // 如果没有任何服务器历史记录，尝试加载一般用户名密码
        this.username = storageManager.getUsername() || '';
        this.password = storageManager.getPassword() || '';
      }
      
      // 检查是否已经登录
      if (storageManager.isLoggedIn()) {
        // 已登录，直接跳转到主页面
        this.navigateToMain();
      }
    },

    // 服务器选择变化
    onServerChange(e) {
      const selectedIndex = e.detail.value;
      
      if (selectedIndex === this.serverHistory.length) {
        // 选择了自定义
        this.showCustomServer = true;
        this.customServerUrl = '';
        this.selectedServer = '';
      } else {
        // 选择了历史记录中的服务器
        this.showCustomServer = false;
        this.serverUrl = this.serverHistory[selectedIndex];
        this.selectedServer = this.serverUrl;
        this.validateServerUrl();
              
        // 自动加载该服务器保存的账号密码
        this.loadCredentialsForServer(this.serverUrl);
      }
    },

    // 验证服务器地址格式
    validateServerUrl() {
      const url = this.showCustomServer ? this.customServerUrl : this.serverUrl;
      
      if (!url) {
        this.isValidServerUrl = false;
        return;
      }
      
      // 检查是否以http://或https://开头
      this.isValidServerUrl = url.startsWith('http://') || url.startsWith('https://');
    },

    // 确认自定义服务器地址
    confirmCustomServer() {
      if (this.isValidServerUrl) {
        this.serverUrl = this.customServerUrl;
        this.selectedServer = this.customServerUrl;
        this.showCustomServer = false;
        
        // 保存到历史记录（包括账号密码）
        storageManager.setServerUrl(this.serverUrl, this.username, this.password);
        this.serverHistory = storageManager.getServerHistory();
        
        // 加载该服务器的账号密码
        this.loadCredentialsForServer(this.serverUrl);
      }
    },

    // 为指定服务器加载账号密码
    loadCredentialsForServer(serverUrl) {
      const credentials = storageManager.getServerCredentials(serverUrl);
      if (credentials) {
        this.username = credentials.username || '';
        this.password = credentials.password || '';
      } else {
        // 如果该服务器没有保存的凭据，则清空用户名和密码字段
        this.username = '';
        this.password = '';
      }
    },



    // 处理登录
    async handleLogin() {
      if (!this.canLogin) return;

      this.loggingIn = true;

      try {
        // 保存服务器地址和登录凭据
        storageManager.setServerUrl(this.serverUrl, this.username, this.password);
        
        // 保存用户名和密码到全局存储
        storageManager.setUsername(this.username);
        storageManager.setPassword(this.password);

        // 调用登录API
        const result = await apiService.login(this.username, this.password);
        
        if (result.success) {
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });
          
          // 延迟跳转，让用户看到成功提示
          setTimeout(() => {
            this.navigateToMain();
          }, 1000);
        }
      } catch (error) {
        console.error('登录失败:', error);
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        });
      } finally {
        this.loggingIn = false;
      }
    },

    // 跳转到主页面
    navigateToMain() {
      console.log('尝试跳转到任务管理页面');
      
      // 先尝试switchTab（用于tabBar页面）
      uni.switchTab({
        url: '/pages/task/category/category',
        success: () => {
          console.log('switchTab跳转成功');
        },
        fail: (error) => {
          console.error('switchTab跳转失败:', error);
          
          // 如果switchTab失败，使用redirectTo（用于普通页面）
          uni.redirectTo({
            url: '/pages/task/category/category',
            success: () => {
              console.log('redirectTo跳转成功');
            },
            fail: (redirectError) => {
              console.error('redirectTo也失败:', redirectError);
              
              // 最后的备选方案：reLaunch
              uni.reLaunch({
                url: '/pages/task/category/category',
                success: () => {
                  console.log('reLaunch跳转成功');
                },
                fail: (relaunchError) => {
                  console.error('所有跳转方式都失败:', relaunchError);
                }
              });
            }
          });
        }
      });
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 80rpx;
  margin-top: 100rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 20rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-form {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
  flex: 1;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 32rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.input:focus {
  border-color: #667eea;
}

.server-picker {
  width: 100%;
}

.picker-display {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.arrow {
  color: #999;
  font-size: 24rpx;
}

.login-btn {
  width: 100%;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
}


.footer {
  text-align: center;
  margin-top: 40rpx;
}

.version {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
}
</style>
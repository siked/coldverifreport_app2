<template>
  <view class="login-container">
    <!-- 页面标题 -->
    <view class="header">
      <text class="title">冷链验证APP</text>
      <text class="subtitle">Cold Chain Verification System</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 服务器地址选择/输入 -->
      <view class="form-item">
        <text class="label">服务器地址</text>
        <picker 
          v-if="serverList.length > 0" 
          :range="serverNameListWithCustom" 
          :value="serverPickerIndex"
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
          @input="validateServerUrl"
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
      <text class="version">{{ appNameVersionText }}</text>
    </view>
  </view>
</template>

<script>
import apiService from '@/common/api.js'
import storageManager from '@/common/storage.js'
import { getManifestVersionName } from '@/common/app-info.js'

// 兜底服务器列表：仅用于远程 JSON 拉取失败时，避免页面无可选项
const fallbackServerList = [
  { Name: '贵州节点', ServerUrl: 'http://1.95.112.212:3001' }
]

export default {
  data() {
    return {
      // 默认服务器地址（当 JSON 读取失败或为空时兜底）
      defaultServerUrl: 'http://1.95.112.212:3001',
      // 远程 JSON 配置文件地址（你上传到服务器后，把这个 URL 改成真实地址即可）
      // 期望返回数组：[{ Name: '杭州节点', ServerUrl: 'http://x.x.x.x:3001' }, ...]
      serverConfigJsonUrl: 'https://oss.yunlot.com/AppServersUrl.json',
      // 从 JSON 读取的服务器列表：[{ Name, ServerUrl }]
      serverList: [],
      // picker 当前选中索引（默认 0：JSON 列表第一个）
      serverPickerIndex: 0,
      serverUrl: '',
      customServerUrl: '',
      username: '',
      password: '',
      loggingIn: false,

      selectedServer: '',
      showCustomServer: false,
      isValidServerUrl: false
    }
  },

  computed: {
    // 底部展示：冷链验证APP vX.X.X（带 v）
    appNameVersionText() {
      return `冷链验证APP ${getManifestVersionName()}`
    },
    // 计算属性：是否可以登录
    canLogin() {
      return this.serverUrl && 
             this.username && 
             this.password && 
             !this.loggingIn &&
             this.isValidServerUrl;
    },
    
    // picker 下拉展示：仅展示 Name（最后追加“自定义服务器地址”）
    serverNameListWithCustom() {
      return [...this.serverList.map(item => item.Name), '自定义服务器地址'];
    }
  },

  onLoad() {
    this.initPage();
  },

  methods: {
    async initPage() {
      await this.loadServerListFromJson();
      this.loadStoredData();
    },

    async loadServerListFromJson() {
      let list = null;

      // 通过远程 URL 获取 JSON
      try {
        list = await new Promise((resolve, reject) => {
          uni.request({
            url: this.serverConfigJsonUrl,
            method: 'GET',
            success: (res) => {
              const data = res && res.data;
              if (Array.isArray(data)) return resolve(data);
              return reject(new Error('服务器配置 JSON 格式不正确：需要数组'));
            },
            fail: (err) => reject(err)
          });
        });
      } catch (e) {
        // fallback：远程不可用时兜底
        list = fallbackServerList;
      }

      const normalized = (Array.isArray(list) ? list : [])
        .map(item => {
          if (!item) return null;
          const Name = item.Name || item.name;
          const ServerUrl = item.ServerUrl || item.serverUrl;
          if (!Name || !ServerUrl) return null;
          return { Name, ServerUrl };
        })
        .filter(Boolean);

      this.serverList = normalized;
    },

    // 加载已存储的数据
    loadStoredData() {
      // 加载上次使用的服务器地址
      const savedServerUrl = storageManager.getServerUrl();
      if (savedServerUrl) {
        this.serverUrl = savedServerUrl;
        // 如果保存的地址存在于 JSON 列表中，则展示对应 Name；否则直接展示 URL（兼容历史自定义地址）
        const matchedIndex = this.serverList.findIndex(item => item.ServerUrl === savedServerUrl);
        const matched = matchedIndex >= 0 ? this.serverList[matchedIndex] : null;
        this.selectedServer = matched ? matched.Name : savedServerUrl;
        // 若不在列表中，则让 picker 高亮“自定义服务器地址”
        this.serverPickerIndex = matchedIndex >= 0 ? matchedIndex : this.serverList.length;
        this.validateServerUrl();
        
        // 根据服务器地址加载对应的账号密码
        this.loadCredentialsForServer(savedServerUrl);
      } else if (this.serverList.length > 0) {
        // 默认选择 JSON 列表第一个
        const firstServer = this.serverList[0];
        this.serverUrl = firstServer.ServerUrl;
        this.selectedServer = firstServer.Name;
        this.serverPickerIndex = 0;
        this.validateServerUrl();
        this.loadCredentialsForServer(this.serverUrl);
      } else {
        // 如果 JSON 为空/读取失败，设置兜底默认服务器地址
        this.serverUrl = this.defaultServerUrl;
        this.selectedServer = this.defaultServerUrl;
        this.validateServerUrl();
        
        // 尝试加载一般用户名密码
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
      const selectedIndex = Number(e.detail.value);
      
      if (selectedIndex === this.serverList.length) {
        // 选择了自定义
        this.showCustomServer = true;
        this.customServerUrl = '';
        this.selectedServer = '自定义服务器地址';
        this.serverPickerIndex = selectedIndex;
        this.validateServerUrl();
      } else {
        // 选择了 JSON 列表中的服务器
        this.showCustomServer = false;
        const selected = this.serverList[selectedIndex];
        this.serverUrl = selected.ServerUrl;
        this.selectedServer = selected.Name;
        this.serverPickerIndex = selectedIndex;
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
        this.serverPickerIndex = this.serverList.length;
        
        // 保存到历史记录（包括账号密码）
        storageManager.setServerUrl(this.serverUrl, this.username, this.password);
        
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
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
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
  min-height: 0; /* 允许在 flex 容器内正确收缩，从而让 footer 不被挤出屏幕 */
  overflow-y: auto; /* 表单内容过高时仅滚动表单区域 */
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
  margin-top: 20rpx;
  flex-shrink: 0;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.version {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  white-space: nowrap;
}
</style>
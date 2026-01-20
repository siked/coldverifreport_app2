/**
 * 本地存储管理模块
 * 用于管理冷链验证APP的所有本地数据存储
 */

class StorageManager {
  constructor() {
    // 存储键名常量
    this.KEYS = {
      SERVER_URL: 'server_url',
      USERNAME: 'username',
      PASSWORD: 'password',
      TOKEN: 'token',
      USER_INFO: 'user_info',
      SERVER_HISTORY: 'server_history'
    };
  }

  /**
   * 设置服务器地址
   * @param {string} url - 服务器地址
   * @param {string} username - 用户名
   * @param {string} password - 密码
   */
  setServerUrl(url, username = null, password = null) {
    try {
      uni.setStorageSync(this.KEYS.SERVER_URL, url);
      this.addServerToHistory(url, username, password);
      return true;
    } catch (error) {
      console.error('设置服务器地址失败:', error);
      return false;
    }
  }

  /**
   * 获取服务器地址
   * @returns {string|null} 服务器地址
   */
  getServerUrl() {
    try {
      return uni.getStorageSync(this.KEYS.SERVER_URL);
    } catch (error) {
      console.error('获取服务器地址失败:', error);
      return null;
    }
  }

  /**
   * 设置用户名
   * @param {string} username - 用户名
   */
  setUsername(username) {
    try {
      uni.setStorageSync(this.KEYS.USERNAME, username);
      return true;
    } catch (error) {
      console.error('设置用户名失败:', error);
      return false;
    }
  }

  /**
   * 获取用户名
   * @returns {string|null} 用户名
   */
  getUsername() {
    try {
      return uni.getStorageSync(this.KEYS.USERNAME);
    } catch (error) {
      console.error('获取用户名失败:', error);
      return null;
    }
  }

  /**
   * 设置密码
   * @param {string} password - 密码
   */
  setPassword(password) {
    try {
      uni.setStorageSync(this.KEYS.PASSWORD, password);
      return true;
    } catch (error) {
      console.error('设置密码失败:', error);
      return false;
    }
  }

  /**
   * 获取密码
   * @returns {string|null} 密码
   */
  getPassword() {
    try {
      return uni.getStorageSync(this.KEYS.PASSWORD);
    } catch (error) {
      console.error('获取密码失败:', error);
      return null;
    }
  }

  /**
   * 设置Token
   * @param {string} token - 认证Token
   */
  setToken(token) {
    try {
      uni.setStorageSync(this.KEYS.TOKEN, token);
      return true;
    } catch (error) {
      console.error('设置Token失败:', error);
      return false;
    }
  }

  /**
   * 获取Token
   * @returns {string|null} Token
   */
  getToken() {
    try {
      return uni.getStorageSync(this.KEYS.TOKEN);
    } catch (error) {
      console.error('获取Token失败:', error);
      return null;
    }
  }

  /**
   * 设置用户信息
   * @param {Object} userInfo - 用户信息对象
   */
  setUserInfo(userInfo) {
    try {
      uni.setStorageSync(this.KEYS.USER_INFO, userInfo);
      return true;
    } catch (error) {
      console.error('设置用户信息失败:', error);
      return false;
    }
  }

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息对象
   */
  getUserInfo() {
    try {
      return uni.getStorageSync(this.KEYS.USER_INFO);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 添加服务器地址到历史记录
   * @param {string} url - 服务器地址
   * @param {string} username - 用户名
   * @param {string} password - 密码
   */
  addServerToHistory(url, username = null, password = null) {
    try {
      let history = uni.getStorageSync(this.KEYS.SERVER_HISTORY) || [];
      
      // 移除已存在的相同地址
      history = history.filter(item => (typeof item === 'string' ? item : item.url) !== url);
      
      // 构建服务器信息对象
      const serverInfo = {
        url: url,
        username: username,
        password: password,
        timestamp: Date.now()
      };
      
      // 添加到开头
      history.unshift(serverInfo);
      
      // 最多保留10个历史记录
      if (history.length > 10) {
        history = history.slice(0, 10);
      }
      
      uni.setStorageSync(this.KEYS.SERVER_HISTORY, history);
      return true;
    } catch (error) {
      console.error('添加服务器历史记录失败:', error);
      return false;
    }
  }

  /**
   * 仅添加服务器地址到历史记录（不设为当前服务器）
   * @param {string} url - 服务器地址
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {boolean} 是否添加成功
   */
  saveServerToHistory(url, username = null, password = null) {
    return this.addServerToHistory(url, username, password);
  }

  /**
   * 添加新的服务器地址到历史记录（仅当URL不存在时）
   * @param {string} url - 服务器地址
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {boolean} 是否添加成功，如果URL已存在则返回false
   */
  addNewServerToHistory(url, username = null, password = null) {
    try {
      let history = uni.getStorageSync(this.KEYS.SERVER_HISTORY) || [];
      
      // 检查URL是否已存在
      const exists = history.some(item => (typeof item === 'string' ? item : item.url) === url);
      
      if (exists) {
        // 如果URL已存在，返回false表示未添加新记录
        return false;
      }
      
      // 构建服务器信息对象
      const serverInfo = {
        url: url,
        username: username,
        password: password,
        timestamp: Date.now()
      };
      
      // 添加到开头
      history.unshift(serverInfo);
      
      // 最多保留10个历史记录
      if (history.length > 10) {
        history = history.slice(0, 10);
      }
      
      uni.setStorageSync(this.KEYS.SERVER_HISTORY, history);
      return true;
    } catch (error) {
      console.error('添加新服务器历史记录失败:', error);
      return false;
    }
  }

  /**
   * 获取服务器历史记录
   * @returns {Array} 服务器地址历史记录数组
   */
  getServerHistory() {
    try {
      const history = uni.getStorageSync(this.KEYS.SERVER_HISTORY) || [];
      // 返回仅包含url的数组，以保持向后兼容性
      return history.map(item => typeof item === 'string' ? item : item.url);
    } catch (error) {
      console.error('获取服务器历史记录失败:', error);
      return [];
    }
  }

  /**
   * 获取完整的服务器历史记录（包含账号密码信息）
   * @returns {Array} 服务器信息历史记录数组
   */
  getFullServerHistory() {
    try {
      return uni.getStorageSync(this.KEYS.SERVER_HISTORY) || [];
    } catch (error) {
      console.error('获取完整服务器历史记录失败:', error);
      return [];
    }
  }

  /**
   * 获取特定服务器的账号密码信息
   * @param {string} url - 服务器地址
   * @returns {Object|null} 包含用户名和密码的对象
   */
  getServerCredentials(url) {
    try {
      const history = uni.getStorageSync(this.KEYS.SERVER_HISTORY) || [];
      const serverInfo = history.find(item => (typeof item === 'string' ? item : item.url) === url);
      
      if (serverInfo && typeof serverInfo !== 'string') {
        return {
          username: serverInfo.username,
          password: serverInfo.password
        };
      }
      
      return null;
    } catch (error) {
      console.error('获取服务器账号密码信息失败:', error);
      return null;
    }
  }

  /**
   * 更新特定服务器的账号密码信息
   * @param {string} url - 服务器地址
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {boolean} 是否更新成功
   */
  updateServerCredentials(url, username, password) {
    try {
      const history = uni.getStorageSync(this.KEYS.SERVER_HISTORY) || [];
      
      // 查找服务器记录并更新账号密码
      const updatedHistory = history.map(item => {
        if ((typeof item === 'string' ? item : item.url) === url) {
          if (typeof item === 'string') {
            // 如果是旧格式（字符串），转换为新格式
            return {
              url: item,
              username: username,
              password: password,
              timestamp: Date.now()
            };
          } else {
            // 更新现有记录的账号密码
            return {
              ...item,
              username: username,
              password: password,
              timestamp: Date.now()
            };
          }
        }
        return item;
      });
      
      uni.setStorageSync(this.KEYS.SERVER_HISTORY, updatedHistory);
      return true;
    } catch (error) {
      console.error('更新服务器账号密码信息失败:', error);
      return false;
    }
  }

  /**
   * 清除所有认证相关数据（退出登录时使用）
   */
  clearAuthData() {
    try {
      uni.removeStorageSync(this.KEYS.TOKEN);
      uni.removeStorageSync(this.KEYS.USER_INFO);
      return true;
    } catch (error) {
      console.error('清除认证数据失败:', error);
      return false;
    }
  }

  /**
   * 清除所有存储数据（完全重置应用时使用）
   */
  clearAllData() {
    try {
      Object.values(this.KEYS).forEach(key => {
        uni.removeStorageSync(key);
      });
      return true;
    } catch (error) {
      console.error('清除所有数据失败:', error);
      return false;
    }
  }

  /**
   * 检查是否已登录（是否有有效的Token）
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    const token = this.getToken();
    return !!token && token.length > 0;
  }

  /**
   * 获取完整的API基础地址
   * @returns {string|null} 完整的API基础地址
   */
  getApiBaseUrl() {
    const serverUrl = this.getServerUrl();
    if (!serverUrl) return null;
    
    // 确保URL以http://或https://开头
    if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
      return `http://${serverUrl}`;
    }
    return serverUrl;
  }


}

// 创建单例实例
const storageManager = new StorageManager();

export default storageManager;
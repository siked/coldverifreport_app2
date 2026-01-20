if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  class StorageManager {
    constructor() {
      this.KEYS = {
        SERVER_URL: "server_url",
        USERNAME: "username",
        PASSWORD: "password",
        TOKEN: "token",
        USER_INFO: "user_info",
        SERVER_HISTORY: "server_history"
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
        formatAppLog("error", "at common/storage.js:31", "设置服务器地址失败:", error);
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
        formatAppLog("error", "at common/storage.js:44", "获取服务器地址失败:", error);
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
        formatAppLog("error", "at common/storage.js:58", "设置用户名失败:", error);
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
        formatAppLog("error", "at common/storage.js:71", "获取用户名失败:", error);
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
        formatAppLog("error", "at common/storage.js:85", "设置密码失败:", error);
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
        formatAppLog("error", "at common/storage.js:98", "获取密码失败:", error);
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
        formatAppLog("error", "at common/storage.js:112", "设置Token失败:", error);
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
        formatAppLog("error", "at common/storage.js:125", "获取Token失败:", error);
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
        formatAppLog("error", "at common/storage.js:139", "设置用户信息失败:", error);
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
        formatAppLog("error", "at common/storage.js:152", "获取用户信息失败:", error);
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
        history = history.filter((item) => (typeof item === "string" ? item : item.url) !== url);
        const serverInfo = {
          url,
          username,
          password,
          timestamp: Date.now()
        };
        history.unshift(serverInfo);
        if (history.length > 10) {
          history = history.slice(0, 10);
        }
        uni.setStorageSync(this.KEYS.SERVER_HISTORY, history);
        return true;
      } catch (error) {
        formatAppLog("error", "at common/storage.js:189", "添加服务器历史记录失败:", error);
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
        const exists = history.some((item) => (typeof item === "string" ? item : item.url) === url);
        if (exists) {
          return false;
        }
        const serverInfo = {
          url,
          username,
          password,
          timestamp: Date.now()
        };
        history.unshift(serverInfo);
        if (history.length > 10) {
          history = history.slice(0, 10);
        }
        uni.setStorageSync(this.KEYS.SERVER_HISTORY, history);
        return true;
      } catch (error) {
        formatAppLog("error", "at common/storage.js:243", "添加新服务器历史记录失败:", error);
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
        return history.map((item) => typeof item === "string" ? item : item.url);
      } catch (error) {
        formatAppLog("error", "at common/storage.js:258", "获取服务器历史记录失败:", error);
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
        formatAppLog("error", "at common/storage.js:271", "获取完整服务器历史记录失败:", error);
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
        const serverInfo = history.find((item) => (typeof item === "string" ? item : item.url) === url);
        if (serverInfo && typeof serverInfo !== "string") {
          return {
            username: serverInfo.username,
            password: serverInfo.password
          };
        }
        return null;
      } catch (error) {
        formatAppLog("error", "at common/storage.js:295", "获取服务器账号密码信息失败:", error);
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
        const updatedHistory = history.map((item) => {
          if ((typeof item === "string" ? item : item.url) === url) {
            if (typeof item === "string") {
              return {
                url: item,
                username,
                password,
                timestamp: Date.now()
              };
            } else {
              return {
                ...item,
                username,
                password,
                timestamp: Date.now()
              };
            }
          }
          return item;
        });
        uni.setStorageSync(this.KEYS.SERVER_HISTORY, updatedHistory);
        return true;
      } catch (error) {
        formatAppLog("error", "at common/storage.js:338", "更新服务器账号密码信息失败:", error);
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
        formatAppLog("error", "at common/storage.js:352", "清除认证数据失败:", error);
        return false;
      }
    }
    /**
     * 清除所有存储数据（完全重置应用时使用）
     */
    clearAllData() {
      try {
        Object.values(this.KEYS).forEach((key) => {
          uni.removeStorageSync(key);
        });
        return true;
      } catch (error) {
        formatAppLog("error", "at common/storage.js:367", "清除所有数据失败:", error);
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
      if (!serverUrl)
        return null;
      if (!serverUrl.startsWith("http://") && !serverUrl.startsWith("https://")) {
        return `http://${serverUrl}`;
      }
      return serverUrl;
    }
  }
  const storageManager = new StorageManager();
  class ApiService {
    constructor() {
      this.baseURL = "";
      this.timeout = 15e3;
    }
    /**
     * 更新基础URL
     */
    updateBaseURL() {
      this.baseURL = storageManager.getApiBaseUrl() || "";
    }
    /**
     * 通用请求方法
     * @param {string} url - 请求URL
     * @param {Object} options - 请求选项
     * @returns {Promise} Promise对象
     */
    async request(url, options = {}) {
      this.updateBaseURL();
      if (!this.baseURL) {
        throw new Error("请先配置服务器地址");
      }
      const config2 = {
        url: `${this.baseURL}${url}`,
        method: options.method || "GET",
        timeout: this.timeout,
        header: {
          "Content-Type": "application/json",
          ...options.header
        },
        ...options
      };
      if (options.auth !== false) {
        const token = storageManager.getToken();
        if (token) {
          config2.header.Authorization = `Bearer ${token}`;
        }
      }
      return new Promise((resolve, reject) => {
        uni.request({
          ...config2,
          success: (res2) => {
            if (res2.statusCode >= 200 && res2.statusCode < 300) {
              resolve(res2.data);
            } else if (res2.statusCode === 401) {
              storageManager.clearAuthData();
              uni.reLaunch({
                url: "/pages/login/login"
              });
              reject(new Error("登录已过期，请重新登录"));
            } else {
              reject(new Error(`请求失败: ${res2.statusCode}`));
            }
          },
          fail: (err) => {
            formatAppLog("error", "at common/api.js:73", "网络请求失败:", err);
            reject(new Error("网络连接失败，请检查网络设置"));
          }
        });
      });
    }
    /**
     * GET请求
     * @param {string} url - 请求URL
     * @param {Object} params - 查询参数
     * @param {Object} options - 其他选项
     * @returns {Promise} Promise对象
     */
    get(url, params = {}, options = {}) {
      let queryString = "";
      if (params && Object.keys(params).length > 0) {
        queryString = "?" + Object.keys(params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join("&");
      }
      return this.request(`${url}${queryString}`, {
        method: "GET",
        ...options
      });
    }
    /**
     * POST请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @param {Object} options - 其他选项
     * @returns {Promise} Promise对象
     */
    post(url, data = {}, options = {}) {
      return this.request(url, {
        method: "POST",
        data,
        ...options
      });
    }
    /**
     * PUT请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @param {Object} options - 其他选项
     * @returns {Promise} Promise对象
     */
    put(url, data = {}, options = {}) {
      return this.request(url, {
        method: "PUT",
        data,
        ...options
      });
    }
    /**
     * DELETE请求
     * @param {string} url - 请求URL
     * @param {Object} options - 其他选项
     * @returns {Promise} Promise对象
     */
    delete(url, options = {}) {
      return this.request(url, {
        method: "DELETE",
        ...options
      });
    }
    // ==================== 具体业务API ====================
    /**
     * 用户登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise} Promise对象
     */
    async login(username, password) {
      try {
        const data = await this.post("/api/user-enf/login", {
          username,
          password
        }, { auth: false });
        if (data.success) {
          storageManager.setToken(data.token);
          storageManager.setUserInfo(data.user);
          return data;
        } else {
          throw new Error("登录失败");
        }
      } catch (error) {
        throw error;
      }
    }
    /**
     * 获取分类列表
     * @returns {Promise} Promise对象
     */
    async getCategories() {
      try {
        const data = await this.get("/api/user-enf/categories");
        return data.categories || [];
      } catch (error) {
        throw error;
      }
    }
    /**
     * 获取任务列表
     * @param {string} categoryId - 分类ID
     * @param {boolean} forceRefresh - 是否强制刷新
     * @returns {Promise} Promise对象
     */
    async getTasks(categoryId, forceRefresh = false) {
      try {
        if (!categoryId) {
          throw new Error("分类ID不能为空");
        }
        const data = await this.get("/api/user-enf/tasks", {
          categoryId
        });
        return data.tasks || [];
      } catch (error) {
        throw error;
      }
    }
    /**
     * 获取任务详情
     * @param {string} taskId - 任务ID
     * @returns {Promise} Promise对象
     */
    async getTaskDetail(taskId) {
      try {
        if (!taskId) {
          throw new Error("任务ID不能为空");
        }
        const data = await this.get(`/api/user-enf/tasks/${taskId}`);
        return data.task || null;
      } catch (error) {
        throw error;
      }
    }
    /**
     * 更新任务标签
     * @param {string} taskId - 任务ID
     * @param {Array} tags - 标签数组
     * @param {Array} deviceSnList - 设备SN列表（可选）
     * @returns {Promise} Promise对象
     */
    async updateTaskTags(taskId, tags, deviceSnList) {
      try {
        if (!taskId) {
          throw new Error("任务ID不能为空");
        }
        if (!Array.isArray(tags)) {
          throw new Error("标签必须是数组格式");
        }
        if (deviceSnList !== void 0 && !Array.isArray(deviceSnList)) {
          throw new Error("deviceSnList 必须是数组格式");
        }
        const data = await this.put("/api/user-enf/task-tags", {
          taskId,
          tags,
          ...deviceSnList !== void 0 ? { deviceSnList } : {}
        });
        return data.task;
      } catch (error) {
        throw error;
      }
    }
    /**
     * 上传图片到七牛云
     * @param {string} filePath - 本地图片路径（uni.chooseImage 返回）
     * @returns {Promise} Promise对象，成功时包含 { success, url }
     */
    async uploadImage(filePath) {
      this.updateBaseURL();
      if (!this.baseURL) {
        throw new Error("请先配置服务器地址");
      }
      if (!filePath) {
        throw new Error("请选择要上传的图片");
      }
      const token = storageManager.getToken();
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: `${this.baseURL}/api/user-enf/upload/image`,
          filePath,
          name: "file",
          // 后端约定字段名
          header: {
            // uni.uploadFile 会自动设置 multipart/form-data
            ...token ? { Authorization: `Bearer ${token}` } : {}
          },
          success: (res2) => {
            if (res2.statusCode >= 200 && res2.statusCode < 300) {
              let data = res2.data;
              try {
                if (typeof data === "string") {
                  data = JSON.parse(data);
                }
              } catch (e2) {
                reject(new Error("服务器返回格式错误"));
                return;
              }
              if (data && data.success) {
                resolve(data);
              } else {
                reject(new Error(data && data.message || "图片上传失败"));
              }
            } else if (res2.statusCode === 401) {
              storageManager.clearAuthData();
              uni.reLaunch({
                url: "/pages/login/login"
              });
              reject(new Error("登录已过期，请重新登录"));
            } else if (res2.statusCode === 400) {
              reject(new Error("图片上传失败：文件不合法或过大"));
            } else {
              reject(new Error(`图片上传失败: ${res2.statusCode}`));
            }
          },
          fail: (err) => {
            formatAppLog("error", "at common/api.js:317", "图片上传失败:", err);
            reject(new Error("图片上传失败，请检查网络连接"));
          }
        });
      });
    }
    /**
     * 测试服务器连接
     * @param {string} serverUrl - 服务器地址
     * @returns {Promise} Promise对象
     */
    async testConnection(serverUrl) {
      try {
        const originalBaseURL2 = this.baseURL;
        this.baseURL = serverUrl.startsWith("http") ? serverUrl : `http://${serverUrl}`;
        const response = await this.get("/api/user-enf/categories", {}, {
          auth: false,
          timeout: 5e3
          // 5秒超时用于测试
        });
        this.baseURL = originalBaseURL2;
        return true;
      } catch (error) {
        this.baseURL = originalBaseURL;
        throw error;
      }
    }
  }
  const apiService = new ApiService();
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$6 = {
    data() {
      return {
        serverUrl: "",
        customServerUrl: "",
        username: "",
        password: "",
        loggingIn: false,
        serverHistory: [],
        selectedServer: "",
        showCustomServer: false,
        isValidServerUrl: false
      };
    },
    computed: {
      // 计算属性：是否可以登录
      canLogin() {
        return this.serverUrl && this.username && this.password && !this.loggingIn && this.isValidServerUrl;
      },
      // 带自定义选项的服务器历史记录
      serverHistoryWithCustom() {
        return [...this.serverHistory, "自定义服务器地址"];
      }
    },
    onLoad() {
      this.loadStoredData();
    },
    methods: {
      // 加载已存储的数据
      loadStoredData() {
        this.serverHistory = storageManager.getServerHistory();
        const savedServerUrl = storageManager.getServerUrl();
        if (savedServerUrl) {
          this.serverUrl = savedServerUrl;
          this.selectedServer = savedServerUrl;
          this.validateServerUrl();
          this.loadCredentialsForServer(savedServerUrl);
        } else if (this.serverHistory.length > 0) {
          const firstServer = this.serverHistory[0];
          this.serverUrl = firstServer;
          this.selectedServer = firstServer;
          this.validateServerUrl();
          this.loadCredentialsForServer(firstServer);
        } else {
          this.username = storageManager.getUsername() || "";
          this.password = storageManager.getPassword() || "";
        }
        if (storageManager.isLoggedIn()) {
          this.navigateToMain();
        }
      },
      // 服务器选择变化
      onServerChange(e2) {
        const selectedIndex = e2.detail.value;
        if (selectedIndex === this.serverHistory.length) {
          this.showCustomServer = true;
          this.customServerUrl = "";
          this.selectedServer = "";
        } else {
          this.showCustomServer = false;
          this.serverUrl = this.serverHistory[selectedIndex];
          this.selectedServer = this.serverUrl;
          this.validateServerUrl();
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
        this.isValidServerUrl = url.startsWith("http://") || url.startsWith("https://");
      },
      // 确认自定义服务器地址
      confirmCustomServer() {
        if (this.isValidServerUrl) {
          this.serverUrl = this.customServerUrl;
          this.selectedServer = this.customServerUrl;
          this.showCustomServer = false;
          storageManager.setServerUrl(this.serverUrl, this.username, this.password);
          this.serverHistory = storageManager.getServerHistory();
          this.loadCredentialsForServer(this.serverUrl);
        }
      },
      // 为指定服务器加载账号密码
      loadCredentialsForServer(serverUrl) {
        const credentials = storageManager.getServerCredentials(serverUrl);
        if (credentials) {
          this.username = credentials.username || "";
          this.password = credentials.password || "";
        } else {
          this.username = "";
          this.password = "";
        }
      },
      // 处理登录
      async handleLogin() {
        if (!this.canLogin)
          return;
        this.loggingIn = true;
        try {
          storageManager.setServerUrl(this.serverUrl, this.username, this.password);
          storageManager.setUsername(this.username);
          storageManager.setPassword(this.password);
          const result = await apiService.login(this.username, this.password);
          if (result.success) {
            uni.showToast({
              title: "登录成功",
              icon: "success"
            });
            setTimeout(() => {
              this.navigateToMain();
            }, 1e3);
          }
        } catch (error) {
          formatAppLog("error", "at pages/login/login.vue:261", "登录失败:", error);
          uni.showToast({
            title: error.message || "登录失败",
            icon: "none"
          });
        } finally {
          this.loggingIn = false;
        }
      },
      // 跳转到主页面
      navigateToMain() {
        formatAppLog("log", "at pages/login/login.vue:273", "尝试跳转到任务管理页面");
        uni.switchTab({
          url: "/pages/task/category/category",
          success: () => {
            formatAppLog("log", "at pages/login/login.vue:279", "switchTab跳转成功");
          },
          fail: (error) => {
            formatAppLog("error", "at pages/login/login.vue:282", "switchTab跳转失败:", error);
            uni.redirectTo({
              url: "/pages/task/category/category",
              success: () => {
                formatAppLog("log", "at pages/login/login.vue:288", "redirectTo跳转成功");
              },
              fail: (redirectError) => {
                formatAppLog("error", "at pages/login/login.vue:291", "redirectTo也失败:", redirectError);
                uni.reLaunch({
                  url: "/pages/task/category/category",
                  success: () => {
                    formatAppLog("log", "at pages/login/login.vue:297", "reLaunch跳转成功");
                  },
                  fail: (relaunchError) => {
                    formatAppLog("error", "at pages/login/login.vue:300", "所有跳转方式都失败:", relaunchError);
                  }
                });
              }
            });
          }
        });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "冷链验证系统"),
        vue.createElementVNode("text", { class: "subtitle" }, "Cold Chain Verification System")
      ]),
      vue.createElementVNode("view", { class: "login-form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "服务器地址"),
          $data.serverHistory.length > 0 ? (vue.openBlock(), vue.createElementBlock("picker", {
            key: 0,
            range: $options.serverHistoryWithCustom,
            onChange: _cache[0] || (_cache[0] = (...args) => $options.onServerChange && $options.onServerChange(...args)),
            class: "server-picker"
          }, [
            vue.createElementVNode("view", { class: "picker-display" }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($data.selectedServer || "请选择或输入服务器地址"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "arrow" }, "▼")
            ])
          ], 40, ["range"])) : vue.withDirectives((vue.openBlock(), vue.createElementBlock(
            "input",
            {
              key: 1,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.serverUrl = $event),
              onInput: _cache[2] || (_cache[2] = (...args) => $options.validateServerUrl && $options.validateServerUrl(...args)),
              placeholder: "请输入服务器地址 (http:// 或 https:// 开头)",
              class: "input"
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          )), [
            [vue.vModelText, $data.serverUrl]
          ])
        ]),
        $data.showCustomServer ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "form-item"
        }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.customServerUrl = $event),
              placeholder: "请输入服务器地址",
              class: "input",
              onBlur: _cache[4] || (_cache[4] = (...args) => $options.validateServerUrl && $options.validateServerUrl(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.customServerUrl]
          ]),
          vue.createElementVNode("button", {
            size: "mini",
            type: "primary",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.confirmCustomServer && $options.confirmCustomServer(...args)),
            disabled: !$data.isValidServerUrl
          }, "确定", 8, ["disabled"])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "用户名"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.username = $event),
              placeholder: "请输入用户名",
              class: "input"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.username]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "密码"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.password = $event),
              placeholder: "请输入密码",
              password: "",
              class: "input"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.password]
          ])
        ]),
        vue.createElementVNode("button", {
          class: "login-btn",
          type: "primary",
          loading: $data.loggingIn,
          disabled: !$options.canLogin,
          onClick: _cache[8] || (_cache[8] = (...args) => $options.handleLogin && $options.handleLogin(...args))
        }, vue.toDisplayString($data.loggingIn ? "登录中..." : "登录"), 9, ["loading", "disabled"])
      ]),
      vue.createElementVNode("view", { class: "footer" }, [
        vue.createElementVNode("text", { class: "version" }, "版本号: 1.0.0")
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-e4e4508d"], ["__file", "C:/Users/Administrator/Project/ColdVerifReport/coldverifreport_app2/pages/login/login.vue"]]);
  const _sfc_main$5 = {
    data() {
      return {
        categories: [],
        loading: false,
        cacheKey: "categories_list"
      };
    },
    onLoad() {
      this.loadCategoriesFromCache();
    },
    onPullDownRefresh() {
      uni.showModal({
        title: "更新数据",
        content: "是否从服务器获取最新数据？",
        confirmText: "更新",
        cancelText: "取消",
        success: (res2) => {
          if (res2.confirm) {
            this.updateCategoriesFromAPI(true).finally(() => {
              uni.stopPullDownRefresh();
            });
          } else {
            uni.stopPullDownRefresh();
          }
        },
        fail: () => {
          uni.stopPullDownRefresh();
        }
      });
    },
    methods: {
      // 优先从缓存加载分类列表
      async loadCategoriesFromCache() {
        const cachedData = uni.getStorageSync(this.cacheKey);
        if (cachedData && cachedData.categories && Array.isArray(cachedData.categories)) {
          formatAppLog("log", "at pages/task/category/category.vue:82", "从缓存加载分类数据:", this.cacheKey, "分类数量:", cachedData.categories.length);
          this.categories = cachedData.categories;
          return;
        } else {
          formatAppLog("log", "at pages/task/category/category.vue:86", "缓存未找到或已过期，从API获取数据:", this.cacheKey);
          await this.updateCategoriesFromAPI(true);
        }
      },
      // 从API更新分类列表
      async updateCategoriesFromAPI(showLoading = true) {
        if (showLoading) {
          this.loading = true;
        }
        try {
          const categories = await apiService.getCategories();
          this.categories = categories;
          uni.setStorageSync(this.cacheKey, {
            categories,
            timestamp: Date.now()
          });
          formatAppLog("log", "at pages/task/category/category.vue:108", "数据已保存到缓存:", this.cacheKey, "分类数量:", categories.length);
        } catch (error) {
          formatAppLog("error", "at pages/task/category/category.vue:110", "更新分类失败:", error);
          uni.showToast({
            title: error.message || "更新分类失败",
            icon: "none"
          });
        } finally {
          if (showLoading) {
            this.loading = false;
          }
        }
      },
      // 获取分类图标
      getCategoryIcon(type) {
        const icons = {
          "company": "🏢",
          "department": "👥",
          "taskType": "📋",
          "project": "🎯"
        };
        return icons[type] || "📁";
      },
      // 格式化分类路径
      formatCategoryPath(category) {
        if (category.pathNames && category.pathNames.length > 0) {
          return category.pathNames.join(" > ");
        }
        return category.name;
      },
      // 获取分类路径的第一部分（第0个元素）
      getCategoryPathFirst(category) {
        if (category.pathNames && category.pathNames.length > 0) {
          return category.pathNames[0];
        }
        return category.name;
      },
      // 获取分类路径的剩余部分（第1个元素及之后）
      getCategoryPathRest(category) {
        if (category.pathNames && category.pathNames.length > 1) {
          return category.pathNames.slice(1).join(" > ");
        }
        return "";
      },
      // 跳转到分类详情页面
      goToCategoryDetail(category) {
        uni.navigateTo({
          url: `/pages/task/category-detail/category-detail?categoryId=${category._id}&categoryName=${encodeURIComponent(category.name)}`
        });
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "category-container" }, [
      vue.createElementVNode("view", { class: "category-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.categories, (category, index2) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: category._id,
              class: "category-item",
              onClick: ($event) => $options.goToCategoryDetail(category)
            }, [
              vue.createElementVNode("view", { class: "category-icon" }, [
                vue.createElementVNode(
                  "text",
                  { class: "icon-text" },
                  vue.toDisplayString($options.getCategoryIcon(category.type)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "category-info" }, [
                vue.createElementVNode("view", { class: "category-name-row" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "category-name" },
                    vue.toDisplayString(category.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "path-first" },
                    vue.toDisplayString($options.getCategoryPathFirst(category)),
                    1
                    /* TEXT */
                  )
                ]),
                $options.getCategoryPathRest(category) ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: "path-rest"
                  },
                  vue.toDisplayString($options.getCategoryPathRest(category)),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("view", { class: "arrow" }, "▶")
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $data.categories.length === 0 && !$data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { class: "empty-text" }, "暂无分类数据")
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading"
      }, [
        vue.createElementVNode("text", null, "加载中...")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesTaskCategoryCategory = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-abf1362a"], ["__file", "C:/Users/Administrator/Project/ColdVerifReport/coldverifreport_app2/pages/task/category/category.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        categoryId: "",
        categoryName: "",
        templateName: "",
        tasks: [],
        loading: false,
        cacheKey: "",
        scrollTop: 0,
        currentScrollTop: 0,
        refresherTriggered: false,
        // 提交相关状态
        isSubmitting: false,
        currentSubmitIndex: 0,
        totalSubmitCount: 0,
        currentSubmitTaskName: ""
      };
    },
    computed: {
      // 是否有未提交的任务
      hasUnsavedTasks() {
        return this.tasks.some((task) => task.hasUnsavedTags);
      },
      // 未提交任务数量
      unsavedTasksCount() {
        return this.tasks.filter((task) => task.hasUnsavedTags).length;
      },
      // 进度百分比
      progressPercent() {
        if (this.totalSubmitCount === 0)
          return 0;
        return Math.round((this.currentSubmitIndex + 1) / this.totalSubmitCount * 100);
      }
    },
    onLoad(options) {
      this.categoryId = options.categoryId;
      this.categoryName = decodeURIComponent(options.categoryName);
      this.cacheKey = `${this.categoryId}_tasks`;
      if (this.categoryId) {
        this.loadTasks();
      }
    },
    onReady() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.restoreScrollPosition();
        }, 100);
      });
    },
    onShow() {
      this.refreshTasksFromCache();
      this.$nextTick(() => {
        setTimeout(() => {
          this.refreshTasksFromCache();
          this.restoreScrollPosition();
        }, 100);
      });
    },
    onHide() {
      this.saveScrollPosition();
    },
    onUnload() {
      this.saveScrollPosition();
    },
    onPullDownRefresh() {
      uni.showModal({
        title: "更新数据",
        content: "是否从服务器获取最新数据？",
        confirmText: "更新",
        cancelText: "取消",
        success: (res2) => {
          if (res2.confirm) {
            this.loadTasks(true).finally(() => {
              uni.stopPullDownRefresh();
            });
          } else {
            uni.stopPullDownRefresh();
          }
        },
        fail: () => {
          uni.stopPullDownRefresh();
        }
      });
    },
    methods: {
      // 任务列表排序（支持中文和字母混合排序）
      sortTasks(tasks) {
        if (!Array.isArray(tasks) || tasks.length === 0) {
          return tasks;
        }
        return [...tasks].sort((a2, b2) => {
          const aValue = (a2.taskNo || a2.taskName || "").toString().trim();
          const bValue = (b2.taskNo || b2.taskName || "").toString().trim();
          return aValue.localeCompare(bValue, "zh-CN", {
            numeric: true,
            sensitivity: "base"
          });
        });
      },
      // scroll-view 下拉刷新
      onRefresherRefresh() {
        this.refresherTriggered = true;
        uni.showModal({
          title: "更新数据",
          content: "是否从服务器获取最新数据？",
          confirmText: "更新",
          cancelText: "取消",
          success: (res2) => {
            if (res2.confirm) {
              this.loadTasks(true).finally(() => {
                this.refresherTriggered = false;
              });
            } else {
              this.refresherTriggered = false;
            }
          },
          fail: () => {
            this.refresherTriggered = false;
          }
        });
      },
      // 加载任务列表
      async loadTasks(forceRefresh = false) {
        if (!this.categoryId)
          return;
        this.loading = true;
        try {
          if (!forceRefresh) {
            const cachedData = uni.getStorageSync(this.cacheKey);
            if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
              formatAppLog("log", "at pages/task/category-detail/category-detail.vue:239", "从缓存加载任务数据:", this.cacheKey, "任务数量:", cachedData.tasks.length);
              if (cachedData.tasks.length > 0 && cachedData.tasks[0].templateName) {
                this.templateName = cachedData.tasks[0].templateName;
              }
              const sortedTasks2 = this.sortTasks(cachedData.tasks);
              this.$nextTick(() => {
                this.tasks = sortedTasks2;
                this.loading = false;
                this.restoreScrollPosition();
              });
              return;
            } else {
              formatAppLog("log", "at pages/task/category-detail/category-detail.vue:255", "缓存未找到或已过期，从API获取数据:", this.cacheKey);
            }
          }
          const tasks = await apiService.getTasks(this.categoryId);
          const tasksWithFlag = (tasks || []).map((task) => ({
            ...task,
            hasUnsavedTags: task.hasUnsavedTags || false
          }));
          if (tasksWithFlag.length > 0 && tasksWithFlag[0].templateName) {
            this.templateName = tasksWithFlag[0].templateName;
          }
          const sortedTasks = this.sortTasks(tasksWithFlag);
          const existingCache = uni.getStorageSync(this.cacheKey) || {};
          uni.setStorageSync(this.cacheKey, {
            tasks: sortedTasks,
            timestamp: Date.now(),
            data: existingCache.data || {}
            // 保留原有的 data 信息（包括滚动位置）
          });
          formatAppLog("log", "at pages/task/category-detail/category-detail.vue:285", "数据已保存到缓存:", this.cacheKey, "任务数量:", sortedTasks.length);
          this.tasks = sortedTasks;
        } catch (error) {
          formatAppLog("error", "at pages/task/category-detail/category-detail.vue:289", "加载任务失败:", error);
          uni.showToast({
            title: error.message || "加载任务失败",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      // scroll-view 滚动事件处理
      onScroll(e2) {
        const scrollTop = e2.detail.scrollTop || 0;
        this.currentScrollTop = scrollTop;
      },
      // 保存滚动位置到缓存
      saveScrollPosition() {
        try {
          const scrollTop = this.currentScrollTop || 0;
          if (scrollTop <= 0) {
            return;
          }
          const cachedData = uni.getStorageSync(this.cacheKey);
          if (cachedData) {
            uni.setStorageSync(this.cacheKey, {
              ...cachedData,
              data: {
                ...cachedData.data || {},
                scrollPosition: scrollTop
              }
            });
            formatAppLog("log", "at pages/task/category-detail/category-detail.vue:326", "任务列表滚动位置已保存:", this.cacheKey, scrollTop);
          }
        } catch (error) {
          formatAppLog("error", "at pages/task/category-detail/category-detail.vue:329", "保存滚动位置失败:", error);
        }
      },
      // 从缓存恢复滚动位置
      restoreScrollPosition() {
        try {
          const cachedData = uni.getStorageSync(this.cacheKey);
          if (cachedData && cachedData.data && cachedData.data.scrollPosition) {
            const savedScrollTop = cachedData.data.scrollPosition;
            if (savedScrollTop > 0 && Math.abs(this.currentScrollTop - savedScrollTop) > 10) {
              this.$nextTick(() => {
                this.scrollTop = savedScrollTop;
                this.currentScrollTop = savedScrollTop;
                formatAppLog("log", "at pages/task/category-detail/category-detail.vue:345", "任务列表滚动位置已恢复:", this.cacheKey, savedScrollTop);
              });
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/task/category-detail/category-detail.vue:350", "恢复滚动位置失败:", error);
        }
      },
      // 从缓存刷新任务列表（不调用API，仅读取缓存中的最新数据）
      refreshTasksFromCache() {
        try {
          if (!this.cacheKey)
            return;
          const cachedData = uni.getStorageSync(this.cacheKey);
          if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
            const newTasks = this.sortTasks(cachedData.tasks.map((task) => ({ ...task })));
            this.tasks = newTasks;
            formatAppLog("log", "at pages/task/category-detail/category-detail.vue:369", "从缓存刷新任务列表数据:", this.cacheKey, "任务数量:", newTasks.length);
            formatAppLog(
              "log",
              "at pages/task/category-detail/category-detail.vue:370",
              "任务列表状态已更新，hasUnsavedTags 状态:",
              newTasks.map((t2) => ({ id: t2._id, name: t2.taskName, hasUnsavedTags: t2.hasUnsavedTags }))
            );
          }
        } catch (error) {
          formatAppLog("warn", "at pages/task/category-detail/category-detail.vue:375", "从缓存刷新任务列表失败:", error);
        }
      },
      // 跳转到任务详情页面
      goToTaskDetail(task) {
        const tagsParam = task.tags ? encodeURIComponent(JSON.stringify(task.tags)) : "";
        uni.navigateTo({
          url: `/pages/task/task-detail/task-detail?taskId=${task._id}&taskName=${encodeURIComponent(task.taskName)}&taskNo=${encodeURIComponent(task.taskNo)}&tags=${tagsParam}&categoryId=${this.categoryId}`
        });
      },
      // 获取网络状态
      async getNetworkType() {
        return new Promise((resolve) => {
          uni.getNetworkType({
            success: (res2) => {
              resolve(res2.networkType);
            },
            fail: () => {
              resolve("unknown");
            }
          });
        });
      },
      // 从缓存中获取任务的完整标签数据
      getTaskTagsFromCache(taskId) {
        try {
          const cachedData = uni.getStorageSync(this.cacheKey);
          if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
            const task = cachedData.tasks.find((t2) => t2._id === taskId);
            if (task && task.tags) {
              return task.tags.map((tag) => ({
                _id: tag._id || "",
                name: tag.name || "",
                type: tag.type || "text",
                description: tag.description || "",
                value: tag.value !== void 0 ? tag.value : tag.defaultValue || "",
                localImagePath: tag.localImagePath || ""
              }));
            }
          }
          return null;
        } catch (error) {
          formatAppLog("error", "at pages/task/category-detail/category-detail.vue:422", "从缓存获取任务标签失败:", error);
          return null;
        }
      },
      // 从缓存中获取任务的 deviceSnList
      getTaskDeviceSnListFromCache(taskId) {
        try {
          const cachedData = uni.getStorageSync(this.cacheKey);
          if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
            const task = cachedData.tasks.find((t2) => t2._id === taskId);
            if (task && Array.isArray(task.deviceSnList)) {
              return task.deviceSnList.map((d2) => ({
                deviceId: d2 && d2.deviceId !== void 0 ? d2.deviceId : "",
                deviceSn: d2 && d2.deviceSn !== void 0 ? d2.deviceSn : ""
              }));
            }
          }
          return [];
        } catch (error) {
          formatAppLog("error", "at pages/task/category-detail/category-detail.vue:442", "从缓存获取任务 deviceSnList 失败:", error);
          return [];
        }
      },
      // 上传图片
      async uploadImageIfNeeded(tags) {
        const imageTagsNeedingUpload = tags.filter(
          (tag) => tag.type === "image" && tag.localImagePath && !tag.value
        );
        if (imageTagsNeedingUpload.length > 0) {
          const networkType = await this.getNetworkType();
          if (networkType === "none") {
            throw new Error("当前无网络，无法上传图片，请联网后再提交");
          }
          for (const imgTag of imageTagsNeedingUpload) {
            try {
              const uploadResult = await apiService.uploadImage(imgTag.localImagePath);
              if (!uploadResult || !uploadResult.url) {
                throw new Error("上传成功但未返回图片地址");
              }
              imgTag.value = uploadResult.url;
              imgTag.localImagePath = "";
            } catch (e2) {
              formatAppLog("error", "at pages/task/category-detail/category-detail.vue:470", "上传图片失败:", e2);
              throw new Error(`图片上传失败: ${e2.message || "未知错误"}`);
            }
          }
        }
      },
      // 排序location类型的值
      sortLocationValues(values) {
        if (!Array.isArray(values)) {
          return values;
        }
        return [...values].sort((a2, b2) => {
          const regex = /^([A-Za-z]*)(\d*)$/;
          const matchA = a2.match(regex);
          const matchB = b2.match(regex);
          if (matchA && matchB) {
            const prefixA = matchA[1] || "";
            const prefixB = matchB[1] || "";
            const numA = matchA[2] ? parseInt(matchA[2], 10) : 0;
            const numB = matchB[2] ? parseInt(matchB[2], 10) : 0;
            if (prefixA !== prefixB) {
              return prefixA.localeCompare(prefixB);
            }
            return numA - numB;
          }
          return a2.localeCompare(b2);
        });
      },
      // 格式化标签数据为API需要的格式
      formatTagsForAPI(tags) {
        return tags.map((tag) => {
          let processedValue = tag.value;
          if (tag.type === "location") {
            if (typeof processedValue === "string") {
              const values = processedValue.split(",").filter((item) => item.trim() !== "");
              processedValue = this.sortLocationValues(values);
            } else if (Array.isArray(processedValue)) {
              processedValue = this.sortLocationValues(processedValue);
            }
          }
          return {
            _id: tag._id,
            name: tag.name,
            type: tag.type,
            description: tag.description,
            value: processedValue
          };
        });
      },
      // 更新任务缓存状态
      updateTaskCacheAfterSubmit(taskId, tagsToSend) {
        try {
          const cachedData = uni.getStorageSync(this.cacheKey);
          if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
            const updatedTasks = cachedData.tasks.map((task) => {
              if (task._id === taskId) {
                return {
                  ...task,
                  tags: tagsToSend,
                  hasUnsavedTags: false
                };
              }
              return task;
            });
            uni.setStorageSync(this.cacheKey, {
              ...cachedData,
              tasks: updatedTasks
            });
            this.tasks = this.sortTasks(updatedTasks.map((task) => ({ ...task })));
          }
        } catch (error) {
          formatAppLog("error", "at pages/task/category-detail/category-detail.vue:556", "更新任务缓存失败:", error);
        }
      },
      // 提交所有未提交的任务
      async submitAllUnsavedTasks() {
        const unsavedTasks = this.tasks.filter((task) => task.hasUnsavedTags);
        if (unsavedTasks.length === 0) {
          uni.showToast({
            title: "没有未提交的任务",
            icon: "none"
          });
          return;
        }
        const confirmResult = await new Promise((resolve) => {
          uni.showModal({
            title: "确认提交",
            content: `确定要提交 ${unsavedTasks.length} 个未提交的任务吗？`,
            confirmText: "确定",
            cancelText: "取消",
            success: (res2) => {
              resolve(res2.confirm);
            },
            fail: () => {
              resolve(false);
            }
          });
        });
        if (!confirmResult) {
          return;
        }
        this.isSubmitting = true;
        this.totalSubmitCount = unsavedTasks.length;
        this.currentSubmitIndex = 0;
        let successCount = 0;
        let failCount = 0;
        const errors = [];
        try {
          for (let i2 = 0; i2 < unsavedTasks.length; i2++) {
            const task = unsavedTasks[i2];
            this.currentSubmitIndex = i2;
            this.currentSubmitTaskName = task.taskName || task.taskNo || "未知任务";
            try {
              const tags = this.getTaskTagsFromCache(task._id);
              if (!tags || tags.length === 0) {
                formatAppLog("warn", "at pages/task/category-detail/category-detail.vue:613", `任务 ${task.taskName} 没有标签数据，跳过`);
                continue;
              }
              await this.uploadImageIfNeeded(tags);
              const tagsToSend = this.formatTagsForAPI(tags);
              const deviceSnList = this.getTaskDeviceSnListFromCache(task._id);
              await apiService.updateTaskTags(task._id, tagsToSend, deviceSnList);
              this.updateTaskCacheAfterSubmit(task._id, tagsToSend);
              successCount++;
            } catch (error) {
              formatAppLog("error", "at pages/task/category-detail/category-detail.vue:634", `提交任务 ${task.taskName} 失败:`, error);
              failCount++;
              errors.push({
                taskName: task.taskName || task.taskNo,
                error: error.message || "未知错误"
              });
            }
          }
          this.isSubmitting = false;
          if (failCount === 0) {
            uni.showToast({
              title: `全部提交成功 (${successCount})`,
              icon: "success",
              duration: 2e3
            });
          } else {
            const errorMsg = errors.map((e2) => `${e2.taskName}: ${e2.error}`).join("\n");
            uni.showModal({
              title: "提交完成",
              content: `成功: ${successCount} 个
失败: ${failCount} 个

失败详情:
${errorMsg}`,
              showCancel: false,
              confirmText: "确定"
            });
          }
          this.refreshTasksFromCache();
        } catch (error) {
          this.isSubmitting = false;
          uni.showToast({
            title: "提交过程出错: " + (error.message || "未知错误"),
            icon: "none",
            duration: 3e3
          });
        }
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "task-container" }, [
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode(
          "text",
          { class: "page-title" },
          vue.toDisplayString($data.categoryName),
          1
          /* TEXT */
        ),
        $data.templateName ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 0,
            class: "template-name"
          },
          vue.toDisplayString($data.templateName),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("scroll-view", {
        class: vue.normalizeClass(["task-list", { "task-list-with-footer": $options.hasUnsavedTasks }]),
        "scroll-y": "true",
        "scroll-top": $data.scrollTop,
        onScroll: _cache[0] || (_cache[0] = (...args) => $options.onScroll && $options.onScroll(...args)),
        "enable-back-to-top": true,
        "refresher-enabled": "true",
        "refresher-triggered": $data.refresherTriggered,
        onRefresherrefresh: _cache[1] || (_cache[1] = (...args) => $options.onRefresherRefresh && $options.onRefresherRefresh(...args))
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.tasks, (task, index2) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: task._id,
              class: vue.normalizeClass(["task-item", { "task-item-unsaved": task.hasUnsavedTags }]),
              onClick: ($event) => $options.goToTaskDetail(task)
            }, [
              vue.createElementVNode("view", { class: "task-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "task-name" },
                  vue.toDisplayString(task.taskName),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "task-no" },
                  vue.toDisplayString(task.taskNo),
                  1
                  /* TEXT */
                )
              ])
            ], 10, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $data.tasks.length === 0 && !$data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { class: "empty-text" }, "该分类下暂无任务")
        ])) : vue.createCommentVNode("v-if", true)
      ], 42, ["scroll-top", "refresher-triggered"]),
      $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading"
      }, [
        vue.createElementVNode("text", null, "加载中...")
      ])) : vue.createCommentVNode("v-if", true),
      $options.hasUnsavedTasks ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "submit-footer"
      }, [
        $data.isSubmitting ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "progress-container"
        }, [
          vue.createElementVNode("view", { class: "progress-info" }, [
            vue.createElementVNode(
              "text",
              { class: "progress-text" },
              "正在提交: " + vue.toDisplayString($data.currentSubmitIndex + 1) + " / " + vue.toDisplayString($data.totalSubmitCount),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "progress-percent" },
              vue.toDisplayString($options.progressPercent) + "%",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "progress-bar" }, [
            vue.createElementVNode(
              "view",
              {
                class: "progress-bar-fill",
                style: vue.normalizeStyle({ width: $options.progressPercent + "%" })
              },
              null,
              4
              /* STYLE */
            )
          ]),
          vue.createElementVNode(
            "text",
            { class: "progress-task-name" },
            vue.toDisplayString($data.currentSubmitTaskName),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "submit-button-container" }, [
          vue.createElementVNode("button", {
            class: "submit-button",
            disabled: $data.isSubmitting,
            onClick: _cache[2] || (_cache[2] = (...args) => $options.submitAllUnsavedTasks && $options.submitAllUnsavedTasks(...args))
          }, vue.toDisplayString($data.isSubmitting ? "提交中..." : `全部提交 (${$options.unsavedTasksCount})`), 9, ["disabled"])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesTaskCategoryDetailCategoryDetail = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-f24d58d2"], ["__file", "C:/Users/Administrator/Project/ColdVerifReport/coldverifreport_app2/pages/task/category-detail/category-detail.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {
        userInfo: {},
        serverUrl: ""
      };
    },
    computed: {
      // 用户姓名首字母
      userInitials() {
        if (this.userInfo.username) {
          return this.userInfo.username.charAt(0).toUpperCase();
        }
        return "U";
      }
    },
    onLoad() {
      this.loadUserData();
    },
    methods: {
      // 加载用户数据
      loadUserData() {
        this.userInfo = storageManager.getUserInfo() || {};
        this.serverUrl = storageManager.getServerUrl() || "未设置";
      },
      // 清除缓存
      clearCache() {
        uni.showModal({
          title: "确认清除缓存",
          content: "此操作将清除所有本地缓存数据，但不会影响登录状态",
          success: (res2) => {
            if (res2.confirm) {
              try {
                uni.showToast({
                  title: "缓存清除成功",
                  icon: "success"
                });
              } catch (error) {
                uni.showToast({
                  title: "清除缓存失败",
                  icon: "none"
                });
              }
            }
          }
        });
      },
      // 关于应用
      aboutApp() {
        uni.showModal({
          title: "关于冷链验证系统",
          content: "版本: 1.0.0\n这是一个专业的冷链验证实施过程记录应用，帮助用户高效管理冷链验证任务。",
          showCancel: false
        });
      },
      // 退出登录
      logout() {
        uni.showModal({
          title: "确认退出",
          content: "确定要退出登录吗？",
          success: (res2) => {
            if (res2.confirm) {
              storageManager.clearAuthData();
              uni.showToast({
                title: "已退出登录",
                icon: "success"
              });
              setTimeout(() => {
                uni.redirectTo({
                  url: "/pages/login/login"
                });
              }, 1e3);
            }
          }
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "profile-container" }, [
      vue.createElementVNode("view", { class: "user-card" }, [
        vue.createElementVNode("view", { class: "avatar" }, [
          vue.createElementVNode(
            "text",
            { class: "avatar-text" },
            vue.toDisplayString($options.userInitials),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode(
            "text",
            { class: "username" },
            vue.toDisplayString($data.userInfo.username),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "user-id" },
            "用户ID: " + vue.toDisplayString($data.userInfo.id),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "info-section" }, [
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "info-label" }, "服务器地址"),
          vue.createElementVNode(
            "text",
            { class: "info-value" },
            vue.toDisplayString($data.serverUrl),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "info-label" }, "登录状态"),
          vue.createElementVNode("text", { class: "info-value online" }, "在线")
        ])
      ]),
      vue.createElementVNode("view", { class: "menu-section" }, [
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.clearCache && $options.clearCache(...args))
        }, [
          vue.createElementVNode("view", { class: "menu-left" }, [
            vue.createElementVNode("text", { class: "menu-icon" }, "🗑️"),
            vue.createElementVNode("text", { class: "menu-text" }, "清除缓存")
          ]),
          vue.createElementVNode("text", { class: "menu-arrow" }, "▶")
        ]),
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.aboutApp && $options.aboutApp(...args))
        }, [
          vue.createElementVNode("view", { class: "menu-left" }, [
            vue.createElementVNode("text", { class: "menu-icon" }, "ℹ️"),
            vue.createElementVNode("text", { class: "menu-text" }, "关于应用")
          ]),
          vue.createElementVNode("text", { class: "menu-arrow" }, "▶")
        ])
      ]),
      vue.createElementVNode("view", { class: "logout-section" }, [
        vue.createElementVNode("button", {
          class: "logout-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.logout && $options.logout(...args))
        }, "退出登录")
      ]),
      vue.createElementVNode("view", { class: "version-info" }, [
        vue.createElementVNode("text", { class: "version-text" }, "冷链验证系统 v1.0.0")
      ])
    ]);
  }
  const PagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-dd383ca2"], ["__file", "C:/Users/Administrator/Project/ColdVerifReport/coldverifreport_app2/pages/profile/profile.vue"]]);
  const _sfc_main$2 = {
    // H5 下路由可能会把 query/params 作为 attrs 传进来，这里关闭自动透传以避免 warning
    inheritAttrs: false,
    data() {
      return {
        taskId: "",
        taskInfo: {
          _id: "",
          taskNo: "",
          taskName: "",
          templateName: "",
          tags: [],
          // 是否存在“已修改但未提交”的标签
          hasUnsavedTags: false
        },
        formattedTags: [],
        // Tab
        activeTab: "tags",
        // 'tags' | 'devices'
        // deviceSnList（本地可编辑，写入缓存并随保存提交）
        deviceSnList: [],
        // 初始标签数据快照，用于判断是否有改动
        originalTagsSnapshot: [],
        // 初始设备列表快照，用于判断是否有改动
        originalDeviceSnapshot: [],
        currentScrollTop: 0,
        currentEditingIndex: -1,
        showLocationModal: false,
        locationInputValue: "",
        autoSaveTimer: null,
        categoryId: "",
        hasLoadedFromCache: false,
        lastCacheTimestamp: null,
        // 日期滚轮选择相关
        showDateWheel: false,
        dateWheelTargetIndex: -1,
        dateWheelTargetType: "",
        // 'date' 或 'datetime'
        dateWheelYears: [],
        dateWheelMonths: [],
        dateWheelDays: [],
        dateWheelValue: [0, 0, 0],
        dateWheelIndicatorStyle: "height: 50px;",
        // 时间滚轮选择相关
        showTimeWheel: false,
        timeWheelTargetIndex: -1,
        // 仅针对 datetime
        timeWheelHours: [],
        timeWheelMinutes: [],
        timeWheelValue: [0, 0],
        timeWheelIndicatorStyle: "height: 50px;"
      };
    },
    computed: {
      // 格式化location类型的显示值
      formattedLocationValue() {
        return (value) => {
          if (typeof value === "string") {
            return value;
          } else if (Array.isArray(value)) {
            return value.join(",");
          }
          return value;
        };
      },
      // 是否有标签发生改动
      hasTagChanges() {
        if (!Array.isArray(this.formattedTags) || this.formattedTags.length === 0) {
          return false;
        }
        if (!Array.isArray(this.originalTagsSnapshot) || this.originalTagsSnapshot.length === 0) {
          return true;
        }
        const currentSnapshot = this.formattedTags.map((tag) => ({
          _id: tag._id,
          value: tag.value
        }));
        try {
          return JSON.stringify(currentSnapshot) !== JSON.stringify(this.originalTagsSnapshot);
        } catch (e2) {
          formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:476", "比较标签快照失败:", e2);
          return true;
        }
      },
      // 是否有设备列表发生改动
      hasDeviceChanges() {
        const currentSnapshot = (this.deviceSnList || []).map((d2) => ({
          deviceId: d2 && d2.deviceId ? String(d2.deviceId) : "",
          deviceSn: d2 && d2.deviceSn ? String(d2.deviceSn) : ""
        }));
        try {
          return JSON.stringify(currentSnapshot) !== JSON.stringify(this.originalDeviceSnapshot || []);
        } catch (e2) {
          formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:489", "比较设备快照失败:", e2);
          return true;
        }
      },
      // 展示用：按 deviceId 自动排序（字母+数字混排），并附加稳定 key
      sortedDeviceSnList() {
        const list = Array.isArray(this.deviceSnList) ? this.deviceSnList : [];
        const withKey = list.map((d2, idx) => ({
          __key: d2 && d2.__key ? d2.__key : `dev_${idx}`,
          deviceId: d2 && d2.deviceId !== void 0 ? d2.deviceId : "",
          deviceSn: d2 && d2.deviceSn !== void 0 ? d2.deviceSn : ""
        }));
        return this.sortDeviceSnList(withKey);
      },
      // 保存按钮是否应禁用：
      // 1) 无标签：禁用
      // 2) 有标签且本地缓存标记有未提交改动：允许点击（即便当前会话内没再改）
      // 3) 其他情况依赖 hasTagChanges（与初始快照对比）
      isSaveDisabled() {
        if (!Array.isArray(this.formattedTags) || this.formattedTags.length === 0) {
          return true;
        }
        if (this.taskInfo && this.taskInfo.hasUnsavedTags) {
          return false;
        }
        return !(this.hasTagChanges || this.hasDeviceChanges);
      }
    },
    onLoad(options) {
      formatAppLog("log", "at pages/task/task-detail/task-detail.vue:521", "任务详情页面加载中...", options);
      this.taskId = options.taskId;
      this.taskInfo = {
        _id: options.taskId || "",
        taskNo: decodeURIComponent(options.taskNo || ""),
        taskName: decodeURIComponent(options.taskName || ""),
        templateName: "温度验证模板",
        tags: []
      };
      if (options.categoryId) {
        this.categoryId = options.categoryId;
      }
      let hasParameterTags = false;
      let parameterTagsData = null;
      if (options.tags) {
        try {
          parameterTagsData = JSON.parse(decodeURIComponent(options.tags));
          hasParameterTags = true;
          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:548", "从参数接收到tags数据:", parameterTagsData);
        } catch (e2) {
          formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:550", "解析tags参数失败:", e2);
        }
      }
      if (hasParameterTags) {
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:556", "检测到参数tags，使用参数数据覆盖缓存");
        this.processTagsData(parameterTagsData);
        this.hasLoadedFromCache = false;
      } else {
        if (!this.checkCategoryTasksCache()) {
          this.useCachedOrLoadFromAPI();
        }
      }
      formatAppLog("log", "at pages/task/task-detail/task-detail.vue:569", "任务详情页面加载完成", this.taskInfo, this.formattedTags);
      this.$nextTick(() => {
        setTimeout(() => {
          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:574", "页面加载完成延迟检查:", {
            taskInfo: this.taskInfo,
            formattedTags: this.formattedTags,
            tagCount: this.formattedTags ? this.formattedTags.length : 0
          });
        }, 500);
      });
    },
    onReady() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.restoreScrollPosition();
        }, 100);
      });
    },
    onShow() {
      this.checkCategoryTasksCache();
      this.$nextTick(() => {
        setTimeout(() => {
          this.restoreScrollPosition();
        }, 100);
      });
    },
    onPullDownRefresh() {
      uni.showModal({
        title: "更新数据",
        content: "是否从服务器获取最新数据？",
        confirmText: "更新",
        cancelText: "取消",
        success: (res2) => {
          if (res2.confirm) {
            this.hasLoadedFromCache = false;
            this.loadTaskFromAPI(true).finally(() => {
              uni.stopPullDownRefresh();
            });
          } else {
            uni.stopPullDownRefresh();
          }
        },
        fail: () => {
          uni.stopPullDownRefresh();
        }
      });
    },
    onPageScroll(e2) {
      this.currentScrollTop = e2.scrollTop || 0;
    },
    onHide() {
      this.saveScrollPosition();
    },
    onUnload() {
      this.saveScrollPosition();
    },
    methods: {
      // 设备列表排序：支持字母+数字混排（例如 A2 < A10）
      sortDeviceSnList(list) {
        if (!Array.isArray(list))
          return [];
        return [...list].sort((a2, b2) => {
          const aValue = a2 && a2.deviceId !== void 0 ? String(a2.deviceId).trim() : "";
          const bValue = b2 && b2.deviceId !== void 0 ? String(b2.deviceId).trim() : "";
          if (aValue === "" && bValue !== "")
            return 1;
          if (aValue !== "" && bValue === "")
            return -1;
          if (aValue === "" && bValue === "")
            return 0;
          return aValue.localeCompare(bValue, "zh-CN", { numeric: true, sensitivity: "base" });
        });
      },
      // 更新设备快照
      updateOriginalDeviceSnapshot() {
        const current = (this.deviceSnList || []).map((d2) => ({
          deviceId: d2 && d2.deviceId !== void 0 ? String(d2.deviceId) : "",
          deviceSn: d2 && d2.deviceSn !== void 0 ? String(d2.deviceSn) : ""
        }));
        this.originalDeviceSnapshot = current;
      },
      // 从缓存任务对象加载 deviceSnList
      loadDeviceSnListFromTask(task) {
        const raw = task && Array.isArray(task.deviceSnList) ? task.deviceSnList : [];
        this.deviceSnList = raw.map((d2, idx) => ({
          __key: `dev_${idx}`,
          deviceId: d2 && d2.deviceId !== void 0 ? d2.deviceId : "",
          deviceSn: d2 && d2.deviceSn !== void 0 ? d2.deviceSn : ""
        }));
        this.updateOriginalDeviceSnapshot();
      },
      // 生成下一个递增的deviceId
      generateNextDeviceId() {
        const list = this.deviceSnList || [];
        const nonEmptyDeviceIds = list.map((d2) => d2 && d2.deviceId ? String(d2.deviceId).trim() : "").filter((id) => id !== "");
        if (nonEmptyDeviceIds.length === 0) {
          return "001";
        }
        const parsed = nonEmptyDeviceIds.map((id) => {
          const match = id.match(/^([A-Za-z]*)(\d+)$/);
          if (match) {
            return {
              prefix: match[1] || "",
              number: parseInt(match[2], 10),
              original: id,
              padding: match[2].length
              // 保持前导零的长度
            };
          }
          const numMatch = id.match(/^(\d+)$/);
          if (numMatch) {
            return {
              prefix: "",
              number: parseInt(numMatch[1], 10),
              original: id,
              padding: numMatch[1].length
            };
          }
          return null;
        }).filter((p2) => p2 !== null);
        if (parsed.length === 0) {
          return "001";
        }
        const prefixGroups = {};
        parsed.forEach((p2) => {
          const key = p2.prefix;
          if (!prefixGroups[key]) {
            prefixGroups[key] = [];
          }
          prefixGroups[key].push(p2);
        });
        let maxCount = 0;
        let mostCommonPrefix = "";
        Object.keys(prefixGroups).forEach((prefix) => {
          if (prefixGroups[prefix].length > maxCount) {
            maxCount = prefixGroups[prefix].length;
            mostCommonPrefix = prefix;
          }
        });
        const targetGroup = prefixGroups[mostCommonPrefix] || parsed;
        const maxItem = targetGroup.reduce((max, current) => {
          return current.number > max.number ? current : max;
        });
        const nextNumber = maxItem.number + 1;
        const padding = Math.max(maxItem.padding, 3);
        const nextNumberStr = String(nextNumber).padStart(padding, "0");
        return `${maxItem.prefix}${nextNumberStr}`;
      },
      addDevice() {
        const nextDeviceId = this.generateNextDeviceId();
        const newItem = {
          __key: `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          deviceId: nextDeviceId,
          deviceSn: ""
        };
        this.deviceSnList = [...this.deviceSnList || [], newItem];
        this.updateCacheData();
      },
      removeDevice(key) {
        this.deviceSnList = (this.deviceSnList || []).filter((d2) => d2.__key !== key);
        this.updateCacheData();
      },
      onDeviceFieldInput(key, field, value) {
        const safeValue = value !== void 0 && value !== null ? value : "";
        const list = (this.deviceSnList || []).map((d2) => {
          if (d2.__key === key) {
            return { ...d2, [field]: safeValue };
          }
          return d2;
        });
        this.deviceSnList = list;
        this.updateCacheData();
      },
      // 获取当前网络类型（Promise 封装）
      getNetworkType() {
        return new Promise((resolve) => {
          if (!uni || !uni.getNetworkType) {
            resolve("unknown");
            return;
          }
          uni.getNetworkType({
            success: (res2) => {
              resolve(res2.networkType || "unknown");
            },
            fail: () => {
              resolve("unknown");
            }
          });
        });
      },
      // 将临时图片路径复制/移动到长期可用的持久目录（APP 端）
      ensurePersistentImage(filePath) {
        return new Promise((resolve) => {
          if (!filePath) {
            resolve(filePath);
            return;
          }
          try {
            plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
              const fileName = Date.now() + "_" + (entry.name || "image.jpg");
              plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs2) => {
                fs2.root.getDirectory("taskImages", { create: true }, (dir) => {
                  entry.copyTo(
                    dir,
                    fileName,
                    (newEntry) => {
                      const localUrl = newEntry.toLocalURL();
                      resolve(localUrl || filePath);
                    },
                    (err) => {
                      formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:823", "复制图片到持久目录失败:", err);
                      resolve(filePath);
                    }
                  );
                }, (e2) => {
                  formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:828", "获取 taskImages 目录失败:", e2);
                  resolve(filePath);
                });
              }, (e2) => {
                formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:832", "请求文件系统失败:", e2);
                resolve(filePath);
              });
            }, (e2) => {
              formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:836", "解析本地文件路径失败:", e2);
              resolve(filePath);
            });
          } catch (e2) {
            formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:840", "ensurePersistentImage 异常:", e2);
            resolve(filePath);
          }
        });
      },
      // 本地图片缓存 key
      getImageCacheKey() {
        if (!this.taskId) {
          return "";
        }
        return `task_image_cache_${this.taskId}`;
      },
      // 将某个标签的本地图片路径写入缓存
      saveLocalImageForTag(tagId, localPath) {
        try {
          const cacheKey = this.getImageCacheKey();
          if (!cacheKey)
            return;
          const cache = uni.getStorageSync(cacheKey) || {};
          if (localPath) {
            cache[tagId] = localPath;
          } else {
            delete cache[tagId];
          }
          uni.setStorageSync(cacheKey, cache);
        } catch (e2) {
          formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:872", "保存本地图片缓存失败:", e2);
        }
      },
      // 从缓存中移除某个标签的本地图片记录
      removeLocalImageForTag(tagId) {
        try {
          const cacheKey = this.getImageCacheKey();
          if (!cacheKey)
            return;
          const cache = uni.getStorageSync(cacheKey) || {};
          if (cache[tagId]) {
            delete cache[tagId];
            if (Object.keys(cache).length > 0) {
              uni.setStorageSync(cacheKey, cache);
            } else {
              uni.removeStorageSync(cacheKey);
            }
          }
        } catch (e2) {
          formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:892", "移除本地图片缓存失败:", e2);
        }
      },
      // 将本地缓存的图片路径应用到当前 formattedTags
      applyLocalImageCache() {
        try {
          const cacheKey = this.getImageCacheKey();
          if (!cacheKey || !this.formattedTags || this.formattedTags.length === 0)
            return;
          const cache = uni.getStorageSync(cacheKey) || {};
          if (!cache || typeof cache !== "object")
            return;
          this.formattedTags.forEach((tag, index2) => {
            if (tag.type === "image" && !tag.value && cache[tag._id]) {
              this.$set(this.formattedTags[index2], "localImagePath", cache[tag._id]);
            }
          });
        } catch (e2) {
          formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:911", "应用本地图片缓存失败:", e2);
        }
      },
      // 更新初始标签快照
      updateOriginalTagsSnapshot() {
        if (!Array.isArray(this.formattedTags) || this.formattedTags.length === 0) {
          this.originalTagsSnapshot = [];
          return;
        }
        this.originalTagsSnapshot = this.formattedTags.map((tag) => ({
          _id: tag._id,
          value: tag.value
        }));
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:924", "原始标签快照已更新:", this.originalTagsSnapshot);
      },
      // 处理从参数传入的tags数据
      processTagsData(tagsData) {
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:928", "处理传入的tags数据:", tagsData);
        if (!Array.isArray(tagsData) || tagsData.length === 0) {
          formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:931", "tagsData 不是有效数组或为空");
          this.formattedTags = [];
          return;
        }
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:937", "开始格式化标签数据，共", tagsData.length, "个标签");
        this.formattedTags = tagsData.map((tag, index2) => {
          let processedValue = tag.value !== void 0 && tag.value !== null ? tag.value : tag.defaultValue !== void 0 && tag.defaultValue !== null ? tag.defaultValue : "";
          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:944", "处理标签", index2, ":", tag.name, {
            "原始value": tag.value,
            "defaultValue": tag.defaultValue,
            "处理后value": processedValue,
            "value类型": typeof processedValue
          });
          if (tag.type === "location" && Array.isArray(processedValue)) {
            const sortedArray = this.sortLocationValues(processedValue);
            processedValue = sortedArray.join(",");
            formatAppLog("log", "at pages/task/task-detail/task-detail.vue:956", "location类型标签排序结果:", sortedArray, "->", processedValue);
          }
          if (tag.type === "image") {
            processedValue = processedValue || "";
          }
          if (processedValue === void 0 || processedValue === null) {
            processedValue = "";
          }
          const result = {
            _id: tag._id || `tag${index2}`,
            name: tag.name || tag.label || `标签${index2 + 1}`,
            type: tag.type || "text",
            description: tag.description || tag.desc || "标签描述",
            value: processedValue,
            defaultValue: tag.defaultValue !== void 0 ? tag.defaultValue : ""
          };
          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:979", "标签格式化结果:", result);
          return result;
        });
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:982", "格式化完成，formattedTags:", this.formattedTags);
        this.applyLocalImageCache();
        this.taskInfo = {
          ...this.taskInfo,
          _id: this.taskId || this.taskInfo._id || "",
          tags: tagsData
        };
        this.updateOriginalTagsSnapshot();
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:997", "格式化后的标签数据:", this.formattedTags);
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:998", "更新后的taskInfo:", this.taskInfo);
      },
      // 从API加载任务详情
      async loadTaskFromAPI(force = false) {
        if (!force && this.hasLoadedFromCache) {
          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1005", "已从缓存加载数据，跳过API加载");
          return;
        }
        try {
          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1010", "开始从API加载任务详情...");
          const taskDetail = await apiService.getTaskDetail(this.taskId);
          if (taskDetail) {
            formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1014", "获取到任务详情:", taskDetail);
            this.taskInfo = {
              _id: taskDetail._id || this.taskInfo._id,
              taskNo: taskDetail.taskNo || this.taskInfo.taskNo || "",
              taskName: taskDetail.taskName || this.taskInfo.taskName || "",
              templateName: taskDetail.templateName || this.taskInfo.templateName || "未知模板",
              tags: taskDetail.tags || [],
              hasUnsavedTags: false
            };
            if (taskDetail.tags && taskDetail.tags.length > 0) {
              const tempTaskInfo = {
                taskNo: this.taskInfo.taskNo,
                taskName: this.taskInfo.taskName,
                templateName: this.taskInfo.templateName
              };
              this.processTagsData(taskDetail.tags);
              this.taskInfo.taskNo = tempTaskInfo.taskNo;
              this.taskInfo.taskName = tempTaskInfo.taskName;
              this.taskInfo.templateName = tempTaskInfo.templateName;
            } else {
              this.initializeDefaultData();
            }
          } else {
            formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:1044", "未获取到任务详情，使用默认数据");
            this.initializeDefaultData();
          }
        } catch (error) {
          formatAppLog("error", "at pages/task/task-detail/task-detail.vue:1048", "加载任务详情失败:", error);
          uni.showToast({
            title: "加载任务详情失败: " + error.message,
            icon: "none"
          });
          this.initializeDefaultData();
        }
      },
      // 尝试使用缓存或从API加载数据
      useCachedOrLoadFromAPI() {
        if (!this.checkCategoryTasksCache()) {
          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1063", "没有可用缓存，从API加载数据");
          this.loadTaskFromAPI();
        }
      },
      // 初始化默认数据
      initializeDefaultData() {
        if (this.hasLoadedFromCache) {
          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1072", "已从缓存加载数据，跳过默认数据初始化");
          return;
        }
        this.taskInfo = {
          _id: this.taskId || this.taskInfo._id || "",
          taskNo: this.taskInfo.taskNo || "",
          taskName: this.taskInfo.taskName || "",
          templateName: this.taskInfo.templateName || "温度验证模板",
          tags: [],
          hasUnsavedTags: false
        };
        this.formattedTags = [
          {
            _id: "tag1",
            name: "温度记录",
            type: "number",
            description: "记录当前环境温度",
            value: "25.5"
          },
          {
            _id: "tag2",
            name: "湿度记录",
            type: "number",
            description: "记录当前环境湿度",
            value: "65.0"
          },
          {
            _id: "tag3",
            name: "测量时间",
            type: "datetime",
            description: "数据采集时间",
            value: "2024-01-15 14:30"
          },
          {
            _id: "tag4",
            name: "布点位置",
            type: "location",
            description: "传感器布点区域编号",
            value: "001,002,003"
          },
          {
            _id: "tag5",
            name: "是否合格",
            type: "boolean",
            description: "当前测量值是否符合标准",
            value: true
          },
          {
            _id: "tag6",
            name: "备注信息",
            type: "text",
            description: "任务备注信息",
            value: "初始记录"
          }
        ];
        this.updateOriginalTagsSnapshot();
      },
      getTagTypeName(type) {
        const typeMap = {
          "text": "文本",
          "number": "数字",
          "date": "日期",
          "datetime": "时间",
          "location": "布点区域",
          "boolean": "布尔",
          "image": "图片"
        };
        return typeMap[type] || type;
      },
      // 安全地处理location类型的值
      processLocationValue(value) {
        if (Array.isArray(value)) {
          return value.join(",");
        } else if (typeof value === "string") {
          return value;
        } else {
          return String(value);
        }
      },
      // 获取location数组
      getLocationArray(value) {
        if (Array.isArray(value)) {
          return value;
        } else if (typeof value === "string") {
          return value.split(",").filter((item) => item.trim() !== "");
        } else {
          return [];
        }
      },
      // 获取用于显示的location值
      getLocationDisplayValue(value) {
        if (Array.isArray(value)) {
          return value.join(",");
        } else {
          return value || "";
        }
      },
      // 更新location值
      updateLocationValue(index2, inputValue) {
        if (this.formattedTags[index2]) {
          this.formattedTags[index2].value = inputValue;
        }
      },
      // 解析输入，支持单个ID和范围
      parseLocationInput(input) {
        var _a;
        const trimmed = input.trim();
        if (!trimmed)
          return [];
        const rangePattern1 = /^([A-Za-z]*)(\d+)\s*到\s*([A-Za-z]*)(\d+)$/i;
        const match1 = trimmed.match(rangePattern1);
        if (match1) {
          const [, prefix1, startNumStr, prefix2, endNumStr] = match1;
          const prefix = prefix1 || prefix2 || "";
          const start = parseInt(startNumStr, 10);
          const end = parseInt(endNumStr, 10);
          if (start <= end && start > 0 && end > 0) {
            const padding = Math.max(startNumStr.length, endNumStr.length);
            return this.generateRange(prefix, start, end, padding);
          }
        }
        const rangePattern2 = /^([A-Za-z]*)(\d+)\s*-\s*([A-Za-z]*)(\d+)$/i;
        const match2 = trimmed.match(rangePattern2);
        if (match2) {
          const [, prefix1, startNumStr, prefix2, endNumStr] = match2;
          const prefix = prefix1 || prefix2 || "";
          const start = parseInt(startNumStr, 10);
          const end = parseInt(endNumStr, 10);
          if (start <= end && start > 0 && end > 0) {
            const padding = Math.max(startNumStr.length, endNumStr.length);
            return this.generateRange(prefix, start, end, padding);
          }
        }
        const rangePattern3 = /^(\d+)\s*~\s*(\d+)$/;
        const match3 = trimmed.match(rangePattern3);
        if (match3) {
          const [, startNumStr, endNumStr] = match3;
          const start = parseInt(startNumStr, 10);
          const end = parseInt(endNumStr, 10);
          if (start <= end && start > 0 && end > 0) {
            let prefix = "";
            const currentValue = this.getLocationArray((_a = this.formattedTags[this.currentEditingIndex]) == null ? void 0 : _a.value);
            if (currentValue.length > 0) {
              const lastValue = currentValue[currentValue.length - 1];
              const prefixMatch = lastValue.match(/^([A-Za-z]+)/);
              if (prefixMatch) {
                prefix = prefixMatch[1];
              }
            }
            const padding = Math.max(startNumStr.length, endNumStr.length);
            return this.generateRange(prefix, start, end, padding);
          }
        }
        return [trimmed];
      },
      // 生成范围数组
      generateRange(prefix, start, end, padding) {
        const result = [];
        for (let i2 = start; i2 <= end; i2++) {
          const numStr = i2.toString().padStart(padding, "0");
          result.push(`${prefix}${numStr}`);
        }
        return result;
      },
      // 显示添加布点弹窗
      showAddLocationModal(index2) {
        this.currentEditingIndex = index2;
        this.locationInputValue = "";
        this.showLocationModal = true;
      },
      // 隐藏添加布点弹窗
      hideLocationModal() {
        this.showLocationModal = false;
        this.locationInputValue = "";
      },
      // 智能排序布点值：按照字符和数字的组合进行排序
      sortLocationValues(values) {
        return values.sort((a2, b2) => {
          const regex = /^([A-Za-z]*)(\d*)$/;
          const matchA = a2.match(regex);
          const matchB = b2.match(regex);
          if (matchA && matchB) {
            const prefixA = matchA[1] || "";
            const prefixB = matchB[1] || "";
            const numA = matchA[2] ? parseInt(matchA[2], 10) : 0;
            const numB = matchB[2] ? parseInt(matchB[2], 10) : 0;
            if (prefixA !== prefixB) {
              return prefixA.localeCompare(prefixB);
            }
            return numA - numB;
          }
          return a2.localeCompare(b2);
        });
      },
      // 确认输入
      confirmLocationInput() {
        if (!this.locationInputValue.trim())
          return;
        const parsed = this.parseLocationInput(this.locationInputValue);
        if (parsed.length > 0) {
          const currentValue = this.getLocationArray(this.formattedTags[this.currentEditingIndex].value);
          const newValues = [.../* @__PURE__ */ new Set([...currentValue, ...parsed])];
          const sortedValues = this.sortLocationValues(newValues);
          this.formattedTags[this.currentEditingIndex].value = sortedValues.join(",");
          this.locationInputValue = "";
          this.hideLocationModal();
        }
      },
      // 初始化日期滚轮选项
      initDateWheelOptions() {
        if (this.dateWheelYears.length === 0) {
          const date = /* @__PURE__ */ new Date();
          const currentYear = date.getFullYear();
          const years = [];
          for (let y2 = currentYear - 50; y2 <= currentYear + 10; y2++) {
            years.push(y2);
          }
          this.dateWheelYears = years;
        }
        if (this.dateWheelMonths.length === 0) {
          this.dateWheelMonths = Array.from({ length: 12 }, (_2, i2) => i2 + 1);
        }
        if (this.dateWheelDays.length === 0) {
          this.dateWheelDays = Array.from({ length: 31 }, (_2, i2) => i2 + 1);
        }
      },
      openDateWheel(index2, type) {
        var _a, _b;
        this.initDateWheelOptions();
        this.dateWheelTargetIndex = index2;
        this.dateWheelTargetType = type;
        const rawValue = type === "datetime" ? this.getDatePart((_a = this.formattedTags[index2]) == null ? void 0 : _a.value) : ((_b = this.formattedTags[index2]) == null ? void 0 : _b.value) || "";
        const baseDate = rawValue || this.getTodayDate();
        const [yStr, mStr, dStr] = baseDate.split("-");
        const year = parseInt(yStr, 10);
        const month = parseInt(mStr, 10);
        const day = parseInt(dStr, 10);
        const yearIndex = this.dateWheelYears.indexOf(year);
        const monthIndex = this.dateWheelMonths.indexOf(month);
        const dayIndex = Math.min(
          this.dateWheelDays.length - 1,
          (isNaN(day) ? 1 : day) - 1
        );
        this.dateWheelValue = [
          yearIndex >= 0 ? yearIndex : 0,
          monthIndex >= 0 ? monthIndex : 0,
          dayIndex >= 0 ? dayIndex : 0
        ];
        this.showDateWheel = true;
      },
      closeDateWheel() {
        this.showDateWheel = false;
        this.dateWheelTargetIndex = -1;
        this.dateWheelTargetType = "";
      },
      onDateWheelChange(e2) {
        const val = e2.detail.value || [0, 0, 0];
        this.dateWheelValue = val;
      },
      confirmDateWheel() {
        var _a;
        const [yIndex, mIndex, dIndex] = this.dateWheelValue;
        const year = this.dateWheelYears[yIndex] || this.dateWheelYears[0];
        const month = this.dateWheelMonths[mIndex] || 1;
        const day = this.dateWheelDays[dIndex] || 1;
        const dateStr = [
          year,
          String(month).padStart(2, "0"),
          String(day).padStart(2, "0")
        ].join("-");
        const idx = this.dateWheelTargetIndex;
        const type = this.dateWheelTargetType;
        if (idx !== -1) {
          if (type === "date") {
            this.onDateChange(idx, { detail: { value: dateStr } });
          } else if (type === "datetime") {
            const current = ((_a = this.formattedTags[idx]) == null ? void 0 : _a.value) || "";
            const timePart = this.getTimePart(current) || "00:00";
            const datetimeStr = `${dateStr} ${timePart}`;
            this.onDateTimeChange(idx, { detail: { value: datetimeStr } });
          }
        }
        this.closeDateWheel();
      },
      // 选择今天日期
      selectToday() {
        const today = /* @__PURE__ */ new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const yearIndex = this.dateWheelYears.findIndex((y2) => y2 === year);
        const monthIndex = this.dateWheelMonths.findIndex((m2) => m2 === month);
        const dayIndex = this.dateWheelDays.findIndex((d2) => d2 === day);
        this.dateWheelValue = [
          yearIndex >= 0 ? yearIndex : 0,
          monthIndex >= 0 ? monthIndex : 0,
          dayIndex >= 0 ? dayIndex : 0
        ];
        this.confirmDateWheel();
      },
      // 初始化时间滚轮选项
      initTimeWheelOptions() {
        if (this.timeWheelHours.length === 0) {
          this.timeWheelHours = Array.from({ length: 24 }, (_2, i2) => i2);
        }
        if (this.timeWheelMinutes.length === 0) {
          this.timeWheelMinutes = Array.from({ length: 60 }, (_2, i2) => i2);
        }
      },
      openTimeWheel(index2) {
        var _a;
        this.initTimeWheelOptions();
        this.timeWheelTargetIndex = index2;
        const rawTime = this.getTimePart(((_a = this.formattedTags[index2]) == null ? void 0 : _a.value) || "") || "00:00";
        const [hStr, mStr] = rawTime.split(":");
        const h2 = parseInt(hStr, 10);
        const m2 = parseInt(mStr, 10);
        const hIndex = isNaN(h2) ? 0 : Math.min(Math.max(h2, 0), 23);
        const mIndex = isNaN(m2) ? 0 : Math.min(Math.max(m2, 0), 59);
        this.timeWheelValue = [hIndex, mIndex];
        this.showTimeWheel = true;
      },
      closeTimeWheel() {
        this.showTimeWheel = false;
        this.timeWheelTargetIndex = -1;
      },
      onTimeWheelChange(e2) {
        const val = e2.detail.value || [0, 0];
        this.timeWheelValue = val;
      },
      confirmTimeWheel() {
        var _a;
        const [hIndex, mIndex] = this.timeWheelValue;
        const hour = this.timeWheelHours[hIndex] || 0;
        const minute = this.timeWheelMinutes[mIndex] || 0;
        const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        const idx = this.timeWheelTargetIndex;
        if (idx !== -1) {
          const current = ((_a = this.formattedTags[idx]) == null ? void 0 : _a.value) || "";
          const datePart = this.getDatePart(current) || this.getTodayDate();
          const datetimeStr = `${datePart} ${timeStr}`;
          this.onDateTimeChange(idx, { detail: { value: datetimeStr } });
        }
        this.closeTimeWheel();
      },
      // 选择当前时间
      selectCurrentTime() {
        const now2 = /* @__PURE__ */ new Date();
        const hour = now2.getHours();
        const minute = now2.getMinutes();
        this.timeWheelValue = [hour, minute];
        this.confirmTimeWheel();
      },
      // 获取日期/时间部分（用于滚轮选择器显示）
      getDatePart(value) {
        if (!value)
          return "";
        const str = String(value);
        return str.split(" ")[0] || "";
      },
      getTimePart(value) {
        if (!value)
          return "";
        const str = String(value);
        if (str.includes(" ")) {
          return str.split(" ")[1] || "";
        }
        return str;
      },
      // 日期 / 日期时间输入事件处理与校验
      // datetime 的滚轮时间改变
      onWheelTimeChange(index2, event) {
        var _a;
        const timePart = event && event.detail ? event.detail.value : "";
        const current = ((_a = this.formattedTags[index2]) == null ? void 0 : _a.value) || "";
        const datePart = this.getDatePart(current) || this.getTodayDate();
        const value = timePart ? `${datePart} ${timePart}` : "";
        this.onDateTimeChange(index2, { detail: { value } });
      },
      getTodayDate() {
        const d2 = /* @__PURE__ */ new Date();
        const y2 = d2.getFullYear();
        const m2 = String(d2.getMonth() + 1).padStart(2, "0");
        const day = String(d2.getDate()).padStart(2, "0");
        return `${y2}-${m2}-${day}`;
      },
      onDateChange(index2, event) {
        const rawValue = event && event.detail ? event.detail.value : event && event.target ? event.target.value : "";
        if (!rawValue) {
          this.updateTagValue(index2, "");
          return;
        }
        const isValid = this.validateDate(rawValue);
        if (!isValid) {
          if (typeof uni !== "undefined" && uni.showToast) {
            uni.showToast({
              title: "日期格式应为 YYYY-MM-DD",
              icon: "none"
            });
          } else {
            formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:1548", "日期格式不正确，应为 YYYY-MM-DD:", rawValue);
          }
          return;
        }
        this.updateTagValue(index2, rawValue);
      },
      onDateTimeChange(index2, event) {
        let rawValue = event && event.detail ? event.detail.value : event && event.target ? event.target.value : "";
        if (!rawValue) {
          this.updateTagValue(index2, "");
          return;
        }
        if (rawValue.includes("T")) {
          const [datePart, timePartRaw] = rawValue.split("T");
          const timePart = timePartRaw ? timePartRaw.substring(0, 5) : "";
          rawValue = `${datePart} ${timePart}`;
        }
        const isValid = this.validateDateTime(rawValue);
        if (!isValid) {
          if (typeof uni !== "undefined" && uni.showToast) {
            uni.showToast({
              title: "时间格式应为 YYYY-MM-DD HH:MM",
              icon: "none"
            });
          } else {
            formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:1584", "时间格式不正确，应为 YYYY-MM-DD HH:MM:", rawValue);
          }
          return;
        }
        this.updateTagValue(index2, rawValue);
      },
      validateDate(value) {
        const dateReg = /^\d{4}-\d{2}-\d{2}$/;
        return dateReg.test(value);
      },
      validateDateTime(value) {
        const dateTimeReg = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/;
        return dateTimeReg.test(value);
      },
      // 删除布点
      removeLocation(index2, locIndex) {
        const currentValue = this.getLocationArray(this.formattedTags[index2].value);
        const newValue = currentValue.filter((_2, i2) => i2 !== locIndex);
        const sortedValues = this.sortLocationValues(newValue);
        this.formattedTags[index2].value = sortedValues.join(",");
      },
      updateTagValue(index2, value) {
        var _a;
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1614", "updateTagValue 被调用:", { index: index2, value, tagType: (_a = this.formattedTags[index2]) == null ? void 0 : _a.type });
        if (!this.formattedTags[index2]) {
          formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:1617", "formattedTags[index] 不存在:", index2);
          return;
        }
        const safeValue = value !== void 0 && value !== null ? value : "";
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1623", "安全处理后的值:", safeValue);
        if (this.formattedTags[index2].type === "location") {
          const processedValue = this.processLocationValue(safeValue);
          if (typeof processedValue === "string" && processedValue.includes(",")) {
            const values = processedValue.split(",").filter((item) => item.trim() !== "");
            const sortedValues = this.sortLocationValues(values);
            this.formattedTags[index2].value = sortedValues.join(",");
          } else {
            this.formattedTags[index2].value = processedValue;
          }
        } else {
          this.formattedTags[index2].value = safeValue;
        }
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1641", "更新后的 tag.value:", this.formattedTags[index2].value);
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1642", "当前 formattedTags:", JSON.stringify(this.formattedTags[index2], null, 2));
        this.updateCacheData();
      },
      // 更新缓存数据
      updateCacheData() {
        if (this.autoSaveTimer) {
          clearTimeout(this.autoSaveTimer);
        }
        this.autoSaveTimer = setTimeout(() => {
          this.saveTagsToCache();
        }, 500);
      },
      // 检查分类任务缓存
      checkCategoryTasksCache() {
        try {
          const allStorageKeys = uni.getStorageInfoSync ? uni.getStorageInfoSync().keys : [];
          for (const key of allStorageKeys) {
            if (key.endsWith("_tasks")) {
              try {
                const cachedData = uni.getStorageSync(key);
                if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
                  const taskIndex = cachedData.tasks.findIndex((task) => task._id === this.taskId);
                  if (taskIndex !== -1) {
                    const task = cachedData.tasks[taskIndex];
                    if (task.tags) {
                      formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1675", "从分类任务缓存加载任务详情数据:", key, task);
                      const normalizedTags = task.tags.map((tag) => ({
                        _id: tag._id || "",
                        name: tag.name || "",
                        type: tag.type || "text",
                        description: tag.description || "",
                        value: tag.value !== void 0 ? tag.value : tag.defaultValue || ""
                      }));
                      this.processTagsData(normalizedTags);
                      this.hasLoadedFromCache = true;
                      this.loadDeviceSnListFromTask(task);
                      if (task.scrollPosition !== void 0 && task.scrollPosition !== null) {
                        this.currentScrollTop = task.scrollPosition;
                        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1692", "从任务缓存恢复滚动位置:", task.scrollPosition);
                      }
                      this.taskInfo = {
                        ...this.taskInfo,
                        taskNo: task.taskNo || this.taskInfo.taskNo,
                        taskName: task.taskName || this.taskInfo.taskName,
                        templateName: task.templateName || this.taskInfo.templateName,
                        tags: normalizedTags,
                        hasUnsavedTags: !!task.hasUnsavedTags
                      };
                      return true;
                    }
                  }
                }
              } catch (e2) {
                formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:1709", "检查缓存时出错:", key, e2);
              }
            }
          }
        } catch (e2) {
          formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:1714", "遍历缓存键时出错:", e2);
        }
        return false;
      },
      // 将任务字段写回指定任务数组（包含 data.tasks 结构），并可选更新“未提交”标记
      applyTaskUpdatesToTaskArray(taskArray, updates = {}, options = {}) {
        if (!Array.isArray(taskArray)) {
          return { updated: taskArray, changed: false };
        }
        const { tagsToSend, deviceSnList } = updates;
        const { hasUnsavedTags } = options;
        let changed = false;
        const updated = taskArray.map((task) => {
          const isCurrentTask = task && (task._id === this.taskId || task.taskId === this.taskId);
          if (isCurrentTask) {
            changed = true;
            return {
              ...task,
              ...tagsToSend ? { tags: tagsToSend } : {},
              ...deviceSnList ? { deviceSnList } : {},
              // hasUnsavedTags 为 undefined 时不修改此前的值
              ...hasUnsavedTags === void 0 ? {} : { hasUnsavedTags }
            };
          }
          return task;
        });
        return { updated, changed };
      },
      // 更新任务缓存
      updateTaskCache(tagsToSend) {
        try {
          const allStorageKeys = uni.getStorageInfoSync ? uni.getStorageInfoSync().keys : [];
          for (const key of allStorageKeys) {
            if (!key.endsWith("_tasks"))
              continue;
            try {
              const cachedData = uni.getStorageSync(key) || {};
              const hasTasksArray = Array.isArray(cachedData.tasks);
              const hasDataTasksArray = cachedData.data && Array.isArray(cachedData.data.tasks);
              if (!hasTasksArray && !hasDataTasksArray) {
                continue;
              }
              let changed = false;
              let dataTasksChanged = false;
              let updatedTasks = cachedData.tasks;
              let updatedData = cachedData.data || {};
              if (hasTasksArray) {
                const applyResult = this.applyTaskUpdatesToTaskArray(cachedData.tasks, {
                  tagsToSend,
                  deviceSnList: (this.deviceSnList || []).map((d2) => ({ deviceId: d2.deviceId, deviceSn: d2.deviceSn }))
                }, {
                  hasUnsavedTags: false
                });
                updatedTasks = applyResult.updated;
                changed = applyResult.changed;
              }
              if (hasDataTasksArray) {
                const applyResultInner = this.applyTaskUpdatesToTaskArray(cachedData.data.tasks, {
                  tagsToSend,
                  deviceSnList: (this.deviceSnList || []).map((d2) => ({ deviceId: d2.deviceId, deviceSn: d2.deviceSn }))
                }, {
                  hasUnsavedTags: false
                });
                updatedData = {
                  ...cachedData.data,
                  tasks: applyResultInner.updated
                };
                dataTasksChanged = applyResultInner.changed;
              }
              if (changed || dataTasksChanged) {
                uni.setStorageSync(key, {
                  tasks: hasTasksArray ? updatedTasks : cachedData.tasks,
                  timestamp: cachedData.timestamp || Date.now(),
                  data: updatedData
                });
                formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1800", "缓存数据已更新:", key, "tasksChanged:", changed, "dataTasksChanged:", dataTasksChanged);
              }
            } catch (e2) {
              formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:1804", "更新缓存时出错:", key, e2);
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/task/task-detail/task-detail.vue:1808", "更新缓存数据失败:", error);
        }
        if (this.taskInfo) {
          this.taskInfo.hasUnsavedTags = false;
        }
      },
      // 保存数据到缓存
      saveTagsToCache() {
        try {
          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1820", "saveTagsToCache 开始执行，formattedTags:", JSON.stringify(this.formattedTags, null, 2));
          const tagsToSend = this.formattedTags.map((tag, idx) => {
            let processedValue = tag.value;
            formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1825", `标签 ${idx} (${tag.name}):`, {
              tagValue: tag.value,
              tagValueType: typeof tag.value,
              tagValueIsUndefined: tag.value === void 0,
              tagValueIsNull: tag.value === null,
              processedValue
            });
            if (processedValue === void 0 || processedValue === null) {
              formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:1835", `标签 ${idx} (${tag.name}) 的 value 是 ${processedValue}，使用默认值`);
              processedValue = tag.defaultValue !== void 0 ? tag.defaultValue : "";
            }
            if (tag.type === "location" && typeof processedValue === "string") {
              const values = processedValue.split(",").filter((item) => item.trim() !== "");
              processedValue = this.sortLocationValues(values);
            }
            if (tag.type === "image") {
              processedValue = processedValue;
            }
            const result = {
              _id: tag._id,
              name: tag.name,
              type: tag.type,
              description: tag.description,
              value: processedValue
            };
            formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1859", `标签 ${idx} 处理结果:`, result);
            return result;
          });
          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1863", "tagsToSend 最终结果:", JSON.stringify(tagsToSend, null, 2));
          const allStorageKeys = uni.getStorageInfoSync ? uni.getStorageInfoSync().keys : [];
          for (const key of allStorageKeys) {
            if (!key.endsWith("_tasks"))
              continue;
            try {
              const cachedData = uni.getStorageSync(key) || {};
              const hasTasksArray = Array.isArray(cachedData.tasks);
              const hasDataTasksArray = cachedData.data && Array.isArray(cachedData.data.tasks);
              if (!hasTasksArray && !hasDataTasksArray) {
                continue;
              }
              let changed = false;
              let dataTasksChanged = false;
              let updatedTasks = cachedData.tasks;
              let updatedData = cachedData.data || {};
              if (hasTasksArray) {
                const applyResult = this.applyTaskUpdatesToTaskArray(cachedData.tasks, {
                  tagsToSend,
                  deviceSnList: (this.deviceSnList || []).map((d2) => ({ deviceId: d2.deviceId, deviceSn: d2.deviceSn }))
                }, {
                  // 本地有编辑但尚未点“保存标签”，标记为未提交
                  hasUnsavedTags: true
                });
                updatedTasks = applyResult.updated;
                changed = applyResult.changed;
              }
              if (hasDataTasksArray) {
                const applyResultInner = this.applyTaskUpdatesToTaskArray(cachedData.data.tasks, {
                  tagsToSend,
                  deviceSnList: (this.deviceSnList || []).map((d2) => ({ deviceId: d2.deviceId, deviceSn: d2.deviceSn }))
                }, {
                  hasUnsavedTags: true
                });
                updatedData = {
                  ...cachedData.data,
                  tasks: applyResultInner.updated
                };
                dataTasksChanged = applyResultInner.changed;
              }
              if (changed || dataTasksChanged) {
                uni.setStorageSync(key, {
                  tasks: hasTasksArray ? updatedTasks : cachedData.tasks,
                  timestamp: cachedData.timestamp || Date.now(),
                  data: updatedData
                });
                formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1916", "updatedTasks:", updatedTasks);
                formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1917", "缓存数据已更新:", key, "tasksChanged:", changed, "dataTasksChanged:", dataTasksChanged);
              }
            } catch (e2) {
              formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:1921", "更新缓存时出错:", key, e2);
            }
          }
          if (this.taskInfo) {
            this.taskInfo.hasUnsavedTags = true;
          }
        } catch (error) {
          formatAppLog("error", "at pages/task/task-detail/task-detail.vue:1930", "更新缓存数据失败:", error);
        }
      },
      // 输入框获得焦点时的处理
      onInputFocus(index2) {
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1936", `输入框 ${index2} 获得焦点`);
      },
      // 输入框失去焦点时的处理
      onInputBlur(index2) {
        formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1942", `输入框 ${index2} 失去焦点`);
      },
      // 点击标签标题时聚焦到对应输入框
      focusInput(index2) {
        this.$nextTick(() => {
          const inputRef = this.$refs[`input_${index2}`];
          if (inputRef && inputRef[0]) {
            inputRef[0].focus();
          }
        });
      },
      // 保存滚动位置到任务缓存
      saveScrollPosition() {
        try {
          const scrollTop = this.currentScrollTop || 0;
          if (scrollTop <= 0) {
            return;
          }
          const allStorageKeys = uni.getStorageInfoSync ? uni.getStorageInfoSync().keys : [];
          for (const key of allStorageKeys) {
            if (key.endsWith("_tasks")) {
              try {
                const cachedData = uni.getStorageSync(key);
                if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
                  const taskIndex = cachedData.tasks.findIndex((task) => task._id === this.taskId);
                  if (taskIndex !== -1) {
                    const updatedTasks = [...cachedData.tasks];
                    updatedTasks[taskIndex] = {
                      ...updatedTasks[taskIndex],
                      scrollPosition: scrollTop
                    };
                    uni.setStorageSync(key, {
                      tasks: updatedTasks,
                      timestamp: cachedData.timestamp || Date.now(),
                      data: cachedData.data || {}
                      // 保留任务列表的滚动位置等数据
                    });
                    formatAppLog("log", "at pages/task/task-detail/task-detail.vue:1989", "滚动位置已保存到任务缓存:", key, scrollTop);
                    break;
                  }
                }
              } catch (e2) {
                formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:1994", "保存滚动位置时出错:", key, e2);
              }
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/task/task-detail/task-detail.vue:1999", "保存滚动位置失败:", error);
        }
      },
      // 从任务缓存中恢复滚动位置
      restoreScrollPosition() {
        try {
          const allStorageKeys = uni.getStorageInfoSync ? uni.getStorageInfoSync().keys : [];
          for (const key of allStorageKeys) {
            if (key.endsWith("_tasks")) {
              try {
                const cachedData = uni.getStorageSync(key);
                if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
                  const taskIndex = cachedData.tasks.findIndex((task) => task._id === this.taskId);
                  if (taskIndex !== -1) {
                    const task = cachedData.tasks[taskIndex];
                    if (task.scrollPosition !== void 0 && task.scrollPosition !== null && task.scrollPosition > 0) {
                      this.$nextTick(() => {
                        setTimeout(() => {
                          uni.pageScrollTo({
                            scrollTop: task.scrollPosition,
                            duration: 0
                            // 立即滚动，无动画
                          });
                          this.currentScrollTop = task.scrollPosition;
                          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:2025", "从任务缓存恢复滚动位置:", key, task.scrollPosition);
                        }, 100);
                      });
                      break;
                    }
                  }
                }
              } catch (e2) {
                formatAppLog("warn", "at pages/task/task-detail/task-detail.vue:2033", "恢复滚动位置时出错:", key, e2);
              }
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/task/task-detail/task-detail.vue:2038", "恢复滚动位置失败:", error);
        }
      },
      // 保存标签数据
      async saveTags() {
        try {
          if (!Array.isArray(this.formattedTags) || this.formattedTags.length === 0) {
            return;
          }
          if (!this.hasTagChanges && !(this.taskInfo && this.taskInfo.hasUnsavedTags)) {
            return;
          }
          uni.showLoading({
            title: "保存中..."
          });
          const imageTagsNeedingUpload = this.formattedTags.filter(
            (tag) => tag.type === "image" && tag.localImagePath && !tag.value
          );
          if (imageTagsNeedingUpload.length > 0) {
            const networkType = await this.getNetworkType();
            if (networkType === "none") {
              uni.hideLoading();
              uni.showToast({
                title: "当前无网络，无法上传图片，请联网后再保存",
                icon: "none"
              });
              return;
            }
            for (const imgTag of imageTagsNeedingUpload) {
              try {
                uni.showLoading({
                  title: "图片上传中...",
                  mask: true
                });
                const uploadResult = await apiService.uploadImage(imgTag.localImagePath);
                if (!uploadResult || !uploadResult.url) {
                  throw new Error("上传成功但未返回图片地址");
                }
                imgTag.value = uploadResult.url;
                imgTag.localImagePath = "";
                this.removeLocalImageForTag(imgTag._id);
              } catch (e2) {
                formatAppLog("error", "at pages/task/task-detail/task-detail.vue:2094", "保存前上传图片失败:", e2);
                uni.hideLoading();
                uni.showToast({
                  title: "图片上传失败: " + (e2.message || "未知错误"),
                  icon: "none"
                });
                return;
              }
            }
            uni.showLoading({
              title: "保存中..."
            });
          }
          const tagsToSend = this.formattedTags.map((tag) => {
            let processedValue = tag.value;
            if (tag.type === "location" && typeof processedValue === "string") {
              const values = processedValue.split(",").filter((item) => item.trim() !== "");
              processedValue = this.sortLocationValues(values);
            }
            if (tag.type === "image") {
              processedValue = processedValue;
            }
            return {
              _id: tag._id,
              name: tag.name,
              type: tag.type,
              description: tag.description,
              value: processedValue
            };
          });
          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:2136", "准备发送的标签数据:", {
            taskId: this.taskId,
            tags: tagsToSend,
            deviceSnList: (this.deviceSnList || []).map((d2) => ({ deviceId: d2.deviceId, deviceSn: d2.deviceSn }))
          });
          const result = await apiService.updateTaskTags(
            this.taskId,
            tagsToSend,
            (this.deviceSnList || []).map((d2) => ({ deviceId: d2.deviceId, deviceSn: d2.deviceSn }))
          );
          formatAppLog("log", "at pages/task/task-detail/task-detail.vue:2149", "标签保存成功:", result);
          uni.hideLoading();
          this.updateTaskCache(tagsToSend);
          this.updateOriginalTagsSnapshot();
          this.updateOriginalDeviceSnapshot();
          uni.showToast({
            title: "保存成功",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at pages/task/task-detail/task-detail.vue:2171", "保存标签失败:", error);
          uni.hideLoading();
          uni.showToast({
            title: "保存失败: " + (error.message || "未知错误"),
            icon: "none"
          });
        }
      },
      // 选择图片并上传到七牛云
      chooseAndUploadImage(index2) {
        const tag = this.formattedTags[index2];
        if (!tag)
          return;
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed", "original"],
          sourceType: ["album", "camera"],
          success: async (chooseRes) => {
            try {
              const tempFile = chooseRes.tempFiles && chooseRes.tempFiles[0];
              if (tempFile && tempFile.size && tempFile.size > 10 * 1024 * 1024) {
                uni.showToast({
                  title: "图片不能超过10MB",
                  icon: "none"
                });
                return;
              }
              const filePath = chooseRes.tempFilePaths[0];
              if (!filePath) {
                uni.showToast({
                  title: "未选择有效图片",
                  icon: "none"
                });
                return;
              }
              const persistentPath = await this.ensurePersistentImage(filePath);
              this.$set(this.formattedTags[index2], "localImagePath", persistentPath);
              this.saveLocalImageForTag(tag._id, persistentPath);
              const networkType = await this.getNetworkType();
              if (networkType === "none") {
                uni.showToast({
                  title: "当前无网络，图片已缓存，保存时会自动上传",
                  icon: "none"
                });
                return;
              }
              uni.showLoading({
                title: "图片上传中...",
                mask: true
              });
              const result = await apiService.uploadImage(persistentPath);
              const imageUrl = result.url;
              if (!imageUrl) {
                uni.showToast({
                  title: "上传成功但未返回图片地址",
                  icon: "none"
                });
                return;
              }
              this.formattedTags[index2].value = imageUrl;
              this.formattedTags[index2].localImagePath = "";
              this.removeLocalImageForTag(tag._id);
              uni.showToast({
                title: "上传成功",
                icon: "success"
              });
            } catch (error) {
              formatAppLog("error", "at pages/task/task-detail/task-detail.vue:2261", "上传图片失败:", error);
              uni.showToast({
                title: "上传失败: " + (error.message || "未知错误"),
                icon: "none"
              });
            }
          },
          fail: (err) => {
            if (err && err.errMsg && err.errMsg.indexOf("cancel") === -1) {
              formatAppLog("error", "at pages/task/task-detail/task-detail.vue:2270", "选择图片失败:", err);
              uni.showToast({
                title: "选择图片失败",
                icon: "none"
              });
            }
          }
        });
      },
      previewImage(imageUrl) {
        if (imageUrl) {
          uni.previewImage({
            urls: [imageUrl]
          });
        }
      },
      goRealtimeData() {
        const targetTaskId = this.taskId || this.taskInfo && this.taskInfo._id || "";
        if (!targetTaskId) {
          uni.showToast({
            title: "未找到任务ID，无法查看曲线图",
            icon: "none"
          });
          return;
        }
        uni.navigateTo({
          url: `/pages/task/realtime-data/realtime-data?taskId=${encodeURIComponent(targetTaskId)}`
        });
      },
      goBack() {
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("view", { class: "task-detail-container" }, [
          vue.createElementVNode("view", { class: "task-info-card" }, [
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "info-label" }, "任务编号"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($data.taskInfo.taskNo),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "info-label" }, "任务名称"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($data.taskInfo.taskName),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-item debug-info" }, [
              vue.createElementVNode("text", { class: "info-label" }, "标签数量"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($data.formattedTags.length) + "个",
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "tab-bar" }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["tab-item", { active: $data.activeTab === "tags" }]),
                onClick: _cache[0] || (_cache[0] = ($event) => $data.activeTab = "tags")
              },
              [
                vue.createElementVNode("text", { class: "tab-text" }, "标签列表")
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["tab-item", { active: $data.activeTab === "devices" }]),
                onClick: _cache[1] || (_cache[1] = ($event) => $data.activeTab = "devices")
              },
              [
                vue.createElementVNode("text", { class: "tab-text" }, "设备列表")
              ],
              2
              /* CLASS */
            )
          ]),
          $data.activeTab === "tags" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "tags-section"
          }, [
            vue.createElementVNode("view", { class: "section-header" }, [
              vue.createElementVNode("text", { class: "section-title" }, "标签列表")
            ]),
            vue.createElementVNode("view", { class: "tags-list" }, [
              $data.formattedTags && $data.formattedTags.length > 0 ? (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                { key: 0 },
                vue.renderList($data.formattedTags, (tag, index2) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: tag._id,
                    class: "tag-item-card"
                  }, [
                    vue.createElementVNode("view", { class: "tag-header" }, [
                      vue.createElementVNode("text", {
                        class: "tag-name clickable",
                        onClick: ($event) => $options.focusInput(index2)
                      }, vue.toDisplayString(tag.name), 9, ["onClick"]),
                      vue.createElementVNode(
                        "text",
                        { class: "tag-type" },
                        vue.toDisplayString($options.getTagTypeName(tag.type)),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "tag-content" }, [
                      tag.type === "text" ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "input-wrapper"
                      }, [
                        vue.createElementVNode("input", {
                          ref_for: true,
                          ref: "input_" + index2,
                          value: tag.value,
                          onInput: ($event) => $options.updateTagValue(index2, $event.detail ? $event.detail.value : $event.target ? $event.target.value : ""),
                          onFocus: ($event) => $options.onInputFocus(index2),
                          onBlur: ($event) => $options.onInputBlur(index2),
                          class: "tag-input tag-input-text",
                          placeholder: "请输入文本内容"
                        }, null, 40, ["value", "onInput", "onFocus", "onBlur"])
                      ])) : tag.type === "number" ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 1,
                        class: "input-wrapper"
                      }, [
                        vue.createElementVNode("input", {
                          ref_for: true,
                          ref: "input_" + index2,
                          value: tag.value,
                          onInput: ($event) => $options.updateTagValue(index2, $event.detail ? $event.detail.value : $event.target ? $event.target.value : ""),
                          onFocus: ($event) => $options.onInputFocus(index2),
                          onBlur: ($event) => $options.onInputBlur(index2),
                          class: "tag-input tag-input-number",
                          type: "number",
                          step: "0.1",
                          placeholder: "请输入数字"
                        }, null, 40, ["value", "onInput", "onFocus", "onBlur"])
                      ])) : tag.type === "datetime" ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 2,
                        class: "input-wrapper"
                      }, [
                        vue.createElementVNode("view", { class: "datetime-picker-row" }, [
                          vue.createElementVNode("view", {
                            class: vue.normalizeClass(["picker-display", { "picker-placeholder": !$options.getDatePart(tag.value) }]),
                            onClick: ($event) => $options.openDateWheel(index2, "datetime")
                          }, vue.toDisplayString($options.getDatePart(tag.value) || "请选择日期"), 11, ["onClick"]),
                          vue.createElementVNode("view", {
                            class: vue.normalizeClass(["picker-display", { "picker-placeholder": !$options.getTimePart(tag.value) }]),
                            onClick: ($event) => $options.openTimeWheel(index2)
                          }, vue.toDisplayString($options.getTimePart(tag.value) || "请选择时间"), 11, ["onClick"])
                        ])
                      ])) : tag.type === "date" ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 3,
                        class: "input-wrapper"
                      }, [
                        vue.createElementVNode("view", { class: "datetime-picker-row" }, [
                          vue.createElementVNode("view", {
                            class: vue.normalizeClass(["picker-display", { "picker-placeholder": !tag.value }]),
                            onClick: ($event) => $options.openDateWheel(index2, "date")
                          }, vue.toDisplayString(tag.value || "请选择日期"), 11, ["onClick"])
                        ])
                      ])) : tag.type === "location" ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 4,
                        class: "location-wrapper"
                      }, [
                        vue.createElementVNode("view", { class: "location-content" }, [
                          $options.getLocationArray(tag.value).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                            key: 0,
                            class: "location-tags"
                          }, [
                            (vue.openBlock(true), vue.createElementBlock(
                              vue.Fragment,
                              null,
                              vue.renderList($options.getLocationArray(tag.value), (location2, locIndex) => {
                                return vue.openBlock(), vue.createElementBlock("view", {
                                  key: locIndex,
                                  class: "location-tag"
                                }, [
                                  vue.createElementVNode(
                                    "text",
                                    { class: "location-tag-text" },
                                    vue.toDisplayString(location2),
                                    1
                                    /* TEXT */
                                  ),
                                  vue.createElementVNode("view", {
                                    class: "location-tag-remove",
                                    onClick: ($event) => $options.removeLocation(index2, locIndex)
                                  }, [
                                    vue.createElementVNode("text", { class: "remove-icon" }, "×")
                                  ], 8, ["onClick"])
                                ]);
                              }),
                              128
                              /* KEYED_FRAGMENT */
                            ))
                          ])) : (vue.openBlock(), vue.createElementBlock("view", {
                            key: 1,
                            class: "location-empty"
                          }, [
                            vue.createElementVNode("text", { class: "location-empty-text" }, "暂无布点")
                          ]))
                        ]),
                        vue.createElementVNode("button", {
                          class: "add-location-btn",
                          onClick: ($event) => $options.showAddLocationModal(index2)
                        }, [
                          vue.createElementVNode("text", { class: "btn-icon" }, "+"),
                          vue.createElementVNode("text", { class: "btn-text" }, "添加布点")
                        ], 8, ["onClick"]),
                        $data.showLocationModal && $data.currentEditingIndex === index2 ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 0,
                          class: "modal-overlay",
                          onClick: _cache[8] || (_cache[8] = (...args) => $options.hideLocationModal && $options.hideLocationModal(...args))
                        }, [
                          vue.createElementVNode("view", {
                            class: "modal-content",
                            onClick: _cache[7] || (_cache[7] = vue.withModifiers(() => {
                            }, ["stop"]))
                          }, [
                            vue.createElementVNode("view", { class: "modal-header" }, [
                              vue.createElementVNode("text", { class: "modal-title" }, "添加布点"),
                              vue.createElementVNode("text", {
                                class: "modal-close",
                                onClick: _cache[2] || (_cache[2] = (...args) => $options.hideLocationModal && $options.hideLocationModal(...args))
                              }, "×")
                            ]),
                            vue.createElementVNode("view", { class: "modal-body" }, [
                              vue.withDirectives(vue.createElementVNode(
                                "input",
                                {
                                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.locationInputValue = $event),
                                  class: "modal-input",
                                  placeholder: "输入布点区域，支持范围格式如: 001-010 或 001~010",
                                  onConfirm: _cache[4] || (_cache[4] = (...args) => $options.confirmLocationInput && $options.confirmLocationInput(...args))
                                },
                                null,
                                544
                                /* NEED_HYDRATION, NEED_PATCH */
                              ), [
                                [vue.vModelText, $data.locationInputValue]
                              ]),
                              vue.createElementVNode("view", { class: "modal-help" }, [
                                vue.createElementVNode("text", { class: "modal-help-title" }, "支持格式："),
                                vue.createElementVNode("text", { class: "modal-help-item" }, "格式1: C001 到 C010 或 C001到C010"),
                                vue.createElementVNode("text", { class: "modal-help-item" }, "格式2: C001-C010"),
                                vue.createElementVNode("text", { class: "modal-help-item" }, "格式3: 001~010")
                              ])
                            ]),
                            vue.createElementVNode("view", { class: "modal-footer" }, [
                              vue.createElementVNode("button", {
                                class: "modal-cancel-btn",
                                onClick: _cache[5] || (_cache[5] = (...args) => $options.hideLocationModal && $options.hideLocationModal(...args))
                              }, "取消"),
                              vue.createElementVNode("button", {
                                class: "modal-confirm-btn",
                                onClick: _cache[6] || (_cache[6] = (...args) => $options.confirmLocationInput && $options.confirmLocationInput(...args))
                              }, "确定")
                            ])
                          ])
                        ])) : vue.createCommentVNode("v-if", true)
                      ])) : tag.type === "boolean" ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 5,
                        class: "boolean-wrapper"
                      }, [
                        vue.createElementVNode("view", { class: "boolean-content" }, [
                          vue.createElementVNode("switch", {
                            checked: tag.value,
                            onChange: ($event) => $options.updateTagValue(index2, $event.target.checked),
                            class: "boolean-switch",
                            color: "#667eea"
                          }, null, 40, ["checked", "onChange"]),
                          vue.createElementVNode(
                            "text",
                            { class: "boolean-label" },
                            vue.toDisplayString(tag.value ? "是" : "否"),
                            1
                            /* TEXT */
                          )
                        ])
                      ])) : tag.type === "image" ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 6,
                        class: "image-wrapper"
                      }, [
                        tag.value || tag.localImagePath ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 0,
                          class: "image-content",
                          onClick: ($event) => $options.previewImage(tag.value || tag.localImagePath)
                        }, [
                          vue.createElementVNode("image", {
                            src: tag.localImagePath || tag.value,
                            class: "image-preview",
                            mode: "aspectFit"
                          }, null, 8, ["src"]),
                          vue.createElementVNode("view", { class: "image-overlay" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "image-hint" },
                              vue.toDisplayString(tag.value ? "点击查看大图" : "本地图片，待上传"),
                              1
                              /* TEXT */
                            )
                          ])
                        ], 8, ["onClick"])) : (vue.openBlock(), vue.createElementBlock("view", {
                          key: 1,
                          class: "image-empty"
                        }, [
                          vue.createElementVNode("text", { class: "image-empty-text" }, "暂无图片")
                        ])),
                        vue.createElementVNode("view", { class: "image-actions" }, [
                          vue.createElementVNode("button", {
                            class: "image-upload-btn",
                            onClick: ($event) => $options.chooseAndUploadImage(index2)
                          }, " 选择图片并上传 ", 8, ["onClick"])
                        ]),
                        tag.value ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 2,
                          class: "image-url-wrapper"
                        }, [
                          vue.createElementVNode(
                            "text",
                            { class: "image-url" },
                            vue.toDisplayString(tag.value),
                            1
                            /* TEXT */
                          )
                        ])) : vue.createCommentVNode("v-if", true)
                      ])) : (vue.openBlock(), vue.createElementBlock("view", {
                        key: 7,
                        class: "default-wrapper"
                      }, [
                        vue.createElementVNode(
                          "text",
                          { class: "default-value" },
                          vue.toDisplayString(tag.value || "暂无数据"),
                          1
                          /* TEXT */
                        )
                      ]))
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "no-tags"
              }, [
                vue.createElementVNode("text", { class: "no-tags-text" }, "暂无标签")
              ]))
            ])
          ])) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "tags-section"
          }, [
            vue.createElementVNode("view", { class: "section-header devices-header" }, [
              vue.createElementVNode("text", { class: "section-title" }, "设备列表"),
              vue.createElementVNode("view", { class: "device-header-actions" }, [
                vue.createElementVNode("button", {
                  class: "realtime-btn",
                  onClick: _cache[9] || (_cache[9] = (...args) => $options.goRealtimeData && $options.goRealtimeData(...args))
                }, [
                  vue.createElementVNode("text", { class: "btn-icon" }, "📈"),
                  vue.createElementVNode("text", { class: "btn-text" }, "曲线图")
                ]),
                vue.createElementVNode("button", {
                  class: "add-device-btn-inline",
                  onClick: _cache[10] || (_cache[10] = (...args) => $options.addDevice && $options.addDevice(...args))
                }, [
                  vue.createElementVNode("text", { class: "btn-icon" }, "+"),
                  vue.createElementVNode("text", { class: "btn-text" }, "添加设备")
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "devices-list" }, [
              $options.sortedDeviceSnList.length > 0 ? (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                { key: 0 },
                vue.renderList($options.sortedDeviceSnList, (item, index2) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: item.__key,
                    class: "device-item-card"
                  }, [
                    vue.createElementVNode("view", { class: "device-row" }, [
                      vue.createElementVNode("view", { class: "device-field device-field-id" }, [
                        vue.createElementVNode("input", {
                          class: "device-input",
                          value: item.deviceId,
                          placeholder: "001 / A01",
                          onInput: ($event) => $options.onDeviceFieldInput(item.__key, "deviceId", $event.detail ? $event.detail.value : $event.target ? $event.target.value : "")
                        }, null, 40, ["value", "onInput"])
                      ]),
                      vue.createElementVNode("view", { class: "device-field device-field-sn" }, [
                        vue.createElementVNode("input", {
                          class: "device-input",
                          value: item.deviceSn,
                          placeholder: "202600000000001",
                          onInput: ($event) => $options.onDeviceFieldInput(item.__key, "deviceSn", $event.detail ? $event.detail.value : $event.target ? $event.target.value : "")
                        }, null, 40, ["value", "onInput"])
                      ]),
                      vue.createElementVNode("view", { class: "device-action-col" }, [
                        vue.createElementVNode("button", {
                          class: "device-del-chip",
                          onClick: ($event) => $options.removeDevice(item.__key),
                          "aria-label": "删除设备"
                        }, [
                          vue.createElementVNode("text", { class: "device-del-text" }, "X")
                        ], 8, ["onClick"])
                      ])
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "no-tags"
              }, [
                vue.createElementVNode("text", { class: "no-tags-text" }, "暂无设备")
              ]))
            ])
          ])),
          vue.createElementVNode("view", { class: "actions-section" }, [
            vue.createElementVNode("button", {
              class: "action-btn primary",
              disabled: $options.isSaveDisabled,
              onClick: _cache[11] || (_cache[11] = (...args) => $options.saveTags && $options.saveTags(...args))
            }, " 保存标签 ", 8, ["disabled"]),
            vue.createElementVNode("button", {
              class: "action-btn secondary",
              onClick: _cache[12] || (_cache[12] = (...args) => $options.goBack && $options.goBack(...args))
            }, "返回")
          ])
        ]),
        $data.showDateWheel ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "modal-overlay",
          onClick: _cache[19] || (_cache[19] = (...args) => $options.closeDateWheel && $options.closeDateWheel(...args))
        }, [
          vue.createElementVNode("view", {
            class: "modal-content",
            onClick: _cache[18] || (_cache[18] = vue.withModifiers(() => {
            }, ["stop"]))
          }, [
            vue.createElementVNode("view", { class: "modal-header" }, [
              vue.createElementVNode("text", { class: "modal-title" }, "选择日期"),
              vue.createElementVNode("text", {
                class: "modal-close",
                onClick: _cache[13] || (_cache[13] = (...args) => $options.closeDateWheel && $options.closeDateWheel(...args))
              }, "×")
            ]),
            vue.createElementVNode("view", { class: "modal-body" }, [
              vue.createElementVNode("picker-view", {
                class: "date-wheel-picker-view",
                "indicator-style": $data.dateWheelIndicatorStyle,
                value: $data.dateWheelValue,
                onChange: _cache[14] || (_cache[14] = (...args) => $options.onDateWheelChange && $options.onDateWheelChange(...args))
              }, [
                vue.createElementVNode("picker-view-column", null, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.dateWheelYears, (item, index2) => {
                      return vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          class: "date-wheel-item",
                          key: "year-" + index2
                        },
                        vue.toDisplayString(item) + "年 ",
                        1
                        /* TEXT */
                      );
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                vue.createElementVNode("picker-view-column", null, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.dateWheelMonths, (item, index2) => {
                      return vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          class: "date-wheel-item",
                          key: "month-" + index2
                        },
                        vue.toDisplayString(item) + "月 ",
                        1
                        /* TEXT */
                      );
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                vue.createElementVNode("picker-view-column", null, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.dateWheelDays, (item, index2) => {
                      return vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          class: "date-wheel-item",
                          key: "day-" + index2
                        },
                        vue.toDisplayString(item) + "日 ",
                        1
                        /* TEXT */
                      );
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ], 40, ["indicator-style", "value"])
            ]),
            vue.createElementVNode("view", { class: "modal-footer" }, [
              vue.createElementVNode("button", {
                class: "modal-cancel-btn",
                onClick: _cache[15] || (_cache[15] = (...args) => $options.closeDateWheel && $options.closeDateWheel(...args))
              }, "取消"),
              vue.createElementVNode("button", {
                class: "modal-today-btn",
                onClick: _cache[16] || (_cache[16] = (...args) => $options.selectToday && $options.selectToday(...args))
              }, "今天"),
              vue.createElementVNode("button", {
                class: "modal-confirm-btn",
                onClick: _cache[17] || (_cache[17] = (...args) => $options.confirmDateWheel && $options.confirmDateWheel(...args))
              }, "确定")
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $data.showTimeWheel ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "modal-overlay",
          onClick: _cache[26] || (_cache[26] = (...args) => $options.closeTimeWheel && $options.closeTimeWheel(...args))
        }, [
          vue.createElementVNode("view", {
            class: "modal-content",
            onClick: _cache[25] || (_cache[25] = vue.withModifiers(() => {
            }, ["stop"]))
          }, [
            vue.createElementVNode("view", { class: "modal-header" }, [
              vue.createElementVNode("text", { class: "modal-title" }, "选择时间"),
              vue.createElementVNode("text", {
                class: "modal-close",
                onClick: _cache[20] || (_cache[20] = (...args) => $options.closeTimeWheel && $options.closeTimeWheel(...args))
              }, "×")
            ]),
            vue.createElementVNode("view", { class: "modal-body" }, [
              vue.createElementVNode("picker-view", {
                class: "time-wheel-picker-view",
                "indicator-style": $data.timeWheelIndicatorStyle,
                value: $data.timeWheelValue,
                onChange: _cache[21] || (_cache[21] = (...args) => $options.onTimeWheelChange && $options.onTimeWheelChange(...args))
              }, [
                vue.createElementVNode("picker-view-column", null, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.timeWheelHours, (item, index2) => {
                      return vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          class: "time-wheel-item",
                          key: "hour-" + index2
                        },
                        vue.toDisplayString(String(item).padStart(2, "0")) + " 时 ",
                        1
                        /* TEXT */
                      );
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                vue.createElementVNode("picker-view-column", null, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.timeWheelMinutes, (item, index2) => {
                      return vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          class: "time-wheel-item",
                          key: "minute-" + index2
                        },
                        vue.toDisplayString(String(item).padStart(2, "0")) + " 分 ",
                        1
                        /* TEXT */
                      );
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ], 40, ["indicator-style", "value"])
            ]),
            vue.createElementVNode("view", { class: "modal-footer" }, [
              vue.createElementVNode("button", {
                class: "modal-cancel-btn",
                onClick: _cache[22] || (_cache[22] = (...args) => $options.closeTimeWheel && $options.closeTimeWheel(...args))
              }, "取消"),
              vue.createElementVNode("button", {
                class: "modal-today-btn",
                onClick: _cache[23] || (_cache[23] = (...args) => $options.selectCurrentTime && $options.selectCurrentTime(...args))
              }, "当前时间"),
              vue.createElementVNode("button", {
                class: "modal-confirm-btn",
                onClick: _cache[24] || (_cache[24] = (...args) => $options.confirmTimeWheel && $options.confirmTimeWheel(...args))
              }, "确定")
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesTaskTaskDetailTaskDetail = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-6568b28a"], ["__file", "C:/Users/Administrator/Project/ColdVerifReport/coldverifreport_app2/pages/task/task-detail/task-detail.vue"]]);
  var config = {
    yAxisWidth: 15,
    yAxisSplit: 5,
    xAxisHeight: 15,
    xAxisLineHeight: 15,
    legendHeight: 15,
    yAxisTitleWidth: 15,
    padding: [10, 10, 10, 10],
    pixelRatio: 1,
    rotate: false,
    columePadding: 3,
    fontSize: 13,
    //dataPointShape: ['diamond', 'circle', 'triangle', 'rect'],
    dataPointShape: ["circle", "circle", "circle", "circle"],
    colors: ["#1890ff", "#2fc25b", "#facc14", "#f04864", "#8543e0", "#90ed7d"],
    pieChartLinePadding: 15,
    pieChartTextPadding: 5,
    xAxisTextPadding: 3,
    titleColor: "#333333",
    titleFontSize: 20,
    subtitleColor: "#999999",
    subtitleFontSize: 15,
    toolTipPadding: 3,
    toolTipBackground: "#000000",
    toolTipOpacity: 0.7,
    toolTipLineHeight: 20,
    radarGridCount: 3,
    radarLabelTextMargin: 15,
    gaugeLabelTextMargin: 15
  };
  let assign$2;
  if (Object.assign) {
    assign$2 = Object.assign;
  } else {
    assign$2 = function(target, varArgs) {
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      var to = Object(target);
      for (var index2 = 1; index2 < arguments.length; index2++) {
        var nextSource = arguments[index2];
        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };
  }
  var util = {
    toFixed: function toFixed(num, limit) {
      limit = limit || 2;
      if (this.isFloat(num)) {
        num = num.toFixed(limit);
      }
      return num;
    },
    isFloat: function isFloat(num) {
      return num % 1 !== 0;
    },
    approximatelyEqual: function approximatelyEqual(num1, num2) {
      return Math.abs(num1 - num2) < 1e-10;
    },
    isSameSign: function isSameSign(num1, num2) {
      return Math.abs(num1) === num1 && Math.abs(num2) === num2 || Math.abs(num1) !== num1 && Math.abs(num2) !== num2;
    },
    isSameXCoordinateArea: function isSameXCoordinateArea(p1, p2) {
      return this.isSameSign(p1.x, p2.x);
    },
    isCollision: function isCollision(obj1, obj2) {
      obj1.end = {};
      obj1.end.x = obj1.start.x + obj1.width;
      obj1.end.y = obj1.start.y - obj1.height;
      obj2.end = {};
      obj2.end.x = obj2.start.x + obj2.width;
      obj2.end.y = obj2.start.y - obj2.height;
      var flag = obj2.start.x > obj1.end.x || obj2.end.x < obj1.start.x || obj2.end.y > obj1.start.y || obj2.start.y < obj1.end.y;
      return !flag;
    }
  };
  function hexToRgb(hexValue, opc) {
    var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    var hex = hexValue.replace(rgx, function(m2, r3, g3, b3) {
      return r3 + r3 + g3 + g3 + b3 + b3;
    });
    var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var r2 = parseInt(rgb[1], 16);
    var g2 = parseInt(rgb[2], 16);
    var b2 = parseInt(rgb[3], 16);
    return "rgba(" + r2 + "," + g2 + "," + b2 + "," + opc + ")";
  }
  function findRange(num, type, limit) {
    if (isNaN(num)) {
      throw new Error("[uCharts] unvalid series data!");
    }
    limit = limit || 10;
    type = type ? type : "upper";
    var multiple = 1;
    while (limit < 1) {
      limit *= 10;
      multiple *= 10;
    }
    if (type === "upper") {
      num = Math.ceil(num * multiple);
    } else {
      num = Math.floor(num * multiple);
    }
    while (num % limit !== 0) {
      if (type === "upper") {
        num++;
      } else {
        num--;
      }
    }
    return num / multiple;
  }
  function calCandleMA(dayArr, nameArr, colorArr, kdata) {
    let seriesTemp = [];
    for (let k = 0; k < dayArr.length; k++) {
      let seriesItem = {
        data: [],
        name: nameArr[k],
        color: colorArr[k]
      };
      for (let i2 = 0, len = kdata.length; i2 < len; i2++) {
        if (i2 < dayArr[k]) {
          seriesItem.data.push(null);
          continue;
        }
        let sum = 0;
        for (let j2 = 0; j2 < dayArr[k]; j2++) {
          sum += kdata[i2 - j2][1];
        }
        seriesItem.data.push(+(sum / dayArr[k]).toFixed(3));
      }
      seriesTemp.push(seriesItem);
    }
    return seriesTemp;
  }
  function calValidDistance(distance, chartData, config2, opts) {
    var dataChartAreaWidth = opts.width - opts.area[1] - opts.area[3];
    var dataChartWidth = chartData.eachSpacing * (opts.chartData.xAxisData.xAxisPoints.length - 1);
    var validDistance = distance;
    if (distance >= 0) {
      validDistance = 0;
    } else if (Math.abs(distance) >= dataChartWidth - dataChartAreaWidth) {
      validDistance = dataChartAreaWidth - dataChartWidth;
    }
    return validDistance;
  }
  function isInAngleRange(angle, startAngle, endAngle) {
    function adjust(angle2) {
      while (angle2 < 0) {
        angle2 += 2 * Math.PI;
      }
      while (angle2 > 2 * Math.PI) {
        angle2 -= 2 * Math.PI;
      }
      return angle2;
    }
    angle = adjust(angle);
    startAngle = adjust(startAngle);
    endAngle = adjust(endAngle);
    if (startAngle > endAngle) {
      endAngle += 2 * Math.PI;
      if (angle < startAngle) {
        angle += 2 * Math.PI;
      }
    }
    return angle >= startAngle && angle <= endAngle;
  }
  function calRotateTranslate(x, y2, h2) {
    var xv = x;
    var yv = h2 - y2;
    var transX = xv + (h2 - yv - xv) / Math.sqrt(2);
    transX *= -1;
    var transY = (h2 - yv) * (Math.sqrt(2) - 1) - (h2 - yv - xv) / Math.sqrt(2);
    return {
      transX,
      transY
    };
  }
  function createCurveControlPoints(points, i2) {
    function isNotMiddlePoint(points2, i3) {
      if (points2[i3 - 1] && points2[i3 + 1]) {
        return points2[i3].y >= Math.max(points2[i3 - 1].y, points2[i3 + 1].y) || points2[i3].y <= Math.min(
          points2[i3 - 1].y,
          points2[i3 + 1].y
        );
      } else {
        return false;
      }
    }
    var a2 = 0.2;
    var b2 = 0.2;
    var pAx = null;
    var pAy = null;
    var pBx = null;
    var pBy = null;
    if (i2 < 1) {
      pAx = points[0].x + (points[1].x - points[0].x) * a2;
      pAy = points[0].y + (points[1].y - points[0].y) * a2;
    } else {
      pAx = points[i2].x + (points[i2 + 1].x - points[i2 - 1].x) * a2;
      pAy = points[i2].y + (points[i2 + 1].y - points[i2 - 1].y) * a2;
    }
    if (i2 > points.length - 3) {
      var last = points.length - 1;
      pBx = points[last].x - (points[last].x - points[last - 1].x) * b2;
      pBy = points[last].y - (points[last].y - points[last - 1].y) * b2;
    } else {
      pBx = points[i2 + 1].x - (points[i2 + 2].x - points[i2].x) * b2;
      pBy = points[i2 + 1].y - (points[i2 + 2].y - points[i2].y) * b2;
    }
    if (isNotMiddlePoint(points, i2 + 1)) {
      pBy = points[i2 + 1].y;
    }
    if (isNotMiddlePoint(points, i2)) {
      pAy = points[i2].y;
    }
    return {
      ctrA: {
        x: pAx,
        y: pAy
      },
      ctrB: {
        x: pBx,
        y: pBy
      }
    };
  }
  function convertCoordinateOrigin(x, y2, center) {
    return {
      x: center.x + x,
      y: center.y - y2
    };
  }
  function avoidCollision(obj, target) {
    if (target) {
      while (util.isCollision(obj, target)) {
        if (obj.start.x > 0) {
          obj.start.y--;
        } else if (obj.start.x < 0) {
          obj.start.y++;
        } else {
          if (obj.start.y > 0) {
            obj.start.y++;
          } else {
            obj.start.y--;
          }
        }
      }
    }
    return obj;
  }
  function fillSeries(series, opts, config2) {
    var index2 = 0;
    return series.map(function(item) {
      if (!item.color) {
        item.color = config2.colors[index2];
        index2 = (index2 + 1) % config2.colors.length;
      }
      if (!item.type) {
        item.type = opts.type;
      }
      if (typeof item.show == "undefined") {
        item.show = true;
      }
      if (!item.type) {
        item.type = opts.type;
      }
      if (!item.pointShape) {
        item.pointShape = "circle";
      }
      if (!item.legendShape) {
        switch (item.type) {
          case "line":
            item.legendShape = "line";
            break;
          case "column":
            item.legendShape = "rect";
            break;
          case "area":
            item.legendShape = "triangle";
            break;
          default:
            item.legendShape = "circle";
        }
      }
      return item;
    });
  }
  function getDataRange(minData, maxData) {
    var limit = 0;
    var range = maxData - minData;
    if (range >= 1e4) {
      limit = 1e3;
    } else if (range >= 1e3) {
      limit = 100;
    } else if (range >= 100) {
      limit = 10;
    } else if (range >= 10) {
      limit = 5;
    } else if (range >= 1) {
      limit = 1;
    } else if (range >= 0.1) {
      limit = 0.1;
    } else if (range >= 0.01) {
      limit = 0.01;
    } else if (range >= 1e-3) {
      limit = 1e-3;
    } else if (range >= 1e-4) {
      limit = 1e-4;
    } else if (range >= 1e-5) {
      limit = 1e-5;
    } else {
      limit = 1e-6;
    }
    return {
      minRange: findRange(minData, "lower", limit),
      maxRange: findRange(maxData, "upper", limit)
    };
  }
  function measureText(text) {
    var fontSize = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : config.fontSize;
    text = String(text);
    var text = text.split("");
    var width = 0;
    for (let i2 = 0; i2 < text.length; i2++) {
      let item = text[i2];
      if (/[a-zA-Z]/.test(item)) {
        width += 7;
      } else if (/[0-9]/.test(item)) {
        width += 5.5;
      } else if (/\./.test(item)) {
        width += 2.7;
      } else if (/-/.test(item)) {
        width += 3.25;
      } else if (/[\u4e00-\u9fa5]/.test(item)) {
        width += 10;
      } else if (/\(|\)/.test(item)) {
        width += 3.73;
      } else if (/\s/.test(item)) {
        width += 2.5;
      } else if (/%/.test(item)) {
        width += 8;
      } else {
        width += 10;
      }
    }
    return width * fontSize / 10;
  }
  function dataCombine(series) {
    return series.reduce(function(a2, b2) {
      return (a2.data ? a2.data : a2).concat(b2.data);
    }, []);
  }
  function dataCombineStack(series, len) {
    var sum = new Array(len);
    for (var j2 = 0; j2 < sum.length; j2++) {
      sum[j2] = 0;
    }
    for (var i2 = 0; i2 < series.length; i2++) {
      for (var j2 = 0; j2 < sum.length; j2++) {
        sum[j2] += series[i2].data[j2];
      }
    }
    return series.reduce(function(a2, b2) {
      return (a2.data ? a2.data : a2).concat(b2.data).concat(sum);
    }, []);
  }
  function getTouches(touches, opts, e2) {
    let x, y2;
    if (touches.clientX) {
      if (opts.rotate) {
        y2 = opts.height - touches.clientX * opts.pixelRatio;
        x = (touches.pageY - e2.currentTarget.offsetTop - opts.height / opts.pixelRatio / 2 * (opts.pixelRatio - 1)) * opts.pixelRatio;
      } else {
        x = touches.clientX * opts.pixelRatio;
        y2 = (touches.pageY - e2.currentTarget.offsetTop - opts.height / opts.pixelRatio / 2 * (opts.pixelRatio - 1)) * opts.pixelRatio;
      }
    } else {
      if (opts.rotate) {
        y2 = opts.height - touches.x * opts.pixelRatio;
        x = touches.y * opts.pixelRatio;
      } else {
        x = touches.x * opts.pixelRatio;
        y2 = touches.y * opts.pixelRatio;
      }
    }
    return {
      x,
      y: y2
    };
  }
  function getSeriesDataItem(series, index2) {
    var data = [];
    for (let i2 = 0; i2 < series.length; i2++) {
      let item = series[i2];
      if (item.data[index2] !== null && typeof item.data[index2] !== "undefined" && item.show) {
        let seriesItem = {};
        seriesItem.color = item.color;
        seriesItem.type = item.type;
        seriesItem.style = item.style;
        seriesItem.pointShape = item.pointShape;
        seriesItem.disableLegend = item.disableLegend;
        seriesItem.name = item.name;
        seriesItem.show = item.show;
        seriesItem.data = item.format ? item.format(item.data[index2]) : item.data[index2];
        data.push(seriesItem);
      }
    }
    return data;
  }
  function getMaxTextListLength(list) {
    var lengthList = list.map(function(item) {
      return measureText(item);
    });
    return Math.max.apply(null, lengthList);
  }
  function getRadarCoordinateSeries(length) {
    var eachAngle = 2 * Math.PI / length;
    var CoordinateSeries = [];
    for (var i2 = 0; i2 < length; i2++) {
      CoordinateSeries.push(eachAngle * i2);
    }
    return CoordinateSeries.map(function(item) {
      return -1 * item + Math.PI / 2;
    });
  }
  function getToolTipData(seriesData, calPoints, index2, categories) {
    var option = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {};
    var textList = seriesData.map(function(item) {
      return {
        // format 回调增加 index 参数，便于业务侧从原始 categories 中取“完整时间”等信息
        text: option.format ? option.format(item, categories[index2], index2) : item.name + ": " + item.data,
        color: item.color
      };
    });
    if (option && option.title) {
      var titleText = typeof option.title === "function" ? option.title(categories[index2], index2, categories) : option.title;
      if (titleText !== void 0 && titleText !== null && String(titleText).length > 0) {
        textList.unshift({ text: String(titleText), color: null });
      }
    }
    var validCalPoints = [];
    var offset = {
      x: 0,
      y: 0
    };
    for (let i2 = 0; i2 < calPoints.length; i2++) {
      let points = calPoints[i2];
      if (typeof points[index2] !== "undefined" && points[index2] !== null) {
        validCalPoints.push(points[index2]);
      }
    }
    for (let i2 = 0; i2 < validCalPoints.length; i2++) {
      let item = validCalPoints[i2];
      offset.x = Math.round(item.x);
      offset.y += item.y;
    }
    offset.y /= validCalPoints.length;
    return {
      textList,
      offset
    };
  }
  function getMixToolTipData(seriesData, calPoints, index2, categories) {
    var option = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {};
    var textList = seriesData.map(function(item) {
      return {
        // format 回调增加 index 参数，便于业务侧从原始 categories 中取“完整时间”等信息
        text: option.format ? option.format(item, categories[index2], index2) : item.name + ": " + item.data,
        color: item.color,
        disableLegend: item.disableLegend ? true : false
      };
    });
    textList = textList.filter(function(item) {
      if (item.disableLegend !== true) {
        return item;
      }
    });
    if (option && option.title) {
      var titleText = typeof option.title === "function" ? option.title(categories[index2], index2, categories) : option.title;
      if (titleText !== void 0 && titleText !== null && String(titleText).length > 0) {
        textList.unshift({ text: String(titleText), color: null });
      }
    }
    var validCalPoints = [];
    var offset = {
      x: 0,
      y: 0
    };
    for (let i2 = 0; i2 < calPoints.length; i2++) {
      let points = calPoints[i2];
      if (typeof points[index2] !== "undefined" && points[index2] !== null) {
        validCalPoints.push(points[index2]);
      }
    }
    for (let i2 = 0; i2 < validCalPoints.length; i2++) {
      let item = validCalPoints[i2];
      offset.x = Math.round(item.x);
      offset.y += item.y;
    }
    offset.y /= validCalPoints.length;
    return {
      textList,
      offset
    };
  }
  function getCandleToolTipData(series, seriesData, calPoints, index2, categories, extra) {
    let upColor = extra.color.upFill;
    let downColor = extra.color.downFill;
    let color = [upColor, upColor, downColor, upColor];
    var textList = [];
    let text0 = {
      text: categories[index2],
      color: null
    };
    textList.push(text0);
    seriesData.map(function(item) {
      if (index2 == 0 && item.data[1] - item.data[0] < 0) {
        color[1] = downColor;
      } else {
        if (item.data[0] < series[index2 - 1][1]) {
          color[0] = downColor;
        }
        if (item.data[1] < item.data[0]) {
          color[1] = downColor;
        }
        if (item.data[2] > series[index2 - 1][1]) {
          color[2] = upColor;
        }
        if (item.data[3] < series[index2 - 1][1]) {
          color[3] = downColor;
        }
      }
      let text1 = {
        text: "开盘：" + item.data[0],
        color: color[0]
      };
      let text2 = {
        text: "收盘：" + item.data[1],
        color: color[1]
      };
      let text3 = {
        text: "最低：" + item.data[2],
        color: color[2]
      };
      let text4 = {
        text: "最高：" + item.data[3],
        color: color[3]
      };
      textList.push(text1, text2, text3, text4);
    });
    var validCalPoints = [];
    var offset = {
      x: 0,
      y: 0
    };
    for (let i2 = 0; i2 < calPoints.length; i2++) {
      let points = calPoints[i2];
      if (typeof points[index2] !== "undefined" && points[index2] !== null) {
        validCalPoints.push(points[index2]);
      }
    }
    offset.x = Math.round(validCalPoints[0][0].x);
    return {
      textList,
      offset
    };
  }
  function filterSeries(series) {
    let tempSeries = [];
    for (let i2 = 0; i2 < series.length; i2++) {
      if (series[i2].show == true) {
        tempSeries.push(series[i2]);
      }
    }
    return tempSeries;
  }
  function findCurrentIndex(currentPoints, xAxisPoints, opts, config2) {
    var offset = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
    var currentIndex = -1;
    var spacing = 0;
    if ((opts.type == "line" || opts.type == "area") && opts.xAxis.boundaryGap == "justify") {
      spacing = opts.chartData.eachSpacing / 2;
    }
    if (isInExactChartArea(currentPoints, opts)) {
      xAxisPoints.forEach(function(item, index2) {
        if (currentPoints.x + offset + spacing > item) {
          currentIndex = index2;
        }
      });
    }
    return currentIndex;
  }
  function findLegendIndex(currentPoints, legendData, opts) {
    let currentIndex = -1;
    if (isInExactLegendArea(currentPoints, legendData.area)) {
      let points = legendData.points;
      let index2 = -1;
      for (let i2 = 0, len = points.length; i2 < len; i2++) {
        let item = points[i2];
        for (let j2 = 0; j2 < item.length; j2++) {
          index2 += 1;
          let area = item[j2]["area"];
          if (currentPoints.x > area[0] && currentPoints.x < area[2] && currentPoints.y > area[1] && currentPoints.y < area[3]) {
            currentIndex = index2;
            break;
          }
        }
      }
      return currentIndex;
    }
    return currentIndex;
  }
  function isInExactLegendArea(currentPoints, area) {
    return currentPoints.x > area.start.x && currentPoints.x < area.end.x && currentPoints.y > area.start.y && currentPoints.y < area.end.y;
  }
  function isInExactChartArea(currentPoints, opts, config2) {
    return currentPoints.x < opts.width - opts.area[1] + 10 && currentPoints.x > opts.area[3] - 10 && currentPoints.y > opts.area[0] && currentPoints.y < opts.height - opts.area[2];
  }
  function findRadarChartCurrentIndex(currentPoints, radarData, count) {
    var eachAngleArea = 2 * Math.PI / count;
    var currentIndex = -1;
    if (isInExactPieChartArea(currentPoints, radarData.center, radarData.radius)) {
      var fixAngle = function fixAngle2(angle2) {
        if (angle2 < 0) {
          angle2 += 2 * Math.PI;
        }
        if (angle2 > 2 * Math.PI) {
          angle2 -= 2 * Math.PI;
        }
        return angle2;
      };
      var angle = Math.atan2(radarData.center.y - currentPoints.y, currentPoints.x - radarData.center.x);
      angle = -1 * angle;
      if (angle < 0) {
        angle += 2 * Math.PI;
      }
      var angleList = radarData.angleList.map(function(item) {
        item = fixAngle(-1 * item);
        return item;
      });
      angleList.forEach(function(item, index2) {
        var rangeStart = fixAngle(item - eachAngleArea / 2);
        var rangeEnd = fixAngle(item + eachAngleArea / 2);
        if (rangeEnd < rangeStart) {
          rangeEnd += 2 * Math.PI;
        }
        if (angle >= rangeStart && angle <= rangeEnd || angle + 2 * Math.PI >= rangeStart && angle + 2 * Math.PI <= rangeEnd) {
          currentIndex = index2;
        }
      });
    }
    return currentIndex;
  }
  function findFunnelChartCurrentIndex(currentPoints, funnelData) {
    var currentIndex = -1;
    for (var i2 = 0, len = funnelData.series.length; i2 < len; i2++) {
      var item = funnelData.series[i2];
      if (currentPoints.x > item.funnelArea[0] && currentPoints.x < item.funnelArea[2] && currentPoints.y > item.funnelArea[1] && currentPoints.y < item.funnelArea[3]) {
        currentIndex = i2;
        break;
      }
    }
    return currentIndex;
  }
  function findWordChartCurrentIndex(currentPoints, wordData) {
    var currentIndex = -1;
    for (var i2 = 0, len = wordData.length; i2 < len; i2++) {
      var item = wordData[i2];
      if (currentPoints.x > item.area[0] && currentPoints.x < item.area[2] && currentPoints.y > item.area[1] && currentPoints.y < item.area[3]) {
        currentIndex = i2;
        break;
      }
    }
    return currentIndex;
  }
  function findMapChartCurrentIndex(currentPoints, opts) {
    var currentIndex = -1;
    var cData = opts.chartData.mapData;
    var data = opts.series;
    var tmp = pointToCoordinate(currentPoints.y, currentPoints.x, cData.bounds, cData.scale, cData.xoffset, cData.yoffset);
    var poi = [tmp.x, tmp.y];
    for (var i2 = 0, len = data.length; i2 < len; i2++) {
      var item = data[i2].geometry.coordinates;
      if (isPoiWithinPoly(poi, item)) {
        currentIndex = i2;
        break;
      }
    }
    return currentIndex;
  }
  function findPieChartCurrentIndex(currentPoints, pieData) {
    var currentIndex = -1;
    if (isInExactPieChartArea(currentPoints, pieData.center, pieData.radius)) {
      var angle = Math.atan2(pieData.center.y - currentPoints.y, currentPoints.x - pieData.center.x);
      angle = -angle;
      for (var i2 = 0, len = pieData.series.length; i2 < len; i2++) {
        var item = pieData.series[i2];
        if (isInAngleRange(angle, item._start_, item._start_ + item._proportion_ * 2 * Math.PI)) {
          currentIndex = i2;
          break;
        }
      }
    }
    return currentIndex;
  }
  function isInExactPieChartArea(currentPoints, center, radius) {
    return Math.pow(currentPoints.x - center.x, 2) + Math.pow(currentPoints.y - center.y, 2) <= Math.pow(radius, 2);
  }
  function splitPoints(points) {
    var newPoints = [];
    var items = [];
    points.forEach(function(item, index2) {
      if (item !== null) {
        items.push(item);
      } else {
        if (items.length) {
          newPoints.push(items);
        }
        items = [];
      }
    });
    if (items.length) {
      newPoints.push(items);
    }
    return newPoints;
  }
  function calLegendData(series, opts, config2, chartData) {
    let legendData = {
      area: {
        start: {
          x: 0,
          y: 0
        },
        end: {
          x: 0,
          y: 0
        },
        width: 0,
        height: 0,
        wholeWidth: 0,
        wholeHeight: 0
      },
      points: [],
      widthArr: [],
      heightArr: []
    };
    if (opts.legend.show === false) {
      chartData.legendData = legendData;
      return legendData;
    }
    let padding = opts.legend.padding;
    let margin = opts.legend.margin;
    let fontSize = opts.legend.fontSize;
    let shapeWidth = 15 * opts.pixelRatio;
    let shapeRight = 5 * opts.pixelRatio;
    let lineHeight = Math.max(opts.legend.lineHeight * opts.pixelRatio, fontSize);
    if (opts.legend.position == "top" || opts.legend.position == "bottom") {
      let legendList = [];
      let widthCount = 0;
      let widthCountArr = [];
      let currentRow = [];
      for (let i2 = 0; i2 < series.length; i2++) {
        let item = series[i2];
        let itemWidth = shapeWidth + shapeRight + measureText(item.name || "undefined", fontSize) + opts.legend.itemGap;
        if (widthCount + itemWidth > opts.width - opts.padding[1] - opts.padding[3]) {
          legendList.push(currentRow);
          widthCountArr.push(widthCount - opts.legend.itemGap);
          widthCount = itemWidth;
          currentRow = [item];
        } else {
          widthCount += itemWidth;
          currentRow.push(item);
        }
      }
      if (currentRow.length) {
        legendList.push(currentRow);
        widthCountArr.push(widthCount - opts.legend.itemGap);
        legendData.widthArr = widthCountArr;
        let legendWidth = Math.max.apply(null, widthCountArr);
        switch (opts.legend.float) {
          case "left":
            legendData.area.start.x = opts.padding[3];
            legendData.area.end.x = opts.padding[3] + 2 * padding;
            break;
          case "right":
            legendData.area.start.x = opts.width - opts.padding[1] - legendWidth - 2 * padding;
            legendData.area.end.x = opts.width - opts.padding[1];
            break;
          default:
            legendData.area.start.x = (opts.width - legendWidth) / 2 - padding;
            legendData.area.end.x = (opts.width + legendWidth) / 2 + padding;
        }
        legendData.area.width = legendWidth + 2 * padding;
        legendData.area.wholeWidth = legendWidth + 2 * padding;
        legendData.area.height = legendList.length * lineHeight + 2 * padding;
        legendData.area.wholeHeight = legendList.length * lineHeight + 2 * padding + 2 * margin;
        legendData.points = legendList;
      }
    } else {
      let len = series.length;
      let maxHeight = opts.height - opts.padding[0] - opts.padding[2] - 2 * margin - 2 * padding;
      let maxLength = Math.min(Math.floor(maxHeight / lineHeight), len);
      legendData.area.height = maxLength * lineHeight + padding * 2;
      legendData.area.wholeHeight = maxLength * lineHeight + padding * 2;
      switch (opts.legend.float) {
        case "top":
          legendData.area.start.y = opts.padding[0] + margin;
          legendData.area.end.y = opts.padding[0] + margin + legendData.area.height;
          break;
        case "bottom":
          legendData.area.start.y = opts.height - opts.padding[2] - margin - legendData.area.height;
          legendData.area.end.y = opts.height - opts.padding[2] - margin;
          break;
        default:
          legendData.area.start.y = (opts.height - legendData.area.height) / 2;
          legendData.area.end.y = (opts.height + legendData.area.height) / 2;
      }
      let lineNum = len % maxLength === 0 ? len / maxLength : Math.floor(len / maxLength + 1);
      let currentRow = [];
      for (let i2 = 0; i2 < lineNum; i2++) {
        let temp = series.slice(i2 * maxLength, i2 * maxLength + maxLength);
        currentRow.push(temp);
      }
      legendData.points = currentRow;
      if (currentRow.length) {
        for (let i2 = 0; i2 < currentRow.length; i2++) {
          let item = currentRow[i2];
          let maxWidth = 0;
          for (let j2 = 0; j2 < item.length; j2++) {
            let itemWidth = shapeWidth + shapeRight + measureText(item[j2].name || "undefined", fontSize) + opts.legend.itemGap;
            if (itemWidth > maxWidth) {
              maxWidth = itemWidth;
            }
          }
          legendData.widthArr.push(maxWidth);
          legendData.heightArr.push(item.length * lineHeight + padding * 2);
        }
        let legendWidth = 0;
        for (let i2 = 0; i2 < legendData.widthArr.length; i2++) {
          legendWidth += legendData.widthArr[i2];
        }
        legendData.area.width = legendWidth - opts.legend.itemGap + 2 * padding;
        legendData.area.wholeWidth = legendData.area.width + padding;
      }
    }
    switch (opts.legend.position) {
      case "top":
        legendData.area.start.y = opts.padding[0] + margin;
        legendData.area.end.y = opts.padding[0] + margin + legendData.area.height;
        break;
      case "bottom":
        legendData.area.start.y = opts.height - opts.padding[2] - legendData.area.height - margin;
        legendData.area.end.y = opts.height - opts.padding[2] - margin;
        break;
      case "left":
        legendData.area.start.x = opts.padding[3];
        legendData.area.end.x = opts.padding[3] + legendData.area.width;
        break;
      case "right":
        legendData.area.start.x = opts.width - opts.padding[1] - legendData.area.width;
        legendData.area.end.x = opts.width - opts.padding[1];
        break;
    }
    chartData.legendData = legendData;
    return legendData;
  }
  function calCategoriesData(categories, opts, config2, eachSpacing) {
    var result = {
      angle: 0,
      xAxisHeight: config2.xAxisHeight
    };
    var hasMultiLine = false;
    var categoriesTextLenth = categories.map(function(item) {
      if (typeof item === "string" && item.indexOf("|") !== -1) {
        hasMultiLine = true;
        var parts = item.split("|");
        var w1 = measureText(parts[0] || "");
        var w2 = measureText(parts[1] || "");
        return Math.max(w1, w2);
      }
      return measureText(item);
    });
    var maxTextLength = Math.max.apply(this, categoriesTextLenth);
    if (opts.xAxis.rotateLabel == true && maxTextLength + 2 * config2.xAxisTextPadding > eachSpacing) {
      result.angle = 45 * Math.PI / 180;
      result.xAxisHeight = 2 * config2.xAxisTextPadding + maxTextLength * Math.sin(result.angle);
    }
    if (hasMultiLine && result.angle === 0) {
      var xAxisFontSize = opts.xAxis.fontSize || config2.fontSize;
      var multiLineHeight = 2 * config2.xAxisTextPadding + xAxisFontSize * 2 + 2;
      result.xAxisHeight = Math.max(result.xAxisHeight, multiLineHeight);
    }
    return result;
  }
  function getRadarDataPoints(angleList, center, radius, series, opts) {
    var process = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : 1;
    var radarOption = opts.extra.radar || {};
    radarOption.max = radarOption.max || 0;
    var maxData = Math.max(radarOption.max, Math.max.apply(null, dataCombine(series)));
    var data = [];
    for (let i2 = 0; i2 < series.length; i2++) {
      let each = series[i2];
      let listItem = {};
      listItem.color = each.color;
      listItem.data = [];
      each.data.forEach(function(item, index2) {
        let tmp = {};
        tmp.angle = angleList[index2];
        tmp.proportion = item / maxData;
        tmp.position = convertCoordinateOrigin(radius * tmp.proportion * process * Math.cos(tmp.angle), radius * tmp.proportion * process * Math.sin(tmp.angle), center);
        listItem.data.push(tmp);
      });
      data.push(listItem);
    }
    return data;
  }
  function getPieDataPoints(series, radius) {
    var process = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
    var count = 0;
    var _start_ = 0;
    for (let i2 = 0; i2 < series.length; i2++) {
      let item = series[i2];
      item.data = item.data === null ? 0 : item.data;
      count += item.data;
    }
    for (let i2 = 0; i2 < series.length; i2++) {
      let item = series[i2];
      item.data = item.data === null ? 0 : item.data;
      if (count === 0) {
        item._proportion_ = 1 / series.length * process;
      } else {
        item._proportion_ = item.data / count * process;
      }
      item._radius_ = radius;
    }
    for (let i2 = 0; i2 < series.length; i2++) {
      let item = series[i2];
      item._start_ = _start_;
      _start_ += 2 * item._proportion_ * Math.PI;
    }
    return series;
  }
  function getFunnelDataPoints(series, radius) {
    var process = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
    series = series.sort(function(a2, b2) {
      return parseInt(b2.data) - parseInt(a2.data);
    });
    for (let i2 = 0; i2 < series.length; i2++) {
      series[i2].radius = series[i2].data / series[0].data * radius * process;
      series[i2]._proportion_ = series[i2].data / series[0].data;
    }
    return series.reverse();
  }
  function getRoseDataPoints(series, type, minRadius, radius) {
    var process = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1;
    var count = 0;
    var _start_ = 0;
    var dataArr = [];
    for (let i2 = 0; i2 < series.length; i2++) {
      let item = series[i2];
      item.data = item.data === null ? 0 : item.data;
      count += item.data;
      dataArr.push(item.data);
    }
    var minData = Math.min.apply(null, dataArr);
    var maxData = Math.max.apply(null, dataArr);
    var radiusLength = radius - minRadius;
    for (let i2 = 0; i2 < series.length; i2++) {
      let item = series[i2];
      item.data = item.data === null ? 0 : item.data;
      if (count === 0 || type == "area") {
        item._proportion_ = item.data / count * process;
        item._rose_proportion_ = 1 / series.length * process;
      } else {
        item._proportion_ = item.data / count * process;
        item._rose_proportion_ = item.data / count * process;
      }
      item._radius_ = minRadius + radiusLength * ((item.data - minData) / (maxData - minData));
    }
    for (let i2 = 0; i2 < series.length; i2++) {
      let item = series[i2];
      item._start_ = _start_;
      _start_ += 2 * item._rose_proportion_ * Math.PI;
    }
    return series;
  }
  function getArcbarDataPoints(series, arcbarOption) {
    var process = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
    if (process == 1) {
      process = 0.999999;
    }
    for (let i2 = 0; i2 < series.length; i2++) {
      let item = series[i2];
      item.data = item.data === null ? 0 : item.data;
      let totalAngle;
      if (arcbarOption.type == "default") {
        if (arcbarOption.endAngle < arcbarOption.startAngle) {
          totalAngle = 2 + arcbarOption.endAngle - arcbarOption.startAngle;
        } else {
          totalAngle = arcbarOption.startAngle - arcbarOption.endAngle;
        }
      } else {
        totalAngle = 2;
      }
      item._proportion_ = totalAngle * item.data * process + arcbarOption.startAngle;
      if (item._proportion_ >= 2) {
        item._proportion_ = item._proportion_ % 2;
      }
    }
    return series;
  }
  function getGaugeAxisPoints(categories, startAngle, endAngle) {
    let totalAngle = startAngle - endAngle + 1;
    let tempStartAngle = startAngle;
    for (let i2 = 0; i2 < categories.length; i2++) {
      categories[i2].value = categories[i2].value === null ? 0 : categories[i2].value;
      categories[i2]._startAngle_ = tempStartAngle;
      categories[i2]._endAngle_ = totalAngle * categories[i2].value + startAngle;
      if (categories[i2]._endAngle_ >= 2) {
        categories[i2]._endAngle_ = categories[i2]._endAngle_ % 2;
      }
      tempStartAngle = categories[i2]._endAngle_;
    }
    return categories;
  }
  function getGaugeDataPoints(series, categories, gaugeOption) {
    let process = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 1;
    for (let i2 = 0; i2 < series.length; i2++) {
      let item = series[i2];
      item.data = item.data === null ? 0 : item.data;
      if (gaugeOption.pointer.color == "auto") {
        for (let i3 = 0; i3 < categories.length; i3++) {
          if (item.data <= categories[i3].value) {
            item.color = categories[i3].color;
            break;
          }
        }
      } else {
        item.color = gaugeOption.pointer.color;
      }
      let totalAngle = gaugeOption.startAngle - gaugeOption.endAngle + 1;
      item._endAngle_ = totalAngle * item.data + gaugeOption.startAngle;
      item._oldAngle_ = gaugeOption.oldAngle;
      if (gaugeOption.oldAngle < gaugeOption.endAngle) {
        item._oldAngle_ += 2;
      }
      if (item.data >= gaugeOption.oldData) {
        item._proportion_ = (item._endAngle_ - item._oldAngle_) * process + gaugeOption.oldAngle;
      } else {
        item._proportion_ = item._oldAngle_ - (item._oldAngle_ - item._endAngle_) * process;
      }
      if (item._proportion_ >= 2) {
        item._proportion_ = item._proportion_ % 2;
      }
    }
    return series;
  }
  function getPieTextMaxLength(series) {
    series = getPieDataPoints(series);
    let maxLength = 0;
    for (let i2 = 0; i2 < series.length; i2++) {
      let item = series[i2];
      let text = item.format ? item.format(+item._proportion_.toFixed(2)) : util.toFixed(item._proportion_ * 100) + "%";
      maxLength = Math.max(maxLength, measureText(text));
    }
    return maxLength;
  }
  function fixColumeData(points, eachSpacing, columnLen, index2, config2, opts) {
    return points.map(function(item) {
      if (item === null) {
        return null;
      }
      item.width = Math.ceil((eachSpacing - 2 * config2.columePadding) / columnLen);
      if (opts.extra.column && opts.extra.column.width && +opts.extra.column.width > 0) {
        item.width = Math.min(item.width, +opts.extra.column.width);
      }
      if (item.width <= 0) {
        item.width = 1;
      }
      item.x += (index2 + 0.5 - columnLen / 2) * item.width;
      return item;
    });
  }
  function fixColumeMeterData(points, eachSpacing, columnLen, index2, config2, opts, border) {
    return points.map(function(item) {
      if (item === null) {
        return null;
      }
      item.width = Math.ceil((eachSpacing - 2 * config2.columePadding) / 2);
      if (opts.extra.column && opts.extra.column.width && +opts.extra.column.width > 0) {
        item.width = Math.min(item.width, +opts.extra.column.width);
      }
      if (index2 > 0) {
        item.width -= 2 * border;
      }
      return item;
    });
  }
  function fixColumeStackData(points, eachSpacing, columnLen, index2, config2, opts, series) {
    return points.map(function(item, indexn) {
      if (item === null) {
        return null;
      }
      item.width = Math.ceil((eachSpacing - 2 * config2.columePadding) / 2);
      if (opts.extra.column && opts.extra.column.width && +opts.extra.column.width > 0) {
        item.width = Math.min(item.width, +opts.extra.column.width);
      }
      return item;
    });
  }
  function getXAxisPoints(categories, opts, config2) {
    config2.yAxisWidth + config2.yAxisTitleWidth;
    var spacingValid = opts.width - opts.area[1] - opts.area[3];
    var dataCount = opts.enableScroll ? Math.min(opts.xAxis.itemCount, categories.length) : categories.length;
    if ((opts.type == "line" || opts.type == "area") && dataCount > 1 && opts.xAxis.boundaryGap == "justify") {
      dataCount -= 1;
    }
    var eachSpacing = spacingValid / dataCount;
    var xAxisPoints = [];
    var startX = opts.area[3];
    var endX = opts.width - opts.area[1];
    categories.forEach(function(item, index2) {
      xAxisPoints.push(startX + index2 * eachSpacing);
    });
    if (opts.xAxis.boundaryGap !== "justify") {
      if (opts.enableScroll === true) {
        xAxisPoints.push(startX + categories.length * eachSpacing);
      } else {
        xAxisPoints.push(endX);
      }
    }
    return {
      xAxisPoints,
      startX,
      endX,
      eachSpacing
    };
  }
  function getCandleDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2) {
    var process = arguments.length > 7 && arguments[7] !== void 0 ? arguments[7] : 1;
    var points = [];
    var validHeight = opts.height - opts.area[0] - opts.area[2];
    data.forEach(function(item, index2) {
      if (item === null) {
        points.push(null);
      } else {
        var cPoints = [];
        item.forEach(function(items, indexs) {
          var point = {};
          point.x = xAxisPoints[index2] + Math.round(eachSpacing / 2);
          var value = items.value || items;
          var height = validHeight * (value - minRange) / (maxRange - minRange);
          height *= process;
          point.y = opts.height - Math.round(height) - opts.area[2];
          cPoints.push(point);
        });
        points.push(cPoints);
      }
    });
    return points;
  }
  function getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2) {
    var process = arguments.length > 7 && arguments[7] !== void 0 ? arguments[7] : 1;
    var boundaryGap = "center";
    if (opts.type == "line" || opts.type == "area") {
      boundaryGap = opts.xAxis.boundaryGap;
    }
    var points = [];
    var validHeight = opts.height - opts.area[0] - opts.area[2];
    data.forEach(function(item, index2) {
      if (item === null) {
        points.push(null);
      } else {
        var point = {};
        point.color = item.color;
        point.x = xAxisPoints[index2];
        if (boundaryGap == "center") {
          point.x += Math.round(eachSpacing / 2);
        }
        var value = item;
        if (typeof item === "object" && item !== null) {
          value = item.value;
        }
        var height = validHeight * (value - minRange) / (maxRange - minRange);
        height *= process;
        point.y = opts.height - Math.round(height) - opts.area[2];
        points.push(point);
      }
    });
    return points;
  }
  function getStackDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, seriesIndex, stackSeries) {
    var process = arguments.length > 9 && arguments[9] !== void 0 ? arguments[9] : 1;
    var points = [];
    var validHeight = opts.height - opts.area[0] - opts.area[2];
    data.forEach(function(item, index2) {
      if (item === null) {
        points.push(null);
      } else {
        var point = {};
        point.color = item.color;
        point.x = xAxisPoints[index2] + Math.round(eachSpacing / 2);
        if (seriesIndex > 0) {
          var value = 0;
          for (let i2 = 0; i2 <= seriesIndex; i2++) {
            value += stackSeries[i2].data[index2];
          }
          var value0 = value - item;
          var height = validHeight * (value - minRange) / (maxRange - minRange);
          var height0 = validHeight * (value0 - minRange) / (maxRange - minRange);
        } else {
          var value = item;
          var height = validHeight * (value - minRange) / (maxRange - minRange);
          var height0 = 0;
        }
        var heightc = height0;
        height *= process;
        heightc *= process;
        point.y = opts.height - Math.round(height) - opts.area[2];
        point.y0 = opts.height - Math.round(heightc) - opts.area[2];
        points.push(point);
      }
    });
    return points;
  }
  function getYAxisTextList(series, opts, config2, stack) {
    var data;
    if (stack == "stack") {
      data = dataCombineStack(series, opts.categories.length);
    } else {
      data = dataCombine(series);
    }
    var sorted = [];
    data = data.filter(function(item) {
      if (typeof item === "object" && item !== null) {
        if (Array.isArray(item)) {
          return item !== null;
        } else {
          return item.value !== null;
        }
      } else {
        return item !== null;
      }
    });
    data.map(function(item) {
      if (typeof item === "object") {
        if (Array.isArray(item)) {
          item.map(function(subitem) {
            sorted.push(subitem);
          });
        } else {
          sorted.push(item.value);
        }
      } else {
        sorted.push(item);
      }
    });
    var minData = 0;
    var maxData = 0;
    if (sorted.length > 0) {
      minData = Math.min.apply(this, sorted);
      maxData = Math.max.apply(this, sorted);
    }
    if (typeof opts.yAxis.min === "number") {
      minData = Math.min(opts.yAxis.min, minData);
    }
    if (typeof opts.yAxis.max === "number") {
      maxData = Math.max(opts.yAxis.max, maxData);
    }
    if (minData === maxData) {
      var rangeSpan = maxData || 10;
      maxData += rangeSpan;
    }
    var dataRange = getDataRange(minData, maxData);
    var minRange = dataRange.minRange;
    var maxRange = dataRange.maxRange;
    var range = [];
    var eachRange = (maxRange - minRange) / config2.yAxisSplit;
    for (var i2 = 0; i2 <= config2.yAxisSplit; i2++) {
      range.push(minRange + eachRange * i2);
    }
    return range.reverse();
  }
  function calYAxisData(series, opts, config2) {
    var columnstyle = assign$2({}, {
      type: ""
    }, opts.extra.column);
    var ranges = getYAxisTextList(series, opts, config2, columnstyle.type);
    var yAxisWidth = config2.yAxisWidth;
    var yAxisFontSize = opts.yAxis.fontSize || config2.fontSize;
    var rangesFormat = ranges.map(function(item) {
      item = util.toFixed(item, 6);
      item = opts.yAxis.format ? opts.yAxis.format(Number(item)) : item;
      yAxisWidth = Math.max(yAxisWidth, measureText(item, yAxisFontSize) + 5);
      return item;
    });
    if (opts.yAxis.disabled === true) {
      yAxisWidth = 0;
    }
    return {
      rangesFormat,
      ranges,
      yAxisWidth
    };
  }
  function calTooltipYAxisData(point, series, opts, config2, eachSpacing) {
    var ranges = getYAxisTextList(series, opts, config2);
    var spacingValid = opts.height - opts.area[0] - opts.area[2];
    let maxVal = ranges[0];
    let minVal = ranges[ranges.length - 1];
    let minAxis = opts.padding[3];
    let maxAxis = opts.padding[1] + spacingValid;
    let item = maxVal - (maxVal - minVal) * (point - minAxis) / (maxAxis - minAxis);
    item = opts.yAxis.format ? opts.yAxis.format(Number(item)) : item;
    return item;
  }
  function calMarkLineData(minRange, maxRange, points, opts) {
    let spacingValid = opts.height - opts.area[0] - opts.area[2];
    for (let i2 = 0; i2 < points.length; i2++) {
      let height = spacingValid * (points[i2].value - minRange) / (maxRange - minRange);
      points[i2].y = opts.height - Math.round(height) - opts.area[2];
    }
    return points;
  }
  function contextRotate(context, opts) {
    if (opts.rotateLock !== true) {
      context.translate(opts.height, 0);
      context.rotate(90 * Math.PI / 180);
    } else if (opts._rotate_ !== true) {
      context.translate(opts.height, 0);
      context.rotate(90 * Math.PI / 180);
      opts._rotate_ = true;
    }
  }
  function drawPointShape(points, color, shape, context, opts) {
    context.beginPath();
    context.setStrokeStyle("#ffffff");
    context.setLineWidth(1 * opts.pixelRatio);
    context.setFillStyle(color);
    if (shape === "diamond") {
      points.forEach(function(item, index2) {
        if (item !== null) {
          context.moveTo(item.x, item.y - 4.5);
          context.lineTo(item.x - 4.5, item.y);
          context.lineTo(item.x, item.y + 4.5);
          context.lineTo(item.x + 4.5, item.y);
          context.lineTo(item.x, item.y - 4.5);
        }
      });
    } else if (shape === "circle") {
      points.forEach(function(item, index2) {
        if (item !== null) {
          context.moveTo(item.x + 3.5 * opts.pixelRatio, item.y);
          context.arc(item.x, item.y, 4 * opts.pixelRatio, 0, 2 * Math.PI, false);
        }
      });
    } else if (shape === "rect") {
      points.forEach(function(item, index2) {
        if (item !== null) {
          context.moveTo(item.x - 3.5, item.y - 3.5);
          context.rect(item.x - 3.5, item.y - 3.5, 7, 7);
        }
      });
    } else if (shape === "triangle") {
      points.forEach(function(item, index2) {
        if (item !== null) {
          context.moveTo(item.x, item.y - 4.5);
          context.lineTo(item.x - 4.5, item.y + 4.5);
          context.lineTo(item.x + 4.5, item.y + 4.5);
          context.lineTo(item.x, item.y - 4.5);
        }
      });
    }
    context.closePath();
    context.fill();
    context.stroke();
  }
  function drawRingTitle(opts, config2, context, center) {
    var titlefontSize = opts.title.fontSize || config2.titleFontSize;
    var subtitlefontSize = opts.subtitle.fontSize || config2.subtitleFontSize;
    var title = opts.title.name || "";
    var subtitle = opts.subtitle.name || "";
    var titleFontColor = opts.title.color || config2.titleColor;
    var subtitleFontColor = opts.subtitle.color || config2.subtitleColor;
    var titleHeight = title ? titlefontSize : 0;
    var subtitleHeight = subtitle ? subtitlefontSize : 0;
    var margin = 5;
    if (subtitle) {
      var textWidth = measureText(subtitle, subtitlefontSize);
      var startX = center.x - textWidth / 2 + (opts.subtitle.offsetX || 0);
      var startY = center.y + subtitlefontSize / 2 + (opts.subtitle.offsetY || 0);
      if (title) {
        startY += (titleHeight + margin) / 2;
      }
      context.beginPath();
      context.setFontSize(subtitlefontSize);
      context.setFillStyle(subtitleFontColor);
      context.fillText(subtitle, startX, startY);
      context.closePath();
      context.stroke();
    }
    if (title) {
      var _textWidth = measureText(title, titlefontSize);
      var _startX = center.x - _textWidth / 2 + (opts.title.offsetX || 0);
      var _startY = center.y + titlefontSize / 2 + (opts.title.offsetY || 0);
      if (subtitle) {
        _startY -= (subtitleHeight + margin) / 2;
      }
      context.beginPath();
      context.setFontSize(titlefontSize);
      context.setFillStyle(titleFontColor);
      context.fillText(title, _startX, _startY);
      context.closePath();
      context.stroke();
    }
  }
  function drawPointText(points, series, config2, context) {
    var data = series.data;
    points.forEach(function(item, index2) {
      if (item !== null) {
        context.beginPath();
        context.setFontSize(series.textSize || config2.fontSize);
        context.setFillStyle(series.textColor || "#666666");
        var value = data[index2];
        if (typeof data[index2] === "object" && data[index2] !== null) {
          value = data[index2].value;
        }
        var formatVal = series.format ? series.format(value) : value;
        context.fillText(String(formatVal), item.x - measureText(formatVal, series.textSize || config2.fontSize) / 2, item.y - 2);
        context.closePath();
        context.stroke();
      }
    });
  }
  function drawGaugeLabel(gaugeOption, radius, centerPosition, opts, config2, context) {
    radius -= gaugeOption.width / 2 + config2.gaugeLabelTextMargin;
    let totalAngle = gaugeOption.startAngle - gaugeOption.endAngle + 1;
    let splitAngle = totalAngle / gaugeOption.splitLine.splitNumber;
    let totalNumber = gaugeOption.endNumber - gaugeOption.startNumber;
    let splitNumber = totalNumber / gaugeOption.splitLine.splitNumber;
    let nowAngle = gaugeOption.startAngle;
    let nowNumber = gaugeOption.startNumber;
    for (let i2 = 0; i2 < gaugeOption.splitLine.splitNumber + 1; i2++) {
      var pos = {
        x: radius * Math.cos(nowAngle * Math.PI),
        y: radius * Math.sin(nowAngle * Math.PI)
      };
      var labelText = gaugeOption.labelFormat ? gaugeOption.labelFormat(nowNumber) : nowNumber;
      pos.x += centerPosition.x - measureText(labelText) / 2;
      pos.y += centerPosition.y;
      var startX = pos.x;
      var startY = pos.y;
      context.beginPath();
      context.setFontSize(config2.fontSize);
      context.setFillStyle(gaugeOption.labelColor || "#666666");
      context.fillText(labelText, startX, startY + config2.fontSize / 2);
      context.closePath();
      context.stroke();
      nowAngle += splitAngle;
      if (nowAngle >= 2) {
        nowAngle = nowAngle % 2;
      }
      nowNumber += splitNumber;
    }
  }
  function drawRadarLabel(angleList, radius, centerPosition, opts, config2, context) {
    var radarOption = opts.extra.radar || {};
    radius += config2.radarLabelTextMargin;
    angleList.forEach(function(angle, index2) {
      var pos = {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      };
      var posRelativeCanvas = convertCoordinateOrigin(pos.x, pos.y, centerPosition);
      var startX = posRelativeCanvas.x;
      var startY = posRelativeCanvas.y;
      if (util.approximatelyEqual(pos.x, 0)) {
        startX -= measureText(opts.categories[index2] || "") / 2;
      } else if (pos.x < 0) {
        startX -= measureText(opts.categories[index2] || "");
      }
      context.beginPath();
      context.setFontSize(config2.fontSize);
      context.setFillStyle(radarOption.labelColor || "#666666");
      context.fillText(opts.categories[index2] || "", startX, startY + config2.fontSize / 2);
      context.closePath();
      context.stroke();
    });
  }
  function drawPieText(series, opts, config2, context, radius, center) {
    var lineRadius = config2.pieChartLinePadding;
    var textObjectCollection = [];
    var lastTextObject = null;
    var seriesConvert = series.map(function(item) {
      var text = item.format ? item.format(+item._proportion_.toFixed(2)) : util.toFixed(item._proportion_.toFixed(4) * 100) + "%";
      if (item._rose_proportion_)
        item._proportion_ = item._rose_proportion_;
      var arc = 2 * Math.PI - (item._start_ + 2 * Math.PI * item._proportion_ / 2);
      var color = item.color;
      var radius2 = item._radius_;
      return {
        arc,
        text,
        color,
        radius: radius2,
        textColor: item.textColor,
        textSize: item.textSize
      };
    });
    for (let i2 = 0; i2 < seriesConvert.length; i2++) {
      let item = seriesConvert[i2];
      let orginX1 = Math.cos(item.arc) * (item.radius + lineRadius);
      let orginY1 = Math.sin(item.arc) * (item.radius + lineRadius);
      let orginX2 = Math.cos(item.arc) * item.radius;
      let orginY2 = Math.sin(item.arc) * item.radius;
      let orginX3 = orginX1 >= 0 ? orginX1 + config2.pieChartTextPadding : orginX1 - config2.pieChartTextPadding;
      let orginY3 = orginY1;
      let textWidth = measureText(item.text);
      let startY = orginY3;
      if (lastTextObject && util.isSameXCoordinateArea(lastTextObject.start, {
        x: orginX3
      })) {
        if (orginX3 > 0) {
          startY = Math.min(orginY3, lastTextObject.start.y);
        } else if (orginX1 < 0) {
          startY = Math.max(orginY3, lastTextObject.start.y);
        } else {
          if (orginY3 > 0) {
            startY = Math.max(orginY3, lastTextObject.start.y);
          } else {
            startY = Math.min(orginY3, lastTextObject.start.y);
          }
        }
      }
      if (orginX3 < 0) {
        orginX3 -= textWidth;
      }
      let textObject = {
        lineStart: {
          x: orginX2,
          y: orginY2
        },
        lineEnd: {
          x: orginX1,
          y: orginY1
        },
        start: {
          x: orginX3,
          y: startY
        },
        width: textWidth,
        height: config2.fontSize,
        text: item.text,
        color: item.color,
        textColor: item.textColor,
        textSize: item.textSize
      };
      lastTextObject = avoidCollision(textObject, lastTextObject);
      textObjectCollection.push(lastTextObject);
    }
    for (let i2 = 0; i2 < textObjectCollection.length; i2++) {
      let item = textObjectCollection[i2];
      let lineStartPoistion = convertCoordinateOrigin(item.lineStart.x, item.lineStart.y, center);
      let lineEndPoistion = convertCoordinateOrigin(item.lineEnd.x, item.lineEnd.y, center);
      let textPosition = convertCoordinateOrigin(item.start.x, item.start.y, center);
      context.setLineWidth(1 * opts.pixelRatio);
      context.setFontSize(config2.fontSize);
      context.beginPath();
      context.setStrokeStyle(item.color);
      context.setFillStyle(item.color);
      context.moveTo(lineStartPoistion.x, lineStartPoistion.y);
      let curveStartX = item.start.x < 0 ? textPosition.x + item.width : textPosition.x;
      let textStartX = item.start.x < 0 ? textPosition.x - 5 : textPosition.x + 5;
      context.quadraticCurveTo(lineEndPoistion.x, lineEndPoistion.y, curveStartX, textPosition.y);
      context.moveTo(lineStartPoistion.x, lineStartPoistion.y);
      context.stroke();
      context.closePath();
      context.beginPath();
      context.moveTo(textPosition.x + item.width, textPosition.y);
      context.arc(curveStartX, textPosition.y, 2, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
      context.beginPath();
      context.setFontSize(item.textSize || config2.fontSize);
      context.setFillStyle(item.textColor || "#666666");
      context.fillText(item.text, textStartX, textPosition.y + 3);
      context.closePath();
      context.stroke();
      context.closePath();
    }
  }
  function drawToolTipSplitLine(offsetX, opts, config2, context) {
    var toolTipOption = opts.extra.tooltip || {};
    toolTipOption.gridType = toolTipOption.gridType == void 0 ? "solid" : toolTipOption.gridType;
    toolTipOption.dashLength = toolTipOption.dashLength == void 0 ? 4 : toolTipOption.dashLength;
    var startY = opts.area[0];
    var endY = opts.height - opts.area[2];
    if (toolTipOption.gridType == "dash") {
      context.setLineDash([toolTipOption.dashLength, toolTipOption.dashLength]);
    }
    context.setStrokeStyle(toolTipOption.gridColor || "#cccccc");
    context.setLineWidth(1 * opts.pixelRatio);
    context.beginPath();
    context.moveTo(offsetX, startY);
    context.lineTo(offsetX, endY);
    context.stroke();
    context.setLineDash([]);
    if (toolTipOption.xAxisLabel) {
      let labelText = opts.categories[opts.tooltip.index];
      context.setFontSize(config2.fontSize);
      let textWidth = measureText(labelText, config2.fontSize);
      let textX = offsetX - 0.5 * textWidth;
      let textY = endY;
      context.beginPath();
      context.setFillStyle(hexToRgb(toolTipOption.labelBgColor || config2.toolTipBackground, toolTipOption.labelBgOpacity || config2.toolTipOpacity));
      context.setStrokeStyle(toolTipOption.labelBgColor || config2.toolTipBackground);
      context.setLineWidth(1 * opts.pixelRatio);
      context.rect(textX - config2.toolTipPadding, textY, textWidth + 2 * config2.toolTipPadding, config2.fontSize + 2 * config2.toolTipPadding);
      context.closePath();
      context.stroke();
      context.fill();
      context.beginPath();
      context.setFontSize(config2.fontSize);
      context.setFillStyle(toolTipOption.labelFontColor || config2.fontColor);
      context.fillText(String(labelText), textX, textY + config2.toolTipPadding + config2.fontSize);
      context.closePath();
      context.stroke();
    }
  }
  function drawMarkLine(minRange, maxRange, opts, config2, context) {
    let markLineOption = assign$2({}, {
      type: "solid",
      dashLength: 4,
      data: []
    }, opts.extra.markLine);
    let startX = opts.area[3];
    let endX = opts.width - opts.padding[1];
    let points = calMarkLineData(minRange, maxRange, markLineOption.data, opts);
    for (let i2 = 0; i2 < points.length; i2++) {
      let item = assign$2({}, {
        lineColor: "#DE4A42",
        showLabel: false,
        labelFontColor: "#666666",
        labelBgColor: "#DFE8FF",
        labelBgOpacity: 0.8,
        yAxisIndex: 0
      }, points[i2]);
      if (markLineOption.type == "dash") {
        context.setLineDash([markLineOption.dashLength, markLineOption.dashLength]);
      }
      context.setStrokeStyle(item.lineColor);
      context.setLineWidth(1 * opts.pixelRatio);
      context.beginPath();
      context.moveTo(startX, item.y);
      context.lineTo(endX, item.y);
      context.stroke();
      context.setLineDash([]);
      if (item.showLabel) {
        let labelText = opts.yAxis.format ? opts.yAxis.format(Number(item.value)) : item.value;
        context.setFontSize(config2.fontSize);
        let textWidth = measureText(labelText, config2.fontSize);
        let bgStartX = opts.padding[3] + config2.yAxisTitleWidth - config2.toolTipPadding;
        let bgEndX = Math.max(opts.area[3], textWidth + config2.toolTipPadding * 2);
        let bgWidth = bgEndX - bgStartX;
        let textX = bgStartX + (bgWidth - textWidth) / 2;
        let textY = item.y;
        context.setFillStyle(hexToRgb(item.labelBgColor, item.labelBgOpacity));
        context.setStrokeStyle(item.labelBgColor);
        context.setLineWidth(1 * opts.pixelRatio);
        context.beginPath();
        context.rect(bgStartX, textY - 0.5 * config2.fontSize - config2.toolTipPadding, bgWidth, config2.fontSize + 2 * config2.toolTipPadding);
        context.closePath();
        context.stroke();
        context.fill();
        context.beginPath();
        context.setFontSize(config2.fontSize);
        context.setFillStyle(item.labelFontColor);
        context.fillText(String(labelText), textX, textY + 0.5 * config2.fontSize);
        context.stroke();
      }
    }
  }
  function drawToolTipHorizentalLine(opts, config2, context, eachSpacing, xAxisPoints) {
    var toolTipOption = assign$2({}, {
      gridType: "solid",
      dashLength: 4
    }, opts.extra.tooltip);
    var startX = opts.area[3];
    var endX = opts.width - opts.padding[1];
    if (toolTipOption.gridType == "dash") {
      context.setLineDash([toolTipOption.dashLength, toolTipOption.dashLength]);
    }
    context.setStrokeStyle(toolTipOption.gridColor || "#cccccc");
    context.setLineWidth(1 * opts.pixelRatio);
    context.beginPath();
    context.moveTo(startX, opts.tooltip.offset.y);
    context.lineTo(endX, opts.tooltip.offset.y);
    context.stroke();
    context.setLineDash([]);
    if (toolTipOption.yAxisLabel) {
      let labelText = calTooltipYAxisData(opts.tooltip.offset.y, opts.series, opts, config2);
      context.setFontSize(config2.fontSize);
      let textWidth = measureText(labelText, config2.fontSize);
      let bgStartX = opts.padding[3] + config2.yAxisTitleWidth - config2.toolTipPadding;
      let bgEndX = Math.max(opts.area[3], textWidth + config2.toolTipPadding * 2);
      let bgWidth = bgEndX - bgStartX;
      let textX = bgStartX + (bgWidth - textWidth) / 2;
      let textY = opts.tooltip.offset.y;
      context.beginPath();
      context.setFillStyle(hexToRgb(toolTipOption.labelBgColor || config2.toolTipBackground, toolTipOption.labelBgOpacity || config2.toolTipOpacity));
      context.setStrokeStyle(toolTipOption.labelBgColor || config2.toolTipBackground);
      context.setLineWidth(1 * opts.pixelRatio);
      context.rect(bgStartX, textY - 0.5 * config2.fontSize - config2.toolTipPadding, bgWidth, config2.fontSize + 2 * config2.toolTipPadding);
      context.closePath();
      context.stroke();
      context.fill();
      context.beginPath();
      context.setFontSize(config2.fontSize);
      context.setFillStyle(toolTipOption.labelFontColor || config2.fontColor);
      context.fillText(labelText, textX, textY + 0.5 * config2.fontSize);
      context.closePath();
      context.stroke();
    }
  }
  function drawToolTipSplitArea(offsetX, opts, config2, context, eachSpacing) {
    var toolTipOption = assign$2({}, {
      activeBgColor: "#000000",
      activeBgOpacity: 0.08
    }, opts.extra.tooltip);
    var startY = opts.area[0];
    var endY = opts.height - opts.area[2];
    context.beginPath();
    context.setFillStyle(hexToRgb(toolTipOption.activeBgColor, toolTipOption.activeBgOpacity));
    context.rect(offsetX - eachSpacing / 2, startY, eachSpacing, endY - startY);
    context.closePath();
    context.fill();
  }
  function drawToolTip(textList, offset, opts, config2, context, eachSpacing, xAxisPoints) {
    var toolTipOption = assign$2({}, {
      bgColor: "#000000",
      bgOpacity: 0.7,
      fontColor: "#FFFFFF"
    }, opts.extra.tooltip);
    var legendWidth = 4 * opts.pixelRatio;
    var legendMarginRight = 5 * opts.pixelRatio;
    var arrowWidth = 8 * opts.pixelRatio;
    var isOverRightBorder = false;
    if (opts.type == "line" || opts.type == "area" || opts.type == "candle" || opts.type == "mix") {
      drawToolTipSplitLine(opts.tooltip.offset.x, opts, config2, context);
    }
    offset = assign$2({
      x: 0,
      y: 0
    }, offset);
    offset.y -= 8 * opts.pixelRatio;
    var textWidth = textList.map(function(item) {
      return measureText(item.text, config2.fontSize);
    });
    var toolTipWidth = legendWidth + legendMarginRight + 4 * config2.toolTipPadding + Math.max.apply(null, textWidth);
    var toolTipHeight = 2 * config2.toolTipPadding + textList.length * config2.toolTipLineHeight;
    if (offset.x - Math.abs(opts._scrollDistance_) + arrowWidth + toolTipWidth > opts.width) {
      isOverRightBorder = true;
    }
    if (toolTipHeight + offset.y > opts.height) {
      offset.y = opts.height - toolTipHeight;
    }
    context.beginPath();
    context.setFillStyle(hexToRgb(toolTipOption.bgColor || config2.toolTipBackground, toolTipOption.bgOpacity || config2.toolTipOpacity));
    if (isOverRightBorder) {
      context.moveTo(offset.x, offset.y + 10 * opts.pixelRatio);
      context.lineTo(offset.x - arrowWidth, offset.y + 10 * opts.pixelRatio - 5 * opts.pixelRatio);
      context.lineTo(offset.x - arrowWidth, offset.y);
      context.lineTo(offset.x - arrowWidth - Math.round(toolTipWidth), offset.y);
      context.lineTo(offset.x - arrowWidth - Math.round(toolTipWidth), offset.y + toolTipHeight);
      context.lineTo(offset.x - arrowWidth, offset.y + toolTipHeight);
      context.lineTo(offset.x - arrowWidth, offset.y + 10 * opts.pixelRatio + 5 * opts.pixelRatio);
      context.lineTo(offset.x, offset.y + 10 * opts.pixelRatio);
    } else {
      context.moveTo(offset.x, offset.y + 10 * opts.pixelRatio);
      context.lineTo(offset.x + arrowWidth, offset.y + 10 * opts.pixelRatio - 5 * opts.pixelRatio);
      context.lineTo(offset.x + arrowWidth, offset.y);
      context.lineTo(offset.x + arrowWidth + Math.round(toolTipWidth), offset.y);
      context.lineTo(offset.x + arrowWidth + Math.round(toolTipWidth), offset.y + toolTipHeight);
      context.lineTo(offset.x + arrowWidth, offset.y + toolTipHeight);
      context.lineTo(offset.x + arrowWidth, offset.y + 10 * opts.pixelRatio + 5 * opts.pixelRatio);
      context.lineTo(offset.x, offset.y + 10 * opts.pixelRatio);
    }
    context.closePath();
    context.fill();
    textList.forEach(function(item, index2) {
      if (item.color !== null) {
        context.beginPath();
        context.setFillStyle(item.color);
        var startX = offset.x + arrowWidth + 2 * config2.toolTipPadding;
        var startY = offset.y + (config2.toolTipLineHeight - config2.fontSize) / 2 + config2.toolTipLineHeight * index2 + config2.toolTipPadding + 1;
        if (isOverRightBorder) {
          startX = offset.x - toolTipWidth - arrowWidth + 2 * config2.toolTipPadding;
        }
        context.fillRect(startX, startY, legendWidth, config2.fontSize);
        context.closePath();
      }
    });
    textList.forEach(function(item, index2) {
      var startX = offset.x + arrowWidth + 2 * config2.toolTipPadding + legendWidth + legendMarginRight;
      if (isOverRightBorder) {
        startX = offset.x - toolTipWidth - arrowWidth + 2 * config2.toolTipPadding + +legendWidth + legendMarginRight;
      }
      var startY = offset.y + (config2.toolTipLineHeight - config2.fontSize) / 2 + config2.toolTipLineHeight * index2 + config2.toolTipPadding;
      context.beginPath();
      context.setFontSize(config2.fontSize);
      context.setFillStyle(toolTipOption.fontColor);
      context.fillText(item.text, startX, startY + config2.fontSize);
      context.closePath();
      context.stroke();
    });
  }
  function drawYAxisTitle(title, opts, config2, context) {
    var startX = config2.xAxisHeight + (opts.height - config2.xAxisHeight - measureText(title)) / 2;
    context.save();
    context.beginPath();
    context.setFontSize(config2.fontSize);
    context.setFillStyle(opts.yAxis.titleFontColor || "#333333");
    context.translate(0, opts.height);
    context.rotate(-90 * Math.PI / 180);
    context.fillText(title, startX, opts.padding[3] + 0.5 * config2.fontSize);
    context.closePath();
    context.stroke();
    context.restore();
  }
  function drawColumnDataPoints(series, opts, config2, context) {
    let process = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1;
    let ranges = [].concat(opts.chartData.yAxisData.ranges);
    let xAxisData = opts.chartData.xAxisData, xAxisPoints = xAxisData.xAxisPoints, eachSpacing = xAxisData.eachSpacing;
    let columnOption = assign$2({}, {
      type: "group",
      width: eachSpacing / 2,
      meter: {
        border: 4,
        fillColor: "#FFFFFF"
      }
    }, opts.extra.column);
    let minRange = ranges.pop();
    let maxRange = ranges.shift();
    let calPoints = [];
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
      context.translate(opts._scrollDistance_, 0);
    }
    if (opts.tooltip && opts.tooltip.textList && opts.tooltip.textList.length && process === 1) {
      drawToolTipSplitArea(opts.tooltip.offset.x, opts, config2, context, eachSpacing);
    }
    series.forEach(function(eachSeries, seriesIndex) {
      var data = eachSeries.data;
      switch (columnOption.type) {
        case "group":
          var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, process);
          var tooltipPoints = getStackDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, seriesIndex, series, process);
          calPoints.push(tooltipPoints);
          points = fixColumeData(points, eachSpacing, series.length, seriesIndex, config2, opts);
          points.forEach(function(item, index2) {
            if (item !== null) {
              context.beginPath();
              context.setStrokeStyle(item.color || eachSeries.color);
              context.setLineWidth(1);
              context.setFillStyle(item.color || eachSeries.color);
              var startX = item.x - item.width / 2;
              opts.height - item.y - opts.area[2];
              context.moveTo(startX - 1, item.y);
              context.lineTo(startX + item.width - 2, item.y);
              context.lineTo(startX + item.width - 2, opts.height - opts.area[2]);
              context.lineTo(startX, opts.height - opts.area[2]);
              context.lineTo(startX, item.y);
              context.closePath();
              context.stroke();
              context.fill();
            }
          });
          break;
        case "stack":
          var points = getStackDataPoints(
            data,
            minRange,
            maxRange,
            xAxisPoints,
            eachSpacing,
            opts,
            config2,
            seriesIndex,
            series,
            process
          );
          calPoints.push(points);
          points = fixColumeStackData(points, eachSpacing, series.length, seriesIndex, config2, opts);
          points.forEach(function(item, index2) {
            if (item !== null) {
              context.beginPath();
              context.setFillStyle(item.color || eachSeries.color);
              var startX = item.x - item.width / 2 + 1;
              var height = opts.height - item.y - opts.area[2];
              var height0 = opts.height - item.y0 - opts.area[2];
              if (seriesIndex > 0) {
                height -= height0;
              }
              context.moveTo(startX, item.y);
              context.fillRect(startX, item.y, item.width - 2, height);
              context.closePath();
              context.fill();
            }
          });
          break;
        case "meter":
          var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, process);
          calPoints.push(points);
          points = fixColumeMeterData(points, eachSpacing, series.length, seriesIndex, config2, opts, columnOption.meter.border);
          if (seriesIndex == 0) {
            points.forEach(function(item, index2) {
              if (item !== null) {
                context.beginPath();
                context.setFillStyle(columnOption.meter.fillColor);
                var startX = item.x - item.width / 2;
                var height = opts.height - item.y - opts.area[2];
                context.moveTo(startX, item.y);
                context.fillRect(startX, item.y, item.width, height);
                context.closePath();
                context.fill();
                if (columnOption.meter.border > 0) {
                  context.beginPath();
                  context.setStrokeStyle(eachSeries.color);
                  context.setLineWidth(columnOption.meter.border * opts.pixelRatio);
                  context.moveTo(startX + columnOption.meter.border * 0.5, item.y + height);
                  context.lineTo(startX + columnOption.meter.border * 0.5, item.y + columnOption.meter.border * 0.5);
                  context.lineTo(startX + item.width - columnOption.meter.border * 0.5, item.y + columnOption.meter.border * 0.5);
                  context.lineTo(startX + item.width - columnOption.meter.border * 0.5, item.y + height);
                  context.stroke();
                }
              }
            });
          } else {
            points.forEach(function(item, index2) {
              if (item !== null) {
                context.beginPath();
                context.setFillStyle(item.color || eachSeries.color);
                var startX = item.x - item.width / 2;
                var height = opts.height - item.y - opts.area[2];
                context.moveTo(startX, item.y);
                context.fillRect(startX, item.y, item.width, height);
                context.closePath();
                context.fill();
              }
            });
          }
          break;
      }
    });
    if (opts.dataLabel !== false && process === 1) {
      series.forEach(function(eachSeries, seriesIndex) {
        var data = eachSeries.data;
        switch (columnOption.type) {
          case "group":
            var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, process);
            points = fixColumeData(points, eachSpacing, series.length, seriesIndex, config2, opts);
            drawPointText(points, eachSeries, config2, context);
            break;
          case "stack":
            var points = getStackDataPoints(
              data,
              minRange,
              maxRange,
              xAxisPoints,
              eachSpacing,
              opts,
              config2,
              seriesIndex,
              series,
              process
            );
            drawPointText(points, eachSeries, config2, context);
            break;
          case "meter":
            var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, process);
            drawPointText(points, eachSeries, config2, context);
            break;
        }
      });
    }
    context.restore();
    return {
      xAxisPoints,
      calPoints,
      eachSpacing,
      minRange,
      maxRange
    };
  }
  function drawCandleDataPoints(series, seriesMA, opts, config2, context) {
    var process = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : 1;
    var candleOption = assign$2({}, {
      color: {},
      average: {}
    }, opts.extra.candle);
    candleOption.color = assign$2({}, {
      upLine: "#f04864",
      upFill: "#f04864",
      downLine: "#2fc25b",
      downFill: "#2fc25b"
    }, candleOption.color);
    candleOption.average = assign$2({}, {
      show: false,
      name: [],
      day: [],
      color: config2.colors
    }, candleOption.average);
    opts.extra.candle = candleOption;
    let ranges = [].concat(opts.chartData.yAxisData.ranges);
    let xAxisData = opts.chartData.xAxisData, xAxisPoints = xAxisData.xAxisPoints, eachSpacing = xAxisData.eachSpacing;
    let minRange = ranges.pop();
    let maxRange = ranges.shift();
    let calPoints = [];
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
      context.translate(opts._scrollDistance_, 0);
    }
    if (candleOption.average.show) {
      seriesMA.forEach(function(eachSeries, seriesIndex) {
        var data = eachSeries.data;
        var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, process);
        var splitPointList = splitPoints(points);
        splitPointList.forEach(function(points2, index2) {
          context.beginPath();
          context.setStrokeStyle(eachSeries.color);
          context.setLineWidth(1);
          if (points2.length === 1) {
            context.moveTo(points2[0].x, points2[0].y);
            context.arc(points2[0].x, points2[0].y, 1, 0, 2 * Math.PI);
          } else {
            context.moveTo(points2[0].x, points2[0].y);
            points2.forEach(function(item, index3) {
              if (index3 > 0) {
                var ctrlPoint = createCurveControlPoints(points2, index3 - 1);
                context.bezierCurveTo(
                  ctrlPoint.ctrA.x,
                  ctrlPoint.ctrA.y,
                  ctrlPoint.ctrB.x,
                  ctrlPoint.ctrB.y,
                  item.x,
                  item.y
                );
              }
            });
            context.moveTo(points2[0].x, points2[0].y);
          }
          context.closePath();
          context.stroke();
        });
      });
    }
    series.forEach(function(eachSeries, seriesIndex) {
      var data = eachSeries.data;
      var points = getCandleDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, process);
      calPoints.push(points);
      var splitPointList = splitPoints(points);
      splitPointList = splitPointList[0];
      splitPointList.forEach(function(points2, index2) {
        context.beginPath();
        if (data[index2][1] - data[index2][0] > 0) {
          context.setStrokeStyle(candleOption.color.upLine);
          context.setFillStyle(candleOption.color.upFill);
          context.setLineWidth(1 * opts.pixelRatio);
          context.moveTo(points2[3].x, points2[3].y);
          context.lineTo(points2[1].x, points2[1].y);
          context.lineTo(points2[1].x - eachSpacing / 4, points2[1].y);
          context.lineTo(points2[0].x - eachSpacing / 4, points2[0].y);
          context.lineTo(points2[0].x, points2[0].y);
          context.lineTo(points2[2].x, points2[2].y);
          context.lineTo(points2[0].x, points2[0].y);
          context.lineTo(points2[0].x + eachSpacing / 4, points2[0].y);
          context.lineTo(points2[1].x + eachSpacing / 4, points2[1].y);
          context.lineTo(points2[1].x, points2[1].y);
          context.moveTo(points2[3].x, points2[3].y);
        } else {
          context.setStrokeStyle(candleOption.color.downLine);
          context.setFillStyle(candleOption.color.downFill);
          context.setLineWidth(1 * opts.pixelRatio);
          context.moveTo(points2[3].x, points2[3].y);
          context.lineTo(points2[0].x, points2[0].y);
          context.lineTo(points2[0].x - eachSpacing / 4, points2[0].y);
          context.lineTo(points2[1].x - eachSpacing / 4, points2[1].y);
          context.lineTo(points2[1].x, points2[1].y);
          context.lineTo(points2[2].x, points2[2].y);
          context.lineTo(points2[1].x, points2[1].y);
          context.lineTo(points2[1].x + eachSpacing / 4, points2[1].y);
          context.lineTo(points2[0].x + eachSpacing / 4, points2[0].y);
          context.lineTo(points2[0].x, points2[0].y);
          context.moveTo(points2[3].x, points2[3].y);
        }
        context.closePath();
        context.fill();
        context.stroke();
      });
    });
    context.restore();
    return {
      xAxisPoints,
      calPoints,
      eachSpacing,
      minRange,
      maxRange
    };
  }
  function drawAreaDataPoints(series, opts, config2, context) {
    var process = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1;
    var areaOption = assign$2({}, {
      type: "straight",
      opacity: 0.2,
      addLine: false,
      width: 2
    }, opts.extra.area);
    let ranges = [].concat(opts.chartData.yAxisData.ranges);
    let xAxisData = opts.chartData.xAxisData, xAxisPoints = xAxisData.xAxisPoints, eachSpacing = xAxisData.eachSpacing;
    let minRange = ranges.pop();
    let maxRange = ranges.shift();
    let endY = opts.height - opts.area[2];
    let calPoints = [];
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
      context.translate(opts._scrollDistance_, 0);
    }
    series.forEach(function(eachSeries, seriesIndex) {
      let data = eachSeries.data;
      let points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, process);
      calPoints.push(points);
      let splitPointList = splitPoints(points);
      for (let i2 = 0; i2 < splitPointList.length; i2++) {
        let points2 = splitPointList[i2];
        context.beginPath();
        context.setStrokeStyle(hexToRgb(eachSeries.color, areaOption.opacity));
        context.setFillStyle(hexToRgb(eachSeries.color, areaOption.opacity));
        context.setLineWidth(areaOption.width * opts.pixelRatio);
        if (points2.length > 1) {
          let firstPoint = points2[0];
          let lastPoint = points2[points2.length - 1];
          context.moveTo(firstPoint.x, firstPoint.y);
          if (areaOption.type === "curve") {
            points2.forEach(function(item, index2) {
              if (index2 > 0) {
                let ctrlPoint = createCurveControlPoints(points2, index2 - 1);
                context.bezierCurveTo(ctrlPoint.ctrA.x, ctrlPoint.ctrA.y, ctrlPoint.ctrB.x, ctrlPoint.ctrB.y, item.x, item.y);
              }
            });
          } else {
            points2.forEach(function(item, index2) {
              if (index2 > 0) {
                context.lineTo(item.x, item.y);
              }
            });
          }
          context.lineTo(lastPoint.x, endY);
          context.lineTo(firstPoint.x, endY);
          context.lineTo(firstPoint.x, firstPoint.y);
        } else {
          let item = points2[0];
          context.moveTo(item.x - eachSpacing / 2, item.y);
          context.lineTo(item.x + eachSpacing / 2, item.y);
          context.lineTo(item.x + eachSpacing / 2, endY);
          context.lineTo(item.x - eachSpacing / 2, endY);
          context.moveTo(item.x - eachSpacing / 2, item.y);
        }
        context.closePath();
        context.fill();
        if (areaOption.addLine) {
          context.beginPath();
          context.setStrokeStyle(eachSeries.color);
          context.setLineWidth(areaOption.width * opts.pixelRatio);
          if (points2.length === 1) {
            context.moveTo(points2[0].x, points2[0].y);
            context.arc(points2[0].x, points2[0].y, 1, 0, 2 * Math.PI);
          } else {
            context.moveTo(points2[0].x, points2[0].y);
            if (areaOption.type === "curve") {
              points2.forEach(function(item, index2) {
                if (index2 > 0) {
                  let ctrlPoint = createCurveControlPoints(points2, index2 - 1);
                  context.bezierCurveTo(ctrlPoint.ctrA.x, ctrlPoint.ctrA.y, ctrlPoint.ctrB.x, ctrlPoint.ctrB.y, item.x, item.y);
                }
              });
            } else {
              points2.forEach(function(item, index2) {
                if (index2 > 0) {
                  context.lineTo(item.x, item.y);
                }
              });
            }
            context.moveTo(points2[0].x, points2[0].y);
          }
          context.closePath();
          context.stroke();
        }
      }
      if (opts.dataPointShape !== false) {
        var shape = config2.dataPointShape[seriesIndex % config2.dataPointShape.length];
        drawPointShape(points, eachSeries.color, shape, context, opts);
      }
    });
    if (opts.dataLabel !== false && process === 1) {
      series.forEach(function(eachSeries, seriesIndex) {
        var data = eachSeries.data;
        var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, process);
        drawPointText(points, eachSeries, config2, context);
      });
    }
    context.restore();
    return {
      xAxisPoints,
      calPoints,
      eachSpacing,
      minRange,
      maxRange
    };
  }
  function drawLineDataPoints(series, opts, config2, context) {
    var process = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1;
    var lineOption = opts.extra.line || {
      type: "straight",
      width: 2
    };
    lineOption.type = lineOption.type ? lineOption.type : "straight";
    lineOption.width = lineOption.width ? lineOption.width : 2;
    let ranges = [].concat(opts.chartData.yAxisData.ranges);
    let xAxisData = opts.chartData.xAxisData, xAxisPoints = xAxisData.xAxisPoints, eachSpacing = xAxisData.eachSpacing;
    var minRange = ranges.pop();
    var maxRange = ranges.shift();
    var calPoints = [];
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
      context.translate(opts._scrollDistance_, 0);
    }
    series.forEach(function(eachSeries, seriesIndex) {
      var data = eachSeries.data;
      var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, process);
      calPoints.push(points);
      var splitPointList = splitPoints(points);
      splitPointList.forEach(function(points2, index2) {
        context.beginPath();
        context.setStrokeStyle(eachSeries.color);
        context.setLineWidth(lineOption.width * opts.pixelRatio);
        if (points2.length === 1) {
          context.moveTo(points2[0].x, points2[0].y);
          context.arc(points2[0].x, points2[0].y, 1, 0, 2 * Math.PI);
        } else {
          context.moveTo(points2[0].x, points2[0].y);
          if (lineOption.type === "curve") {
            points2.forEach(function(item, index3) {
              if (index3 > 0) {
                var ctrlPoint = createCurveControlPoints(points2, index3 - 1);
                context.bezierCurveTo(
                  ctrlPoint.ctrA.x,
                  ctrlPoint.ctrA.y,
                  ctrlPoint.ctrB.x,
                  ctrlPoint.ctrB.y,
                  item.x,
                  item.y
                );
              }
            });
          } else {
            points2.forEach(function(item, index3) {
              if (index3 > 0) {
                context.lineTo(item.x, item.y);
              }
            });
          }
          context.moveTo(points2[0].x, points2[0].y);
        }
        context.closePath();
        context.stroke();
      });
      if (opts.dataPointShape !== false) {
        var shape = config2.dataPointShape[seriesIndex % config2.dataPointShape.length];
        drawPointShape(points, eachSeries.color, shape, context, opts);
      }
    });
    if (opts.dataLabel !== false && process === 1) {
      series.forEach(function(eachSeries, seriesIndex) {
        var data = eachSeries.data;
        var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, process);
        drawPointText(points, eachSeries, config2, context);
      });
    }
    context.restore();
    return {
      xAxisPoints,
      calPoints,
      eachSpacing,
      minRange,
      maxRange
    };
  }
  function drawMixDataPoints(series, opts, config2, context) {
    let process = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1;
    let ranges = [].concat(opts.chartData.yAxisData.ranges);
    let xAxisData = opts.chartData.xAxisData, xAxisPoints = xAxisData.xAxisPoints, eachSpacing = xAxisData.eachSpacing;
    let minRange = ranges.pop();
    let maxRange = ranges.shift();
    let endY = opts.height - opts.area[2];
    let calPoints = [];
    var columnIndex = 0;
    var columnLength = 0;
    series.forEach(function(eachSeries, seriesIndex) {
      if (eachSeries.type == "column") {
        columnLength += 1;
      }
    });
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
      context.translate(opts._scrollDistance_, 0);
    }
    series.forEach(function(eachSeries, seriesIndex) {
      var data = eachSeries.data;
      var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, process);
      calPoints.push(points);
      if (eachSeries.type == "column") {
        points = fixColumeData(points, eachSpacing, columnLength, columnIndex, config2, opts);
        points.forEach(function(item, index2) {
          if (item !== null) {
            context.beginPath();
            context.setStrokeStyle(item.color || eachSeries.color);
            context.setLineWidth(1);
            context.setFillStyle(item.color || eachSeries.color);
            var startX = item.x - item.width / 2;
            opts.height - item.y - opts.area[2];
            context.moveTo(startX, item.y);
            context.moveTo(startX - 1, item.y);
            context.lineTo(startX + item.width - 2, item.y);
            context.lineTo(startX + item.width - 2, opts.height - opts.area[2]);
            context.lineTo(startX, opts.height - opts.area[2]);
            context.lineTo(startX, item.y);
            context.closePath();
            context.stroke();
            context.fill();
            context.closePath();
            context.fill();
          }
        });
        columnIndex += 1;
      }
      if (eachSeries.type == "area") {
        let splitPointList2 = splitPoints(points);
        for (let i2 = 0; i2 < splitPointList2.length; i2++) {
          let points2 = splitPointList2[i2];
          context.beginPath();
          context.setStrokeStyle(eachSeries.color);
          context.setFillStyle(hexToRgb(eachSeries.color, 0.2));
          context.setLineWidth(2 * opts.pixelRatio);
          if (points2.length > 1) {
            var firstPoint = points2[0];
            let lastPoint = points2[points2.length - 1];
            context.moveTo(firstPoint.x, firstPoint.y);
            if (eachSeries.style === "curve") {
              points2.forEach(function(item, index2) {
                if (index2 > 0) {
                  var ctrlPoint = createCurveControlPoints(points2, index2 - 1);
                  context.bezierCurveTo(ctrlPoint.ctrA.x, ctrlPoint.ctrA.y, ctrlPoint.ctrB.x, ctrlPoint.ctrB.y, item.x, item.y);
                }
              });
            } else {
              points2.forEach(function(item, index2) {
                if (index2 > 0) {
                  context.lineTo(item.x, item.y);
                }
              });
            }
            context.lineTo(lastPoint.x, endY);
            context.lineTo(firstPoint.x, endY);
            context.lineTo(firstPoint.x, firstPoint.y);
          } else {
            let item = points2[0];
            context.moveTo(item.x - eachSpacing / 2, item.y);
            context.lineTo(item.x + eachSpacing / 2, item.y);
            context.lineTo(item.x + eachSpacing / 2, endY);
            context.lineTo(item.x - eachSpacing / 2, endY);
            context.moveTo(item.x - eachSpacing / 2, item.y);
          }
          context.closePath();
          context.fill();
        }
      }
      if (eachSeries.type == "line") {
        var splitPointList = splitPoints(points);
        splitPointList.forEach(function(points2, index2) {
          context.beginPath();
          context.setStrokeStyle(eachSeries.color);
          context.setLineWidth(2 * opts.pixelRatio);
          if (points2.length === 1) {
            context.moveTo(points2[0].x, points2[0].y);
            context.arc(points2[0].x, points2[0].y, 1, 0, 2 * Math.PI);
          } else {
            context.moveTo(points2[0].x, points2[0].y);
            if (eachSeries.style == "curve") {
              points2.forEach(function(item, index3) {
                if (index3 > 0) {
                  var ctrlPoint = createCurveControlPoints(points2, index3 - 1);
                  context.bezierCurveTo(
                    ctrlPoint.ctrA.x,
                    ctrlPoint.ctrA.y,
                    ctrlPoint.ctrB.x,
                    ctrlPoint.ctrB.y,
                    item.x,
                    item.y
                  );
                }
              });
            } else {
              points2.forEach(function(item, index3) {
                if (index3 > 0) {
                  context.lineTo(item.x, item.y);
                }
              });
            }
            context.moveTo(points2[0].x, points2[0].y);
          }
          context.closePath();
          context.stroke();
        });
      }
      if (eachSeries.type == "point") {
        points.forEach(function(pointsa, index2) {
          if (pointsa) {
            context.beginPath();
            context.setFillStyle(eachSeries.color);
            context.setStrokeStyle("#FFFFFF");
            context.setLineWidth(1 * opts.pixelRatio);
            context.moveTo(pointsa.x + 3.5 * opts.pixelRatio, pointsa.y);
            context.arc(pointsa.x, pointsa.y, 4 * opts.pixelRatio, 0, 2 * Math.PI);
            context.closePath();
            context.fill();
            context.stroke();
          }
        });
      }
      if (eachSeries.addPoint == true && eachSeries.type !== "column") {
        var shape = config2.dataPointShape[seriesIndex % config2.dataPointShape.length];
        drawPointShape(points, eachSeries.color, shape, context, opts);
      }
    });
    if (opts.dataLabel !== false && process === 1) {
      var columnIndex = 0;
      series.forEach(function(eachSeries, seriesIndex) {
        var data = eachSeries.data;
        var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config2, process);
        if (eachSeries.type !== "column") {
          drawPointText(points, eachSeries, config2, context);
        } else {
          points = fixColumeData(points, eachSpacing, columnLength, columnIndex, config2, opts);
          drawPointText(points, eachSeries, config2, context);
          columnIndex += 1;
        }
      });
    }
    context.restore();
    return {
      xAxisPoints,
      calPoints,
      eachSpacing,
      minRange,
      maxRange
    };
  }
  function drawToolTipBridge(opts, config2, context, process, eachSpacing, xAxisPoints) {
    var toolTipOption = opts.extra.tooltip || {};
    if (toolTipOption.horizentalLine && opts.tooltip && process === 1 && (opts.type == "line" || opts.type == "area" || opts.type == "column" || opts.type == "candle" || opts.type == "mix")) {
      drawToolTipHorizentalLine(opts, config2, context);
    }
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0 && opts.enableScroll === true) {
      context.translate(opts._scrollDistance_, 0);
    }
    if (opts.tooltip && opts.tooltip.textList && opts.tooltip.textList.length && process === 1) {
      drawToolTip(opts.tooltip.textList, opts.tooltip.offset, opts, config2, context);
    }
    context.restore();
  }
  function drawXAxis(categories, opts, config2, context) {
    let xAxisData = opts.chartData.xAxisData, xAxisPoints = xAxisData.xAxisPoints, startX = xAxisData.startX, endX = xAxisData.endX, eachSpacing = xAxisData.eachSpacing;
    var boundaryGap = "center";
    if (opts.type == "line" || opts.type == "area") {
      boundaryGap = opts.xAxis.boundaryGap;
    }
    var startY = opts.height - opts.area[2];
    var endY = opts.area[0];
    if (opts.enableScroll && opts.xAxis.scrollShow) {
      var scrollY = opts.height - opts.area[2] + config2.xAxisHeight;
      var scrollScreenWidth = endX - startX;
      var scrollTotalWidth = eachSpacing * (xAxisPoints.length - 1);
      var scrollWidth = scrollScreenWidth * scrollScreenWidth / scrollTotalWidth;
      var scrollLeft = 0;
      if (opts._scrollDistance_) {
        scrollLeft = -opts._scrollDistance_ * scrollScreenWidth / scrollTotalWidth;
      }
      context.beginPath();
      context.setLineCap("round");
      context.setLineWidth(6 * opts.pixelRatio);
      context.setStrokeStyle(opts.xAxis.scrollBackgroundColor || "#EFEBEF");
      context.moveTo(startX, scrollY);
      context.lineTo(endX, scrollY);
      context.stroke();
      context.closePath();
      context.beginPath();
      context.setLineCap("round");
      context.setLineWidth(6 * opts.pixelRatio);
      context.setStrokeStyle(opts.xAxis.scrollColor || "#A6A6A6");
      context.moveTo(startX + scrollLeft, scrollY);
      context.lineTo(startX + scrollLeft + scrollWidth, scrollY);
      context.stroke();
      context.closePath();
      context.setLineCap("butt");
    }
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0) {
      context.translate(opts._scrollDistance_, 0);
    }
    if (opts.xAxis.disableGrid !== true) {
      context.setStrokeStyle(opts.xAxis.gridColor || "#cccccc");
      context.setLineCap("butt");
      context.setLineWidth(1 * opts.pixelRatio);
      if (opts.xAxis.gridType == "dash") {
        context.setLineDash([opts.xAxis.dashLength, opts.xAxis.dashLength]);
      }
      if (opts.xAxis.type === "calibration") {
        xAxisPoints.forEach(function(item, index2) {
          if (index2 > 0) {
            context.beginPath();
            context.moveTo(item - eachSpacing / 2, startY);
            context.lineTo(item - eachSpacing / 2, startY + 4 * opts.pixelRatio);
            context.closePath();
            context.stroke();
          }
        });
      } else {
        opts.xAxis.gridEval = opts.xAxis.gridEval || 1;
        xAxisPoints.forEach(function(item, index2) {
          if (index2 % opts.xAxis.gridEval == 0) {
            context.beginPath();
            context.moveTo(item, startY);
            context.lineTo(item, endY);
            context.stroke();
          }
        });
      }
      context.setLineDash([]);
    }
    if (opts.xAxis.disabled !== true) {
      opts.width - opts.padding[1] - opts.padding[3] - config2.yAxisWidth - config2.yAxisTitleWidth;
      let maxXAxisListLength = categories.length;
      if (opts.xAxis.labelCount) {
        if (opts.xAxis.itemCount) {
          maxXAxisListLength = Math.ceil(categories.length / opts.xAxis.itemCount * opts.xAxis.labelCount);
        } else {
          maxXAxisListLength = opts.xAxis.labelCount;
        }
        maxXAxisListLength -= 1;
      }
      let ratio = Math.ceil(categories.length / maxXAxisListLength);
      let newCategories = [];
      let cgLength = categories.length;
      for (let i2 = 0; i2 < cgLength; i2++) {
        if (i2 % ratio !== 0) {
          newCategories.push("");
        } else {
          newCategories.push(categories[i2]);
        }
      }
      newCategories[cgLength - 1] = categories[cgLength - 1];
      var xAxisFontSize = opts.xAxis.fontSize || config2.fontSize;
      if (config2._xAxisTextAngle_ === 0) {
        newCategories.forEach(function(item, index2) {
          var itemStr = item;
          var line1 = itemStr;
          var line2 = "";
          if (typeof itemStr === "string" && itemStr.indexOf("|") !== -1) {
            var parts = itemStr.split("|");
            line1 = parts[0] || "";
            line2 = parts[1] || "";
          }
          var maxLineWidth = Math.max(measureText(line1, xAxisFontSize), measureText(line2, xAxisFontSize));
          var offset = -maxLineWidth / 2;
          if (boundaryGap == "center") {
            offset += eachSpacing / 2;
          }
          context.beginPath();
          context.setFontSize(xAxisFontSize);
          context.setFillStyle(opts.xAxis.fontColor || "#666666");
          context.fillText(line1, xAxisPoints[index2] + offset, startY + xAxisFontSize + (config2.xAxisHeight - xAxisFontSize) / 2);
          if (line2) {
            context.fillText(line2, xAxisPoints[index2] + offset, startY + xAxisFontSize * 2 + (config2.xAxisHeight - xAxisFontSize) / 2);
          }
          context.closePath();
          context.stroke();
        });
      } else {
        newCategories.forEach(function(item, index2) {
          context.save();
          context.beginPath();
          context.setFontSize(xAxisFontSize);
          context.setFillStyle(opts.xAxis.fontColor || "#666666");
          var textWidth = measureText(item);
          var offset = -textWidth;
          if (boundaryGap == "center") {
            offset += eachSpacing / 2;
          }
          var _calRotateTranslate = calRotateTranslate(xAxisPoints[index2] + eachSpacing / 2, startY + xAxisFontSize / 2 + 5, opts.height), transX = _calRotateTranslate.transX, transY = _calRotateTranslate.transY;
          context.rotate(-1 * config2._xAxisTextAngle_);
          context.translate(transX, transY);
          context.fillText(item, xAxisPoints[index2] + offset, startY + xAxisFontSize + 5);
          context.closePath();
          context.stroke();
          context.restore();
        });
      }
    }
    context.restore();
  }
  function drawYAxisGrid(categories, opts, config2, context) {
    if (opts.yAxis.disableGrid === true) {
      return;
    }
    let spacingValid = opts.height - opts.area[0] - opts.area[2];
    let eachSpacing = spacingValid / config2.yAxisSplit;
    let startX = opts.area[3];
    let xAxisPoints = opts.chartData.xAxisData.xAxisPoints, xAxiseachSpacing = opts.chartData.xAxisData.eachSpacing;
    let TotalWidth = xAxiseachSpacing * (xAxisPoints.length - 1);
    let endX = startX + TotalWidth;
    let points = [];
    for (let i2 = 0; i2 < config2.yAxisSplit + 1; i2++) {
      points.push(opts.height - opts.area[2] - eachSpacing * i2);
    }
    context.save();
    if (opts._scrollDistance_ && opts._scrollDistance_ !== 0) {
      context.translate(opts._scrollDistance_, 0);
    }
    if (opts.yAxis.gridType == "dash") {
      context.setLineDash([opts.yAxis.dashLength, opts.yAxis.dashLength]);
    }
    context.setStrokeStyle(opts.yAxis.gridColor || "#cccccc");
    context.setLineWidth(1 * opts.pixelRatio);
    points.forEach(function(item, index2) {
      context.beginPath();
      context.moveTo(startX, item);
      context.lineTo(endX, item);
      context.stroke();
    });
    context.setLineDash([]);
    context.restore();
  }
  function drawYAxis(series, opts, config2, context) {
    if (opts.yAxis.disabled === true) {
      return;
    }
    let rangesFormat = opts.chartData.yAxisData.rangesFormat;
    var spacingValid = opts.height - opts.area[0] - opts.area[2];
    var eachSpacing = Math.floor(spacingValid / config2.yAxisSplit);
    var startX = opts.area[3];
    var endX = opts.width - opts.area[1];
    var endY = opts.height - opts.area[2];
    var fillEndY = endY + config2.xAxisHeight;
    if (opts.xAxis.scrollShow) {
      fillEndY -= 3 * opts.pixelRatio;
    }
    context.beginPath();
    context.setFillStyle(opts.background || "#ffffff");
    if (opts._scrollDistance_ < 0) {
      context.fillRect(0, 0, startX, fillEndY);
    }
    if (opts.enableScroll == true) {
      context.fillRect(endX, 0, opts.width, fillEndY);
    }
    context.closePath();
    context.stroke();
    var points = [];
    for (var i2 = 0; i2 <= config2.yAxisSplit; i2++) {
      points.push(opts.area[0] + eachSpacing * i2);
    }
    var yAxisFontSize = opts.yAxis.fontSize || config2.fontSize;
    rangesFormat.forEach(function(item, index2) {
      var pos = points[index2] ? points[index2] : endY;
      context.beginPath();
      context.setFontSize(yAxisFontSize);
      context.setFillStyle(opts.yAxis.fontColor || "#666666");
      context.fillText(String(item), opts.area[3] - config2.yAxisWidth, pos + yAxisFontSize / 2);
      context.closePath();
      context.stroke();
    });
    if (opts.yAxis.title) {
      drawYAxisTitle(opts.yAxis.title, opts, config2, context);
    }
  }
  function drawLegend(series, opts, config2, context, chartData) {
    if (opts.legend.show === false) {
      return;
    }
    let legendData = chartData.legendData;
    let legendList = legendData.points;
    let legendArea = legendData.area;
    let padding = opts.legend.padding;
    let fontSize = opts.legend.fontSize;
    let shapeWidth = 15 * opts.pixelRatio;
    let shapeRight = 5 * opts.pixelRatio;
    let itemGap = opts.legend.itemGap;
    let lineHeight = Math.max(opts.legend.lineHeight * opts.pixelRatio, fontSize);
    context.beginPath();
    context.setLineWidth(opts.legend.borderWidth);
    context.setStrokeStyle(opts.legend.borderColor);
    context.setFillStyle(opts.legend.backgroundColor);
    context.moveTo(legendArea.start.x, legendArea.start.y);
    context.rect(legendArea.start.x, legendArea.start.y, legendArea.width, legendArea.height);
    context.closePath();
    context.fill();
    context.stroke();
    legendList.forEach(function(itemList, listIndex) {
      let width = 0;
      let height = 0;
      width = legendData.widthArr[listIndex];
      height = legendData.heightArr[listIndex];
      let startX = 0;
      let startY = 0;
      if (opts.legend.position == "top" || opts.legend.position == "bottom") {
        startX = legendArea.start.x + (legendArea.width - width) / 2;
        startY = legendArea.start.y + padding + listIndex * lineHeight;
      } else {
        if (listIndex == 0) {
          width = 0;
        } else {
          width = legendData.widthArr[listIndex - 1];
        }
        startX = legendArea.start.x + padding + width;
        startY = legendArea.start.y + padding + (legendArea.height - height) / 2;
      }
      context.setFontSize(config2.fontSize);
      for (let i2 = 0; i2 < itemList.length; i2++) {
        let item = itemList[i2];
        item.area = [0, 0, 0, 0];
        item.area[0] = startX;
        item.area[1] = startY;
        item.area[3] = startY + lineHeight;
        context.beginPath();
        context.setLineWidth(1 * opts.pixelRatio);
        context.setStrokeStyle(item.show ? item.color : opts.legend.hiddenColor);
        context.setFillStyle(item.show ? item.color : opts.legend.hiddenColor);
        switch (item.legendShape) {
          case "line":
            context.moveTo(startX, startY + 0.5 * lineHeight - 2 * opts.pixelRatio);
            context.fillRect(startX, startY + 0.5 * lineHeight - 2 * opts.pixelRatio, 15 * opts.pixelRatio, 4 * opts.pixelRatio);
            break;
          case "triangle":
            context.moveTo(startX + 7.5 * opts.pixelRatio, startY + 0.5 * lineHeight - 5 * opts.pixelRatio);
            context.lineTo(startX + 2.5 * opts.pixelRatio, startY + 0.5 * lineHeight + 5 * opts.pixelRatio);
            context.lineTo(startX + 12.5 * opts.pixelRatio, startY + 0.5 * lineHeight + 5 * opts.pixelRatio);
            context.lineTo(startX + 7.5 * opts.pixelRatio, startY + 0.5 * lineHeight - 5 * opts.pixelRatio);
            break;
          case "diamond":
            context.moveTo(startX + 7.5 * opts.pixelRatio, startY + 0.5 * lineHeight - 5 * opts.pixelRatio);
            context.lineTo(startX + 2.5 * opts.pixelRatio, startY + 0.5 * lineHeight);
            context.lineTo(startX + 7.5 * opts.pixelRatio, startY + 0.5 * lineHeight + 5 * opts.pixelRatio);
            context.lineTo(startX + 12.5 * opts.pixelRatio, startY + 0.5 * lineHeight);
            context.lineTo(startX + 7.5 * opts.pixelRatio, startY + 0.5 * lineHeight - 5 * opts.pixelRatio);
            break;
          case "circle":
            context.moveTo(startX + 7.5 * opts.pixelRatio, startY + 0.5 * lineHeight);
            context.arc(startX + 7.5 * opts.pixelRatio, startY + 0.5 * lineHeight, 5 * opts.pixelRatio, 0, 2 * Math.PI);
            break;
          case "rect":
            context.moveTo(startX, startY + 0.5 * lineHeight - 5 * opts.pixelRatio);
            context.fillRect(startX, startY + 0.5 * lineHeight - 5 * opts.pixelRatio, 15 * opts.pixelRatio, 10 * opts.pixelRatio);
            break;
          default:
            context.moveTo(startX, startY + 0.5 * lineHeight - 5 * opts.pixelRatio);
            context.fillRect(startX, startY + 0.5 * lineHeight - 5 * opts.pixelRatio, 15 * opts.pixelRatio, 10 * opts.pixelRatio);
        }
        context.closePath();
        context.fill();
        context.stroke();
        startX += shapeWidth + shapeRight;
        let fontTrans = 0.5 * lineHeight + 0.5 * fontSize - 2;
        context.beginPath();
        context.setFontSize(fontSize);
        context.setFillStyle(item.show ? opts.legend.fontColor : opts.legend.hiddenColor);
        context.fillText(item.name, startX, startY + fontTrans);
        context.closePath();
        context.stroke();
        if (opts.legend.position == "top" || opts.legend.position == "bottom") {
          startX += measureText(item.name, fontSize) + itemGap;
          item.area[2] = startX;
        } else {
          item.area[2] = startX + measureText(item.name, fontSize) + itemGap;
          startX -= shapeWidth + shapeRight;
          startY += lineHeight;
        }
      }
    });
  }
  function drawPieDataPoints(series, opts, config2, context) {
    var process = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1;
    var pieOption = assign$2({}, {
      activeOpacity: 0.5,
      activeRadius: 10 * opts.pixelRatio,
      offsetAngle: 0,
      labelWidth: 15 * opts.pixelRatio,
      ringWidth: 0,
      border: false,
      borderWidth: 2,
      borderColor: "#FFFFFF"
    }, opts.extra.pie);
    var centerPosition = {
      x: opts.area[3] + (opts.width - opts.area[1] - opts.area[3]) / 2,
      y: opts.area[0] + (opts.height - opts.area[0] - opts.area[2]) / 2
    };
    if (config2.pieChartLinePadding == 0) {
      config2.pieChartLinePadding = pieOption.activeRadius;
    }
    var radius = Math.min((opts.width - opts.area[1] - opts.area[3]) / 2 - config2.pieChartLinePadding - config2.pieChartTextPadding - config2._pieTextMaxLength_, (opts.height - opts.area[0] - opts.area[2]) / 2 - config2.pieChartLinePadding - config2.pieChartTextPadding);
    series = getPieDataPoints(series, radius, process);
    var activeRadius = pieOption.activeRadius;
    series = series.map(function(eachSeries) {
      eachSeries._start_ += pieOption.offsetAngle * Math.PI / 180;
      return eachSeries;
    });
    series.forEach(function(eachSeries, seriesIndex) {
      if (opts.tooltip) {
        if (opts.tooltip.index == seriesIndex) {
          context.beginPath();
          context.setFillStyle(hexToRgb(eachSeries.color, opts.extra.pie.activeOpacity || 0.5));
          context.moveTo(centerPosition.x, centerPosition.y);
          context.arc(
            centerPosition.x,
            centerPosition.y,
            eachSeries._radius_ + activeRadius,
            eachSeries._start_,
            eachSeries._start_ + 2 * eachSeries._proportion_ * Math.PI
          );
          context.closePath();
          context.fill();
        }
      }
      context.beginPath();
      context.setLineWidth(pieOption.borderWidth * opts.pixelRatio);
      context.lineJoin = "round";
      context.setStrokeStyle(pieOption.borderColor);
      context.setFillStyle(eachSeries.color);
      context.moveTo(centerPosition.x, centerPosition.y);
      context.arc(centerPosition.x, centerPosition.y, eachSeries._radius_, eachSeries._start_, eachSeries._start_ + 2 * eachSeries._proportion_ * Math.PI);
      context.closePath();
      context.fill();
      if (pieOption.border == true) {
        context.stroke();
      }
    });
    if (opts.type === "ring") {
      var innerPieWidth = radius * 0.6;
      if (typeof opts.extra.pie.ringWidth === "number" && opts.extra.pie.ringWidth > 0) {
        innerPieWidth = Math.max(0, radius - opts.extra.pie.ringWidth);
      }
      context.beginPath();
      context.setFillStyle(opts.background || "#ffffff");
      context.moveTo(centerPosition.x, centerPosition.y);
      context.arc(centerPosition.x, centerPosition.y, innerPieWidth, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
    }
    if (opts.dataLabel !== false && process === 1) {
      var valid = false;
      for (var i2 = 0, len = series.length; i2 < len; i2++) {
        if (series[i2].data > 0) {
          valid = true;
          break;
        }
      }
      if (valid) {
        drawPieText(series, opts, config2, context, radius, centerPosition);
      }
    }
    if (process === 1 && opts.type === "ring") {
      drawRingTitle(opts, config2, context, centerPosition);
    }
    return {
      center: centerPosition,
      radius,
      series
    };
  }
  function drawRoseDataPoints(series, opts, config2, context) {
    var process = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1;
    var roseOption = assign$2({}, {
      type: "area",
      activeOpacity: 0.5,
      activeRadius: 10 * opts.pixelRatio,
      offsetAngle: 0,
      labelWidth: 15 * opts.pixelRatio,
      border: false,
      borderWidth: 2,
      borderColor: "#FFFFFF"
    }, opts.extra.rose);
    if (config2.pieChartLinePadding == 0) {
      config2.pieChartLinePadding = roseOption.activeRadius;
    }
    var centerPosition = {
      x: opts.area[3] + (opts.width - opts.area[1] - opts.area[3]) / 2,
      y: opts.area[0] + (opts.height - opts.area[0] - opts.area[2]) / 2
    };
    var radius = Math.min((opts.width - opts.area[1] - opts.area[3]) / 2 - config2.pieChartLinePadding - config2.pieChartTextPadding - config2._pieTextMaxLength_, (opts.height - opts.area[0] - opts.area[2]) / 2 - config2.pieChartLinePadding - config2.pieChartTextPadding);
    var minRadius = roseOption.minRadius || radius * 0.5;
    series = getRoseDataPoints(series, roseOption.type, minRadius, radius, process);
    var activeRadius = roseOption.activeRadius;
    series = series.map(function(eachSeries) {
      eachSeries._start_ += (roseOption.offsetAngle || 0) * Math.PI / 180;
      return eachSeries;
    });
    series.forEach(function(eachSeries, seriesIndex) {
      if (opts.tooltip) {
        if (opts.tooltip.index == seriesIndex) {
          context.beginPath();
          context.setFillStyle(hexToRgb(eachSeries.color, roseOption.activeOpacity || 0.5));
          context.moveTo(centerPosition.x, centerPosition.y);
          context.arc(
            centerPosition.x,
            centerPosition.y,
            activeRadius + eachSeries._radius_,
            eachSeries._start_,
            eachSeries._start_ + 2 * eachSeries._rose_proportion_ * Math.PI
          );
          context.closePath();
          context.fill();
        }
      }
      context.beginPath();
      context.setLineWidth(roseOption.borderWidth * opts.pixelRatio);
      context.lineJoin = "round";
      context.setStrokeStyle(roseOption.borderColor);
      context.setFillStyle(eachSeries.color);
      context.moveTo(centerPosition.x, centerPosition.y);
      context.arc(centerPosition.x, centerPosition.y, eachSeries._radius_, eachSeries._start_, eachSeries._start_ + 2 * eachSeries._rose_proportion_ * Math.PI);
      context.closePath();
      context.fill();
      if (roseOption.border == true) {
        context.stroke();
      }
    });
    if (opts.dataLabel !== false && process === 1) {
      var valid = false;
      for (var i2 = 0, len = series.length; i2 < len; i2++) {
        if (series[i2].data > 0) {
          valid = true;
          break;
        }
      }
      if (valid) {
        drawPieText(series, opts, config2, context, radius, centerPosition);
      }
    }
    return {
      center: centerPosition,
      radius,
      series
    };
  }
  function drawArcbarDataPoints(series, opts, config2, context) {
    var process = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1;
    var arcbarOption = assign$2({}, {
      startAngle: 0.75,
      endAngle: 0.25,
      type: "default",
      width: 12 * opts.pixelRatio
    }, opts.extra.arcbar);
    series = getArcbarDataPoints(series, arcbarOption, process);
    var centerPosition = {
      x: opts.width / 2,
      y: opts.height / 2
    };
    var radius = Math.min(centerPosition.x, centerPosition.y);
    radius -= 5 * opts.pixelRatio;
    radius -= arcbarOption.width / 2;
    context.setLineWidth(arcbarOption.width);
    context.setStrokeStyle(arcbarOption.backgroundColor || "#E9E9E9");
    context.setLineCap("round");
    context.beginPath();
    if (arcbarOption.type == "default") {
      context.arc(centerPosition.x, centerPosition.y, radius, arcbarOption.startAngle * Math.PI, arcbarOption.endAngle * Math.PI, false);
    } else {
      context.arc(centerPosition.x, centerPosition.y, radius, 0, 2 * Math.PI, false);
    }
    context.stroke();
    for (let i2 = 0; i2 < series.length; i2++) {
      let eachSeries = series[i2];
      context.setLineWidth(arcbarOption.width);
      context.setStrokeStyle(eachSeries.color);
      context.setLineCap("round");
      context.beginPath();
      context.arc(centerPosition.x, centerPosition.y, radius, arcbarOption.startAngle * Math.PI, eachSeries._proportion_ * Math.PI, false);
      context.stroke();
    }
    drawRingTitle(opts, config2, context, centerPosition);
    return {
      center: centerPosition,
      radius,
      series
    };
  }
  function drawGaugeDataPoints(categories, series, opts, config2, context) {
    var process = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : 1;
    var gaugeOption = assign$2({}, {
      startAngle: 0.75,
      endAngle: 0.25,
      width: 15,
      splitLine: {
        fixRadius: 0,
        splitNumber: 10,
        width: 15,
        color: "#FFFFFF",
        childNumber: 5,
        childWidth: 5
      },
      pointer: {
        width: 15,
        color: "auto"
      }
    }, opts.extra.gauge);
    if (gaugeOption.oldAngle == void 0) {
      gaugeOption.oldAngle = gaugeOption.startAngle;
    }
    if (gaugeOption.oldData == void 0) {
      gaugeOption.oldData = 0;
    }
    categories = getGaugeAxisPoints(categories, gaugeOption.startAngle, gaugeOption.endAngle);
    var centerPosition = {
      x: opts.width / 2,
      y: opts.height / 2
    };
    var radius = Math.min(centerPosition.x, centerPosition.y);
    radius -= 5 * opts.pixelRatio;
    radius -= gaugeOption.width / 2;
    var innerRadius = radius - gaugeOption.width;
    context.setLineWidth(gaugeOption.width);
    context.setLineCap("butt");
    for (let i2 = 0; i2 < categories.length; i2++) {
      let eachCategories = categories[i2];
      context.beginPath();
      context.setStrokeStyle(eachCategories.color);
      context.arc(centerPosition.x, centerPosition.y, radius, eachCategories._startAngle_ * Math.PI, eachCategories._endAngle_ * Math.PI, false);
      context.stroke();
    }
    context.save();
    let totalAngle = gaugeOption.startAngle - gaugeOption.endAngle + 1;
    let splitAngle = totalAngle / gaugeOption.splitLine.splitNumber;
    let childAngle = totalAngle / gaugeOption.splitLine.splitNumber / gaugeOption.splitLine.childNumber;
    let startX = -radius - gaugeOption.width * 0.5 - gaugeOption.splitLine.fixRadius;
    let endX = -radius - gaugeOption.width * 0.5 - gaugeOption.splitLine.fixRadius + gaugeOption.splitLine.width;
    let childendX = -radius - gaugeOption.width * 0.5 - gaugeOption.splitLine.fixRadius + gaugeOption.splitLine.childWidth;
    context.translate(centerPosition.x, centerPosition.y);
    context.rotate((gaugeOption.startAngle - 1) * Math.PI);
    for (let i2 = 0; i2 < gaugeOption.splitLine.splitNumber + 1; i2++) {
      context.beginPath();
      context.setStrokeStyle(gaugeOption.splitLine.color);
      context.setLineWidth(2 * opts.pixelRatio);
      context.moveTo(startX, 0);
      context.lineTo(endX, 0);
      context.stroke();
      context.rotate(splitAngle * Math.PI);
    }
    context.restore();
    context.save();
    context.translate(centerPosition.x, centerPosition.y);
    context.rotate((gaugeOption.startAngle - 1) * Math.PI);
    for (let i2 = 0; i2 < gaugeOption.splitLine.splitNumber * gaugeOption.splitLine.childNumber + 1; i2++) {
      context.beginPath();
      context.setStrokeStyle(gaugeOption.splitLine.color);
      context.setLineWidth(1 * opts.pixelRatio);
      context.moveTo(startX, 0);
      context.lineTo(childendX, 0);
      context.stroke();
      context.rotate(childAngle * Math.PI);
    }
    context.restore();
    series = getGaugeDataPoints(series, categories, gaugeOption, process);
    for (let i2 = 0; i2 < series.length; i2++) {
      let eachSeries = series[i2];
      context.save();
      context.translate(centerPosition.x, centerPosition.y);
      context.rotate((eachSeries._proportion_ - 1) * Math.PI);
      context.beginPath();
      context.setFillStyle(eachSeries.color);
      context.moveTo(gaugeOption.pointer.width, 0);
      context.lineTo(0, -gaugeOption.pointer.width / 2);
      context.lineTo(-innerRadius, 0);
      context.lineTo(0, gaugeOption.pointer.width / 2);
      context.lineTo(gaugeOption.pointer.width, 0);
      context.closePath();
      context.fill();
      context.beginPath();
      context.setFillStyle("#FFFFFF");
      context.arc(0, 0, gaugeOption.pointer.width / 6, 0, 2 * Math.PI, false);
      context.fill();
      context.restore();
    }
    if (opts.dataLabel !== false) {
      drawGaugeLabel(gaugeOption, radius, centerPosition, opts, config2, context);
    }
    drawRingTitle(opts, config2, context, centerPosition);
    if (process === 1 && opts.type === "gauge") {
      opts.extra.gauge.oldAngle = series[0]._proportion_;
      opts.extra.gauge.oldData = series[0].data;
    }
    return {
      center: centerPosition,
      radius,
      innerRadius,
      categories,
      totalAngle
    };
  }
  function drawRadarDataPoints(series, opts, config2, context) {
    var process = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1;
    var radarOption = assign$2({}, {
      gridColor: "#cccccc",
      labelColor: "#666666",
      opacity: 0.2
    }, opts.extra.radar);
    var coordinateAngle = getRadarCoordinateSeries(opts.categories.length);
    var centerPosition = {
      x: opts.area[3] + (opts.width - opts.area[1] - opts.area[3]) / 2,
      y: opts.area[0] + (opts.height - opts.area[0] - opts.area[2]) / 2
    };
    var radius = Math.min(
      centerPosition.x - (getMaxTextListLength(opts.categories) + config2.radarLabelTextMargin),
      centerPosition.y - config2.radarLabelTextMargin
    );
    radius -= opts.padding[1];
    context.beginPath();
    context.setLineWidth(1 * opts.pixelRatio);
    context.setStrokeStyle(radarOption.gridColor);
    coordinateAngle.forEach(function(angle) {
      var pos = convertCoordinateOrigin(radius * Math.cos(angle), radius * Math.sin(angle), centerPosition);
      context.moveTo(centerPosition.x, centerPosition.y);
      context.lineTo(pos.x, pos.y);
    });
    context.stroke();
    context.closePath();
    var _loop = function _loop2(i3) {
      var startPos = {};
      context.beginPath();
      context.setLineWidth(1 * opts.pixelRatio);
      context.setStrokeStyle(radarOption.gridColor);
      coordinateAngle.forEach(function(angle, index2) {
        var pos = convertCoordinateOrigin(radius / config2.radarGridCount * i3 * Math.cos(angle), radius / config2.radarGridCount * i3 * Math.sin(angle), centerPosition);
        if (index2 === 0) {
          startPos = pos;
          context.moveTo(pos.x, pos.y);
        } else {
          context.lineTo(pos.x, pos.y);
        }
      });
      context.lineTo(startPos.x, startPos.y);
      context.stroke();
      context.closePath();
    };
    for (var i2 = 1; i2 <= config2.radarGridCount; i2++) {
      _loop(i2);
    }
    var radarDataPoints = getRadarDataPoints(coordinateAngle, centerPosition, radius, series, opts, process);
    radarDataPoints.forEach(function(eachSeries, seriesIndex) {
      context.beginPath();
      context.setFillStyle(hexToRgb(eachSeries.color, radarOption.opacity));
      eachSeries.data.forEach(function(item, index2) {
        if (index2 === 0) {
          context.moveTo(item.position.x, item.position.y);
        } else {
          context.lineTo(item.position.x, item.position.y);
        }
      });
      context.closePath();
      context.fill();
      if (opts.dataPointShape !== false) {
        var shape = config2.dataPointShape[seriesIndex % config2.dataPointShape.length];
        var points = eachSeries.data.map(function(item) {
          return item.position;
        });
        drawPointShape(points, eachSeries.color, shape, context, opts);
      }
    });
    drawRadarLabel(coordinateAngle, radius, centerPosition, opts, config2, context);
    return {
      center: centerPosition,
      radius,
      angleList: coordinateAngle
    };
  }
  function normalInt(min, max, iter) {
    iter = iter == 0 ? 1 : iter;
    var arr = [];
    for (var i2 = 0; i2 < iter; i2++) {
      arr[i2] = Math.random();
    }
    return Math.floor(arr.reduce(function(i3, j2) {
      return i3 + j2;
    }) / iter * (max - min)) + min;
  }
  function collisionNew(area, points, width, height) {
    var isIn = false;
    for (let i2 = 0; i2 < points.length; i2++) {
      if (points[i2].area) {
        if (area[3] < points[i2].area[1] || area[0] > points[i2].area[2] || area[1] > points[i2].area[3] || area[2] < points[i2].area[0]) {
          if (area[0] < 0 || area[1] < 0 || area[2] > width || area[3] > height) {
            isIn = true;
            break;
          } else {
            isIn = false;
          }
        } else {
          isIn = true;
          break;
        }
      }
    }
    return isIn;
  }
  function getBoundingBox(data) {
    var bounds = {}, coords;
    bounds.xMin = 180;
    bounds.xMax = 0;
    bounds.yMin = 90;
    bounds.yMax = 0;
    for (var i2 = 0; i2 < data.length; i2++) {
      var coorda = data[i2].geometry.coordinates;
      for (var k = 0; k < coorda.length; k++) {
        coords = coorda[k];
        if (coords.length == 1) {
          coords = coords[0];
        }
        for (var j2 = 0; j2 < coords.length; j2++) {
          var longitude = coords[j2][0];
          var latitude = coords[j2][1];
          var point = {
            x: longitude,
            y: latitude
          };
          bounds.xMin = bounds.xMin < point.x ? bounds.xMin : point.x;
          bounds.xMax = bounds.xMax > point.x ? bounds.xMax : point.x;
          bounds.yMin = bounds.yMin < point.y ? bounds.yMin : point.y;
          bounds.yMax = bounds.yMax > point.y ? bounds.yMax : point.y;
        }
      }
    }
    return bounds;
  }
  function coordinateToPoint(latitude, longitude, bounds, scale, xoffset, yoffset) {
    return {
      x: (longitude - bounds.xMin) * scale + xoffset,
      y: (bounds.yMax - latitude) * scale + yoffset
    };
  }
  function pointToCoordinate(pointY, pointX, bounds, scale, xoffset, yoffset) {
    return {
      x: (pointX - xoffset) / scale + bounds.xMin,
      y: bounds.yMax - (pointY - yoffset) / scale
    };
  }
  function isRayIntersectsSegment(poi, s_poi, e_poi) {
    if (s_poi[1] == e_poi[1]) {
      return false;
    }
    if (s_poi[1] > poi[1] && e_poi[1] > poi[1]) {
      return false;
    }
    if (s_poi[1] < poi[1] && e_poi[1] < poi[1]) {
      return false;
    }
    if (s_poi[1] == poi[1] && e_poi[1] > poi[1]) {
      return false;
    }
    if (e_poi[1] == poi[1] && s_poi[1] > poi[1]) {
      return false;
    }
    if (s_poi[0] < poi[0] && e_poi[1] < poi[1]) {
      return false;
    }
    let xseg = e_poi[0] - (e_poi[0] - s_poi[0]) * (e_poi[1] - poi[1]) / (e_poi[1] - s_poi[1]);
    if (xseg < poi[0]) {
      return false;
    } else {
      return true;
    }
  }
  function isPoiWithinPoly(poi, poly) {
    let sinsc = 0;
    for (let i2 = 0; i2 < poly.length; i2++) {
      let epoly = poly[i2][0];
      if (poly.length == 1) {
        epoly = poly[i2][0];
      }
      for (let j2 = 0; j2 < epoly.length - 1; j2++) {
        let s_poi = epoly[j2];
        let e_poi = epoly[j2 + 1];
        if (isRayIntersectsSegment(poi, s_poi, e_poi)) {
          sinsc += 1;
        }
      }
    }
    if (sinsc % 2 == 1) {
      return true;
    } else {
      return false;
    }
  }
  function drawMapDataPoints(series, opts, config2, context) {
    var mapOption = assign$2({}, {
      border: true,
      borderWidth: 1,
      borderColor: "#666666",
      fillOpacity: 0.6,
      activeBorderColor: "#f04864",
      activeFillColor: "#facc14",
      activeFillOpacity: 1
    }, opts.extra.map);
    var coords, point;
    var data = series;
    var bounds = getBoundingBox(data);
    var xScale = opts.width / Math.abs(bounds.xMax - bounds.xMin);
    var yScale = opts.height / Math.abs(bounds.yMax - bounds.yMin);
    var scale = xScale < yScale ? xScale : yScale;
    var xoffset = opts.width / 2 - Math.abs(bounds.xMax - bounds.xMin) / 2 * scale;
    var yoffset = opts.height / 2 - Math.abs(bounds.yMax - bounds.yMin) / 2 * scale;
    context.beginPath();
    context.clearRect(0, 0, opts.width, opts.height);
    context.setFillStyle(opts.background || "#FFFFFF");
    context.rect(0, 0, opts.width, opts.height);
    context.fill();
    for (var i2 = 0; i2 < data.length; i2++) {
      context.beginPath();
      context.setLineWidth(mapOption.borderWidth * opts.pixelRatio);
      context.setStrokeStyle(mapOption.borderColor);
      context.setFillStyle(hexToRgb(series[i2].color, mapOption.fillOpacity));
      if (opts.tooltip) {
        if (opts.tooltip.index == i2) {
          context.setStrokeStyle(mapOption.activeBorderColor);
          context.setFillStyle(hexToRgb(mapOption.activeFillColor, mapOption.activeFillOpacity));
        }
      }
      var coorda = data[i2].geometry.coordinates;
      for (var k = 0; k < coorda.length; k++) {
        coords = coorda[k];
        if (coords.length == 1) {
          coords = coords[0];
        }
        for (var j2 = 0; j2 < coords.length; j2++) {
          point = coordinateToPoint(coords[j2][1], coords[j2][0], bounds, scale, xoffset, yoffset);
          if (j2 === 0) {
            context.beginPath();
            context.moveTo(point.x, point.y);
          } else {
            context.lineTo(point.x, point.y);
          }
        }
        context.fill();
        if (mapOption.border == true) {
          context.stroke();
        }
      }
      if (opts.dataLabel == true) {
        var centerPoint = data[i2].properties.centroid;
        if (centerPoint) {
          point = coordinateToPoint(centerPoint[1], centerPoint[0], bounds, scale, xoffset, yoffset);
          let fontSize = data[i2].textSize || config2.fontSize;
          let text = data[i2].properties.name;
          context.beginPath();
          context.setFontSize(fontSize);
          context.setFillStyle(data[i2].textColor || "#666666");
          context.fillText(text, point.x - measureText(text, fontSize) / 2, point.y + fontSize / 2);
          context.closePath();
          context.stroke();
        }
      }
    }
    opts.chartData.mapData = {
      bounds,
      scale,
      xoffset,
      yoffset
    };
    drawToolTipBridge(opts, config2, context, 1);
    context.draw();
  }
  function getWordCloudPoint(opts, type) {
    let points = opts.series.sort(function(a2, b2) {
      return parseInt(b2.textSize) - parseInt(a2.textSize);
    });
    switch (type) {
      case "normal":
        for (let i2 = 0; i2 < points.length; i2++) {
          let text = points[i2].name;
          let tHeight = points[i2].textSize;
          let tWidth = measureText(text, tHeight);
          let x, y2;
          let area;
          let breaknum = 0;
          while (true) {
            breaknum++;
            x = normalInt(-opts.width / 2, opts.width / 2, 5) - tWidth / 2;
            y2 = normalInt(-opts.height / 2, opts.height / 2, 5) + tHeight / 2;
            area = [x - 5 + opts.width / 2, y2 - 5 - tHeight + opts.height / 2, x + tWidth + 5 + opts.width / 2, y2 + 5 + opts.height / 2];
            let isCollision = collisionNew(area, points, opts.width, opts.height);
            if (!isCollision)
              break;
            if (breaknum == 1e3) {
              area = [-100, -100, -100, -100];
              break;
            }
          }
          points[i2].area = area;
        }
        break;
      case "vertical":
        let Spin = function() {
          if (Math.random() > 0.7) {
            return true;
          } else {
            return false;
          }
        };
        for (let i2 = 0; i2 < points.length; i2++) {
          let text = points[i2].name;
          let tHeight = points[i2].textSize;
          let tWidth = measureText(text, tHeight);
          let isSpin = Spin();
          let x, y2, area, areav;
          let breaknum = 0;
          while (true) {
            breaknum++;
            let isCollision;
            if (isSpin) {
              x = normalInt(-opts.width / 2, opts.width / 2, 5) - tWidth / 2;
              y2 = normalInt(-opts.height / 2, opts.height / 2, 5) + tHeight / 2;
              area = [y2 - 5 - tWidth + opts.width / 2, -x - 5 + opts.height / 2, y2 + 5 + opts.width / 2, -x + tHeight + 5 + opts.height / 2];
              areav = [opts.width - (opts.width / 2 - opts.height / 2) - (-x + tHeight + 5 + opts.height / 2) - 5, opts.height / 2 - opts.width / 2 + (y2 - 5 - tWidth + opts.width / 2) - 5, opts.width - (opts.width / 2 - opts.height / 2) - (-x + tHeight + 5 + opts.height / 2) + tHeight, opts.height / 2 - opts.width / 2 + (y2 - 5 - tWidth + opts.width / 2) + tWidth + 5];
              isCollision = collisionNew(areav, points, opts.height, opts.width);
            } else {
              x = normalInt(-opts.width / 2, opts.width / 2, 5) - tWidth / 2;
              y2 = normalInt(-opts.height / 2, opts.height / 2, 5) + tHeight / 2;
              area = [x - 5 + opts.width / 2, y2 - 5 - tHeight + opts.height / 2, x + tWidth + 5 + opts.width / 2, y2 + 5 + opts.height / 2];
              isCollision = collisionNew(area, points, opts.width, opts.height);
            }
            if (!isCollision)
              break;
            if (breaknum == 1e3) {
              area = [-1e3, -1e3, -1e3, -1e3];
              break;
            }
          }
          if (isSpin) {
            points[i2].area = areav;
            points[i2].areav = area;
          } else {
            points[i2].area = area;
          }
          points[i2].rotate = isSpin;
        }
        break;
    }
    return points;
  }
  function drawWordCloudDataPoints(series, opts, config2, context) {
    let process = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1;
    assign$2({}, {
      type: "normal",
      autoColors: true
    }, opts.extra.word);
    context.beginPath();
    context.setFillStyle(opts.background || "#FFFFFF");
    context.rect(0, 0, opts.width, opts.height);
    context.fill();
    context.save();
    let points = opts.chartData.wordCloudData;
    context.translate(opts.width / 2, opts.height / 2);
    for (let i2 = 0; i2 < points.length; i2++) {
      context.save();
      if (points[i2].rotate) {
        context.rotate(90 * Math.PI / 180);
      }
      let text = points[i2].name;
      let tHeight = points[i2].textSize;
      let tWidth = measureText(text, tHeight);
      context.beginPath();
      context.setStrokeStyle(points[i2].color);
      context.setFillStyle(points[i2].color);
      context.setFontSize(tHeight);
      if (points[i2].rotate) {
        if (points[i2].areav[0] > 0) {
          if (opts.tooltip) {
            if (opts.tooltip.index == i2) {
              context.strokeText(text, (points[i2].areav[0] + 5 - opts.width / 2) * process - tWidth * (1 - process) / 2, (points[i2].areav[1] + 5 + tHeight - opts.height / 2) * process);
            } else {
              context.fillText(text, (points[i2].areav[0] + 5 - opts.width / 2) * process - tWidth * (1 - process) / 2, (points[i2].areav[1] + 5 + tHeight - opts.height / 2) * process);
            }
          } else {
            context.fillText(text, (points[i2].areav[0] + 5 - opts.width / 2) * process - tWidth * (1 - process) / 2, (points[i2].areav[1] + 5 + tHeight - opts.height / 2) * process);
          }
        }
      } else {
        if (points[i2].area[0] > 0) {
          if (opts.tooltip) {
            if (opts.tooltip.index == i2) {
              context.strokeText(text, (points[i2].area[0] + 5 - opts.width / 2) * process - tWidth * (1 - process) / 2, (points[i2].area[1] + 5 + tHeight - opts.height / 2) * process);
            } else {
              context.fillText(text, (points[i2].area[0] + 5 - opts.width / 2) * process - tWidth * (1 - process) / 2, (points[i2].area[1] + 5 + tHeight - opts.height / 2) * process);
            }
          } else {
            context.fillText(text, (points[i2].area[0] + 5 - opts.width / 2) * process - tWidth * (1 - process) / 2, (points[i2].area[1] + 5 + tHeight - opts.height / 2) * process);
          }
        }
      }
      context.stroke();
      context.restore();
    }
    context.restore();
  }
  function drawFunnelDataPoints(series, opts, config2, context) {
    let process = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1;
    let funnelOption = assign$2({}, {
      activeWidth: 10,
      activeOpacity: 0.3,
      border: false,
      borderWidth: 2,
      borderColor: "#FFFFFF",
      fillOpacity: 1,
      labelAlign: "right"
    }, opts.extra.funnel);
    let eachSpacing = (opts.height - opts.area[0] - opts.area[2]) / series.length;
    let centerPosition = {
      x: opts.area[3] + (opts.width - opts.area[1] - opts.area[3]) / 2,
      y: opts.height - opts.area[2]
    };
    let activeWidth = funnelOption.activeWidth;
    let radius = Math.min((opts.width - opts.area[1] - opts.area[3]) / 2 - activeWidth, (opts.height - opts.area[0] - opts.area[2]) / 2 - activeWidth);
    series = getFunnelDataPoints(series, radius, process);
    context.save();
    context.translate(centerPosition.x, centerPosition.y);
    for (let i2 = 0; i2 < series.length; i2++) {
      if (i2 == 0) {
        if (opts.tooltip) {
          if (opts.tooltip.index == i2) {
            context.beginPath();
            context.setFillStyle(hexToRgb(series[i2].color, funnelOption.activeOpacity));
            context.moveTo(-activeWidth, 0);
            context.lineTo(-series[i2].radius - activeWidth, -eachSpacing);
            context.lineTo(series[i2].radius + activeWidth, -eachSpacing);
            context.lineTo(activeWidth, 0);
            context.lineTo(-activeWidth, 0);
            context.closePath();
            context.fill();
          }
        }
        series[i2].funnelArea = [centerPosition.x - series[i2].radius, centerPosition.y - eachSpacing, centerPosition.x + series[i2].radius, centerPosition.y];
        context.beginPath();
        context.setLineWidth(funnelOption.borderWidth * opts.pixelRatio);
        context.setStrokeStyle(funnelOption.borderColor);
        context.setFillStyle(hexToRgb(series[i2].color, funnelOption.fillOpacity));
        context.moveTo(0, 0);
        context.lineTo(-series[i2].radius, -eachSpacing);
        context.lineTo(series[i2].radius, -eachSpacing);
        context.lineTo(0, 0);
        context.closePath();
        context.fill();
        if (funnelOption.border == true) {
          context.stroke();
        }
      } else {
        if (opts.tooltip) {
          if (opts.tooltip.index == i2) {
            context.beginPath();
            context.setFillStyle(hexToRgb(series[i2].color, funnelOption.activeOpacity));
            context.moveTo(0, 0);
            context.lineTo(-series[i2 - 1].radius - activeWidth, 0);
            context.lineTo(-series[i2].radius - activeWidth, -eachSpacing);
            context.lineTo(series[i2].radius + activeWidth, -eachSpacing);
            context.lineTo(series[i2 - 1].radius + activeWidth, 0);
            context.lineTo(0, 0);
            context.closePath();
            context.fill();
            context.closePath();
            context.fill();
          }
        }
        series[i2].funnelArea = [centerPosition.x - series[i2].radius, centerPosition.y - eachSpacing * (i2 + 1), centerPosition.x + series[i2].radius, centerPosition.y - eachSpacing * i2];
        context.beginPath();
        context.setLineWidth(funnelOption.borderWidth * opts.pixelRatio);
        context.setStrokeStyle(funnelOption.borderColor);
        context.setFillStyle(hexToRgb(series[i2].color, funnelOption.fillOpacity));
        context.moveTo(0, 0);
        context.lineTo(-series[i2 - 1].radius, 0);
        context.lineTo(-series[i2].radius, -eachSpacing);
        context.lineTo(series[i2].radius, -eachSpacing);
        context.lineTo(series[i2 - 1].radius, 0);
        context.lineTo(0, 0);
        context.closePath();
        context.fill();
        if (funnelOption.border == true) {
          context.stroke();
        }
      }
      context.translate(0, -eachSpacing);
    }
    context.restore();
    if (opts.dataLabel !== false && process === 1) {
      drawFunnelText(series, opts, context, eachSpacing, funnelOption.labelAlign, activeWidth, centerPosition);
    }
    return {
      center: centerPosition,
      radius,
      series
    };
  }
  function drawFunnelText(series, opts, context, eachSpacing, labelAlign, activeWidth, centerPosition) {
    for (let i2 = 0; i2 < series.length; i2++) {
      let item = series[i2];
      let startX, endX, startY, fontSize;
      let text = item.format ? item.format(+item._proportion_.toFixed(2)) : util.toFixed(item._proportion_ * 100) + "%";
      if (labelAlign == "right") {
        if (i2 == 0) {
          startX = (item.funnelArea[2] + centerPosition.x) / 2;
        } else {
          startX = (item.funnelArea[2] + series[i2 - 1].funnelArea[2]) / 2;
        }
        endX = startX + activeWidth * 2;
        startY = item.funnelArea[1] + eachSpacing / 2;
        fontSize = item.textSize || opts.fontSize;
        context.setLineWidth(1 * opts.pixelRatio);
        context.setStrokeStyle(item.color);
        context.setFillStyle(item.color);
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, startY);
        context.stroke();
        context.closePath();
        context.beginPath();
        context.moveTo(endX, startY);
        context.arc(endX, startY, 2, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.beginPath();
        context.setFontSize(fontSize);
        context.setFillStyle(item.textColor || "#666666");
        context.fillText(text, endX + 5, startY + fontSize / 2 - 2);
        context.closePath();
        context.stroke();
        context.closePath();
      } else {
        if (i2 == 0) {
          startX = (item.funnelArea[0] + centerPosition.x) / 2;
        } else {
          startX = (item.funnelArea[0] + series[i2 - 1].funnelArea[0]) / 2;
        }
        endX = startX - activeWidth * 2;
        startY = item.funnelArea[1] + eachSpacing / 2;
        fontSize = item.textSize || opts.fontSize;
        context.setLineWidth(1 * opts.pixelRatio);
        context.setStrokeStyle(item.color);
        context.setFillStyle(item.color);
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, startY);
        context.stroke();
        context.closePath();
        context.beginPath();
        context.moveTo(endX, startY);
        context.arc(endX, startY, 2, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.beginPath();
        context.setFontSize(fontSize);
        context.setFillStyle(item.textColor || "#666666");
        context.fillText(text, endX - 5 - measureText(text), startY + fontSize / 2 - 2);
        context.closePath();
        context.stroke();
        context.closePath();
      }
    }
  }
  function drawCanvas(opts, context) {
    context.draw();
  }
  var Timing = {
    easeIn: function easeIn(pos) {
      return Math.pow(pos, 3);
    },
    easeOut: function easeOut(pos) {
      return Math.pow(pos - 1, 3) + 1;
    },
    easeInOut: function easeInOut(pos) {
      if ((pos /= 0.5) < 1) {
        return 0.5 * Math.pow(pos, 3);
      } else {
        return 0.5 * (Math.pow(pos - 2, 3) + 2);
      }
    },
    linear: function linear(pos) {
      return pos;
    }
  };
  function Animation(opts) {
    this.isStop = false;
    opts.duration = typeof opts.duration === "undefined" ? 1e3 : opts.duration;
    opts.timing = opts.timing || "linear";
    var delay = 17;
    function createAnimationFrame() {
      if (typeof setTimeout !== "undefined") {
        return function(step, delay2) {
          setTimeout(function() {
            var timeStamp = +/* @__PURE__ */ new Date();
            step(timeStamp);
          }, delay2);
        };
      } else if (typeof requestAnimationFrame !== "undefined") {
        return requestAnimationFrame;
      } else {
        return function(step) {
          step(null);
        };
      }
    }
    var animationFrame = createAnimationFrame();
    var startTimeStamp = null;
    var _step = function step(timestamp) {
      if (timestamp === null || this.isStop === true) {
        opts.onProcess && opts.onProcess(1);
        opts.onAnimationFinish && opts.onAnimationFinish();
        return;
      }
      if (startTimeStamp === null) {
        startTimeStamp = timestamp;
      }
      if (timestamp - startTimeStamp < opts.duration) {
        var process = (timestamp - startTimeStamp) / opts.duration;
        var timingFunction = Timing[opts.timing];
        process = timingFunction(process);
        opts.onProcess && opts.onProcess(process);
        animationFrame(_step, delay);
      } else {
        opts.onProcess && opts.onProcess(1);
        opts.onAnimationFinish && opts.onAnimationFinish();
      }
    };
    _step = _step.bind(this);
    animationFrame(_step, delay);
  }
  Animation.prototype.stop = function() {
    this.isStop = true;
  };
  function drawCharts(type, opts, config2, context) {
    var _this = this;
    var series = opts.series;
    var categories = opts.categories;
    series = fillSeries(series, opts, config2);
    var duration = opts.animation ? opts.duration : 0;
    this.animationInstance && this.animationInstance.stop();
    var seriesMA = null;
    if (type == "candle") {
      let average = assign$2({}, opts.extra.candle.average);
      if (average.show) {
        seriesMA = calCandleMA(average.day, average.name, average.color, series[0].data);
        seriesMA = fillSeries(seriesMA, opts, config2);
        opts.seriesMA = seriesMA;
      } else if (opts.seriesMA) {
        seriesMA = opts.seriesMA = fillSeries(opts.seriesMA, opts, config2);
      } else {
        seriesMA = series;
      }
    } else {
      seriesMA = series;
    }
    opts._series_ = series = filterSeries(series);
    opts.area = new Array(4);
    for (let j2 = 0; j2 < 4; j2++) {
      opts.area[j2] = opts.padding[j2];
    }
    var _calLegendData = calLegendData(seriesMA, opts, config2, opts.chartData), legendHeight = _calLegendData.area.wholeHeight, legendWidth = _calLegendData.area.wholeWidth;
    config2.legendHeight = legendHeight;
    switch (opts.legend.position) {
      case "top":
        opts.area[0] += legendHeight;
        break;
      case "bottom":
        opts.area[2] += legendHeight;
        break;
      case "left":
        opts.area[3] += legendWidth;
        break;
      case "right":
        opts.area[1] += legendWidth;
        break;
    }
    let _calYAxisData = {}, yAxisWidth = 0;
    if (opts.type === "line" || opts.type === "column" || opts.type === "area" || opts.type === "mix" || opts.type === "candle") {
      _calYAxisData = calYAxisData(series, opts, config2);
      yAxisWidth = _calYAxisData.yAxisWidth;
      config2.yAxisWidth = yAxisWidth;
      opts.area[3] += yAxisWidth;
    } else {
      config2.yAxisWidth = yAxisWidth;
    }
    opts.chartData.yAxisData = _calYAxisData;
    if (opts.categories && opts.categories.length) {
      opts.chartData.xAxisData = getXAxisPoints(opts.categories, opts, config2);
      let _calCategoriesData = calCategoriesData(opts.categories, opts, config2, opts.chartData.xAxisData.eachSpacing), xAxisHeight = _calCategoriesData.xAxisHeight, angle = _calCategoriesData.angle;
      config2.xAxisHeight = xAxisHeight;
      config2._xAxisTextAngle_ = angle;
      opts.area[2] += xAxisHeight;
      opts.chartData.categoriesData = _calCategoriesData;
    }
    if (opts.enableScroll && opts.xAxis.scrollAlign == "right" && opts._scrollDistance_ === void 0) {
      let offsetLeft = 0, xAxisPoints = opts.chartData.xAxisData.xAxisPoints, startX = opts.chartData.xAxisData.startX, endX = opts.chartData.xAxisData.endX, eachSpacing = opts.chartData.xAxisData.eachSpacing;
      let totalWidth = eachSpacing * (xAxisPoints.length - 1);
      let screenWidth = endX - startX;
      offsetLeft = screenWidth - totalWidth;
      _this.scrollOption = {
        currentOffset: offsetLeft,
        startTouchX: offsetLeft,
        distance: 0,
        lastMoveTime: 0
      };
      opts._scrollDistance_ = offsetLeft;
    }
    if (type === "pie" || type === "ring" || type === "rose") {
      config2._pieTextMaxLength_ = opts.dataLabel === false ? 0 : getPieTextMaxLength(seriesMA);
    }
    switch (type) {
      case "word":
        let wordOption = assign$2({}, {
          type: "normal",
          autoColors: true
        }, opts.extra.word);
        if (opts.updateData == true || opts.updateData == void 0) {
          opts.chartData.wordCloudData = getWordCloudPoint(opts, wordOption.type);
        }
        this.animationInstance = new Animation({
          timing: "easeInOut",
          duration,
          onProcess: function(process) {
            context.clearRect(0, 0, opts.width, opts.height);
            if (opts.rotate) {
              contextRotate(context, opts);
            }
            drawWordCloudDataPoints(series, opts, config2, context, process);
            drawCanvas(opts, context);
          },
          onAnimationFinish: function onAnimationFinish() {
            _this.event.trigger("renderComplete");
          }
        });
        break;
      case "map":
        context.clearRect(0, 0, opts.width, opts.height);
        drawMapDataPoints(series, opts, config2, context);
        break;
      case "funnel":
        this.animationInstance = new Animation({
          timing: "easeInOut",
          duration,
          onProcess: function(process) {
            context.clearRect(0, 0, opts.width, opts.height);
            if (opts.rotate) {
              contextRotate(context, opts);
            }
            opts.chartData.funnelData = drawFunnelDataPoints(series, opts, config2, context, process);
            drawLegend(opts.series, opts, config2, context, opts.chartData);
            drawToolTipBridge(opts, config2, context, process);
            drawCanvas(opts, context);
          },
          onAnimationFinish: function onAnimationFinish() {
            _this.event.trigger("renderComplete");
          }
        });
        break;
      case "line":
        this.animationInstance = new Animation({
          timing: "easeIn",
          duration,
          onProcess: function onProcess(process) {
            context.clearRect(0, 0, opts.width, opts.height);
            if (opts.rotate) {
              contextRotate(context, opts);
            }
            drawYAxisGrid(categories, opts, config2, context);
            drawXAxis(categories, opts, config2, context);
            var _drawLineDataPoints = drawLineDataPoints(series, opts, config2, context, process), xAxisPoints = _drawLineDataPoints.xAxisPoints, calPoints = _drawLineDataPoints.calPoints, eachSpacing = _drawLineDataPoints.eachSpacing, minRange = _drawLineDataPoints.minRange, maxRange = _drawLineDataPoints.maxRange;
            opts.chartData.xAxisPoints = xAxisPoints;
            opts.chartData.calPoints = calPoints;
            opts.chartData.eachSpacing = eachSpacing;
            drawYAxis(series, opts, config2, context);
            if (opts.enableMarkLine !== false && process === 1) {
              drawMarkLine(minRange, maxRange, opts, config2, context);
            }
            drawLegend(opts.series, opts, config2, context, opts.chartData);
            drawToolTipBridge(opts, config2, context, process);
            drawCanvas(opts, context);
          },
          onAnimationFinish: function onAnimationFinish() {
            _this.event.trigger("renderComplete");
          }
        });
        break;
      case "mix":
        this.animationInstance = new Animation({
          timing: "easeIn",
          duration,
          onProcess: function onProcess(process) {
            context.clearRect(0, 0, opts.width, opts.height);
            if (opts.rotate) {
              contextRotate(context, opts);
            }
            drawYAxisGrid(categories, opts, config2, context);
            drawXAxis(categories, opts, config2, context);
            var _drawMixDataPoints = drawMixDataPoints(series, opts, config2, context, process), xAxisPoints = _drawMixDataPoints.xAxisPoints, calPoints = _drawMixDataPoints.calPoints, eachSpacing = _drawMixDataPoints.eachSpacing, minRange = _drawMixDataPoints.minRange, maxRange = _drawMixDataPoints.maxRange;
            opts.chartData.xAxisPoints = xAxisPoints;
            opts.chartData.calPoints = calPoints;
            opts.chartData.eachSpacing = eachSpacing;
            drawYAxis(series, opts, config2, context);
            if (opts.enableMarkLine !== false && process === 1) {
              drawMarkLine(minRange, maxRange, opts, config2, context);
            }
            drawLegend(opts.series, opts, config2, context, opts.chartData);
            drawToolTipBridge(opts, config2, context, process);
            drawCanvas(opts, context);
          },
          onAnimationFinish: function onAnimationFinish() {
            _this.event.trigger("renderComplete");
          }
        });
        break;
      case "column":
        this.animationInstance = new Animation({
          timing: "easeIn",
          duration,
          onProcess: function onProcess(process) {
            context.clearRect(0, 0, opts.width, opts.height);
            if (opts.rotate) {
              contextRotate(context, opts);
            }
            drawYAxisGrid(categories, opts, config2, context);
            drawXAxis(categories, opts, config2, context);
            var _drawColumnDataPoints = drawColumnDataPoints(series, opts, config2, context, process), xAxisPoints = _drawColumnDataPoints.xAxisPoints, calPoints = _drawColumnDataPoints.calPoints, eachSpacing = _drawColumnDataPoints.eachSpacing, minRange = _drawColumnDataPoints.minRange, maxRange = _drawColumnDataPoints.maxRange;
            opts.chartData.xAxisPoints = xAxisPoints;
            opts.chartData.calPoints = calPoints;
            opts.chartData.eachSpacing = eachSpacing;
            drawYAxis(series, opts, config2, context);
            if (opts.enableMarkLine !== false && process === 1) {
              drawMarkLine(minRange, maxRange, opts, config2, context);
            }
            drawLegend(opts.series, opts, config2, context, opts.chartData);
            drawToolTipBridge(opts, config2, context, process);
            drawCanvas(opts, context);
          },
          onAnimationFinish: function onAnimationFinish() {
            _this.event.trigger("renderComplete");
          }
        });
        break;
      case "area":
        this.animationInstance = new Animation({
          timing: "easeIn",
          duration,
          onProcess: function onProcess(process) {
            context.clearRect(0, 0, opts.width, opts.height);
            if (opts.rotate) {
              contextRotate(context, opts);
            }
            drawYAxisGrid(categories, opts, config2, context);
            drawXAxis(categories, opts, config2, context);
            var _drawAreaDataPoints = drawAreaDataPoints(series, opts, config2, context, process), xAxisPoints = _drawAreaDataPoints.xAxisPoints, calPoints = _drawAreaDataPoints.calPoints, eachSpacing = _drawAreaDataPoints.eachSpacing, minRange = _drawAreaDataPoints.minRange, maxRange = _drawAreaDataPoints.maxRange;
            opts.chartData.xAxisPoints = xAxisPoints;
            opts.chartData.calPoints = calPoints;
            opts.chartData.eachSpacing = eachSpacing;
            drawYAxis(series, opts, config2, context);
            if (opts.enableMarkLine !== false && process === 1) {
              drawMarkLine(minRange, maxRange, opts, config2, context);
            }
            drawLegend(opts.series, opts, config2, context, opts.chartData);
            drawToolTipBridge(opts, config2, context, process);
            drawCanvas(opts, context);
          },
          onAnimationFinish: function onAnimationFinish() {
            _this.event.trigger("renderComplete");
          }
        });
        break;
      case "ring":
      case "pie":
        this.animationInstance = new Animation({
          timing: "easeInOut",
          duration,
          onProcess: function onProcess(process) {
            context.clearRect(0, 0, opts.width, opts.height);
            if (opts.rotate) {
              contextRotate(context, opts);
            }
            opts.chartData.pieData = drawPieDataPoints(series, opts, config2, context, process);
            drawLegend(opts.series, opts, config2, context, opts.chartData);
            drawToolTipBridge(opts, config2, context, process);
            drawCanvas(opts, context);
          },
          onAnimationFinish: function onAnimationFinish() {
            _this.event.trigger("renderComplete");
          }
        });
        break;
      case "rose":
        this.animationInstance = new Animation({
          timing: "easeInOut",
          duration,
          onProcess: function onProcess(process) {
            context.clearRect(0, 0, opts.width, opts.height);
            if (opts.rotate) {
              contextRotate(context, opts);
            }
            opts.chartData.pieData = drawRoseDataPoints(series, opts, config2, context, process);
            drawLegend(opts.series, opts, config2, context, opts.chartData);
            drawToolTipBridge(opts, config2, context, process);
            drawCanvas(opts, context);
          },
          onAnimationFinish: function onAnimationFinish() {
            _this.event.trigger("renderComplete");
          }
        });
        break;
      case "radar":
        this.animationInstance = new Animation({
          timing: "easeInOut",
          duration,
          onProcess: function onProcess(process) {
            context.clearRect(0, 0, opts.width, opts.height);
            if (opts.rotate) {
              contextRotate(context, opts);
            }
            opts.chartData.radarData = drawRadarDataPoints(series, opts, config2, context, process);
            drawLegend(opts.series, opts, config2, context, opts.chartData);
            drawToolTipBridge(opts, config2, context, process);
            drawCanvas(opts, context);
          },
          onAnimationFinish: function onAnimationFinish() {
            _this.event.trigger("renderComplete");
          }
        });
        break;
      case "arcbar":
        this.animationInstance = new Animation({
          timing: "easeInOut",
          duration,
          onProcess: function onProcess(process) {
            context.clearRect(0, 0, opts.width, opts.height);
            if (opts.rotate) {
              contextRotate(context, opts);
            }
            opts.chartData.arcbarData = drawArcbarDataPoints(series, opts, config2, context, process);
            drawCanvas(opts, context);
          },
          onAnimationFinish: function onAnimationFinish() {
            _this.event.trigger("renderComplete");
          }
        });
        break;
      case "gauge":
        this.animationInstance = new Animation({
          timing: "easeInOut",
          duration,
          onProcess: function onProcess(process) {
            context.clearRect(0, 0, opts.width, opts.height);
            if (opts.rotate) {
              contextRotate(context, opts);
            }
            opts.chartData.gaugeData = drawGaugeDataPoints(categories, series, opts, config2, context, process);
            drawCanvas(opts, context);
          },
          onAnimationFinish: function onAnimationFinish() {
            _this.event.trigger("renderComplete");
          }
        });
        break;
      case "candle":
        this.animationInstance = new Animation({
          timing: "easeIn",
          duration,
          onProcess: function onProcess(process) {
            context.clearRect(0, 0, opts.width, opts.height);
            if (opts.rotate) {
              contextRotate(context, opts);
            }
            drawYAxisGrid(categories, opts, config2, context);
            drawXAxis(categories, opts, config2, context);
            var _drawCandleDataPoints = drawCandleDataPoints(series, seriesMA, opts, config2, context, process), xAxisPoints = _drawCandleDataPoints.xAxisPoints, calPoints = _drawCandleDataPoints.calPoints, eachSpacing = _drawCandleDataPoints.eachSpacing, minRange = _drawCandleDataPoints.minRange, maxRange = _drawCandleDataPoints.maxRange;
            opts.chartData.xAxisPoints = xAxisPoints;
            opts.chartData.calPoints = calPoints;
            opts.chartData.eachSpacing = eachSpacing;
            drawYAxis(series, opts, config2, context);
            if (opts.enableMarkLine !== false && process === 1) {
              drawMarkLine(minRange, maxRange, opts, config2, context);
            }
            if (seriesMA) {
              drawLegend(seriesMA, opts, config2, context, opts.chartData);
            } else {
              drawLegend(opts.series, opts, config2, context, opts.chartData);
            }
            drawToolTipBridge(opts, config2, context, process);
            drawCanvas(opts, context);
          },
          onAnimationFinish: function onAnimationFinish() {
            _this.event.trigger("renderComplete");
          }
        });
        break;
    }
  }
  function Event() {
    this.events = {};
  }
  Event.prototype.addEventListener = function(type, listener) {
    this.events[type] = this.events[type] || [];
    this.events[type].push(listener);
  };
  Event.prototype.trigger = function() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var type = args[0];
    var params = args.slice(1);
    if (!!this.events[type]) {
      this.events[type].forEach(function(listener) {
        try {
          listener.apply(null, params);
        } catch (e2) {
          formatAppLog("error", "at components/u-charts/u-charts.js:4565", e2);
        }
      });
    }
  };
  var Charts = function Charts2(opts) {
    opts.pixelRatio = opts.pixelRatio ? opts.pixelRatio : 1;
    opts.fontSize = opts.fontSize ? opts.fontSize * opts.pixelRatio : 13 * opts.pixelRatio;
    opts.title = assign$2({}, opts.title);
    opts.subtitle = assign$2({}, opts.subtitle);
    opts.duration = opts.duration ? opts.duration : 1e3;
    opts.yAxis = assign$2({}, {
      gridType: "solid",
      dashLength: 4 * opts.pixelRatio
    }, opts.yAxis);
    opts.xAxis = assign$2({}, {
      rotateLabel: false,
      type: "calibration",
      gridType: "solid",
      dashLength: 4 * opts.pixelRatio,
      scrollAlign: "left",
      boundaryGap: "center"
    }, opts.xAxis);
    opts.legend = assign$2({}, {
      show: true,
      position: "bottom",
      float: "center",
      backgroundColor: "rgba(0,0,0,0)",
      borderColor: "rgba(0,0,0,0)",
      borderWidth: 0,
      padding: 5,
      margin: 5,
      itemGap: 10,
      fontSize: opts.fontSize,
      lineHeight: opts.fontSize,
      fontColor: "#333333",
      format: {},
      hiddenColor: "#CECECE"
    }, opts.legend);
    opts.legend.borderWidth = opts.legend.borderWidth * opts.pixelRatio;
    opts.legend.itemGap = opts.legend.itemGap * opts.pixelRatio;
    opts.legend.padding = opts.legend.padding * opts.pixelRatio;
    opts.legend.margin = opts.legend.margin * opts.pixelRatio;
    opts.extra = assign$2({}, opts.extra);
    opts.rotate = opts.rotate ? true : false;
    opts.animation = opts.animation ? true : false;
    let config$$1 = JSON.parse(JSON.stringify(config));
    config$$1.colors = opts.colors ? opts.colors : config$$1.colors;
    config$$1.yAxisTitleWidth = opts.yAxis.disabled !== true && opts.yAxis.title ? config$$1.yAxisTitleWidth : 0;
    if (opts.type == "pie" || opts.type == "ring") {
      config$$1.pieChartLinePadding = opts.dataLabel === false ? 0 : opts.extra.pie.labelWidth * opts.pixelRatio || config$$1.pieChartLinePadding * opts.pixelRatio;
    }
    if (opts.type == "rose") {
      config$$1.pieChartLinePadding = opts.dataLabel === false ? 0 : opts.extra.rose.labelWidth * opts.pixelRatio || config$$1.pieChartLinePadding * opts.pixelRatio;
    }
    config$$1.pieChartTextPadding = opts.dataLabel === false ? 0 : config$$1.pieChartTextPadding * opts.pixelRatio;
    config$$1.yAxisSplit = opts.yAxis.splitNumber ? opts.yAxis.splitNumber : config.yAxisSplit;
    config$$1.rotate = opts.rotate;
    if (opts.rotate) {
      let tempWidth = opts.width;
      let tempHeight = opts.height;
      opts.width = tempHeight;
      opts.height = tempWidth;
    }
    opts.padding = opts.padding ? opts.padding : config$$1.padding;
    for (let i2 = 0; i2 < 4; i2++) {
      opts.padding[i2] *= opts.pixelRatio;
    }
    config$$1.yAxisWidth = config.yAxisWidth * opts.pixelRatio;
    config$$1.xAxisHeight = config.xAxisHeight * opts.pixelRatio;
    if (opts.enableScroll && opts.xAxis.scrollShow) {
      config$$1.xAxisHeight += 6 * opts.pixelRatio;
    }
    config$$1.xAxisLineHeight = config.xAxisLineHeight * opts.pixelRatio;
    config$$1.legendHeight = config.legendHeight * opts.pixelRatio;
    config$$1.fontSize = opts.fontSize;
    config$$1.titleFontSize = config.titleFontSize * opts.pixelRatio;
    config$$1.subtitleFontSize = config.subtitleFontSize * opts.pixelRatio;
    config$$1.toolTipPadding = config.toolTipPadding * opts.pixelRatio;
    config$$1.toolTipLineHeight = config.toolTipLineHeight * opts.pixelRatio;
    config$$1.columePadding = config.columePadding * opts.pixelRatio;
    opts.$this = opts.$this ? opts.$this : this;
    this.context = uni.createCanvasContext(opts.canvasId, opts.$this);
    opts.chartData = {};
    this.event = new Event();
    this.scrollOption = {
      currentOffset: 0,
      startTouchX: 0,
      distance: 0,
      lastMoveTime: 0
    };
    this.opts = opts;
    this.config = config$$1;
    drawCharts.call(this, opts.type, opts, config$$1, this.context);
  };
  Charts.prototype.updateData = function() {
    let data = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    this.opts = assign$2({}, this.opts, data);
    this.opts.updateData = true;
    let scrollPosition = data.scrollPosition || "current";
    switch (scrollPosition) {
      case "current":
        this.opts._scrollDistance_ = this.scrollOption.currentOffset;
        break;
      case "left":
        this.opts._scrollDistance_ = 0;
        this.scrollOption = {
          currentOffset: 0,
          startTouchX: 0,
          distance: 0,
          lastMoveTime: 0
        };
        break;
      case "right":
        let _calYAxisData = calYAxisData(this.opts.series, this.opts, this.config), yAxisWidth = _calYAxisData.yAxisWidth;
        this.config.yAxisWidth = yAxisWidth;
        let offsetLeft = 0;
        let _getXAxisPoints0 = getXAxisPoints(this.opts.categories, this.opts, this.config), xAxisPoints = _getXAxisPoints0.xAxisPoints, startX = _getXAxisPoints0.startX, endX = _getXAxisPoints0.endX, eachSpacing = _getXAxisPoints0.eachSpacing;
        let totalWidth = eachSpacing * (xAxisPoints.length - 1);
        let screenWidth = endX - startX;
        offsetLeft = screenWidth - totalWidth;
        this.scrollOption = {
          currentOffset: offsetLeft,
          startTouchX: offsetLeft,
          distance: 0,
          lastMoveTime: 0
        };
        this.opts._scrollDistance_ = offsetLeft;
        break;
    }
    drawCharts.call(this, this.opts.type, this.opts, this.config, this.context);
  };
  Charts.prototype.zoom = function() {
    var val = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.opts.xAxis.itemCount;
    if (this.opts.enableScroll !== true) {
      formatAppLog("log", "at components/u-charts/u-charts.js:4726", "请启用滚动条后使用！");
      return;
    }
    let centerPoint = Math.round(Math.abs(this.scrollOption.currentOffset) / this.opts.chartData.eachSpacing) + Math.round(
      this.opts.xAxis.itemCount / 2
    );
    this.opts.animation = false;
    this.opts.xAxis.itemCount = val.itemCount;
    let _calYAxisData = calYAxisData(this.opts.series, this.opts, this.config), yAxisWidth = _calYAxisData.yAxisWidth;
    this.config.yAxisWidth = yAxisWidth;
    let offsetLeft = 0;
    let _getXAxisPoints0 = getXAxisPoints(this.opts.categories, this.opts, this.config), xAxisPoints = _getXAxisPoints0.xAxisPoints, startX = _getXAxisPoints0.startX, endX = _getXAxisPoints0.endX, eachSpacing = _getXAxisPoints0.eachSpacing;
    let centerLeft = eachSpacing * centerPoint;
    let screenWidth = endX - startX;
    let MaxLeft = screenWidth - eachSpacing * (xAxisPoints.length - 1);
    offsetLeft = screenWidth / 2 - centerLeft;
    if (offsetLeft > 0) {
      offsetLeft = 0;
    }
    if (offsetLeft < MaxLeft) {
      offsetLeft = MaxLeft;
    }
    this.scrollOption = {
      currentOffset: offsetLeft,
      startTouchX: offsetLeft,
      distance: 0,
      lastMoveTime: 0
    };
    this.opts._scrollDistance_ = offsetLeft;
    drawCharts.call(this, this.opts.type, this.opts, this.config, this.context);
  };
  Charts.prototype.stopAnimation = function() {
    this.animationInstance && this.animationInstance.stop();
  };
  Charts.prototype.addEventListener = function(type, listener) {
    this.event.addEventListener(type, listener);
  };
  Charts.prototype.getCurrentDataIndex = function(e2) {
    var touches = null;
    if (e2.changedTouches) {
      touches = e2.changedTouches[0];
    } else {
      touches = e2.mp.changedTouches[0];
    }
    if (touches) {
      let _touches$ = getTouches(touches, this.opts, e2);
      if (this.opts.type === "pie" || this.opts.type === "ring" || this.opts.type === "rose") {
        return findPieChartCurrentIndex({
          x: _touches$.x,
          y: _touches$.y
        }, this.opts.chartData.pieData);
      } else if (this.opts.type === "radar") {
        return findRadarChartCurrentIndex({
          x: _touches$.x,
          y: _touches$.y
        }, this.opts.chartData.radarData, this.opts.categories.length);
      } else if (this.opts.type === "funnel") {
        return findFunnelChartCurrentIndex({
          x: _touches$.x,
          y: _touches$.y
        }, this.opts.chartData.funnelData);
      } else if (this.opts.type === "map") {
        return findMapChartCurrentIndex({
          x: _touches$.x,
          y: _touches$.y
        }, this.opts);
      } else if (this.opts.type === "word") {
        return findWordChartCurrentIndex({
          x: _touches$.x,
          y: _touches$.y
        }, this.opts.chartData.wordCloudData);
      } else {
        return findCurrentIndex({
          x: _touches$.x,
          y: _touches$.y
        }, this.opts.chartData.xAxisPoints, this.opts, this.config, Math.abs(this.scrollOption.currentOffset));
      }
    }
    return -1;
  };
  Charts.prototype.getLegendDataIndex = function(e2) {
    var touches = null;
    if (e2.changedTouches) {
      touches = e2.changedTouches[0];
    } else {
      touches = e2.mp.changedTouches[0];
    }
    if (touches) {
      let _touches$ = getTouches(touches, this.opts, e2);
      return findLegendIndex({
        x: _touches$.x,
        y: _touches$.y
      }, this.opts.chartData.legendData);
    }
    return -1;
  };
  Charts.prototype.touchLegend = function(e2) {
    var option = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var touches = null;
    if (e2.changedTouches) {
      touches = e2.changedTouches[0];
    } else {
      touches = e2.mp.changedTouches[0];
    }
    if (touches) {
      getTouches(touches, this.opts, e2);
      var index2 = this.getLegendDataIndex(e2);
      if (index2 >= 0) {
        this.opts.series[index2].show = !this.opts.series[index2].show;
        this.opts.animation = option.animation ? true : false;
        drawCharts.call(this, this.opts.type, this.opts, this.config, this.context);
      }
    }
  };
  Charts.prototype.showToolTip = function(e2) {
    var option = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var touches = null;
    if (e2.changedTouches) {
      touches = e2.changedTouches[0];
    } else {
      touches = e2.mp.changedTouches[0];
    }
    if (!touches) {
      formatAppLog("log", "at components/u-charts/u-charts.js:4862", "touchError");
    }
    var _touches$ = getTouches(touches, this.opts, e2);
    var currentOffset = this.scrollOption.currentOffset;
    var opts = assign$2({}, this.opts, {
      _scrollDistance_: currentOffset,
      animation: false
    });
    if (this.opts.type === "line" || this.opts.type === "area" || this.opts.type === "column") {
      var index2 = this.getCurrentDataIndex(e2);
      if (index2 > -1) {
        var seriesData = getSeriesDataItem(this.opts.series, index2);
        if (seriesData.length !== 0) {
          var _getToolTipData = getToolTipData(seriesData, this.opts.chartData.calPoints, index2, this.opts.categories, option), textList = _getToolTipData.textList, offset = _getToolTipData.offset;
          offset.y = _touches$.y;
          opts.tooltip = {
            textList,
            offset,
            option,
            index: index2
          };
        }
      }
      drawCharts.call(this, opts.type, opts, this.config, this.context);
    }
    if (this.opts.type === "mix") {
      var index2 = this.getCurrentDataIndex(e2);
      if (index2 > -1) {
        var currentOffset = this.scrollOption.currentOffset;
        var opts = assign$2({}, this.opts, {
          _scrollDistance_: currentOffset,
          animation: false
        });
        var seriesData = getSeriesDataItem(this.opts.series, index2);
        if (seriesData.length !== 0) {
          var _getMixToolTipData = getMixToolTipData(seriesData, this.opts.chartData.calPoints, index2, this.opts.categories, option), textList = _getMixToolTipData.textList, offset = _getMixToolTipData.offset;
          offset.y = _touches$.y;
          opts.tooltip = {
            textList,
            offset,
            option,
            index: index2
          };
        }
      }
      drawCharts.call(this, opts.type, opts, this.config, this.context);
    }
    if (this.opts.type === "candle") {
      var index2 = this.getCurrentDataIndex(e2);
      if (index2 > -1) {
        var currentOffset = this.scrollOption.currentOffset;
        var opts = assign$2({}, this.opts, {
          _scrollDistance_: currentOffset,
          animation: false
        });
        var seriesData = getSeriesDataItem(this.opts.series, index2);
        if (seriesData.length !== 0) {
          var _getToolTipData = getCandleToolTipData(
            this.opts.series[0].data,
            seriesData,
            this.opts.chartData.calPoints,
            index2,
            this.opts.categories,
            this.opts.extra.candle
          ), textList = _getToolTipData.textList, offset = _getToolTipData.offset;
          offset.y = _touches$.y;
          opts.tooltip = {
            textList,
            offset,
            option,
            index: index2
          };
        }
      }
      drawCharts.call(this, opts.type, opts, this.config, this.context);
    }
    if (this.opts.type === "pie" || this.opts.type === "ring" || this.opts.type === "rose" || this.opts.type === "funnel") {
      var index2 = this.getCurrentDataIndex(e2);
      if (index2 > -1) {
        var currentOffset = this.scrollOption.currentOffset;
        var opts = assign$2({}, this.opts, {
          _scrollDistance_: currentOffset,
          animation: false
        });
        var seriesData = this.opts._series_[index2];
        var textList = [{
          text: option.format ? option.format(seriesData) : seriesData.name + ": " + seriesData.data,
          color: seriesData.color
        }];
        var offset = {
          x: _touches$.x,
          y: _touches$.y
        };
        opts.tooltip = {
          textList,
          offset,
          option,
          index: index2
        };
      }
      drawCharts.call(this, opts.type, opts, this.config, this.context);
    }
    if (this.opts.type === "map" || this.opts.type === "word") {
      var index2 = this.getCurrentDataIndex(e2);
      if (index2 > -1) {
        var currentOffset = this.scrollOption.currentOffset;
        var opts = assign$2({}, this.opts, {
          _scrollDistance_: currentOffset,
          animation: false
        });
        var seriesData = this.opts._series_[index2];
        var textList = [{
          text: option.format ? option.format(seriesData) : seriesData.properties.name,
          color: seriesData.color
        }];
        var offset = {
          x: _touches$.x,
          y: _touches$.y
        };
        opts.tooltip = {
          textList,
          offset,
          option,
          index: index2
        };
      }
      opts.updateData = false;
      drawCharts.call(this, opts.type, opts, this.config, this.context);
    }
    if (this.opts.type === "radar") {
      var index2 = this.getCurrentDataIndex(e2);
      if (index2 > -1) {
        var currentOffset = this.scrollOption.currentOffset;
        var opts = assign$2({}, this.opts, {
          _scrollDistance_: currentOffset,
          animation: false
        });
        var seriesData = getSeriesDataItem(this.opts.series, index2);
        if (seriesData.length !== 0) {
          var textList = seriesData.map(function(item) {
            return {
              text: option.format ? option.format(item) : item.name + ": " + item.data,
              color: item.color
            };
          });
          var offset = {
            x: _touches$.x,
            y: _touches$.y
          };
          opts.tooltip = {
            textList,
            offset,
            option,
            index: index2
          };
        }
      }
      drawCharts.call(this, opts.type, opts, this.config, this.context);
    }
  };
  Charts.prototype.translate = function(distance) {
    this.scrollOption = {
      currentOffset: distance,
      startTouchX: distance,
      distance: 0,
      lastMoveTime: 0
    };
    let opts = assign$2({}, this.opts, {
      _scrollDistance_: distance,
      animation: false
    });
    drawCharts.call(this, this.opts.type, opts, this.config, this.context);
  };
  Charts.prototype.scrollStart = function(e2) {
    var touches = null;
    if (e2.changedTouches) {
      touches = e2.changedTouches[0];
    } else {
      touches = e2.mp.changedTouches[0];
    }
    var _touches$ = getTouches(touches, this.opts, e2);
    if (touches && this.opts.enableScroll === true) {
      this.scrollOption.startTouchX = _touches$.x;
    }
  };
  Charts.prototype.scroll = function(e2) {
    if (this.scrollOption.lastMoveTime === 0) {
      this.scrollOption.lastMoveTime = Date.now();
    }
    let Limit = this.opts.extra.touchMoveLimit || 20;
    let currMoveTime = Date.now();
    let duration = currMoveTime - this.scrollOption.lastMoveTime;
    if (duration < Math.floor(1e3 / Limit))
      return;
    this.scrollOption.lastMoveTime = currMoveTime;
    var touches = null;
    if (e2.changedTouches) {
      touches = e2.changedTouches[0];
    } else {
      touches = e2.mp.changedTouches[0];
    }
    if (touches && this.opts.enableScroll === true) {
      var _touches$ = getTouches(touches, this.opts, e2);
      var _distance;
      _distance = _touches$.x - this.scrollOption.startTouchX;
      var currentOffset = this.scrollOption.currentOffset;
      var validDistance = calValidDistance(currentOffset + _distance, this.opts.chartData, this.config, this.opts);
      this.scrollOption.distance = _distance = validDistance - currentOffset;
      var opts = assign$2({}, this.opts, {
        _scrollDistance_: currentOffset + _distance,
        animation: false
      });
      drawCharts.call(this, opts.type, opts, this.config, this.context);
      return currentOffset + _distance;
    }
  };
  Charts.prototype.scrollEnd = function(e2) {
    if (this.opts.enableScroll === true) {
      var _scrollOption = this.scrollOption, currentOffset = _scrollOption.currentOffset, distance = _scrollOption.distance;
      this.scrollOption.currentOffset = currentOffset + distance;
      this.scrollOption.distance = 0;
    }
  };
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = Charts;
  }
  const _sfc_main$1 = {
    data() {
      return {
        taskId: "",
        deviceList: [],
        chartType: "temperature",
        // temperature | humidity
        rangeMinutes: 60,
        chartData: {
          categories: [],
          devices: []
          // 每个设备的数据: { deviceId, deviceSn, temperature: [], humidity: [] }
        },
        errorMsg: "",
        isLoading: false,
        cWidth: 0,
        cHeight: 0,
        pixelRatio: 1,
        // 视觉缩放（用于移动端让刻度/线条不显得过大）
        chartScale: 1,
        lineChart: null,
        pendingRedraw: false,
        latestTimestamp: null
        // 记录全局最新的时间戳
      };
    },
    computed: {
      chartHasData() {
        return this.chartData.categories && this.chartData.categories.length > 0 && this.chartData.devices && this.chartData.devices.length > 0;
      },
      currentUnit() {
        return this.chartType === "temperature" ? "℃" : "%RH";
      },
      latestDataTimeDisplay() {
        return this.formatFullTimestamp(this.latestTimestamp);
      },
      chartStats() {
        const devices = this.chartData.devices || [];
        const key = this.chartType === "temperature" ? "temperature" : "humidity";
        const values = [];
        devices.forEach((d2) => {
          const arr = Array.isArray(d2[key]) ? d2[key] : [];
          arr.forEach((v2) => {
            const num = Number(v2);
            if (Number.isFinite(num))
              values.push(num);
          });
        });
        if (values.length === 0) {
          return { avg: null, max: null, min: null };
        }
        const sum = values.reduce((acc, cur) => acc + cur, 0);
        return {
          avg: sum / values.length,
          max: Math.max(...values),
          min: Math.min(...values)
        };
      }
    },
    onLoad(options) {
      this.taskId = options.taskId || "";
      const sys2 = uni.getSystemInfoSync();
      Number(sys2.pixelRatio) || 1;
      this.pixelRatio = 1;
      const ww = Number(sys2.windowWidth) || 375;
      this.chartScale = Math.max(0.65, Math.min(0.95, ww / 430));
      this.cWidth = Math.max(1, sys2.windowWidth || uni.upx2px(750));
      this.cHeight = uni.upx2px(720);
      this.loadDeviceFromCache();
    },
    onReady() {
      this.ensureCanvasSize();
    },
    onShow() {
      this.ensureCanvasSize();
    },
    async onPullDownRefresh() {
      if (this.isLoading) {
        uni.stopPullDownRefresh();
        return;
      }
      try {
        await this.fetchAllDevicesData();
      } finally {
        uni.stopPullDownRefresh();
      }
    },
    methods: {
      ensureCanvasSize() {
        const tryGetSize = (leftTry = 6) => {
          this.$nextTick(() => {
            const q2 = uni.createSelectorQuery().in(this);
            q2.select(".chart-box").boundingClientRect((rect) => {
              const w2 = rect && rect.width ? Math.round(rect.width) : 0;
              const h2 = rect && rect.height ? Math.round(rect.height) : 0;
              if (w2 > 0 && h2 > 0) {
                const changed = this.cWidth !== w2 || this.cHeight !== h2;
                this.cWidth = w2;
                if (this.chartHasData && (this.pendingRedraw || changed)) {
                  this.rebuildChart();
                  this.pendingRedraw = false;
                }
                return;
              }
              if (leftTry > 0) {
                setTimeout(() => tryGetSize(leftTry - 1), 80);
              } else {
                if (this.chartHasData) {
                  this.rebuildChart();
                }
              }
            }).exec();
          });
        };
        tryGetSize();
      },
      setRange(minutes) {
        if (this.rangeMinutes === minutes)
          return;
        this.rangeMinutes = minutes;
        this.fetchAllDevicesData();
      },
      loadDeviceFromCache() {
        try {
          const keys = uni.getStorageInfoSync().keys || [];
          for (const key of keys) {
            if (!key.endsWith("_tasks"))
              continue;
            const cached = uni.getStorageSync(key);
            const tasks = cached && cached.tasks || cached && cached.data && cached.data.tasks;
            if (!Array.isArray(tasks))
              continue;
            const found = tasks.find((t2) => t2 && (t2._id === this.taskId || t2.taskId === this.taskId));
            if (found && Array.isArray(found.deviceSnList)) {
              this.deviceList = found.deviceSnList.map((d2, idx) => ({
                __key: d2.__key || `dev_${idx}`,
                deviceId: d2.deviceId || "",
                deviceSn: d2.deviceSn || ""
              }));
              if (this.deviceList.length > 0) {
                this.fetchAllDevicesData();
              }
              return;
            }
          }
          this.deviceList = [];
        } catch (e2) {
          formatAppLog("warn", "at pages/task/realtime-data/realtime-data.vue:316", "读取设备缓存失败", e2);
          this.deviceList = [];
        }
      },
      async fetchAllDevicesData() {
        if (!this.deviceList || this.deviceList.length === 0) {
          return;
        }
        this.isLoading = true;
        this.errorMsg = "";
        try {
          const validDevices = this.deviceList.filter((d2) => d2 && d2.deviceSn);
          if (validDevices.length === 0) {
            this.errorMsg = "没有有效的设备SN";
            this.isLoading = false;
            return;
          }
          const devicePromises = validDevices.map(async (device) => {
            try {
              const sql = `SELECT temperature, humidity FROM root.cvdd.${device.deviceSn}  LIMIT ${this.rangeMinutes}`;
              const data = await apiService.post("/api/iotdb/query", { sql }, { auth: false });
              const timestamps = data.timestamps || [];
              const toNumberOrNull = (v2) => {
                const num = Number(v2);
                return Number.isFinite(num) ? num : null;
              };
              const temperature = (data.values && data.values[0] || []).map(toNumberOrNull);
              const humidity = (data.values && data.values[1] || []).map(toNumberOrNull);
              return {
                deviceId: device.deviceId || "",
                deviceSn: device.deviceSn || "",
                timestamps,
                temperature,
                humidity
              };
            } catch (e2) {
              formatAppLog("error", "at pages/task/realtime-data/realtime-data.vue:356", `加载设备 ${device.deviceSn} 数据失败:`, e2);
              return null;
            }
          });
          const results = await Promise.all(devicePromises);
          const validResults = results.filter((r2) => r2 !== null && r2.timestamps && r2.timestamps.length > 0);
          if (validResults.length === 0) {
            this.errorMsg = "所有设备数据加载失败";
            this.chartData = { categories: [], devices: [] };
            this.latestTimestamp = null;
            this.clearChart();
            return;
          }
          const baseTimestamps = this.normalizeTimestampList(validResults[0].timestamps);
          const categories = baseTimestamps.map((ts2) => this.formatTime(ts2));
          this.latestTimestamp = this.getLatestTimestamp(baseTimestamps);
          const devices = validResults.map((r2) => {
            const normalizedTs = this.normalizeTimestampList(r2.timestamps);
            return {
              deviceId: r2.deviceId,
              deviceSn: r2.deviceSn,
              temperature: r2.temperature,
              humidity: r2.humidity,
              timestamps: normalizedTs,
              latestTimestamp: this.getLatestTimestamp(normalizedTs)
            };
          });
          this.chartData = {
            categories,
            devices
          };
          this.drawLine();
        } catch (e2) {
          formatAppLog("error", "at pages/task/realtime-data/realtime-data.vue:396", "获取所有设备数据失败", e2);
          this.errorMsg = e2 && e2.message ? e2.message : "请求失败";
          this.chartData = { categories: [], devices: [] };
          this.latestTimestamp = null;
          this.clearChart();
        } finally {
          this.isLoading = false;
        }
      },
      formatTime(ts2) {
        const d2 = new Date(Number(ts2));
        const mm = String(d2.getMonth() + 1).padStart(2, "0");
        const dd = String(d2.getDate()).padStart(2, "0");
        const hh = String(d2.getHours()).padStart(2, "0");
        const mi = String(d2.getMinutes()).padStart(2, "0");
        return `${mm}-${dd}|${hh}:${mi}`;
      },
      // 规范化时间戳列表
      normalizeTimestampList(list) {
        if (!Array.isArray(list))
          return [];
        return list.map((v2) => Number(v2)).filter((v2) => Number.isFinite(v2));
      },
      // 取列表中最新的时间戳
      getLatestTimestamp(list) {
        const arr = this.normalizeTimestampList(list);
        if (!arr.length)
          return null;
        return Math.max(...arr);
      },
      // 格式化完整时间 YYYY-MM-DD HH:MM
      formatFullTimestamp(ts2) {
        if (!Number.isFinite(ts2))
          return "";
        const d2 = new Date(Number(ts2));
        const yyyy = d2.getFullYear();
        const mm = String(d2.getMonth() + 1).padStart(2, "0");
        const dd = String(d2.getDate()).padStart(2, "0");
        const hh = String(d2.getHours()).padStart(2, "0");
        const mi = String(d2.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
      },
      // 格式化短时间 MM-DD HH:MM
      formatShortTimestamp(ts2) {
        if (!Number.isFinite(ts2))
          return "";
        const d2 = new Date(Number(ts2));
        const mm = String(d2.getMonth() + 1).padStart(2, "0");
        const dd = String(d2.getDate()).padStart(2, "0");
        const hh = String(d2.getHours()).padStart(2, "0");
        const mi = String(d2.getMinutes()).padStart(2, "0");
        return `${mm}-${dd} ${hh}:${mi}`;
      },
      // 展示设备最新时间
      formatDeviceLatestTime(device) {
        if (!device || !device.latestTimestamp)
          return "--";
        const txt = this.formatShortTimestamp(device.latestTimestamp);
        return txt || "--";
      },
      // uCharts 版本不走 formatter（见 components/u-charts/u-charts.js），保留该函数不再使用
      formatXAxisLabel(val) {
        return val || "";
      },
      getSeries() {
        const series = [];
        const devices = this.chartData.devices || [];
        if (devices.length === 0)
          return series;
        const colors = ["#f97316", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
        devices.forEach((device, index2) => {
          const deviceLabel = device.deviceId || device.deviceSn || `设备${index2 + 1}`;
          const dataKey = this.chartType === "temperature" ? "temperature" : "humidity";
          const color = colors[index2 % colors.length];
          series.push({
            name: `${deviceLabel}`,
            data: device[dataKey] || [],
            color
          });
        });
        return series;
      },
      getXAxisKeep() {
        const len = (this.chartData.categories || []).length;
        if (len <= 8) {
          return new Set(Array.from({ length: len }, (_2, i2) => i2));
        }
        const step = Math.max(1, Math.ceil(len / 8));
        const keep = /* @__PURE__ */ new Set();
        const tailGuardIndex = Math.max(0, len - step);
        for (let i2 = 0; i2 < tailGuardIndex; i2 += step) {
          keep.add(i2);
        }
        keep.add(len - 1);
        for (let i2 = tailGuardIndex; i2 < len - 1; i2++) {
          if (keep.has(i2))
            keep.delete(i2);
        }
        formatAppLog("log", "at pages/task/realtime-data/realtime-data.vue:508", "xAxis keep index:", Array.from(keep).sort((a2, b2) => a2 - b2), "len:", len, "step:", step);
        return keep;
      },
      getDisplayCategories() {
        const keep = this.getXAxisKeep();
        const cats = this.chartData.categories || [];
        return cats.map((v2, i2) => keep.has(i2) ? v2 : "");
      },
      drawLine(clearOnly = false) {
        if (clearOnly) {
          this.clearChart();
          return;
        }
        if (!this.chartHasData)
          return;
        formatAppLog("log", "at pages/task/realtime-data/realtime-data.vue:524", "drawLine categories:", this.chartData.categories);
        if (!this.cWidth || !this.cHeight) {
          this.pendingRedraw = true;
          this.ensureCanvasSize();
          return;
        }
        const s2 = this.chartScale || 1;
        const fontSize = Math.max(9, Math.round(11 * s2));
        const padding = [
          Math.round(10 * s2),
          // 右侧适当放大，避免最后一个刻度文字被 canvas 边缘裁掉
          Math.round(18 * s2),
          // 底部加大留白，避免 x 轴标签与时间文字贴得过近
          Math.round(-6 * s2),
          Math.round(6 * s2)
        ];
        const lineWidth = Math.max(1, Math.round(2 * s2));
        if (this.lineChart) {
          this.lineChart.updateData({
            categories: this.getDisplayCategories(),
            series: this.getSeries()
          });
          return;
        }
        this.lineChart = new Charts({
          $this: this,
          canvasId: "realtimeLine",
          type: "line",
          fontSize,
          padding,
          legend: { show: true, fontSize: Math.max(9, Math.round(10 * s2)), itemGap: Math.round(8 * s2), margin: Math.round(4 * s2) },
          dataLabel: false,
          // 移动端点太密时会显得“粗大”，这里默认关闭（触摸 tooltip 仍可用）
          dataPointShape: false,
          background: "#FFFFFF",
          pixelRatio: this.pixelRatio,
          categories: this.getDisplayCategories(),
          series: this.getSeries(),
          animation: false,
          // 关闭渲染动画，避免线条进场动效
          enableScroll: false,
          xAxis: {
            disableGrid: false,
            itemCount: 4,
            // justify 会在右侧额外留出一个 eachSpacing 的空白，真机上观感更明显；用 center 更贴边
            boundaryGap: "center",
            rotateLabel: false,
            lineHeight: Math.round(32 * s2),
            gridType: "dash",
            gridColor: "#e5e7eb",
            dashLength: 4
            // 注意：当前 uCharts 版本 drawXAxis 不会调用 formatter
          },
          yAxis: {
            gridType: "dash",
            // Y 轴刻度太少：增加分割段数，让刻度更密
            splitNumber: 8,
            format: (val) => val === null || val === void 0 ? "" : Number(val).toFixed(1)
          },
          width: this.cWidth * this.pixelRatio,
          height: this.cHeight * this.pixelRatio,
          extra: {
            line: { type: "curve", width: lineWidth },
            tooltip: { showBox: true }
            // uCharts 版本不支持 xAxis.textBreak，这里移除，换行由 u-charts.js 的 "|" 两行绘制实现
          }
        });
      },
      rebuildChart() {
        this.lineChart = null;
        this.drawLine();
      },
      clearChart() {
        this.lineChart = null;
      },
      switchChartType(type) {
        if (this.chartType === type)
          return;
        this.chartType = type;
        this.rebuildChart();
      },
      touchLine(e2) {
        if (this.lineChart)
          this.lineChart.scrollStart(e2);
      },
      moveLine(e2) {
        if (this.lineChart)
          this.lineChart.scroll(e2);
      },
      touchEnd(e2) {
        if (this.lineChart) {
          this.lineChart.scrollEnd(e2);
          this.lineChart.showToolTip(e2, {
            // 时间在弹窗顶部单独一行显示
            title: (category, index2) => {
              const raw = (this.chartData.categories || [])[index2] || category || "";
              if (typeof raw === "string" && raw.includes("|")) {
                const [d2, t2] = raw.split("|");
                return `${d2} ${t2}`;
              }
              return raw;
            },
            // category 可能是“稀疏显示用”的 categories（部分为空），这里用 index 从完整 categories 里取时间
            format: (item, category, index2) => {
              const unit = this.chartType === "temperature" ? "℃" : "%RH";
              const val = item.data === null || item.data === void 0 ? "--" : item.data;
              return `${item.name}  ●${val}${unit}`;
            }
          });
        }
      },
      getDeviceDataCount(device) {
        if (device && device.temperature && Array.isArray(device.temperature)) {
          return device.temperature.length;
        }
        if (device && device.humidity && Array.isArray(device.humidity)) {
          return device.humidity.length;
        }
        return 0;
      },
      getDeviceCountStatus(device) {
        const count = this.getDeviceDataCount(device);
        if (!count) {
          return "device-count-error";
        }
        if (count === this.rangeMinutes) {
          return "device-count-success";
        }
        return "device-count-warning";
      },
      formatStat(val) {
        if (val === null || val === void 0 || Number.isNaN(val))
          return "--";
        const fixed = this.chartType === "temperature" ? 1 : 0;
        const num = Number(val);
        if (!Number.isFinite(num))
          return "--";
        return num.toFixed(fixed);
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "realtime-page" }, [
      vue.createElementVNode("view", { class: "chart-panel" }, [
        vue.createElementVNode("view", { class: "chart-header" }, [
          vue.createElementVNode("view", { class: "range-group" }, [
            vue.createElementVNode(
              "button",
              {
                class: vue.normalizeClass(["range-btn", { active: $data.rangeMinutes === 60 }]),
                onClick: _cache[0] || (_cache[0] = ($event) => $options.setRange(60))
              },
              "1小时",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "button",
              {
                class: vue.normalizeClass(["range-btn", { active: $data.rangeMinutes === 300 }]),
                onClick: _cache[1] || (_cache[1] = ($event) => $options.setRange(300))
              },
              "5小时",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "button",
              {
                class: vue.normalizeClass(["range-btn", { active: $data.rangeMinutes === 1440 }]),
                onClick: _cache[2] || (_cache[2] = ($event) => $options.setRange(1440))
              },
              "1天",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "button",
              {
                class: vue.normalizeClass(["range-btn", { active: $data.rangeMinutes === 7200 }]),
                onClick: _cache[3] || (_cache[3] = ($event) => $options.setRange(7200))
              },
              "5天",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "button",
              {
                class: vue.normalizeClass(["range-btn", { active: $data.rangeMinutes === 14400 }]),
                onClick: _cache[4] || (_cache[4] = ($event) => $options.setRange(14400))
              },
              "10天",
              2
              /* CLASS */
            )
          ]),
          vue.createElementVNode("view", { class: "toggle-group" }, [
            vue.createElementVNode(
              "button",
              {
                class: vue.normalizeClass(["toggle-btn", { active: $data.chartType === "temperature" }]),
                onClick: _cache[5] || (_cache[5] = ($event) => $options.switchChartType("temperature"))
              },
              " 温度 ",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "button",
              {
                class: vue.normalizeClass(["toggle-btn", { active: $data.chartType === "humidity" }]),
                onClick: _cache[6] || (_cache[6] = ($event) => $options.switchChartType("humidity"))
              },
              " 湿度 ",
              2
              /* CLASS */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "chart-box" }, [
          vue.createElementVNode("canvas", {
            "canvas-id": "realtimeLine",
            id: "realtimeLine",
            class: "chart-canvas",
            width: Math.round($data.cWidth * $data.pixelRatio),
            height: Math.round($data.cHeight * $data.pixelRatio),
            style: vue.normalizeStyle({ width: $data.cWidth + "px", height: $data.cHeight + "px" }),
            onTouchstart: _cache[7] || (_cache[7] = (...args) => $options.touchLine && $options.touchLine(...args)),
            onTouchmove: _cache[8] || (_cache[8] = (...args) => $options.moveLine && $options.moveLine(...args)),
            onTouchend: _cache[9] || (_cache[9] = (...args) => $options.touchEnd && $options.touchEnd(...args))
          }, null, 44, ["width", "height"]),
          $data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "loading-overlay",
            "aria-label": "曲线数据加载中"
          }, [
            vue.createElementVNode("view", { class: "loading-spinner" })
          ])) : vue.createCommentVNode("v-if", true),
          !$options.chartHasData && !$data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "placeholder"
          }, " 正在加载设备数据... ")) : vue.createCommentVNode("v-if", true)
        ]),
        $options.chartHasData && !$data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "chart-stats"
        }, [
          vue.createElementVNode("view", { class: "stat-item" }, [
            vue.createElementVNode("text", { class: "stat-label" }, "最大值"),
            vue.createElementVNode("text", { class: "stat-value" }, [
              vue.createTextVNode(
                vue.toDisplayString($options.formatStat($options.chartStats.max)) + " ",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "stat-unit" },
                vue.toDisplayString($options.currentUnit),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "stat-item" }, [
            vue.createElementVNode("text", { class: "stat-label" }, "平均值"),
            vue.createElementVNode("text", { class: "stat-value" }, [
              vue.createTextVNode(
                vue.toDisplayString($options.formatStat($options.chartStats.avg)) + " ",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "stat-unit" },
                vue.toDisplayString($options.currentUnit),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "stat-item" }, [
            vue.createElementVNode("text", { class: "stat-label" }, "最小值"),
            vue.createElementVNode("text", { class: "stat-value" }, [
              vue.createTextVNode(
                vue.toDisplayString($options.formatStat($options.chartStats.min)) + " ",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "stat-unit" },
                vue.toDisplayString($options.currentUnit),
                1
                /* TEXT */
              )
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", { class: "device-list-panel" }, [
        vue.createElementVNode("view", { class: "device-list-section" }, [
          vue.createElementVNode("view", { class: "device-list-header" }, [
            vue.createElementVNode("view", { class: "device-list-header-left" }, [
              vue.createElementVNode("text", { class: "device-list-title" }, "设备数据统计"),
              vue.createElementVNode(
                "text",
                { class: "device-list-subtitle" },
                vue.toDisplayString($data.deviceList.length) + "个设备",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                {
                  class: "device-latest-global",
                  "aria-label": "最新时间",
                  title: "最新时间"
                },
                " 🕒 " + vue.toDisplayString($options.latestDataTimeDisplay || "--"),
                1
                /* TEXT */
              ),
              $data.isLoading ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 0,
                class: "loading-text-inline",
                "aria-label": "加载中",
                title: "加载中"
              }, " ⏳ ")) : vue.createCommentVNode("v-if", true),
              $data.errorMsg && !$data.isLoading ? (vue.openBlock(), vue.createElementBlock("text", {
                key: 1,
                class: "error-text-inline",
                "aria-label": `错误：${$data.errorMsg}`,
                title: $data.errorMsg
              }, " ⚠️ ", 8, ["aria-label", "title"])) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          $data.chartData.devices && $data.chartData.devices.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "device-list"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.chartData.devices, (device, index2) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index2,
                  class: "device-item"
                }, [
                  vue.createElementVNode("view", { class: "device-row" }, [
                    vue.createElementVNode("view", { class: "device-main" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "device-label" },
                        vue.toDisplayString(device.deviceId || device.deviceSn || `设备${index2 + 1}`),
                        1
                        /* TEXT */
                      ),
                      device.deviceSn && device.deviceSn !== device.deviceId ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: 0,
                          class: "device-sn-inline"
                        },
                        " (" + vue.toDisplayString(device.deviceSn) + ") ",
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true),
                      vue.createElementVNode(
                        "text",
                        { class: "device-latest-inline" },
                        "🕒:" + vue.toDisplayString($options.formatDeviceLatestTime(device)),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "device-count-inline" }, [
                      vue.createElementVNode("text", {
                        class: "count-label",
                        "aria-label": "数据条数"
                      }, "📊"),
                      vue.createElementVNode(
                        "text",
                        {
                          class: vue.normalizeClass(["count-value", $options.getDeviceCountStatus(device)])
                        },
                        vue.toDisplayString($options.getDeviceDataCount(device)),
                        3
                        /* TEXT, CLASS */
                      )
                    ])
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "empty-device-list"
          }, [
            vue.createElementVNode("text", null, "暂无设备数据")
          ]))
        ])
      ])
    ]);
  }
  const PagesTaskRealtimeDataRealtimeData = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-b858ed83"], ["__file", "C:/Users/Administrator/Project/ColdVerifReport/coldverifreport_app2/pages/task/realtime-data/realtime-data.vue"]]);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/task/category/category", PagesTaskCategoryCategory);
  __definePage("pages/task/category-detail/category-detail", PagesTaskCategoryDetailCategoryDetail);
  __definePage("pages/profile/profile", PagesProfileProfile);
  __definePage("pages/task/task-detail/task-detail", PagesTaskTaskDetailTaskDetail);
  __definePage("pages/task/realtime-data/realtime-data", PagesTaskRealtimeDataRealtimeData);
  function getDevtoolsGlobalHook$1() {
    return getTarget$1().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget$1() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable$1 = typeof Proxy === "function";
  const HOOK_SETUP$1 = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET$1 = "plugin:settings:set";
  let ApiProxy$1 = class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = { ...defaultSettings };
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e2) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e2) {
          }
          currentSettings = value;
        }
      };
      hook.on(HOOK_PLUGIN_SETTINGS_SET$1, (pluginId, value) => {
        if (pluginId === this.plugin.id) {
          this.fallbacks.setSettings(value);
        }
      });
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  };
  function setupDevtoolsPlugin$1(pluginDescriptor, setupFn) {
    const target = getTarget$1();
    const hook = getDevtoolsGlobalHook$1();
    const enableProxy = isProxyAvailable$1 && pluginDescriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP$1, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy$1(pluginDescriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * vuex v4.1.0
   * (c) 2022 Evan You
   * @license MIT
   */
  var storeKey = "store";
  function useStore(key) {
    if (key === void 0)
      key = null;
    return vue.inject(key !== null ? key : storeKey);
  }
  function find(list, f2) {
    return list.filter(f2)[0];
  }
  function deepCopy(obj, cache) {
    if (cache === void 0)
      cache = [];
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    var hit = find(cache, function(c2) {
      return c2.original === obj;
    });
    if (hit) {
      return hit.copy;
    }
    var copy = Array.isArray(obj) ? [] : {};
    cache.push({
      original: obj,
      copy
    });
    Object.keys(obj).forEach(function(key) {
      copy[key] = deepCopy(obj[key], cache);
    });
    return copy;
  }
  function forEachValue(obj, fn) {
    Object.keys(obj).forEach(function(key) {
      return fn(obj[key], key);
    });
  }
  function isObject(obj) {
    return obj !== null && typeof obj === "object";
  }
  function isPromise(val) {
    return val && typeof val.then === "function";
  }
  function assert(condition, msg) {
    if (!condition) {
      throw new Error("[vuex] " + msg);
    }
  }
  function partial(fn, arg) {
    return function() {
      return fn(arg);
    };
  }
  function genericSubscribe(fn, subs, options) {
    if (subs.indexOf(fn) < 0) {
      options && options.prepend ? subs.unshift(fn) : subs.push(fn);
    }
    return function() {
      var i2 = subs.indexOf(fn);
      if (i2 > -1) {
        subs.splice(i2, 1);
      }
    };
  }
  function resetStore(store2, hot) {
    store2._actions = /* @__PURE__ */ Object.create(null);
    store2._mutations = /* @__PURE__ */ Object.create(null);
    store2._wrappedGetters = /* @__PURE__ */ Object.create(null);
    store2._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
    var state = store2.state;
    installModule(store2, state, [], store2._modules.root, true);
    resetStoreState(store2, state, hot);
  }
  function resetStoreState(store2, state, hot) {
    var oldState = store2._state;
    var oldScope = store2._scope;
    store2.getters = {};
    store2._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
    var wrappedGetters = store2._wrappedGetters;
    var computedObj = {};
    var computedCache = {};
    var scope = vue.effectScope(true);
    scope.run(function() {
      forEachValue(wrappedGetters, function(fn, key) {
        computedObj[key] = partial(fn, store2);
        computedCache[key] = vue.computed(function() {
          return computedObj[key]();
        });
        Object.defineProperty(store2.getters, key, {
          get: function() {
            return computedCache[key].value;
          },
          enumerable: true
          // for local getters
        });
      });
    });
    store2._state = vue.reactive({
      data: state
    });
    store2._scope = scope;
    if (store2.strict) {
      enableStrictMode(store2);
    }
    if (oldState) {
      if (hot) {
        store2._withCommit(function() {
          oldState.data = null;
        });
      }
    }
    if (oldScope) {
      oldScope.stop();
    }
  }
  function installModule(store2, rootState, path, module2, hot) {
    var isRoot = !path.length;
    var namespace = store2._modules.getNamespace(path);
    if (module2.namespaced) {
      if (store2._modulesNamespaceMap[namespace] && true) {
        console.error("[vuex] duplicate namespace " + namespace + " for the namespaced module " + path.join("/"));
      }
      store2._modulesNamespaceMap[namespace] = module2;
    }
    if (!isRoot && !hot) {
      var parentState = getNestedState(rootState, path.slice(0, -1));
      var moduleName = path[path.length - 1];
      store2._withCommit(function() {
        {
          if (moduleName in parentState) {
            console.warn(
              '[vuex] state field "' + moduleName + '" was overridden by a module with the same name at "' + path.join(".") + '"'
            );
          }
        }
        parentState[moduleName] = module2.state;
      });
    }
    var local = module2.context = makeLocalContext(store2, namespace, path);
    module2.forEachMutation(function(mutation, key) {
      var namespacedType = namespace + key;
      registerMutation(store2, namespacedType, mutation, local);
    });
    module2.forEachAction(function(action, key) {
      var type = action.root ? key : namespace + key;
      var handler = action.handler || action;
      registerAction(store2, type, handler, local);
    });
    module2.forEachGetter(function(getter, key) {
      var namespacedType = namespace + key;
      registerGetter(store2, namespacedType, getter, local);
    });
    module2.forEachChild(function(child, key) {
      installModule(store2, rootState, path.concat(key), child, hot);
    });
  }
  function makeLocalContext(store2, namespace, path) {
    var noNamespace = namespace === "";
    var local = {
      dispatch: noNamespace ? store2.dispatch : function(_type, _payload, _options) {
        var args = unifyObjectStyle(_type, _payload, _options);
        var payload = args.payload;
        var options = args.options;
        var type = args.type;
        if (!options || !options.root) {
          type = namespace + type;
          if (!store2._actions[type]) {
            console.error("[vuex] unknown local action type: " + args.type + ", global type: " + type);
            return;
          }
        }
        return store2.dispatch(type, payload);
      },
      commit: noNamespace ? store2.commit : function(_type, _payload, _options) {
        var args = unifyObjectStyle(_type, _payload, _options);
        var payload = args.payload;
        var options = args.options;
        var type = args.type;
        if (!options || !options.root) {
          type = namespace + type;
          if (!store2._mutations[type]) {
            console.error("[vuex] unknown local mutation type: " + args.type + ", global type: " + type);
            return;
          }
        }
        store2.commit(type, payload, options);
      }
    };
    Object.defineProperties(local, {
      getters: {
        get: noNamespace ? function() {
          return store2.getters;
        } : function() {
          return makeLocalGetters(store2, namespace);
        }
      },
      state: {
        get: function() {
          return getNestedState(store2.state, path);
        }
      }
    });
    return local;
  }
  function makeLocalGetters(store2, namespace) {
    if (!store2._makeLocalGettersCache[namespace]) {
      var gettersProxy = {};
      var splitPos = namespace.length;
      Object.keys(store2.getters).forEach(function(type) {
        if (type.slice(0, splitPos) !== namespace) {
          return;
        }
        var localType = type.slice(splitPos);
        Object.defineProperty(gettersProxy, localType, {
          get: function() {
            return store2.getters[type];
          },
          enumerable: true
        });
      });
      store2._makeLocalGettersCache[namespace] = gettersProxy;
    }
    return store2._makeLocalGettersCache[namespace];
  }
  function registerMutation(store2, type, handler, local) {
    var entry = store2._mutations[type] || (store2._mutations[type] = []);
    entry.push(function wrappedMutationHandler(payload) {
      handler.call(store2, local.state, payload);
    });
  }
  function registerAction(store2, type, handler, local) {
    var entry = store2._actions[type] || (store2._actions[type] = []);
    entry.push(function wrappedActionHandler(payload) {
      var res2 = handler.call(store2, {
        dispatch: local.dispatch,
        commit: local.commit,
        getters: local.getters,
        state: local.state,
        rootGetters: store2.getters,
        rootState: store2.state
      }, payload);
      if (!isPromise(res2)) {
        res2 = Promise.resolve(res2);
      }
      if (store2._devtoolHook) {
        return res2.catch(function(err) {
          store2._devtoolHook.emit("vuex:error", err);
          throw err;
        });
      } else {
        return res2;
      }
    });
  }
  function registerGetter(store2, type, rawGetter, local) {
    if (store2._wrappedGetters[type]) {
      {
        console.error("[vuex] duplicate getter key: " + type);
      }
      return;
    }
    store2._wrappedGetters[type] = function wrappedGetter(store22) {
      return rawGetter(
        local.state,
        // local state
        local.getters,
        // local getters
        store22.state,
        // root state
        store22.getters
        // root getters
      );
    };
  }
  function enableStrictMode(store2) {
    vue.watch(function() {
      return store2._state.data;
    }, function() {
      {
        assert(store2._committing, "do not mutate vuex store state outside mutation handlers.");
      }
    }, { deep: true, flush: "sync" });
  }
  function getNestedState(state, path) {
    return path.reduce(function(state2, key) {
      return state2[key];
    }, state);
  }
  function unifyObjectStyle(type, payload, options) {
    if (isObject(type) && type.type) {
      options = payload;
      payload = type;
      type = type.type;
    }
    {
      assert(typeof type === "string", "expects string as the type, but found " + typeof type + ".");
    }
    return { type, payload, options };
  }
  var LABEL_VUEX_BINDINGS = "vuex bindings";
  var MUTATIONS_LAYER_ID$1 = "vuex:mutations";
  var ACTIONS_LAYER_ID = "vuex:actions";
  var INSPECTOR_ID$1 = "vuex";
  var actionId = 0;
  function addDevtools(app, store2) {
    setupDevtoolsPlugin$1(
      {
        id: "org.vuejs.vuex",
        app,
        label: "Vuex",
        homepage: "https://next.vuex.vuejs.org/",
        logo: "https://vuejs.org/images/icons/favicon-96x96.png",
        packageName: "vuex",
        componentStateTypes: [LABEL_VUEX_BINDINGS]
      },
      function(api) {
        api.addTimelineLayer({
          id: MUTATIONS_LAYER_ID$1,
          label: "Vuex Mutations",
          color: COLOR_LIME_500
        });
        api.addTimelineLayer({
          id: ACTIONS_LAYER_ID,
          label: "Vuex Actions",
          color: COLOR_LIME_500
        });
        api.addInspector({
          id: INSPECTOR_ID$1,
          label: "Vuex",
          icon: "storage",
          treeFilterPlaceholder: "Filter stores..."
        });
        api.on.getInspectorTree(function(payload) {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID$1) {
            if (payload.filter) {
              var nodes = [];
              flattenStoreForInspectorTree(nodes, store2._modules.root, payload.filter, "");
              payload.rootNodes = nodes;
            } else {
              payload.rootNodes = [
                formatStoreForInspectorTree$1(store2._modules.root, "")
              ];
            }
          }
        });
        api.on.getInspectorState(function(payload) {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID$1) {
            var modulePath = payload.nodeId;
            makeLocalGetters(store2, modulePath);
            payload.state = formatStoreForInspectorState$1(
              getStoreModule(store2._modules, modulePath),
              modulePath === "root" ? store2.getters : store2._makeLocalGettersCache,
              modulePath
            );
          }
        });
        api.on.editInspectorState(function(payload) {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID$1) {
            var modulePath = payload.nodeId;
            var path = payload.path;
            if (modulePath !== "root") {
              path = modulePath.split("/").filter(Boolean).concat(path);
            }
            store2._withCommit(function() {
              payload.set(store2._state.data, path, payload.state.value);
            });
          }
        });
        store2.subscribe(function(mutation, state) {
          var data = {};
          if (mutation.payload) {
            data.payload = mutation.payload;
          }
          data.state = state;
          api.notifyComponentUpdate();
          api.sendInspectorTree(INSPECTOR_ID$1);
          api.sendInspectorState(INSPECTOR_ID$1);
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID$1,
            event: {
              time: Date.now(),
              title: mutation.type,
              data
            }
          });
        });
        store2.subscribeAction({
          before: function(action, state) {
            var data = {};
            if (action.payload) {
              data.payload = action.payload;
            }
            action._id = actionId++;
            action._time = Date.now();
            data.state = state;
            api.addTimelineEvent({
              layerId: ACTIONS_LAYER_ID,
              event: {
                time: action._time,
                title: action.type,
                groupId: action._id,
                subtitle: "start",
                data
              }
            });
          },
          after: function(action, state) {
            var data = {};
            var duration = Date.now() - action._time;
            data.duration = {
              _custom: {
                type: "duration",
                display: duration + "ms",
                tooltip: "Action duration",
                value: duration
              }
            };
            if (action.payload) {
              data.payload = action.payload;
            }
            data.state = state;
            api.addTimelineEvent({
              layerId: ACTIONS_LAYER_ID,
              event: {
                time: Date.now(),
                title: action.type,
                groupId: action._id,
                subtitle: "end",
                data
              }
            });
          }
        });
      }
    );
  }
  var COLOR_LIME_500 = 8702998;
  var COLOR_DARK = 6710886;
  var COLOR_WHITE = 16777215;
  var TAG_NAMESPACED = {
    label: "namespaced",
    textColor: COLOR_WHITE,
    backgroundColor: COLOR_DARK
  };
  function extractNameFromPath(path) {
    return path && path !== "root" ? path.split("/").slice(-2, -1)[0] : "Root";
  }
  function formatStoreForInspectorTree$1(module2, path) {
    return {
      id: path || "root",
      // all modules end with a `/`, we want the last segment only
      // cart/ -> cart
      // nested/cart/ -> cart
      label: extractNameFromPath(path),
      tags: module2.namespaced ? [TAG_NAMESPACED] : [],
      children: Object.keys(module2._children).map(
        function(moduleName) {
          return formatStoreForInspectorTree$1(
            module2._children[moduleName],
            path + moduleName + "/"
          );
        }
      )
    };
  }
  function flattenStoreForInspectorTree(result, module2, filter, path) {
    if (path.includes(filter)) {
      result.push({
        id: path || "root",
        label: path.endsWith("/") ? path.slice(0, path.length - 1) : path || "Root",
        tags: module2.namespaced ? [TAG_NAMESPACED] : []
      });
    }
    Object.keys(module2._children).forEach(function(moduleName) {
      flattenStoreForInspectorTree(result, module2._children[moduleName], filter, path + moduleName + "/");
    });
  }
  function formatStoreForInspectorState$1(module2, getters, path) {
    getters = path === "root" ? getters : getters[path];
    var gettersKeys = Object.keys(getters);
    var storeState = {
      state: Object.keys(module2.state).map(function(key) {
        return {
          key,
          editable: true,
          value: module2.state[key]
        };
      })
    };
    if (gettersKeys.length) {
      var tree = transformPathsToObjectTree(getters);
      storeState.getters = Object.keys(tree).map(function(key) {
        return {
          key: key.endsWith("/") ? extractNameFromPath(key) : key,
          editable: false,
          value: canThrow(function() {
            return tree[key];
          })
        };
      });
    }
    return storeState;
  }
  function transformPathsToObjectTree(getters) {
    var result = {};
    Object.keys(getters).forEach(function(key) {
      var path = key.split("/");
      if (path.length > 1) {
        var target = result;
        var leafKey = path.pop();
        path.forEach(function(p2) {
          if (!target[p2]) {
            target[p2] = {
              _custom: {
                value: {},
                display: p2,
                tooltip: "Module",
                abstract: true
              }
            };
          }
          target = target[p2]._custom.value;
        });
        target[leafKey] = canThrow(function() {
          return getters[key];
        });
      } else {
        result[key] = canThrow(function() {
          return getters[key];
        });
      }
    });
    return result;
  }
  function getStoreModule(moduleMap, path) {
    var names = path.split("/").filter(function(n2) {
      return n2;
    });
    return names.reduce(
      function(module2, moduleName, i2) {
        var child = module2[moduleName];
        if (!child) {
          throw new Error('Missing module "' + moduleName + '" for path "' + path + '".');
        }
        return i2 === names.length - 1 ? child : child._children;
      },
      path === "root" ? moduleMap : moduleMap.root._children
    );
  }
  function canThrow(cb) {
    try {
      return cb();
    } catch (e2) {
      return e2;
    }
  }
  var Module = function Module2(rawModule, runtime) {
    this.runtime = runtime;
    this._children = /* @__PURE__ */ Object.create(null);
    this._rawModule = rawModule;
    var rawState = rawModule.state;
    this.state = (typeof rawState === "function" ? rawState() : rawState) || {};
  };
  var prototypeAccessors$1 = { namespaced: { configurable: true } };
  prototypeAccessors$1.namespaced.get = function() {
    return !!this._rawModule.namespaced;
  };
  Module.prototype.addChild = function addChild(key, module2) {
    this._children[key] = module2;
  };
  Module.prototype.removeChild = function removeChild(key) {
    delete this._children[key];
  };
  Module.prototype.getChild = function getChild(key) {
    return this._children[key];
  };
  Module.prototype.hasChild = function hasChild(key) {
    return key in this._children;
  };
  Module.prototype.update = function update(rawModule) {
    this._rawModule.namespaced = rawModule.namespaced;
    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions;
    }
    if (rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations;
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters;
    }
  };
  Module.prototype.forEachChild = function forEachChild(fn) {
    forEachValue(this._children, fn);
  };
  Module.prototype.forEachGetter = function forEachGetter(fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn);
    }
  };
  Module.prototype.forEachAction = function forEachAction(fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn);
    }
  };
  Module.prototype.forEachMutation = function forEachMutation(fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn);
    }
  };
  Object.defineProperties(Module.prototype, prototypeAccessors$1);
  var ModuleCollection = function ModuleCollection2(rawRootModule) {
    this.register([], rawRootModule, false);
  };
  ModuleCollection.prototype.get = function get(path) {
    return path.reduce(function(module2, key) {
      return module2.getChild(key);
    }, this.root);
  };
  ModuleCollection.prototype.getNamespace = function getNamespace(path) {
    var module2 = this.root;
    return path.reduce(function(namespace, key) {
      module2 = module2.getChild(key);
      return namespace + (module2.namespaced ? key + "/" : "");
    }, "");
  };
  ModuleCollection.prototype.update = function update$1(rawRootModule) {
    update2([], this.root, rawRootModule);
  };
  ModuleCollection.prototype.register = function register(path, rawModule, runtime) {
    var this$1$1 = this;
    if (runtime === void 0)
      runtime = true;
    {
      assertRawModule(path, rawModule);
    }
    var newModule = new Module(rawModule, runtime);
    if (path.length === 0) {
      this.root = newModule;
    } else {
      var parent = this.get(path.slice(0, -1));
      parent.addChild(path[path.length - 1], newModule);
    }
    if (rawModule.modules) {
      forEachValue(rawModule.modules, function(rawChildModule, key) {
        this$1$1.register(path.concat(key), rawChildModule, runtime);
      });
    }
  };
  ModuleCollection.prototype.unregister = function unregister(path) {
    var parent = this.get(path.slice(0, -1));
    var key = path[path.length - 1];
    var child = parent.getChild(key);
    if (!child) {
      {
        console.warn(
          "[vuex] trying to unregister module '" + key + "', which is not registered"
        );
      }
      return;
    }
    if (!child.runtime) {
      return;
    }
    parent.removeChild(key);
  };
  ModuleCollection.prototype.isRegistered = function isRegistered(path) {
    var parent = this.get(path.slice(0, -1));
    var key = path[path.length - 1];
    if (parent) {
      return parent.hasChild(key);
    }
    return false;
  };
  function update2(path, targetModule, newModule) {
    {
      assertRawModule(path, newModule);
    }
    targetModule.update(newModule);
    if (newModule.modules) {
      for (var key in newModule.modules) {
        if (!targetModule.getChild(key)) {
          {
            console.warn(
              "[vuex] trying to add a new module '" + key + "' on hot reloading, manual reload is needed"
            );
          }
          return;
        }
        update2(
          path.concat(key),
          targetModule.getChild(key),
          newModule.modules[key]
        );
      }
    }
  }
  var functionAssert = {
    assert: function(value) {
      return typeof value === "function";
    },
    expected: "function"
  };
  var objectAssert = {
    assert: function(value) {
      return typeof value === "function" || typeof value === "object" && typeof value.handler === "function";
    },
    expected: 'function or object with "handler" function'
  };
  var assertTypes = {
    getters: functionAssert,
    mutations: functionAssert,
    actions: objectAssert
  };
  function assertRawModule(path, rawModule) {
    Object.keys(assertTypes).forEach(function(key) {
      if (!rawModule[key]) {
        return;
      }
      var assertOptions = assertTypes[key];
      forEachValue(rawModule[key], function(value, type) {
        assert(
          assertOptions.assert(value),
          makeAssertionMessage(path, key, type, value, assertOptions.expected)
        );
      });
    });
  }
  function makeAssertionMessage(path, key, type, value, expected) {
    var buf = key + " should be " + expected + ' but "' + key + "." + type + '"';
    if (path.length > 0) {
      buf += ' in module "' + path.join(".") + '"';
    }
    buf += " is " + JSON.stringify(value) + ".";
    return buf;
  }
  function createStore(options) {
    return new Store(options);
  }
  var Store = function Store2(options) {
    var this$1$1 = this;
    if (options === void 0)
      options = {};
    {
      assert(typeof Promise !== "undefined", "vuex requires a Promise polyfill in this browser.");
      assert(this instanceof Store2, "store must be called with the new operator.");
    }
    var plugins = options.plugins;
    if (plugins === void 0)
      plugins = [];
    var strict = options.strict;
    if (strict === void 0)
      strict = false;
    var devtools = options.devtools;
    this._committing = false;
    this._actions = /* @__PURE__ */ Object.create(null);
    this._actionSubscribers = [];
    this._mutations = /* @__PURE__ */ Object.create(null);
    this._wrappedGetters = /* @__PURE__ */ Object.create(null);
    this._modules = new ModuleCollection(options);
    this._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
    this._subscribers = [];
    this._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
    this._scope = null;
    this._devtools = devtools;
    var store2 = this;
    var ref = this;
    var dispatch2 = ref.dispatch;
    var commit2 = ref.commit;
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch2.call(store2, type, payload);
    };
    this.commit = function boundCommit(type, payload, options2) {
      return commit2.call(store2, type, payload, options2);
    };
    this.strict = strict;
    var state = this._modules.root.state;
    installModule(this, state, [], this._modules.root);
    resetStoreState(this, state);
    plugins.forEach(function(plugin) {
      return plugin(this$1$1);
    });
  };
  var prototypeAccessors = { state: { configurable: true } };
  Store.prototype.install = function install(app, injectKey) {
    app.provide(injectKey || storeKey, this);
    app.config.globalProperties.$store = this;
    var useDevtools = this._devtools !== void 0 ? this._devtools : true;
    if (useDevtools) {
      addDevtools(app, this);
    }
  };
  prototypeAccessors.state.get = function() {
    return this._state.data;
  };
  prototypeAccessors.state.set = function(v2) {
    {
      assert(false, "use store.replaceState() to explicit replace store state.");
    }
  };
  Store.prototype.commit = function commit(_type, _payload, _options) {
    var this$1$1 = this;
    var ref = unifyObjectStyle(_type, _payload, _options);
    var type = ref.type;
    var payload = ref.payload;
    var options = ref.options;
    var mutation = { type, payload };
    var entry = this._mutations[type];
    if (!entry) {
      {
        console.error("[vuex] unknown mutation type: " + type);
      }
      return;
    }
    this._withCommit(function() {
      entry.forEach(function commitIterator(handler) {
        handler(payload);
      });
    });
    this._subscribers.slice().forEach(function(sub) {
      return sub(mutation, this$1$1.state);
    });
    if (options && options.silent) {
      console.warn(
        "[vuex] mutation type: " + type + ". Silent option has been removed. Use the filter functionality in the vue-devtools"
      );
    }
  };
  Store.prototype.dispatch = function dispatch(_type, _payload) {
    var this$1$1 = this;
    var ref = unifyObjectStyle(_type, _payload);
    var type = ref.type;
    var payload = ref.payload;
    var action = { type, payload };
    var entry = this._actions[type];
    if (!entry) {
      {
        console.error("[vuex] unknown action type: " + type);
      }
      return;
    }
    try {
      this._actionSubscribers.slice().filter(function(sub) {
        return sub.before;
      }).forEach(function(sub) {
        return sub.before(action, this$1$1.state);
      });
    } catch (e2) {
      {
        console.warn("[vuex] error in before action subscribers: ");
        console.error(e2);
      }
    }
    var result = entry.length > 1 ? Promise.all(entry.map(function(handler) {
      return handler(payload);
    })) : entry[0](payload);
    return new Promise(function(resolve, reject) {
      result.then(function(res2) {
        try {
          this$1$1._actionSubscribers.filter(function(sub) {
            return sub.after;
          }).forEach(function(sub) {
            return sub.after(action, this$1$1.state);
          });
        } catch (e2) {
          {
            console.warn("[vuex] error in after action subscribers: ");
            console.error(e2);
          }
        }
        resolve(res2);
      }, function(error) {
        try {
          this$1$1._actionSubscribers.filter(function(sub) {
            return sub.error;
          }).forEach(function(sub) {
            return sub.error(action, this$1$1.state, error);
          });
        } catch (e2) {
          {
            console.warn("[vuex] error in error action subscribers: ");
            console.error(e2);
          }
        }
        reject(error);
      });
    });
  };
  Store.prototype.subscribe = function subscribe(fn, options) {
    return genericSubscribe(fn, this._subscribers, options);
  };
  Store.prototype.subscribeAction = function subscribeAction(fn, options) {
    var subs = typeof fn === "function" ? { before: fn } : fn;
    return genericSubscribe(subs, this._actionSubscribers, options);
  };
  Store.prototype.watch = function watch$1(getter, cb, options) {
    var this$1$1 = this;
    {
      assert(typeof getter === "function", "store.watch only accepts a function.");
    }
    return vue.watch(function() {
      return getter(this$1$1.state, this$1$1.getters);
    }, cb, Object.assign({}, options));
  };
  Store.prototype.replaceState = function replaceState(state) {
    var this$1$1 = this;
    this._withCommit(function() {
      this$1$1._state.data = state;
    });
  };
  Store.prototype.registerModule = function registerModule(path, rawModule, options) {
    if (options === void 0)
      options = {};
    if (typeof path === "string") {
      path = [path];
    }
    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
      assert(path.length > 0, "cannot register the root module by using registerModule.");
    }
    this._modules.register(path, rawModule);
    installModule(this, this.state, path, this._modules.get(path), options.preserveState);
    resetStoreState(this, this.state);
  };
  Store.prototype.unregisterModule = function unregisterModule(path) {
    var this$1$1 = this;
    if (typeof path === "string") {
      path = [path];
    }
    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
    }
    this._modules.unregister(path);
    this._withCommit(function() {
      var parentState = getNestedState(this$1$1.state, path.slice(0, -1));
      delete parentState[path[path.length - 1]];
    });
    resetStore(this);
  };
  Store.prototype.hasModule = function hasModule(path) {
    if (typeof path === "string") {
      path = [path];
    }
    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
    }
    return this._modules.isRegistered(path);
  };
  Store.prototype.hotUpdate = function hotUpdate(newOptions) {
    this._modules.update(newOptions);
    resetStore(this, true);
  };
  Store.prototype._withCommit = function _withCommit(fn) {
    var committing = this._committing;
    this._committing = true;
    fn();
    this._committing = committing;
  };
  Object.defineProperties(Store.prototype, prototypeAccessors);
  var mapState$1 = normalizeNamespace(function(namespace, states) {
    var res2 = {};
    if (!isValidMap(states)) {
      console.error("[vuex] mapState: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(states).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      res2[key] = function mappedState() {
        var state = this.$store.state;
        var getters = this.$store.getters;
        if (namespace) {
          var module2 = getModuleByNamespace(this.$store, "mapState", namespace);
          if (!module2) {
            return;
          }
          state = module2.context.state;
          getters = module2.context.getters;
        }
        return typeof val === "function" ? val.call(this, state, getters) : state[val];
      };
      res2[key].vuex = true;
    });
    return res2;
  });
  var mapMutations = normalizeNamespace(function(namespace, mutations) {
    var res2 = {};
    if (!isValidMap(mutations)) {
      console.error("[vuex] mapMutations: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(mutations).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      res2[key] = function mappedMutation() {
        var args = [], len = arguments.length;
        while (len--)
          args[len] = arguments[len];
        var commit2 = this.$store.commit;
        if (namespace) {
          var module2 = getModuleByNamespace(this.$store, "mapMutations", namespace);
          if (!module2) {
            return;
          }
          commit2 = module2.context.commit;
        }
        return typeof val === "function" ? val.apply(this, [commit2].concat(args)) : commit2.apply(this.$store, [val].concat(args));
      };
    });
    return res2;
  });
  var mapGetters$1 = normalizeNamespace(function(namespace, getters) {
    var res2 = {};
    if (!isValidMap(getters)) {
      console.error("[vuex] mapGetters: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(getters).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      val = namespace + val;
      res2[key] = function mappedGetter() {
        if (namespace && !getModuleByNamespace(this.$store, "mapGetters", namespace)) {
          return;
        }
        if (!(val in this.$store.getters)) {
          console.error("[vuex] unknown getter: " + val);
          return;
        }
        return this.$store.getters[val];
      };
      res2[key].vuex = true;
    });
    return res2;
  });
  var mapActions$1 = normalizeNamespace(function(namespace, actions) {
    var res2 = {};
    if (!isValidMap(actions)) {
      console.error("[vuex] mapActions: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(actions).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      res2[key] = function mappedAction() {
        var args = [], len = arguments.length;
        while (len--)
          args[len] = arguments[len];
        var dispatch2 = this.$store.dispatch;
        if (namespace) {
          var module2 = getModuleByNamespace(this.$store, "mapActions", namespace);
          if (!module2) {
            return;
          }
          dispatch2 = module2.context.dispatch;
        }
        return typeof val === "function" ? val.apply(this, [dispatch2].concat(args)) : dispatch2.apply(this.$store, [val].concat(args));
      };
    });
    return res2;
  });
  var createNamespacedHelpers = function(namespace) {
    return {
      mapState: mapState$1.bind(null, namespace),
      mapGetters: mapGetters$1.bind(null, namespace),
      mapMutations: mapMutations.bind(null, namespace),
      mapActions: mapActions$1.bind(null, namespace)
    };
  };
  function normalizeMap(map) {
    if (!isValidMap(map)) {
      return [];
    }
    return Array.isArray(map) ? map.map(function(key) {
      return { key, val: key };
    }) : Object.keys(map).map(function(key) {
      return { key, val: map[key] };
    });
  }
  function isValidMap(map) {
    return Array.isArray(map) || isObject(map);
  }
  function normalizeNamespace(fn) {
    return function(namespace, map) {
      if (typeof namespace !== "string") {
        map = namespace;
        namespace = "";
      } else if (namespace.charAt(namespace.length - 1) !== "/") {
        namespace += "/";
      }
      return fn(namespace, map);
    };
  }
  function getModuleByNamespace(store2, helper, namespace) {
    var module2 = store2._modulesNamespaceMap[namespace];
    if (!module2) {
      console.error("[vuex] module namespace not found in " + helper + "(): " + namespace);
    }
    return module2;
  }
  function createLogger(ref) {
    if (ref === void 0)
      ref = {};
    var collapsed = ref.collapsed;
    if (collapsed === void 0)
      collapsed = true;
    var filter = ref.filter;
    if (filter === void 0)
      filter = function(mutation, stateBefore, stateAfter) {
        return true;
      };
    var transformer = ref.transformer;
    if (transformer === void 0)
      transformer = function(state) {
        return state;
      };
    var mutationTransformer = ref.mutationTransformer;
    if (mutationTransformer === void 0)
      mutationTransformer = function(mut) {
        return mut;
      };
    var actionFilter = ref.actionFilter;
    if (actionFilter === void 0)
      actionFilter = function(action, state) {
        return true;
      };
    var actionTransformer = ref.actionTransformer;
    if (actionTransformer === void 0)
      actionTransformer = function(act) {
        return act;
      };
    var logMutations = ref.logMutations;
    if (logMutations === void 0)
      logMutations = true;
    var logActions = ref.logActions;
    if (logActions === void 0)
      logActions = true;
    var logger = ref.logger;
    if (logger === void 0)
      logger = console;
    return function(store2) {
      var prevState = deepCopy(store2.state);
      if (typeof logger === "undefined") {
        return;
      }
      if (logMutations) {
        store2.subscribe(function(mutation, state) {
          var nextState = deepCopy(state);
          if (filter(mutation, prevState, nextState)) {
            var formattedTime = getFormattedTime();
            var formattedMutation = mutationTransformer(mutation);
            var message = "mutation " + mutation.type + formattedTime;
            startMessage(logger, message, collapsed);
            logger.log("%c prev state", "color: #9E9E9E; font-weight: bold", transformer(prevState));
            logger.log("%c mutation", "color: #03A9F4; font-weight: bold", formattedMutation);
            logger.log("%c next state", "color: #4CAF50; font-weight: bold", transformer(nextState));
            endMessage(logger);
          }
          prevState = nextState;
        });
      }
      if (logActions) {
        store2.subscribeAction(function(action, state) {
          if (actionFilter(action, state)) {
            var formattedTime = getFormattedTime();
            var formattedAction = actionTransformer(action);
            var message = "action " + action.type + formattedTime;
            startMessage(logger, message, collapsed);
            logger.log("%c action", "color: #03A9F4; font-weight: bold", formattedAction);
            endMessage(logger);
          }
        });
      }
    };
  }
  function startMessage(logger, message, collapsed) {
    var startMessage2 = collapsed ? logger.groupCollapsed : logger.group;
    try {
      startMessage2.call(logger, message);
    } catch (e2) {
      logger.log(message);
    }
  }
  function endMessage(logger) {
    try {
      logger.groupEnd();
    } catch (e2) {
      logger.log("—— log end ——");
    }
  }
  function getFormattedTime() {
    var time = /* @__PURE__ */ new Date();
    return " @ " + pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
  }
  function repeat(str, times) {
    return new Array(times + 1).join(str);
  }
  function pad(num, maxLength) {
    return repeat("0", maxLength - num.toString().length) + num;
  }
  var index = {
    version: "4.1.0",
    Store,
    storeKey,
    createStore,
    useStore,
    mapState: mapState$1,
    mapMutations,
    mapGetters: mapGetters$1,
    mapActions: mapActions$1,
    createNamespacedHelpers,
    createLogger
  };
  const pages = [
    {
      path: "pages/login/login",
      style: {
        navigationBarTitleText: "登录",
        navigationStyle: "custom"
      }
    },
    {
      path: "pages/task/category/category",
      style: {
        navigationBarTitleText: "任务管理",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/task/category-detail/category-detail",
      style: {
        navigationBarTitleText: "任务列表",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/profile/profile",
      style: {
        navigationBarTitleText: "个人信息"
      }
    },
    {
      path: "pages/task/task-detail/task-detail",
      style: {
        navigationBarTitleText: "任务详情"
      }
    },
    {
      path: "pages/task/realtime-data/realtime-data",
      style: {
        navigationBarTitleText: "实时曲线",
        enablePullDownRefresh: true
      }
    }
  ];
  const globalStyle = {
    pageOrientation: "portrait",
    navigationBarTitleText: "冷链验证系统",
    navigationBarTextStyle: "white",
    navigationBarBackgroundColor: "#667eea",
    backgroundColor: "#F8F8F8",
    backgroundColorTop: "#F4F5F6",
    backgroundColorBottom: "#F4F5F6",
    "mp-360": {
      navigationStyle: "custom"
    },
    h5: {
      maxWidth: 1190,
      navigationBarTextStyle: "black",
      navigationBarBackgroundColor: "#F1F1F1"
    }
  };
  const tabBar = {
    color: "#7A7E83",
    selectedColor: "#667eea",
    borderStyle: "black",
    backgroundColor: "#ffffff",
    list: [
      {
        pagePath: "pages/task/category/category",
        iconPath: "static/task.png",
        selectedIconPath: "static/task-selected.png",
        text: "任务管理"
      },
      {
        pagePath: "pages/profile/profile",
        iconPath: "static/profile.png",
        selectedIconPath: "static/profile-selected.png",
        text: "个人信息"
      }
    ]
  };
  const e = {
    pages,
    globalStyle,
    tabBar
  };
  var define_process_env_UNI_SECURE_NETWORK_CONFIG_default = [];
  function t(e2) {
    return e2 && e2.__esModule && Object.prototype.hasOwnProperty.call(e2, "default") ? e2.default : e2;
  }
  function n(e2, t2, n2) {
    return e2(n2 = { path: t2, exports: {}, require: function(e3, t3) {
      return function() {
        throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
      }(null == t3 && n2.path);
    } }, n2.exports), n2.exports;
  }
  var s = n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = n2 || function(e3, t3) {
      var n3 = Object.create || /* @__PURE__ */ function() {
        function e4() {
        }
        return function(t4) {
          var n4;
          return e4.prototype = t4, n4 = new e4(), e4.prototype = null, n4;
        };
      }(), s2 = {}, r2 = s2.lib = {}, i2 = r2.Base = { extend: function(e4) {
        var t4 = n3(this);
        return e4 && t4.mixIn(e4), t4.hasOwnProperty("init") && this.init !== t4.init || (t4.init = function() {
          t4.$super.init.apply(this, arguments);
        }), t4.init.prototype = t4, t4.$super = this, t4;
      }, create: function() {
        var e4 = this.extend();
        return e4.init.apply(e4, arguments), e4;
      }, init: function() {
      }, mixIn: function(e4) {
        for (var t4 in e4)
          e4.hasOwnProperty(t4) && (this[t4] = e4[t4]);
        e4.hasOwnProperty("toString") && (this.toString = e4.toString);
      }, clone: function() {
        return this.init.prototype.extend(this);
      } }, o2 = r2.WordArray = i2.extend({ init: function(e4, n4) {
        e4 = this.words = e4 || [], this.sigBytes = n4 != t3 ? n4 : 4 * e4.length;
      }, toString: function(e4) {
        return (e4 || c2).stringify(this);
      }, concat: function(e4) {
        var t4 = this.words, n4 = e4.words, s3 = this.sigBytes, r3 = e4.sigBytes;
        if (this.clamp(), s3 % 4)
          for (var i3 = 0; i3 < r3; i3++) {
            var o3 = n4[i3 >>> 2] >>> 24 - i3 % 4 * 8 & 255;
            t4[s3 + i3 >>> 2] |= o3 << 24 - (s3 + i3) % 4 * 8;
          }
        else
          for (i3 = 0; i3 < r3; i3 += 4)
            t4[s3 + i3 >>> 2] = n4[i3 >>> 2];
        return this.sigBytes += r3, this;
      }, clamp: function() {
        var t4 = this.words, n4 = this.sigBytes;
        t4[n4 >>> 2] &= 4294967295 << 32 - n4 % 4 * 8, t4.length = e3.ceil(n4 / 4);
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4.words = this.words.slice(0), e4;
      }, random: function(t4) {
        for (var n4, s3 = [], r3 = function(t5) {
          var n5 = 987654321, s4 = 4294967295;
          return function() {
            var r4 = ((n5 = 36969 * (65535 & n5) + (n5 >> 16) & s4) << 16) + (t5 = 18e3 * (65535 & t5) + (t5 >> 16) & s4) & s4;
            return r4 /= 4294967296, (r4 += 0.5) * (e3.random() > 0.5 ? 1 : -1);
          };
        }, i3 = 0; i3 < t4; i3 += 4) {
          var a3 = r3(4294967296 * (n4 || e3.random()));
          n4 = 987654071 * a3(), s3.push(4294967296 * a3() | 0);
        }
        return new o2.init(s3, t4);
      } }), a2 = s2.enc = {}, c2 = a2.Hex = { stringify: function(e4) {
        for (var t4 = e4.words, n4 = e4.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
          var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
          s3.push((i3 >>> 4).toString(16)), s3.push((15 & i3).toString(16));
        }
        return s3.join("");
      }, parse: function(e4) {
        for (var t4 = e4.length, n4 = [], s3 = 0; s3 < t4; s3 += 2)
          n4[s3 >>> 3] |= parseInt(e4.substr(s3, 2), 16) << 24 - s3 % 8 * 4;
        return new o2.init(n4, t4 / 2);
      } }, u2 = a2.Latin1 = { stringify: function(e4) {
        for (var t4 = e4.words, n4 = e4.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
          var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
          s3.push(String.fromCharCode(i3));
        }
        return s3.join("");
      }, parse: function(e4) {
        for (var t4 = e4.length, n4 = [], s3 = 0; s3 < t4; s3++)
          n4[s3 >>> 2] |= (255 & e4.charCodeAt(s3)) << 24 - s3 % 4 * 8;
        return new o2.init(n4, t4);
      } }, h2 = a2.Utf8 = { stringify: function(e4) {
        try {
          return decodeURIComponent(escape(u2.stringify(e4)));
        } catch (e5) {
          throw new Error("Malformed UTF-8 data");
        }
      }, parse: function(e4) {
        return u2.parse(unescape(encodeURIComponent(e4)));
      } }, l2 = r2.BufferedBlockAlgorithm = i2.extend({ reset: function() {
        this._data = new o2.init(), this._nDataBytes = 0;
      }, _append: function(e4) {
        "string" == typeof e4 && (e4 = h2.parse(e4)), this._data.concat(e4), this._nDataBytes += e4.sigBytes;
      }, _process: function(t4) {
        var n4 = this._data, s3 = n4.words, r3 = n4.sigBytes, i3 = this.blockSize, a3 = r3 / (4 * i3), c3 = (a3 = t4 ? e3.ceil(a3) : e3.max((0 | a3) - this._minBufferSize, 0)) * i3, u3 = e3.min(4 * c3, r3);
        if (c3) {
          for (var h3 = 0; h3 < c3; h3 += i3)
            this._doProcessBlock(s3, h3);
          var l3 = s3.splice(0, c3);
          n4.sigBytes -= u3;
        }
        return new o2.init(l3, u3);
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4._data = this._data.clone(), e4;
      }, _minBufferSize: 0 });
      r2.Hasher = l2.extend({ cfg: i2.extend(), init: function(e4) {
        this.cfg = this.cfg.extend(e4), this.reset();
      }, reset: function() {
        l2.reset.call(this), this._doReset();
      }, update: function(e4) {
        return this._append(e4), this._process(), this;
      }, finalize: function(e4) {
        return e4 && this._append(e4), this._doFinalize();
      }, blockSize: 16, _createHelper: function(e4) {
        return function(t4, n4) {
          return new e4.init(n4).finalize(t4);
        };
      }, _createHmacHelper: function(e4) {
        return function(t4, n4) {
          return new d2.HMAC.init(e4, n4).finalize(t4);
        };
      } });
      var d2 = s2.algo = {};
      return s2;
    }(Math), n2);
  }), r = s, i = (n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, function(e3) {
      var t3 = n2, s2 = t3.lib, r2 = s2.WordArray, i2 = s2.Hasher, o2 = t3.algo, a2 = [];
      !function() {
        for (var t4 = 0; t4 < 64; t4++)
          a2[t4] = 4294967296 * e3.abs(e3.sin(t4 + 1)) | 0;
      }();
      var c2 = o2.MD5 = i2.extend({ _doReset: function() {
        this._hash = new r2.init([1732584193, 4023233417, 2562383102, 271733878]);
      }, _doProcessBlock: function(e4, t4) {
        for (var n3 = 0; n3 < 16; n3++) {
          var s3 = t4 + n3, r3 = e4[s3];
          e4[s3] = 16711935 & (r3 << 8 | r3 >>> 24) | 4278255360 & (r3 << 24 | r3 >>> 8);
        }
        var i3 = this._hash.words, o3 = e4[t4 + 0], c3 = e4[t4 + 1], p2 = e4[t4 + 2], f2 = e4[t4 + 3], g2 = e4[t4 + 4], m2 = e4[t4 + 5], y2 = e4[t4 + 6], _2 = e4[t4 + 7], w2 = e4[t4 + 8], I2 = e4[t4 + 9], v2 = e4[t4 + 10], S2 = e4[t4 + 11], T2 = e4[t4 + 12], b2 = e4[t4 + 13], E2 = e4[t4 + 14], k2 = e4[t4 + 15], A2 = i3[0], P2 = i3[1], C2 = i3[2], O2 = i3[3];
        A2 = u2(A2, P2, C2, O2, o3, 7, a2[0]), O2 = u2(O2, A2, P2, C2, c3, 12, a2[1]), C2 = u2(C2, O2, A2, P2, p2, 17, a2[2]), P2 = u2(P2, C2, O2, A2, f2, 22, a2[3]), A2 = u2(A2, P2, C2, O2, g2, 7, a2[4]), O2 = u2(O2, A2, P2, C2, m2, 12, a2[5]), C2 = u2(C2, O2, A2, P2, y2, 17, a2[6]), P2 = u2(P2, C2, O2, A2, _2, 22, a2[7]), A2 = u2(A2, P2, C2, O2, w2, 7, a2[8]), O2 = u2(O2, A2, P2, C2, I2, 12, a2[9]), C2 = u2(C2, O2, A2, P2, v2, 17, a2[10]), P2 = u2(P2, C2, O2, A2, S2, 22, a2[11]), A2 = u2(A2, P2, C2, O2, T2, 7, a2[12]), O2 = u2(O2, A2, P2, C2, b2, 12, a2[13]), C2 = u2(C2, O2, A2, P2, E2, 17, a2[14]), A2 = h2(A2, P2 = u2(P2, C2, O2, A2, k2, 22, a2[15]), C2, O2, c3, 5, a2[16]), O2 = h2(O2, A2, P2, C2, y2, 9, a2[17]), C2 = h2(C2, O2, A2, P2, S2, 14, a2[18]), P2 = h2(P2, C2, O2, A2, o3, 20, a2[19]), A2 = h2(A2, P2, C2, O2, m2, 5, a2[20]), O2 = h2(O2, A2, P2, C2, v2, 9, a2[21]), C2 = h2(C2, O2, A2, P2, k2, 14, a2[22]), P2 = h2(P2, C2, O2, A2, g2, 20, a2[23]), A2 = h2(A2, P2, C2, O2, I2, 5, a2[24]), O2 = h2(O2, A2, P2, C2, E2, 9, a2[25]), C2 = h2(C2, O2, A2, P2, f2, 14, a2[26]), P2 = h2(P2, C2, O2, A2, w2, 20, a2[27]), A2 = h2(A2, P2, C2, O2, b2, 5, a2[28]), O2 = h2(O2, A2, P2, C2, p2, 9, a2[29]), C2 = h2(C2, O2, A2, P2, _2, 14, a2[30]), A2 = l2(A2, P2 = h2(P2, C2, O2, A2, T2, 20, a2[31]), C2, O2, m2, 4, a2[32]), O2 = l2(O2, A2, P2, C2, w2, 11, a2[33]), C2 = l2(C2, O2, A2, P2, S2, 16, a2[34]), P2 = l2(P2, C2, O2, A2, E2, 23, a2[35]), A2 = l2(A2, P2, C2, O2, c3, 4, a2[36]), O2 = l2(O2, A2, P2, C2, g2, 11, a2[37]), C2 = l2(C2, O2, A2, P2, _2, 16, a2[38]), P2 = l2(P2, C2, O2, A2, v2, 23, a2[39]), A2 = l2(A2, P2, C2, O2, b2, 4, a2[40]), O2 = l2(O2, A2, P2, C2, o3, 11, a2[41]), C2 = l2(C2, O2, A2, P2, f2, 16, a2[42]), P2 = l2(P2, C2, O2, A2, y2, 23, a2[43]), A2 = l2(A2, P2, C2, O2, I2, 4, a2[44]), O2 = l2(O2, A2, P2, C2, T2, 11, a2[45]), C2 = l2(C2, O2, A2, P2, k2, 16, a2[46]), A2 = d2(A2, P2 = l2(P2, C2, O2, A2, p2, 23, a2[47]), C2, O2, o3, 6, a2[48]), O2 = d2(O2, A2, P2, C2, _2, 10, a2[49]), C2 = d2(C2, O2, A2, P2, E2, 15, a2[50]), P2 = d2(P2, C2, O2, A2, m2, 21, a2[51]), A2 = d2(A2, P2, C2, O2, T2, 6, a2[52]), O2 = d2(O2, A2, P2, C2, f2, 10, a2[53]), C2 = d2(C2, O2, A2, P2, v2, 15, a2[54]), P2 = d2(P2, C2, O2, A2, c3, 21, a2[55]), A2 = d2(A2, P2, C2, O2, w2, 6, a2[56]), O2 = d2(O2, A2, P2, C2, k2, 10, a2[57]), C2 = d2(C2, O2, A2, P2, y2, 15, a2[58]), P2 = d2(P2, C2, O2, A2, b2, 21, a2[59]), A2 = d2(A2, P2, C2, O2, g2, 6, a2[60]), O2 = d2(O2, A2, P2, C2, S2, 10, a2[61]), C2 = d2(C2, O2, A2, P2, p2, 15, a2[62]), P2 = d2(P2, C2, O2, A2, I2, 21, a2[63]), i3[0] = i3[0] + A2 | 0, i3[1] = i3[1] + P2 | 0, i3[2] = i3[2] + C2 | 0, i3[3] = i3[3] + O2 | 0;
      }, _doFinalize: function() {
        var t4 = this._data, n3 = t4.words, s3 = 8 * this._nDataBytes, r3 = 8 * t4.sigBytes;
        n3[r3 >>> 5] |= 128 << 24 - r3 % 32;
        var i3 = e3.floor(s3 / 4294967296), o3 = s3;
        n3[15 + (r3 + 64 >>> 9 << 4)] = 16711935 & (i3 << 8 | i3 >>> 24) | 4278255360 & (i3 << 24 | i3 >>> 8), n3[14 + (r3 + 64 >>> 9 << 4)] = 16711935 & (o3 << 8 | o3 >>> 24) | 4278255360 & (o3 << 24 | o3 >>> 8), t4.sigBytes = 4 * (n3.length + 1), this._process();
        for (var a3 = this._hash, c3 = a3.words, u3 = 0; u3 < 4; u3++) {
          var h3 = c3[u3];
          c3[u3] = 16711935 & (h3 << 8 | h3 >>> 24) | 4278255360 & (h3 << 24 | h3 >>> 8);
        }
        return a3;
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4._hash = this._hash.clone(), e4;
      } });
      function u2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (t4 & n3 | ~t4 & s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function h2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (t4 & s3 | n3 & ~s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function l2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (t4 ^ n3 ^ s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function d2(e4, t4, n3, s3, r3, i3, o3) {
        var a3 = e4 + (n3 ^ (t4 | ~s3)) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      t3.MD5 = i2._createHelper(c2), t3.HmacMD5 = i2._createHmacHelper(c2);
    }(Math), n2.MD5);
  }), n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, void function() {
      var e3 = n2, t3 = e3.lib.Base, s2 = e3.enc.Utf8;
      e3.algo.HMAC = t3.extend({ init: function(e4, t4) {
        e4 = this._hasher = new e4.init(), "string" == typeof t4 && (t4 = s2.parse(t4));
        var n3 = e4.blockSize, r2 = 4 * n3;
        t4.sigBytes > r2 && (t4 = e4.finalize(t4)), t4.clamp();
        for (var i2 = this._oKey = t4.clone(), o2 = this._iKey = t4.clone(), a2 = i2.words, c2 = o2.words, u2 = 0; u2 < n3; u2++)
          a2[u2] ^= 1549556828, c2[u2] ^= 909522486;
        i2.sigBytes = o2.sigBytes = r2, this.reset();
      }, reset: function() {
        var e4 = this._hasher;
        e4.reset(), e4.update(this._iKey);
      }, update: function(e4) {
        return this._hasher.update(e4), this;
      }, finalize: function(e4) {
        var t4 = this._hasher, n3 = t4.finalize(e4);
        return t4.reset(), t4.finalize(this._oKey.clone().concat(n3));
      } });
    }());
  }), n(function(e2, t2) {
    e2.exports = r.HmacMD5;
  })), o = n(function(e2, t2) {
    e2.exports = r.enc.Utf8;
  }), a = n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, function() {
      var e3 = n2, t3 = e3.lib.WordArray;
      function s2(e4, n3, s3) {
        for (var r2 = [], i2 = 0, o2 = 0; o2 < n3; o2++)
          if (o2 % 4) {
            var a2 = s3[e4.charCodeAt(o2 - 1)] << o2 % 4 * 2, c2 = s3[e4.charCodeAt(o2)] >>> 6 - o2 % 4 * 2;
            r2[i2 >>> 2] |= (a2 | c2) << 24 - i2 % 4 * 8, i2++;
          }
        return t3.create(r2, i2);
      }
      e3.enc.Base64 = { stringify: function(e4) {
        var t4 = e4.words, n3 = e4.sigBytes, s3 = this._map;
        e4.clamp();
        for (var r2 = [], i2 = 0; i2 < n3; i2 += 3)
          for (var o2 = (t4[i2 >>> 2] >>> 24 - i2 % 4 * 8 & 255) << 16 | (t4[i2 + 1 >>> 2] >>> 24 - (i2 + 1) % 4 * 8 & 255) << 8 | t4[i2 + 2 >>> 2] >>> 24 - (i2 + 2) % 4 * 8 & 255, a2 = 0; a2 < 4 && i2 + 0.75 * a2 < n3; a2++)
            r2.push(s3.charAt(o2 >>> 6 * (3 - a2) & 63));
        var c2 = s3.charAt(64);
        if (c2)
          for (; r2.length % 4; )
            r2.push(c2);
        return r2.join("");
      }, parse: function(e4) {
        var t4 = e4.length, n3 = this._map, r2 = this._reverseMap;
        if (!r2) {
          r2 = this._reverseMap = [];
          for (var i2 = 0; i2 < n3.length; i2++)
            r2[n3.charCodeAt(i2)] = i2;
        }
        var o2 = n3.charAt(64);
        if (o2) {
          var a2 = e4.indexOf(o2);
          -1 !== a2 && (t4 = a2);
        }
        return s2(e4, t4, r2);
      }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
    }(), n2.enc.Base64);
  });
  const c = "uni_id_token", u = "uni_id_token_expired", h = "uniIdToken", l = { DEFAULT: "FUNCTION", FUNCTION: "FUNCTION", OBJECT: "OBJECT", CLIENT_DB: "CLIENT_DB" }, d = "pending", p = "fulfilled", f = "rejected";
  function g(e2) {
    return Object.prototype.toString.call(e2).slice(8, -1).toLowerCase();
  }
  function m(e2) {
    return "object" === g(e2);
  }
  function y(e2) {
    return "function" == typeof e2;
  }
  function _(e2) {
    return function() {
      try {
        return e2.apply(e2, arguments);
      } catch (e3) {
        console.error(e3);
      }
    };
  }
  const w = "REJECTED", I = "NOT_PENDING";
  class v {
    constructor({ createPromise: e2, retryRule: t2 = w } = {}) {
      this.createPromise = e2, this.status = null, this.promise = null, this.retryRule = t2;
    }
    get needRetry() {
      if (!this.status)
        return true;
      switch (this.retryRule) {
        case w:
          return this.status === f;
        case I:
          return this.status !== d;
      }
    }
    exec() {
      return this.needRetry ? (this.status = d, this.promise = this.createPromise().then((e2) => (this.status = p, Promise.resolve(e2)), (e2) => (this.status = f, Promise.reject(e2))), this.promise) : this.promise;
    }
  }
  class S {
    constructor() {
      this._callback = {};
    }
    addListener(e2, t2) {
      this._callback[e2] || (this._callback[e2] = []), this._callback[e2].push(t2);
    }
    on(e2, t2) {
      return this.addListener(e2, t2);
    }
    removeListener(e2, t2) {
      if (!t2)
        throw new Error('The "listener" argument must be of type function. Received undefined');
      const n2 = this._callback[e2];
      if (!n2)
        return;
      const s2 = function(e3, t3) {
        for (let n3 = e3.length - 1; n3 >= 0; n3--)
          if (e3[n3] === t3)
            return n3;
        return -1;
      }(n2, t2);
      n2.splice(s2, 1);
    }
    off(e2, t2) {
      return this.removeListener(e2, t2);
    }
    removeAllListener(e2) {
      delete this._callback[e2];
    }
    emit(e2, ...t2) {
      const n2 = this._callback[e2];
      if (n2)
        for (let e3 = 0; e3 < n2.length; e3++)
          n2[e3](...t2);
    }
  }
  function T(e2) {
    return e2 && "string" == typeof e2 ? JSON.parse(e2) : e2;
  }
  const b = true, E = "app", A = T(define_process_env_UNI_SECURE_NETWORK_CONFIG_default), P = E, C = T(""), O = T("[]") || [];
  let N = "";
  try {
    N = "__UNI__C3F805A";
  } catch (e2) {
  }
  let R, L = {};
  function U(e2, t2 = {}) {
    var n2, s2;
    return n2 = L, s2 = e2, Object.prototype.hasOwnProperty.call(n2, s2) || (L[e2] = t2), L[e2];
  }
  function D() {
    return R || (R = function() {
      if ("undefined" != typeof globalThis)
        return globalThis;
      if ("undefined" != typeof self)
        return self;
      if ("undefined" != typeof window)
        return window;
      function e2() {
        return this;
      }
      return void 0 !== e2() ? e2() : new Function("return this")();
    }(), R);
  }
  L = uni._globalUniCloudObj ? uni._globalUniCloudObj : uni._globalUniCloudObj = {};
  const M = ["invoke", "success", "fail", "complete"], q = U("_globalUniCloudInterceptor");
  function F(e2, t2) {
    q[e2] || (q[e2] = {}), m(t2) && Object.keys(t2).forEach((n2) => {
      M.indexOf(n2) > -1 && function(e3, t3, n3) {
        let s2 = q[e3][t3];
        s2 || (s2 = q[e3][t3] = []), -1 === s2.indexOf(n3) && y(n3) && s2.push(n3);
      }(e2, n2, t2[n2]);
    });
  }
  function K(e2, t2) {
    q[e2] || (q[e2] = {}), m(t2) ? Object.keys(t2).forEach((n2) => {
      M.indexOf(n2) > -1 && function(e3, t3, n3) {
        const s2 = q[e3][t3];
        if (!s2)
          return;
        const r2 = s2.indexOf(n3);
        r2 > -1 && s2.splice(r2, 1);
      }(e2, n2, t2[n2]);
    }) : delete q[e2];
  }
  function j(e2, t2) {
    return e2 && 0 !== e2.length ? e2.reduce((e3, n2) => e3.then(() => n2(t2)), Promise.resolve()) : Promise.resolve();
  }
  function $(e2, t2) {
    return q[e2] && q[e2][t2] || [];
  }
  function B(e2) {
    F("callObject", e2);
  }
  const W = U("_globalUniCloudListener"), H = { RESPONSE: "response", NEED_LOGIN: "needLogin", REFRESH_TOKEN: "refreshToken" }, J = { CLIENT_DB: "clientdb", CLOUD_FUNCTION: "cloudfunction", CLOUD_OBJECT: "cloudobject" };
  function z(e2) {
    return W[e2] || (W[e2] = []), W[e2];
  }
  function V(e2, t2) {
    const n2 = z(e2);
    n2.includes(t2) || n2.push(t2);
  }
  function G(e2, t2) {
    const n2 = z(e2), s2 = n2.indexOf(t2);
    -1 !== s2 && n2.splice(s2, 1);
  }
  function Y(e2, t2) {
    const n2 = z(e2);
    for (let e3 = 0; e3 < n2.length; e3++) {
      (0, n2[e3])(t2);
    }
  }
  let Q, X = false;
  function Z() {
    return Q || (Q = new Promise((e2) => {
      X && e2(), function t2() {
        if ("function" == typeof getCurrentPages) {
          const t3 = getCurrentPages();
          t3 && t3[0] && (X = true, e2());
        }
        X || setTimeout(() => {
          t2();
        }, 30);
      }();
    }), Q);
  }
  function ee(e2) {
    const t2 = {};
    for (const n2 in e2) {
      const s2 = e2[n2];
      y(s2) && (t2[n2] = _(s2));
    }
    return t2;
  }
  class te extends Error {
    constructor(e2) {
      const t2 = e2.message || e2.errMsg || "unknown system error";
      super(t2), this.errMsg = t2, this.code = this.errCode = e2.code || e2.errCode || "SYSTEM_ERROR", this.errSubject = this.subject = e2.subject || e2.errSubject, this.cause = e2.cause, this.requestId = e2.requestId;
    }
    toJson(e2 = 0) {
      if (!(e2 >= 10))
        return e2++, { errCode: this.errCode, errMsg: this.errMsg, errSubject: this.errSubject, cause: this.cause && this.cause.toJson ? this.cause.toJson(e2) : this.cause };
    }
  }
  var ne = { request: (e2) => uni.request(e2), uploadFile: (e2) => uni.uploadFile(e2), setStorageSync: (e2, t2) => uni.setStorageSync(e2, t2), getStorageSync: (e2) => uni.getStorageSync(e2), removeStorageSync: (e2) => uni.removeStorageSync(e2), clearStorageSync: () => uni.clearStorageSync(), connectSocket: (e2) => uni.connectSocket(e2) };
  function se(e2) {
    return e2 && se(e2.__v_raw) || e2;
  }
  function re() {
    return { token: ne.getStorageSync(c) || ne.getStorageSync(h), tokenExpired: ne.getStorageSync(u) };
  }
  function ie({ token: e2, tokenExpired: t2 } = {}) {
    e2 && ne.setStorageSync(c, e2), t2 && ne.setStorageSync(u, t2);
  }
  let oe, ae;
  function ce() {
    return oe || (oe = uni.getSystemInfoSync()), oe;
  }
  function ue() {
    let e2, t2;
    try {
      if (uni.getLaunchOptionsSync) {
        if (uni.getLaunchOptionsSync.toString().indexOf("not yet implemented") > -1)
          return;
        const { scene: n2, channel: s2 } = uni.getLaunchOptionsSync();
        e2 = s2, t2 = n2;
      }
    } catch (e3) {
    }
    return { channel: e2, scene: t2 };
  }
  let he = {};
  function le() {
    const e2 = uni.getLocale && uni.getLocale() || "en";
    if (ae)
      return { ...he, ...ae, locale: e2, LOCALE: e2 };
    const t2 = ce(), { deviceId: n2, osName: s2, uniPlatform: r2, appId: i2 } = t2, o2 = ["appId", "appLanguage", "appName", "appVersion", "appVersionCode", "appWgtVersion", "browserName", "browserVersion", "deviceBrand", "deviceId", "deviceModel", "deviceType", "osName", "osVersion", "romName", "romVersion", "ua", "hostName", "hostVersion", "uniPlatform", "uniRuntimeVersion", "uniRuntimeVersionCode", "uniCompilerVersion", "uniCompilerVersionCode"];
    for (const e3 in t2)
      Object.hasOwnProperty.call(t2, e3) && -1 === o2.indexOf(e3) && delete t2[e3];
    return ae = { PLATFORM: r2, OS: s2, APPID: i2, DEVICEID: n2, ...ue(), ...t2 }, { ...he, ...ae, locale: e2, LOCALE: e2 };
  }
  var de = { sign: function(e2, t2) {
    let n2 = "";
    return Object.keys(e2).sort().forEach(function(t3) {
      e2[t3] && (n2 = n2 + "&" + t3 + "=" + e2[t3]);
    }), n2 = n2.slice(1), i(n2, t2).toString();
  }, wrappedRequest: function(e2, t2) {
    return new Promise((n2, s2) => {
      t2(Object.assign(e2, { complete(e3) {
        e3 || (e3 = {});
        const t3 = e3.data && e3.data.header && e3.data.header["x-serverless-request-id"] || e3.header && e3.header["request-id"];
        if (!e3.statusCode || e3.statusCode >= 400) {
          const n3 = e3.data && e3.data.error && e3.data.error.code || "SYS_ERR", r3 = e3.data && e3.data.error && e3.data.error.message || e3.errMsg || "request:fail";
          return s2(new te({ code: n3, message: r3, requestId: t3 }));
        }
        const r2 = e3.data;
        if (r2.error)
          return s2(new te({ code: r2.error.code, message: r2.error.message, requestId: t3 }));
        r2.result = r2.data, r2.requestId = t3, delete r2.data, n2(r2);
      } }));
    });
  }, toBase64: function(e2) {
    return a.stringify(o.parse(e2));
  } };
  var pe = class {
    constructor(e2) {
      ["spaceId", "clientSecret"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), this.config = Object.assign({}, { endpoint: 0 === e2.spaceId.indexOf("mp-") ? "https://api.next.bspapp.com" : "https://api.bspapp.com" }, e2), this.config.provider = "aliyun", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.config.accessTokenKey = "access_token_" + this.config.spaceId, this.adapter = ne, this._getAccessTokenPromiseHub = new v({ createPromise: () => this.requestAuth(this.setupRequest({ method: "serverless.auth.user.anonymousAuthorize", params: "{}" }, "auth")).then((e3) => {
        if (!e3.result || !e3.result.accessToken)
          throw new te({ code: "AUTH_FAILED", message: "获取accessToken失败" });
        this.setAccessToken(e3.result.accessToken);
      }), retryRule: I });
    }
    get hasAccessToken() {
      return !!this.accessToken;
    }
    setAccessToken(e2) {
      this.accessToken = e2;
    }
    requestWrapped(e2) {
      return de.wrappedRequest(e2, this.adapter.request);
    }
    requestAuth(e2) {
      return this.requestWrapped(e2);
    }
    request(e2, t2) {
      return Promise.resolve().then(() => this.hasAccessToken ? t2 ? this.requestWrapped(e2) : this.requestWrapped(e2).catch((t3) => new Promise((e3, n2) => {
        !t3 || "GATEWAY_INVALID_TOKEN" !== t3.code && "InvalidParameter.InvalidToken" !== t3.code ? n2(t3) : e3();
      }).then(() => this.getAccessToken()).then(() => {
        const t4 = this.rebuildRequest(e2);
        return this.request(t4, true);
      })) : this.getAccessToken().then(() => {
        const t3 = this.rebuildRequest(e2);
        return this.request(t3, true);
      }));
    }
    rebuildRequest(e2) {
      const t2 = Object.assign({}, e2);
      return t2.data.token = this.accessToken, t2.header["x-basement-token"] = this.accessToken, t2.header["x-serverless-sign"] = de.sign(t2.data, this.config.clientSecret), t2;
    }
    setupRequest(e2, t2) {
      const n2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now() }), s2 = { "Content-Type": "application/json" };
      return "auth" !== t2 && (n2.token = this.accessToken, s2["x-basement-token"] = this.accessToken), s2["x-serverless-sign"] = de.sign(n2, this.config.clientSecret), { url: this.config.requestUrl, method: "POST", data: n2, dataType: "json", header: s2 };
    }
    getAccessToken() {
      return this._getAccessTokenPromiseHub.exec();
    }
    async authorize() {
      await this.getAccessToken();
    }
    callFunction(e2) {
      const t2 = { method: "serverless.function.runtime.invoke", params: JSON.stringify({ functionTarget: e2.name, functionArgs: e2.data || {} }) };
      return this.request({ ...this.setupRequest(t2), timeout: e2.timeout });
    }
    getOSSUploadOptionsFromPath(e2) {
      const t2 = { method: "serverless.file.resource.generateProximalSign", params: JSON.stringify(e2) };
      return this.request(this.setupRequest(t2));
    }
    uploadFileToOSS({ url: e2, formData: t2, name: n2, filePath: s2, fileType: r2, onUploadProgress: i2 }) {
      return new Promise((o2, a2) => {
        const c2 = this.adapter.uploadFile({ url: e2, formData: t2, name: n2, filePath: s2, fileType: r2, header: { "X-OSS-server-side-encrpytion": "AES256" }, success(e3) {
          e3 && e3.statusCode < 400 ? o2(e3) : a2(new te({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e3) {
          a2(new te({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
        } });
        "function" == typeof i2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e3) => {
          i2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
        });
      });
    }
    reportOSSUpload(e2) {
      const t2 = { method: "serverless.file.resource.report", params: JSON.stringify(e2) };
      return this.request(this.setupRequest(t2));
    }
    async uploadFile({ filePath: e2, cloudPath: t2, fileType: n2 = "image", cloudPathAsRealPath: s2 = false, onUploadProgress: r2, config: i2 }) {
      if ("string" !== g(t2))
        throw new te({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
      if (!(t2 = t2.trim()))
        throw new te({ code: "INVALID_PARAM", message: "cloudPath不可为空" });
      if (/:\/\//.test(t2))
        throw new te({ code: "INVALID_PARAM", message: "cloudPath不合法" });
      const o2 = i2 && i2.envType || this.config.envType;
      if (s2 && ("/" !== t2[0] && (t2 = "/" + t2), t2.indexOf("\\") > -1))
        throw new te({ code: "INVALID_PARAM", message: "使用cloudPath作为路径时，cloudPath不可包含“\\”" });
      const a2 = (await this.getOSSUploadOptionsFromPath({ env: o2, filename: s2 ? t2.split("/").pop() : t2, fileId: s2 ? t2 : void 0 })).result, c2 = "https://" + a2.cdnDomain + "/" + a2.ossPath, { securityToken: u2, accessKeyId: h2, signature: l2, host: d2, ossPath: p2, id: f2, policy: m2, ossCallbackUrl: y2 } = a2, _2 = { "Cache-Control": "max-age=2592000", "Content-Disposition": "attachment", OSSAccessKeyId: h2, Signature: l2, host: d2, id: f2, key: p2, policy: m2, success_action_status: 200 };
      if (u2 && (_2["x-oss-security-token"] = u2), y2) {
        const e3 = JSON.stringify({ callbackUrl: y2, callbackBody: JSON.stringify({ fileId: f2, spaceId: this.config.spaceId }), callbackBodyType: "application/json" });
        _2.callback = de.toBase64(e3);
      }
      const w2 = { url: "https://" + a2.host, formData: _2, fileName: "file", name: "file", filePath: e2, fileType: n2 };
      if (await this.uploadFileToOSS(Object.assign({}, w2, { onUploadProgress: r2 })), y2)
        return { success: true, filePath: e2, fileID: c2 };
      if ((await this.reportOSSUpload({ id: f2 })).success)
        return { success: true, filePath: e2, fileID: c2 };
      throw new te({ code: "UPLOAD_FAILED", message: "文件上传失败" });
    }
    getTempFileURL({ fileList: e2 } = {}) {
      return new Promise((t2, n2) => {
        Array.isArray(e2) && 0 !== e2.length || n2(new te({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" })), this.getFileInfo({ fileList: e2 }).then((n3) => {
          t2({ fileList: e2.map((e3, t3) => {
            const s2 = n3.fileList[t3];
            return { fileID: e3, tempFileURL: s2 && s2.url || e3 };
          }) });
        });
      });
    }
    async getFileInfo({ fileList: e2 } = {}) {
      if (!Array.isArray(e2) || 0 === e2.length)
        throw new te({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const t2 = { method: "serverless.file.resource.info", params: JSON.stringify({ id: e2.map((e3) => e3.split("?")[0]).join(",") }) };
      return { fileList: (await this.request(this.setupRequest(t2))).result };
    }
  };
  var fe = { init(e2) {
    const t2 = new pe(e2), n2 = { signInAnonymously: function() {
      return t2.authorize();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } };
  const ge = "undefined" != typeof location && "http:" === location.protocol ? "http:" : "https:";
  var me;
  !function(e2) {
    e2.local = "local", e2.none = "none", e2.session = "session";
  }(me || (me = {}));
  var ye = function() {
  }, _e = n(function(e2, t2) {
    var n2;
    e2.exports = (n2 = r, function(e3) {
      var t3 = n2, s2 = t3.lib, r2 = s2.WordArray, i2 = s2.Hasher, o2 = t3.algo, a2 = [], c2 = [];
      !function() {
        function t4(t5) {
          for (var n4 = e3.sqrt(t5), s4 = 2; s4 <= n4; s4++)
            if (!(t5 % s4))
              return false;
          return true;
        }
        function n3(e4) {
          return 4294967296 * (e4 - (0 | e4)) | 0;
        }
        for (var s3 = 2, r3 = 0; r3 < 64; )
          t4(s3) && (r3 < 8 && (a2[r3] = n3(e3.pow(s3, 0.5))), c2[r3] = n3(e3.pow(s3, 1 / 3)), r3++), s3++;
      }();
      var u2 = [], h2 = o2.SHA256 = i2.extend({ _doReset: function() {
        this._hash = new r2.init(a2.slice(0));
      }, _doProcessBlock: function(e4, t4) {
        for (var n3 = this._hash.words, s3 = n3[0], r3 = n3[1], i3 = n3[2], o3 = n3[3], a3 = n3[4], h3 = n3[5], l2 = n3[6], d2 = n3[7], p2 = 0; p2 < 64; p2++) {
          if (p2 < 16)
            u2[p2] = 0 | e4[t4 + p2];
          else {
            var f2 = u2[p2 - 15], g2 = (f2 << 25 | f2 >>> 7) ^ (f2 << 14 | f2 >>> 18) ^ f2 >>> 3, m2 = u2[p2 - 2], y2 = (m2 << 15 | m2 >>> 17) ^ (m2 << 13 | m2 >>> 19) ^ m2 >>> 10;
            u2[p2] = g2 + u2[p2 - 7] + y2 + u2[p2 - 16];
          }
          var _2 = s3 & r3 ^ s3 & i3 ^ r3 & i3, w2 = (s3 << 30 | s3 >>> 2) ^ (s3 << 19 | s3 >>> 13) ^ (s3 << 10 | s3 >>> 22), I2 = d2 + ((a3 << 26 | a3 >>> 6) ^ (a3 << 21 | a3 >>> 11) ^ (a3 << 7 | a3 >>> 25)) + (a3 & h3 ^ ~a3 & l2) + c2[p2] + u2[p2];
          d2 = l2, l2 = h3, h3 = a3, a3 = o3 + I2 | 0, o3 = i3, i3 = r3, r3 = s3, s3 = I2 + (w2 + _2) | 0;
        }
        n3[0] = n3[0] + s3 | 0, n3[1] = n3[1] + r3 | 0, n3[2] = n3[2] + i3 | 0, n3[3] = n3[3] + o3 | 0, n3[4] = n3[4] + a3 | 0, n3[5] = n3[5] + h3 | 0, n3[6] = n3[6] + l2 | 0, n3[7] = n3[7] + d2 | 0;
      }, _doFinalize: function() {
        var t4 = this._data, n3 = t4.words, s3 = 8 * this._nDataBytes, r3 = 8 * t4.sigBytes;
        return n3[r3 >>> 5] |= 128 << 24 - r3 % 32, n3[14 + (r3 + 64 >>> 9 << 4)] = e3.floor(s3 / 4294967296), n3[15 + (r3 + 64 >>> 9 << 4)] = s3, t4.sigBytes = 4 * n3.length, this._process(), this._hash;
      }, clone: function() {
        var e4 = i2.clone.call(this);
        return e4._hash = this._hash.clone(), e4;
      } });
      t3.SHA256 = i2._createHelper(h2), t3.HmacSHA256 = i2._createHmacHelper(h2);
    }(Math), n2.SHA256);
  }), we = _e, Ie = n(function(e2, t2) {
    e2.exports = r.HmacSHA256;
  });
  const ve = () => {
    let e2;
    if (!Promise) {
      e2 = () => {
      }, e2.promise = {};
      const t3 = () => {
        throw new te({ message: 'Your Node runtime does support ES6 Promises. Set "global.Promise" to your preferred implementation of promises.' });
      };
      return Object.defineProperty(e2.promise, "then", { get: t3 }), Object.defineProperty(e2.promise, "catch", { get: t3 }), e2;
    }
    const t2 = new Promise((t3, n2) => {
      e2 = (e3, s2) => e3 ? n2(e3) : t3(s2);
    });
    return e2.promise = t2, e2;
  };
  function Se(e2) {
    return void 0 === e2;
  }
  function Te(e2) {
    return "[object Null]" === Object.prototype.toString.call(e2);
  }
  function be(e2 = "") {
    return e2.replace(/([\s\S]+)\s+(请前往云开发AI小助手查看问题：.*)/, "$1");
  }
  function Ee(e2 = 32) {
    const t2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let n2 = "";
    for (let s2 = 0; s2 < e2; s2++)
      n2 += t2.charAt(Math.floor(62 * Math.random()));
    return n2;
  }
  var ke;
  function Ae(e2) {
    const t2 = (n2 = e2, "[object Array]" === Object.prototype.toString.call(n2) ? e2 : [e2]);
    var n2;
    for (const e3 of t2) {
      const { isMatch: t3, genAdapter: n3, runtime: s2 } = e3;
      if (t3())
        return { adapter: n3(), runtime: s2 };
    }
  }
  !function(e2) {
    e2.WEB = "web", e2.WX_MP = "wx_mp";
  }(ke || (ke = {}));
  const Pe = { adapter: null, runtime: void 0 }, Ce = ["anonymousUuidKey"];
  class Oe extends ye {
    constructor() {
      super(), Pe.adapter.root.tcbObject || (Pe.adapter.root.tcbObject = {});
    }
    setItem(e2, t2) {
      Pe.adapter.root.tcbObject[e2] = t2;
    }
    getItem(e2) {
      return Pe.adapter.root.tcbObject[e2];
    }
    removeItem(e2) {
      delete Pe.adapter.root.tcbObject[e2];
    }
    clear() {
      delete Pe.adapter.root.tcbObject;
    }
  }
  function xe(e2, t2) {
    switch (e2) {
      case "local":
        return t2.localStorage || new Oe();
      case "none":
        return new Oe();
      default:
        return t2.sessionStorage || new Oe();
    }
  }
  class Ne {
    constructor(e2) {
      if (!this._storage) {
        this._persistence = Pe.adapter.primaryStorage || e2.persistence, this._storage = xe(this._persistence, Pe.adapter);
        const t2 = `access_token_${e2.env}`, n2 = `access_token_expire_${e2.env}`, s2 = `refresh_token_${e2.env}`, r2 = `anonymous_uuid_${e2.env}`, i2 = `login_type_${e2.env}`, o2 = "device_id", a2 = `token_type_${e2.env}`, c2 = `user_info_${e2.env}`;
        this.keys = { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2, anonymousUuidKey: r2, loginTypeKey: i2, userInfoKey: c2, deviceIdKey: o2, tokenTypeKey: a2 };
      }
    }
    updatePersistence(e2) {
      if (e2 === this._persistence)
        return;
      const t2 = "local" === this._persistence;
      this._persistence = e2;
      const n2 = xe(e2, Pe.adapter);
      for (const e3 in this.keys) {
        const s2 = this.keys[e3];
        if (t2 && Ce.includes(e3))
          continue;
        const r2 = this._storage.getItem(s2);
        Se(r2) || Te(r2) || (n2.setItem(s2, r2), this._storage.removeItem(s2));
      }
      this._storage = n2;
    }
    setStore(e2, t2, n2) {
      if (!this._storage)
        return;
      const s2 = { version: n2 || "localCachev1", content: t2 }, r2 = JSON.stringify(s2);
      try {
        this._storage.setItem(e2, r2);
      } catch (e3) {
        throw e3;
      }
    }
    getStore(e2, t2) {
      try {
        if (!this._storage)
          return;
      } catch (e3) {
        return "";
      }
      t2 = t2 || "localCachev1";
      const n2 = this._storage.getItem(e2);
      if (!n2)
        return "";
      if (n2.indexOf(t2) >= 0) {
        return JSON.parse(n2).content;
      }
      return "";
    }
    removeStore(e2) {
      this._storage.removeItem(e2);
    }
  }
  const Re = {}, Le = {};
  function Ue(e2) {
    return Re[e2];
  }
  class De {
    constructor(e2, t2) {
      this.data = t2 || null, this.name = e2;
    }
  }
  class Me extends De {
    constructor(e2, t2) {
      super("error", { error: e2, data: t2 }), this.error = e2;
    }
  }
  const qe = new class {
    constructor() {
      this._listeners = {};
    }
    on(e2, t2) {
      return function(e3, t3, n2) {
        n2[e3] = n2[e3] || [], n2[e3].push(t3);
      }(e2, t2, this._listeners), this;
    }
    off(e2, t2) {
      return function(e3, t3, n2) {
        if (n2 && n2[e3]) {
          const s2 = n2[e3].indexOf(t3);
          -1 !== s2 && n2[e3].splice(s2, 1);
        }
      }(e2, t2, this._listeners), this;
    }
    fire(e2, t2) {
      if (e2 instanceof Me)
        return console.error(e2.error), this;
      const n2 = "string" == typeof e2 ? new De(e2, t2 || {}) : e2;
      const s2 = n2.name;
      if (this._listens(s2)) {
        n2.target = this;
        const e3 = this._listeners[s2] ? [...this._listeners[s2]] : [];
        for (const t3 of e3)
          t3.call(this, n2);
      }
      return this;
    }
    _listens(e2) {
      return this._listeners[e2] && this._listeners[e2].length > 0;
    }
  }();
  function Fe(e2, t2) {
    qe.on(e2, t2);
  }
  function Ke(e2, t2 = {}) {
    qe.fire(e2, t2);
  }
  function je(e2, t2) {
    qe.off(e2, t2);
  }
  const $e = "loginStateChanged", Be = "loginStateExpire", We = "loginTypeChanged", He = "anonymousConverted", Je = "refreshAccessToken";
  var ze;
  !function(e2) {
    e2.ANONYMOUS = "ANONYMOUS", e2.WECHAT = "WECHAT", e2.WECHAT_PUBLIC = "WECHAT-PUBLIC", e2.WECHAT_OPEN = "WECHAT-OPEN", e2.CUSTOM = "CUSTOM", e2.EMAIL = "EMAIL", e2.USERNAME = "USERNAME", e2.NULL = "NULL";
  }(ze || (ze = {}));
  class Ve {
    constructor() {
      this._fnPromiseMap = /* @__PURE__ */ new Map();
    }
    async run(e2, t2) {
      let n2 = this._fnPromiseMap.get(e2);
      return n2 || (n2 = new Promise(async (n3, s2) => {
        try {
          await this._runIdlePromise();
          const e3 = t2();
          n3(await e3);
        } catch (e3) {
          s2(e3);
        } finally {
          this._fnPromiseMap.delete(e2);
        }
      }), this._fnPromiseMap.set(e2, n2)), n2;
    }
    _runIdlePromise() {
      return Promise.resolve();
    }
  }
  class Ge {
    constructor(e2) {
      this._singlePromise = new Ve(), this._cache = Ue(e2.env), this._baseURL = `https://${e2.env}.ap-shanghai.tcb-api.tencentcloudapi.com`, this._reqClass = new Pe.adapter.reqClass({ timeout: e2.timeout, timeoutMsg: `请求在${e2.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] });
    }
    _getDeviceId() {
      if (this._deviceID)
        return this._deviceID;
      const { deviceIdKey: e2 } = this._cache.keys;
      let t2 = this._cache.getStore(e2);
      return "string" == typeof t2 && t2.length >= 16 && t2.length <= 48 || (t2 = Ee(), this._cache.setStore(e2, t2)), this._deviceID = t2, t2;
    }
    async _request(e2, t2, n2 = {}) {
      const s2 = { "x-request-id": Ee(), "x-device-id": this._getDeviceId() };
      if (n2.withAccessToken) {
        const { tokenTypeKey: e3 } = this._cache.keys, t3 = await this.getAccessToken(), n3 = this._cache.getStore(e3);
        s2.authorization = `${n3} ${t3}`;
      }
      return this._reqClass["get" === n2.method ? "get" : "post"]({ url: `${this._baseURL}${e2}`, data: t2, headers: s2 });
    }
    async _fetchAccessToken() {
      const { loginTypeKey: e2, accessTokenKey: t2, accessTokenExpireKey: n2, tokenTypeKey: s2 } = this._cache.keys, r2 = this._cache.getStore(e2);
      if (r2 && r2 !== ze.ANONYMOUS)
        throw new te({ code: "INVALID_OPERATION", message: "非匿名登录不支持刷新 access token" });
      const i2 = await this._singlePromise.run("fetchAccessToken", async () => (await this._request("/auth/v1/signin/anonymously", {}, { method: "post" })).data), { access_token: o2, expires_in: a2, token_type: c2 } = i2;
      return this._cache.setStore(s2, c2), this._cache.setStore(t2, o2), this._cache.setStore(n2, Date.now() + 1e3 * a2), o2;
    }
    isAccessTokenExpired(e2, t2) {
      let n2 = true;
      return e2 && t2 && (n2 = t2 < Date.now()), n2;
    }
    async getAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2), s2 = this._cache.getStore(t2);
      return this.isAccessTokenExpired(n2, s2) ? this._fetchAccessToken() : n2;
    }
    async refreshAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, loginTypeKey: n2 } = this._cache.keys;
      return this._cache.removeStore(e2), this._cache.removeStore(t2), this._cache.setStore(n2, ze.ANONYMOUS), this.getAccessToken();
    }
    async getUserInfo() {
      return this._singlePromise.run("getUserInfo", async () => (await this._request("/auth/v1/user/me", {}, { withAccessToken: true, method: "get" })).data);
    }
  }
  const Ye = ["auth.getJwt", "auth.logout", "auth.signInWithTicket", "auth.signInAnonymously", "auth.signIn", "auth.fetchAccessTokenWithRefreshToken", "auth.signUpWithEmailAndPassword", "auth.activateEndUserMail", "auth.sendPasswordResetEmail", "auth.resetPasswordWithToken", "auth.isUsernameRegistered"], Qe = { "X-SDK-Version": "1.3.5" };
  function Xe(e2, t2, n2) {
    const s2 = e2[t2];
    e2[t2] = function(t3) {
      const r2 = {}, i2 = {};
      n2.forEach((n3) => {
        const { data: s3, headers: o3 } = n3.call(e2, t3);
        Object.assign(r2, s3), Object.assign(i2, o3);
      });
      const o2 = t3.data;
      return o2 && (() => {
        var e3;
        if (e3 = o2, "[object FormData]" !== Object.prototype.toString.call(e3))
          t3.data = { ...o2, ...r2 };
        else
          for (const e4 in r2)
            o2.append(e4, r2[e4]);
      })(), t3.headers = { ...t3.headers || {}, ...i2 }, s2.call(e2, t3);
    };
  }
  function Ze() {
    const e2 = Math.random().toString(16).slice(2);
    return { data: { seqId: e2 }, headers: { ...Qe, "x-seqid": e2 } };
  }
  class et {
    constructor(e2 = {}) {
      var t2;
      this.config = e2, this._reqClass = new Pe.adapter.reqClass({ timeout: this.config.timeout, timeoutMsg: `请求在${this.config.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] }), this._cache = Ue(this.config.env), this._localCache = (t2 = this.config.env, Le[t2]), this.oauth = new Ge(this.config), Xe(this._reqClass, "post", [Ze]), Xe(this._reqClass, "upload", [Ze]), Xe(this._reqClass, "download", [Ze]);
    }
    async post(e2) {
      return await this._reqClass.post(e2);
    }
    async upload(e2) {
      return await this._reqClass.upload(e2);
    }
    async download(e2) {
      return await this._reqClass.download(e2);
    }
    async refreshAccessToken() {
      let e2, t2;
      this._refreshAccessTokenPromise || (this._refreshAccessTokenPromise = this._refreshAccessToken());
      try {
        e2 = await this._refreshAccessTokenPromise;
      } catch (e3) {
        t2 = e3;
      }
      if (this._refreshAccessTokenPromise = null, this._shouldRefreshAccessTokenHook = null, t2)
        throw t2;
      return e2;
    }
    async _refreshAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, refreshTokenKey: n2, loginTypeKey: s2, anonymousUuidKey: r2 } = this._cache.keys;
      this._cache.removeStore(e2), this._cache.removeStore(t2);
      let i2 = this._cache.getStore(n2);
      if (!i2)
        throw new te({ message: "未登录CloudBase" });
      const o2 = { refresh_token: i2 }, a2 = await this.request("auth.fetchAccessTokenWithRefreshToken", o2);
      if (a2.data.code) {
        const { code: e3 } = a2.data;
        if ("SIGN_PARAM_INVALID" === e3 || "REFRESH_TOKEN_EXPIRED" === e3 || "INVALID_REFRESH_TOKEN" === e3) {
          if (this._cache.getStore(s2) === ze.ANONYMOUS && "INVALID_REFRESH_TOKEN" === e3) {
            const e4 = this._cache.getStore(r2), t3 = this._cache.getStore(n2), s3 = await this.send("auth.signInAnonymously", { anonymous_uuid: e4, refresh_token: t3 });
            return this.setRefreshToken(s3.refresh_token), this._refreshAccessToken();
          }
          Ke(Be), this._cache.removeStore(n2);
        }
        throw new te({ code: a2.data.code, message: `刷新access token失败：${a2.data.code}` });
      }
      if (a2.data.access_token)
        return Ke(Je), this._cache.setStore(e2, a2.data.access_token), this._cache.setStore(t2, a2.data.access_token_expire + Date.now()), { accessToken: a2.data.access_token, accessTokenExpire: a2.data.access_token_expire };
      a2.data.refresh_token && (this._cache.removeStore(n2), this._cache.setStore(n2, a2.data.refresh_token), this._refreshAccessToken());
    }
    async getAccessToken() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2, refreshTokenKey: n2 } = this._cache.keys;
      if (!this._cache.getStore(n2))
        throw new te({ message: "refresh token不存在，登录状态异常" });
      let s2 = this._cache.getStore(e2), r2 = this._cache.getStore(t2), i2 = true;
      return this._shouldRefreshAccessTokenHook && !await this._shouldRefreshAccessTokenHook(s2, r2) && (i2 = false), (!s2 || !r2 || r2 < Date.now()) && i2 ? this.refreshAccessToken() : { accessToken: s2, accessTokenExpire: r2 };
    }
    async request(e2, t2, n2) {
      const s2 = `x-tcb-trace_${this.config.env}`;
      let r2 = "application/x-www-form-urlencoded";
      const i2 = { action: e2, env: this.config.env, dataVersion: "2019-08-16", ...t2 };
      let o2;
      if (-1 === Ye.indexOf(e2) && (this._cache.keys, i2.access_token = await this.oauth.getAccessToken()), "storage.uploadFile" === e2) {
        o2 = new FormData();
        for (let e3 in o2)
          o2.hasOwnProperty(e3) && void 0 !== o2[e3] && o2.append(e3, i2[e3]);
        r2 = "multipart/form-data";
      } else {
        r2 = "application/json", o2 = {};
        for (let e3 in i2)
          void 0 !== i2[e3] && (o2[e3] = i2[e3]);
      }
      let a2 = { headers: { "content-type": r2 } };
      n2 && n2.timeout && (a2.timeout = n2.timeout), n2 && n2.onUploadProgress && (a2.onUploadProgress = n2.onUploadProgress);
      const c2 = this._localCache.getStore(s2);
      c2 && (a2.headers["X-TCB-Trace"] = c2);
      const { parse: u2, inQuery: h2, search: l2 } = t2;
      let d2 = { env: this.config.env };
      u2 && (d2.parse = true), h2 && (d2 = { ...h2, ...d2 });
      let p2 = function(e3, t3, n3 = {}) {
        const s3 = /\?/.test(t3);
        let r3 = "";
        for (let e4 in n3)
          "" === r3 ? !s3 && (t3 += "?") : r3 += "&", r3 += `${e4}=${encodeURIComponent(n3[e4])}`;
        return /^http(s)?\:\/\//.test(t3 += r3) ? t3 : `${e3}${t3}`;
      }(ge, "//tcb-api.tencentcloudapi.com/web", d2);
      l2 && (p2 += l2);
      const f2 = await this.post({ url: p2, data: o2, ...a2 }), g2 = f2.header && f2.header["x-tcb-trace"];
      if (g2 && this._localCache.setStore(s2, g2), 200 !== Number(f2.status) && 200 !== Number(f2.statusCode) || !f2.data)
        throw new te({ code: "NETWORK_ERROR", message: "network request error" });
      return f2;
    }
    async send(e2, t2 = {}, n2 = {}) {
      const s2 = await this.request(e2, t2, { ...n2, onUploadProgress: t2.onUploadProgress });
      if (("ACCESS_TOKEN_DISABLED" === s2.data.code || "ACCESS_TOKEN_EXPIRED" === s2.data.code) && -1 === Ye.indexOf(e2)) {
        await this.oauth.refreshAccessToken();
        const s3 = await this.request(e2, t2, { ...n2, onUploadProgress: t2.onUploadProgress });
        if (s3.data.code)
          throw new te({ code: s3.data.code, message: be(s3.data.message) });
        return s3.data;
      }
      if (s2.data.code)
        throw new te({ code: s2.data.code, message: be(s2.data.message) });
      return s2.data;
    }
    setRefreshToken(e2) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e2);
    }
  }
  const tt = {};
  function nt(e2) {
    return tt[e2];
  }
  class st {
    constructor(e2) {
      this.config = e2, this._cache = Ue(e2.env), this._request = nt(e2.env);
    }
    setRefreshToken(e2) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e2);
    }
    setAccessToken(e2, t2) {
      const { accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys;
      this._cache.setStore(n2, e2), this._cache.setStore(s2, t2);
    }
    async refreshUserInfo() {
      const { data: e2 } = await this._request.send("auth.getUserInfo", {});
      return this.setLocalUserInfo(e2), e2;
    }
    setLocalUserInfo(e2) {
      const { userInfoKey: t2 } = this._cache.keys;
      this._cache.setStore(t2, e2);
    }
  }
  class rt {
    constructor(e2) {
      if (!e2)
        throw new te({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._envId = e2, this._cache = Ue(this._envId), this._request = nt(this._envId), this.setUserInfo();
    }
    linkWithTicket(e2) {
      if ("string" != typeof e2)
        throw new te({ code: "PARAM_ERROR", message: "ticket must be string" });
      return this._request.send("auth.linkWithTicket", { ticket: e2 });
    }
    linkWithRedirect(e2) {
      e2.signInWithRedirect();
    }
    updatePassword(e2, t2) {
      return this._request.send("auth.updatePassword", { oldPassword: t2, newPassword: e2 });
    }
    updateEmail(e2) {
      return this._request.send("auth.updateEmail", { newEmail: e2 });
    }
    updateUsername(e2) {
      if ("string" != typeof e2)
        throw new te({ code: "PARAM_ERROR", message: "username must be a string" });
      return this._request.send("auth.updateUsername", { username: e2 });
    }
    async getLinkedUidList() {
      const { data: e2 } = await this._request.send("auth.getLinkedUidList", {});
      let t2 = false;
      const { users: n2 } = e2;
      return n2.forEach((e3) => {
        e3.wxOpenId && e3.wxPublicId && (t2 = true);
      }), { users: n2, hasPrimaryUid: t2 };
    }
    setPrimaryUid(e2) {
      return this._request.send("auth.setPrimaryUid", { uid: e2 });
    }
    unlink(e2) {
      return this._request.send("auth.unlink", { platform: e2 });
    }
    async update(e2) {
      const { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 } = e2, { data: a2 } = await this._request.send("auth.updateUserInfo", { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 });
      this.setLocalUserInfo(a2);
    }
    async refresh() {
      const e2 = await this._request.oauth.getUserInfo();
      return this.setLocalUserInfo(e2), e2;
    }
    setUserInfo() {
      const { userInfoKey: e2 } = this._cache.keys, t2 = this._cache.getStore(e2);
      ["uid", "loginType", "openid", "wxOpenId", "wxPublicId", "unionId", "qqMiniOpenId", "email", "hasPassword", "customUserId", "nickName", "gender", "avatarUrl"].forEach((e3) => {
        this[e3] = t2[e3];
      }), this.location = { country: t2.country, province: t2.province, city: t2.city };
    }
    setLocalUserInfo(e2) {
      const { userInfoKey: t2 } = this._cache.keys;
      this._cache.setStore(t2, e2), this.setUserInfo();
    }
  }
  class it {
    constructor(e2) {
      if (!e2)
        throw new te({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._cache = Ue(e2);
      const { refreshTokenKey: t2, accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys, r2 = this._cache.getStore(t2), i2 = this._cache.getStore(n2), o2 = this._cache.getStore(s2);
      this.credential = { refreshToken: r2, accessToken: i2, accessTokenExpire: o2 }, this.user = new rt(e2);
    }
    get isAnonymousAuth() {
      return this.loginType === ze.ANONYMOUS;
    }
    get isCustomAuth() {
      return this.loginType === ze.CUSTOM;
    }
    get isWeixinAuth() {
      return this.loginType === ze.WECHAT || this.loginType === ze.WECHAT_OPEN || this.loginType === ze.WECHAT_PUBLIC;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
  }
  class ot extends st {
    async signIn() {
      this._cache.updatePersistence("local"), await this._request.oauth.getAccessToken(), Ke($e), Ke(We, { env: this.config.env, loginType: ze.ANONYMOUS, persistence: "local" });
      const e2 = new it(this.config.env);
      return await e2.user.refresh(), e2;
    }
    async linkAndRetrieveDataWithTicket(e2) {
      const { anonymousUuidKey: t2, refreshTokenKey: n2 } = this._cache.keys, s2 = this._cache.getStore(t2), r2 = this._cache.getStore(n2), i2 = await this._request.send("auth.linkAndRetrieveDataWithTicket", { anonymous_uuid: s2, refresh_token: r2, ticket: e2 });
      if (i2.refresh_token)
        return this._clearAnonymousUUID(), this.setRefreshToken(i2.refresh_token), await this._request.refreshAccessToken(), Ke(He, { env: this.config.env }), Ke(We, { loginType: ze.CUSTOM, persistence: "local" }), { credential: { refreshToken: i2.refresh_token } };
      throw new te({ message: "匿名转化失败" });
    }
    _setAnonymousUUID(e2) {
      const { anonymousUuidKey: t2, loginTypeKey: n2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.setStore(t2, e2), this._cache.setStore(n2, ze.ANONYMOUS);
    }
    _clearAnonymousUUID() {
      this._cache.removeStore(this._cache.keys.anonymousUuidKey);
    }
  }
  class at extends st {
    async signIn(e2) {
      if ("string" != typeof e2)
        throw new te({ code: "PARAM_ERROR", message: "ticket must be a string" });
      const { refreshTokenKey: t2 } = this._cache.keys, n2 = await this._request.send("auth.signInWithTicket", { ticket: e2, refresh_token: this._cache.getStore(t2) || "" });
      if (n2.refresh_token)
        return this.setRefreshToken(n2.refresh_token), await this._request.refreshAccessToken(), Ke($e), Ke(We, { env: this.config.env, loginType: ze.CUSTOM, persistence: this.config.persistence }), await this.refreshUserInfo(), new it(this.config.env);
      throw new te({ message: "自定义登录失败" });
    }
  }
  class ct extends st {
    async signIn(e2, t2) {
      if ("string" != typeof e2)
        throw new te({ code: "PARAM_ERROR", message: "email must be a string" });
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: "EMAIL", email: e2, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token: i2, access_token_expire: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), i2 && o2 ? this.setAccessToken(i2, o2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), Ke($e), Ke(We, { env: this.config.env, loginType: ze.EMAIL, persistence: this.config.persistence }), new it(this.config.env);
      throw s2.code ? new te({ code: s2.code, message: `邮箱登录失败: ${s2.message}` }) : new te({ message: "邮箱登录失败" });
    }
    async activate(e2) {
      return this._request.send("auth.activateEndUserMail", { token: e2 });
    }
    async resetPasswordWithToken(e2, t2) {
      return this._request.send("auth.resetPasswordWithToken", { token: e2, newPassword: t2 });
    }
  }
  class ut extends st {
    async signIn(e2, t2) {
      if ("string" != typeof e2)
        throw new te({ code: "PARAM_ERROR", message: "username must be a string" });
      "string" != typeof t2 && (t2 = "", console.warn("password is empty"));
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: ze.USERNAME, username: e2, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token_expire: i2, access_token: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), o2 && i2 ? this.setAccessToken(o2, i2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), Ke($e), Ke(We, { env: this.config.env, loginType: ze.USERNAME, persistence: this.config.persistence }), new it(this.config.env);
      throw s2.code ? new te({ code: s2.code, message: `用户名密码登录失败: ${s2.message}` }) : new te({ message: "用户名密码登录失败" });
    }
  }
  class ht {
    constructor(e2) {
      this.config = e2, this._cache = Ue(e2.env), this._request = nt(e2.env), this._onAnonymousConverted = this._onAnonymousConverted.bind(this), this._onLoginTypeChanged = this._onLoginTypeChanged.bind(this), Fe(We, this._onLoginTypeChanged);
    }
    get currentUser() {
      const e2 = this.hasLoginState();
      return e2 && e2.user || null;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
    anonymousAuthProvider() {
      return new ot(this.config);
    }
    customAuthProvider() {
      return new at(this.config);
    }
    emailAuthProvider() {
      return new ct(this.config);
    }
    usernameAuthProvider() {
      return new ut(this.config);
    }
    async signInAnonymously() {
      return new ot(this.config).signIn();
    }
    async signInWithEmailAndPassword(e2, t2) {
      return new ct(this.config).signIn(e2, t2);
    }
    signInWithUsernameAndPassword(e2, t2) {
      return new ut(this.config).signIn(e2, t2);
    }
    async linkAndRetrieveDataWithTicket(e2) {
      this._anonymousAuthProvider || (this._anonymousAuthProvider = new ot(this.config)), Fe(He, this._onAnonymousConverted);
      return await this._anonymousAuthProvider.linkAndRetrieveDataWithTicket(e2);
    }
    async signOut() {
      if (this.loginType === ze.ANONYMOUS)
        throw new te({ message: "匿名用户不支持登出操作" });
      const { refreshTokenKey: e2, accessTokenKey: t2, accessTokenExpireKey: n2 } = this._cache.keys, s2 = this._cache.getStore(e2);
      if (!s2)
        return;
      const r2 = await this._request.send("auth.logout", { refresh_token: s2 });
      return this._cache.removeStore(e2), this._cache.removeStore(t2), this._cache.removeStore(n2), Ke($e), Ke(We, { env: this.config.env, loginType: ze.NULL, persistence: this.config.persistence }), r2;
    }
    async signUpWithEmailAndPassword(e2, t2) {
      return this._request.send("auth.signUpWithEmailAndPassword", { email: e2, password: t2 });
    }
    async sendPasswordResetEmail(e2) {
      return this._request.send("auth.sendPasswordResetEmail", { email: e2 });
    }
    onLoginStateChanged(e2) {
      Fe($e, () => {
        const t3 = this.hasLoginState();
        e2.call(this, t3);
      });
      const t2 = this.hasLoginState();
      e2.call(this, t2);
    }
    onLoginStateExpired(e2) {
      Fe(Be, e2.bind(this));
    }
    onAccessTokenRefreshed(e2) {
      Fe(Je, e2.bind(this));
    }
    onAnonymousConverted(e2) {
      Fe(He, e2.bind(this));
    }
    onLoginTypeChanged(e2) {
      Fe(We, () => {
        const t2 = this.hasLoginState();
        e2.call(this, t2);
      });
    }
    async getAccessToken() {
      return { accessToken: (await this._request.getAccessToken()).accessToken, env: this.config.env };
    }
    hasLoginState() {
      const { accessTokenKey: e2, accessTokenExpireKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2), s2 = this._cache.getStore(t2);
      return this._request.oauth.isAccessTokenExpired(n2, s2) ? null : new it(this.config.env);
    }
    async isUsernameRegistered(e2) {
      if ("string" != typeof e2)
        throw new te({ code: "PARAM_ERROR", message: "username must be a string" });
      const { data: t2 } = await this._request.send("auth.isUsernameRegistered", { username: e2 });
      return t2 && t2.isRegistered;
    }
    getLoginState() {
      return Promise.resolve(this.hasLoginState());
    }
    async signInWithTicket(e2) {
      return new at(this.config).signIn(e2);
    }
    shouldRefreshAccessToken(e2) {
      this._request._shouldRefreshAccessTokenHook = e2.bind(this);
    }
    getUserInfo() {
      return this._request.send("auth.getUserInfo", {}).then((e2) => e2.code ? e2 : { ...e2.data, requestId: e2.seqId });
    }
    getAuthHeader() {
      const { refreshTokenKey: e2, accessTokenKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e2);
      return { "x-cloudbase-credentials": this._cache.getStore(t2) + "/@@/" + n2 };
    }
    _onAnonymousConverted(e2) {
      const { env: t2 } = e2.data;
      t2 === this.config.env && this._cache.updatePersistence(this.config.persistence);
    }
    _onLoginTypeChanged(e2) {
      const { loginType: t2, persistence: n2, env: s2 } = e2.data;
      s2 === this.config.env && (this._cache.updatePersistence(n2), this._cache.setStore(this._cache.keys.loginTypeKey, t2));
    }
  }
  const lt = function(e2, t2) {
    t2 = t2 || ve();
    const n2 = nt(this.config.env), { cloudPath: s2, filePath: r2, onUploadProgress: i2, fileType: o2 = "image" } = e2;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e3) => {
      const { data: { url: a2, authorization: c2, token: u2, fileId: h2, cosFileId: l2 }, requestId: d2 } = e3, p2 = { key: s2, signature: c2, "x-cos-meta-fileid": l2, success_action_status: "201", "x-cos-security-token": u2 };
      n2.upload({ url: a2, data: p2, file: r2, name: s2, fileType: o2, onUploadProgress: i2 }).then((e4) => {
        201 === e4.statusCode ? t2(null, { fileID: h2, requestId: d2 }) : t2(new te({ code: "STORAGE_REQUEST_FAIL", message: `STORAGE_REQUEST_FAIL: ${e4.data}` }));
      }).catch((e4) => {
        t2(e4);
      });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, dt = function(e2, t2) {
    t2 = t2 || ve();
    const n2 = nt(this.config.env), { cloudPath: s2 } = e2;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e3) => {
      t2(null, e3);
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, pt = function({ fileList: e2 }, t2) {
    if (t2 = t2 || ve(), !e2 || !Array.isArray(e2))
      return { code: "INVALID_PARAM", message: "fileList必须是非空的数组" };
    for (let t3 of e2)
      if (!t3 || "string" != typeof t3)
        return { code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" };
    const n2 = { fileid_list: e2 };
    return nt(this.config.env).send("storage.batchDeleteFile", n2).then((e3) => {
      e3.code ? t2(null, e3) : t2(null, { fileList: e3.data.delete_list, requestId: e3.requestId });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, ft = function({ fileList: e2 }, t2) {
    t2 = t2 || ve(), e2 && Array.isArray(e2) || t2(null, { code: "INVALID_PARAM", message: "fileList必须是非空的数组" });
    let n2 = [];
    for (let s3 of e2)
      "object" == typeof s3 ? (s3.hasOwnProperty("fileID") && s3.hasOwnProperty("maxAge") || t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是包含fileID和maxAge的对象" }), n2.push({ fileid: s3.fileID, max_age: s3.maxAge })) : "string" == typeof s3 ? n2.push({ fileid: s3 }) : t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是字符串" });
    const s2 = { file_list: n2 };
    return nt(this.config.env).send("storage.batchGetDownloadUrl", s2).then((e3) => {
      e3.code ? t2(null, e3) : t2(null, { fileList: e3.data.download_list, requestId: e3.requestId });
    }).catch((e3) => {
      t2(e3);
    }), t2.promise;
  }, gt = async function({ fileID: e2 }, t2) {
    const n2 = (await ft.call(this, { fileList: [{ fileID: e2, maxAge: 600 }] })).fileList[0];
    if ("SUCCESS" !== n2.code)
      return t2 ? t2(n2) : new Promise((e3) => {
        e3(n2);
      });
    const s2 = nt(this.config.env);
    let r2 = n2.download_url;
    if (r2 = encodeURI(r2), !t2)
      return s2.download({ url: r2 });
    t2(await s2.download({ url: r2 }));
  }, mt = function({ name: e2, data: t2, query: n2, parse: s2, search: r2, timeout: i2 }, o2) {
    const a2 = o2 || ve();
    let c2;
    try {
      c2 = t2 ? JSON.stringify(t2) : "";
    } catch (e3) {
      return Promise.reject(e3);
    }
    if (!e2)
      return Promise.reject(new te({ code: "PARAM_ERROR", message: "函数名不能为空" }));
    const u2 = { inQuery: n2, parse: s2, search: r2, function_name: e2, request_data: c2 };
    return nt(this.config.env).send("functions.invokeFunction", u2, { timeout: i2 }).then((e3) => {
      if (e3.code)
        a2(null, e3);
      else {
        let t3 = e3.data.response_data;
        if (s2)
          a2(null, { result: t3, requestId: e3.requestId });
        else
          try {
            t3 = JSON.parse(e3.data.response_data), a2(null, { result: t3, requestId: e3.requestId });
          } catch (e4) {
            a2(new te({ message: "response data must be json" }));
          }
      }
      return a2.promise;
    }).catch((e3) => {
      a2(e3);
    }), a2.promise;
  }, yt = { timeout: 15e3, persistence: "session" }, _t = 6e5, wt = {};
  class It {
    constructor(e2) {
      this.config = e2 || this.config, this.authObj = void 0;
    }
    init(e2) {
      switch (Pe.adapter || (this.requestClient = new Pe.adapter.reqClass({ timeout: e2.timeout || 5e3, timeoutMsg: `请求在${(e2.timeout || 5e3) / 1e3}s内未完成，已中断` })), this.config = { ...yt, ...e2 }, true) {
        case this.config.timeout > _t:
          console.warn("timeout大于可配置上限[10分钟]，已重置为上限数值"), this.config.timeout = _t;
          break;
        case this.config.timeout < 100:
          console.warn("timeout小于可配置下限[100ms]，已重置为下限数值"), this.config.timeout = 100;
      }
      return new It(this.config);
    }
    auth({ persistence: e2 } = {}) {
      if (this.authObj)
        return this.authObj;
      const t2 = e2 || Pe.adapter.primaryStorage || yt.persistence;
      var n2;
      return t2 !== this.config.persistence && (this.config.persistence = t2), function(e3) {
        const { env: t3 } = e3;
        Re[t3] = new Ne(e3), Le[t3] = new Ne({ ...e3, persistence: "local" });
      }(this.config), n2 = this.config, tt[n2.env] = new et(n2), this.authObj = new ht(this.config), this.authObj;
    }
    on(e2, t2) {
      return Fe.apply(this, [e2, t2]);
    }
    off(e2, t2) {
      return je.apply(this, [e2, t2]);
    }
    callFunction(e2, t2) {
      return mt.apply(this, [e2, t2]);
    }
    deleteFile(e2, t2) {
      return pt.apply(this, [e2, t2]);
    }
    getTempFileURL(e2, t2) {
      return ft.apply(this, [e2, t2]);
    }
    downloadFile(e2, t2) {
      return gt.apply(this, [e2, t2]);
    }
    uploadFile(e2, t2) {
      return lt.apply(this, [e2, t2]);
    }
    getUploadMetadata(e2, t2) {
      return dt.apply(this, [e2, t2]);
    }
    registerExtension(e2) {
      wt[e2.name] = e2;
    }
    async invokeExtension(e2, t2) {
      const n2 = wt[e2];
      if (!n2)
        throw new te({ message: `扩展${e2} 必须先注册` });
      return await n2.invoke(t2, this);
    }
    useAdapters(e2) {
      const { adapter: t2, runtime: n2 } = Ae(e2) || {};
      t2 && (Pe.adapter = t2), n2 && (Pe.runtime = n2);
    }
  }
  var vt = new It();
  function St(e2, t2, n2) {
    void 0 === n2 && (n2 = {});
    var s2 = /\?/.test(t2), r2 = "";
    for (var i2 in n2)
      "" === r2 ? !s2 && (t2 += "?") : r2 += "&", r2 += i2 + "=" + encodeURIComponent(n2[i2]);
    return /^http(s)?:\/\//.test(t2 += r2) ? t2 : "" + e2 + t2;
  }
  class Tt {
    get(e2) {
      const { url: t2, data: n2, headers: s2, timeout: r2 } = e2;
      return new Promise((e3, i2) => {
        ne.request({ url: St("https:", t2), data: n2, method: "GET", header: s2, timeout: r2, success(t3) {
          e3(t3);
        }, fail(e4) {
          i2(e4);
        } });
      });
    }
    post(e2) {
      const { url: t2, data: n2, headers: s2, timeout: r2 } = e2;
      return new Promise((e3, i2) => {
        ne.request({ url: St("https:", t2), data: n2, method: "POST", header: s2, timeout: r2, success(t3) {
          e3(t3);
        }, fail(e4) {
          i2(e4);
        } });
      });
    }
    upload(e2) {
      return new Promise((t2, n2) => {
        const { url: s2, file: r2, data: i2, headers: o2, fileType: a2 } = e2, c2 = ne.uploadFile({ url: St("https:", s2), name: "file", formData: Object.assign({}, i2), filePath: r2, fileType: a2, header: o2, success(e3) {
          const n3 = { statusCode: e3.statusCode, data: e3.data || {} };
          200 === e3.statusCode && i2.success_action_status && (n3.statusCode = parseInt(i2.success_action_status, 10)), t2(n3);
        }, fail(e3) {
          n2(new Error(e3.errMsg || "uploadFile:fail"));
        } });
        "function" == typeof e2.onUploadProgress && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((t3) => {
          e2.onUploadProgress({ loaded: t3.totalBytesSent, total: t3.totalBytesExpectedToSend });
        });
      });
    }
  }
  const bt = { setItem(e2, t2) {
    ne.setStorageSync(e2, t2);
  }, getItem: (e2) => ne.getStorageSync(e2), removeItem(e2) {
    ne.removeStorageSync(e2);
  }, clear() {
    ne.clearStorageSync();
  } };
  var Et = { genAdapter: function() {
    return { root: {}, reqClass: Tt, localStorage: bt, primaryStorage: "local" };
  }, isMatch: function() {
    return true;
  }, runtime: "uni_app" };
  vt.useAdapters(Et);
  const kt = vt, At = kt.init;
  kt.init = function(e2) {
    e2.env = e2.spaceId;
    const t2 = At.call(this, e2);
    t2.config.provider = "tencent", t2.config.spaceId = e2.spaceId;
    const n2 = t2.auth;
    return t2.auth = function(e3) {
      const t3 = n2.call(this, e3);
      return ["linkAndRetrieveDataWithTicket", "signInAnonymously", "signOut", "getAccessToken", "getLoginState", "signInWithTicket", "getUserInfo"].forEach((e4) => {
        var n3;
        t3[e4] = (n3 = t3[e4], function(e5) {
          e5 = e5 || {};
          const { success: t4, fail: s2, complete: r2 } = ee(e5);
          if (!(t4 || s2 || r2))
            return n3.call(this, e5);
          n3.call(this, e5).then((e6) => {
            t4 && t4(e6), r2 && r2(e6);
          }, (e6) => {
            s2 && s2(e6), r2 && r2(e6);
          });
        }).bind(t3);
      }), t3;
    }, t2.customAuth = t2.auth, t2;
  };
  var Pt = kt;
  async function Ct(e2, t2) {
    const n2 = `http://${e2}:${t2}/system/ping`;
    try {
      const e3 = await (s2 = { url: n2, timeout: 500 }, new Promise((e4, t3) => {
        ne.request({ ...s2, success(t4) {
          e4(t4);
        }, fail(e5) {
          t3(e5);
        } });
      }));
      return !(!e3.data || 0 !== e3.data.code);
    } catch (e3) {
      return false;
    }
    var s2;
  }
  async function Ot(e2, t2) {
    let n2;
    for (let s2 = 0; s2 < e2.length; s2++) {
      const r2 = e2[s2];
      if (await Ct(r2, t2)) {
        n2 = r2;
        break;
      }
    }
    return { address: n2, port: t2 };
  }
  const xt = { "serverless.file.resource.generateProximalSign": "storage/generate-proximal-sign", "serverless.file.resource.report": "storage/report", "serverless.file.resource.delete": "storage/delete", "serverless.file.resource.getTempFileURL": "storage/get-temp-file-url" };
  var Nt = class {
    constructor(e2) {
      if (["spaceId", "clientSecret"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), !e2.endpoint)
        throw new Error("集群空间未配置ApiEndpoint，配置后需要重新关联服务空间后生效");
      this.config = Object.assign({}, e2), this.config.provider = "dcloud", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.adapter = ne;
    }
    async request(e2, t2 = true) {
      const n2 = t2;
      return e2 = n2 ? await this.setupLocalRequest(e2) : this.setupRequest(e2), Promise.resolve().then(() => n2 ? this.requestLocal(e2) : de.wrappedRequest(e2, this.adapter.request));
    }
    requestLocal(e2) {
      return new Promise((t2, n2) => {
        this.adapter.request(Object.assign(e2, { complete(e3) {
          if (e3 || (e3 = {}), !e3.statusCode || e3.statusCode >= 400) {
            const t3 = e3.data && e3.data.code || "SYS_ERR", s2 = e3.data && e3.data.message || "request:fail";
            return n2(new te({ code: t3, message: s2 }));
          }
          t2({ success: true, result: e3.data });
        } }));
      });
    }
    setupRequest(e2) {
      const t2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now() }), n2 = { "Content-Type": "application/json" };
      n2["x-serverless-sign"] = de.sign(t2, this.config.clientSecret);
      const s2 = le();
      n2["x-client-info"] = encodeURIComponent(JSON.stringify(s2));
      const { token: r2 } = re();
      return n2["x-client-token"] = r2, { url: this.config.requestUrl, method: "POST", data: t2, dataType: "json", header: JSON.parse(JSON.stringify(n2)) };
    }
    async setupLocalRequest(e2) {
      const t2 = le(), { token: n2 } = re(), s2 = Object.assign({}, e2, { spaceId: this.config.spaceId, timestamp: Date.now(), clientInfo: t2, token: n2 }), { address: r2, servePort: i2 } = this.__dev__ && this.__dev__.debugInfo || {}, { address: o2 } = await Ot(r2, i2);
      return { url: `http://${o2}:${i2}/${xt[e2.method]}`, method: "POST", data: s2, dataType: "json", header: JSON.parse(JSON.stringify({ "Content-Type": "application/json" })) };
    }
    callFunction(e2) {
      const t2 = { method: "serverless.function.runtime.invoke", params: JSON.stringify({ functionTarget: e2.name, functionArgs: e2.data || {} }) };
      return this.request(t2, false);
    }
    getUploadFileOptions(e2) {
      const t2 = { method: "serverless.file.resource.generateProximalSign", params: JSON.stringify(e2) };
      return this.request(t2);
    }
    reportUploadFile(e2) {
      const t2 = { method: "serverless.file.resource.report", params: JSON.stringify(e2) };
      return this.request(t2);
    }
    uploadFile({ filePath: e2, cloudPath: t2, fileType: n2 = "image", onUploadProgress: s2 }) {
      if (!t2)
        throw new te({ code: "CLOUDPATH_REQUIRED", message: "cloudPath不可为空" });
      let r2;
      return this.getUploadFileOptions({ cloudPath: t2 }).then((t3) => {
        const { url: i2, formData: o2, name: a2 } = t3.result;
        return r2 = t3.result.fileUrl, new Promise((t4, r3) => {
          const c2 = this.adapter.uploadFile({ url: i2, formData: o2, name: a2, filePath: e2, fileType: n2, success(e3) {
            e3 && e3.statusCode < 400 ? t4(e3) : r3(new te({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
          }, fail(e3) {
            r3(new te({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
          } });
          "function" == typeof s2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e3) => {
            s2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
          });
        });
      }).then(() => this.reportUploadFile({ cloudPath: t2 })).then((t3) => new Promise((n3, s3) => {
        t3.success ? n3({ success: true, filePath: e2, fileID: r2 }) : s3(new te({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
      }));
    }
    deleteFile({ fileList: e2 }) {
      const t2 = { method: "serverless.file.resource.delete", params: JSON.stringify({ fileList: e2 }) };
      return this.request(t2).then((e3) => {
        if (e3.success)
          return e3.result;
        throw new te({ code: "DELETE_FILE_FAILED", message: "删除文件失败" });
      });
    }
    getTempFileURL({ fileList: e2, maxAge: t2 } = {}) {
      if (!Array.isArray(e2) || 0 === e2.length)
        throw new te({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const n2 = { method: "serverless.file.resource.getTempFileURL", params: JSON.stringify({ fileList: e2, maxAge: t2 }) };
      return this.request(n2).then((e3) => {
        if (e3.success)
          return { fileList: e3.result.fileList.map((e4) => ({ fileID: e4.fileID, tempFileURL: e4.tempFileURL })) };
        throw new te({ code: "GET_TEMP_FILE_URL_FAILED", message: "获取临时文件链接失败" });
      });
    }
  };
  var Rt = { init(e2) {
    const t2 = new Nt(e2), n2 = { signInAnonymously: function() {
      return Promise.resolve();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } }, Lt = n(function(e2, t2) {
    e2.exports = r.enc.Hex;
  });
  function Ut() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e2) {
      var t2 = 16 * Math.random() | 0;
      return ("x" === e2 ? t2 : 3 & t2 | 8).toString(16);
    });
  }
  function Dt(e2 = "", t2 = {}) {
    const { data: n2, functionName: s2, method: r2, headers: i2, signHeaderKeys: o2 = [], config: a2 } = t2, c2 = String(Date.now()), u2 = Ut(), h2 = Object.assign({}, i2, { "x-from-app-id": a2.spaceAppId, "x-from-env-id": a2.spaceId, "x-to-env-id": a2.spaceId, "x-from-instance-id": c2, "x-from-function-name": s2, "x-client-timestamp": c2, "x-alipay-source": "client", "x-request-id": u2, "x-alipay-callid": u2, "x-trace-id": u2 }), l2 = ["x-from-app-id", "x-from-env-id", "x-to-env-id", "x-from-instance-id", "x-from-function-name", "x-client-timestamp"].concat(o2), [d2 = "", p2 = ""] = e2.split("?") || [], f2 = function(e3) {
      const t3 = "HMAC-SHA256", n3 = e3.signedHeaders.join(";"), s3 = e3.signedHeaders.map((t4) => `${t4.toLowerCase()}:${e3.headers[t4]}
`).join(""), r3 = we(e3.body).toString(Lt), i3 = `${e3.method.toUpperCase()}
${e3.path}
${e3.query}
${s3}
${n3}
${r3}
`, o3 = we(i3).toString(Lt), a3 = `${t3}
${e3.timestamp}
${o3}
`, c3 = Ie(a3, e3.secretKey).toString(Lt);
      return `${t3} Credential=${e3.secretId}, SignedHeaders=${n3}, Signature=${c3}`;
    }({ path: d2, query: p2, method: r2, headers: h2, timestamp: c2, body: JSON.stringify(n2), secretId: a2.accessKey, secretKey: a2.secretKey, signedHeaders: l2.sort() });
    return { url: `${a2.endpoint}${e2}`, headers: Object.assign({}, h2, { Authorization: f2 }) };
  }
  function Mt({ url: e2, data: t2, method: n2 = "POST", headers: s2 = {}, timeout: r2 }) {
    return new Promise((i2, o2) => {
      ne.request({ url: e2, method: n2, data: "object" == typeof t2 ? JSON.stringify(t2) : t2, header: s2, dataType: "json", timeout: r2, complete: (e3 = {}) => {
        const t3 = s2["x-trace-id"] || "";
        if (!e3.statusCode || e3.statusCode >= 400) {
          const { message: n3, errMsg: s3, trace_id: r3 } = e3.data || {};
          return o2(new te({ code: "SYS_ERR", message: n3 || s3 || "request:fail", requestId: r3 || t3 }));
        }
        i2({ status: e3.statusCode, data: e3.data, headers: e3.header, requestId: t3 });
      } });
    });
  }
  function qt(e2, t2) {
    const { path: n2, data: s2, method: r2 = "GET" } = e2, { url: i2, headers: o2 } = Dt(n2, { functionName: "", data: s2, method: r2, headers: { "x-alipay-cloud-mode": "oss", "x-data-api-type": "oss", "x-expire-timestamp": String(Date.now() + 6e4) }, signHeaderKeys: ["x-data-api-type", "x-expire-timestamp"], config: t2 });
    return Mt({ url: i2, data: s2, method: r2, headers: o2 }).then((e3) => {
      const t3 = e3.data || {};
      if (!t3.success)
        throw new te({ code: e3.errCode, message: e3.errMsg, requestId: e3.requestId });
      return t3.data || {};
    }).catch((e3) => {
      throw new te({ code: e3.errCode, message: e3.errMsg, requestId: e3.requestId });
    });
  }
  function Ft(e2 = "") {
    const t2 = e2.trim().replace(/^cloud:\/\//, ""), n2 = t2.indexOf("/");
    if (n2 <= 0)
      throw new te({ code: "INVALID_PARAM", message: "fileID不合法" });
    const s2 = t2.substring(0, n2), r2 = t2.substring(n2 + 1);
    return s2 !== this.config.spaceId && console.warn("file ".concat(e2, " does not belong to env ").concat(this.config.spaceId)), r2;
  }
  function Kt(e2 = "") {
    return "cloud://".concat(this.config.spaceId, "/").concat(e2.replace(/^\/+/, ""));
  }
  class jt {
    constructor(e2) {
      this.config = e2;
    }
    signedURL(e2, t2 = {}) {
      const n2 = `/ws/function/${e2}`, s2 = this.config.wsEndpoint.replace(/^ws(s)?:\/\//, ""), r2 = Object.assign({}, t2, { accessKeyId: this.config.accessKey, signatureNonce: Ut(), timestamp: "" + Date.now() }), i2 = [n2, ["accessKeyId", "authorization", "signatureNonce", "timestamp"].sort().map(function(e3) {
        return r2[e3] ? "".concat(e3, "=").concat(r2[e3]) : null;
      }).filter(Boolean).join("&"), `host:${s2}`].join("\n"), o2 = ["HMAC-SHA256", we(i2).toString(Lt)].join("\n"), a2 = Ie(o2, this.config.secretKey).toString(Lt), c2 = Object.keys(r2).map((e3) => `${e3}=${encodeURIComponent(r2[e3])}`).join("&");
      return `${this.config.wsEndpoint}${n2}?${c2}&signature=${a2}`;
    }
  }
  var $t = class {
    constructor(e2) {
      if (["spaceId", "spaceAppId", "accessKey", "secretKey"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e2, t2))
          throw new Error(`${t2} required`);
      }), e2.endpoint) {
        if ("string" != typeof e2.endpoint)
          throw new Error("endpoint must be string");
        if (!/^https:\/\//.test(e2.endpoint))
          throw new Error("endpoint must start with https://");
        e2.endpoint = e2.endpoint.replace(/\/$/, "");
      }
      this.config = Object.assign({}, e2, { endpoint: e2.endpoint || `https://${e2.spaceId}.api-hz.cloudbasefunction.cn`, wsEndpoint: e2.wsEndpoint || `wss://${e2.spaceId}.api-hz.cloudbasefunction.cn` }), this._websocket = new jt(this.config);
    }
    callFunction(e2) {
      return function(e3, t2) {
        const { name: n2, data: s2, async: r2 = false, timeout: i2 } = e3, o2 = "POST", a2 = { "x-to-function-name": n2 };
        r2 && (a2["x-function-invoke-type"] = "async");
        const { url: c2, headers: u2 } = Dt("/functions/invokeFunction", { functionName: n2, data: s2, method: o2, headers: a2, signHeaderKeys: ["x-to-function-name"], config: t2 });
        return Mt({ url: c2, data: s2, method: o2, headers: u2, timeout: i2 }).then((e4) => {
          let t3 = 0;
          if (r2) {
            const n3 = e4.data || {};
            t3 = "200" === n3.errCode ? 0 : n3.errCode, e4.data = n3.data || {}, e4.errMsg = n3.errMsg;
          }
          if (0 !== t3)
            throw new te({ code: t3, message: e4.errMsg, requestId: e4.requestId });
          return { errCode: t3, success: 0 === t3, requestId: e4.requestId, result: e4.data };
        }).catch((e4) => {
          throw new te({ code: e4.errCode, message: e4.errMsg, requestId: e4.requestId });
        });
      }(e2, this.config);
    }
    uploadFileToOSS({ url: e2, filePath: t2, fileType: n2, formData: s2, onUploadProgress: r2 }) {
      return new Promise((i2, o2) => {
        const a2 = ne.uploadFile({ url: e2, filePath: t2, fileType: n2, formData: s2, name: "file", success(e3) {
          e3 && e3.statusCode < 400 ? i2(e3) : o2(new te({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e3) {
          o2(new te({ code: e3.code || "UPLOAD_FAILED", message: e3.message || e3.errMsg || "文件上传失败" }));
        } });
        "function" == typeof r2 && a2 && "function" == typeof a2.onProgressUpdate && a2.onProgressUpdate((e3) => {
          r2({ loaded: e3.totalBytesSent, total: e3.totalBytesExpectedToSend });
        });
      });
    }
    async uploadFile({ filePath: e2, cloudPath: t2 = "", fileType: n2 = "image", onUploadProgress: s2 }) {
      if ("string" !== g(t2))
        throw new te({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
      if (!(t2 = t2.trim()))
        throw new te({ code: "INVALID_PARAM", message: "cloudPath不可为空" });
      if (/:\/\//.test(t2))
        throw new te({ code: "INVALID_PARAM", message: "cloudPath不合法" });
      const r2 = await qt({ path: "/".concat(t2.replace(/^\//, ""), "?post_url") }, this.config), { file_id: i2, upload_url: o2, form_data: a2 } = r2, c2 = a2 && a2.reduce((e3, t3) => (e3[t3.key] = t3.value, e3), {});
      return this.uploadFileToOSS({ url: o2, filePath: e2, fileType: n2, formData: c2, onUploadProgress: s2 }).then(() => ({ fileID: i2 }));
    }
    async getTempFileURL({ fileList: e2 }) {
      return new Promise((t2, n2) => {
        (!e2 || e2.length < 0) && t2({ code: "INVALID_PARAM", message: "fileList不能为空数组" }), e2.length > 50 && t2({ code: "INVALID_PARAM", message: "fileList数组长度不能超过50" });
        const s2 = [];
        for (const n3 of e2) {
          let e3;
          "string" !== g(n3) && t2({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
          try {
            e3 = Ft.call(this, n3);
          } catch (t3) {
            console.warn(t3.errCode, t3.errMsg), e3 = n3;
          }
          s2.push({ file_id: e3, expire: 600 });
        }
        qt({ path: "/?download_url", data: { file_list: s2 }, method: "POST" }, this.config).then((e3) => {
          const { file_list: n3 = [] } = e3;
          t2({ fileList: n3.map((e4) => ({ fileID: Kt.call(this, e4.file_id), tempFileURL: e4.download_url })) });
        }).catch((e3) => n2(e3));
      });
    }
    async connectWebSocket(e2) {
      const { name: t2, query: n2 } = e2;
      return ne.connectSocket({ url: this._websocket.signedURL(t2, n2), complete: () => {
      } });
    }
  };
  var Bt = { init: (e2) => {
    e2.provider = "alipay";
    const t2 = new $t(e2);
    return t2.auth = function() {
      return { signInAnonymously: function() {
        return Promise.resolve();
      }, getLoginState: function() {
        return Promise.resolve(true);
      } };
    }, t2;
  } };
  function Wt({ data: e2 }) {
    let t2;
    t2 = le();
    const n2 = JSON.parse(JSON.stringify(e2 || {}));
    if (Object.assign(n2, { clientInfo: t2 }), !n2.uniIdToken) {
      const { token: e3 } = re();
      e3 && (n2.uniIdToken = e3);
    }
    return n2;
  }
  async function Ht(e2 = {}) {
    await this.__dev__.initLocalNetwork();
    const { localAddress: t2, localPort: n2 } = this.__dev__, s2 = { aliyun: "aliyun", tencent: "tcb", alipay: "alipay", dcloud: "dcloud" }[this.config.provider], r2 = this.config.spaceId, i2 = `http://${t2}:${n2}/system/check-function`, o2 = `http://${t2}:${n2}/cloudfunctions/${e2.name}`;
    return new Promise((t3, n3) => {
      ne.request({ method: "POST", url: i2, data: { name: e2.name, platform: P, provider: s2, spaceId: r2 }, timeout: 3e3, success(e3) {
        t3(e3);
      }, fail() {
        t3({ data: { code: "NETWORK_ERROR", message: "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下，自动切换为已部署的云函数。" } });
      } });
    }).then(({ data: e3 } = {}) => {
      const { code: t3, message: n3 } = e3 || {};
      return { code: 0 === t3 ? 0 : t3 || "SYS_ERR", message: n3 || "SYS_ERR" };
    }).then(({ code: t3, message: n3 }) => {
      if (0 !== t3) {
        switch (t3) {
          case "MODULE_ENCRYPTED":
            console.error(`此云函数（${e2.name}）依赖加密公共模块不可本地调试，自动切换为云端已部署的云函数`);
            break;
          case "FUNCTION_ENCRYPTED":
            console.error(`此云函数（${e2.name}）已加密不可本地调试，自动切换为云端已部署的云函数`);
            break;
          case "ACTION_ENCRYPTED":
            console.error(n3 || "需要访问加密的uni-clientDB-action，自动切换为云端环境");
            break;
          case "NETWORK_ERROR":
            console.error(n3 || "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下");
            break;
          case "SWITCH_TO_CLOUD":
            break;
          default: {
            const e3 = `检测本地调试服务出现错误：${n3}，请检查网络环境或重启客户端再试`;
            throw console.error(e3), new Error(e3);
          }
        }
        return this._callCloudFunction(e2);
      }
      return new Promise((t4, n4) => {
        const r3 = Wt.call(this, { data: e2.data });
        ne.request({ method: "POST", url: o2, data: { provider: s2, platform: P, param: r3 }, timeout: e2.timeout, success: ({ statusCode: e3, data: s3 } = {}) => !e3 || e3 >= 400 ? n4(new te({ code: s3.code || "SYS_ERR", message: s3.message || "request:fail" })) : t4({ result: s3 }), fail(e3) {
          n4(new te({ code: e3.code || e3.errCode || "SYS_ERR", message: e3.message || e3.errMsg || "request:fail" }));
        } });
      });
    });
  }
  const Jt = [{ rule: /fc_function_not_found|FUNCTION_NOT_FOUND/, content: "，云函数[{functionName}]在云端不存在，请检查此云函数名称是否正确以及该云函数是否已上传到服务空间", mode: "append" }];
  var zt = /[\\^$.*+?()[\]{}|]/g, Vt = RegExp(zt.source);
  function Gt(e2, t2, n2) {
    return e2.replace(new RegExp((s2 = t2) && Vt.test(s2) ? s2.replace(zt, "\\$&") : s2, "g"), n2);
    var s2;
  }
  const Yt = { NONE: "none", REQUEST: "request", RESPONSE: "response", BOTH: "both" }, Qt = "_globalUniCloudStatus", Xt = "_globalUniCloudSecureNetworkCache__{spaceId}", Zt = "uni-secure-network", en = { SYSTEM_ERROR: { code: 2e4, message: "System error" }, APP_INFO_INVALID: { code: 20101, message: "Invalid client" }, GET_ENCRYPT_KEY_FAILED: { code: 20102, message: "Get encrypt key failed" } };
  function nn(e2) {
    const { errSubject: t2, subject: n2, errCode: s2, errMsg: r2, code: i2, message: o2, cause: a2 } = e2 || {};
    return new te({ subject: t2 || n2 || Zt, code: s2 || i2 || en.SYSTEM_ERROR.code, message: r2 || o2, cause: a2 });
  }
  let Kn;
  function Hn({ secretType: e2 } = {}) {
    return e2 === Yt.REQUEST || e2 === Yt.RESPONSE || e2 === Yt.BOTH;
  }
  function Jn({ name: e2, data: t2 = {} } = {}) {
    return "DCloud-clientDB" === e2 && "encryption" === t2.redirectTo && "getAppClientKey" === t2.action;
  }
  function zn({ provider: e2, spaceId: t2, functionName: n2 } = {}) {
    const { appId: s2, uniPlatform: r2, osName: i2 } = ce();
    let o2 = r2;
    "app" === r2 && (o2 = i2);
    const a2 = function({ provider: e3, spaceId: t3 } = {}) {
      const n3 = A;
      if (!n3)
        return {};
      e3 = /* @__PURE__ */ function(e4) {
        return "tencent" === e4 ? "tcb" : e4;
      }(e3);
      const s3 = n3.find((n4) => n4.provider === e3 && n4.spaceId === t3);
      return s3 && s3.config;
    }({ provider: e2, spaceId: t2 });
    if (!a2 || !a2.accessControl || !a2.accessControl.enable)
      return false;
    const c2 = a2.accessControl.function || {}, u2 = Object.keys(c2);
    if (0 === u2.length)
      return true;
    const h2 = function(e3, t3) {
      let n3, s3, r3;
      for (let i3 = 0; i3 < e3.length; i3++) {
        const o3 = e3[i3];
        o3 !== t3 ? "*" !== o3 ? o3.split(",").map((e4) => e4.trim()).indexOf(t3) > -1 && (s3 = o3) : r3 = o3 : n3 = o3;
      }
      return n3 || s3 || r3;
    }(u2, n2);
    if (!h2)
      return false;
    if ((c2[h2] || []).find((e3 = {}) => e3.appId === s2 && (e3.platform || "").toLowerCase() === o2.toLowerCase()))
      return true;
    throw console.error(`此应用[appId: ${s2}, platform: ${o2}]不在云端配置的允许访问的应用列表内，参考：https://uniapp.dcloud.net.cn/uniCloud/secure-network.html#verify-client`), nn(en.APP_INFO_INVALID);
  }
  function Vn({ functionName: e2, result: t2, logPvd: n2 }) {
    if (this.__dev__.debugLog && t2 && t2.requestId) {
      const s2 = JSON.stringify({ spaceId: this.config.spaceId, functionName: e2, requestId: t2.requestId });
      console.log(`[${n2}-request]${s2}[/${n2}-request]`);
    }
  }
  function Gn(e2) {
    const t2 = e2.callFunction, n2 = function(n3) {
      const s2 = n3.name;
      n3.data = Wt.call(e2, { data: n3.data });
      const r2 = { aliyun: "aliyun", tencent: "tcb", tcb: "tcb", alipay: "alipay", dcloud: "dcloud" }[this.config.provider], i2 = Hn(n3), o2 = Jn(n3), a2 = i2 || o2;
      return t2.call(this, n3).then((e3) => (e3.errCode = 0, !a2 && Vn.call(this, { functionName: s2, result: e3, logPvd: r2 }), Promise.resolve(e3)), (e3) => (!a2 && Vn.call(this, { functionName: s2, result: e3, logPvd: r2 }), e3 && e3.message && (e3.message = function({ message: e4 = "", extraInfo: t3 = {}, formatter: n4 = [] } = {}) {
        for (let s3 = 0; s3 < n4.length; s3++) {
          const { rule: r3, content: i3, mode: o3 } = n4[s3], a3 = e4.match(r3);
          if (!a3)
            continue;
          let c2 = i3;
          for (let e5 = 1; e5 < a3.length; e5++)
            c2 = Gt(c2, `{$${e5}}`, a3[e5]);
          for (const e5 in t3)
            c2 = Gt(c2, `{${e5}}`, t3[e5]);
          return "replace" === o3 ? c2 : e4 + c2;
        }
        return e4;
      }({ message: `[${n3.name}]: ${e3.message}`, formatter: Jt, extraInfo: { functionName: s2 } })), Promise.reject(e3)));
    };
    e2.callFunction = function(t3) {
      const { provider: s2, spaceId: r2 } = e2.config, i2 = t3.name;
      let o2, a2;
      if (t3.data = t3.data || {}, e2.__dev__.debugInfo && !e2.__dev__.debugInfo.forceRemote && O ? (e2._callCloudFunction || (e2._callCloudFunction = n2, e2._callLocalFunction = Ht), o2 = Ht) : o2 = n2, o2 = o2.bind(e2), Jn(t3))
        a2 = n2.call(e2, t3);
      else if (Hn(t3)) {
        a2 = new Kn({ secretType: t3.secretType, uniCloudIns: e2 }).wrapEncryptDataCallFunction(n2.bind(e2))(t3);
      } else if (zn({ provider: s2, spaceId: r2, functionName: i2 })) {
        a2 = new Kn({ secretType: t3.secretType, uniCloudIns: e2 }).wrapVerifyClientCallFunction(n2.bind(e2))(t3);
      } else
        a2 = o2(t3);
      return Object.defineProperty(a2, "result", { get: () => (console.warn("当前返回结果为Promise类型，不可直接访问其result属性，详情请参考：https://uniapp.dcloud.net.cn/uniCloud/faq?id=promise"), {}) }), a2.then((e3) => e3);
    };
  }
  Kn = class {
    constructor() {
      throw nn({ message: `Platform ${P} is not enabled, please check whether secure network module is enabled in your manifest.json` });
    }
  };
  const Yn = Symbol("CLIENT_DB_INTERNAL");
  function Qn(e2, t2) {
    return e2.then = "DoNotReturnProxyWithAFunctionNamedThen", e2._internalType = Yn, e2.inspect = null, e2.__v_raw = void 0, new Proxy(e2, { get(e3, n2, s2) {
      if ("_uniClient" === n2)
        return null;
      if ("symbol" == typeof n2)
        return e3[n2];
      if (n2 in e3 || "string" != typeof n2) {
        const t3 = e3[n2];
        return "function" == typeof t3 ? t3.bind(e3) : t3;
      }
      return t2.get(e3, n2, s2);
    } });
  }
  function Xn(e2) {
    return { on: (t2, n2) => {
      e2[t2] = e2[t2] || [], e2[t2].indexOf(n2) > -1 || e2[t2].push(n2);
    }, off: (t2, n2) => {
      e2[t2] = e2[t2] || [];
      const s2 = e2[t2].indexOf(n2);
      -1 !== s2 && e2[t2].splice(s2, 1);
    } };
  }
  const Zn = ["db.Geo", "db.command", "command.aggregate"];
  function es(e2, t2) {
    return Zn.indexOf(`${e2}.${t2}`) > -1;
  }
  function ts(e2) {
    switch (g(e2 = se(e2))) {
      case "array":
        return e2.map((e3) => ts(e3));
      case "object":
        return e2._internalType === Yn || Object.keys(e2).forEach((t2) => {
          e2[t2] = ts(e2[t2]);
        }), e2;
      case "regexp":
        return { $regexp: { source: e2.source, flags: e2.flags } };
      case "date":
        return { $date: e2.toISOString() };
      default:
        return e2;
    }
  }
  function ns(e2) {
    return e2 && e2.content && e2.content.$method;
  }
  class ss {
    constructor(e2, t2, n2) {
      this.content = e2, this.prevStage = t2 || null, this.udb = null, this._database = n2;
    }
    toJSON() {
      let e2 = this;
      const t2 = [e2.content];
      for (; e2.prevStage; )
        e2 = e2.prevStage, t2.push(e2.content);
      return { $db: t2.reverse().map((e3) => ({ $method: e3.$method, $param: ts(e3.$param) })) };
    }
    toString() {
      return JSON.stringify(this.toJSON());
    }
    getAction() {
      const e2 = this.toJSON().$db.find((e3) => "action" === e3.$method);
      return e2 && e2.$param && e2.$param[0];
    }
    getCommand() {
      return { $db: this.toJSON().$db.filter((e2) => "action" !== e2.$method) };
    }
    get isAggregate() {
      let e2 = this;
      for (; e2; ) {
        const t2 = ns(e2), n2 = ns(e2.prevStage);
        if ("aggregate" === t2 && "collection" === n2 || "pipeline" === t2)
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    get isCommand() {
      let e2 = this;
      for (; e2; ) {
        if ("command" === ns(e2))
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    get isAggregateCommand() {
      let e2 = this;
      for (; e2; ) {
        const t2 = ns(e2), n2 = ns(e2.prevStage);
        if ("aggregate" === t2 && "command" === n2)
          return true;
        e2 = e2.prevStage;
      }
      return false;
    }
    getNextStageFn(e2) {
      const t2 = this;
      return function() {
        return rs({ $method: e2, $param: ts(Array.from(arguments)) }, t2, t2._database);
      };
    }
    get count() {
      return this.isAggregate ? this.getNextStageFn("count") : function() {
        return this._send("count", Array.from(arguments));
      };
    }
    get remove() {
      return this.isCommand ? this.getNextStageFn("remove") : function() {
        return this._send("remove", Array.from(arguments));
      };
    }
    get() {
      return this._send("get", Array.from(arguments));
    }
    get add() {
      return this.isCommand ? this.getNextStageFn("add") : function() {
        return this._send("add", Array.from(arguments));
      };
    }
    update() {
      return this._send("update", Array.from(arguments));
    }
    end() {
      return this._send("end", Array.from(arguments));
    }
    get set() {
      return this.isCommand ? this.getNextStageFn("set") : function() {
        throw new Error("JQL禁止使用set方法");
      };
    }
    _send(e2, t2) {
      const n2 = this.getAction(), s2 = this.getCommand();
      if (s2.$db.push({ $method: e2, $param: ts(t2) }), b) {
        const e3 = s2.$db.find((e4) => "collection" === e4.$method), t3 = e3 && e3.$param;
        t3 && 1 === t3.length && "string" == typeof e3.$param[0] && e3.$param[0].indexOf(",") > -1 && console.warn("检测到使用JQL语法联表查询时，未使用getTemp先过滤主表数据，在主表数据量大的情况下可能会查询缓慢。\n- 如何优化请参考此文档：https://uniapp.dcloud.net.cn/uniCloud/jql?id=lookup-with-temp \n- 如果主表数据量很小请忽略此信息，项目发行时不会出现此提示。");
      }
      return this._database._callCloudFunction({ action: n2, command: s2 });
    }
  }
  function rs(e2, t2, n2) {
    return Qn(new ss(e2, t2, n2), { get(e3, t3) {
      let s2 = "db";
      return e3 && e3.content && (s2 = e3.content.$method), es(s2, t3) ? rs({ $method: t3 }, e3, n2) : function() {
        return rs({ $method: t3, $param: ts(Array.from(arguments)) }, e3, n2);
      };
    } });
  }
  function is({ path: e2, method: t2 }) {
    return class {
      constructor() {
        this.param = Array.from(arguments);
      }
      toJSON() {
        return { $newDb: [...e2.map((e3) => ({ $method: e3 })), { $method: t2, $param: this.param }] };
      }
      toString() {
        return JSON.stringify(this.toJSON());
      }
    };
  }
  class os {
    constructor({ uniClient: e2 = {}, isJQL: t2 = false } = {}) {
      this._uniClient = e2, this._authCallBacks = {}, this._dbCallBacks = {}, e2._isDefault && (this._dbCallBacks = U("_globalUniCloudDatabaseCallback")), t2 || (this.auth = Xn(this._authCallBacks)), this._isJQL = t2, Object.assign(this, Xn(this._dbCallBacks)), this.env = Qn({}, { get: (e3, t3) => ({ $env: t3 }) }), this.Geo = Qn({}, { get: (e3, t3) => is({ path: ["Geo"], method: t3 }) }), this.serverDate = is({ path: [], method: "serverDate" }), this.RegExp = is({ path: [], method: "RegExp" });
    }
    getCloudEnv(e2) {
      if ("string" != typeof e2 || !e2.trim())
        throw new Error("getCloudEnv参数错误");
      return { $env: e2.replace("$cloudEnv_", "") };
    }
    _callback(e2, t2) {
      const n2 = this._dbCallBacks;
      n2[e2] && n2[e2].forEach((e3) => {
        e3(...t2);
      });
    }
    _callbackAuth(e2, t2) {
      const n2 = this._authCallBacks;
      n2[e2] && n2[e2].forEach((e3) => {
        e3(...t2);
      });
    }
    multiSend() {
      const e2 = Array.from(arguments), t2 = e2.map((e3) => {
        const t3 = e3.getAction(), n2 = e3.getCommand();
        if ("getTemp" !== n2.$db[n2.$db.length - 1].$method)
          throw new Error("multiSend只支持子命令内使用getTemp");
        return { action: t3, command: n2 };
      });
      return this._callCloudFunction({ multiCommand: t2, queryList: e2 });
    }
  }
  function as(e2, t2 = {}) {
    return Qn(new e2(t2), { get: (e3, t3) => es("db", t3) ? rs({ $method: t3 }, null, e3) : function() {
      return rs({ $method: t3, $param: ts(Array.from(arguments)) }, null, e3);
    } });
  }
  class cs extends os {
    _parseResult(e2) {
      return this._isJQL ? e2.result : e2;
    }
    _callCloudFunction({ action: e2, command: t2, multiCommand: n2, queryList: s2 }) {
      function r2(e3, t3) {
        if (n2 && s2)
          for (let n3 = 0; n3 < s2.length; n3++) {
            const r3 = s2[n3];
            r3.udb && "function" == typeof r3.udb.setResult && (t3 ? r3.udb.setResult(t3) : r3.udb.setResult(e3.result.dataList[n3]));
          }
      }
      const i2 = this, o2 = this._isJQL ? "databaseForJQL" : "database";
      function a2(e3) {
        return i2._callback("error", [e3]), j($(o2, "fail"), e3).then(() => j($(o2, "complete"), e3)).then(() => (r2(null, e3), Y(H.RESPONSE, { type: J.CLIENT_DB, content: e3 }), Promise.reject(e3)));
      }
      const c2 = j($(o2, "invoke")), u2 = this._uniClient;
      return c2.then(() => u2.callFunction({ name: "DCloud-clientDB", type: l.CLIENT_DB, data: { action: e2, command: t2, multiCommand: n2 } })).then((e3) => {
        const { code: t3, message: n3, token: s3, tokenExpired: c3, systemInfo: u3 = [] } = e3.result;
        if (u3)
          for (let e4 = 0; e4 < u3.length; e4++) {
            const { level: t4, message: n4, detail: s4 } = u3[e4];
            let r3 = "[System Info]" + n4;
            s4 && (r3 = `${r3}
详细信息：${s4}`), (console["warn" === t4 ? "error" : t4] || console.log)(r3);
          }
        if (t3) {
          return a2(new te({ code: t3, message: n3, requestId: e3.requestId }));
        }
        e3.result.errCode = e3.result.errCode || e3.result.code, e3.result.errMsg = e3.result.errMsg || e3.result.message, s3 && c3 && (ie({ token: s3, tokenExpired: c3 }), this._callbackAuth("refreshToken", [{ token: s3, tokenExpired: c3 }]), this._callback("refreshToken", [{ token: s3, tokenExpired: c3 }]), Y(H.REFRESH_TOKEN, { token: s3, tokenExpired: c3 }));
        const h2 = [{ prop: "affectedDocs", tips: "affectedDocs不再推荐使用，请使用inserted/deleted/updated/data.length替代" }, { prop: "code", tips: "code不再推荐使用，请使用errCode替代" }, { prop: "message", tips: "message不再推荐使用，请使用errMsg替代" }];
        for (let t4 = 0; t4 < h2.length; t4++) {
          const { prop: n4, tips: s4 } = h2[t4];
          if (n4 in e3.result) {
            const t5 = e3.result[n4];
            Object.defineProperty(e3.result, n4, { get: () => (console.warn(s4), t5) });
          }
        }
        return function(e4) {
          return j($(o2, "success"), e4).then(() => j($(o2, "complete"), e4)).then(() => {
            r2(e4, null);
            const t4 = i2._parseResult(e4);
            return Y(H.RESPONSE, { type: J.CLIENT_DB, content: t4 }), Promise.resolve(t4);
          });
        }(e3);
      }, (e3) => {
        /fc_function_not_found|FUNCTION_NOT_FOUND/g.test(e3.message) && console.warn("clientDB未初始化，请在web控制台保存一次schema以开启clientDB");
        return a2(new te({ code: e3.code || "SYSTEM_ERROR", message: e3.message, requestId: e3.requestId }));
      });
    }
  }
  const us = "token无效，跳转登录页面", hs = "token过期，跳转登录页面", ls = { TOKEN_INVALID_TOKEN_EXPIRED: hs, TOKEN_INVALID_INVALID_CLIENTID: us, TOKEN_INVALID: us, TOKEN_INVALID_WRONG_TOKEN: us, TOKEN_INVALID_ANONYMOUS_USER: us }, ds = { "uni-id-token-expired": hs, "uni-id-check-token-failed": us, "uni-id-token-not-exist": us, "uni-id-check-device-feature-failed": us }, ps = { ...ls, ...ds, default: "用户未登录或登录状态过期，自动跳转登录页面" };
  function fs(e2, t2) {
    let n2 = "";
    return n2 = e2 ? `${e2}/${t2}` : t2, n2.replace(/^\//, "");
  }
  function gs(e2 = [], t2 = "") {
    const n2 = [], s2 = [];
    return e2.forEach((e3) => {
      true === e3.needLogin ? n2.push(fs(t2, e3.path)) : false === e3.needLogin && s2.push(fs(t2, e3.path));
    }), { needLoginPage: n2, notNeedLoginPage: s2 };
  }
  function ms(e2) {
    return e2.split("?")[0].replace(/^\//, "");
  }
  function ys() {
    return function(e2) {
      let t2 = e2 && e2.$page && e2.$page.fullPath;
      return t2 ? ("/" !== t2.charAt(0) && (t2 = "/" + t2), t2) : "";
    }(function() {
      const e2 = getCurrentPages();
      return e2[e2.length - 1];
    }());
  }
  function _s() {
    return ms(ys());
  }
  function ws(e2 = "", t2 = {}) {
    if (!e2)
      return false;
    if (!(t2 && t2.list && t2.list.length))
      return false;
    const n2 = t2.list, s2 = ms(e2);
    return n2.some((e3) => e3.pagePath === s2);
  }
  const Is = !!e.uniIdRouter;
  const { loginPage: vs, routerNeedLogin: Ss, resToLogin: Ts, needLoginPage: bs, notNeedLoginPage: Es, loginPageInTabBar: ks } = function({ pages: t2 = [], subPackages: n2 = [], uniIdRouter: s2 = {}, tabBar: r2 = {} } = e) {
    const { loginPage: i2, needLogin: o2 = [], resToLogin: a2 = true } = s2, { needLoginPage: c2, notNeedLoginPage: u2 } = gs(t2), { needLoginPage: h2, notNeedLoginPage: l2 } = function(e2 = []) {
      const t3 = [], n3 = [];
      return e2.forEach((e3) => {
        const { root: s3, pages: r3 = [] } = e3, { needLoginPage: i3, notNeedLoginPage: o3 } = gs(r3, s3);
        t3.push(...i3), n3.push(...o3);
      }), { needLoginPage: t3, notNeedLoginPage: n3 };
    }(n2);
    return { loginPage: i2, routerNeedLogin: o2, resToLogin: a2, needLoginPage: [...c2, ...h2], notNeedLoginPage: [...u2, ...l2], loginPageInTabBar: ws(i2, r2) };
  }();
  if (bs.indexOf(vs) > -1)
    throw new Error(`Login page [${vs}] should not be "needLogin", please check your pages.json`);
  function As(e2) {
    const t2 = _s();
    if ("/" === e2.charAt(0))
      return e2;
    const [n2, s2] = e2.split("?"), r2 = n2.replace(/^\//, "").split("/"), i2 = t2.split("/");
    i2.pop();
    for (let e3 = 0; e3 < r2.length; e3++) {
      const t3 = r2[e3];
      ".." === t3 ? i2.pop() : "." !== t3 && i2.push(t3);
    }
    return "" === i2[0] && i2.shift(), "/" + i2.join("/") + (s2 ? "?" + s2 : "");
  }
  function Ps(e2) {
    const t2 = ms(As(e2));
    return !(Es.indexOf(t2) > -1) && (bs.indexOf(t2) > -1 || Ss.some((t3) => function(e3, t4) {
      return new RegExp(t4).test(e3);
    }(e2, t3)));
  }
  function Cs({ redirect: e2 }) {
    const t2 = ms(e2), n2 = ms(vs);
    return _s() !== n2 && t2 !== n2;
  }
  function Os({ api: e2, redirect: t2 } = {}) {
    if (!t2 || !Cs({ redirect: t2 }))
      return;
    const n2 = function(e3, t3) {
      return "/" !== e3.charAt(0) && (e3 = "/" + e3), t3 ? e3.indexOf("?") > -1 ? e3 + `&uniIdRedirectUrl=${encodeURIComponent(t3)}` : e3 + `?uniIdRedirectUrl=${encodeURIComponent(t3)}` : e3;
    }(vs, t2);
    ks ? "navigateTo" !== e2 && "redirectTo" !== e2 || (e2 = "switchTab") : "switchTab" === e2 && (e2 = "navigateTo");
    const s2 = { navigateTo: uni.navigateTo, redirectTo: uni.redirectTo, switchTab: uni.switchTab, reLaunch: uni.reLaunch };
    setTimeout(() => {
      s2[e2]({ url: n2 });
    }, 0);
  }
  function xs({ url: e2 } = {}) {
    const t2 = { abortLoginPageJump: false, autoToLoginPage: false }, n2 = function() {
      const { token: e3, tokenExpired: t3 } = re();
      let n3;
      if (e3) {
        if (t3 < Date.now()) {
          const e4 = "uni-id-token-expired";
          n3 = { errCode: e4, errMsg: ps[e4] };
        }
      } else {
        const e4 = "uni-id-check-token-failed";
        n3 = { errCode: e4, errMsg: ps[e4] };
      }
      return n3;
    }();
    if (Ps(e2) && n2) {
      n2.uniIdRedirectUrl = e2;
      if (z(H.NEED_LOGIN).length > 0)
        return setTimeout(() => {
          Y(H.NEED_LOGIN, n2);
        }, 0), t2.abortLoginPageJump = true, t2;
      t2.autoToLoginPage = true;
    }
    return t2;
  }
  function Ns() {
    !function() {
      const e3 = ys(), { abortLoginPageJump: t2, autoToLoginPage: n2 } = xs({ url: e3 });
      t2 || n2 && Os({ api: "redirectTo", redirect: e3 });
    }();
    const e2 = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];
    for (let t2 = 0; t2 < e2.length; t2++) {
      const n2 = e2[t2];
      uni.addInterceptor(n2, { invoke(e3) {
        const { abortLoginPageJump: t3, autoToLoginPage: s2 } = xs({ url: e3.url });
        return t3 ? e3 : s2 ? (Os({ api: n2, redirect: As(e3.url) }), false) : e3;
      } });
    }
  }
  function Rs() {
    this.onResponse((e2) => {
      const { type: t2, content: n2 } = e2;
      let s2 = false;
      switch (t2) {
        case "cloudobject":
          s2 = function(e3) {
            if ("object" != typeof e3)
              return false;
            const { errCode: t3 } = e3 || {};
            return t3 in ps;
          }(n2);
          break;
        case "clientdb":
          s2 = function(e3) {
            if ("object" != typeof e3)
              return false;
            const { errCode: t3 } = e3 || {};
            return t3 in ls;
          }(n2);
      }
      s2 && function(e3 = {}) {
        const t3 = z(H.NEED_LOGIN);
        Z().then(() => {
          const n3 = ys();
          if (n3 && Cs({ redirect: n3 }))
            return t3.length > 0 ? Y(H.NEED_LOGIN, Object.assign({ uniIdRedirectUrl: n3 }, e3)) : void (vs && Os({ api: "navigateTo", redirect: n3 }));
        });
      }(n2);
    });
  }
  function Ls(e2) {
    !function(e3) {
      e3.onResponse = function(e4) {
        V(H.RESPONSE, e4);
      }, e3.offResponse = function(e4) {
        G(H.RESPONSE, e4);
      };
    }(e2), function(e3) {
      e3.onNeedLogin = function(e4) {
        V(H.NEED_LOGIN, e4);
      }, e3.offNeedLogin = function(e4) {
        G(H.NEED_LOGIN, e4);
      }, Is && (U(Qt).needLoginInit || (U(Qt).needLoginInit = true, Z().then(() => {
        Ns.call(e3);
      }), Ts && Rs.call(e3)));
    }(e2), function(e3) {
      e3.onRefreshToken = function(e4) {
        V(H.REFRESH_TOKEN, e4);
      }, e3.offRefreshToken = function(e4) {
        G(H.REFRESH_TOKEN, e4);
      };
    }(e2);
  }
  let Us;
  const Ds = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", Ms = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/;
  function qs() {
    const e2 = re().token || "", t2 = e2.split(".");
    if (!e2 || 3 !== t2.length)
      return { uid: null, role: [], permission: [], tokenExpired: 0 };
    let n2;
    try {
      n2 = JSON.parse((s2 = t2[1], decodeURIComponent(Us(s2).split("").map(function(e3) {
        return "%" + ("00" + e3.charCodeAt(0).toString(16)).slice(-2);
      }).join(""))));
    } catch (e3) {
      throw new Error("获取当前用户信息出错，详细错误信息为：" + e3.message);
    }
    var s2;
    return n2.tokenExpired = 1e3 * n2.exp, delete n2.exp, delete n2.iat, n2;
  }
  Us = "function" != typeof atob ? function(e2) {
    if (e2 = String(e2).replace(/[\t\n\f\r ]+/g, ""), !Ms.test(e2))
      throw new Error("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
    var t2;
    e2 += "==".slice(2 - (3 & e2.length));
    for (var n2, s2, r2 = "", i2 = 0; i2 < e2.length; )
      t2 = Ds.indexOf(e2.charAt(i2++)) << 18 | Ds.indexOf(e2.charAt(i2++)) << 12 | (n2 = Ds.indexOf(e2.charAt(i2++))) << 6 | (s2 = Ds.indexOf(e2.charAt(i2++))), r2 += 64 === n2 ? String.fromCharCode(t2 >> 16 & 255) : 64 === s2 ? String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255) : String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255, 255 & t2);
    return r2;
  } : atob;
  var Fs = n(function(e2, t2) {
    Object.defineProperty(t2, "__esModule", { value: true });
    const n2 = "chooseAndUploadFile:ok", s2 = "chooseAndUploadFile:fail";
    function r2(e3, t3) {
      return e3.tempFiles.forEach((e4, n3) => {
        e4.name || (e4.name = e4.path.substring(e4.path.lastIndexOf("/") + 1)), t3 && (e4.fileType = t3), e4.cloudPath = Date.now() + "_" + n3 + e4.name.substring(e4.name.lastIndexOf("."));
      }), e3.tempFilePaths || (e3.tempFilePaths = e3.tempFiles.map((e4) => e4.path)), e3;
    }
    function i2(e3, t3, { onChooseFile: s3, onUploadProgress: r3 }) {
      return t3.then((e4) => {
        if (s3) {
          const t4 = s3(e4);
          if (void 0 !== t4)
            return Promise.resolve(t4).then((t5) => void 0 === t5 ? e4 : t5);
        }
        return e4;
      }).then((t4) => false === t4 ? { errMsg: n2, tempFilePaths: [], tempFiles: [] } : function(e4, t5, s4 = 5, r4) {
        (t5 = Object.assign({}, t5)).errMsg = n2;
        const i3 = t5.tempFiles, o2 = i3.length;
        let a2 = 0;
        return new Promise((n3) => {
          for (; a2 < s4; )
            c2();
          function c2() {
            const s5 = a2++;
            if (s5 >= o2)
              return void (!i3.find((e5) => !e5.url && !e5.errMsg) && n3(t5));
            const u2 = i3[s5];
            e4.uploadFile({ provider: u2.provider, filePath: u2.path, cloudPath: u2.cloudPath, fileType: u2.fileType, cloudPathAsRealPath: u2.cloudPathAsRealPath, onUploadProgress(e5) {
              e5.index = s5, e5.tempFile = u2, e5.tempFilePath = u2.path, r4 && r4(e5);
            } }).then((e5) => {
              u2.url = e5.fileID, s5 < o2 && c2();
            }).catch((e5) => {
              u2.errMsg = e5.errMsg || e5.message, s5 < o2 && c2();
            });
          }
        });
      }(e3, t4, 5, r3));
    }
    t2.initChooseAndUploadFile = function(e3) {
      return function(t3 = { type: "all" }) {
        return "image" === t3.type ? i2(e3, function(e4) {
          const { count: t4, sizeType: n3, sourceType: i3 = ["album", "camera"], extension: o2 } = e4;
          return new Promise((e5, a2) => {
            uni.chooseImage({ count: t4, sizeType: n3, sourceType: i3, extension: o2, success(t5) {
              e5(r2(t5, "image"));
            }, fail(e6) {
              a2({ errMsg: e6.errMsg.replace("chooseImage:fail", s2) });
            } });
          });
        }(t3), t3) : "video" === t3.type ? i2(e3, function(e4) {
          const { camera: t4, compressed: n3, maxDuration: i3, sourceType: o2 = ["album", "camera"], extension: a2 } = e4;
          return new Promise((e5, c2) => {
            uni.chooseVideo({ camera: t4, compressed: n3, maxDuration: i3, sourceType: o2, extension: a2, success(t5) {
              const { tempFilePath: n4, duration: s3, size: i4, height: o3, width: a3 } = t5;
              e5(r2({ errMsg: "chooseVideo:ok", tempFilePaths: [n4], tempFiles: [{ name: t5.tempFile && t5.tempFile.name || "", path: n4, size: i4, type: t5.tempFile && t5.tempFile.type || "", width: a3, height: o3, duration: s3, fileType: "video", cloudPath: "" }] }, "video"));
            }, fail(e6) {
              c2({ errMsg: e6.errMsg.replace("chooseVideo:fail", s2) });
            } });
          });
        }(t3), t3) : i2(e3, function(e4) {
          const { count: t4, extension: n3 } = e4;
          return new Promise((e5, i3) => {
            let o2 = uni.chooseFile;
            if ("undefined" != typeof wx && "function" == typeof wx.chooseMessageFile && (o2 = wx.chooseMessageFile), "function" != typeof o2)
              return i3({ errMsg: s2 + " 请指定 type 类型，该平台仅支持选择 image 或 video。" });
            o2({ type: "all", count: t4, extension: n3, success(t5) {
              e5(r2(t5));
            }, fail(e6) {
              i3({ errMsg: e6.errMsg.replace("chooseFile:fail", s2) });
            } });
          });
        }(t3), t3);
      };
    };
  }), Ks = t(Fs);
  const js = { auto: "auto", onready: "onready", manual: "manual" };
  function $s(e2) {
    return { props: { localdata: { type: Array, default: () => [] }, options: { type: [Object, Array], default: () => ({}) }, spaceInfo: { type: Object, default: () => ({}) }, collection: { type: [String, Array], default: "" }, action: { type: String, default: "" }, field: { type: String, default: "" }, orderby: { type: String, default: "" }, where: { type: [String, Object], default: "" }, pageData: { type: String, default: "add" }, pageCurrent: { type: Number, default: 1 }, pageSize: { type: Number, default: 20 }, getcount: { type: [Boolean, String], default: false }, gettree: { type: [Boolean, String], default: false }, gettreepath: { type: [Boolean, String], default: false }, startwith: { type: String, default: "" }, limitlevel: { type: Number, default: 10 }, groupby: { type: String, default: "" }, groupField: { type: String, default: "" }, distinct: { type: [Boolean, String], default: false }, foreignKey: { type: String, default: "" }, loadtime: { type: String, default: "auto" }, manual: { type: Boolean, default: false } }, data: () => ({ mixinDatacomLoading: false, mixinDatacomHasMore: false, mixinDatacomResData: [], mixinDatacomErrorMessage: "", mixinDatacomPage: {}, mixinDatacomError: null }), created() {
      this.mixinDatacomPage = { current: this.pageCurrent, size: this.pageSize, count: 0 }, this.$watch(() => {
        var e3 = [];
        return ["pageCurrent", "pageSize", "localdata", "collection", "action", "field", "orderby", "where", "getont", "getcount", "gettree", "groupby", "groupField", "distinct"].forEach((t2) => {
          e3.push(this[t2]);
        }), e3;
      }, (e3, t2) => {
        if (this.loadtime === js.manual)
          return;
        let n2 = false;
        const s2 = [];
        for (let r2 = 2; r2 < e3.length; r2++)
          e3[r2] !== t2[r2] && (s2.push(e3[r2]), n2 = true);
        e3[0] !== t2[0] && (this.mixinDatacomPage.current = this.pageCurrent), this.mixinDatacomPage.size = this.pageSize, this.onMixinDatacomPropsChange(n2, s2);
      });
    }, methods: { onMixinDatacomPropsChange(e3, t2) {
    }, mixinDatacomEasyGet({ getone: e3 = false, success: t2, fail: n2 } = {}) {
      this.mixinDatacomLoading || (this.mixinDatacomLoading = true, this.mixinDatacomErrorMessage = "", this.mixinDatacomError = null, this.mixinDatacomGet().then((n3) => {
        this.mixinDatacomLoading = false;
        const { data: s2, count: r2 } = n3.result;
        this.getcount && (this.mixinDatacomPage.count = r2), this.mixinDatacomHasMore = s2.length < this.pageSize;
        const i2 = e3 ? s2.length ? s2[0] : void 0 : s2;
        this.mixinDatacomResData = i2, t2 && t2(i2);
      }).catch((e4) => {
        this.mixinDatacomLoading = false, this.mixinDatacomErrorMessage = e4, this.mixinDatacomError = e4, n2 && n2(e4);
      }));
    }, mixinDatacomGet(t2 = {}) {
      let n2;
      t2 = t2 || {}, n2 = "undefined" != typeof __uniX && __uniX ? e2.databaseForJQL(this.spaceInfo) : e2.database(this.spaceInfo);
      const s2 = t2.action || this.action;
      s2 && (n2 = n2.action(s2));
      const r2 = t2.collection || this.collection;
      n2 = Array.isArray(r2) ? n2.collection(...r2) : n2.collection(r2);
      const i2 = t2.where || this.where;
      i2 && Object.keys(i2).length && (n2 = n2.where(i2));
      const o2 = t2.field || this.field;
      o2 && (n2 = n2.field(o2));
      const a2 = t2.foreignKey || this.foreignKey;
      a2 && (n2 = n2.foreignKey(a2));
      const c2 = t2.groupby || this.groupby;
      c2 && (n2 = n2.groupBy(c2));
      const u2 = t2.groupField || this.groupField;
      u2 && (n2 = n2.groupField(u2));
      true === (void 0 !== t2.distinct ? t2.distinct : this.distinct) && (n2 = n2.distinct());
      const h2 = t2.orderby || this.orderby;
      h2 && (n2 = n2.orderBy(h2));
      const l2 = void 0 !== t2.pageCurrent ? t2.pageCurrent : this.mixinDatacomPage.current, d2 = void 0 !== t2.pageSize ? t2.pageSize : this.mixinDatacomPage.size, p2 = void 0 !== t2.getcount ? t2.getcount : this.getcount, f2 = void 0 !== t2.gettree ? t2.gettree : this.gettree, g2 = void 0 !== t2.gettreepath ? t2.gettreepath : this.gettreepath, m2 = { getCount: p2 }, y2 = { limitLevel: void 0 !== t2.limitlevel ? t2.limitlevel : this.limitlevel, startWith: void 0 !== t2.startwith ? t2.startwith : this.startwith };
      return f2 && (m2.getTree = y2), g2 && (m2.getTreePath = y2), n2 = n2.skip(d2 * (l2 - 1)).limit(d2).get(m2), n2;
    } } };
  }
  function Bs(e2) {
    return function(t2, n2 = {}) {
      n2 = function(e3, t3 = {}) {
        return e3.customUI = t3.customUI || e3.customUI, e3.parseSystemError = t3.parseSystemError || e3.parseSystemError, Object.assign(e3.loadingOptions, t3.loadingOptions), Object.assign(e3.errorOptions, t3.errorOptions), "object" == typeof t3.secretMethods && (e3.secretMethods = t3.secretMethods), e3;
      }({ customUI: false, loadingOptions: { title: "加载中...", mask: true }, errorOptions: { type: "modal", retry: false } }, n2);
      const { customUI: s2, loadingOptions: r2, errorOptions: i2, parseSystemError: o2 } = n2, a2 = !s2;
      return new Proxy({}, { get(s3, c2) {
        switch (c2) {
          case "toString":
            return "[object UniCloudObject]";
          case "toJSON":
            return {};
        }
        return function({ fn: e3, interceptorName: t3, getCallbackArgs: n3 } = {}) {
          return async function(...s4) {
            const r3 = n3 ? n3({ params: s4 }) : {};
            let i3, o3;
            try {
              return await j($(t3, "invoke"), { ...r3 }), i3 = await e3(...s4), await j($(t3, "success"), { ...r3, result: i3 }), i3;
            } catch (e4) {
              throw o3 = e4, await j($(t3, "fail"), { ...r3, error: o3 }), o3;
            } finally {
              await j($(t3, "complete"), o3 ? { ...r3, error: o3 } : { ...r3, result: i3 });
            }
          };
        }({ fn: async function s4(...u2) {
          let h2;
          a2 && uni.showLoading({ title: r2.title, mask: r2.mask });
          const d2 = { name: t2, type: l.OBJECT, data: { method: c2, params: u2 } };
          "object" == typeof n2.secretMethods && function(e3, t3) {
            const n3 = t3.data.method, s5 = e3.secretMethods || {}, r3 = s5[n3] || s5["*"];
            r3 && (t3.secretType = r3);
          }(n2, d2);
          let p2 = false;
          try {
            h2 = await e2.callFunction(d2);
          } catch (e3) {
            p2 = true, h2 = { result: new te(e3) };
          }
          const { errSubject: f2, errCode: g2, errMsg: m2, newToken: y2 } = h2.result || {};
          if (a2 && uni.hideLoading(), y2 && y2.token && y2.tokenExpired && (ie(y2), Y(H.REFRESH_TOKEN, { ...y2 })), g2) {
            let e3 = m2;
            if (p2 && o2) {
              e3 = (await o2({ objectName: t2, methodName: c2, params: u2, errSubject: f2, errCode: g2, errMsg: m2 })).errMsg || m2;
            }
            if (a2)
              if ("toast" === i2.type)
                uni.showToast({ title: e3, icon: "none" });
              else {
                if ("modal" !== i2.type)
                  throw new Error(`Invalid errorOptions.type: ${i2.type}`);
                {
                  const { confirm: t3 } = await async function({ title: e4, content: t4, showCancel: n4, cancelText: s5, confirmText: r3 } = {}) {
                    return new Promise((i3, o3) => {
                      uni.showModal({ title: e4, content: t4, showCancel: n4, cancelText: s5, confirmText: r3, success(e5) {
                        i3(e5);
                      }, fail() {
                        i3({ confirm: false, cancel: true });
                      } });
                    });
                  }({ title: "提示", content: e3, showCancel: i2.retry, cancelText: "取消", confirmText: i2.retry ? "重试" : "确定" });
                  if (i2.retry && t3)
                    return s4(...u2);
                }
              }
            const n3 = new te({ subject: f2, code: g2, message: m2, requestId: h2.requestId });
            throw n3.detail = h2.result, Y(H.RESPONSE, { type: J.CLOUD_OBJECT, content: n3 }), n3;
          }
          return Y(H.RESPONSE, { type: J.CLOUD_OBJECT, content: h2.result }), h2.result;
        }, interceptorName: "callObject", getCallbackArgs: function({ params: e3 } = {}) {
          return { objectName: t2, methodName: c2, params: e3 };
        } });
      } });
    };
  }
  function Ws(e2) {
    return U(Xt.replace("{spaceId}", e2.config.spaceId));
  }
  async function Hs({ openid: e2, callLoginByWeixin: t2 = false } = {}) {
    Ws(this);
    throw new Error(`[SecureNetwork] API \`initSecureNetworkByWeixin\` is not supported on platform \`${P}\``);
  }
  async function Js(e2) {
    const t2 = Ws(this);
    return t2.initPromise || (t2.initPromise = Hs.call(this, e2).then((e3) => e3).catch((e3) => {
      throw delete t2.initPromise, e3;
    })), t2.initPromise;
  }
  function zs(e2) {
    return function({ openid: t2, callLoginByWeixin: n2 = false } = {}) {
      return Js.call(e2, { openid: t2, callLoginByWeixin: n2 });
    };
  }
  function Vs(e2) {
    !function(e3) {
      he = e3;
    }(e2);
  }
  function Gs(e2) {
    const n2 = { getAppBaseInfo: uni.getSystemInfo, getPushClientId: uni.getPushClientId };
    return function(s2) {
      return new Promise((r2, i2) => {
        n2[e2]({ ...s2, success(e3) {
          r2(e3);
        }, fail(e3) {
          i2(e3);
        } });
      });
    };
  }
  class Ys extends S {
    constructor() {
      super(), this._uniPushMessageCallback = this._receivePushMessage.bind(this), this._currentMessageId = -1, this._payloadQueue = [];
    }
    init() {
      return Promise.all([Gs("getAppBaseInfo")(), Gs("getPushClientId")()]).then(([{ appId: e2 } = {}, { cid: t2 } = {}] = []) => {
        if (!e2)
          throw new Error("Invalid appId, please check the manifest.json file");
        if (!t2)
          throw new Error("Invalid push client id");
        this._appId = e2, this._pushClientId = t2, this._seqId = Date.now() + "-" + Math.floor(9e5 * Math.random() + 1e5), this.emit("open"), this._initMessageListener();
      }, (e2) => {
        throw this.emit("error", e2), this.close(), e2;
      });
    }
    async open() {
      return this.init();
    }
    _isUniCloudSSE(e2) {
      if ("receive" !== e2.type)
        return false;
      const t2 = e2 && e2.data && e2.data.payload;
      return !(!t2 || "UNI_CLOUD_SSE" !== t2.channel || t2.seqId !== this._seqId);
    }
    _receivePushMessage(e2) {
      if (!this._isUniCloudSSE(e2))
        return;
      const t2 = e2 && e2.data && e2.data.payload, { action: n2, messageId: s2, message: r2 } = t2;
      this._payloadQueue.push({ action: n2, messageId: s2, message: r2 }), this._consumMessage();
    }
    _consumMessage() {
      for (; ; ) {
        const e2 = this._payloadQueue.find((e3) => e3.messageId === this._currentMessageId + 1);
        if (!e2)
          break;
        this._currentMessageId++, this._parseMessagePayload(e2);
      }
    }
    _parseMessagePayload(e2) {
      const { action: t2, messageId: n2, message: s2 } = e2;
      "end" === t2 ? this._end({ messageId: n2, message: s2 }) : "message" === t2 && this._appendMessage({ messageId: n2, message: s2 });
    }
    _appendMessage({ messageId: e2, message: t2 } = {}) {
      this.emit("message", t2);
    }
    _end({ messageId: e2, message: t2 } = {}) {
      this.emit("end", t2), this.close();
    }
    _initMessageListener() {
      uni.onPushMessage(this._uniPushMessageCallback);
    }
    _destroy() {
      uni.offPushMessage(this._uniPushMessageCallback);
    }
    toJSON() {
      return { appId: this._appId, pushClientId: this._pushClientId, seqId: this._seqId };
    }
    close() {
      this._destroy(), this.emit("close");
    }
  }
  async function Qs(e2) {
    {
      const { osName: e3, osVersion: t3 } = ce();
      "ios" === e3 && function(e4) {
        if (!e4 || "string" != typeof e4)
          return 0;
        const t4 = e4.match(/^(\d+)./);
        return t4 && t4[1] ? parseInt(t4[1]) : 0;
      }(t3) >= 14 && console.warn("iOS 14及以上版本连接uniCloud本地调试服务需要允许客户端查找并连接到本地网络上的设备（仅开发期间需要，发行后不需要）");
    }
    const t2 = e2.__dev__;
    if (!t2.debugInfo)
      return;
    const { address: n2, servePort: s2 } = t2.debugInfo, { address: r2 } = await Ot(n2, s2);
    if (r2)
      return t2.localAddress = r2, void (t2.localPort = s2);
    const i2 = console["error"];
    let o2 = "";
    if ("remote" === t2.debugInfo.initialLaunchType ? (t2.debugInfo.forceRemote = true, o2 = "当前客户端和HBuilderX不在同一局域网下（或其他网络原因无法连接HBuilderX），uniCloud本地调试服务不对当前客户端生效。\n- 如果不使用uniCloud本地调试服务，请直接忽略此信息。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。") : o2 = "无法连接uniCloud本地调试服务，请检查当前客户端是否与主机在同一局域网下。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。", o2 += "\n- 如果在HBuilderX开启的状态下切换过网络环境，请重启HBuilderX后再试\n- 检查系统防火墙是否拦截了HBuilderX自带的nodejs\n- 检查是否错误的使用拦截器修改uni.request方法的参数", 0 === P.indexOf("mp-") && (o2 += "\n- 小程序中如何使用uniCloud，请参考：https://uniapp.dcloud.net.cn/uniCloud/publish.html#useinmp"), !t2.debugInfo.forceRemote)
      throw new Error(o2);
    i2(o2);
  }
  function Xs(e2) {
    e2._initPromiseHub || (e2._initPromiseHub = new v({ createPromise: function() {
      let t2 = Promise.resolve();
      var n2;
      n2 = 1, t2 = new Promise((e3) => {
        setTimeout(() => {
          e3();
        }, n2);
      });
      const s2 = e2.auth();
      return t2.then(() => s2.getLoginState()).then((e3) => e3 ? Promise.resolve() : s2.signInAnonymously());
    } }));
  }
  const Zs = { tcb: Pt, tencent: Pt, aliyun: fe, private: Rt, dcloud: Rt, alipay: Bt };
  let er = new class {
    init(e2) {
      let t2 = {};
      const n2 = Zs[e2.provider];
      if (!n2)
        throw new Error("未提供正确的provider参数");
      t2 = n2.init(e2), function(e3) {
        const t3 = {};
        e3.__dev__ = t3, t3.debugLog = "app" === P;
        const n3 = C;
        n3 && !n3.code && (t3.debugInfo = n3);
        const s2 = new v({ createPromise: function() {
          return Qs(e3);
        } });
        t3.initLocalNetwork = function() {
          return s2.exec();
        };
      }(t2), Xs(t2), Gn(t2), function(e3) {
        const t3 = e3.uploadFile;
        e3.uploadFile = function(e4) {
          return t3.call(this, e4);
        };
      }(t2), function(e3) {
        e3.database = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e3.init(t3).database();
          if (this._database)
            return this._database;
          const n3 = as(cs, { uniClient: e3 });
          return this._database = n3, n3;
        }, e3.databaseForJQL = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e3.init(t3).databaseForJQL();
          if (this._databaseForJQL)
            return this._databaseForJQL;
          const n3 = as(cs, { uniClient: e3, isJQL: true });
          return this._databaseForJQL = n3, n3;
        };
      }(t2), function(e3) {
        e3.getCurrentUserInfo = qs, e3.chooseAndUploadFile = Ks.initChooseAndUploadFile(e3), Object.assign(e3, { get mixinDatacom() {
          return $s(e3);
        } }), e3.SSEChannel = Ys, e3.initSecureNetworkByWeixin = zs(e3), e3.setCustomClientInfo = Vs, e3.importObject = Bs(e3);
      }(t2);
      return ["callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile", "chooseAndUploadFile"].forEach((e3) => {
        if (!t2[e3])
          return;
        const n3 = t2[e3];
        t2[e3] = function() {
          return n3.apply(t2, Array.from(arguments));
        }, t2[e3] = (/* @__PURE__ */ function(e4, t3) {
          return function(n4) {
            let s2 = false;
            if ("callFunction" === t3) {
              const e5 = n4 && n4.type || l.DEFAULT;
              s2 = e5 !== l.DEFAULT;
            }
            const r2 = "callFunction" === t3 && !s2, i2 = this._initPromiseHub.exec();
            n4 = n4 || {};
            const { success: o2, fail: a2, complete: c2 } = ee(n4), u2 = i2.then(() => s2 ? Promise.resolve() : j($(t3, "invoke"), n4)).then(() => e4.call(this, n4)).then((e5) => s2 ? Promise.resolve(e5) : j($(t3, "success"), e5).then(() => j($(t3, "complete"), e5)).then(() => (r2 && Y(H.RESPONSE, { type: J.CLOUD_FUNCTION, content: e5 }), Promise.resolve(e5))), (e5) => s2 ? Promise.reject(e5) : j($(t3, "fail"), e5).then(() => j($(t3, "complete"), e5)).then(() => (Y(H.RESPONSE, { type: J.CLOUD_FUNCTION, content: e5 }), Promise.reject(e5))));
            if (!(o2 || a2 || c2))
              return u2;
            u2.then((e5) => {
              o2 && o2(e5), c2 && c2(e5), r2 && Y(H.RESPONSE, { type: J.CLOUD_FUNCTION, content: e5 });
            }, (e5) => {
              a2 && a2(e5), c2 && c2(e5), r2 && Y(H.RESPONSE, { type: J.CLOUD_FUNCTION, content: e5 });
            });
          };
        }(t2[e3], e3)).bind(t2);
      }), t2.init = this.init, t2;
    }
  }();
  (() => {
    const e2 = O;
    let t2 = {};
    if (e2 && 1 === e2.length)
      t2 = e2[0], er = er.init(t2), er._isDefault = true;
    else {
      const t3 = ["auth", "callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile"], n2 = ["database", "getCurrentUserInfo", "importObject"];
      let s2;
      s2 = e2 && e2.length > 0 ? "应用有多个服务空间，请通过uniCloud.init方法指定要使用的服务空间" : "应用未关联服务空间，请在uniCloud目录右键关联服务空间", [...t3, ...n2].forEach((e3) => {
        er[e3] = function() {
          if (console.error(s2), -1 === n2.indexOf(e3))
            return Promise.reject(new te({ code: "SYS_ERR", message: s2 }));
          console.error(s2);
        };
      });
    }
    if (Object.assign(er, { get mixinDatacom() {
      return $s(er);
    } }), Ls(er), er.addInterceptor = F, er.removeInterceptor = K, er.interceptObject = B, uni.__uniCloud = er, "app" === P) {
      const e3 = D();
      e3.uniCloud = er, e3.UniCloudError = te;
    }
  })();
  var tr = er;
  function callCheckVersion() {
    return new Promise((resolve, reject) => {
      plus.runtime.getProperty(plus.runtime.appid, function(widgetInfo) {
        const data = {
          action: "checkVersion",
          appid: plus.runtime.appid,
          appVersion: plus.runtime.version,
          wgtVersion: widgetInfo.version
        };
        formatAppLog("log", "at uni_modules/uni-upgrade-center-app/utils/call-check-version.js:11", "data: ", data);
        tr.callFunction({
          name: "uni-upgrade-center",
          data,
          success: (e2) => {
            formatAppLog("log", "at uni_modules/uni-upgrade-center-app/utils/call-check-version.js:16", "e: ", e2);
            resolve(e2);
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    });
  }
  const PACKAGE_INFO_KEY = "__package_info__";
  function checkUpdate() {
    return new Promise((resolve, reject) => {
      callCheckVersion().then(async (e2) => {
        if (!e2.result)
          return;
        const {
          code,
          message,
          is_silently,
          // 是否静默更新
          url,
          // 安装包下载地址
          platform,
          // 安装包平台
          type
          // 安装包类型
        } = e2.result;
        if (code > 0) {
          const {
            fileList
          } = await tr.getTempFileURL({
            fileList: [url]
          });
          if (fileList[0].tempFileURL)
            e2.result.url = fileList[0].tempFileURL;
          resolve(e2);
          if (is_silently) {
            uni.downloadFile({
              url: e2.result.url,
              success: (res2) => {
                if (res2.statusCode == 200) {
                  plus.runtime.install(res2.tempFilePath, {
                    force: false
                  });
                }
              }
            });
            return;
          }
          uni.setStorageSync(PACKAGE_INFO_KEY, e2.result);
          uni.navigateTo({
            url: `/uni_modules/uni-upgrade-center-app/pages/upgrade-popup?local_storage_key=${PACKAGE_INFO_KEY}`,
            fail: (err) => {
              formatAppLog("error", "at uni_modules/uni-upgrade-center-app/utils/check-update.js:63", "更新弹框跳转失败", err);
              uni.removeStorageSync(PACKAGE_INFO_KEY);
            }
          });
          return;
        } else if (code < 0) {
          formatAppLog("error", "at uni_modules/uni-upgrade-center-app/utils/check-update.js:71", message);
          return reject(e2);
        }
        return resolve(e2);
      }).catch((err) => {
        formatAppLog("error", "at uni_modules/uni-upgrade-center-app/utils/check-update.js:77", err.message);
        reject(err);
      });
    });
  }
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:23", "App Launch");
      this.checkLoginStatus();
      if (plus.runtime.appid !== "HBuilder") {
        checkUpdate();
      }
      uni.preLogin({
        provider: "univerify",
        success: (res2) => {
          this.setUniverifyErrorMsg();
          formatAppLog("log", "at App.vue:39", "preLogin success: ", res2);
        },
        fail: (res2) => {
          this.setUniverifyLogin(false);
          this.setUniverifyErrorMsg(res2.errMsg);
          formatAppLog("log", "at App.vue:45", "preLogin fail res: ", res2);
        }
      });
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:51", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:54", "App Hide");
    },
    globalData: {
      test: ""
    },
    methods: {
      ...mapMutations(["setUniverifyErrorMsg", "setUniverifyLogin"]),
      // 检查登录状态
      checkLoginStatus() {
        try {
          const token = uni.getStorageSync("token");
          if (!token) {
            uni.redirectTo({
              url: "/pages/login/login"
            });
          }
        } catch (error) {
          formatAppLog("error", "at App.vue:73", "检查登录状态失败:", error);
          uni.redirectTo({
            url: "/pages/login/login"
          });
        }
      }
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/Administrator/Project/ColdVerifReport/coldverifreport_app2/App.vue"]]);
  const store = createStore({
    state: {
      hasLogin: false,
      isUniverifyLogin: false,
      loginProvider: "",
      openid: null,
      testvuex: false,
      colorIndex: 0,
      colorList: ["#FF0000", "#00FF00", "#0000FF"],
      noMatchLeftWindow: true,
      active: "componentPage",
      leftWinActive: "/pages/component/view/view",
      activeOpen: "",
      menu: [],
      univerifyErrorMsg: "",
      // vuex测试例使用
      username: "foo",
      sex: "男",
      age: 10
    },
    mutations: {
      login(state, provider) {
        state.hasLogin = true;
        state.loginProvider = provider;
      },
      logout(state) {
        state.hasLogin = false;
        state.openid = null;
      },
      setOpenid(state, openid) {
        state.openid = openid;
      },
      setTestTrue(state) {
        state.testvuex = true;
      },
      setTestFalse(state) {
        state.testvuex = false;
      },
      setColorIndex(state, index2) {
        state.colorIndex = index2;
      },
      setMatchLeftWindow(state, matchLeftWindow) {
        state.noMatchLeftWindow = !matchLeftWindow;
      },
      setActive(state, tabPage) {
        state.active = tabPage;
      },
      setLeftWinActive(state, leftWinActive) {
        state.leftWinActive = leftWinActive;
      },
      setActiveOpen(state, activeOpen) {
        state.activeOpen = activeOpen;
      },
      setMenu(state, menu) {
        state.menu = menu;
      },
      setUniverifyLogin(state, payload) {
        typeof payload !== "boolean" ? payload = !!payload : "";
        state.isUniverifyLogin = payload;
      },
      setUniverifyErrorMsg(state, payload = "") {
        state.univerifyErrorMsg = payload;
      },
      // vuex测试例使用
      increment(state) {
        state.age++;
      },
      incrementTen(state, payload) {
        state.age += payload.amount;
      },
      resetAge(state) {
        state.age = 10;
      }
    },
    getters: {
      currentColor(state) {
        return state.colorList[state.colorIndex];
      },
      // vuex测试例使用
      doubleAge(state) {
        return state.age * 2;
      }
    },
    actions: {
      // vuex测试例使用
      incrementAsync(context, payload) {
        context.commit("incrementTen", payload);
      },
      // lazy loading openid
      getUserOpenId: async function({
        commit,
        state
      }) {
        return await new Promise((resolve, reject) => {
          if (state.openid) {
            resolve(state.openid);
          } else {
            uni.login({
              success: (data) => {
                commit("login");
                setTimeout(function() {
                  const openid = "123456789";
                  formatAppLog("log", "at store/index.js:113", "uni.request mock openid[" + openid + "]");
                  commit("setOpenid", openid);
                  resolve(openid);
                }, 1e3);
              },
              fail: (err) => {
                formatAppLog("log", "at store/index.js:119", "uni.login 接口调用失败，将无法正常使用开放接口等服务", err);
                reject(err);
              }
            });
          }
        });
      },
      getPhoneNumber: function({
        commit
      }, univerifyInfo) {
        return new Promise((resolve, reject) => {
          uni.request({
            url: "https://97fca9f2-41f6-449f-a35e-3f135d4c3875.bspapp.com/http/univerify-login",
            method: "POST",
            data: univerifyInfo,
            success: (res2) => {
              const data = res2.data;
              if (data.success) {
                resolve(data.phoneNumber);
              } else {
                reject(res2);
              }
            },
            fail: (err) => {
              reject(res);
            }
          });
        });
      }
    }
  });
  var isVue2 = false;
  function set(target, key, val) {
    if (Array.isArray(target)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val;
    }
    target[key] = val;
    return val;
  }
  function del(target, key) {
    if (Array.isArray(target)) {
      target.splice(key, 1);
      return;
    }
    delete target[key];
  }
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  let supported;
  let perf;
  function isPerformanceSupported() {
    var _a;
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = global.perf_hooks.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
  }
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = Object.assign({}, defaultSettings);
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e2) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e2) {
          }
          currentSettings = value;
        },
        now() {
          return now();
        }
      };
      if (hook) {
        hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
          if (pluginId === this.plugin.id) {
            this.fallbacks.setSettings(value);
          }
        });
      }
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor: descriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * pinia v2.1.7
   * (c) 2023 Eduardo San Martin Morote
   * @license MIT
   */
  let activePinia;
  const setActivePinia = (pinia) => activePinia = pinia;
  const getActivePinia = () => vue.hasInjectionContext() && vue.inject(piniaSymbol) || activePinia;
  const piniaSymbol = Symbol("pinia");
  function isPlainObject(o2) {
    return o2 && typeof o2 === "object" && Object.prototype.toString.call(o2) === "[object Object]" && typeof o2.toJSON !== "function";
  }
  var MutationType;
  (function(MutationType2) {
    MutationType2["direct"] = "direct";
    MutationType2["patchObject"] = "patch object";
    MutationType2["patchFunction"] = "patch function";
  })(MutationType || (MutationType = {}));
  const IS_CLIENT = typeof window !== "undefined";
  const USE_DEVTOOLS = IS_CLIENT;
  const _global = /* @__PURE__ */ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
  function bom(blob, { autoBom = false } = {}) {
    if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
    }
    return blob;
  }
  function download(url, name, opts) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = function() {
      saveAs(xhr.response, name, opts);
    };
    xhr.onerror = function() {
      console.error("could not download file");
    };
    xhr.send();
  }
  function corsEnabled(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    try {
      xhr.send();
    } catch (e2) {
    }
    return xhr.status >= 200 && xhr.status <= 299;
  }
  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent("click"));
    } catch (e2) {
      const evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  }
  const _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
  const isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
  const saveAs = !IS_CLIENT ? () => {
  } : (
    // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
    typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : (
      // Use msSaveOrOpenBlob as a second approach
      "msSaveOrOpenBlob" in _navigator ? msSaveAs : (
        // Fallback to using FileReader and a popup
        fileSaverSaveAs
      )
    )
  );
  function downloadSaveAs(blob, name = "download", opts) {
    const a2 = document.createElement("a");
    a2.download = name;
    a2.rel = "noopener";
    if (typeof blob === "string") {
      a2.href = blob;
      if (a2.origin !== location.origin) {
        if (corsEnabled(a2.href)) {
          download(blob, name, opts);
        } else {
          a2.target = "_blank";
          click(a2);
        }
      } else {
        click(a2);
      }
    } else {
      a2.href = URL.createObjectURL(blob);
      setTimeout(function() {
        URL.revokeObjectURL(a2.href);
      }, 4e4);
      setTimeout(function() {
        click(a2);
      }, 0);
    }
  }
  function msSaveAs(blob, name = "download", opts) {
    if (typeof blob === "string") {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        const a2 = document.createElement("a");
        a2.href = blob;
        a2.target = "_blank";
        setTimeout(function() {
          click(a2);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  }
  function fileSaverSaveAs(blob, name, opts, popup) {
    popup = popup || open("", "_blank");
    if (popup) {
      popup.document.title = popup.document.body.innerText = "downloading...";
    }
    if (typeof blob === "string")
      return download(blob, name, opts);
    const force = blob.type === "application/octet-stream";
    const isSafari = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onloadend = function() {
        let url = reader.result;
        if (typeof url !== "string") {
          popup = null;
          throw new Error("Wrong reader.result type");
        }
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, "data:attachment/file;");
        if (popup) {
          popup.location.href = url;
        } else {
          location.assign(url);
        }
        popup = null;
      };
      reader.readAsDataURL(blob);
    } else {
      const url = URL.createObjectURL(blob);
      if (popup)
        popup.location.assign(url);
      else
        location.href = url;
      popup = null;
      setTimeout(function() {
        URL.revokeObjectURL(url);
      }, 4e4);
    }
  }
  function toastMessage(message, type) {
    const piniaMessage = "🍍 " + message;
    if (typeof __VUE_DEVTOOLS_TOAST__ === "function") {
      __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
    } else if (type === "error") {
      console.error(piniaMessage);
    } else if (type === "warn") {
      console.warn(piniaMessage);
    } else {
      console.log(piniaMessage);
    }
  }
  function isPinia(o2) {
    return "_a" in o2 && "install" in o2;
  }
  function checkClipboardAccess() {
    if (!("clipboard" in navigator)) {
      toastMessage(`Your browser doesn't support the Clipboard API`, "error");
      return true;
    }
  }
  function checkNotFocusedError(error) {
    if (error instanceof Error && error.message.toLowerCase().includes("document is not focused")) {
      toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn");
      return true;
    }
    return false;
  }
  async function actionGlobalCopyState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pinia.state.value));
      toastMessage("Global state copied to clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to serialize the state. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalPasteState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      loadStoresState(pinia, JSON.parse(await navigator.clipboard.readText()));
      toastMessage("Global state pasted from clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalSaveState(pinia) {
    try {
      saveAs(new Blob([JSON.stringify(pinia.state.value)], {
        type: "text/plain;charset=utf-8"
      }), "pinia-state.json");
    } catch (error) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  let fileInput;
  function getFileOpener() {
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
    }
    function openFile() {
      return new Promise((resolve, reject) => {
        fileInput.onchange = async () => {
          const files = fileInput.files;
          if (!files)
            return resolve(null);
          const file = files.item(0);
          if (!file)
            return resolve(null);
          return resolve({ text: await file.text(), file });
        };
        fileInput.oncancel = () => resolve(null);
        fileInput.onerror = reject;
        fileInput.click();
      });
    }
    return openFile;
  }
  async function actionGlobalOpenStateFile(pinia) {
    try {
      const open2 = getFileOpener();
      const result = await open2();
      if (!result)
        return;
      const { text, file } = result;
      loadStoresState(pinia, JSON.parse(text));
      toastMessage(`Global state imported from "${file.name}".`);
    } catch (error) {
      toastMessage(`Failed to import the state from JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  function loadStoresState(pinia, state) {
    for (const key in state) {
      const storeState = pinia.state.value[key];
      if (storeState) {
        Object.assign(storeState, state[key]);
      } else {
        pinia.state.value[key] = state[key];
      }
    }
  }
  function formatDisplay(display) {
    return {
      _custom: {
        display
      }
    };
  }
  const PINIA_ROOT_LABEL = "🍍 Pinia (root)";
  const PINIA_ROOT_ID = "_root";
  function formatStoreForInspectorTree(store2) {
    return isPinia(store2) ? {
      id: PINIA_ROOT_ID,
      label: PINIA_ROOT_LABEL
    } : {
      id: store2.$id,
      label: store2.$id
    };
  }
  function formatStoreForInspectorState(store2) {
    if (isPinia(store2)) {
      const storeNames = Array.from(store2._s.keys());
      const storeMap = store2._s;
      const state2 = {
        state: storeNames.map((storeId) => ({
          editable: true,
          key: storeId,
          value: store2.state.value[storeId]
        })),
        getters: storeNames.filter((id) => storeMap.get(id)._getters).map((id) => {
          const store22 = storeMap.get(id);
          return {
            editable: false,
            key: id,
            value: store22._getters.reduce((getters, key) => {
              getters[key] = store22[key];
              return getters;
            }, {})
          };
        })
      };
      return state2;
    }
    const state = {
      state: Object.keys(store2.$state).map((key) => ({
        editable: true,
        key,
        value: store2.$state[key]
      }))
    };
    if (store2._getters && store2._getters.length) {
      state.getters = store2._getters.map((getterName) => ({
        editable: false,
        key: getterName,
        value: store2[getterName]
      }));
    }
    if (store2._customProperties.size) {
      state.customProperties = Array.from(store2._customProperties).map((key) => ({
        editable: true,
        key,
        value: store2[key]
      }));
    }
    return state;
  }
  function formatEventData(events) {
    if (!events)
      return {};
    if (Array.isArray(events)) {
      return events.reduce((data, event) => {
        data.keys.push(event.key);
        data.operations.push(event.type);
        data.oldValue[event.key] = event.oldValue;
        data.newValue[event.key] = event.newValue;
        return data;
      }, {
        oldValue: {},
        keys: [],
        operations: [],
        newValue: {}
      });
    } else {
      return {
        operation: formatDisplay(events.type),
        key: formatDisplay(events.key),
        oldValue: events.oldValue,
        newValue: events.newValue
      };
    }
  }
  function formatMutationType(type) {
    switch (type) {
      case MutationType.direct:
        return "mutation";
      case MutationType.patchFunction:
        return "$patch";
      case MutationType.patchObject:
        return "$patch";
      default:
        return "unknown";
    }
  }
  let isTimelineActive = true;
  const componentStateTypes = [];
  const MUTATIONS_LAYER_ID = "pinia:mutations";
  const INSPECTOR_ID = "pinia";
  const { assign: assign$1 } = Object;
  const getStoreType = (id) => "🍍 " + id;
  function registerPiniaDevtools(app, pinia) {
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app
    }, (api) => {
      if (typeof api.now !== "function") {
        toastMessage("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.");
      }
      api.addTimelineLayer({
        id: MUTATIONS_LAYER_ID,
        label: `Pinia 🍍`,
        color: 15064968
      });
      api.addInspector({
        id: INSPECTOR_ID,
        label: "Pinia 🍍",
        icon: "storage",
        treeFilterPlaceholder: "Search stores",
        actions: [
          {
            icon: "content_copy",
            action: () => {
              actionGlobalCopyState(pinia);
            },
            tooltip: "Serialize and copy the state"
          },
          {
            icon: "content_paste",
            action: async () => {
              await actionGlobalPasteState(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Replace the state with the content of your clipboard"
          },
          {
            icon: "save",
            action: () => {
              actionGlobalSaveState(pinia);
            },
            tooltip: "Save the state as a JSON file"
          },
          {
            icon: "folder_open",
            action: async () => {
              await actionGlobalOpenStateFile(pinia);
              api.sendInspectorTree(INSPECTOR_ID);
              api.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Import the state from a JSON file"
          }
        ],
        nodeActions: [
          {
            icon: "restore",
            tooltip: 'Reset the state (with "$reset")',
            action: (nodeId) => {
              const store2 = pinia._s.get(nodeId);
              if (!store2) {
                toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, "warn");
              } else if (typeof store2.$reset !== "function") {
                toastMessage(`Cannot reset "${nodeId}" store because it doesn't have a "$reset" method implemented.`, "warn");
              } else {
                store2.$reset();
                toastMessage(`Store "${nodeId}" reset.`);
              }
            }
          }
        ]
      });
      api.on.inspectComponent((payload, ctx) => {
        const proxy = payload.componentInstance && payload.componentInstance.proxy;
        if (proxy && proxy._pStores) {
          const piniaStores = payload.componentInstance.proxy._pStores;
          Object.values(piniaStores).forEach((store2) => {
            payload.instanceData.state.push({
              type: getStoreType(store2.$id),
              key: "state",
              editable: true,
              value: store2._isOptionsAPI ? {
                _custom: {
                  value: vue.toRaw(store2.$state),
                  actions: [
                    {
                      icon: "restore",
                      tooltip: "Reset the state of this store",
                      action: () => store2.$reset()
                    }
                  ]
                }
              } : (
                // NOTE: workaround to unwrap transferred refs
                Object.keys(store2.$state).reduce((state, key) => {
                  state[key] = store2.$state[key];
                  return state;
                }, {})
              )
            });
            if (store2._getters && store2._getters.length) {
              payload.instanceData.state.push({
                type: getStoreType(store2.$id),
                key: "getters",
                editable: false,
                value: store2._getters.reduce((getters, key) => {
                  try {
                    getters[key] = store2[key];
                  } catch (error) {
                    getters[key] = error;
                  }
                  return getters;
                }, {})
              });
            }
          });
        }
      });
      api.on.getInspectorTree((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          let stores = [pinia];
          stores = stores.concat(Array.from(pinia._s.values()));
          payload.rootNodes = (payload.filter ? stores.filter((store2) => "$id" in store2 ? store2.$id.toLowerCase().includes(payload.filter.toLowerCase()) : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase())) : stores).map(formatStoreForInspectorTree);
        }
      });
      api.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return;
          }
          if (inspectedStore) {
            payload.state = formatStoreForInspectorState(inspectedStore);
          }
        }
      });
      api.on.editInspectorState((payload, ctx) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return toastMessage(`store "${payload.nodeId}" not found`, "error");
          }
          const { path } = payload;
          if (!isPinia(inspectedStore)) {
            if (path.length !== 1 || !inspectedStore._customProperties.has(path[0]) || path[0] in inspectedStore.$state) {
              path.unshift("$state");
            }
          } else {
            path.unshift("state");
          }
          isTimelineActive = false;
          payload.set(inspectedStore, path, payload.state.value);
          isTimelineActive = true;
        }
      });
      api.on.editComponentState((payload) => {
        if (payload.type.startsWith("🍍")) {
          const storeId = payload.type.replace(/^🍍\s*/, "");
          const store2 = pinia._s.get(storeId);
          if (!store2) {
            return toastMessage(`store "${storeId}" not found`, "error");
          }
          const { path } = payload;
          if (path[0] !== "state") {
            return toastMessage(`Invalid path for store "${storeId}":
${path}
Only state can be modified.`);
          }
          path[0] = "$state";
          isTimelineActive = false;
          payload.set(store2, path, payload.state.value);
          isTimelineActive = true;
        }
      });
    });
  }
  function addStoreToDevtools(app, store2) {
    if (!componentStateTypes.includes(getStoreType(store2.$id))) {
      componentStateTypes.push(getStoreType(store2.$id));
    }
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app,
      settings: {
        logStoreChanges: {
          label: "Notify about new/deleted stores",
          type: "boolean",
          defaultValue: true
        }
        // useEmojis: {
        //   label: 'Use emojis in messages ⚡️',
        //   type: 'boolean',
        //   defaultValue: true,
        // },
      }
    }, (api) => {
      const now2 = typeof api.now === "function" ? api.now.bind(api) : Date.now;
      store2.$onAction(({ after, onError, name, args }) => {
        const groupId = runningActionId++;
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🛫 " + name,
            subtitle: "start",
            data: {
              store: formatDisplay(store2.$id),
              action: formatDisplay(name),
              args
            },
            groupId
          }
        });
        after((result) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              title: "🛬 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store2.$id),
                action: formatDisplay(name),
                args,
                result
              },
              groupId
            }
          });
        });
        onError((error) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              logType: "error",
              title: "💥 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store2.$id),
                action: formatDisplay(name),
                args,
                error
              },
              groupId
            }
          });
        });
      }, true);
      store2._customProperties.forEach((name) => {
        vue.watch(() => vue.unref(store2[name]), (newValue, oldValue) => {
          api.notifyComponentUpdate();
          api.sendInspectorState(INSPECTOR_ID);
          if (isTimelineActive) {
            api.addTimelineEvent({
              layerId: MUTATIONS_LAYER_ID,
              event: {
                time: now2(),
                title: "Change",
                subtitle: name,
                data: {
                  newValue,
                  oldValue
                },
                groupId: activeAction
              }
            });
          }
        }, { deep: true });
      });
      store2.$subscribe(({ events, type }, state) => {
        api.notifyComponentUpdate();
        api.sendInspectorState(INSPECTOR_ID);
        if (!isTimelineActive)
          return;
        const eventData = {
          time: now2(),
          title: formatMutationType(type),
          data: assign$1({ store: formatDisplay(store2.$id) }, formatEventData(events)),
          groupId: activeAction
        };
        if (type === MutationType.patchFunction) {
          eventData.subtitle = "⤵️";
        } else if (type === MutationType.patchObject) {
          eventData.subtitle = "🧩";
        } else if (events && !Array.isArray(events)) {
          eventData.subtitle = events.type;
        }
        if (events) {
          eventData.data["rawEvent(s)"] = {
            _custom: {
              display: "DebuggerEvent",
              type: "object",
              tooltip: "raw DebuggerEvent[]",
              value: events
            }
          };
        }
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: eventData
        });
      }, { detached: true, flush: "sync" });
      const hotUpdate = store2._hotUpdate;
      store2._hotUpdate = vue.markRaw((newStore) => {
        hotUpdate(newStore);
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🔥 " + store2.$id,
            subtitle: "HMR update",
            data: {
              store: formatDisplay(store2.$id),
              info: formatDisplay(`HMR update`)
            }
          }
        });
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
      });
      const { $dispose } = store2;
      store2.$dispose = () => {
        $dispose();
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID);
        api.sendInspectorState(INSPECTOR_ID);
        api.getSettings().logStoreChanges && toastMessage(`Disposed "${store2.$id}" store 🗑`);
      };
      api.notifyComponentUpdate();
      api.sendInspectorTree(INSPECTOR_ID);
      api.sendInspectorState(INSPECTOR_ID);
      api.getSettings().logStoreChanges && toastMessage(`"${store2.$id}" store installed 🆕`);
    });
  }
  let runningActionId = 0;
  let activeAction;
  function patchActionForGrouping(store2, actionNames, wrapWithProxy) {
    const actions = actionNames.reduce((storeActions, actionName) => {
      storeActions[actionName] = vue.toRaw(store2)[actionName];
      return storeActions;
    }, {});
    for (const actionName in actions) {
      store2[actionName] = function() {
        const _actionId = runningActionId;
        const trackedStore = wrapWithProxy ? new Proxy(store2, {
          get(...args) {
            activeAction = _actionId;
            return Reflect.get(...args);
          },
          set(...args) {
            activeAction = _actionId;
            return Reflect.set(...args);
          }
        }) : store2;
        activeAction = _actionId;
        const retValue = actions[actionName].apply(trackedStore, arguments);
        activeAction = void 0;
        return retValue;
      };
    }
  }
  function devtoolsPlugin({ app, store: store2, options }) {
    if (store2.$id.startsWith("__hot:")) {
      return;
    }
    store2._isOptionsAPI = !!options.state;
    patchActionForGrouping(store2, Object.keys(options.actions), store2._isOptionsAPI);
    const originalHotUpdate = store2._hotUpdate;
    vue.toRaw(store2)._hotUpdate = function(newStore) {
      originalHotUpdate.apply(this, arguments);
      patchActionForGrouping(store2, Object.keys(newStore._hmrPayload.actions), !!store2._isOptionsAPI);
    };
    addStoreToDevtools(
      app,
      // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
      store2
    );
  }
  function createPinia() {
    const scope = vue.effectScope(true);
    const state = scope.run(() => vue.ref({}));
    let _p = [];
    let toBeInstalled = [];
    const pinia = vue.markRaw({
      install(app) {
        setActivePinia(pinia);
        {
          pinia._a = app;
          app.provide(piniaSymbol, pinia);
          app.config.globalProperties.$pinia = pinia;
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(app, pinia);
          }
          toBeInstalled.forEach((plugin) => _p.push(plugin));
          toBeInstalled = [];
        }
      },
      use(plugin) {
        if (!this._a && !isVue2) {
          toBeInstalled.push(plugin);
        } else {
          _p.push(plugin);
        }
        return this;
      },
      _p,
      // it's actually undefined here
      // @ts-expect-error
      _a: null,
      _e: scope,
      _s: /* @__PURE__ */ new Map(),
      state
    });
    if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
      pinia.use(devtoolsPlugin);
    }
    return pinia;
  }
  const isUseStore = (fn) => {
    return typeof fn === "function" && typeof fn.$id === "string";
  };
  function patchObject(newState, oldState) {
    for (const key in oldState) {
      const subPatch = oldState[key];
      if (!(key in newState)) {
        continue;
      }
      const targetValue = newState[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        newState[key] = patchObject(targetValue, subPatch);
      } else {
        {
          newState[key] = subPatch;
        }
      }
    }
    return newState;
  }
  function acceptHMRUpdate(initialUseStore, hot) {
    return (newModule) => {
      const pinia = hot.data.pinia || initialUseStore._pinia;
      if (!pinia) {
        return;
      }
      hot.data.pinia = pinia;
      for (const exportName in newModule) {
        const useStore2 = newModule[exportName];
        if (isUseStore(useStore2) && pinia._s.has(useStore2.$id)) {
          const id = useStore2.$id;
          if (id !== initialUseStore.$id) {
            console.warn(`The id of the store changed from "${initialUseStore.$id}" to "${id}". Reloading.`);
            return hot.invalidate();
          }
          const existingStore = pinia._s.get(id);
          if (!existingStore) {
            console.log(`[Pinia]: skipping hmr because store doesn't exist yet`);
            return;
          }
          useStore2(pinia, existingStore);
        }
      }
    };
  }
  const noop = () => {
  };
  function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
    subscriptions.push(callback);
    const removeSubscription = () => {
      const idx = subscriptions.indexOf(callback);
      if (idx > -1) {
        subscriptions.splice(idx, 1);
        onCleanup();
      }
    };
    if (!detached && vue.getCurrentScope()) {
      vue.onScopeDispose(removeSubscription);
    }
    return removeSubscription;
  }
  function triggerSubscriptions(subscriptions, ...args) {
    subscriptions.slice().forEach((callback) => {
      callback(...args);
    });
  }
  const fallbackRunWithContext = (fn) => fn();
  function mergeReactiveObjects(target, patchToApply) {
    if (target instanceof Map && patchToApply instanceof Map) {
      patchToApply.forEach((value, key) => target.set(key, value));
    }
    if (target instanceof Set && patchToApply instanceof Set) {
      patchToApply.forEach(target.add, target);
    }
    for (const key in patchToApply) {
      if (!patchToApply.hasOwnProperty(key))
        continue;
      const subPatch = patchToApply[key];
      const targetValue = target[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        target[key] = mergeReactiveObjects(targetValue, subPatch);
      } else {
        target[key] = subPatch;
      }
    }
    return target;
  }
  const skipHydrateSymbol = Symbol("pinia:skipHydration");
  function skipHydrate(obj) {
    return Object.defineProperty(obj, skipHydrateSymbol, {});
  }
  function shouldHydrate(obj) {
    return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
  }
  const { assign } = Object;
  function isComputed(o2) {
    return !!(vue.isRef(o2) && o2.effect);
  }
  function createOptionsStore(id, options, pinia, hot) {
    const { state, actions, getters } = options;
    const initialState = pinia.state.value[id];
    let store2;
    function setup() {
      if (!initialState && !hot) {
        {
          pinia.state.value[id] = state ? state() : {};
        }
      }
      const localState = hot ? (
        // use ref() to unwrap refs inside state TODO: check if this is still necessary
        vue.toRefs(vue.ref(state ? state() : {}).value)
      ) : vue.toRefs(pinia.state.value[id]);
      return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
        if (name in localState) {
          console.warn(`[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`);
        }
        computedGetters[name] = vue.markRaw(vue.computed(() => {
          setActivePinia(pinia);
          const store22 = pinia._s.get(id);
          return getters[name].call(store22, store22);
        }));
        return computedGetters;
      }, {}));
    }
    store2 = createSetupStore(id, setup, options, pinia, hot, true);
    return store2;
  }
  function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
    let scope;
    const optionsForPlugin = assign({ actions: {} }, options);
    if (!pinia._e.active) {
      throw new Error("Pinia destroyed");
    }
    const $subscribeOptions = {
      deep: true
      // flush: 'post',
    };
    {
      $subscribeOptions.onTrigger = (event) => {
        if (isListening) {
          debuggerEvents = event;
        } else if (isListening == false && !store2._hotUpdating) {
          if (Array.isArray(debuggerEvents)) {
            debuggerEvents.push(event);
          } else {
            console.error("🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.");
          }
        }
      };
    }
    let isListening;
    let isSyncListening;
    let subscriptions = [];
    let actionSubscriptions = [];
    let debuggerEvents;
    const initialState = pinia.state.value[$id];
    if (!isOptionsStore && !initialState && !hot) {
      {
        pinia.state.value[$id] = {};
      }
    }
    const hotState = vue.ref({});
    let activeListener;
    function $patch(partialStateOrMutator) {
      let subscriptionMutation;
      isListening = isSyncListening = false;
      {
        debuggerEvents = [];
      }
      if (typeof partialStateOrMutator === "function") {
        partialStateOrMutator(pinia.state.value[$id]);
        subscriptionMutation = {
          type: MutationType.patchFunction,
          storeId: $id,
          events: debuggerEvents
        };
      } else {
        mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
        subscriptionMutation = {
          type: MutationType.patchObject,
          payload: partialStateOrMutator,
          storeId: $id,
          events: debuggerEvents
        };
      }
      const myListenerId = activeListener = Symbol();
      vue.nextTick().then(() => {
        if (activeListener === myListenerId) {
          isListening = true;
        }
      });
      isSyncListening = true;
      triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
    }
    const $reset = isOptionsStore ? function $reset2() {
      const { state } = options;
      const newState = state ? state() : {};
      this.$patch(($state) => {
        assign($state, newState);
      });
    } : (
      /* istanbul ignore next */
      () => {
        throw new Error(`🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`);
      }
    );
    function $dispose() {
      scope.stop();
      subscriptions = [];
      actionSubscriptions = [];
      pinia._s.delete($id);
    }
    function wrapAction(name, action) {
      return function() {
        setActivePinia(pinia);
        const args = Array.from(arguments);
        const afterCallbackList = [];
        const onErrorCallbackList = [];
        function after(callback) {
          afterCallbackList.push(callback);
        }
        function onError(callback) {
          onErrorCallbackList.push(callback);
        }
        triggerSubscriptions(actionSubscriptions, {
          args,
          name,
          store: store2,
          after,
          onError
        });
        let ret;
        try {
          ret = action.apply(this && this.$id === $id ? this : store2, args);
        } catch (error) {
          triggerSubscriptions(onErrorCallbackList, error);
          throw error;
        }
        if (ret instanceof Promise) {
          return ret.then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          }).catch((error) => {
            triggerSubscriptions(onErrorCallbackList, error);
            return Promise.reject(error);
          });
        }
        triggerSubscriptions(afterCallbackList, ret);
        return ret;
      };
    }
    const _hmrPayload = /* @__PURE__ */ vue.markRaw({
      actions: {},
      getters: {},
      state: [],
      hotState
    });
    const partialStore = {
      _p: pinia,
      // _s: scope,
      $id,
      $onAction: addSubscription.bind(null, actionSubscriptions),
      $patch,
      $reset,
      $subscribe(callback, options2 = {}) {
        const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
        const stopWatcher = scope.run(() => vue.watch(() => pinia.state.value[$id], (state) => {
          if (options2.flush === "sync" ? isSyncListening : isListening) {
            callback({
              storeId: $id,
              type: MutationType.direct,
              events: debuggerEvents
            }, state);
          }
        }, assign({}, $subscribeOptions, options2)));
        return removeSubscription;
      },
      $dispose
    };
    const store2 = vue.reactive(assign(
      {
        _hmrPayload,
        _customProperties: vue.markRaw(/* @__PURE__ */ new Set())
        // devtools custom properties
      },
      partialStore
      // must be added later
      // setupStore
    ));
    pinia._s.set($id, store2);
    const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
    const setupStore = runWithContext(() => pinia._e.run(() => (scope = vue.effectScope()).run(setup)));
    for (const key in setupStore) {
      const prop = setupStore[key];
      if (vue.isRef(prop) && !isComputed(prop) || vue.isReactive(prop)) {
        if (hot) {
          set(hotState.value, key, vue.toRef(setupStore, key));
        } else if (!isOptionsStore) {
          if (initialState && shouldHydrate(prop)) {
            if (vue.isRef(prop)) {
              prop.value = initialState[key];
            } else {
              mergeReactiveObjects(prop, initialState[key]);
            }
          }
          {
            pinia.state.value[$id][key] = prop;
          }
        }
        {
          _hmrPayload.state.push(key);
        }
      } else if (typeof prop === "function") {
        const actionValue = hot ? prop : wrapAction(key, prop);
        {
          setupStore[key] = actionValue;
        }
        {
          _hmrPayload.actions[key] = prop;
        }
        optionsForPlugin.actions[key] = prop;
      } else {
        if (isComputed(prop)) {
          _hmrPayload.getters[key] = isOptionsStore ? (
            // @ts-expect-error
            options.getters[key]
          ) : prop;
          if (IS_CLIENT) {
            const getters = setupStore._getters || // @ts-expect-error: same
            (setupStore._getters = vue.markRaw([]));
            getters.push(key);
          }
        }
      }
    }
    {
      assign(store2, setupStore);
      assign(vue.toRaw(store2), setupStore);
    }
    Object.defineProperty(store2, "$state", {
      get: () => hot ? hotState.value : pinia.state.value[$id],
      set: (state) => {
        if (hot) {
          throw new Error("cannot set hotState");
        }
        $patch(($state) => {
          assign($state, state);
        });
      }
    });
    {
      store2._hotUpdate = vue.markRaw((newStore) => {
        store2._hotUpdating = true;
        newStore._hmrPayload.state.forEach((stateKey) => {
          if (stateKey in store2.$state) {
            const newStateTarget = newStore.$state[stateKey];
            const oldStateSource = store2.$state[stateKey];
            if (typeof newStateTarget === "object" && isPlainObject(newStateTarget) && isPlainObject(oldStateSource)) {
              patchObject(newStateTarget, oldStateSource);
            } else {
              newStore.$state[stateKey] = oldStateSource;
            }
          }
          set(store2, stateKey, vue.toRef(newStore.$state, stateKey));
        });
        Object.keys(store2.$state).forEach((stateKey) => {
          if (!(stateKey in newStore.$state)) {
            del(store2, stateKey);
          }
        });
        isListening = false;
        isSyncListening = false;
        pinia.state.value[$id] = vue.toRef(newStore._hmrPayload, "hotState");
        isSyncListening = true;
        vue.nextTick().then(() => {
          isListening = true;
        });
        for (const actionName in newStore._hmrPayload.actions) {
          const action = newStore[actionName];
          set(store2, actionName, wrapAction(actionName, action));
        }
        for (const getterName in newStore._hmrPayload.getters) {
          const getter = newStore._hmrPayload.getters[getterName];
          const getterValue = isOptionsStore ? (
            // special handling of options api
            vue.computed(() => {
              setActivePinia(pinia);
              return getter.call(store2, store2);
            })
          ) : getter;
          set(store2, getterName, getterValue);
        }
        Object.keys(store2._hmrPayload.getters).forEach((key) => {
          if (!(key in newStore._hmrPayload.getters)) {
            del(store2, key);
          }
        });
        Object.keys(store2._hmrPayload.actions).forEach((key) => {
          if (!(key in newStore._hmrPayload.actions)) {
            del(store2, key);
          }
        });
        store2._hmrPayload = newStore._hmrPayload;
        store2._getters = newStore._getters;
        store2._hotUpdating = false;
      });
    }
    if (USE_DEVTOOLS) {
      const nonEnumerable = {
        writable: true,
        configurable: true,
        // avoid warning on devtools trying to display this property
        enumerable: false
      };
      ["_p", "_hmrPayload", "_getters", "_customProperties"].forEach((p2) => {
        Object.defineProperty(store2, p2, assign({ value: store2[p2] }, nonEnumerable));
      });
    }
    pinia._p.forEach((extender) => {
      if (USE_DEVTOOLS) {
        const extensions = scope.run(() => extender({
          store: store2,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        }));
        Object.keys(extensions || {}).forEach((key) => store2._customProperties.add(key));
        assign(store2, extensions);
      } else {
        assign(store2, scope.run(() => extender({
          store: store2,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        })));
      }
    });
    if (store2.$state && typeof store2.$state === "object" && typeof store2.$state.constructor === "function" && !store2.$state.constructor.toString().includes("[native code]")) {
      console.warn(`[🍍]: The "state" must be a plain object. It cannot be
	state: () => new MyClass()
Found in store "${store2.$id}".`);
    }
    if (initialState && isOptionsStore && options.hydrate) {
      options.hydrate(store2.$state, initialState);
    }
    isListening = true;
    isSyncListening = true;
    return store2;
  }
  function defineStore(idOrOptions, setup, setupOptions) {
    let id;
    let options;
    const isSetupStore = typeof setup === "function";
    if (typeof idOrOptions === "string") {
      id = idOrOptions;
      options = isSetupStore ? setupOptions : setup;
    } else {
      options = idOrOptions;
      id = idOrOptions.id;
      if (typeof id !== "string") {
        throw new Error(`[🍍]: "defineStore()" must be passed a store id as its first argument.`);
      }
    }
    function useStore2(pinia, hot) {
      const hasContext = vue.hasInjectionContext();
      pinia = // in test mode, ignore the argument provided as we can always retrieve a
      // pinia instance with getActivePinia()
      pinia || (hasContext ? vue.inject(piniaSymbol, null) : null);
      if (pinia)
        setActivePinia(pinia);
      if (!activePinia) {
        throw new Error(`[🍍]: "getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`);
      }
      pinia = activePinia;
      if (!pinia._s.has(id)) {
        if (isSetupStore) {
          createSetupStore(id, setup, options, pinia);
        } else {
          createOptionsStore(id, options, pinia);
        }
        {
          useStore2._pinia = pinia;
        }
      }
      const store2 = pinia._s.get(id);
      if (hot) {
        const hotId = "__hot:" + id;
        const newStore = isSetupStore ? createSetupStore(hotId, setup, options, pinia, true) : createOptionsStore(hotId, assign({}, options), pinia, true);
        hot._hotUpdate(newStore);
        delete pinia.state.value[hotId];
        pinia._s.delete(hotId);
      }
      if (IS_CLIENT) {
        const currentInstance = vue.getCurrentInstance();
        if (currentInstance && currentInstance.proxy && // avoid adding stores that are just built for hot module replacement
        !hot) {
          const vm = currentInstance.proxy;
          const cache = "_pStores" in vm ? vm._pStores : vm._pStores = {};
          cache[id] = store2;
        }
      }
      return store2;
    }
    useStore2.$id = id;
    return useStore2;
  }
  let mapStoreSuffix = "Store";
  function setMapStoreSuffix(suffix) {
    mapStoreSuffix = suffix;
  }
  function mapStores(...stores) {
    if (Array.isArray(stores[0])) {
      console.warn(`[🍍]: Directly pass all stores to "mapStores()" without putting them in an array:
Replace
	mapStores([useAuthStore, useCartStore])
with
	mapStores(useAuthStore, useCartStore)
This will fail in production if not fixed.`);
      stores = stores[0];
    }
    return stores.reduce((reduced, useStore2) => {
      reduced[useStore2.$id + mapStoreSuffix] = function() {
        return useStore2(this.$pinia);
      };
      return reduced;
    }, {});
  }
  function mapState(useStore2, keysOrMapper) {
    return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
      reduced[key] = function() {
        return useStore2(this.$pinia)[key];
      };
      return reduced;
    }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
      reduced[key] = function() {
        const store2 = useStore2(this.$pinia);
        const storeKey2 = keysOrMapper[key];
        return typeof storeKey2 === "function" ? storeKey2.call(this, store2) : store2[storeKey2];
      };
      return reduced;
    }, {});
  }
  const mapGetters = mapState;
  function mapActions(useStore2, keysOrMapper) {
    return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
      reduced[key] = function(...args) {
        return useStore2(this.$pinia)[key](...args);
      };
      return reduced;
    }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
      reduced[key] = function(...args) {
        return useStore2(this.$pinia)[keysOrMapper[key]](...args);
      };
      return reduced;
    }, {});
  }
  function mapWritableState(useStore2, keysOrMapper) {
    return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
      reduced[key] = {
        get() {
          return useStore2(this.$pinia)[key];
        },
        set(value) {
          return useStore2(this.$pinia)[key] = value;
        }
      };
      return reduced;
    }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
      reduced[key] = {
        get() {
          return useStore2(this.$pinia)[keysOrMapper[key]];
        },
        set(value) {
          return useStore2(this.$pinia)[keysOrMapper[key]] = value;
        }
      };
      return reduced;
    }, {});
  }
  function storeToRefs(store2) {
    {
      store2 = vue.toRaw(store2);
      const refs = {};
      for (const key in store2) {
        const value = store2[key];
        if (vue.isRef(value) || vue.isReactive(value)) {
          refs[key] = // ---
          vue.toRef(store2, key);
        }
      }
      return refs;
    }
  }
  const PiniaVuePlugin = function(_Vue) {
    _Vue.mixin({
      beforeCreate() {
        const options = this.$options;
        if (options.pinia) {
          const pinia = options.pinia;
          if (!this._provided) {
            const provideCache = {};
            Object.defineProperty(this, "_provided", {
              get: () => provideCache,
              set: (v2) => Object.assign(provideCache, v2)
            });
          }
          this._provided[piniaSymbol] = pinia;
          if (!this.$pinia) {
            this.$pinia = pinia;
          }
          pinia._a = this;
          if (IS_CLIENT) {
            setActivePinia(pinia);
          }
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(pinia._a, pinia);
          }
        } else if (!this.$pinia && options.parent && options.parent.$pinia) {
          this.$pinia = options.parent.$pinia;
        }
      },
      destroyed() {
        delete this._pStores;
      }
    });
  };
  const Pinia = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    get MutationType() {
      return MutationType;
    },
    PiniaVuePlugin,
    acceptHMRUpdate,
    createPinia,
    defineStore,
    getActivePinia,
    mapActions,
    mapGetters,
    mapState,
    mapStores,
    mapWritableState,
    setActivePinia,
    setMapStoreSuffix,
    skipHydrate,
    storeToRefs
  }, Symbol.toStringTag, { value: "Module" }));
  var define_process_env_UNI_STATISTICS_CONFIG_default = { version: "2", enable: true };
  var define_process_env_UNI_STAT_TITLE_JSON_default = { "pages/login/login": "登录", "pages/task/category/category": "任务管理", "pages/task/category-detail/category-detail": "任务列表", "pages/profile/profile": "个人信息", "pages/task/task-detail/task-detail": "任务详情", "pages/task/realtime-data/realtime-data": "实时曲线" };
  var define_process_env_UNI_STAT_UNI_CLOUD_default = {};
  const sys = uni.getSystemInfoSync();
  const STAT_VERSION = "4.87";
  const STAT_URL = "https://tongji.dcloud.io/uni/stat";
  const STAT_H5_URL = "https://tongji.dcloud.io/uni/stat.gif";
  const PAGE_PVER_TIME = 1800;
  const APP_PVER_TIME = 300;
  const OPERATING_TIME = 10;
  const DIFF_TIME = 60 * 1e3 * 60 * 24;
  const appid = "__UNI__C3F805A";
  const dbSet = (name, value) => {
    let data = uni.getStorageSync("$$STAT__DBDATA:" + appid) || {};
    if (!data) {
      data = {};
    }
    data[name] = value;
    uni.setStorageSync("$$STAT__DBDATA:" + appid, data);
  };
  const dbGet = (name) => {
    let data = uni.getStorageSync("$$STAT__DBDATA:" + appid) || {};
    if (!data[name]) {
      let dbdata = uni.getStorageSync("$$STAT__DBDATA:" + appid);
      if (!dbdata) {
        dbdata = {};
      }
      if (!dbdata[name]) {
        return void 0;
      }
      data[name] = dbdata[name];
    }
    return data[name];
  };
  const dbRemove = (name) => {
    let data = uni.getStorageSync("$$STAT__DBDATA:" + appid) || {};
    if (data[name]) {
      delete data[name];
      uni.setStorageSync("$$STAT__DBDATA:" + appid, data);
    } else {
      data = uni.getStorageSync("$$STAT__DBDATA:" + appid);
      if (data[name]) {
        delete data[name];
        uni.setStorageSync("$$STAT__DBDATA:" + appid, data);
      }
    }
  };
  const uniStatisticsConfig = define_process_env_UNI_STATISTICS_CONFIG_default;
  let statConfig = {
    appid: "__UNI__C3F805A"
  };
  let titleJsons = {};
  titleJsons = define_process_env_UNI_STAT_TITLE_JSON_default;
  const UUID_KEY = "__DC_STAT_UUID";
  const UUID_VALUE = "__DC_UUID_VALUE";
  function getUuid() {
    let uuid = "";
    if (get_platform_name() === "n") {
      try {
        uuid = plus.runtime.getDCloudId();
      } catch (e2) {
        uuid = "";
      }
      return uuid;
    }
    try {
      uuid = uni.getStorageSync(UUID_KEY);
    } catch (e2) {
      uuid = UUID_VALUE;
    }
    if (!uuid) {
      uuid = Date.now() + "" + Math.floor(Math.random() * 1e7);
      try {
        uni.setStorageSync(UUID_KEY, uuid);
      } catch (e2) {
        uni.setStorageSync(UUID_KEY, UUID_VALUE);
      }
    }
    return uuid;
  }
  const get_uuid = (statData2) => {
    return sys.deviceId || getUuid();
  };
  const get_odid = (statData2) => {
    let odid = "";
    if (get_platform_name() === "n") {
      try {
        odid = plus.device.uuid;
      } catch (e2) {
        odid = "";
      }
      return odid;
    }
    return sys.deviceId || getUuid();
  };
  const stat_config = statConfig;
  const get_sgin = (statData2) => {
    let arr = Object.keys(statData2);
    let sortArr = arr.sort();
    let sgin = {};
    let sginStr = "";
    for (var i2 in sortArr) {
      sgin[sortArr[i2]] = statData2[sortArr[i2]];
      sginStr += sortArr[i2] + "=" + statData2[sortArr[i2]] + "&";
    }
    return {
      sign: "",
      options: sginStr.substr(0, sginStr.length - 1)
    };
  };
  const get_encodeURIComponent_options = (statData2) => {
    let data = {};
    for (let prop in statData2) {
      data[prop] = encodeURIComponent(statData2[prop]);
    }
    return data;
  };
  const get_platform_name = () => {
    const aliArr = ["y", "a", "p", "mp-ali"];
    const platformList = {
      app: "n",
      "app-plus": "n",
      "app-harmony": "n",
      "mp-harmony": "mhm",
      h5: "h5",
      "mp-weixin": "wx",
      [aliArr.reverse().join("")]: "ali",
      "mp-baidu": "bd",
      "mp-toutiao": "tt",
      "mp-qq": "qq",
      "quickapp-native": "qn",
      "mp-kuaishou": "ks",
      "mp-lark": "lark",
      "quickapp-webview": "qw",
      "mp-xhs": "xhs"
    };
    if (platformList["app"] === "ali") {
      if (my && my.env) {
        const clientName = my.env.clientName;
        if (clientName === "ap")
          return "ali";
        if (clientName === "dingtalk")
          return "dt";
      }
    }
    return platformList["app"] || "app";
  };
  const get_pack_name = () => {
    let packName = "";
    if (get_platform_name() === "wx" || get_platform_name() === "qq") {
      if (uni.canIUse("getAccountInfoSync")) {
        packName = uni.getAccountInfoSync().miniProgram.appId || "";
      }
    }
    if (get_platform_name() === "n")
      ;
    return packName;
  };
  const get_version = () => {
    return get_platform_name() === "n" ? plus.runtime.version : "";
  };
  const get_channel = () => {
    const platformName = get_platform_name();
    let channel = "";
    if (platformName === "n") {
      channel = plus.runtime.channel;
    }
    return channel;
  };
  const get_scene = (options) => {
    const platformName = get_platform_name();
    let scene = "";
    if (options) {
      return options;
    }
    if (platformName === "wx") {
      scene = uni.getLaunchOptionsSync().scene;
    }
    return scene;
  };
  const get_route = (pageVm) => {
    let _self = pageVm || get_page_vm();
    if (get_platform_name() === "bd") {
      let mp_route = _self.$mp && _self.$mp.page && _self.$mp.page.is;
      let scope_route = _self.$scope && _self.$scope.is;
      return mp_route || scope_route || "";
    } else {
      return _self.route || _self.$scope && _self.$scope.route || _self.$mp && _self.$mp.page.route;
    }
  };
  const get_page_route = (pageVm) => {
    let page = pageVm && (pageVm.$page || pageVm.$scope && pageVm.$scope.$page);
    let lastPageRoute = uni.getStorageSync("_STAT_LAST_PAGE_ROUTE");
    if (!page)
      return lastPageRoute || "";
    return page.fullPath === "/" ? page.route : page.fullPath || page.route;
  };
  const get_page_vm = () => {
    let pages2 = getCurrentPages();
    let $page = pages2[pages2.length - 1];
    if (!$page)
      return null;
    return $page.$vm;
  };
  const get_page_types = (self2) => {
    if (self2.mpType === "page" || self2.$mpType === "page" || self2.$mp && self2.$mp.mpType === "page" || self2.$options.mpType === "page") {
      return "page";
    }
    if (self2.mpType === "app" || self2.$mpType === "app" || self2.$mp && self2.$mp.mpType === "app" || self2.$options.mpType === "app") {
      return "app";
    }
    return null;
  };
  const handle_data = (statData2) => {
    let firstArr = [];
    let contentArr = [];
    let lastArr = [];
    for (let i2 in statData2) {
      const rd = statData2[i2];
      rd.forEach((elm) => {
        let newData = "";
        {
          newData = elm;
        }
        if (i2 === 0) {
          firstArr.push(newData);
        } else if (i2 === 3) {
          lastArr.push(newData);
        } else {
          contentArr.push(newData);
        }
      });
    }
    firstArr.push(...contentArr, ...lastArr);
    return JSON.stringify(firstArr);
  };
  const calibration = (eventName, options) => {
    if (!eventName) {
      console.error(`uni.report Missing [eventName] parameter`);
      return true;
    }
    if (typeof eventName !== "string") {
      console.error(
        `uni.report [eventName] Parameter type error, it can only be of type String`
      );
      return true;
    }
    if (eventName.length > 255) {
      console.error(
        `uni.report [eventName] Parameter length cannot be greater than 255`
      );
      return true;
    }
    if (typeof options !== "string" && typeof options !== "object") {
      console.error(
        "uni.report [options] Parameter type error, Only supports String or Object type"
      );
      return true;
    }
    if (typeof options === "string" && options.length > 255) {
      console.error(
        `uni.report [options] Parameter length cannot be greater than 255`
      );
      return true;
    }
    if (eventName === "title" && typeof options !== "string") {
      console.error(
        `uni.report [eventName] When the parameter is title, the [options] parameter can only be of type String`
      );
      return true;
    }
  };
  const get_page_name = (routepath) => {
    return titleJsons && titleJsons[routepath] || "";
  };
  const Report_Data_Time = "Report_Data_Time";
  const Report_Status = "Report_Status";
  const is_report_data = () => {
    return new Promise((resolve, reject) => {
      let start_time = "";
      let end_time = (/* @__PURE__ */ new Date()).getTime();
      let diff_time = DIFF_TIME;
      let report_status = 1;
      try {
        start_time = uni.getStorageSync(Report_Data_Time);
        report_status = uni.getStorageSync(Report_Status);
      } catch (e2) {
        start_time = "";
        report_status = 1;
      }
      if (report_status === "") {
        requestData(({ enable }) => {
          uni.setStorageSync(Report_Data_Time, end_time);
          uni.setStorageSync(Report_Status, enable);
          if (enable === 1) {
            resolve();
          }
        });
        return;
      }
      if (report_status === 1) {
        resolve();
      }
      if (!start_time) {
        uni.setStorageSync(Report_Data_Time, end_time);
        start_time = end_time;
      }
      if (end_time - start_time > diff_time) {
        requestData(({ enable }) => {
          uni.setStorageSync(Report_Data_Time, end_time);
          uni.setStorageSync(Report_Status, enable);
        });
      }
    });
  };
  const requestData = (done) => {
    const appid2 = "__UNI__C3F805A";
    let formData = {
      usv: STAT_VERSION,
      conf: JSON.stringify({
        ak: appid2
      })
    };
    uni.request({
      url: STAT_URL,
      method: "GET",
      data: formData,
      success: (res2) => {
        const { data } = res2;
        if (data.ret === 0) {
          typeof done === "function" && done({
            enable: data.enable
          });
        }
      },
      fail: (e2) => {
        let report_status_code = 1;
        try {
          report_status_code = uni.getStorageSync(Report_Status);
        } catch (e22) {
          report_status_code = 1;
        }
        if (report_status_code === "") {
          report_status_code = 1;
        }
        typeof done === "function" && done({
          enable: report_status_code
        });
      }
    });
  };
  const uni_cloud_config = () => {
    return define_process_env_UNI_STAT_UNI_CLOUD_default || {};
  };
  const get_space = (config2) => {
    const uniCloudConfig = uni_cloud_config();
    const { spaceId, provider, clientSecret, secretKey, secretId } = uniCloudConfig;
    const space_type = ["tcb", "tencent", "aliyun", "alipay", "private", "dcloud"];
    const is_provider = space_type.indexOf(provider) !== -1;
    const is_aliyun = provider === "aliyun" && spaceId && clientSecret;
    const is_tcb = (provider === "tcb" || provider === "tencent") && spaceId;
    const is_alipay = provider === "alipay" && spaceId && secretKey && secretId;
    const is_private = provider === "private" && spaceId && clientSecret;
    const is_dcloud = provider === "dcloud" && spaceId && clientSecret;
    if (is_provider && (is_aliyun || is_tcb || is_alipay || is_private || is_dcloud)) {
      return uniCloudConfig;
    } else {
      if (config2 && config2.spaceId) {
        return config2;
      }
    }
    return null;
  };
  const get_report_Interval = (defaultTime) => {
    let time = uniStatisticsConfig.reportInterval;
    if (Number(time) === 0)
      return 0;
    time = time || defaultTime;
    let reg = /(^[1-9]\d*$)/;
    if (!reg.test(time))
      return defaultTime;
    return Number(time);
  };
  const is_push_clientid = () => {
    if (uniStatisticsConfig.collectItems) {
      const ClientID = uniStatisticsConfig.collectItems.uniPushClientID;
      return typeof ClientID === "boolean" ? ClientID : false;
    }
    return false;
  };
  const is_page_report = () => {
    if (uniStatisticsConfig.collectItems) {
      const statPageLog = uniStatisticsConfig.collectItems.uniStatPageLog;
      if (statPageLog === void 0)
        return true;
      return typeof statPageLog === "boolean" ? statPageLog : true;
    }
    return true;
  };
  const IS_HANDLE_DEVECE_ID = "is_handle_device_id";
  const is_handle_device = () => {
    let isHandleDevice = dbGet(IS_HANDLE_DEVECE_ID) || "";
    dbSet(IS_HANDLE_DEVECE_ID, "1");
    return isHandleDevice === "1";
  };
  const FIRST_VISIT_TIME_KEY = "__first__visit__time";
  const LAST_VISIT_TIME_KEY = "__last__visit__time";
  const get_time = () => {
    return parseInt((/* @__PURE__ */ new Date()).getTime() / 1e3);
  };
  const get_first_visit_time = () => {
    const timeStorge = dbGet(FIRST_VISIT_TIME_KEY);
    let time = 0;
    if (timeStorge) {
      time = timeStorge;
    } else {
      time = get_time();
      dbSet(FIRST_VISIT_TIME_KEY, time);
      dbRemove(LAST_VISIT_TIME_KEY);
    }
    return time;
  };
  const get_last_visit_time = () => {
    const timeStorge = dbGet(LAST_VISIT_TIME_KEY);
    let time = 0;
    if (timeStorge) {
      time = timeStorge;
    }
    dbSet(LAST_VISIT_TIME_KEY, get_time());
    return time;
  };
  const PAGE_RESIDENCE_TIME = "__page__residence__time";
  let First_Page_Residence_Time = 0;
  let Last_Page_Residence_Time = 0;
  const set_page_residence_time = () => {
    First_Page_Residence_Time = get_time();
    dbSet(PAGE_RESIDENCE_TIME, First_Page_Residence_Time);
    return First_Page_Residence_Time;
  };
  const get_page_residence_time = () => {
    Last_Page_Residence_Time = get_time();
    First_Page_Residence_Time = dbGet(PAGE_RESIDENCE_TIME);
    return Last_Page_Residence_Time - First_Page_Residence_Time;
  };
  const TOTAL_VISIT_COUNT = "__total__visit__count";
  const get_total_visit_count = () => {
    const timeStorge = dbGet(TOTAL_VISIT_COUNT);
    let count = 1;
    if (timeStorge) {
      count = timeStorge;
      count++;
    }
    dbSet(TOTAL_VISIT_COUNT, count);
    return count;
  };
  const FIRST_TIME = "__first_time";
  const set_first_time = () => {
    let time = get_time();
    const timeStorge = dbSet(FIRST_TIME, time);
    return timeStorge;
  };
  const get_residence_time = (type) => {
    let residenceTime = 0;
    const first_time = dbGet(FIRST_TIME);
    const last_time = get_time();
    if (first_time !== 0) {
      residenceTime = last_time - first_time;
    }
    residenceTime = residenceTime < 1 ? 1 : residenceTime;
    if (type === "app") {
      let overtime = residenceTime > APP_PVER_TIME ? true : false;
      return {
        residenceTime,
        overtime
      };
    }
    if (type === "page") {
      let overtime = residenceTime > PAGE_PVER_TIME ? true : false;
      return {
        residenceTime,
        overtime
      };
    }
    return {
      residenceTime
    };
  };
  const eport_Interval = get_report_Interval(OPERATING_TIME);
  let statData = {
    uuid: get_uuid(),
    // 设备标识
    ak: stat_config.appid,
    // uni-app 应用 Appid
    p: "",
    // 手机系统，客户端平台
    ut: get_platform_name(),
    // 平台类型
    mpn: get_pack_name(),
    // 原生平台包名、小程序 appid
    usv: STAT_VERSION,
    // 统计 sdk 版本
    v: get_version(),
    // 应用版本，仅app
    ch: get_channel(),
    // 渠道信息
    cn: "",
    // 国家
    pn: "",
    // 省份
    ct: "",
    // 城市
    t: get_time(),
    // 上报数据时的时间戳
    tt: "",
    brand: sys.brand || "",
    // 手机品牌
    md: sys.model,
    // 手机型号
    sv: "",
    // 手机系统版本
    mpsdk: sys.SDKVersion || "",
    // x程序 sdk version
    mpv: sys.version || "",
    // 小程序平台版本 ，如微信、支付宝
    lang: sys.language,
    // 语言
    pr: sys.pixelRatio,
    // pixelRatio 设备像素比
    ww: sys.windowWidth,
    // windowWidth 可使用窗口宽度
    wh: sys.windowHeight,
    // windowHeight 可使用窗口高度
    sw: sys.screenWidth,
    // screenWidth 屏幕宽度
    sh: sys.screenHeight
    // screenHeight 屏幕高度
  };
  if (sys.platform) {
    switch (sys.platform) {
      case "android":
        statData.p = "a";
        break;
      case "ios":
        statData.p = "i";
        break;
      case "harmonyos":
        statData.p = "h";
        break;
    }
  }
  if (sys.system) {
    statData.sv = sys.system.replace(/(Android|iOS)\s/, "");
  }
  class Report {
    constructor() {
      this.self = "";
      this.__licationShow = false;
      this.__licationHide = false;
      this.statData = statData;
      this._navigationBarTitle = {
        config: "",
        page: "",
        report: "",
        lt: ""
      };
      this._query = {};
      let registerInterceptor = typeof uni.addInterceptor === "function";
      if (registerInterceptor) {
        this.addInterceptorInit();
        this.interceptLogin();
        this.interceptShare(true);
        this.interceptRequestPayment();
      }
    }
    addInterceptorInit() {
      let self2 = this;
      uni.addInterceptor("setNavigationBarTitle", {
        invoke(args) {
          self2._navigationBarTitle.page = args.title;
        }
      });
    }
    interceptLogin() {
      let self2 = this;
      uni.addInterceptor("login", {
        complete() {
          self2._login();
        }
      });
    }
    interceptShare(type) {
      let self2 = this;
      if (!type) {
        self2._share();
        return;
      }
      uni.addInterceptor("share", {
        success() {
          self2._share();
        },
        fail() {
          self2._share();
        }
      });
    }
    interceptRequestPayment() {
      let self2 = this;
      uni.addInterceptor("requestPayment", {
        success() {
          self2._payment("pay_success");
        },
        fail() {
          self2._payment("pay_fail");
        }
      });
    }
    _login() {
      this.sendEventRequest(
        {
          key: "login"
        },
        0
      );
    }
    _share() {
      this.sendEventRequest(
        {
          key: "share"
        },
        0
      );
    }
    _payment(key) {
      this.sendEventRequest(
        {
          key
        },
        0
      );
    }
    /**
     * 进入应用触发
     */
    applicationShow() {
      if (this.__licationHide) {
        const time = get_residence_time("app");
        if (time.overtime) {
          let lastPageRoute = uni.getStorageSync("_STAT_LAST_PAGE_ROUTE");
          let options = {
            path: lastPageRoute,
            scene: this.statData.sc,
            cst: 2
          };
          this.sendReportRequest(options);
        } else {
          const scene = get_scene();
          if (scene !== this.statData.sc) {
            let lastPageRoute = uni.getStorageSync("_STAT_LAST_PAGE_ROUTE");
            let options = {
              path: lastPageRoute,
              scene,
              cst: 2
            };
            this.sendReportRequest(options);
          }
        }
        this.__licationHide = false;
      }
    }
    /**
     * 离开应用触发
     * @param {Object} self
     * @param {Object} type
     */
    applicationHide(self2, type) {
      if (!self2) {
        self2 = get_page_vm();
      }
      this.__licationHide = true;
      const time = get_residence_time();
      const route = get_page_route(self2);
      uni.setStorageSync("_STAT_LAST_PAGE_ROUTE", route);
      this.sendHideRequest(
        {
          urlref: route,
          urlref_ts: time.residenceTime
        },
        type
      );
      set_first_time();
    }
    /**
     * 进入页面触发
     */
    pageShow(self2) {
      this._navigationBarTitle = {
        config: "",
        page: "",
        report: "",
        lt: ""
      };
      const route = get_page_route(self2);
      const routepath = get_route(self2);
      this._navigationBarTitle.config = get_page_name(routepath);
      if (this.__licationShow) {
        set_first_time();
        uni.setStorageSync("_STAT_LAST_PAGE_ROUTE", route);
        this.__licationShow = false;
        return;
      }
      const time = get_residence_time("page");
      if (time.overtime) {
        let options = {
          path: route,
          scene: this.statData.sc,
          cst: 3
        };
        this.sendReportRequest(options);
      }
      set_first_time();
    }
    /**
     * 离开页面触发
     */
    pageHide(self2) {
      if (!this.__licationHide) {
        const time = get_residence_time("page");
        let route = get_page_route(self2);
        let lastPageRoute = uni.getStorageSync("_STAT_LAST_PAGE_ROUTE");
        if (!lastPageRoute) {
          lastPageRoute = route;
        }
        uni.setStorageSync("_STAT_LAST_PAGE_ROUTE", route);
        this.sendPageRequest({
          url: route,
          urlref: lastPageRoute,
          urlref_ts: time.residenceTime
        });
        return;
      }
    }
    /**
     * 发送请求,应用维度上报
     * @param {Object} options 页面信息
     * @param {Boolean} type 是否立即上报
     */
    sendReportRequest(options, type) {
      this._navigationBarTitle.lt = "1";
      this._navigationBarTitle.config = get_page_name(options.path);
      let is_opt = options.query && JSON.stringify(options.query) !== "{}";
      let query = is_opt ? "?" + JSON.stringify(options.query) : "";
      const last_time = get_last_visit_time();
      if (last_time !== 0 || !last_time) {
        const odid = get_odid();
        {
          const have_device = is_handle_device();
          if (!have_device) {
            this.statData.odid = odid;
          }
        }
      }
      Object.assign(this.statData, {
        lt: "1",
        url: options.path + query || "",
        t: get_time(),
        sc: get_scene(options.scene),
        fvts: get_first_visit_time(),
        lvts: last_time,
        tvc: get_total_visit_count(),
        // create session type  上报类型 ，1 应用进入 2.后台30min进入 3.页面30min进入
        cst: options.cst || 1
      });
      if (get_platform_name() === "n") {
        this.getProperty(type);
      } else {
        this.getNetworkInfo(type);
      }
    }
    /**
     * 发送请求,页面维度上报
     * @param {Object} opt
     */
    sendPageRequest(opt) {
      let { url, urlref, urlref_ts } = opt;
      this._navigationBarTitle.lt = "11";
      let options = {
        ak: this.statData.ak,
        uuid: this.statData.uuid,
        p: this.statData.p,
        lt: "11",
        ut: this.statData.ut,
        url,
        tt: this.statData.tt,
        urlref,
        urlref_ts,
        ch: this.statData.ch,
        usv: this.statData.usv,
        t: get_time()
      };
      this.request(options);
    }
    /**
     * 进入后台上报数据
     * @param {Object} opt
     * @param {Object} type
     */
    sendHideRequest(opt, type) {
      let { urlref, urlref_ts } = opt;
      let options = {
        ak: this.statData.ak,
        uuid: this.statData.uuid,
        p: this.statData.p,
        lt: "3",
        ut: this.statData.ut,
        urlref,
        urlref_ts,
        ch: this.statData.ch,
        usv: this.statData.usv,
        t: get_time()
      };
      this.request(options, type);
    }
    /**
     * 自定义事件上报
     */
    sendEventRequest({ key = "", value = "" } = {}) {
      let routepath = "";
      try {
        routepath = get_route();
      } catch (error) {
        const launch_options = dbGet("__launch_options");
        routepath = launch_options.path;
      }
      this._navigationBarTitle.config = get_page_name(routepath);
      this._navigationBarTitle.lt = "21";
      let options = {
        ak: this.statData.ak,
        uuid: this.statData.uuid,
        p: this.statData.p,
        lt: "21",
        ut: this.statData.ut,
        url: routepath,
        ch: this.statData.ch,
        e_n: key,
        e_v: typeof value === "object" ? JSON.stringify(value) : value.toString(),
        usv: this.statData.usv,
        t: get_time()
      };
      this.request(options);
    }
    sendPushRequest(options, cid) {
      let time = get_time();
      const statData2 = {
        lt: "101",
        cid,
        t: time,
        ut: this.statData.ut
      };
      const stat_data = handle_data({
        101: [statData2]
      });
      let optionsData = {
        usv: STAT_VERSION,
        //统计 SDK 版本号
        t: time,
        //发送请求时的时间戮
        requests: stat_data
      };
      if (get_platform_name() === "n" && this.statData.p === "a") {
        setTimeout(() => {
          this.sendRequest(optionsData);
        }, 200);
        return;
      }
      this.sendRequest(optionsData);
    }
    /**
     * 获取wgt资源版本
     */
    getProperty(type) {
      plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
        this.statData.v = wgtinfo.version || "";
        this.getNetworkInfo(type);
      });
    }
    /**
     * 获取网络信息
     */
    getNetworkInfo(type) {
      uni.getNetworkType({
        success: (result) => {
          this.statData.net = result.networkType;
          this.getLocation(type);
        }
      });
    }
    /**
     * 获取位置信息
     */
    getLocation(type) {
      if (stat_config.getLocation) {
        uni.getLocation({
          type: "wgs84",
          geocode: true,
          success: (result) => {
            if (result.address) {
              this.statData.cn = result.address.country;
              this.statData.pn = result.address.province;
              this.statData.ct = result.address.city;
            }
            this.statData.lat = result.latitude;
            this.statData.lng = result.longitude;
            this.request(this.statData, type);
          }
        });
      } else {
        this.statData.lat = 0;
        this.statData.lng = 0;
        this.request(this.statData, type);
      }
    }
    /**
     * 发送请求
     * @param {Object} data 上报数据
     * @param {Object} type 类型
     */
    request(data, type) {
      let time = get_time();
      const title = this._navigationBarTitle;
      Object.assign(data, {
        ttn: title.page,
        ttpj: title.config,
        ttc: title.report
      });
      let uniStatData = dbGet("__UNI__STAT__DATA") || {};
      if (!uniStatData[data.lt]) {
        uniStatData[data.lt] = [];
      }
      uniStatData[data.lt].push(data);
      dbSet("__UNI__STAT__DATA", uniStatData);
      let page_residence_time = get_page_residence_time();
      if (page_residence_time < eport_Interval && !type)
        return;
      set_page_residence_time();
      const stat_data = handle_data(uniStatData);
      let optionsData = {
        usv: STAT_VERSION,
        //统计 SDK 版本号
        t: time,
        //发送请求时的时间戮
        requests: stat_data
      };
      dbRemove("__UNI__STAT__DATA");
      if (get_platform_name() === "n" && this.statData.p === "a") {
        setTimeout(() => {
          this.sendRequest(optionsData);
        }, 200);
        return;
      }
      this.sendRequest(optionsData);
    }
    getIsReportData() {
      return is_report_data();
    }
    /**
     * 数据上报
     * @param {Object} optionsData 需要上报的数据
     */
    sendRequest(optionsData) {
      {
        if (!uni.__stat_uniCloud_space) {
          console.error(
            "应用未关联服务空间，统计上报失败，请在uniCloud目录右键关联服务空间."
          );
          return;
        }
        const uniCloudObj = uni.__stat_uniCloud_space.importObject(
          "uni-stat-receiver",
          {
            customUI: true
          }
        );
        uniCloudObj.report(optionsData).then(() => {
        }).catch((err) => {
        });
      }
    }
    /**
     * h5 请求
     */
    imageRequest(data) {
      this.getIsReportData().then(() => {
        let image = new Image();
        let options = get_sgin(get_encodeURIComponent_options(data)).options;
        image.src = STAT_H5_URL + "?" + options;
      });
    }
    sendEvent(key, value) {
      if (calibration(key, value))
        return;
      if (key === "title") {
        this._navigationBarTitle.report = value;
        return;
      }
      this.sendEventRequest(
        {
          key,
          value: typeof value === "object" ? JSON.stringify(value) : value
        },
        1
      );
    }
  }
  class Stat extends Report {
    static getInstance() {
      if (!uni.__stat_instance) {
        uni.__stat_instance = new Stat();
      }
      {
        let space = get_space(tr.config);
        if (!uni.__stat_uniCloud_space) {
          if (space && Object.keys(space).length !== 0) {
            let spaceData = {
              provider: space.provider,
              spaceId: space.spaceId,
              clientSecret: space.clientSecret
            };
            if (space.endpoint) {
              spaceData.endpoint = space.endpoint;
            }
            if (space.provider === "alipay") {
              spaceData.secretKey = space.secretKey;
              spaceData.accessKey = space.accessKey || space.secretId;
              spaceData.spaceAppId = space.spaceAppId || space.appId;
            }
            uni.__stat_uniCloud_space = tr.init(spaceData);
          } else {
            console.error("应用未关联服务空间，请在uniCloud目录右键关联服务空间");
          }
        }
      }
      return uni.__stat_instance;
    }
    constructor() {
      super();
    }
    /**
     * 获取推送id
     */
    pushEvent(options) {
      const ClientID = is_push_clientid();
      if (uni.getPushClientId && ClientID) {
        uni.getPushClientId({
          success: (res2) => {
            const cid = res2.cid || false;
            if (cid) {
              this.sendPushRequest(options, cid);
            }
          }
        });
      }
    }
    /**
     * 进入应用
     * @param {Object} options 页面参数
     * @param {Object} self	当前页面实例
     */
    launch(options, self2) {
      set_page_residence_time();
      this.__licationShow = true;
      dbSet("__launch_options", options);
      options.cst = 1;
      this.sendReportRequest(options, true);
    }
    load(options, self2) {
      this.self = self2;
      this._query = options;
    }
    appHide(self2) {
      this.applicationHide(self2, true);
    }
    appShow(self2) {
      this.applicationShow(self2);
    }
    show(self2) {
      this.self = self2;
      if (get_page_types(self2) === "page") {
        const isPageReport = is_page_report();
        if (isPageReport) {
          this.pageShow(self2);
        }
      }
      if (get_platform_name() === "h5" || get_platform_name() === "n") {
        if (get_page_types(self2) === "app") {
          this.appShow();
        }
      }
    }
    hide(self2) {
      this.self = self2;
      if (get_page_types(self2) === "page") {
        const isPageReport = is_page_report();
        if (isPageReport) {
          this.pageHide(self2);
        }
      }
      if (get_platform_name() === "h5" || get_platform_name() === "n") {
        if (get_page_types(self2) === "app") {
          this.appHide();
        }
      }
    }
    error(em) {
      let emVal = "";
      if (!em.message) {
        emVal = JSON.stringify(em);
      } else {
        emVal = em.stack;
      }
      let route = "";
      try {
        route = get_route();
      } catch (e2) {
        route = "";
      }
      let options = {
        ak: this.statData.ak,
        uuid: this.statData.uuid,
        p: this.statData.p,
        lt: "31",
        url: route,
        ut: this.statData.ut,
        ch: this.statData.ch,
        mpsdk: this.statData.mpsdk,
        mpv: this.statData.mpv,
        v: this.statData.v,
        em: emVal,
        usv: this.statData.usv,
        t: parseInt((/* @__PURE__ */ new Date()).getTime() / 1e3)
      };
      this.request(options);
    }
  }
  Stat.getInstance();
  function main() {
    {
      {
        uni.report = function(type, options) {
        };
      }
    }
  }
  main();
  function createApp() {
    const app = vue.createVueApp(App);
    app.use(store);
    app.use(createPinia());
    app.config.globalProperties.$adpid = "1111111111";
    app.config.globalProperties.$backgroundAudioData = {
      playing: false,
      playTime: 0,
      formatedPlayTime: "00:00:00"
    };
    return {
      app,
      Vuex: index,
      // 如果 nvue 使用 vuex 的各种map工具方法时，必须 return Vuex
      Pinia
      // 此处必须将 Pinia 返回
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);

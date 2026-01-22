/**
 * API服务层
 * 封装所有API调用，统一处理认证和错误
 */

import storageManager from '@/common/storage.js'

class ApiService {
  constructor() {
    this.baseURL = '';
    this.timeout = 15000; // 15秒超时
  }

  /**
   * 更新基础URL
   */
  updateBaseURL() {
    this.baseURL = storageManager.getApiBaseUrl() || '';
  }

  /**
   * 通用请求方法
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise} Promise对象
   */
  async request(url, options = {}) {
    // 确保基础URL是最新的
    this.updateBaseURL();
    
    if (!this.baseURL) {
      throw new Error('请先配置服务器地址');
    }

    const config = {
      url: `${this.baseURL}${url}`,
      method: options.method || 'GET',
      timeout: this.timeout,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      ...options
    };

    // 如果需要认证，添加Authorization头
    if (options.auth !== false) {
      const token = storageManager.getToken();
      if (token) {
        config.header.Authorization = `Bearer ${token}`;
      }
    }

    return new Promise((resolve, reject) => {
      uni.request({
        ...config,
        success: (res) => {
          // 处理HTTP状态码
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            // 未授权，清除本地认证信息并跳转到登录页
            storageManager.clearAuthData();
            uni.reLaunch({
              url: '/pages/login/login'
            });
            reject(new Error('登录已过期，请重新登录'));
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          console.error('网络请求失败:', err);
          reject(new Error('网络连接失败，请检查网络设置'));
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
    let queryString = '';
    if (params && Object.keys(params).length > 0) {
      queryString = '?' + Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    }
    
    return this.request(`${url}${queryString}`, {
      method: 'GET',
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
      method: 'POST',
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
      method: 'PUT',
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
      method: 'DELETE',
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
      const data = await this.post('/api/user-enf/login', {
        username,
        password
      }, { auth: false }); // 登录接口不需要认证
      
      if (data.success) {
        // 保存token和用户信息
        storageManager.setToken(data.token);
        storageManager.setUserInfo(data.user);
        // 保存网关设备列表到缓存
        if (data.user && data.user.gatewayDeviceSnList) {
          storageManager.setGatewayDeviceSnList(data.user.gatewayDeviceSnList);
        } else {
          storageManager.setGatewayDeviceSnList([]);
        }
        return data;
      } else {
        throw new Error('登录失败');
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
      const data = await this.get('/api/user-enf/categories');
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
        throw new Error('分类ID不能为空');
      }
      
      const data = await this.get('/api/user-enf/tasks', {
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
        throw new Error('任务ID不能为空');
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
        throw new Error('任务ID不能为空');
      }
      
      if (!Array.isArray(tags)) {
        throw new Error('标签必须是数组格式');
      }
      
      // deviceSnList 允许为空；若传入则必须为数组
      if (deviceSnList !== undefined && !Array.isArray(deviceSnList)) {
        throw new Error('deviceSnList 必须是数组格式');
      }

      const data = await this.put('/api/user-enf/task-tags', {
        taskId,
        tags,
        ...(deviceSnList !== undefined ? { deviceSnList } : {})
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
    // 使用与其他接口相同的 baseURL 与 token 管理
    this.updateBaseURL();

    if (!this.baseURL) {
      throw new Error('请先配置服务器地址');
    }

    if (!filePath) {
      throw new Error('请选择要上传的图片');
    }

    const token = storageManager.getToken();

    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: `${this.baseURL}/api/user-enf/upload/image`,
        filePath,
        name: 'file', // 后端约定字段名
        header: {
          // uni.uploadFile 会自动设置 multipart/form-data
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        success: (res) => {
          // console.log('图片上传响应:', res);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            let data = res.data;
            try {
              if (typeof data === 'string') {
                data = JSON.parse(data);
              }
            } catch (e) {
              reject(new Error('服务器返回格式错误'));
              return;
            }

            if (data && data.success) {
              resolve(data);
            } else {
              reject(new Error((data && data.message) || '图片上传失败'));
            }
          } else if (res.statusCode === 401) {
            // 未授权，清理本地认证并跳转登录
            storageManager.clearAuthData();
            uni.reLaunch({
              url: '/pages/login/login'
            });
            reject(new Error('登录已过期，请重新登录'));
          } else if (res.statusCode === 400) {
            reject(new Error('图片上传失败：文件不合法或过大'));
          } else {
            reject(new Error(`图片上传失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          console.error('图片上传失败:', err);
          reject(new Error('图片上传失败，请检查网络连接'));
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
      const originalBaseURL = this.baseURL;
      this.baseURL = serverUrl.startsWith('http') ? serverUrl : `http://${serverUrl}`;
      
      // 发送一个简单的请求测试连接
      const response = await this.get('/api/user-enf/categories', {}, { 
        auth: false,
        timeout: 5000 // 5秒超时用于测试
      });
      
      this.baseURL = originalBaseURL;
      return true;
    } catch (error) {
      this.baseURL = originalBaseURL;
      throw error;
    }
  }

  /**
   * 获取网关设备列表
   * @returns {Promise} Promise对象，返回 gatewayDeviceSnList
   */
  async getGatewayDevices() {
    try {
      const data = await this.get('/api/user-enf/gateway-devices');
      return data.gatewayDeviceSnList || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * 检查网络状态
   * @returns {Promise<boolean>} 是否有网络连接
   */
  async checkNetworkStatus() {
    return new Promise((resolve) => {
      uni.getNetworkType({
        success: (res) => {
          // networkType: wifi/2g/3g/4g/5g/ethernet/unknown/none
          resolve(res.networkType !== 'none' && res.networkType !== 'unknown');
        },
        fail: () => {
          resolve(false);
        }
      });
    });
  }

  /**
   * 更新网关设备列表
   * @param {Array} gatewayDeviceSnList - 网关设备列表
   * @param {boolean} forceOnline - 是否强制在线模式（默认false，允许离线保存）
   * @returns {Promise} Promise对象
   */
  async updateGatewayDevices(gatewayDeviceSnList, forceOnline = false) {
    try {
      if (!Array.isArray(gatewayDeviceSnList)) {
        throw new Error('网关设备列表必须是数组格式');
      }
      
      // 先保存到本地缓存
      storageManager.setGatewayDeviceSnList(gatewayDeviceSnList);
      
      // 检查网络状态
      const hasNetwork = await this.checkNetworkStatus();
      
      if (!hasNetwork) {
        // 没有网络，只保存到本地并标记为未同步
        if (forceOnline) {
          throw new Error('网络连接失败，请检查网络设置');
        }
        storageManager.setHasUnsyncedData(true);
        // 返回一个特殊标记，表示已保存到本地但未上传
        return { success: true, cached: true, message: '已保存到本地，等待网络恢复后上传' };
      }
      
      // 有网络，尝试上传
      try {
        const data = await this.put('/api/user-enf/gateway-devices', {
          gatewayDeviceSnList
        });
        // 上传成功，清除未同步标记
        storageManager.setHasUnsyncedData(false);
        return data;
      } catch (error) {
        // 上传失败，但已保存到本地，标记为未同步
        storageManager.setHasUnsyncedData(true);
        if (forceOnline) {
          throw error;
        }
        // 离线模式：返回成功但标记为已缓存
        return { success: true, cached: true, message: '已保存到本地，上传失败: ' + error.message };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取最新版本（公开接口，不需要认证）
   * @returns {Promise} Promise对象，返回最新版本信息
   */
  async getLatestVersion() {
    try {
      const data = await this.get('/api/app-versions/latest', {}, { auth: false });
      return data;
    } catch (error) {
      throw error;
    }
  }
}

// 创建单例实例
const apiService = new ApiService();

export default apiService;
<template>
  <view class="global-vars-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">全局变量配置</text>
      <text v-if="categoryName" class="category-name">{{ categoryName }}</text>
    </view>

    <!-- 变量列表 -->
    <view class="vars-list">
      <view 
        v-for="item in variablesList" 
        :key="item.key" 
        class="var-item"
      >
        <view class="var-header">
          <view class="var-name-wrap">
            <text class="var-name">{{ item.name || item.key }}</text>

          </view>
          <text class="var-type">{{ getTypeLabel(item.type) }}</text>
        </view>
        <view class="var-content">
          <!-- 字符串类型 -->
          <input 
            v-if="item.type === 'string'"
            :value="item.value"
            class="var-input"
            type="text"
            placeholder="请输入"
            @input="onVarChange(item.key, $event)"
          />
          <!-- 数字类型 -->
          <input 
            v-else-if="item.type === 'number'"
            :value="item.value != null ? String(item.value) : ''"
            class="var-input"
            type="digit"
            placeholder="请输入数字"
            @input="onVarChange(item.key, $event)"
          />
          <!-- 布尔类型 -->
          <switch 
            v-else-if="item.type === 'boolean'"
            :checked="item.value === true || item.value === 'true'"
            color="#667eea"
            @change="onBooleanChange(item.key, $event)"
          />
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="variablesList.length === 0 && !loading" class="empty-state">
        <text class="empty-text">暂无全局变量</text>
        <text class="empty-hint">请先加载任务列表以获取全局变量配置</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 保存提示 -->
    <view v-if="hasUnsyncedGlobalVariables" class="save-bar">
      <button class="save-btn" :disabled="saving" @click="saveVariables">
        {{ saving ? '保存中...' : '保存修改' }}
      </button>
    </view>
  </view>
</template>

<script>
import apiService from '@/common/api.js'

export default {
  data() {
    return {
      categoryId: '',
      categoryName: '',
      cacheKey: '',
      variablesList: [], // 转为数组便于 v-for，格式 [{ key, ...item }]
      variablesMap: {}, // 原始对象，用于保存
      loading: false,
      saving: false,
      // 是否存在未提交的全局变量更新（用于显示“保存修改”按钮 & 顶部按钮变黄提示）
      hasUnsyncedGlobalVariables: false,
      // 内部：缓存写入防抖定时器
      _persistTimer: null
    };
  },

  onLoad(options) {
    this.categoryId = options.categoryId || '';
    this.categoryName = options.categoryName ? decodeURIComponent(options.categoryName) : '';
    this.cacheKey = `${this.categoryId}_tasks`;
    
    if (this.categoryId) {
      this.loadVariables();
    }
  },

  onShow() {
    // 从任务详情返回时重新加载
    // 若本地已有未提交更新，避免覆盖用户本地编辑
    if (this.categoryId && !this.hasUnsyncedGlobalVariables && !this.saving) {
      this.loadVariables();
    }
  },

  methods: {
    // 加载全局变量
    loadVariables() {
      if (!this.cacheKey) return;

      this.loading = true;
      try {
        const cachedData = uni.getStorageSync(this.cacheKey);
        const globalVariables = (cachedData && cachedData.globalVariables) || {};
        this.hasUnsyncedGlobalVariables = !!(cachedData && cachedData.hasUnsyncedGlobalVariables);
        
        // 转为数组格式，同时保留 key
        this.variablesMap = JSON.parse(JSON.stringify(globalVariables));
        this.variablesList = Object.keys(this.variablesMap).map(key => ({
          key,
          name: this.variablesMap[key].name || key,
          type: this.variablesMap[key].type || 'string',
          value: this.variablesMap[key].value
        }));
      } catch (error) {
        console.error('加载全局变量失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 获取类型标签
    getTypeLabel(type) {
      const labels = {
        string: '文本',
        number: '数字',
        boolean: '开关'
      };
      return labels[type] || type;
    },

    // 将当前 variablesList 立即写入缓存，并标记为“未提交”
    persistToCacheImmediate(markUnsynced = true) {
      if (!this.cacheKey) return;
      try {
        const cachedData = uni.getStorageSync(this.cacheKey) || {};
        const newGlobalVariables = {};
        this.variablesList.forEach(item => {
          newGlobalVariables[item.key] = {
            name: item.name,
            type: item.type,
            value: item.value
          };
        });

        uni.setStorageSync(this.cacheKey, {
          ...cachedData,
          globalVariables: newGlobalVariables,
          ...(markUnsynced ? { hasUnsyncedGlobalVariables: true } : {})
        });

        if (markUnsynced) {
          this.hasUnsyncedGlobalVariables = true;
        }
      } catch (error) {
        console.warn('写入全局变量缓存失败:', error);
      }
    },

    // 写缓存（防抖，减少每次输入都 setStorageSync 的频率）
    persistToCacheDebounced() {
      if (this._persistTimer) {
        clearTimeout(this._persistTimer);
      }
      this._persistTimer = setTimeout(() => {
        this.persistToCacheImmediate(true);
        this._persistTimer = null;
      }, 200);
    },

    // 字符串/数字输入变化
    onVarChange(key, e) {
      const value = e.detail ? e.detail.value : (e.target ? e.target.value : '');
      const item = this.variablesList.find(v => v.key === key);
      if (!item) return;

      if (item.type === 'number') {
        const num = value === '' ? 0 : parseFloat(value);
        item.value = isNaN(num) ? 0 : num;
      } else {
        item.value = value;
      }

      this.variablesMap[key] = { ...item };
      // 编辑即落缓存，并标记未提交
      this.persistToCacheDebounced();
    },

    // 布尔类型切换
    onBooleanChange(key, e) {
      const checked = e.detail.value;
      const item = this.variablesList.find(v => v.key === key);
      if (!item) return;

      item.value = checked;
      this.variablesMap[key] = { ...item };
      // 编辑即落缓存，并标记未提交
      this.persistToCacheImmediate(true);
    },

    // 保存修改：仅提交接口（缓存已在编辑时实时保存）
    async saveVariables() {
      if (!this.cacheKey || !this.categoryId) return;

      // 构建 globalVariables 对象
      const newGlobalVariables = {};
      this.variablesList.forEach(item => {
        newGlobalVariables[item.key] = {
          name: item.name,
          type: item.type,
          value: item.value
        };
      });

      this.saving = true;
      try {
        // 先检查网络：无网络则只缓存并标记未提交
        const hasNetwork = await apiService.checkNetworkStatus();
        if (!hasNetwork) {
          uni.showToast({
            title: '当前无网络，已保存到本地，待网络恢复后再提交',
            icon: 'none',
            duration: 2500
          });
          return;
        }

        // 有网络：调用接口提交到服务器
        await apiService.updateCategoriesGlobalVariables(this.categoryId, newGlobalVariables);

        // 接口成功后更新本地缓存，并清除未提交标志
        const cachedData = uni.getStorageSync(this.cacheKey) || {};
        uni.setStorageSync(this.cacheKey, {
          ...cachedData,
          globalVariables: newGlobalVariables,
          hasUnsyncedGlobalVariables: false
        });

        this.variablesMap = JSON.parse(JSON.stringify(newGlobalVariables));
        this.hasUnsyncedGlobalVariables = false;

        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('保存全局变量失败:', error);
        // 提交失败：仍然缓存最新值并标记未提交（避免数据丢失）
        try {
          const cachedData = uni.getStorageSync(this.cacheKey) || {};
          uni.setStorageSync(this.cacheKey, {
            ...cachedData,
            globalVariables: newGlobalVariables,
            hasUnsyncedGlobalVariables: true
          });
          this.hasUnsyncedGlobalVariables = true;
        } catch (cacheError) {
          console.warn('保存失败时写入本地缓存也失败:', cacheError);
        }
        uni.showToast({
          title: (error && error.message) ? `${error.message}（已保存到本地，待重试）` : '保存失败（已保存到本地，待重试）',
          icon: 'none'
        });
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.global-vars-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.page-header {
  background: white;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.category-name {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-top: 10rpx;
}

.vars-list {
  padding: 20rpx;
}

.var-item {
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.var-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.var-name-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.var-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  word-break: break-all;
}

.var-key {
  font-size: 24rpx;
  color: #999;
  word-break: break-all;
}

.var-type {
  font-size: 24rpx;
  color: #667eea;
  background: #f0f4ff;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.var-content {
  margin-top: 10rpx;
}

.var-input {
  width: 100%;
  height: 72rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  box-sizing: border-box;
}

.var-input:focus {
  border-color: #667eea;
}

.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
  display: block;
}

.empty-hint {
  font-size: 26rpx;
  color: #bbb;
  display: block;
  margin-top: 20rpx;
}

.loading {
  text-align: center;
  padding: 30rpx;
  color: #666;
}

.save-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.save-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  border-radius: 44rpx;
}

.save-btn::after {
  border: none;
}
</style>


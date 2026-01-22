<template>
  <view class="gateway-list-container">
    <!-- 未上传数据提示 -->
    <view class="unsynced-notice" v-if="hasUnsyncedData" @click="uploadCachedData">
      <text class="unsynced-icon">⚠️</text>
      <text class="unsynced-text">有未上传的数据，点击上传</text>
      <text class="unsynced-arrow">▶</text>
    </view>

    <!-- 搜索和添加网关区域 -->
    <view class="add-button-section">
      <view class="search-input-wrapper">
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索网关SN或备注"
          @input="onSearchInput"
        />
      </view>
      <button class="add-btn" @click="showAddGatewayModal">+ 添加网关</button>
    </view>

    <!-- 网关列表 -->
    <view class="gateway-list" v-if="filteredGatewayList.length > 0">
      <view 
        class="gateway-item" 
        v-for="(gateway, index) in filteredGatewayList" 
        :key="index"
        @click="goToDeviceList(gateway, getOriginalIndex(gateway))"
      >
        <view class="gateway-left">
          <view class="gateway-color" :style="{ backgroundColor: gateway.color || '#667eea' }"></view>
          <view class="gateway-info">
            <view class="gateway-header-info">
              <text class="gateway-sn">{{ gateway.gatewaySn }}</text>
              <text class="device-count-badge">{{ gateway.deviceSnList ? gateway.deviceSnList.length : 0 }}</text>
            </view>
            <text class="gateway-remark" v-if="gateway.remark">{{ gateway.remark }}</text>
            <text class="gateway-remark empty" v-else>无备注</text>
          </view>
        </view>
    
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-text" v-if="searchKeyword">未找到匹配的网关</text>
      <text class="empty-text" v-else>暂无网关，点击上方按钮添加</text>
    </view>

    <!-- 添加/编辑网关弹窗 -->
    <view class="modal-overlay" v-if="showModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingIndex !== null ? '编辑网关' : '添加网关' }}</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">网关SN *</text>
            <input 
              class="form-input" 
              v-model="formData.gatewaySn" 
              placeholder="请输入网关SN"
              :disabled="editingIndex !== null"
            />
          </view>
          <view class="form-item">
            <text class="form-label">颜色</text>
            <view class="color-picker">
              <view 
                class="color-option" 
                v-for="color in colorOptions" 
                :key="color"
                :class="{ active: formData.color === color }"
                :style="{ backgroundColor: color }"
                @click="formData.color = color"
              ></view>
              <input 
                class="color-input" 
                v-model="formData.color" 
                placeholder="#667eea"
                type="text"
              />
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">备注</text>
            <input 
              class="form-input" 
              v-model="formData.remark" 
              placeholder="请输入备注信息"
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closeModal">取消</button>
          <button class="modal-btn confirm" @click="saveGateway">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import apiService from '@/common/api.js'
import storageManager from '@/common/storage.js'

export default {
  data() {
    return {
      gatewayList: [],
      showModal: false,
      editingIndex: null,
      searchKeyword: '',
      hasUnsyncedData: false,
      formData: {
        gatewaySn: '',
        color: '#667eea',
        remark: ''
      },
      colorOptions: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea']
    }
  },

  computed: {
    // 过滤后的网关列表
    filteredGatewayList() {
      if (!this.searchKeyword.trim()) {
        return this.gatewayList
      }
      const keyword = this.searchKeyword.trim().toLowerCase()
      return this.gatewayList.filter(gateway => {
        const gatewaySn = (gateway.gatewaySn || '').toLowerCase()
        const remark = (gateway.remark || '').toLowerCase()
        return gatewaySn.includes(keyword) || remark.includes(keyword)
      })
    }
  },

  onLoad() {
    this.loadGatewayList()
    // 检查并自动上传未同步的数据
    const checkAndUpload = async () => {
      this.hasUnsyncedData = storageManager.getHasUnsyncedData()
      if (this.hasUnsyncedData) {
        const cachedList = storageManager.getGatewayDeviceSnList()
        if (cachedList && cachedList.length > 0) {
          try {
            await apiService.updateGatewayDevices(cachedList, true)
            storageManager.setHasUnsyncedData(false)
            this.hasUnsyncedData = false
          } catch (error) {
            console.log('自动上传失败:', error)
          }
        }
      }
    }
    checkAndUpload()
  },

  onShow() {
    // 从设备列表返回时刷新数据
    this.loadGatewayList()
    this.hasUnsyncedData = storageManager.getHasUnsyncedData()
  },

  methods: {
    // 检查是否有未同步的数据
    checkUnsyncedData() {
      this.hasUnsyncedData = storageManager.getHasUnsyncedData()
    },

    // 检查并自动上传未同步的数据
    async checkAndUploadUnsyncedData() {
      // 先检查是否有未同步数据
      this.hasUnsyncedData = storageManager.getHasUnsyncedData()
      
      // 如果有未同步数据，自动尝试上传
      if (this.hasUnsyncedData) {
        const cachedList = storageManager.getGatewayDeviceSnList()
        if (cachedList && cachedList.length > 0) {
          try {
            // 静默上传，不显示加载提示
            await apiService.updateGatewayDevices(cachedList, true)
            // 上传成功，清除标记
            storageManager.setHasUnsyncedData(false)
            this.hasUnsyncedData = false
          } catch (error) {
            // 上传失败，保持未同步状态，用户可以看到提示横幅
            console.log('自动上传失败:', error)
          }
        }
      }
    },

    // 上传缓存的数据
    async uploadCachedData() {
      try {
        const cachedList = storageManager.getGatewayDeviceSnList()
        if (!cachedList || cachedList.length === 0) {
          uni.showToast({
            title: '没有需要上传的数据',
            icon: 'none'
          })
          return
        }

        uni.showLoading({ title: '上传中...' })
        // 使用 forceOnline = true 强制在线模式
        await apiService.updateGatewayDevices(cachedList, true)
        uni.hideLoading()
        
        this.hasUnsyncedData = false
        uni.showToast({
          title: '上传成功',
          icon: 'success'
        })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '上传失败',
          icon: 'none'
        })
      }
    },

    // 搜索输入处理
    onSearchInput() {
      // 搜索逻辑在 computed 中处理，这里可以添加其他逻辑
    },

    // 获取原始索引（用于跳转到设备列表）
    getOriginalIndex(gateway) {
      return this.gatewayList.findIndex(g => g.gatewaySn === gateway.gatewaySn)
    },

    // 加载网关列表（从缓存读取）
    loadGatewayList() {
      try {
        this.gatewayList = storageManager.getGatewayDeviceSnList()
      } catch (error) {
        console.error('加载网关列表失败:', error)
        this.gatewayList = []
      }
    },

    // 显示添加网关弹窗
    showAddGatewayModal() {
      this.editingIndex = null
      this.formData = {
        gatewaySn: '',
        color: '#667eea',
        remark: ''
      }
      this.showModal = true
    },

    // 关闭弹窗
    closeModal() {
      this.showModal = false
    },

    // 保存网关（仅用于添加）
    async saveGateway() {
      if (!this.formData.gatewaySn.trim()) {
        uni.showToast({
          title: '请输入网关SN',
          icon: 'none'
        })
        return
      }

      try {
        let newList = [...this.gatewayList]
        
        // 添加模式
        // 检查是否已存在相同网关SN
        if (newList.some(g => g.gatewaySn === this.formData.gatewaySn.trim())) {
          uni.showToast({
            title: '该网关SN已存在',
            icon: 'none'
          })
          return
        }
        
        newList.push({
          gatewaySn: this.formData.gatewaySn.trim(),
          deviceSnList: [],
          color: this.formData.color || '#667eea',
          remark: this.formData.remark || ''
        })

        uni.showLoading({ title: '保存中...' })
        const result = await apiService.updateGatewayDevices(newList)
        uni.hideLoading()
        
        this.gatewayList = newList
        this.closeModal()
        this.checkUnsyncedData() // 检查未同步状态
        
        if (result && result.cached) {
          uni.showToast({
            title: '已保存到本地，等待网络恢复后上传',
            icon: 'none',
            duration: 2000
          })
        } else {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'none'
        })
      }
    },

    // 跳转到设备列表
    goToDeviceList(gateway, index) {
      uni.navigateTo({
        url: `/pages/gateway/device-list?gatewayIndex=${index}&gatewaySn=${encodeURIComponent(gateway.gatewaySn)}`
      })
    }
  }
}
</script>

<style scoped>
.gateway-list-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.add-button-section {
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.search-input-wrapper {
  flex: 1;
}

.search-input {
  width: 100%;
  height: 80rpx;
  padding: 0 30rpx;
  background: white;
  border: 1rpx solid #e0e0e0;
  border-radius: 15rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #667eea;
}

.add-btn {
  flex-shrink: 0;
  width: 200rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 15rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.add-btn:active {
  opacity: 0.8;
}

.gateway-list {
  background: white;
  border-radius: 15rpx;
  overflow: hidden;
}

.gateway-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.2s;
}

.gateway-item:last-child {
  border-bottom: none;
}

.gateway-item:active {
  background-color: #f8f8f8;
}

.gateway-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.gateway-color {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  align-self: center;
}

.gateway-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.gateway-header-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.gateway-sn {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.device-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48rpx;
  height: 36rpx;
  padding: 0 12rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 18rpx;
  box-shadow: 0 2rpx 6rpx rgba(102, 126, 234, 0.3);
}

.gateway-remark {
  font-size: 26rpx;
  color: #666;
  margin-top: 4rpx;
  line-height: 1.4;
}

.gateway-remark.empty {
  color: #bbb;
  font-style: italic;
}

.gateway-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
  margin-left: 20rpx;
}

.gateway-actions {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.action-btn.edit {
  background: rgba(102, 126, 234, 0.1);
}

.action-btn.edit:active {
  background: rgba(102, 126, 234, 0.2);
  transform: scale(0.95);
}

.action-btn.delete {
  background: rgba(255, 71, 87, 0.1);
}

.action-btn.delete:active {
  background: rgba(255, 71, 87, 0.2);
  transform: scale(0.95);
}

.action-icon {
  font-size: 32rpx;
  line-height: 1;
}

.arrow {
  color: #ccc;
  font-size: 24rpx;
  margin-left: 4rpx;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600rpx;
  background: white;
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.modal-body {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 15rpx;
  flex-wrap: wrap;
}

.color-option {
  width: 60rpx;
  height: 60rpx;
  border-radius: 10rpx;
  border: 2rpx solid transparent;
  cursor: pointer;
}

.color-option.active {
  border-color: #333;
  transform: scale(1.1);
}

.color-input {
  flex: 1;
  min-width: 200rpx;
  height: 60rpx;
  padding: 0 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  height: 90rpx;
  border: none;
  font-size: 32rpx;
  border-radius: 0;
}

.modal-btn.cancel {
  background: #f5f5f5;
  color: #666;
  border-right: 1rpx solid #f0f0f0;
}

.modal-btn.confirm {
  background: #667eea;
  color: white;
}

.modal-btn:active {
  opacity: 0.8;
}

/* 未上传数据提示 */
.unsynced-notice {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
  background: linear-gradient(135deg, #ff9800 0%, #ff6b35 100%);
  border-radius: 15rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 152, 0, 0.3);
}

.unsynced-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.unsynced-text {
  flex: 1;
  font-size: 28rpx;
  color: white;
  font-weight: 500;
}

.unsynced-arrow {
  font-size: 24rpx;
  color: white;
  opacity: 0.8;
}
</style>


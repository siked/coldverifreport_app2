<template>
  <view class="device-list-container">
    <!-- 网关信息头部 -->
    <view class="gateway-header">
      <view class="gateway-info">
        <view class="gateway-color" :style="{ backgroundColor: gatewayColor }"></view>
        <view class="gateway-info-content">
          <text class="gateway-sn">{{ gatewaySn }}</text>
          <text class="gateway-remark" v-if="gatewayRemark">{{ gatewayRemark }}</text>
        </view>
      </view>
      <view class="gateway-actions">
        <view class="action-btn edit" @click.stop="editGateway">
          <text class="action-icon">✏️</text>
          <text class="action-text">编辑</text>
        </view>
        <view class="action-btn delete" @click.stop="deleteGateway">
          <text class="action-icon">🗑️</text>
          <text class="action-text">删除</text>
        </view>
      </view>
    </view>

    <!-- 添加设备按钮 -->
    <view class="add-button-section">
      <button class="add-btn" @click="showAddDeviceModal">+ 添加设备</button>
    </view>

    <!-- 设备列表 -->
    <view class="device-list" v-if="deviceList.length > 0">
      <view 
        class="device-item" 
        v-for="(device, index) in deviceList" 
        :key="index"
      >
        <view class="device-left">
          <text class="device-icon">📱</text>
          <text class="device-sn">{{ device }}</text>
        </view>
        <view class="device-right">
          <text class="action-btn edit" @click="editDevice(index)">编辑</text>
          <text class="action-btn delete" @click="deleteDevice(index)">删除</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-text">暂无设备，点击上方按钮添加</text>
    </view>

    <!-- 添加/编辑设备弹窗 -->
    <view class="modal-overlay" v-if="showModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingIndex !== null ? '编辑设备' : '添加设备' }}</text>
          <text class="modal-close" @click="closeModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">设备SN *</text>
            <input 
              class="form-input" 
              v-model="formData.deviceSn" 
              placeholder="请输入设备SN"
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closeModal">取消</button>
          <button class="modal-btn confirm" @click="saveDevice">保存</button>
        </view>
      </view>
    </view>

    <!-- 编辑网关弹窗 -->
    <view class="modal-overlay" v-if="showGatewayModal" @click="showGatewayModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">编辑网关</text>
          <text class="modal-close" @click="showGatewayModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">颜色</text>
            <view class="color-picker">
              <view 
                class="color-option" 
                v-for="color in colorOptions" 
                :key="color"
                :class="{ active: gatewayFormData.color === color }"
                :style="{ backgroundColor: color }"
                @click="gatewayFormData.color = color"
              ></view>
              <input 
                class="color-input" 
                v-model="gatewayFormData.color" 
                placeholder="#667eea"
                type="text"
              />
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">备注</text>
            <input 
              class="form-input" 
              v-model="gatewayFormData.remark" 
              placeholder="请输入备注信息"
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="showGatewayModal = false">取消</button>
          <button class="modal-btn confirm" @click="saveGatewayEdit">保存</button>
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
      gatewayIndex: -1,
      gatewaySn: '',
      gatewayColor: '#667eea',
      gatewayRemark: '',
      deviceList: [],
      showModal: false,
      editingIndex: null,
      formData: {
        deviceSn: ''
      },
      allGatewayList: [],
      showGatewayModal: false,
      gatewayFormData: {
        color: '#667eea',
        remark: ''
      },
      colorOptions: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea']
    }
  },

  onLoad(options) {
    if (options.gatewayIndex !== undefined) {
      this.gatewayIndex = parseInt(options.gatewayIndex)
    }
    if (options.gatewaySn) {
      this.gatewaySn = decodeURIComponent(options.gatewaySn)
    }
    this.loadDeviceList()
  },

  methods: {
    // 加载设备列表（从缓存读取）
    loadDeviceList() {
      try {
        this.allGatewayList = storageManager.getGatewayDeviceSnList()
        
        // 找到对应的网关
        const gateway = this.allGatewayList.find((g, index) => {
          if (this.gatewayIndex >= 0) {
            return index === this.gatewayIndex
          } else {
            return g.gatewaySn === this.gatewaySn
          }
        })
        
        if (gateway) {
          this.gatewaySn = gateway.gatewaySn
          this.gatewayColor = gateway.color || '#667eea'
          this.gatewayRemark = gateway.remark || ''
          this.deviceList = gateway.deviceSnList || []
          
          // 更新索引
          this.gatewayIndex = this.allGatewayList.findIndex(g => g.gatewaySn === gateway.gatewaySn)
        } else {
          uni.showToast({
            title: '网关不存在',
            icon: 'none'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (error) {
        console.error('加载设备列表失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    // 显示添加设备弹窗
    showAddDeviceModal() {
      this.editingIndex = null
      this.formData = {
        deviceSn: ''
      }
      this.showModal = true
    },

    // 显示编辑设备弹窗
    showEditDeviceModal(index) {
      this.editingIndex = index
      this.formData = {
        deviceSn: this.deviceList[index]
      }
      this.showModal = true
    },

    // 关闭弹窗
    closeModal() {
      this.showModal = false
      this.editingIndex = null
    },

    // 保存设备
    async saveDevice() {
      if (!this.formData.deviceSn.trim()) {
        uni.showToast({
          title: '请输入设备SN',
          icon: 'none'
        })
        return
      }

      try {
        let newList = [...this.allGatewayList]
        let gateway = newList[this.gatewayIndex]
        let newDeviceList = [...(gateway.deviceSnList || [])]
        
        if (this.editingIndex !== null) {
          // 编辑模式
          newDeviceList[this.editingIndex] = this.formData.deviceSn.trim()
        } else {
          // 添加模式
          // 检查是否已存在相同设备SN
          if (newDeviceList.includes(this.formData.deviceSn.trim())) {
            uni.showToast({
              title: '该设备SN已存在',
              icon: 'none'
            })
            return
          }
          
          newDeviceList.push(this.formData.deviceSn.trim())
        }

        // 更新网关的设备列表
        gateway.deviceSnList = newDeviceList
        newList[this.gatewayIndex] = gateway

        uni.showLoading({ title: '保存中...' })
        const result = await apiService.updateGatewayDevices(newList)
        uni.hideLoading()
        
        this.deviceList = newDeviceList
        this.allGatewayList = newList
        this.closeModal()
        
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

    // 删除设备
    deleteDevice(index) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除设备 ${this.deviceList[index]} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              let newList = [...this.allGatewayList]
              let gateway = newList[this.gatewayIndex]
              let newDeviceList = [...(gateway.deviceSnList || [])]
              newDeviceList.splice(index, 1)
              
              // 更新网关的设备列表
              gateway.deviceSnList = newDeviceList
              newList[this.gatewayIndex] = gateway
              
              uni.showLoading({ title: '删除中...' })
              const result = await apiService.updateGatewayDevices(newList)
              uni.hideLoading()
              
              this.deviceList = newDeviceList
              this.allGatewayList = newList
              
              if (result && result.cached) {
                uni.showToast({
                  title: '已保存到本地，等待网络恢复后上传',
                  icon: 'none',
                  duration: 2000
                })
              } else {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
              }
            } catch (error) {
              uni.hideLoading()
              uni.showToast({
                title: error.message || '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    // 编辑设备
    editDevice(index) {
      this.showEditDeviceModal(index)
    },

    // 编辑网关
    editGateway() {
      console.log('点击编辑网关')
      this.showEditGatewayModal()
    },

    // 显示编辑网关弹窗
    showEditGatewayModal() {
      console.log('显示编辑网关弹窗', this.gatewayColor, this.gatewayRemark)
      this.showGatewayModal = true
      this.gatewayFormData = {
        color: this.gatewayColor || '#667eea',
        remark: this.gatewayRemark || ''
      }
      console.log('showGatewayModal:', this.showGatewayModal)
      console.log('gatewayFormData:', this.gatewayFormData)
    },

    // 保存网关编辑
    async saveGatewayEdit() {
      try {
        let newList = [...this.allGatewayList]
        let gateway = newList[this.gatewayIndex]
        
        gateway.color = this.gatewayFormData.color || '#667eea'
        gateway.remark = this.gatewayFormData.remark || ''
        newList[this.gatewayIndex] = gateway

        uni.showLoading({ title: '保存中...' })
        const result = await apiService.updateGatewayDevices(newList)
        uni.hideLoading()
        
        this.allGatewayList = newList
        this.gatewayColor = gateway.color
        this.gatewayRemark = gateway.remark
        this.showGatewayModal = false
        
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

    // 删除网关
    deleteGateway() {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除网关 ${this.gatewaySn} 吗？删除后该网关下的所有设备也将被删除。`,
        success: async (res) => {
          if (res.confirm) {
            try {
              let newList = [...this.allGatewayList]
              newList.splice(this.gatewayIndex, 1)
              
              uni.showLoading({ title: '删除中...' })
              const result = await apiService.updateGatewayDevices(newList)
              uni.hideLoading()
              
              if (result && result.cached) {
                uni.showToast({
                  title: '已保存到本地，等待网络恢复后上传',
                  icon: 'none',
                  duration: 2000
                })
              } else {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
              }
              
              // 返回上一页
              setTimeout(() => {
                uni.navigateBack()
              }, 1000)
            } catch (error) {
              uni.hideLoading()
              uni.showToast({
                title: error.message || '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.device-list-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.gateway-header {
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.gateway-info {
  display: flex;
  align-items: center;
}

.gateway-color {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.1);
}

.gateway-sn {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.gateway-remark {
  display: block;
  font-size: 26rpx;
  color: #999;
}

.gateway-actions {
  display: flex;
  gap: 12rpx;
  align-items: center;
  margin-left: 20rpx;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  z-index: 10;
}

.action-btn.edit {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.action-btn.edit:active {
  background: rgba(102, 126, 234, 0.2);
  transform: scale(0.95);
}

.action-btn.delete {
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
}

.action-btn.delete:active {
  background: rgba(255, 71, 87, 0.2);
  transform: scale(0.95);
}

.action-icon {
  font-size: 28rpx;
  line-height: 1;
}

.action-text {
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1;
}

.add-button-section {
  margin-bottom: 30rpx;
}

.add-btn {
  width: 100%;
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

.device-list {
  background: white;
  border-radius: 15rpx;
  overflow: hidden;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.device-item:last-child {
  border-bottom: none;
}

.device-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.device-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.device-sn {
  font-size: 30rpx;
  color: #333;
}

.device-right {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  border-radius: 8rpx;
  border: 1rpx solid #ddd;
  background: white;
  color: #666;
}

.action-btn.edit {
  color: #667eea;
  border-color: #667eea;
}

.action-btn.delete {
  color: #ff4757;
  border-color: #ff4757;
}

.action-btn:active {
  opacity: 0.7;
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
</style>


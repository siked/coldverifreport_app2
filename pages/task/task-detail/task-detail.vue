<template>
  <view class="task-detail-container">

    <!-- 任务基本信息 -->
    <view class="task-info-card">
      <view class="info-item">
        <text class="info-label">任务编号</text>
        <text class="info-value">{{ taskInfo.taskNo }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">任务名称</text>
        <text class="info-value">{{ taskInfo.taskName }}</text>
      </view>
      <!-- 调试信息 -->
      <view class="info-item debug-info">
        <text class="info-label">标签数量</text>
        <text class="info-value">{{ formattedTags.length }}个</text>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'tags' }"
        @click="activeTab = 'tags'"
      >
        <text class="tab-text">标签列表</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'devices' }"
        @click="activeTab = 'devices'"
      >
        <text class="tab-text">设备列表</text>
      </view>
    </view>

    <!-- 标签列表 -->
    <view v-if="activeTab === 'tags'" class="tags-section">
      <view class="section-header">
        <text class="section-title">标签列表</text>
      </view>
      
      <view class="tags-list">
        <block v-if="formattedTags && formattedTags.length > 0">
          <view 
            v-for="(tag, index) in formattedTags" 
            :key="tag._id" 
            class="tag-item-card"
          >
            <view class="tag-header">
              <text 
                class="tag-name clickable" 
                @click="focusInput(index)"
              >{{ tag.name }}</text>
              <text class="tag-type">{{ getTagTypeName(tag.type) }}</text>
            </view>
            <view class="tag-content">
              <!-- 文本输入 -->
              <view v-if="tag.type === 'text'" class="input-wrapper">
                <input 
                  :ref="'input_' + index"
                  :value="tag.value" 
                  @input="updateTagValue(index, $event.detail ? $event.detail.value : ($event.target ? $event.target.value : ''))"
                  @focus="onInputFocus(index)"
                  @blur="onInputBlur(index)"
                  class="tag-input tag-input-text"
                  placeholder="请输入文本内容"
                />
              </view>
              
              <!-- 数字输入 -->
              <view v-else-if="tag.type === 'number'" class="input-wrapper">
                <input 
                  :ref="'input_' + index"
                  :value="tag.value" 
                  @input="updateTagValue(index, $event.detail ? $event.detail.value : ($event.target ? $event.target.value : ''))"
                  @focus="onInputFocus(index)"
                  @blur="onInputBlur(index)"
                  class="tag-input tag-input-number"
                  type="number"
                  step="0.1"
                  placeholder="请输入数字"
                />
              </view>
              
              <!-- 日期时间选择（格式：YYYY-MM-DD HH:MM），日期使用自定义滚轮 -->
              <view v-else-if="tag.type === 'datetime'" class="input-wrapper">
                <view class="datetime-picker-row">
                  <view
                    class="picker-display"
                    :class="{'picker-placeholder': !getDatePart(tag.value)}"
                    @click="openDateWheel(index, 'datetime')"
                  >
                    {{ getDatePart(tag.value) || '请选择日期' }}
                  </view>
                  <view
                    class="picker-display"
                    :class="{'picker-placeholder': !getTimePart(tag.value)}"
                    @click="openTimeWheel(index)"
                  >
                    {{ getTimePart(tag.value) || '请选择时间' }}
                  </view>
                </view>
              </view>
              
              <!-- 日期选择（格式：YYYY-MM-DD） -->
              <view v-else-if="tag.type === 'date'" class="input-wrapper">
                <view class="datetime-picker-row">
                  <view
                    class="picker-display"
                    :class="{'picker-placeholder': !tag.value}"
                    @click="openDateWheel(index, 'date')"
                  >
                    {{ tag.value || '请选择日期' }}
                  </view>
                </view>
              </view>
              
              <!-- 布点区域显示 -->
              <view v-else-if="tag.type === 'location'" class="location-wrapper">
                <view class="location-content">
                  <view v-if="getLocationArray(tag.value).length > 0" class="location-tags">
                    <view 
                      v-for="(location, locIndex) in getLocationArray(tag.value)" 
                      :key="locIndex" 
                      class="location-tag"
                    >
                      <text class="location-tag-text">{{ location }}</text>
                      <view 
                        class="location-tag-remove" 
                        @click="removeLocation(index, locIndex)"
                      >
                        <text class="remove-icon">×</text>
                      </view>
                    </view>
                  </view>
                  <view v-else class="location-empty">
                    <text class="location-empty-text">暂无布点</text>
                  </view>
                </view>
                <button class="add-location-btn" @click="showAddLocationModal(index)">
                  <text class="btn-icon">+</text>
                  <text class="btn-text">添加布点</text>
                </button>
                
                <!-- 添加布点弹窗 -->
                <view v-if="showLocationModal && currentEditingIndex === index" class="modal-overlay" @click="hideLocationModal">
                  <view class="modal-content" @click.stop>
                    <view class="modal-header">
                      <text class="modal-title">添加布点</text>
                      <text class="modal-close" @click="hideLocationModal">×</text>
                    </view>
                    <view class="modal-body">
                      <input 
                        v-model="locationInputValue"
                        class="modal-input"
                        placeholder="输入布点区域，支持范围格式如: 001-010 或 001~010"
                        @confirm="confirmLocationInput"
                      />
                      <view class="modal-help">
                        <text class="modal-help-title">支持格式：</text>
                        <text class="modal-help-item">格式1: C001 到 C010 或 C001到C010</text>
                        <text class="modal-help-item">格式2: C001-C010</text>
                        <text class="modal-help-item">格式3: 001~010</text>
                      </view>
                    </view>
                    <view class="modal-footer">
                      <button class="modal-cancel-btn" @click="hideLocationModal">取消</button>
                      <button class="modal-confirm-btn" @click="confirmLocationInput">确定</button>
                    </view>
                  </view>
                </view>
              </view>
              
              <!-- 布尔值显示 -->
              <view v-else-if="tag.type === 'boolean'" class="boolean-wrapper">
                <view class="boolean-content">
                  <switch 
                    :checked="tag.value" 
                    @change="updateTagValue(index, $event.target.checked)"
                    class="boolean-switch"
                    color="#667eea"
                  />
                  <text class="boolean-label">{{ tag.value ? '是' : '否' }}</text>
                </view>
              </view>
              
              <!-- 图片类型显示 --> 
              <view v-else-if="tag.type === 'image'" class="image-wrapper">
                <view 
                  v-if="tag.value || tag.localImagePath" 
                  class="image-content" 
                  @click="previewImage(tag.value || tag.localImagePath)"
                >
                  <image :src="tag.localImagePath || tag.value" class="image-preview" mode="aspectFit"></image>
                  <view class="image-overlay">
                    <text class="image-hint">
                      {{ tag.value ? '点击查看大图' : '本地图片，待上传' }}
                    </text>
                  </view>
                </view>
                <view v-else class="image-empty">
                  <text class="image-empty-text">暂无图片</text>
                </view>

                <view class="image-actions">
                  <button 
                    class="image-upload-btn" 
                    @click="chooseAndUploadImage(index)"
                  >
                    选择图片并上传
                  </button>
                </view>

                <view v-if="tag.value" class="image-url-wrapper">
                  <text class="image-url">{{ tag.value }}</text>
                </view>
              </view>
              
              <!-- 默认显示 -->
              <view v-else class="default-wrapper">
                <text class="default-value">{{ tag.value || '暂无数据' }}</text>
              </view>
            </view>

          </view>
        </block>
        <view v-else class="no-tags">
          <text class="no-tags-text">暂无标签</text>
        </view>
      </view>
    </view>

    <!-- 设备列表 -->
    <view v-else class="tags-section">
      <view class="section-header devices-header">
        <text class="section-title">设备列表</text>
        <view class="device-header-actions">
          <button class="realtime-btn" @click="goRealtimeData">
            <text class="btn-icon">📈</text>
            <text class="btn-text">曲线图</text>
          </button>
          <button class="add-device-btn-inline" @click="showAddDeviceMenu">
            <text class="btn-icon">+</text>
            <text class="btn-text">添加设备</text>
          </button>
        </view>
      </view>

      <view class="devices-list">
        <block v-if="sortedDeviceSnList.length > 0">
          <view v-for="(item, index) in sortedDeviceSnList" :key="item.__key" class="device-item-card">
            <view class="device-row">
              <view class="device-field device-field-id">
                <input
                  class="device-input"
                  :value="item.deviceId"
                  placeholder="001 / A01"
                  @input="onDeviceFieldInput(item.__key, 'deviceId', $event.detail ? $event.detail.value : ($event.target ? $event.target.value : ''))"
                />
              </view>
              <view class="device-field device-field-sn">
                
                <input
                  class="device-input"
                  :value="item.deviceSn"
                  placeholder="202600000000001"
                  @input="onDeviceFieldInput(item.__key, 'deviceSn', $event.detail ? $event.detail.value : ($event.target ? $event.target.value : ''))"
                />
              </view>
              <view class="device-action-col">
                <button class="device-del-chip" @click="removeDevice(item.__key)" aria-label="删除设备">
                  <text class="device-del-text">X</text>
                </button>
              </view>
            </view>
          </view>
        </block>
        <view v-else class="no-tags">
          <text class="no-tags-text">暂无设备</text>
        </view>

      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions-section">
      <button
        class="action-btn primary"
        :disabled="isSaveDisabled"
        @click="saveTags"
      >
        保存标签
      </button>
      <button class="action-btn secondary" @click="goBack">返回</button>
    </view>
  </view>
  
  <!-- 日期滚轮选择弹窗 -->
  <view v-if="showDateWheel" class="modal-overlay" @click="closeDateWheel">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">选择日期</text>
        <text class="modal-close" @click="closeDateWheel">×</text>
      </view>
      <view class="modal-body">
        <picker-view
          class="date-wheel-picker-view"
          :indicator-style="dateWheelIndicatorStyle"
          :value="dateWheelValue"
          @change="onDateWheelChange"
        >
          <picker-view-column>
            <view
              class="date-wheel-item"
              v-for="(item, index) in dateWheelYears"
              :key="'year-' + index"
            >
              {{ item }}年
            </view>
          </picker-view-column>
          <picker-view-column>
            <view
              class="date-wheel-item"
              v-for="(item, index) in dateWheelMonths"
              :key="'month-' + index"
            >
              {{ item }}月
            </view>
          </picker-view-column>
          <picker-view-column>
            <view
              class="date-wheel-item"
              v-for="(item, index) in dateWheelDays"
              :key="'day-' + index"
            >
              {{ item }}日
            </view>
          </picker-view-column>
        </picker-view>
      </view>
      <view class="modal-footer">
        <button class="modal-cancel-btn" @click="closeDateWheel">取消</button>
        <button class="modal-today-btn" @click="selectToday">今天</button>
        <button class="modal-confirm-btn" @click="confirmDateWheel">确定</button>
      </view>
    </view>
  </view>

  <!-- 添加设备菜单弹窗 -->
  <view v-if="showAddDeviceMenuModal" class="modal-overlay" @click="hideAddDeviceMenu">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">添加设备</text>
        <text class="modal-close" @click="hideAddDeviceMenu">×</text>
      </view>
      <view class="modal-body">
        <view class="menu-option" @click="handleScanAdd">
          <text class="menu-icon">📷</text>
          <text class="menu-text">扫码添加</text>
        </view>
        <view class="menu-option" @click="handleDirectAddDevice">
          <text class="menu-icon">➕</text>
          <text class="menu-text">添加设备</text>
        </view>
        <view class="menu-option" @click="handleAddGateway">
          <text class="menu-icon">🌐</text>
          <text class="menu-text">添加网关</text>
        </view>
      </view>
      <view class="modal-footer">
        <button class="modal-cancel-btn" @click="hideAddDeviceMenu">取消</button>
      </view>
    </view>
  </view>

  <!-- 添加网关弹窗 -->
  <view v-if="showAddGatewayModal" class="modal-overlay" @click="hideAddGatewayModal">
    <view class="modal-content gateway-modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">添加网关</text>
        <text class="modal-close" @click="hideAddGatewayModal">×</text>
      </view>
      <view class="modal-body">
        <view class="gateway-input-wrapper">
          <text class="gateway-label">网关SN</text>
          <input 
            v-model="gatewaySnInput"
            class="gateway-input"
            placeholder="请输入网关SN，例如：W00001"
            maxlength="20"
            @input="onGatewaySnInput"
          />
          <view class="gateway-hint">
            <text class="hint-icon">💡</text>
            <text class="hint-text">网关SN必须以字母 W 开头</text>
          </view>
        </view>
      </view>
      <view class="modal-footer">
        <button class="modal-cancel-btn" @click="hideAddGatewayModal">取消</button>
        <button class="modal-confirm-btn" @click="confirmAddGateway" :disabled="!isGatewaySnValid">确定</button>
      </view>
    </view>
  </view>

  <!-- 时间滚轮选择弹窗 -->
  <view v-if="showTimeWheel" class="modal-overlay" @click="closeTimeWheel">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">选择时间</text>
        <text class="modal-close" @click="closeTimeWheel">×</text>
      </view>
      <view class="modal-body">
        <picker-view
          class="time-wheel-picker-view"
          :indicator-style="timeWheelIndicatorStyle"
          :value="timeWheelValue"
          @change="onTimeWheelChange"
        >
          <picker-view-column>
            <view
              class="time-wheel-item"
              v-for="(item, index) in timeWheelHours"
              :key="'hour-' + index"
            >
              {{ String(item).padStart(2, '0') }} 时
            </view>
          </picker-view-column>
          <picker-view-column>
            <view
              class="time-wheel-item"
              v-for="(item, index) in timeWheelMinutes"
              :key="'minute-' + index"
            >
              {{ String(item).padStart(2, '0') }} 分
            </view>
          </picker-view-column>
        </picker-view>
      </view>
      <view class="modal-footer">
        <button class="modal-cancel-btn" @click="closeTimeWheel">取消</button>
        <button class="modal-today-btn" @click="selectCurrentTime">当前时间</button>
        <button class="modal-confirm-btn" @click="confirmTimeWheel">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
import apiService from "@/common/api.js"
import storageManager from "@/common/storage.js"
import permision from "@/common/permission.js"

export default {
  // H5 下路由可能会把 query/params 作为 attrs 传进来，这里关闭自动透传以避免 warning
  inheritAttrs: false,
  data() {
    return {
      taskId: '',
      taskInfo: {
        _id: '',
        taskNo: '',
        taskName: '',
        templateName: '',
        tags: [],
        // 是否存在“已修改但未提交”的标签
        hasUnsavedTags: false
      },
      formattedTags: [],
      // Tab
      activeTab: 'tags', // 'tags' | 'devices'
      // deviceSnList（本地可编辑，写入缓存并随保存提交）
      deviceSnList: [],
      // 初始标签数据快照，用于判断是否有改动
      originalTagsSnapshot: [],
      // 初始设备列表快照，用于判断是否有改动
      originalDeviceSnapshot: [],
      currentScrollTop: 0,
      currentEditingIndex: -1,
      showLocationModal: false,
      locationInputValue: '',
      autoSaveTimer: null,
      categoryId: '',
      hasLoadedFromCache: false,
      lastCacheTimestamp: null,
      // 日期滚轮选择相关
      showDateWheel: false,
      dateWheelTargetIndex: -1,
      dateWheelTargetType: '', // 'date' 或 'datetime'
      dateWheelYears: [],
      dateWheelMonths: [],
      dateWheelDays: [],
      dateWheelValue: [0, 0, 0],
      dateWheelIndicatorStyle: 'height: 50px;',
      // 时间滚轮选择相关
      showTimeWheel: false,
      timeWheelTargetIndex: -1, // 仅针对 datetime
      timeWheelHours: [],
      timeWheelMinutes: [],
      timeWheelValue: [0, 0],
      timeWheelIndicatorStyle: 'height: 50px;',
      // 添加设备菜单弹窗
      showAddDeviceMenuModal: false,
      // 添加网关弹窗
      showAddGatewayModal: false,
      gatewaySnInput: ''
    }
  },
  computed: {
    // 格式化location类型的显示值
    formattedLocationValue() {
      return (value) => {
        if (typeof value === 'string') {
          return value;
        } else if (Array.isArray(value)) {
          return value.join(',');
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
        // 没有快照但有标签，认为是有改动
        return true;
      }
      const currentSnapshot = this.formattedTags.map(tag => ({
        _id: tag._id,
        value: tag.value
      }));
      try {
        return JSON.stringify(currentSnapshot) !== JSON.stringify(this.originalTagsSnapshot);
      } catch (e) {
        console.warn('比较标签快照失败:', e);
        return true;
      }
    },
    // 是否有设备列表发生改动
    hasDeviceChanges() {
      const currentSnapshot = (this.deviceSnList || []).map(d => ({
        deviceId: (d && d.deviceId) ? String(d.deviceId) : '',
        deviceSn: (d && d.deviceSn) ? String(d.deviceSn) : ''
      }));
      try {
        return JSON.stringify(currentSnapshot) !== JSON.stringify(this.originalDeviceSnapshot || []);
      } catch (e) {
        console.warn('比较设备快照失败:', e);
        return true;
      }
    },
    // 展示用：按 deviceId 自动排序（字母+数字混排），并附加稳定 key
    sortedDeviceSnList() {
      const list = Array.isArray(this.deviceSnList) ? this.deviceSnList : [];
      const withKey = list.map((d, idx) => ({
        __key: d && d.__key ? d.__key : `dev_${idx}`,
        deviceId: d && d.deviceId !== undefined ? d.deviceId : '',
        deviceSn: d && d.deviceSn !== undefined ? d.deviceSn : ''
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
    },
    // 检查网关SN是否有效
    isGatewaySnValid() {
      const sn = this.gatewaySnInput.trim();
      return sn.length > 0 && sn.toUpperCase().startsWith('W');
    }
  },



  onLoad(options) {
    console.log('任务详情页面加载中...', options);
    
    this.taskId = options.taskId;
    
    // 确保taskInfo被正确初始化
    this.taskInfo = {
      _id: options.taskId || '',
      taskNo: decodeURIComponent(options.taskNo || ''),
      taskName: decodeURIComponent(options.taskName || ''),
      templateName: '温度验证模板',
      tags: []
    };
    
    // 尝试从参数中获取分类ID
    if (options.categoryId) {
      this.categoryId = options.categoryId;
    }
    

    
    // 检查是否有来自上一级页面传递的tags参数
    let hasParameterTags = false;
    let parameterTagsData = null;
    if (options.tags) {
      try {
        parameterTagsData = JSON.parse(decodeURIComponent(options.tags));
        hasParameterTags = true;
        console.log('从参数接收到tags数据:', parameterTagsData);
      } catch (e) {
        console.warn('解析tags参数失败:', e);
      }
    }
    
    // 优先级策略：如果有参数tags，优先使用参数数据（因为可能有更新）
    if (hasParameterTags) {
      console.log('检测到参数tags，使用参数数据覆盖缓存');
      this.processTagsData(parameterTagsData);
      this.hasLoadedFromCache = false;
      
      
    } else {
      // 检查分类任务列表中的缓存
      if (!this.checkCategoryTasksCache()) {
        // 如果没有参数tags且缓存为空，则尝试从API加载
        this.useCachedOrLoadFromAPI();
      }
    }
    
    console.log('任务详情页面加载完成', this.taskInfo, this.formattedTags);
    
    // 延迟检查缓存数据是否正确加载
    this.$nextTick(() => {
      setTimeout(() => {
        console.log('页面加载完成延迟检查:', {
          taskInfo: this.taskInfo,
          formattedTags: this.formattedTags,
          tagCount: this.formattedTags ? this.formattedTags.length : 0
        });
      }, 500);
    });
  },

  onReady() {
    // 页面渲染完成后，恢复上次的滚动位置
    this.$nextTick(() => {
      setTimeout(() => {
        this.restoreScrollPosition();
      }, 100);
    });
  },

  onShow() {
    // 页面显示时，检查是否有更新的缓存数据
    // 这样当用户从其他页面返回时，可以获取最新的编辑数据
    this.checkCategoryTasksCache();
    
    // 同时恢复滚动位置
    this.$nextTick(() => {
      setTimeout(() => {
        this.restoreScrollPosition();
      }, 100);
    });
  },

  onPullDownRefresh() {
    // 下拉刷新时询问是否从服务器获取最新数据
    uni.showModal({
      title: '更新数据',
      content: '是否从服务器获取最新数据？',
      confirmText: '更新',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 强制从服务器刷新数据
          this.hasLoadedFromCache = false;
          this.loadTaskFromAPI(true).finally(() => {
            uni.stopPullDownRefresh();
          });
        } else {
          // 用户取消更新，停止刷新动画
          uni.stopPullDownRefresh();
        }
      },
      fail: () => {
        // 显示模态失败也需要停止刷新动画
        uni.stopPullDownRefresh();
      }
    });
  },

  onPageScroll(e) {
    // 监听页面滚动事件
    this.currentScrollTop = e.scrollTop || 0;
  },

  onHide() {
    // 页面隐藏时保存当前滚动位置
    this.saveScrollPosition();
  },
  
  onUnload() {
    // 页面卸载时保存滚动位置
    this.saveScrollPosition();
  },

  methods: {
    // 设备列表排序：支持字母+数字混排（例如 A2 < A10）
    sortDeviceSnList(list) {
      if (!Array.isArray(list)) return [];
      return [...list].sort((a, b) => {
        const aValue = (a && a.deviceId !== undefined) ? String(a.deviceId).trim() : '';
        const bValue = (b && b.deviceId !== undefined) ? String(b.deviceId).trim() : '';
        
        // 空 deviceId 的设备排在最后（新添加的设备）
        if (aValue === '' && bValue !== '') return 1;
        if (aValue !== '' && bValue === '') return -1;
        if (aValue === '' && bValue === '') return 0; // 两个都为空，保持原顺序
        
        // 都有值，按 deviceId 排序
        return aValue.localeCompare(bValue, 'zh-CN', { numeric: true, sensitivity: 'base' });
      });
    },
    // 更新设备快照
    updateOriginalDeviceSnapshot() {
      const current = (this.deviceSnList || []).map(d => ({
        deviceId: d && d.deviceId !== undefined ? String(d.deviceId) : '',
        deviceSn: d && d.deviceSn !== undefined ? String(d.deviceSn) : ''
      }));
      this.originalDeviceSnapshot = current;
    },
    // 从缓存任务对象加载 deviceSnList
    loadDeviceSnListFromTask(task) {
      const raw = task && Array.isArray(task.deviceSnList) ? task.deviceSnList : [];
      // 内部加 __key 方便稳定定位
      this.deviceSnList = raw.map((d, idx) => ({
        __key: `dev_${idx}`,
        deviceId: d && d.deviceId !== undefined ? d.deviceId : '',
        deviceSn: d && d.deviceSn !== undefined ? d.deviceSn : ''
      }));
      this.updateOriginalDeviceSnapshot();
    },
    // 生成下一个递增的deviceId
    generateNextDeviceId() {
      const list = this.deviceSnList || [];
      const nonEmptyDeviceIds = list
        .map(d => d && d.deviceId ? String(d.deviceId).trim() : '')
        .filter(id => id !== '');
      
      if (nonEmptyDeviceIds.length === 0) {
        // 如果没有现有设备，返回默认值
        return '001';
      }
      
      // 解析deviceId格式：可能是纯数字（如001）或字母+数字（如C001）
      const parsed = nonEmptyDeviceIds.map(id => {
        const match = id.match(/^([A-Za-z]*)(\d+)$/);
        if (match) {
          return {
            prefix: match[1] || '',
            number: parseInt(match[2], 10),
            original: id,
            padding: match[2].length // 保持前导零的长度
          };
        }
        // 如果格式不匹配，尝试作为纯数字处理
        const numMatch = id.match(/^(\d+)$/);
        if (numMatch) {
          return {
            prefix: '',
            number: parseInt(numMatch[1], 10),
            original: id,
            padding: numMatch[1].length
          };
        }
        return null;
      }).filter(p => p !== null);
      
      if (parsed.length === 0) {
        return '001';
      }
      
      // 找出相同前缀中的最大值，如果没有前缀则找所有中的最大值
      // 优先使用最常见的前缀（出现次数最多的）
      const prefixGroups = {};
      parsed.forEach(p => {
        const key = p.prefix;
        if (!prefixGroups[key]) {
          prefixGroups[key] = [];
        }
        prefixGroups[key].push(p);
      });
      
      // 找出出现次数最多的前缀
      let maxCount = 0;
      let mostCommonPrefix = '';
      Object.keys(prefixGroups).forEach(prefix => {
        if (prefixGroups[prefix].length > maxCount) {
          maxCount = prefixGroups[prefix].length;
          mostCommonPrefix = prefix;
        }
      });
      
      // 在最常见前缀组中找最大值
      const targetGroup = prefixGroups[mostCommonPrefix] || parsed;
      const maxItem = targetGroup.reduce((max, current) => {
        return current.number > max.number ? current : max;
      });
      
      // 递增数字部分
      const nextNumber = maxItem.number + 1;
      // 保持前导零的长度（至少3位）
      const padding = Math.max(maxItem.padding, 3);
      const nextNumberStr = String(nextNumber).padStart(padding, '0');
      
      return `${maxItem.prefix}${nextNumberStr}`;
    },
    addDevice() {
      const nextDeviceId = this.generateNextDeviceId();
      const newItem = {
        __key: `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        deviceId: nextDeviceId,
        deviceSn: ''
      };
      this.deviceSnList = [...(this.deviceSnList || []), newItem];
      this.updateCacheData();
    },
    removeDevice(key) {
      this.deviceSnList = (this.deviceSnList || []).filter(d => d.__key !== key);
      this.updateCacheData();
    },
    onDeviceFieldInput(key, field, value) {
      const safeValue = value !== undefined && value !== null ? value : '';
      const list = (this.deviceSnList || []).map(d => {
        if (d.__key === key) {
          return { ...d, [field]: safeValue };
        }
        return d;
      });
      this.deviceSnList = list;
      this.updateCacheData();
    },
    // 获取当前网络类型（Promise 封装）
    getNetworkType() {
      return new Promise((resolve) => {
        if (!uni || !uni.getNetworkType) {
          resolve('unknown');
          return;
        }
        uni.getNetworkType({
          success: (res) => {
            resolve(res.networkType || 'unknown');
          },
          fail: () => {
            resolve('unknown');
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

        // #ifdef APP-PLUS
        try {
          plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
            const fileName = Date.now() + '_' + (entry.name || 'image.jpg');
            plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
              fs.root.getDirectory('taskImages', { create: true }, (dir) => {
                // 复制到 _doc/taskImages 目录，避免临时目录在重启后失效
                entry.copyTo(
                  dir,
                  fileName,
                  (newEntry) => {
                    const localUrl = newEntry.toLocalURL();
                    resolve(localUrl || filePath);
                  },
                  (err) => {
                    console.warn('复制图片到持久目录失败:', err);
                    resolve(filePath);
                  }
                );
              }, (e) => {
                console.warn('获取 taskImages 目录失败:', e);
                resolve(filePath);
              });
            }, (e) => {
              console.warn('请求文件系统失败:', e);
              resolve(filePath);
            });
          }, (e) => {
            console.warn('解析本地文件路径失败:', e);
            resolve(filePath);
          });
        } catch (e) {
          console.warn('ensurePersistentImage 异常:', e);
          resolve(filePath);
        }
        // #endif

        // #ifndef APP-PLUS
        resolve(filePath);
        // #endif
      });
    },

    // 本地图片缓存 key
    getImageCacheKey() {
      if (!this.taskId) {
        return '';
      }
      return `task_image_cache_${this.taskId}`;
    },

    // 将某个标签的本地图片路径写入缓存
    saveLocalImageForTag(tagId, localPath) {
      try {
        const cacheKey = this.getImageCacheKey();
        if (!cacheKey) return;
        const cache = uni.getStorageSync(cacheKey) || {};
        if (localPath) {
          cache[tagId] = localPath;
        } else {
          delete cache[tagId];
        }
        uni.setStorageSync(cacheKey, cache);
      } catch (e) {
        console.warn('保存本地图片缓存失败:', e);
      }
    },

    // 从缓存中移除某个标签的本地图片记录
    removeLocalImageForTag(tagId) {
      try {
        const cacheKey = this.getImageCacheKey();
        if (!cacheKey) return;
        const cache = uni.getStorageSync(cacheKey) || {};
        if (cache[tagId]) {
          delete cache[tagId];
          // 如果还有其他缓存，继续保存；没有则清空
          if (Object.keys(cache).length > 0) {
            uni.setStorageSync(cacheKey, cache);
          } else {
            uni.removeStorageSync(cacheKey);
          }
        }
      } catch (e) {
        console.warn('移除本地图片缓存失败:', e);
      }
    },

    // 将本地缓存的图片路径应用到当前 formattedTags
    applyLocalImageCache() {
      try {
        const cacheKey = this.getImageCacheKey();
        if (!cacheKey || !this.formattedTags || this.formattedTags.length === 0) return;
        const cache = uni.getStorageSync(cacheKey) || {};
        if (!cache || typeof cache !== 'object') return;

        this.formattedTags.forEach((tag, index) => {
          if (tag.type === 'image' && !tag.value && cache[tag._id]) {
            // 仅在还没有真实 URL 时，才应用本地缓存路径
            this.$set(this.formattedTags[index], 'localImagePath', cache[tag._id]);
          }
        });
      } catch (e) {
        console.warn('应用本地图片缓存失败:', e);
      }
    },
    // 更新初始标签快照
    updateOriginalTagsSnapshot() {
      if (!Array.isArray(this.formattedTags) || this.formattedTags.length === 0) {
        this.originalTagsSnapshot = [];
        return;
      }
      this.originalTagsSnapshot = this.formattedTags.map(tag => ({
        _id: tag._id,
        value: tag.value
      }));
      console.log('原始标签快照已更新:', this.originalTagsSnapshot);
    },
    // 处理从参数传入的tags数据
    processTagsData(tagsData) {
      console.log('处理传入的tags数据:', tagsData);
      
      if (!Array.isArray(tagsData) || tagsData.length === 0) {
        console.warn('tagsData 不是有效数组或为空');
        this.formattedTags = [];
        return;
      }
      
      // 将原始tags数据格式化为页面可显示的格式
      console.log('开始格式化标签数据，共', tagsData.length, '个标签');
      this.formattedTags = tagsData.map((tag, index) => {
        // 确保 value 有默认值
        let processedValue = tag.value !== undefined && tag.value !== null 
          ? tag.value 
          : (tag.defaultValue !== undefined && tag.defaultValue !== null ? tag.defaultValue : '');
        
        console.log('处理标签', index, ':', tag.name, {
          '原始value': tag.value,
          'defaultValue': tag.defaultValue,
          '处理后value': processedValue,
          'value类型': typeof processedValue
        });
        
        // 特殊处理location类型：如果值是数组则转换为逗号分隔的字符串
        if (tag.type === 'location' && Array.isArray(processedValue)) {
          // 对数组进行排序后再转换为字符串
          const sortedArray = this.sortLocationValues(processedValue);
          processedValue = sortedArray.join(',');
          console.log('location类型标签排序结果:', sortedArray, '->', processedValue);
        }
        
        // 特殊处理image类型：保持原始值
        if (tag.type === 'image') {
          // 图片类型直接使用原始值
          processedValue = processedValue || '';
        }
        
        // 确保 processedValue 不是 undefined 或 null
        if (processedValue === undefined || processedValue === null) {
          processedValue = '';
        }
        
        const result = {
          _id: tag._id || `tag${index}`,
          name: tag.name || tag.label || `标签${index + 1}`,
          type: tag.type || 'text',
          description: tag.description || tag.desc || '标签描述',
          value: processedValue,
          defaultValue: tag.defaultValue !== undefined ? tag.defaultValue : ''
        };
        
        console.log('标签格式化结果:', result);
        return result;
      });
      console.log('格式化完成，formattedTags:', this.formattedTags);

      // 尝试应用本地缓存的图片路径（离线时选择但未上传的图片）
      this.applyLocalImageCache();
      
      // 更新taskInfo中的tags，保留其他信息不变
      this.taskInfo = {
        ...this.taskInfo,
        _id: this.taskId || this.taskInfo._id || '',
        tags: tagsData
      };
      
      // 记录当前的初始标签快照
      this.updateOriginalTagsSnapshot();

      console.log('格式化后的标签数据:', this.formattedTags);
      console.log('更新后的taskInfo:', this.taskInfo);
    },
    
    // 从API加载任务详情
    async loadTaskFromAPI(force = false) {
      // 如果已经从参数或缓存加载了数据，且未指定强制刷新，则跳过
      if (!force && this.hasLoadedFromCache) {
        console.log('已从缓存加载数据，跳过API加载');
        return;
      }
      
      try {
        console.log('开始从API加载任务详情...');
        const taskDetail = await apiService.getTaskDetail(this.taskId);
        
        if (taskDetail) {
          console.log('获取到任务详情:', taskDetail);
          
          // 保留当前taskInfo的关键信息，仅更新必要字段
          this.taskInfo = {
            _id: taskDetail._id || this.taskInfo._id,
            taskNo: taskDetail.taskNo || this.taskInfo.taskNo || '',
            taskName: taskDetail.taskName || this.taskInfo.taskName || '',
            templateName: taskDetail.templateName || this.taskInfo.templateName || '未知模板',
            tags: taskDetail.tags || [],
            hasUnsavedTags: false
          };
          
          // 处理tags数据
          if (taskDetail.tags && taskDetail.tags.length > 0) {
            // 临时保存taskInfo中的关键信息
            const tempTaskInfo = {
              taskNo: this.taskInfo.taskNo,
              taskName: this.taskInfo.taskName,
              templateName: this.taskInfo.templateName
            };
            this.processTagsData(taskDetail.tags);
            // 确保关键信息被保留
            this.taskInfo.taskNo = tempTaskInfo.taskNo;
            this.taskInfo.taskName = tempTaskInfo.taskName;
            this.taskInfo.templateName = tempTaskInfo.templateName;
          } else {
            // 如果没有tags，使用默认数据
            this.initializeDefaultData();
          }
        } else {
          console.warn('未获取到任务详情，使用默认数据');
          this.initializeDefaultData();
        }
      } catch (error) {
        console.error('加载任务详情失败:', error);
        uni.showToast({
          title: '加载任务详情失败: ' + error.message,
          icon: 'none'
        });
        // 失败时使用默认数据
        this.initializeDefaultData();
      }
    },
    
    // 尝试使用缓存或从API加载数据
    useCachedOrLoadFromAPI() {
      // 再次检查分类任务列表中的缓存
      if (!this.checkCategoryTasksCache()) {
        // 如果仍然没有缓存数据，则从API加载
        console.log('没有可用缓存，从API加载数据');
        this.loadTaskFromAPI();
      }
    },
    
    // 初始化默认数据
    initializeDefaultData() {
      // 如果已经从缓存加载了数据，则不初始化默认数据
      if (this.hasLoadedFromCache) {
        console.log('已从缓存加载数据，跳过默认数据初始化');
        return;
      }
      
      this.taskInfo = {
        _id: this.taskId || this.taskInfo._id || '',
        taskNo: this.taskInfo.taskNo || '',
        taskName: this.taskInfo.taskName || '',
        templateName: this.taskInfo.templateName || '温度验证模板',
        tags: [],
        hasUnsavedTags: false
      };
      
      this.formattedTags = [
        {
          _id: 'tag1',
          name: '温度记录',
          type: 'number',
          description: '记录当前环境温度',
          value: '25.5'
        },
        {
          _id: 'tag2',
          name: '湿度记录',
          type: 'number',
          description: '记录当前环境湿度',
          value: '65.0'
        },
        {
          _id: 'tag3',
          name: '测量时间',
          type: 'datetime',
          description: '数据采集时间',
          value: '2024-01-15 14:30'
        },
        {
          _id: 'tag4',
          name: '布点位置',
          type: 'location',
          description: '传感器布点区域编号',
          value: '001,002,003'
        },
        {
          _id: 'tag5',
          name: '是否合格',
          type: 'boolean',
          description: '当前测量值是否符合标准',
          value: true
        },
        {
          _id: 'tag6',
          name: '备注信息',
          type: 'text',
          description: '任务备注信息',
          value: '初始记录'
        }
      ];
      // 默认数据也作为一份初始快照
      this.updateOriginalTagsSnapshot();
    },

    getTagTypeName(type) {
      const typeMap = {
        'text': '文本',
        'number': '数字',
        'date': '日期',
        'datetime': '时间',
        'location': '布点区域',
        'boolean': '布尔',
        'image': '图片'
      };
      return typeMap[type] || type;
    },

    // 安全地处理location类型的值
    processLocationValue(value) {
      if (Array.isArray(value)) {
        return value.join(',');
      } else if (typeof value === 'string') {
        return value;
      } else {
        return String(value);
      }
    },
    
    // 获取location数组
    getLocationArray(value) {
      if (Array.isArray(value)) {
        return value;
      } else if (typeof value === 'string') {
        return value.split(',').filter(item => item.trim() !== '');
      } else {
        return [];
      }
    },
    
    // 获取用于显示的location值
    getLocationDisplayValue(value) {
      if (Array.isArray(value)) {
        return value.join(',');
      } else {
        return value || '';
      }
    },
    
    // 更新location值
    updateLocationValue(index, inputValue) {
      if (this.formattedTags[index]) {
        this.formattedTags[index].value = inputValue;
      }
    },
    
    // 解析输入，支持单个ID和范围
    parseLocationInput(input) {
      const trimmed = input.trim();
      if (!trimmed) return [];
      
      // 格式1: C001 到 C010 或 C001到C010
      const rangePattern1 = /^([A-Za-z]*)(\d+)\s*到\s*([A-Za-z]*)(\d+)$/i;
      const match1 = trimmed.match(rangePattern1);
      if (match1) {
        const [, prefix1, startNumStr, prefix2, endNumStr] = match1;
        const prefix = prefix1 || prefix2 || '';
        const start = parseInt(startNumStr, 10);
        const end = parseInt(endNumStr, 10);
        if (start <= end && start > 0 && end > 0) {
          // 使用起始数字字符串的长度来保持前导0
          const padding = Math.max(startNumStr.length, endNumStr.length);
          return this.generateRange(prefix, start, end, padding);
        }
      }
      
      // 格式2: C001-C010
      const rangePattern2 = /^([A-Za-z]*)(\d+)\s*-\s*([A-Za-z]*)(\d+)$/i;
      const match2 = trimmed.match(rangePattern2);
      if (match2) {
        const [, prefix1, startNumStr, prefix2, endNumStr] = match2;
        const prefix = prefix1 || prefix2 || '';
        const start = parseInt(startNumStr, 10);
        const end = parseInt(endNumStr, 10);
        if (start <= end && start > 0 && end > 0) {
          // 使用起始数字字符串的长度来保持前导0
          const padding = Math.max(startNumStr.length, endNumStr.length);
          return this.generateRange(prefix, start, end, padding);
        }
      }
      
      // 格式3: 001~010
      const rangePattern3 = /^(\d+)\s*~\s*(\d+)$/;
      const match3 = trimmed.match(rangePattern3);
      if (match3) {
        const [, startNumStr, endNumStr] = match3;
        const start = parseInt(startNumStr, 10);
        const end = parseInt(endNumStr, 10);
        if (start <= end && start > 0 && end > 0) {
          // 尝试从已有值中推断前缀
          let prefix = '';
          const currentValue = this.getLocationArray(this.formattedTags[this.currentEditingIndex]?.value);
          if (currentValue.length > 0) {
            const lastValue = currentValue[currentValue.length - 1];
            const prefixMatch = lastValue.match(/^([A-Za-z]+)/);
            if (prefixMatch) {
              prefix = prefixMatch[1];
            }
          }
          // 使用起始数字字符串的长度来保持前导0
          const padding = Math.max(startNumStr.length, endNumStr.length);
          return this.generateRange(prefix, start, end, padding);
        }
      }
      
      // 如果不是范围格式，作为单个ID返回
      return [trimmed];
    },
    
    // 生成范围数组
    generateRange(prefix, start, end, padding) {
      const result = [];
      for (let i = start; i <= end; i++) {
        // 使用指定的 padding 来保持前导0
        const numStr = i.toString().padStart(padding, '0');
        result.push(`${prefix}${numStr}`);
      }
      return result;
    },
    
    // 显示添加布点弹窗
    showAddLocationModal(index) {
      this.currentEditingIndex = index;
      this.locationInputValue = '';
      this.showLocationModal = true;
    },
    
    // 隐藏添加布点弹窗
    hideLocationModal() {
      this.showLocationModal = false;
      this.locationInputValue = '';
    },
    
    // 智能排序布点值：按照字符和数字的组合进行排序
    sortLocationValues(values) {
      return values.sort((a, b) => {
        // 提取字母前缀和数字部分
        const regex = /^([A-Za-z]*)(\d*)$/;
        const matchA = a.match(regex);
        const matchB = b.match(regex);
        
        if (matchA && matchB) {
          const prefixA = matchA[1] || '';
          const prefixB = matchB[1] || '';
          const numA = matchA[2] ? parseInt(matchA[2], 10) : 0;
          const numB = matchB[2] ? parseInt(matchB[2], 10) : 0;
          
          // 先比较前缀
          if (prefixA !== prefixB) {
            return prefixA.localeCompare(prefixB);
          }
          // 再比较数字
          return numA - numB;
        }
        
        // 如果正则匹配失败，使用默认字符串比较
        return a.localeCompare(b);
      });
    },
    
    // 确认输入
    confirmLocationInput() {
      if (!this.locationInputValue.trim()) return;
      
      const parsed = this.parseLocationInput(this.locationInputValue);
      if (parsed.length > 0) {
        const currentValue = this.getLocationArray(this.formattedTags[this.currentEditingIndex].value);
        // 去重并添加到现有值中
        const newValues = [...new Set([...currentValue, ...parsed])];
        // 智能排序：按照字符和数字的组合进行排序
        const sortedValues = this.sortLocationValues(newValues);
        this.formattedTags[this.currentEditingIndex].value = sortedValues.join(',');
        // 清空输入框
        this.locationInputValue = '';
        // 隐藏弹窗
        this.hideLocationModal();
      }
    },
    
    // 初始化日期滚轮选项
    initDateWheelOptions() {
      if (this.dateWheelYears.length === 0) {
        const date = new Date();
        const currentYear = date.getFullYear();
        const years = [];
        for (let y = currentYear - 50; y <= currentYear + 10; y++) {
          years.push(y);
        }
        this.dateWheelYears = years;
      }
      if (this.dateWheelMonths.length === 0) {
        this.dateWheelMonths = Array.from({ length: 12 }, (_, i) => i + 1);
      }
      if (this.dateWheelDays.length === 0) {
        this.dateWheelDays = Array.from({ length: 31 }, (_, i) => i + 1);
      }
    },
    
    openDateWheel(index, type) {
      this.initDateWheelOptions();
      this.dateWheelTargetIndex = index;
      this.dateWheelTargetType = type; // 'date' 或 'datetime'
      
      const rawValue = type === 'datetime'
        ? this.getDatePart(this.formattedTags[index]?.value)
        : (this.formattedTags[index]?.value || '');
      
      const baseDate = rawValue || this.getTodayDate();
      const [yStr, mStr, dStr] = baseDate.split('-');
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
      this.dateWheelTargetType = '';
    },
    
    onDateWheelChange(e) {
      const val = e.detail.value || [0, 0, 0];
      this.dateWheelValue = val;
    },
    
    confirmDateWheel() {
      const [yIndex, mIndex, dIndex] = this.dateWheelValue;
      const year = this.dateWheelYears[yIndex] || this.dateWheelYears[0];
      const month = this.dateWheelMonths[mIndex] || 1;
      const day = this.dateWheelDays[dIndex] || 1;
      
      const dateStr = [
        year,
        String(month).padStart(2, '0'),
        String(day).padStart(2, '0')
      ].join('-');
      
      const idx = this.dateWheelTargetIndex;
      const type = this.dateWheelTargetType;
      
      if (idx !== -1) {
        if (type === 'date') {
          this.onDateChange(idx, { detail: { value: dateStr } });
        } else if (type === 'datetime') {
          const current = this.formattedTags[idx]?.value || '';
          const timePart = this.getTimePart(current) || '00:00';
          const datetimeStr = `${dateStr} ${timePart}`;
          this.onDateTimeChange(idx, { detail: { value: datetimeStr } });
        }
      }
      
      this.closeDateWheel();
    },
    
    // 选择今天日期
    selectToday() {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      
      // 找到对应的索引
      const yearIndex = this.dateWheelYears.findIndex(y => y === year);
      const monthIndex = this.dateWheelMonths.findIndex(m => m === month);
      const dayIndex = this.dateWheelDays.findIndex(d => d === day);
      
      // 设置滚轮值
      this.dateWheelValue = [
        yearIndex >= 0 ? yearIndex : 0,
        monthIndex >= 0 ? monthIndex : 0,
        dayIndex >= 0 ? dayIndex : 0
      ];
      
      // 直接确认选择
      this.confirmDateWheel();
    },
    
    // 初始化时间滚轮选项
    initTimeWheelOptions() {
      if (this.timeWheelHours.length === 0) {
        this.timeWheelHours = Array.from({ length: 24 }, (_, i) => i);
      }
      if (this.timeWheelMinutes.length === 0) {
        this.timeWheelMinutes = Array.from({ length: 60 }, (_, i) => i);
      }
    },
    
    openTimeWheel(index) {
      this.initTimeWheelOptions();
      this.timeWheelTargetIndex = index;
      const rawTime = this.getTimePart(this.formattedTags[index]?.value || '') || '00:00';
      const [hStr, mStr] = rawTime.split(':');
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      const hIndex = isNaN(h) ? 0 : Math.min(Math.max(h, 0), 23);
      const mIndex = isNaN(m) ? 0 : Math.min(Math.max(m, 0), 59);
      this.timeWheelValue = [hIndex, mIndex];
      this.showTimeWheel = true;
    },
    
    closeTimeWheel() {
      this.showTimeWheel = false;
      this.timeWheelTargetIndex = -1;
    },
    
    onTimeWheelChange(e) {
      const val = e.detail.value || [0, 0];
      this.timeWheelValue = val;
    },
    
    confirmTimeWheel() {
      const [hIndex, mIndex] = this.timeWheelValue;
      const hour = this.timeWheelHours[hIndex] || 0;
      const minute = this.timeWheelMinutes[mIndex] || 0;
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      
      const idx = this.timeWheelTargetIndex;
      if (idx !== -1) {
        const current = this.formattedTags[idx]?.value || '';
        const datePart = this.getDatePart(current) || this.getTodayDate();
        const datetimeStr = `${datePart} ${timeStr}`;
        this.onDateTimeChange(idx, { detail: { value: datetimeStr } });
      }
      
      this.closeTimeWheel();
    },
    
    // 选择当前时间
    selectCurrentTime() {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // 设置滚轮值
      this.timeWheelValue = [hour, minute];
      
      // 直接确认选择
      this.confirmTimeWheel();
    },
    
    // 获取日期/时间部分（用于滚轮选择器显示）
    getDatePart(value) {
      if (!value) return '';
      const str = String(value);
      return str.split(' ')[0] || '';
    },
    
    getTimePart(value) {
      if (!value) return '';
      const str = String(value);
      if (str.includes(' ')) {
        return str.split(' ')[1] || '';
      }
      // 只有时间的情况
      return str;
    },
    
    // 日期 / 日期时间输入事件处理与校验
    // datetime 的滚轮时间改变
    onWheelTimeChange(index, event) {
      const timePart = event && event.detail ? event.detail.value : '';
      const current = this.formattedTags[index]?.value || '';
      const datePart = this.getDatePart(current) || this.getTodayDate();
      const value = timePart ? `${datePart} ${timePart}` : '';
      this.onDateTimeChange(index, { detail: { value } });
    },
    
    getTodayDate() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },
    
    onDateChange(index, event) {
      const rawValue = event && event.detail
        ? event.detail.value
        : (event && event.target ? event.target.value : '');
      
      // 允许清空
      if (!rawValue) {
        this.updateTagValue(index, '');
        return;
      }
      
      const isValid = this.validateDate(rawValue);
      if (!isValid) {
        // 日期格式应为 YYYY-MM-DD
        if (typeof uni !== 'undefined' && uni.showToast) {
          uni.showToast({
            title: '日期格式应为 YYYY-MM-DD',
            icon: 'none'
          });
        } else {
          console.warn('日期格式不正确，应为 YYYY-MM-DD:', rawValue);
        }
        return;
      }
      
      this.updateTagValue(index, rawValue);
    },
    
    onDateTimeChange(index, event) {
      let rawValue = event && event.detail
        ? event.detail.value
        : (event && event.target ? event.target.value : '');
      
      // 允许清空
      if (!rawValue) {
        this.updateTagValue(index, '');
        return;
      }
      
      // HTML datetime-local 一般返回格式：YYYY-MM-DDTHH:MM 或 YYYY-MM-DDTHH:MM:SS
      // 先转换为要求的格式：YYYY-MM-DD HH:MM
      if (rawValue.includes('T')) {
        const [datePart, timePartRaw] = rawValue.split('T');
        const timePart = timePartRaw ? timePartRaw.substring(0, 5) : '';
        rawValue = `${datePart} ${timePart}`;
      }
      
      const isValid = this.validateDateTime(rawValue);
      if (!isValid) {
        // 时间格式应为 YYYY-MM-DD HH:MM
        if (typeof uni !== 'undefined' && uni.showToast) {
          uni.showToast({
            title: '时间格式应为 YYYY-MM-DD HH:MM',
            icon: 'none'
          });
        } else {
          console.warn('时间格式不正确，应为 YYYY-MM-DD HH:MM:', rawValue);
        }
        return;
      }
      
      this.updateTagValue(index, rawValue);
    },
    
    validateDate(value) {
      // 简单日期校验：YYYY-MM-DD
      const dateReg = /^\d{4}-\d{2}-\d{2}$/;
      return dateReg.test(value);
    },
    
    validateDateTime(value) {
      // 简单日期时间校验：YYYY-MM-DD HH:MM
      const dateTimeReg = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}$/;
      return dateTimeReg.test(value);
    },
    
    // 删除布点
    removeLocation(index, locIndex) {
      const currentValue = this.getLocationArray(this.formattedTags[index].value);
      const newValue = currentValue.filter((_, i) => i !== locIndex);
      // 重新排序
      const sortedValues = this.sortLocationValues(newValue);
      this.formattedTags[index].value = sortedValues.join(',');
    },
    
    updateTagValue(index, value) {
      console.log('updateTagValue 被调用:', { index, value, tagType: this.formattedTags[index]?.type });
      
      if (!this.formattedTags[index]) {
        console.warn('formattedTags[index] 不存在:', index);
        return;
      }
      
      // 确保 value 不是 undefined 或 null
      const safeValue = value !== undefined && value !== null ? value : '';
      console.log('安全处理后的值:', safeValue);
      
      // 对location类型进行特殊处理
      if (this.formattedTags[index].type === 'location') {
        // 当用户输入时，保持为字符串格式以方便编辑
        const processedValue = this.processLocationValue(safeValue);
        // 如果是数组，需要排序
        if (typeof processedValue === 'string' && processedValue.includes(',')) {
          const values = processedValue.split(',').filter(item => item.trim() !== '');
          const sortedValues = this.sortLocationValues(values);
          this.formattedTags[index].value = sortedValues.join(',');
        } else {
          this.formattedTags[index].value = processedValue;
        }
      } else {
        this.formattedTags[index].value = safeValue;
      }
      
      console.log('更新后的 tag.value:', this.formattedTags[index].value);
      console.log('当前 formattedTags:', JSON.stringify(this.formattedTags[index], null, 2));
      
      // 自动更新缓存数据
      this.updateCacheData();
    },
    
    // 更新缓存数据
    updateCacheData() {
      // 清除之前的定时器
      if (this.autoSaveTimer) {
        clearTimeout(this.autoSaveTimer);
      }
      
      // 设置新的定时器，延迟500毫秒执行自动保存
      this.autoSaveTimer = setTimeout(() => {
        this.saveTagsToCache();
      }, 500);
    },
    
    // 检查分类任务缓存
    checkCategoryTasksCache() {
      // 遍历所有可能的缓存键来找到包含当前任务的分类
      try {
        const allStorageKeys = uni.getStorageInfoSync ? uni.getStorageInfoSync().keys : [];
        for (const key of allStorageKeys) {
          if (key.endsWith('_tasks')) {
            try {
              const cachedData = uni.getStorageSync(key);
              if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
                const taskIndex = cachedData.tasks.findIndex(task => task._id === this.taskId);
                if (taskIndex !== -1) {
                  const task = cachedData.tasks[taskIndex];
                  if (task.tags) {
                    console.log('从分类任务缓存加载任务详情数据:', key, task);
                    // 确保缓存中的标签数据结构完整，特别是value字段
                    const normalizedTags = task.tags.map(tag => ({
                      _id: tag._id || '',
                      name: tag.name || '',
                      type: tag.type || 'text',
                      description: tag.description || '',
                      value: tag.value !== undefined ? tag.value : (tag.defaultValue || '')
                    }));
                    this.processTagsData(normalizedTags);
                    this.hasLoadedFromCache = true;
                    // 同步加载 deviceSnList（如果存在）
                    this.loadDeviceSnListFromTask(task);
                    
                    // 如果缓存中有滚动位置信息，则恢复滚动位置
                    if (task.scrollPosition !== undefined && task.scrollPosition !== null) {
                      this.currentScrollTop = task.scrollPosition;
                      console.log('从任务缓存恢复滚动位置:', task.scrollPosition);
                    }
                    
                    // 更新taskInfo中的关键信息
                    this.taskInfo = {
                      ...this.taskInfo,
                      taskNo: task.taskNo || this.taskInfo.taskNo,
                      taskName: task.taskName || this.taskInfo.taskName,
                      templateName: task.templateName || this.taskInfo.templateName,
                      tags: normalizedTags,
                      hasUnsavedTags: !!task.hasUnsavedTags
                    };
                    return true; // 找到并加载了缓存数据
                  }
                }
              }
            } catch (e) {
              console.warn('检查缓存时出错:', key, e);
            }
          }
        }
      } catch (e) {
        console.warn('遍历缓存键时出错:', e);
      }
      return false; // 没有找到缓存数据
    },

    // 将任务字段写回指定任务数组（包含 data.tasks 结构），并可选更新“未提交”标记
    applyTaskUpdatesToTaskArray(taskArray, updates = {}, options = {}) {
      if (!Array.isArray(taskArray)) {
        return { updated: taskArray, changed: false };
      }
      const { tagsToSend, deviceSnList } = updates;
      const { hasUnsavedTags } = options;
      let changed = false;
      const updated = taskArray.map(task => {
        const isCurrentTask = task && (task._id === this.taskId || task.taskId === this.taskId);
        if (isCurrentTask) {
          changed = true;
          return {
            ...task,
            ...(tagsToSend ? { tags: tagsToSend } : {}),
            ...(deviceSnList ? { deviceSnList } : {}),
            // hasUnsavedTags 为 undefined 时不修改此前的值
            ...(hasUnsavedTags === undefined ? {} : { hasUnsavedTags })
          };
        }
        return task;
      });
      return { updated, changed };
    },

    // 更新任务缓存
    updateTaskCache(tagsToSend) {
      try {
        // 遍历所有可能的缓存键来找到包含当前任务的分类
        const allStorageKeys = uni.getStorageInfoSync ? uni.getStorageInfoSync().keys : [];
        for (const key of allStorageKeys) {
          if (!key.endsWith('_tasks')) continue;
          
          try {
            const cachedData = uni.getStorageSync(key) || {};
            const hasTasksArray = Array.isArray(cachedData.tasks);
            const hasDataTasksArray = cachedData.data && Array.isArray(cachedData.data.tasks);
            
            // 如果两个数组都不存在，跳过
            if (!hasTasksArray && !hasDataTasksArray) {
              continue;
            }
            
            let changed = false;
            let dataTasksChanged = false;
            let updatedTasks = cachedData.tasks;
            let updatedData = cachedData.data || {};
            
            // 更新 tasks 数组（保存成功后标记为“已提交”）
            if (hasTasksArray) {
              const applyResult = this.applyTaskUpdatesToTaskArray(cachedData.tasks, {
                tagsToSend,
                deviceSnList: (this.deviceSnList || []).map(d => ({ deviceId: d.deviceId, deviceSn: d.deviceSn }))
              }, {
                hasUnsavedTags: false
              });
              updatedTasks = applyResult.updated;
              changed = applyResult.changed;
            }
            
            // 更新 data.tasks 数组（保存成功后标记为“已提交”）
            if (hasDataTasksArray) {
              const applyResultInner = this.applyTaskUpdatesToTaskArray(cachedData.data.tasks, {
                tagsToSend,
                deviceSnList: (this.deviceSnList || []).map(d => ({ deviceId: d.deviceId, deviceSn: d.deviceSn }))
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
              console.log('缓存数据已更新:', key, 'tasksChanged:', changed, 'dataTasksChanged:', dataTasksChanged);
              // 不 break，继续遍历，确保所有相关缓存（包括 `${taskId}_tasks`）都被更新
            }
          } catch (e) {
            console.warn('更新缓存时出错:', key, e);
          }
        }
      } catch (error) {
        console.error('更新缓存数据失败:', error);
      }

      // 保存成功后，本地任务状态也标记为“已提交”
      if (this.taskInfo) {
        this.taskInfo.hasUnsavedTags = false;
      }
    },
    
    // 保存数据到缓存
    saveTagsToCache() {
      try {
        console.log('saveTagsToCache 开始执行，formattedTags:', JSON.stringify(this.formattedTags, null, 2));
        
        // 将当前标签数据转换为API需要的格式
        const tagsToSend = this.formattedTags.map((tag, idx) => {
          let processedValue = tag.value;
          console.log(`标签 ${idx} (${tag.name}):`, {
            tagValue: tag.value,
            tagValueType: typeof tag.value,
            tagValueIsUndefined: tag.value === undefined,
            tagValueIsNull: tag.value === null,
            processedValue: processedValue
          });
          
          // 如果 value 是 undefined 或 null，使用空字符串或 defaultValue
          if (processedValue === undefined || processedValue === null) {
            console.warn(`标签 ${idx} (${tag.name}) 的 value 是 ${processedValue}，使用默认值`);
            processedValue = tag.defaultValue !== undefined ? tag.defaultValue : '';
          }
          
          // 特殊处理location类型：如果是字符串则转换回数组格式
          if (tag.type === 'location' && typeof processedValue === 'string') {
            const values = processedValue.split(',').filter(item => item.trim() !== '');
            // 保存前再次排序
            processedValue = this.sortLocationValues(values);
          }
          
          // 特殊处理image类型：保持原始值
          if (tag.type === 'image') {
            processedValue = processedValue;
          }
          
          const result = {
            _id: tag._id,
            name: tag.name,
            type: tag.type,
            description: tag.description,
            value: processedValue
          };
          
          console.log(`标签 ${idx} 处理结果:`, result);
          return result;
        });
        
        console.log('tagsToSend 最终结果:', JSON.stringify(tagsToSend, null, 2));
        
        // 遍历所有可能的缓存键来找到包含当前任务的分类
        const allStorageKeys = uni.getStorageInfoSync ? uni.getStorageInfoSync().keys : [];
        for (const key of allStorageKeys) {
          if (!key.endsWith('_tasks')) continue;
          
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
                deviceSnList: (this.deviceSnList || []).map(d => ({ deviceId: d.deviceId, deviceSn: d.deviceSn }))
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
                deviceSnList: (this.deviceSnList || []).map(d => ({ deviceId: d.deviceId, deviceSn: d.deviceSn }))
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
              console.log('updatedTasks:', updatedTasks);
              console.log('缓存数据已更新:', key, 'tasksChanged:', changed, 'dataTasksChanged:', dataTasksChanged);
              // 不 break，继续遍历，确保 `${taskId}_tasks` 等所有缓存都更新
            }
          } catch (e) {
            console.warn('更新缓存时出错:', key, e);
          }
        }
        
        // 本地自动保存后，将当前任务标记为“有未提交标签”
        if (this.taskInfo) {
          this.taskInfo.hasUnsavedTags = true;
        }
      } catch (error) {
        console.error('更新缓存数据失败:', error);
      }
    },

    // 输入框获得焦点时的处理
    onInputFocus(index) {
      console.log(`输入框 ${index} 获得焦点`);
      // 可以在这里添加额外的视觉反馈或逻辑
    },

    // 输入框失去焦点时的处理
    onInputBlur(index) {
      console.log(`输入框 ${index} 失去焦点`);
      // 可以在这里添加数据验证或其他逻辑
    },

    // 点击标签标题时聚焦到对应输入框
    focusInput(index) {
      this.$nextTick(() => {
        const inputRef = this.$refs[`input_${index}`];
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
          return; // 不需要保存0位置
        }
        
        // 遍历所有可能的缓存键来找到包含当前任务的分类
        const allStorageKeys = uni.getStorageInfoSync ? uni.getStorageInfoSync().keys : [];
        for (const key of allStorageKeys) {
          if (key.endsWith('_tasks')) {
            try {
              const cachedData = uni.getStorageSync(key);
              if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
                const taskIndex = cachedData.tasks.findIndex(task => task._id === this.taskId);
                if (taskIndex !== -1) {
                  // 找到包含当前任务的缓存，更新滚动位置
                  const updatedTasks = [...cachedData.tasks];
                  updatedTasks[taskIndex] = {
                    ...updatedTasks[taskIndex],
                    scrollPosition: scrollTop
                  };
                  
                  // 保存更新后的数据到缓存，保留原有的 data 对象
                  uni.setStorageSync(key, {
                    tasks: updatedTasks,
                    timestamp: cachedData.timestamp || Date.now(),
                    data: cachedData.data || {} // 保留任务列表的滚动位置等数据
                  });
                  
                  console.log('滚动位置已保存到任务缓存:', key, scrollTop);
                  break; // 找到并更新后退出循环
                }
              }
            } catch (e) {
              console.warn('保存滚动位置时出错:', key, e);
            }
          }
        }
      } catch (error) {
        console.error('保存滚动位置失败:', error);
      }
    },

    // 从任务缓存中恢复滚动位置
    restoreScrollPosition() {
      try {
        // 遍历所有可能的缓存键来找到包含当前任务的分类
        const allStorageKeys = uni.getStorageInfoSync ? uni.getStorageInfoSync().keys : [];
        for (const key of allStorageKeys) {
          if (key.endsWith('_tasks')) {
            try {
              const cachedData = uni.getStorageSync(key);
              if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
                const taskIndex = cachedData.tasks.findIndex(task => task._id === this.taskId);
                if (taskIndex !== -1) {
                  const task = cachedData.tasks[taskIndex];
                  if (task.scrollPosition !== undefined && task.scrollPosition !== null && task.scrollPosition > 0) {
                    // 使用 uni.pageScrollTo 恢复滚动位置
                    this.$nextTick(() => {
                      setTimeout(() => {
                        uni.pageScrollTo({
                          scrollTop: task.scrollPosition,
                          duration: 0 // 立即滚动，无动画
                        });
                        this.currentScrollTop = task.scrollPosition;
                        console.log('从任务缓存恢复滚动位置:', key, task.scrollPosition);
                      }, 100);
                    });
                    break; // 找到并恢复后退出循环
                  }
                }
              }
            } catch (e) {
              console.warn('恢复滚动位置时出错:', key, e);
            }
          }
        }
      } catch (error) {
        console.error('恢复滚动位置失败:', error);
      }
    },



    // 保存标签数据
    async saveTags() {
      try {
        // 无标签时不执行保存
        if (!Array.isArray(this.formattedTags) || this.formattedTags.length === 0) {
          return;
        }
        // 如果既没有当前会话内的变更，也没有缓存标记的“未提交”状态，则不需要保存
        if (!this.hasTagChanges && !(this.taskInfo && this.taskInfo.hasUnsavedTags)) {
          return;
        }
        // 显示加载提示
        uni.showLoading({
          title: '保存中...'
        });

        // 保存前，先检查是否有未上传的本地图片（离线时选择的）
        const imageTagsNeedingUpload = this.formattedTags.filter(tag => 
          tag.type === 'image' && tag.localImagePath && !tag.value
        );

        if (imageTagsNeedingUpload.length > 0) {
          const networkType = await this.getNetworkType();
          if (networkType === 'none') {
            // 仍然无网络，无法上传图片，直接提示并中断保存
            uni.hideLoading();
            uni.showToast({
              title: '当前无网络，无法上传图片，请联网后再保存',
              icon: 'none'
            });
            return;
          }

          // 有网络时，先逐个上传这些本地图片
          for (const imgTag of imageTagsNeedingUpload) {
            try {
              uni.showLoading({
                title: '图片上传中...',
                mask: true
              });
              const uploadResult = await apiService.uploadImage(imgTag.localImagePath);
              if (!uploadResult || !uploadResult.url) {
                throw new Error('上传成功但未返回图片地址');
              }
              // 将真实 URL 写入标签值，并清空本地路径
              imgTag.value = uploadResult.url;
              imgTag.localImagePath = '';
              // 同步移除本地缓存中的记录
              this.removeLocalImageForTag(imgTag._id);
            } catch (e) {
              console.error('保存前上传图片失败:', e);
              uni.hideLoading();
              uni.showToast({
                title: '图片上传失败: ' + (e.message || '未知错误'),
                icon: 'none'
              });
              return;
            }
          }

          // 图片都上传成功后，恢复为“保存中”的 loading 提示
          uni.showLoading({
            title: '保存中...'
          });
        }
        
        // 将formattedTags转换为API需要的格式
        const tagsToSend = this.formattedTags.map(tag => {
          let processedValue = tag.value;
          
          // 特殊处理location类型：如果是字符串则转换回数组格式
          if (tag.type === 'location' && typeof processedValue === 'string') {
            const values = processedValue.split(',').filter(item => item.trim() !== '');
            // 保存前再次排序
            processedValue = this.sortLocationValues(values);
          }
          
          // 特殊处理image类型：保持原始值
          if (tag.type === 'image') {
            // 图片类型直接使用原始值
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
        
        console.log('准备发送的标签数据:', {
          taskId: this.taskId,
          tags: tagsToSend,
          deviceSnList: (this.deviceSnList || []).map(d => ({ deviceId: d.deviceId, deviceSn: d.deviceSn }))
        });
        
        // 调用API更新任务标签
        const result = await apiService.updateTaskTags(
          this.taskId,
          tagsToSend,
          (this.deviceSnList || []).map(d => ({ deviceId: d.deviceId, deviceSn: d.deviceSn }))
        );
        
        console.log('标签保存成功:', result);
        
        // 隐藏加载提示
        uni.hideLoading();
        
        // 直接更新缓存中的数据，而不是再次从formattedTags生成
        this.updateTaskCache(tagsToSend);

        // 保存成功后，以当前标签作为新的初始快照
        this.updateOriginalTagsSnapshot();
        this.updateOriginalDeviceSnapshot();
        
        // 显示成功提示
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 可选：返回上一页或刷新数据
        // uni.navigateBack();
        
      } catch (error) {
        console.error('保存标签失败:', error);
        
        // 隐藏加载提示
        uni.hideLoading();
        
        // 显示错误提示
        uni.showToast({
          title: '保存失败: ' + (error.message || '未知错误'),
          icon: 'none'
        });
      }
    },

    // 选择图片并上传到七牛云
    chooseAndUploadImage(index) {
      const tag = this.formattedTags[index];
      if (!tag) return;

      uni.chooseImage({
        count: 1,
        sizeType: ['compressed', 'original'],
        sourceType: ['album', 'camera'],
        success: async (chooseRes) => {
          try {
            // 基础校验：文件大小（后端限制 10MB，这里也做一次前端校验）
            const tempFile = chooseRes.tempFiles && chooseRes.tempFiles[0];
            if (tempFile && tempFile.size && tempFile.size > 10 * 1024 * 1024) {
              uni.showToast({
                title: '图片不能超过10MB',
                icon: 'none'
              });
              return;
            }

            const filePath = chooseRes.tempFilePaths[0];
            if (!filePath) {
              uni.showToast({
                title: '未选择有效图片',
                icon: 'none'
              });
              return;
            }

            // 将临时图片拷贝到持久目录，保证 APP 重启后路径仍然可用
            const persistentPath = await this.ensurePersistentImage(filePath);

            // 先将本地路径保存到标签上用于预览，但不立刻写入真实 URL
            // 在无网环境下，仅缓存本地路径；有网时才真正上传
            this.$set(this.formattedTags[index], 'localImagePath', persistentPath);
            // 同时写入本地缓存，便于页面关闭后再次打开恢复
            this.saveLocalImageForTag(tag._id, persistentPath);

            const networkType = await this.getNetworkType();
            if (networkType === 'none') {
              // 无网络：只是缓存，不上传
              uni.showToast({
                title: '当前无网络，图片已缓存，保存时会自动上传',
                icon: 'none'
              });
              return;
            }

            // 有网络：立即上传，成功后写入真实 URL
            uni.showLoading({
              title: '图片上传中...',
              mask: true
            });

            const result = await apiService.uploadImage(persistentPath);
            const imageUrl = result.url;

            if (!imageUrl) {
              uni.showToast({
                title: '上传成功但未返回图片地址',
                icon: 'none'
              });
              return;
            }

            // 更新当前标签的值为图片地址，并清空本地路径
            this.formattedTags[index].value = imageUrl;
            this.formattedTags[index].localImagePath = '';
            // 上传成功后，从本地缓存中移除
            this.removeLocalImageForTag(tag._id);

            uni.showToast({
              title: '上传成功',
              icon: 'success'
            });
          } catch (error) {
            console.error('上传图片失败:', error);
            uni.showToast({
              title: '上传失败: ' + (error.message || '未知错误'),
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          if (err && err.errMsg && err.errMsg.indexOf('cancel') === -1) {
            console.error('选择图片失败:', err);
            uni.showToast({
              title: '选择图片失败',
              icon: 'none'
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
      const targetTaskId = this.taskId || (this.taskInfo && this.taskInfo._id) || '';
      if (!targetTaskId) {
        uni.showToast({
          title: '未找到任务ID，无法查看曲线图',
          icon: 'none'
        });
        return;
      }
      uni.navigateTo({
        url: `/pages/task/realtime-data/realtime-data?taskId=${encodeURIComponent(targetTaskId)}`
      });
    },
    
    goBack() {
      uni.navigateBack();
    },
    
    // 显示添加设备菜单
    showAddDeviceMenu() {
      this.showAddDeviceMenuModal = true;
    },
    
    // 隐藏添加设备菜单
    hideAddDeviceMenu() {
      this.showAddDeviceMenuModal = false;
    },
    
    // 处理扫码添加
    async handleScanAdd() {
      this.hideAddDeviceMenu();
      
      // #ifdef APP-PLUS
      let status = await this.checkCameraPermission();
      if (status !== 1) {
        return;
      }
      // #endif
      
      uni.scanCode({
        success: (res) => {
          const scanResult = res.result || '';
          console.log('扫码结果:', scanResult);
          
          if (!scanResult) {
            uni.showToast({
              title: '扫码结果为空',
              icon: 'none'
            });
            return;
          }
          
          // 判断是否是W开头的（网关）
          if (scanResult.trim().toUpperCase().startsWith('W')) {
            // 是网关，从缓存中查找对应的设备列表
            this.addDevicesFromGateway(scanResult.trim());
          } else {
            // 不是网关，直接添加设备
            this.addSingleDevice(scanResult.trim());
          }
        },
        fail: (err) => {
          console.error('扫码失败:', err);
          if (err && err.errMsg && err.errMsg.indexOf('cancel') === -1) {
            uni.showToast({
              title: '扫码失败',
              icon: 'none'
            });
          }
        }
      });
    },
    
    // 处理直接添加设备
    handleDirectAddDevice() {
      this.hideAddDeviceMenu();
      this.addDevice();
    },
    
    // 处理添加网关
    handleAddGateway() {
      this.hideAddDeviceMenu();
      this.gatewaySnInput = '';
      this.showAddGatewayModal = true;
    },
    
    // 隐藏添加网关弹窗
    hideAddGatewayModal() {
      this.showAddGatewayModal = false;
      this.gatewaySnInput = '';
    },
    
    // 网关SN输入处理
    onGatewaySnInput(e) {
      this.gatewaySnInput = e.detail ? e.detail.value : (e.target ? e.target.value : '');
    },
    
    // 确认添加网关
    confirmAddGateway() {
      const gatewaySn = this.gatewaySnInput.trim();
      
      if (!gatewaySn) {
        uni.showToast({
          title: '请输入网关SN',
          icon: 'none'
        });
        return;
      }
      
      // 验证是否以W开头
      if (!gatewaySn.toUpperCase().startsWith('W')) {
        uni.showToast({
          title: '网关SN必须以W开头',
          icon: 'none'
        });
        return;
      }
      
      // 关闭弹窗
      this.hideAddGatewayModal();
      
      // 从缓存中查找对应的设备列表并添加
      this.addDevicesFromGateway(gatewaySn);
    },
    
    // 从网关添加设备
    addDevicesFromGateway(gatewaySn) {
      try {
        // 从缓存中获取网关设备列表
        const gatewayDeviceSnList = storageManager.getGatewayDeviceSnList() || [];
        
        // 查找匹配的网关
        const gateway = gatewayDeviceSnList.find(g => 
          g.gatewaySn && g.gatewaySn.toUpperCase() === gatewaySn.toUpperCase()
        );
        
        if (!gateway) {
          uni.showToast({
            title: `未找到网关 ${gatewaySn} 的设备列表`,
            icon: 'none',
            duration: 2000
          });
          return;
        }
        
        const deviceSnList = gateway.deviceSnList || [];
        if (deviceSnList.length === 0) {
          uni.showToast({
            title: `网关 ${gatewaySn} 下没有设备`,
            icon: 'none'
          });
          return;
        }
        
        // 获取当前已有的设备SN列表，用于去重
        const existingDeviceSns = (this.deviceSnList || [])
          .map(d => d.deviceSn)
          .filter(sn => sn && sn.trim() !== '');
        
        // 添加设备，去重
        let addedCount = 0;
        deviceSnList.forEach(deviceSn => {
          if (deviceSn && deviceSn.trim() !== '') {
            // 检查是否已存在
            if (!existingDeviceSns.includes(deviceSn.trim())) {
              const nextDeviceId = this.generateNextDeviceId();
              const newItem = {
                __key: `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                deviceId: nextDeviceId,
                deviceSn: deviceSn.trim()
              };
              this.deviceSnList = [...(this.deviceSnList || []), newItem];
              existingDeviceSns.push(deviceSn.trim());
              addedCount++;
            }
          }
        });
        
        if (addedCount > 0) {
          this.updateCacheData();
          uni.showToast({
            title: `成功添加 ${addedCount} 个设备`,
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: '所有设备已存在',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('从网关添加设备失败:', error);
        uni.showToast({
          title: '添加设备失败: ' + (error.message || '未知错误'),
          icon: 'none'
        });
      }
    },
    
    // 添加单个设备
    addSingleDevice(deviceSn) {
      if (!deviceSn || deviceSn.trim() === '') {
        uni.showToast({
          title: '设备SN不能为空',
          icon: 'none'
        });
        return;
      }
      
      // 检查是否已存在
      const existingDeviceSns = (this.deviceSnList || [])
        .map(d => d.deviceSn)
        .filter(sn => sn && sn.trim() !== '');
      
      if (existingDeviceSns.includes(deviceSn.trim())) {
        uni.showToast({
          title: '设备已存在',
          icon: 'none'
        });
        return;
      }
      
      // 添加设备
      const nextDeviceId = this.generateNextDeviceId();
      const newItem = {
        __key: `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        deviceId: nextDeviceId,
        deviceSn: deviceSn.trim()
      };
      this.deviceSnList = [...(this.deviceSnList || []), newItem];
      this.updateCacheData();
      
      uni.showToast({
        title: '添加成功',
        icon: 'success'
      });
    },
    
    // 检查相机权限（APP端）
    async checkCameraPermission() {
      // #ifdef APP-PLUS
      let status = permision.isIOS 
        ? await permision.requestIOS('camera')
        : await permision.requestAndroid('android.permission.CAMERA');
      
      if (status === null || status === 1) {
        return 1;
      } else {
        uni.showModal({
          content: "需要相机权限才能扫码",
          confirmText: "设置",
          success: function(res) {
            if (res.confirm) {
              permision.gotoAppSetting();
            }
          }
        });
        return 0;
      }
      // #endif
      
      // #ifndef APP-PLUS
      return 1;
      // #endif
    }
  }
}
</script>

<style scoped>
.task-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 180rpx; /* 增加底部padding，避免被固定按钮遮挡 */
  box-sizing: border-box;
}

/* Tab */
.tab-bar {
  display: flex;
  gap: 16rpx;
  background: white;
  border-radius: 15rpx;
  padding: 12rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  height: 72rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.tab-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #374151;
}

.tab-item.active .tab-text {
  color: #fff;
}

/* Devices */
.devices-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.device-item-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2rpx solid #eef2ff;
  box-shadow: 0 8rpx 24rpx rgba(17, 24, 39, 0.06);
}

.device-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.device-field {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.device-field-id {
  max-width: 18%;
  flex: 0.6;
}

.device-field-sn {
  flex: 1.8;
}

.device-action-col {
  width: 90rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.device-label {
  font-size: 24rpx;
  color: #6b7280;
  font-weight: 600;
}

.device-input {
  width: 100%;
  height: 72rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #1f2937;
  background: #fafafa;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.device-input:focus {
  border-color: #a5b4fc;
  background: #ffffff;
  box-shadow: 0 0 0 4rpx rgba(99, 102, 241, 0.12);
}

.device-del-chip {
  width: 56rpx;
  height: 56rpx;
  border-radius: 999rpx;
  background: #fef2f2;
  border: 2rpx solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-del-text {
  font-size: 26rpx;
  color: #b91c1c;
  font-weight: 700;
}

.add-device-btn {
  width: 100%;
  height: 72rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  margin-top: 10rpx;
}

.add-device-btn-inline {
  height: 60rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  font-size: 26rpx;
  box-shadow: 0 4rpx 10rpx rgba(102, 126, 234, 0.3);
}

.page-header {
  background: white;
  padding: 20rpx 30rpx;
  border-radius: 15rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.task-info-card {
  background: white;
  border-radius: 15rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.image-wrapper {
  margin-top: 10rpx;
}

.image-content {
  position: relative;
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f7f7f7;
}

.image-preview {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10rpx 20rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.45), transparent);
}

.image-hint {
  font-size: 24rpx;
  color: #fff;
}

.image-empty {
  padding: 40rpx 20rpx;
  text-align: center;
  color: #999;
  background-color: #f7f7f7;
  border-radius: 12rpx;
}

.image-empty-text {
  font-size: 26rpx;
}

.image-actions {
  margin-top: 16rpx;
  display: flex;
  justify-content: flex-start;
}

.image-upload-btn {
  font-size: 26rpx;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.image-url-wrapper {
  margin-top: 10rpx;
}

.image-url {
  font-size: 22rpx;
  color: #666;
  word-break: break-all;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  max-width: 60%;
  text-align: right;
}

.debug-info .info-label {
  color: #667eea;
  font-weight: bold;
}

.debug-info .info-value {
  color: #667eea;
  font-weight: bold;
}

.tags-section {
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 25rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.devices-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.device-header-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.realtime-btn {
  height: 60rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  font-size: 26rpx;
  box-shadow: 0 4rpx 10rpx rgba(16, 185, 129, 0.3);
}



.tags-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.tag-item-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2rpx solid #f3f4f6;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.tag-item-card:active {
  transform: translateY(2rpx);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.06);
}

.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.tag-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.clickable:active {
  color: #667eea;
}

.tag-type {
  font-size: 24rpx;
  color: #667eea;
  background: #f0f4ff;
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
}



/* 输入框容器 */
.input-wrapper {
  width: 100%;
}

.tag-input {
  width: 100%;
  height: 72rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #1f2937;
  background: #ffffff;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tag-input::placeholder {
  color: #9ca3af;
  font-size: 26rpx;
}

.tag-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
  outline: none;
  background: #fafbff;
}

.tag-input-text {
  letter-spacing: 0.5rpx;
}

.tag-input-number {
  font-variant-numeric: tabular-nums;
}

.tag-input-datetime,
.tag-input-date {
  color: #374151;
}

.picker-display {
  width: 100%;
  padding: 14rpx 20rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  background-color: #ffffff;
  font-size: 28rpx;
  color: #1f2937;
  box-sizing: border-box;
}

.picker-placeholder {
  color: #9ca3af;
}

.datetime-picker-row {
  display: flex;
  gap: 16rpx;
}

.datetime-picker-row .picker-display {
  flex: 1;
}

.date-wheel-picker-view {
  width: 100%;
  height: 600rpx;
  margin-top: 20rpx;
}

.date-wheel-item {
  line-height: 100rpx;
  text-align: center;
}

.time-wheel-picker-view {
  width: 100%;
  height: 400rpx;
  margin-top: 20rpx;
}

.time-wheel-item {
  line-height: 100rpx;
  text-align: center;
}

/* 时间显示样式 */
.datetime-display {
  padding: 12rpx 15rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  border: 1rpx solid #e9ecef;
}

.datetime-text {
  font-size: 28rpx;
  color: #495057;
}

/* 布点区域样式 */
.location-wrapper {
  width: 100%;
}

.location-content {
  min-height: 60rpx;
  padding: 16rpx;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2rpx solid #bbf7d0;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.location-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.location-tag {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  box-shadow: 0 2rpx 6rpx rgba(16, 185, 129, 0.3);
  transition: all 0.2s ease;
}

.location-tag:active {
  transform: scale(0.95);
  box-shadow: 0 1rpx 3rpx rgba(16, 185, 129, 0.2);
}

.location-tag-text {
  margin-right: 8rpx;
  font-weight: 500;
}

.location-tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32rpx;
  height: 32rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.location-tag-remove:active {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}

.remove-icon {
  font-size: 28rpx;
  color: white;
  font-weight: bold;
  line-height: 1;
}

.location-empty {
  padding: 20rpx 0;
  text-align: center;
}

.location-empty-text {
  font-size: 26rpx;
  color: #6b7280;
}

.add-location-btn {
  width: 100%;
  height: 72rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.add-location-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(102, 126, 234, 0.2);
}

.btn-icon {
  font-size: 32rpx;
  font-weight: bold;
  line-height: 1;
}

.btn-text {
  font-size: 28rpx;
}



/* 布尔值显示样式 */
.boolean-wrapper {
  width: 100%;
}

.boolean-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2rpx solid #fcd34d;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(251, 191, 36, 0.15);
}

.boolean-switch {
  transform: scale(1.1);
}

.boolean-label {
  font-size: 30rpx;
  color: #92400e;
  font-weight: 600;
  letter-spacing: 1rpx;
}

/* 图片显示样式 */
.image-wrapper {
  width: 100%;
}

.image-content {
  position: relative;
  width: 100%;
  padding: 16rpx;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2rpx solid #d1d5db;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
  overflow: hidden;
  transition: all 0.3s ease;
}

.image-content:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.image-preview {
  width: 100%;
  max-height: 400rpx;
  border-radius: 8rpx;
  border: 2rpx solid #e5e7eb;
  background: white;
  display: block;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-hint {
  color: white;
  font-size: 24rpx;
  font-weight: 500;
  text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.3);
}

.image-url-wrapper {
  padding: 12rpx 16rpx;
  background: #f9fafb;
  border-radius: 8rpx;
  border: 1rpx solid #e5e7eb;
}

.image-url {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

/* 默认值显示样式 */
.default-wrapper {
  width: 100%;
  padding: 20rpx;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
}

.default-value {
  display: block;
  font-size: 28rpx;
  color: #6b7280;
  line-height: 1.6;
  word-break: break-word;
}

.tag-actions {
  display: flex;
  gap: 15rpx;
  justify-content: flex-end;
  margin-top: 20rpx;
}

.actions-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
  box-sizing: border-box;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 15rpx;
  font-size: 30rpx;
  font-weight: bold;
}

/* 按钮禁用状态样式 */
.action-btn[disabled] {
  opacity: 0.5;
  filter: grayscale(0.2);
}

.small {
  height: 50rpx;
  font-size: 24rpx;
  padding: 0 20rpx;
  border-radius: 8rpx;
}

.primary {
  background: #667eea;
  color: white;
  border: none;
}

.secondary {
  background: white;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.edit {
  background: #4caf50;
  color: white;
  border: none;
}

.delete {
  background: #ff4757;
  color: white;
  border: none;
}

.action-btn:active {
  opacity: 0.8;
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
  background: white;
  border-radius: 15rpx;
  width: 90%;
  max-width: 600rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
}

.modal-body {
  padding: 30rpx;
}

.modal-input {
  width: 100%;
  height: 72rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #1f2937;
  background: #ffffff;
  box-sizing: border-box;
  margin-bottom: 20rpx;
  transition: all 0.3s ease;
}

.modal-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
  outline: none;
  background: #fafbff;
}

.modal-help {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 16rpx;
  background: #f9fafb;
  border-radius: 8rpx;
  border: 1rpx solid #e5e7eb;
}

.modal-help-title {
  font-size: 26rpx;
  color: #374151;
  font-weight: 600;
  margin-bottom: 4rpx;
}

.modal-help-item {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.6;
  padding-left: 12rpx;
  position: relative;
}

.modal-help-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 30rpx 30rpx;
}

.modal-cancel-btn,
.modal-confirm-btn,
.modal-today-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
}

.modal-cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.modal-cancel-btn:active {
  background: #e5e7eb;
  transform: scale(0.98);
}

.modal-today-btn {
  background: #e0e7ff;
  color: #667eea;
  border: 2rpx solid #c7d2fe;
}

.modal-today-btn:active {
  background: #c7d2fe;
  transform: scale(0.98);
}

.modal-confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.modal-confirm-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(102, 126, 234, 0.2);
}

/* 菜单选项样式 */
.menu-option {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.2s ease;
}

.menu-option:last-child {
  border-bottom: none;
}

.menu-option:active {
  background-color: #f5f5f5;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

/* 添加网关弹窗样式 */
.gateway-modal-content {
  max-width: 650rpx;
}

.gateway-input-wrapper {
  padding: 20rpx 0;
}

.gateway-label {
  display: block;
  font-size: 28rpx;
  color: #374151;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.gateway-input {
  width: 100%;
  height: 88rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: #1f2937;
  background: #ffffff;
  box-sizing: border-box;
  transition: all 0.3s ease;
  margin-bottom: 16rpx;
}

.gateway-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
  outline: none;
  background: #fafbff;
}

.gateway-input::placeholder {
  color: #9ca3af;
  font-size: 28rpx;
}

.gateway-hint {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 16rpx;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1rpx solid #fcd34d;
  border-radius: 8rpx;
  margin-top: 8rpx;
}

.hint-icon {
  font-size: 28rpx;
}

.hint-text {
  font-size: 24rpx;
  color: #92400e;
  line-height: 1.5;
}

.modal-confirm-btn[disabled] {
  opacity: 0.5;
  filter: grayscale(0.3);
  cursor: not-allowed;
}

.no-tags {
  text-align: center;
  padding: 50rpx 0;
}

.no-tags-text {
  font-size: 28rpx;
  color: #999;
}
</style>
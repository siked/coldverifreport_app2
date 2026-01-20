<template>
  <view class="task-detail-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">任务详情</text>
    </view>

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
      <view class="info-item">
        <text class="info-label">模板名称</text>
        <text class="info-value">{{ taskInfo.templateName }}</text>
      </view>
    </view>

    <!-- 标签列表 -->
    <view class="tags-section">
      <view class="section-header">
        <text class="section-title">标签列表</text>
        <button class="add-tag-btn" @click="showAddTagModal">+ 添加标签</button>
      </view>
      
      <view class="tags-list">
        <block v-if="formattedTags && formattedTags.length > 0">
          <view 
            v-for="(tag, index) in formattedTags" 
            :key="tag._id" 
            class="tag-item-card"
          >
            <view class="tag-header">
              <text class="tag-name">{{ tag.name }}</text>
              <text class="tag-type">{{ getTagTypeName(tag.type) }}</text>
            </view>
            <view class="tag-description">
              <text class="desc-text">{{ tag.description }}</text>
            </view>
            <view class="tag-content">
              <component 
                :is="getTagComponent(tag.type)" 
                :tag="tag" 
                :index="index"
                @update="updateTagValue"
              />
            </view>
            <view class="tag-actions">
              <button class="action-btn small edit" @click="editTag(index)">编辑</button>
              <button class="action-btn small delete" @click="deleteTag(index)">删除</button>
            </view>
          </view>
        </block>
        <view v-else class="no-tags">
          <text class="no-tags-text">暂无标签</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions-section">
      <button class="action-btn primary" @click="saveTags">保存标签</button>
      <button class="action-btn secondary" @click="goBack">返回</button>
    </view>

    <!-- 添加/编辑标签弹窗 -->
    <view v-if="showTagModal" class="modal-overlay" @click="closeTagModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEditModal ? '编辑标签' : '添加标签' }}</text>
          <text class="modal-close" @click="closeTagModal">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">标签名称</text>
            <input 
              v-model="currentTag.name" 
              class="form-input"
              placeholder="请输入标签名称"
            />
          </view>
          <view class="form-item">
            <text class="form-label">标签类型</text>
            <picker 
              :range="tagTypes" 
              :range-key="'label'"
              @change="onTagTypeChange"
            >
              <view class="picker-display">
                <text>{{ getSelectedTagTypeLabel() }}</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">描述</text>
            <textarea 
              v-model="currentTag.description" 
              class="form-textarea"
              placeholder="请输入标签描述"
            />
          </view>
          <view class="form-item">
            <text class="form-label">默认值</text>
            <component 
              :is="getDefaultValueComponent(currentTag.type)" 
              v-model="currentTag.defaultValue"
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closeTagModal">取消</button>
          <button class="modal-btn confirm" @click="confirmTagModal">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import apiService from '@/common/api.js'

export default {
  data() {
    return {
      taskId: '',
      taskInfo: {
        _id: '',
        taskNo: '',
        taskName: '',
        templateName: '',
        tags: []
      },
      // 格式化后的标签数据
      formattedTags: [],
      loading: false,
      
      // 标签类型配置
      tagTypes: [
        { value: 'text', label: '文本' },
        { value: 'number', label: '数字' },
        { value: 'date', label: '日期' },
        { value: 'datetime', label: '时间' },
        { value: 'location', label: '布点区域' },
        { value: 'boolean', label: '布尔' },
        { value: 'image', label: '图片' },
        { value: 'cda-image', label: 'CDA图片' }
      ],
      
      // 弹窗相关
      showTagModal: false,
      isEditModal: false,
      editTagIndex: -1,
      currentTag: {
        _id: '',
        name: '',
        type: 'text',
        description: '',
        defaultValue: ''
      }
    }
  },

  onLoad(options) {
    this.taskId = options.taskId;
    this.taskInfo.taskNo = decodeURIComponent(options.taskNo || '');
    this.taskInfo.taskName = decodeURIComponent(options.taskName || '');
    
    if (this.taskId) {
      this.loadTaskDetail();
    }
  },

  methods: {

    // 加载任务详情
    async loadTaskDetail() {
      this.loading = true;
      
      try {
        // 模拟数据 - 实际应该调用API获取任务详情
        this.taskInfo = {
          _id: this.taskId,
          taskNo: this.taskInfo.taskNo,
          taskName: this.taskInfo.taskName,
          templateName: '温度验证模板',
          tags: []
        };
        
        // 模拟标签数据
        this.formattedTags = [
          {
            _id: 'tag1',
            name: '温度记录',
            type: 'number',
            description: '记录当前环境温度',
            value: '25.5',
            defaultValue: '20.0'
          },
          {
            _id: 'tag2',
            name: '测量时间',
            type: 'datetime',
            description: '温度测量的时间点',
            value: '2024-01-15 14:30',
            defaultValue: '2024-01-15 00:00'
          },
          {
            _id: 'tag3',
            name: '布点位置',
            type: 'location',
            description: '温度传感器布点区域',
            value: '001,002,003',
            defaultValue: '001'
          },
          {
            _id: 'tag4',
            name: '是否合格',
            type: 'boolean',
            description: '温度是否在合格范围内',
            value: true,
            defaultValue: false
          }
        ];
        
      } catch (error) {
        console.error('加载任务详情失败:', error);
        uni.showToast({
          title: error.message || '加载任务详情失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 获取标签类型名称
    getTagTypeName(type) {
      const typeMap = {
        'text': '文本',
        'number': '数字',
        'date': '日期',
        'datetime': '时间',
        'location': '布点区域',
        'boolean': '布尔',
        'image': '图片',
        'cda-image': 'CDA图片'
      };
      return typeMap[type] || type;
    },

    // 获取标签组件
    getTagComponent(type) {
      const componentMap = {
        'text': 'text-input',
        'number': 'number-input',
        'date': 'date-picker',
        'datetime': 'datetime-picker',
        'location': 'location-input',
        'boolean': 'boolean-switch',
        'image': 'image-viewer',
        'cda-image': 'cda-image-viewer'
      };
      return componentMap[type] || 'text-input';
    },

    // 获取默认值组件
    getDefaultValueComponent(type) {
      return this.getTagComponent(type);
    },

    // 更新标签值
    updateTagValue(index, value) {
      if (this.formattedTags[index]) {
        this.formattedTags[index].value = value;
      }
    },

    // 显示添加标签弹窗
    showAddTagModal() {
      this.isEditModal = false;
      this.editTagIndex = -1;
      this.currentTag = {
        _id: '',
        name: '',
        type: 'text',
        description: '',
        defaultValue: ''
      };
      this.showTagModal = true;
    },

    // 编辑标签
    editTag(index) {
      this.isEditModal = true;
      this.editTagIndex = index;
      const tag = this.formattedTags[index];
      this.currentTag = {
        _id: tag._id,
        name: tag.name,
        type: tag.type,
        description: tag.description,
        defaultValue: tag.defaultValue || ''
      };
      this.showTagModal = true;
    },

    // 删除标签
    deleteTag(index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个标签吗？',
        success: (res) => {
          if (res.confirm) {
            this.formattedTags.splice(index, 1);
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }
      });
    },

    // 标签类型改变
    onTagTypeChange(e) {
      const selectedIndex = e.detail.value;
      this.currentTag.type = this.tagTypes[selectedIndex].value;
    },

    // 获取选中的标签类型标签
    getSelectedTagTypeLabel() {
      const selectedType = this.tagTypes.find(type => type.value === this.currentTag.type);
      return selectedType ? selectedType.label : '请选择类型';
    },

    // 关闭标签弹窗
    closeTagModal() {
      this.showTagModal = false;
    },

    // 确认标签弹窗
    confirmTagModal() {
      if (!this.currentTag.name.trim()) {
        uni.showToast({
          title: '请输入标签名称',
          icon: 'none'
        });
        return;
      }

      if (this.isEditModal) {
        // 编辑模式
        const tag = this.formattedTags[this.editTagIndex];
        tag.name = this.currentTag.name;
        tag.type = this.currentTag.type;
        tag.description = this.currentTag.description;
        tag.defaultValue = this.currentTag.defaultValue;
      } else {
        // 添加模式
        const newTag = {
          _id: 'tag' + Date.now(),
          name: this.currentTag.name,
          type: this.currentTag.type,
          description: this.currentTag.description,
          value: this.currentTag.defaultValue,
          defaultValue: this.currentTag.defaultValue
        };
        this.formattedTags.push(newTag);
      }

      this.closeTagModal();
      uni.showToast({
        title: this.isEditModal ? '编辑成功' : '添加成功',
        icon: 'success'
      });
    },

    // 保存标签
    async saveTags() {
      try {
        // 这里应该调用API保存标签数据
        console.log('保存的标签数据:', this.formattedTags);
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('保存标签失败:', error);
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<!-- 标签类型组件 -->
<template>
  <!-- 文本输入组件 -->
  <component name="text-input">
    <input 
      :value="tag.value" 
      @input="$emit('update', $event.target.value)"
      class="tag-input"
      placeholder="请输入文本内容"
    />
  </component>

  <!-- 数字输入组件 -->
  <component name="number-input">
    <input 
      :value="tag.value" 
      @input="onNumberInput($event.target.value)"
      class="tag-input"
      type="number"
      step="0.1"
      placeholder="请输入数字"
    />
  </component>

  <!-- 日期选择组件 -->
  <component name="date-picker">
    <view class="date-picker-wrapper" @click="showDatePicker">
      <text class="date-text">{{ formatDate(tag.value) }}</text>
      <text class="date-icon">📅</text>
    </view>
  </component>

  <!-- 时间选择组件 -->
  <component name="datetime-picker">
    <view class="datetime-picker-wrapper" @click="showDateTimePicker">
      <text class="datetime-text">{{ formatDateTime(tag.value) }}</text>
      <text class="datetime-icon">⏰</text>
    </view>
  </component>

  <!-- 布点区域输入组件 -->
  <component name="location-input">
    <textarea 
      :value="tag.value" 
      @input="$emit('update', $event.target.value)"
      class="location-textarea"
      placeholder="请输入布点区域，用逗号分隔，如：001,002,003"
    />
  </component>

  <!-- 布尔开关组件 -->
  <component name="boolean-switch">
    <switch 
      :checked="tag.value" 
      @change="$emit('update', $event.target.checked)"
      color="#667eea"
    />
    <text class="boolean-label">{{ tag.value ? '是' : '否' }}</text>
  </component>

  <!-- 图片查看组件 -->
  <component name="image-viewer">
    <view class="image-viewer-wrapper" @click="viewImage">
      <image 
        v-if="tag.value" 
        :src="tag.value" 
        class="preview-image"
        mode="aspectFill"
      />
      <view v-else class="no-image">
        <text>暂无图片</text>
      </view>
      <button class="upload-btn" @click.stop="uploadImage">上传图片</button>
    </view>
  </component>

  <!-- CDA图片查看组件 -->
  <component name="cda-image-viewer">
    <view class="cda-image-wrapper" @click="viewCDAImage">
      <view class="cda-placeholder">
        <text>CDA图片</text>
        <text class="cda-desc">点击查看</text>
      </view>
    </view>
  </component>
</template>

<script>
// 数字输入处理方法
function onNumberInput(value) {
  // 验证数字格式，保留一位小数
  const num = parseFloat(value);
  if (!isNaN(num)) {
    const formatted = Math.round(num * 10) / 10; // 保留一位小数
    this.$emit('update', formatted.toString());
  } else {
    this.$emit('update', value);
  }
}

// 日期格式化
function formatDate(dateStr) {
  if (!dateStr) return '请选择日期';
  return dateStr.split(' ')[0]; // 只显示日期部分
}

// 时间格式化
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '请选择时间';
  return dateTimeStr;
}

// 显示日期选择器
function showDatePicker() {
  uni.datePicker({
    mode: 'date',
    success: (res) => {
      this.$emit('update', res.date);
    }
  });
}

// 显示时间选择器
function showDateTimePicker() {
  uni.datePicker({
    mode: 'datetime',
    success: (res) => {
      this.$emit('update', res.date);
    }
  });
}

// 上传图片
function uploadImage() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      // 这里应该上传到服务器
      this.$emit('update', tempFilePath);
    }
  });
}

// 查看图片
function viewImage() {
  if (this.tag.value) {
    uni.previewImage({
      urls: [this.tag.value]
    });
  }
}

// 查看CDA图片
function viewCDAImage() {
  uni.showToast({
    title: 'CDA图片查看功能待开发',
    icon: 'none'
  });
}
</script>

<style scoped>
.task-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.page-header {
  background: white;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.task-info-card {
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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
  font-weight: 500;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: normal;
  max-width: 60%;
  text-align: right;
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
  position: relative;
  padding-left: 20rpx;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 30rpx;
  background: #667eea;
  border-radius: 3rpx;
}

.tags-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.tag-item-card {
  background: #fafafa;
  border-radius: 15rpx;
  padding: 25rpx;
  border: 1rpx solid #eee;
}

.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.tag-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.tag-type {
  font-size: 24rpx;
  color: #667eea;
  background: #f0f4ff;
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
}

.tag-description {
  margin-bottom: 20rpx;
}

.desc-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.tag-content {
  margin-bottom: 20rpx;
}

.tag-actions {
  display: flex;
  gap: 15rpx;
  justify-content: flex-end;
}

.add-tag-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 10rpx 20rpx;
  font-size: 26rpx;
}

/* 标签输入组件样式 */
.tag-input {
  width: 100%;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.location-textarea {
  width: 100%;
  height: 120rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 15rpx 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

/* 日期时间选择器样式 */
.date-picker-wrapper, .datetime-picker-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
}

.date-text, .datetime-text {
  font-size: 28rpx;
  color: #333;
}

.date-icon, .datetime-icon {
  font-size: 32rpx;
}

/* 布尔开关样式 */
.boolean-switch {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.boolean-label {
  font-size: 28rpx;
  color: #333;
}

/* 图片查看器样式 */
.image-viewer-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15rpx;
}

.preview-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
}

.no-image {
  width: 200rpx;
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.upload-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 10rpx 25rpx;
  font-size: 26rpx;
}

/* CDA图片样式 */
.cda-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150rpx;
  background: #f0f8ff;
  border-radius: 10rpx;
  border: 1rpx dashed #667eea;
}

.cda-placeholder {
  text-align: center;
}

.cda-placeholder text:first-child {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10rpx;
}

.cda-desc {
  font-size: 24rpx;
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
  background: white;
  border-radius: 15rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
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
  max-height: 60vh;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  height: 120rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 15rpx 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.picker-display {
  width: 100%;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #333;
}

.modal-footer {
  display: flex;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
  gap: 20rpx;
}

.modal-btn {
  flex: 1;
  height: 70rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.cancel {
  background: #f5f5f5;
  color: #666;
  border: none;
}

.confirm {
  background: #667eea;
  color: white;
  border: none;
}

/* 小按钮样式 */
.action-btn.small {
  height: 50rpx;
  font-size: 24rpx;
  padding: 0 20rpx;
  border-radius: 8rpx;
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

.no-tags {
  text-align: center;
  padding: 30rpx 0;
}

.no-tags-text {
  font-size: 28rpx;
  color: #999;
}

.actions-section {
  display: flex;
  gap: 20rpx;
  padding: 0 20rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 15rpx;
  font-size: 30rpx;
  font-weight: bold;
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

.action-btn:active {
  opacity: 0.8;
}

/* 组件方法绑定 */
.component-methods {
  display: none;
}
</style>
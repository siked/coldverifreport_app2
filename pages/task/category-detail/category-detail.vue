<template>
  <view class="task-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">{{ categoryName }}</text>
      <text v-if="templateName" class="template-name">{{ templateName }}</text>
    </view>

    <!-- 任务列表 -->
    <scroll-view 
      class="task-list" 
      :class="{ 'task-list-with-footer': hasUnsavedTasks }"
      scroll-y="true"
      :scroll-top="scrollTop"
      @scroll="onScroll"
      :enable-back-to-top="true"
      refresher-enabled="true"
      :refresher-triggered="refresherTriggered"
      @refresherrefresh="onRefresherRefresh"
    >
      <block v-for="(task, index) in tasks" :key="task._id">
        <view 
          class="task-item" 
          :class="{ 'task-item-unsaved': task.hasUnsavedTags }"
          @click="goToTaskDetail(task)"
        >
          <view class="task-header">
            <text class="task-name">{{ task.taskName }}</text>
            <text class="task-no">{{ task.taskNo }}</text>
          </view>
        </view>
      </block>

      <!-- 空状态 -->
      <view v-if="tasks.length === 0 && !loading" class="empty-state">
        <text class="empty-text">该分类下暂无任务</text>
      </view>
    </scroll-view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 全部提交按钮和进度条 -->
    <view v-if="hasUnsavedTasks" class="submit-footer">
      <!-- 进度条 -->
      <view v-if="isSubmitting" class="progress-container">
        <view class="progress-info">
          <text class="progress-text">正在提交: {{ currentSubmitIndex + 1 }} / {{ totalSubmitCount }}</text>
          <text class="progress-percent">{{ progressPercent }}%</text>
        </view>
        <view class="progress-bar">
          <view class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="progress-task-name">{{ currentSubmitTaskName }}</text>
      </view>
      
      <!-- 提交按钮 -->
      <view class="submit-button-container">
        <button 
          class="submit-button" 
          :disabled="isSubmitting"
          @click="submitAllUnsavedTasks"
        >
          {{ isSubmitting ? '提交中...' : `全部提交 (${unsavedTasksCount})` }}
        </button>
      </view>
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
      templateName: '',
      tasks: [],
      loading: false,
      cacheKey: '',
      scrollTop: 0,
      currentScrollTop: 0,
      refresherTriggered: false,
      // 提交相关状态
      isSubmitting: false,
      currentSubmitIndex: 0,
      totalSubmitCount: 0,
      currentSubmitTaskName: ''
    }
  },

  computed: {
    // 是否有未提交的任务
    hasUnsavedTasks() {
      return this.tasks.some(task => task.hasUnsavedTags);
    },
    // 未提交任务数量
    unsavedTasksCount() {
      return this.tasks.filter(task => task.hasUnsavedTags).length;
    },
    // 进度百分比
    progressPercent() {
      if (this.totalSubmitCount === 0) return 0;
      return Math.round(((this.currentSubmitIndex + 1) / this.totalSubmitCount) * 100);
    }
  },

  onLoad(options) {
    this.categoryId = options.categoryId;
    this.categoryName = decodeURIComponent(options.categoryName);
    this.cacheKey = `${this.categoryId}_tasks`; // 使用categoryId_tasks格式作为缓存key
    
    if (this.categoryId) {
      this.loadTasks();
    }
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
    // 页面显示时，重新从缓存加载任务列表（以获取最新的状态，如 hasUnsavedTags）
    // 这样当从任务详情页返回时，能立即看到最新的状态更新
    // 立即执行一次更新，然后延迟再执行一次，确保缓存已更新
    this.refreshTasksFromCache();
    
    this.$nextTick(() => {
      // 延迟执行，确保任务详情页的缓存更新已完成
      setTimeout(() => {
        this.refreshTasksFromCache();
        // 恢复滚动位置
        this.restoreScrollPosition();
      }, 100);
    });
  },

  onHide() {
    // 页面隐藏时保存当前滚动位置
    this.saveScrollPosition();
  },

  onUnload() {
    // 页面卸载时保存滚动位置
    this.saveScrollPosition();
  },

  onPullDownRefresh() {
    // 上拉刷新时询问是否更新数据
    uni.showModal({
      title: '更新数据',
      content: '是否从服务器获取最新数据？',
      confirmText: '更新',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 用户确认更新，强制刷新数据
          this.loadTasks(true).finally(() => {
            uni.stopPullDownRefresh();
          });
        } else {
          // 用户取消更新，停止刷新动画
          uni.stopPullDownRefresh();
        }
      },
      fail: () => {
        // 如果显示模态框失败，也停止刷新动画
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
      
      return [...tasks].sort((a, b) => {
        // 优先使用 taskNo 排序，如果没有则使用 taskName
        const aValue = (a.taskNo || a.taskName || '').toString().trim();
        const bValue = (b.taskNo || b.taskName || '').toString().trim();
        
        // 使用 localeCompare 进行本地化排序，支持中文和字母混合
        // 'zh-CN' 或 'zh-Hans-CN' 支持中文拼音排序
        // numeric: true 支持数字排序
        // sensitivity: 'base' 忽略大小写和重音
        return aValue.localeCompare(bValue, 'zh-CN', {
          numeric: true,
          sensitivity: 'base'
        });
      });
    },

    // scroll-view 下拉刷新
    onRefresherRefresh() {
      this.refresherTriggered = true;
      uni.showModal({
        title: '更新数据',
        content: '是否从服务器获取最新数据？',
        confirmText: '更新',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
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
      if (!this.categoryId) return;

      this.loading = true;
      
      try {
        // 如果不是强制刷新，先尝试从缓存获取数据
        if (!forceRefresh) {
          const cachedData = uni.getStorageSync(this.cacheKey);
          if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
            console.log('从缓存加载任务数据:', this.cacheKey, '任务数量:', cachedData.tasks.length);
            // 从缓存的任务列表中提取模板名称
            if (cachedData.tasks.length > 0 && cachedData.tasks[0].templateName) {
              this.templateName = cachedData.tasks[0].templateName;
            }
            // 对缓存中的任务进行排序
            const sortedTasks = this.sortTasks(cachedData.tasks);
            // 先设置数据，再关闭 loading，避免闪烁
            this.$nextTick(() => {
              this.tasks = sortedTasks;
              this.loading = false;
              // 恢复滚动位置
              this.restoreScrollPosition();
            });
            return;
          } else {
            console.log('缓存未找到或已过期，从API获取数据:', this.cacheKey);
          }
        }
        
        // 从API获取数据
        const tasks = await apiService.getTasks(this.categoryId);
        // 为每条任务增加"未提交标签"标记字段，默认认为从服务器拉取的是已提交状态
        const tasksWithFlag = (tasks || []).map(task => ({
          ...task,
          hasUnsavedTags: task.hasUnsavedTags || false
        }));
        
        // 从任务列表中提取模板名称（同一分类下的任务应该使用相同的模板）
        if (tasksWithFlag.length > 0 && tasksWithFlag[0].templateName) {
          this.templateName = tasksWithFlag[0].templateName;
        }
        
        // 对任务列表进行排序
        const sortedTasks = this.sortTasks(tasksWithFlag);
        
        // 读取现有缓存以保留滚动位置等数据
        const existingCache = uni.getStorageSync(this.cacheKey) || {};
        
        // 将数据保存到缓存，保留原有的 data 信息
        uni.setStorageSync(this.cacheKey, {
          tasks: sortedTasks,
          timestamp: Date.now(),
          data: existingCache.data || {} // 保留原有的 data 信息（包括滚动位置）
        });
        
        console.log('数据已保存到缓存:', this.cacheKey, '任务数量:', sortedTasks.length);
        
        this.tasks = sortedTasks;
      } catch (error) {
        console.error('加载任务失败:', error);
        uni.showToast({
          title: error.message || '加载任务失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // scroll-view 滚动事件处理
    onScroll(e) {
      // 更新当前滚动位置
      const scrollTop = e.detail.scrollTop || 0;
      this.currentScrollTop = scrollTop;
    },

    // 保存滚动位置到缓存
    saveScrollPosition() {
      try {
        const scrollTop = this.currentScrollTop || 0;
        
        if (scrollTop <= 0) {
          return; // 不需要保存0位置
        }
        
        // 读取现有缓存
        const cachedData = uni.getStorageSync(this.cacheKey);
        if (cachedData) {
          // 更新缓存，添加或更新 data.scrollPosition
          uni.setStorageSync(this.cacheKey, {
            ...cachedData,
            data: {
              ...(cachedData.data || {}),
              scrollPosition: scrollTop
            }
          });
          console.log('任务列表滚动位置已保存:', this.cacheKey, scrollTop);
        }
      } catch (error) {
        console.error('保存滚动位置失败:', error);
      }
    },

    // 从缓存恢复滚动位置
    restoreScrollPosition() {
      try {
        const cachedData = uni.getStorageSync(this.cacheKey);
        if (cachedData && cachedData.data && cachedData.data.scrollPosition) {
          const savedScrollTop = cachedData.data.scrollPosition;
          if (savedScrollTop > 0 && Math.abs(this.currentScrollTop - savedScrollTop) > 10) {
            // 只有当滚动位置差异较大时才恢复，避免不必要的更新
            this.$nextTick(() => {
              // 直接设置滚动位置，避免先重置为0导致的闪烁
              this.scrollTop = savedScrollTop;
              this.currentScrollTop = savedScrollTop;
              console.log('任务列表滚动位置已恢复:', this.cacheKey, savedScrollTop);
            });
          }
        }
      } catch (error) {
        console.error('恢复滚动位置失败:', error);
      }
    },

    // 从缓存刷新任务列表（不调用API，仅读取缓存中的最新数据）
    refreshTasksFromCache() {
      try {
        if (!this.cacheKey) return;
        
        const cachedData = uni.getStorageSync(this.cacheKey);
        if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
          // 创建新数组引用并排序，确保 Vue 能够检测到变化
          const newTasks = this.sortTasks(cachedData.tasks.map(task => ({ ...task })));
          
          // 直接更新数组，Vue 的响应式系统会检测到 hasUnsavedTags 的变化
          // 由于模板中使用了 :class="{ 'task-item-unsaved': task.hasUnsavedTags }"
          // Vue 会自动更新对应的 DOM
          this.tasks = newTasks;
          
          console.log('从缓存刷新任务列表数据:', this.cacheKey, '任务数量:', newTasks.length);
          console.log('任务列表状态已更新，hasUnsavedTags 状态:', 
            newTasks.map(t => ({ id: t._id, name: t.taskName, hasUnsavedTags: t.hasUnsavedTags }))
          );
        }
      } catch (error) {
        console.warn('从缓存刷新任务列表失败:', error);
      }
    },

    // 跳转到任务详情页面
    goToTaskDetail(task) {
      // 将tags数据序列化后传递
      const tagsParam = task.tags ? encodeURIComponent(JSON.stringify(task.tags)) : '';
      
      uni.navigateTo({
        url: `/pages/task/task-detail/task-detail?taskId=${task._id}&taskName=${encodeURIComponent(task.taskName)}&taskNo=${encodeURIComponent(task.taskNo)}&tags=${tagsParam}&categoryId=${this.categoryId}`
      });
    },

    // 获取网络状态
    async getNetworkType() {
      return new Promise((resolve) => {
        uni.getNetworkType({
          success: (res) => {
            resolve(res.networkType);
          },
          fail: () => {
            resolve('unknown');
          }
        });
      });
    },

    // 从缓存中获取任务的完整标签数据
    getTaskTagsFromCache(taskId) {
      try {
        const cachedData = uni.getStorageSync(this.cacheKey);
        if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
          const task = cachedData.tasks.find(t => t._id === taskId);
          if (task && task.tags) {
            return task.tags.map(tag => ({
              _id: tag._id || '',
              name: tag.name || '',
              type: tag.type || 'text',
              description: tag.description || '',
              value: tag.value !== undefined ? tag.value : (tag.defaultValue || ''),
              localImagePath: tag.localImagePath || ''
            }));
          }
        }
        return null;
      } catch (error) {
        console.error('从缓存获取任务标签失败:', error);
        return null;
      }
    },

    // 从缓存中获取任务的 deviceSnList
    getTaskDeviceSnListFromCache(taskId) {
      try {
        const cachedData = uni.getStorageSync(this.cacheKey);
        if (cachedData && cachedData.tasks && Array.isArray(cachedData.tasks)) {
          const task = cachedData.tasks.find(t => t._id === taskId);
          if (task && Array.isArray(task.deviceSnList)) {
            return task.deviceSnList.map(d => ({
              deviceId: d && d.deviceId !== undefined ? d.deviceId : '',
              deviceSn: d && d.deviceSn !== undefined ? d.deviceSn : ''
            }));
          }
        }
        return [];
      } catch (error) {
        console.error('从缓存获取任务 deviceSnList 失败:', error);
        return [];
      }
    },

    // 上传图片
    async uploadImageIfNeeded(tags) {
      const imageTagsNeedingUpload = tags.filter(tag => 
        tag.type === 'image' && tag.localImagePath && !tag.value
      );

      if (imageTagsNeedingUpload.length > 0) {
        const networkType = await this.getNetworkType();
        if (networkType === 'none') {
          throw new Error('当前无网络，无法上传图片，请联网后再提交');
        }

        // 逐个上传图片
        for (const imgTag of imageTagsNeedingUpload) {
          try {
            const uploadResult = await apiService.uploadImage(imgTag.localImagePath);
            if (!uploadResult || !uploadResult.url) {
              throw new Error('上传成功但未返回图片地址');
            }
            // 将真实 URL 写入标签值
            imgTag.value = uploadResult.url;
            imgTag.localImagePath = '';
          } catch (e) {
            console.error('上传图片失败:', e);
            throw new Error(`图片上传失败: ${e.message || '未知错误'}`);
          }
        }
      }
    },

    // 排序location类型的值
    sortLocationValues(values) {
      if (!Array.isArray(values)) {
        return values;
      }
      return [...values].sort((a, b) => {
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
        
        return a.localeCompare(b);
      });
    },

    // 格式化标签数据为API需要的格式
    formatTagsForAPI(tags) {
      return tags.map(tag => {
        let processedValue = tag.value;
        
        // 特殊处理location类型：如果是字符串则转换回数组格式并排序
        if (tag.type === 'location') {
          if (typeof processedValue === 'string') {
            const values = processedValue.split(',').filter(item => item.trim() !== '');
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
          const updatedTasks = cachedData.tasks.map(task => {
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

          // 更新当前任务列表
          this.tasks = this.sortTasks(updatedTasks.map(task => ({ ...task })));
        }
      } catch (error) {
        console.error('更新任务缓存失败:', error);
      }
    },

    // 提交所有未提交的任务
    async submitAllUnsavedTasks() {
      // 获取所有未提交的任务
      const unsavedTasks = this.tasks.filter(task => task.hasUnsavedTags);
      
      if (unsavedTasks.length === 0) {
        uni.showToast({
          title: '没有未提交的任务',
          icon: 'none'
        });
        return;
      }

      // 确认提交
      const confirmResult = await new Promise((resolve) => {
        uni.showModal({
          title: '确认提交',
          content: `确定要提交 ${unsavedTasks.length} 个未提交的任务吗？`,
          confirmText: '确定',
          cancelText: '取消',
          success: (res) => {
            resolve(res.confirm);
          },
          fail: () => {
            resolve(false);
          }
        });
      });

      if (!confirmResult) {
        return;
      }

      // 开始提交
      this.isSubmitting = true;
      this.totalSubmitCount = unsavedTasks.length;
      this.currentSubmitIndex = 0;

      let successCount = 0;
      let failCount = 0;
      const errors = [];

      try {
        for (let i = 0; i < unsavedTasks.length; i++) {
          const task = unsavedTasks[i];
          this.currentSubmitIndex = i;
          this.currentSubmitTaskName = task.taskName || task.taskNo || '未知任务';

          try {
            // 从缓存获取任务的完整标签数据
            const tags = this.getTaskTagsFromCache(task._id);
            
            if (!tags || tags.length === 0) {
              console.warn(`任务 ${task.taskName} 没有标签数据，跳过`);
              continue;
            }

            // 上传图片（如果需要）
            await this.uploadImageIfNeeded(tags);

            // 格式化标签数据
            const tagsToSend = this.formatTagsForAPI(tags);

            // 同时提交 deviceSnList
            const deviceSnList = this.getTaskDeviceSnListFromCache(task._id);

            // 调用API提交标签（含 deviceSnList）
            await apiService.updateTaskTags(task._id, tagsToSend, deviceSnList);

            // 更新缓存状态
            this.updateTaskCacheAfterSubmit(task._id, tagsToSend);

            successCount++;
          } catch (error) {
            console.error(`提交任务 ${task.taskName} 失败:`, error);
            failCount++;
            errors.push({
              taskName: task.taskName || task.taskNo,
              error: error.message || '未知错误'
            });
          }
        }

        // 提交完成
        this.isSubmitting = false;

        // 显示结果
        if (failCount === 0) {
          uni.showToast({
            title: `全部提交成功 (${successCount})`,
            icon: 'success',
            duration: 2000
          });
        } else {
          const errorMsg = errors.map(e => `${e.taskName}: ${e.error}`).join('\n');
          uni.showModal({
            title: '提交完成',
            content: `成功: ${successCount} 个\n失败: ${failCount} 个\n\n失败详情:\n${errorMsg}`,
            showCancel: false,
            confirmText: '确定'
          });
        }

        // 刷新任务列表
        this.refreshTasksFromCache();
      } catch (error) {
        this.isSubmitting = false;
        uni.showToast({
          title: '提交过程出错: ' + (error.message || '未知错误'),
          icon: 'none',
          duration: 3000
        });
      }
    }
  }
}
</script>

<style scoped>
.task-container {
  min-height: 100vh;
  background-color: #f5f5f5;
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
  margin-bottom: 10rpx;
}

.template-name {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}

.task-list {
  height: calc(100vh - 120rpx);
  padding: 20rpx;
  box-sizing: border-box;
}

.task-list-with-footer {
  padding-bottom: 200rpx;
}

.task-item {
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s;
}

.task-item-unsaved {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1rpx solid #fbbf24;
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.task-name {
  flex: 1;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  line-height: 1.5;
  word-break: break-all;
}

.task-no {
  font-size: 26rpx;
  font-weight: 500;
  color: #667eea;
  background: #f0f4ff;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  white-space: nowrap;
  flex-shrink: 0;
}

.task-content {
  margin-bottom: 20rpx;
}

.template-name {
  display: block;
  font-size: 26rpx;
  color: #999;
}

.arrow {
  text-align: right;
  color: #ccc;
  font-size: 28rpx;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.loading {
  text-align: center;
  padding: 30rpx;
  color: #666;
}

/* 底部提交区域 */
.submit-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
}

/* 进度条容器 */
.progress-container {
  padding: 20rpx 30rpx;
  background: #f8f9fa;
  border-bottom: 1rpx solid #eee;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.progress-text {
  font-size: 26rpx;
  color: #666;
}

.progress-percent {
  font-size: 26rpx;
  color: #667eea;
  font-weight: 500;
}

.progress-bar {
  height: 8rpx;
  background: #e5e7eb;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-task-name {
  font-size: 24rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 提交按钮容器 */
.submit-button-container {
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.submit-button {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  border-radius: 44rpx;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.submit-button:disabled {
  background: #ccc;
  box-shadow: none;
  opacity: 0.6;
}

.submit-button::after {
  border: none;
}
</style>
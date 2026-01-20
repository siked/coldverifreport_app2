<template>
  <view class="category-container">

    <!-- 分类列表 -->
    <view class="category-list">
      <block v-for="(category, index) in categories" :key="category._id">
        <view class="category-item" @click="goToCategoryDetail(category)">
          <view class="category-icon">
            <text class="icon-text">{{ getCategoryIcon(category.type) }}</text>
          </view>
          <view class="category-info">
            <view class="category-name-row">
              <text class="category-name">{{ category.name }}</text>
              <text class="path-first">{{ getCategoryPathFirst(category) }}</text>
            </view>
            <view class="path-rest" v-if="getCategoryPathRest(category)">{{ getCategoryPathRest(category) }}</view>
          </view>
          <view class="arrow">▶</view>
        </view>
      </block>

      <!-- 空状态 -->
      <view v-if="categories.length === 0 && !loading" class="empty-state">
        <text class="empty-text">暂无分类数据</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import apiService from '@/common/api.js'

export default {
  data() {
    return {
      categories: [],
      loading: false,
      cacheKey: 'categories_list'
    }
  },

  onLoad() {
    this.loadCategoriesFromCache();
  },

  onPullDownRefresh() {
    // 下拉刷新时询问是否更新数据
    uni.showModal({
      title: '更新数据',
      content: '是否从服务器获取最新数据？',
      confirmText: '更新',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 用户确认更新，强制刷新数据
          this.updateCategoriesFromAPI(true).finally(() => {
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
    // 优先从缓存加载分类列表
    async loadCategoriesFromCache() {
      // 尝试从缓存获取数据
      const cachedData = uni.getStorageSync(this.cacheKey);
      if (cachedData && cachedData.categories && Array.isArray(cachedData.categories)) {
        console.log('从缓存加载分类数据:', this.cacheKey, '分类数量:', cachedData.categories.length);
        this.categories = cachedData.categories;
        return;
      } else {
        console.log('缓存未找到或已过期，从API获取数据:', this.cacheKey);
        // 如果没有缓存，则从API获取数据
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
        
        // 将数据保存到缓存
        uni.setStorageSync(this.cacheKey, {
          categories: categories,
          timestamp: Date.now()
        });
        
        console.log('数据已保存到缓存:', this.cacheKey, '分类数量:', categories.length);
      } catch (error) {
        console.error('更新分类失败:', error);
        uni.showToast({
          title: error.message || '更新分类失败',
          icon: 'none'
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
        'company': '🏢',
        'department': '👥',
        'taskType': '📋',
        'project': '🎯'
      };
      return icons[type] || '📁';
    },

    // 格式化分类路径
    formatCategoryPath(category) {
      if (category.pathNames && category.pathNames.length > 0) {
        return category.pathNames.join(' > ');
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
        return category.pathNames.slice(1).join(' > ');
      }
      return '';
    },

    // 跳转到分类详情页面
    goToCategoryDetail(category) {
      uni.navigateTo({
        url: `/pages/task/category-detail/category-detail?categoryId=${category._id}&categoryName=${encodeURIComponent(category.name)}`
      });
    }
  }
}
</script>

<style scoped>
.category-container {
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
}

.category-list {
  padding: 20rpx;
}

.category-item {
  background: white;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 25rpx;
}

.icon-text {
  font-size: 40rpx;
}

.category-info {
  flex: 1;
}

.category-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
  gap: 10rpx;
}

.category-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  background-color: #f1f1ff;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.path-first {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.path-rest {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  word-wrap: break-word;
}

.arrow {
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
</style>
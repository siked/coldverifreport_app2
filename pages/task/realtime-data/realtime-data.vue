<template>
  <view class="realtime-page">
    <!-- 固定的图表部分 -->
    <view class="chart-panel">
      <view class="chart-header">
        <view class="range-group">
          <button class="range-btn" :class="{ active: rangeMinutes === 60 }" @click="setRange(60)">1小时</button>
          <button class="range-btn" :class="{ active: rangeMinutes === 300 }" @click="setRange(300)">5小时</button>
          <button class="range-btn" :class="{ active: rangeMinutes === 1440 }" @click="setRange(1440)">1天</button>
          <button class="range-btn" :class="{ active: rangeMinutes === 7200 }" @click="setRange(7200)">5天</button>
          <button class="range-btn" :class="{ active: rangeMinutes === 14400 }" @click="setRange(14400)">10天</button>
        </view>
        <view class="toggle-group">
          <button
            class="toggle-btn"
            :class="{ active: chartType === 'temperature' }"
            @click="switchChartType('temperature')"
          >
            温度
          </button>
          <button
            class="toggle-btn"
            :class="{ active: chartType === 'humidity' }"
            @click="switchChartType('humidity')"
          >
            湿度
          </button>
        </view>
      </view>

      <view class="chart-box">
        <canvas
          canvas-id="realtimeLine"
          id="realtimeLine"
          class="chart-canvas"
          :width="Math.round(cWidth * pixelRatio)"
          :height="Math.round(cHeight * pixelRatio)"
          :style="{ width: cWidth + 'px', height: cHeight + 'px' }"
          @touchstart="touchLine"
          @touchmove="moveLine"
          @touchend="touchEnd"
        ></canvas>
        <view v-if="isLoading" class="loading-overlay" aria-label="曲线数据加载中">
          <view class="loading-spinner"></view>
        </view>
        <view v-if="!chartHasData && !isLoading" class="placeholder">
          正在加载设备数据...
        </view>
      </view>
      <view v-if="chartHasData && !isLoading" class="chart-stats">

        <view class="stat-item">
          <text class="stat-label">最大值</text>
          <text class="stat-value">
            {{ formatStat(chartStats.max) }}
            <text class="stat-unit">{{ currentUnit }}</text>
          </text>
        </view>
        <view class="stat-item">
          <text class="stat-label">平均值</text>
          <text class="stat-value">
            {{ formatStat(chartStats.avg) }}
            <text class="stat-unit">{{ currentUnit }}</text>
          </text>
        </view>
        <view class="stat-item">
          <text class="stat-label">最小值</text>
          <text class="stat-value">
            {{ formatStat(chartStats.min) }}
            <text class="stat-unit">{{ currentUnit }}</text>
          </text>
        </view>
      </view>
    </view>

    <!-- 可滚动的设备列表 -->
    <view class="device-list-panel">
      <view class="device-list-section">
        <view class="device-list-header">
          <view class="device-list-header-left">
            <text class="device-list-title">设备数据统计</text>
            <text class="device-list-subtitle">{{ deviceList.length }}个设备</text>
            <text
              class="device-latest-global"
              aria-label="最新时间"
              title="最新时间"
            >
              🕒 {{ latestDataTimeDisplay || '--' }}
            </text>
            <text
              v-if="isLoading"
              class="loading-text-inline"
              aria-label="加载中"
              title="加载中"
            >
              ⏳
            </text>
            <text
              v-if="errorMsg && !isLoading"
              class="error-text-inline"
              :aria-label="`错误：${errorMsg}`"
              :title="errorMsg"
            >
              ⚠️
            </text>
          </view>
        </view>
        <view v-if="chartData.devices && chartData.devices.length > 0" class="device-list">
          <view
            v-for="(device, index) in chartData.devices"
            :key="index"
            class="device-item"
          >
            <view class="device-row">
              <view class="device-main">
                <text class="device-label">
                  {{ device.deviceId || device.deviceSn || `设备${index + 1}` }}
                </text>
                <text
                  v-if="device.deviceSn && device.deviceSn !== device.deviceId"
                  class="device-sn-inline"
                >
                  ({{ device.deviceSn }})
                </text>
                <text class="device-latest-inline">🕒:{{ formatDeviceLatestTime(device) }}</text>
              </view>
              <view class="device-count-inline">
                <text class="count-label" aria-label="数据条数">📊</text>
                <text
                  class="count-value"
                  :class="getDeviceCountStatus(device)"
                >
                  {{ getDeviceDataCount(device) }}
                </text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-device-list">
          <text>暂无设备数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import uCharts from '@/components/u-charts/u-charts.js'
import apiService from '@/common/api.js'

export default {
  data() {
    return {
      taskId: '',
      deviceList: [],
      chartType: 'temperature', // temperature | humidity
      rangeMinutes: 60,
      chartData: {
        categories: [],
        devices: [] // 每个设备的数据: { deviceId, deviceSn, temperature: [], humidity: [] }
      },
      errorMsg: '',
      isLoading: false,
      cWidth: 0,
      cHeight: 0,
      pixelRatio: 1,
      // 视觉缩放（用于移动端让刻度/线条不显得过大）
      chartScale: 1,
      lineChart: null,
      pendingRedraw: false,
      latestTimestamp: null // 记录全局最新的时间戳
    }
  },
  computed: {
    chartHasData() {
      return this.chartData.categories && this.chartData.categories.length > 0 && 
             this.chartData.devices && this.chartData.devices.length > 0
    },
    currentUnit() {
      return this.chartType === 'temperature' ? '℃' : '%RH'
    },
    latestDataTimeDisplay() {
      return this.formatFullTimestamp(this.latestTimestamp)
    },
    chartStats() {
      const devices = this.chartData.devices || []
      const key = this.chartType === 'temperature' ? 'temperature' : 'humidity'
      const values = []
      devices.forEach(d => {
        const arr = Array.isArray(d[key]) ? d[key] : []
        arr.forEach(v => {
          const num = Number(v)
          if (Number.isFinite(num)) values.push(num)
        })
      })
      if (values.length === 0) {
        return { avg: null, max: null, min: null }
      }
      const sum = values.reduce((acc, cur) => acc + cur, 0)
      return {
        avg: sum / values.length,
        max: Math.max(...values),
        min: Math.min(...values)
      }
    }
  },
  onLoad(options) {
    this.taskId = options.taskId || ''
    const sys = uni.getSystemInfoSync()
    // 真机端（APP/小程序）canvas + DPR 容易产生“视觉偏大/偏粗”的观感，这里采取更保守策略：
    // - H5：保留 DPR 上限 2（更清晰）
    // - 非 H5：固定为 1（更接近设计稿观感，避免元素显得过大）
    const pr = Number(sys.pixelRatio) || 1
    // #ifdef H5
    this.pixelRatio = pr > 1 ? Math.min(2, pr) : 1
    // #endif
    // #ifndef H5
    this.pixelRatio = 1
    // #endif

    // 基于屏幕宽度做更强的视觉缩放（不影响数据，只影响字体/线宽/padding）
    const ww = Number(sys.windowWidth) || 375
    this.chartScale = Math.max(0.65, Math.min(0.95, ww / 430))
    // 先给一个兜底值（真机上 selectorQuery 可能一开始拿到 0），后续会用 ensureCanvasSize 纠正
    // 注意：本页 chart-panel 水平 padding 为 0（见样式），这里不再额外扣减，避免 cWidth 偏小
    this.cWidth = Math.max(1, (sys.windowWidth || uni.upx2px(750)))
    // 曲线图高度放大一倍：360rpx -> 720rpx
    this.cHeight = uni.upx2px(720)
    this.loadDeviceFromCache()
  },
  onReady() {
    // 真机（APP/小程序）下 canvas 尺寸有概率首次取到 0，这里做重试确保拿到真实宽高后再建图
    this.ensureCanvasSize()
  },
  onShow() {
    // 从后台返回/页面重新显示时，重新确认尺寸，避免真机偶发空白
    this.ensureCanvasSize()
  },
  async onPullDownRefresh() {
    // 下拉刷新时重新拉取数据，并在完成后停止下拉动画
    if (this.isLoading) {
      uni.stopPullDownRefresh()
      return
    }
    try {
      await this.fetchAllDevicesData()
    } finally {
      uni.stopPullDownRefresh()
    }
  },
  methods: {
    ensureCanvasSize() {
      const tryGetSize = (leftTry = 6) => {
        this.$nextTick(() => {
          const q = uni.createSelectorQuery().in(this)
          // 用外层容器宽度做基准（canvas 的宽度本身由 cWidth 绑定，会形成“取值=设置值”的循环）
          q.select('.chart-box')
            .boundingClientRect(rect => {
              const w = rect && rect.width ? Math.round(rect.width) : 0
              const h = rect && rect.height ? Math.round(rect.height) : 0
              if (w > 0 && h > 0) {
                const changed = this.cWidth !== w || this.cHeight !== h
                this.cWidth = w
                // 高度用固定值更稳定（避免 border/padding 导致的微抖动）
                // canvas 视觉高度由 style 控制，这里保持原先的 cHeight
                // 如果图表已经有数据，且尺寸刚拿到/发生变化，重建一次（APP 真机最关键）
                if (this.chartHasData && (this.pendingRedraw || changed)) {
                  this.rebuildChart()
                  this.pendingRedraw = false
                }
                return
              }
              if (leftTry > 0) {
                setTimeout(() => tryGetSize(leftTry - 1), 80)
              } else {
                // 兜底：保持 onLoad 的安全尺寸；如果已有数据则尝试重建一次
                if (this.chartHasData) {
                  this.rebuildChart()
                }
              }
            })
            .exec()
        })
      }
      tryGetSize()
    },
    setRange(minutes) {
      if (this.rangeMinutes === minutes) return
      this.rangeMinutes = minutes
      this.fetchAllDevicesData()
    },
    loadDeviceFromCache() {
      try {
        const keys = uni.getStorageInfoSync().keys || []
        for (const key of keys) {
          if (!key.endsWith('_tasks')) continue
          const cached = uni.getStorageSync(key)
          const tasks = (cached && cached.tasks) || (cached && cached.data && cached.data.tasks)
          if (!Array.isArray(tasks)) continue
          const found = tasks.find(t => t && (t._id === this.taskId || t.taskId === this.taskId))
          if (found && Array.isArray(found.deviceSnList)) {
            this.deviceList = found.deviceSnList.map((d, idx) => ({
              __key: d.__key || `dev_${idx}`,
              deviceId: d.deviceId || '',
              deviceSn: d.deviceSn || ''
            }))
            // 自动加载所有设备的数据
            if (this.deviceList.length > 0) {
              this.fetchAllDevicesData()
            }
            return
          }
        }
        this.deviceList = []
      } catch (e) {
        console.warn('读取设备缓存失败', e)
        this.deviceList = []
      }
    },

    async fetchAllDevicesData() {
      if (!this.deviceList || this.deviceList.length === 0) {
        return
      }
      this.isLoading = true
      this.errorMsg = ''
      try {
        // 过滤出有 deviceSn 的设备
        const validDevices = this.deviceList.filter(d => d && d.deviceSn)
        if (validDevices.length === 0) {
          this.errorMsg = '没有有效的设备SN'
          this.isLoading = false
          return
        }
        
        // 并行加载所有设备的数据
        const devicePromises = validDevices.map(async (device) => {
          try {
            const sql = `SELECT temperature, humidity FROM root.cvdd.${device.deviceSn}  LIMIT ${this.rangeMinutes}`
            const data = await apiService.post('/api/iotdb/query', { sql }, { auth: false })
            const timestamps = data.timestamps || []
            const toNumberOrNull = v => {
              const num = Number(v)
              return Number.isFinite(num) ? num : null
            }
            const temperature = ((data.values && data.values[0]) || []).map(toNumberOrNull)
            const humidity = ((data.values && data.values[1]) || []).map(toNumberOrNull)
            return {
              deviceId: device.deviceId || '',
              deviceSn: device.deviceSn || '',
              timestamps,
              temperature,
              humidity
            }
          } catch (e) {
            console.error(`加载设备 ${device.deviceSn} 数据失败:`, e)
            return null
          }
        })
        
        const results = await Promise.all(devicePromises)
        const validResults = results.filter(r => r !== null && r.timestamps && r.timestamps.length > 0)
        
        if (validResults.length === 0) {
          this.errorMsg = '所有设备数据加载失败'
          this.chartData = { categories: [], devices: [] }
          this.latestTimestamp = null
          this.clearChart()
          return
        }
        
        // 使用第一个设备的时间戳作为基准（假设所有设备时间戳一致）
        const baseTimestamps = this.normalizeTimestampList(validResults[0].timestamps)
        const categories = baseTimestamps.map(ts => this.formatTime(ts))
        this.latestTimestamp = this.getLatestTimestamp(baseTimestamps)
        
        // 构建设备数据数组
        const devices = validResults.map(r => {
          const normalizedTs = this.normalizeTimestampList(r.timestamps)
          return {
            deviceId: r.deviceId,
            deviceSn: r.deviceSn,
            temperature: r.temperature,
            humidity: r.humidity,
            timestamps: normalizedTs,
            latestTimestamp: this.getLatestTimestamp(normalizedTs)
          }
        })
        
        this.chartData = {
          categories,
          devices
        }
        this.drawLine()
      } catch (e) {
        console.error('获取所有设备数据失败', e)
        this.errorMsg = e && e.message ? e.message : '请求失败'
        this.chartData = { categories: [], devices: [] }
        this.latestTimestamp = null
        this.clearChart()
      } finally {
        this.isLoading = false
      }
    },

    formatTime(ts) {
      const d = new Date(Number(ts))
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      // uCharts x轴标签不支持 \n 换行，这里用 "|" 作为两行分隔符，u-charts.js 已兼容两行绘制
      return `${mm}-${dd}|${hh}:${mi}`
    },

    // 规范化时间戳列表
    normalizeTimestampList(list) {
      if (!Array.isArray(list)) return []
      return list
        .map(v => Number(v))
        .filter(v => Number.isFinite(v))
    },

    // 取列表中最新的时间戳
    getLatestTimestamp(list) {
      const arr = this.normalizeTimestampList(list)
      if (!arr.length) return null
      return Math.max(...arr)
    },

    // 格式化完整时间 YYYY-MM-DD HH:MM
    formatFullTimestamp(ts) {
      if (!Number.isFinite(ts)) return ''
      const d = new Date(Number(ts))
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
    },

    // 格式化短时间 MM-DD HH:MM
    formatShortTimestamp(ts) {
      if (!Number.isFinite(ts)) return ''
      const d = new Date(Number(ts))
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      return `${mm}-${dd} ${hh}:${mi}`
    },

    // 展示设备最新时间
    formatDeviceLatestTime(device) {
      if (!device || !device.latestTimestamp) return '--'
      const txt = this.formatShortTimestamp(device.latestTimestamp)
      return txt || '--'
    },

    // uCharts 版本不走 formatter（见 components/u-charts/u-charts.js），保留该函数不再使用
    formatXAxisLabel(val) {
      return val || ''
    },

    getSeries() {
      const series = []
      const devices = this.chartData.devices || []
      if (devices.length === 0) return series
      
      // 为每个设备生成一条曲线
      const colors = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
      devices.forEach((device, index) => {
        const deviceLabel = device.deviceId || device.deviceSn || `设备${index + 1}`
        const dataKey = this.chartType === 'temperature' ? 'temperature' : 'humidity'
        const color = colors[index % colors.length]
        
        series.push({
          name: `${deviceLabel}`,
          data: device[dataKey] || [],
          color: color
        })
      })
      
      return series
    },

    getXAxisKeep() {
      const len = (this.chartData.categories || []).length
      if (len <= 8) {
        return new Set(Array.from({ length: len }, (_, i) => i))
      }
      // 目标约 8 个刻度，步长自适应；始终保留最后一个
      const step = Math.max(1, Math.ceil(len / 8))
      const keep = new Set()
      // 尾部留白：在最后一个点之前预留 step 的窗口，避免末尾两个刻度挤在一起
      const tailGuardIndex = Math.max(0, len - step)
      for (let i = 0; i < tailGuardIndex; i += step) {
        keep.add(i)
      }
      keep.add(len - 1)
      
      // 二次保护：移除尾部窗口内（不含最后一个）的任何刻度
      for (let i = tailGuardIndex; i < len - 1; i++) {
        if (keep.has(i)) keep.delete(i)
      }
      
      console.log('xAxis keep index:', Array.from(keep).sort((a, b) => a - b), 'len:', len, 'step:', step)
      return keep
    },

    getDisplayCategories() {
      const keep = this.getXAxisKeep()
      const cats = this.chartData.categories || []
      return cats.map((v, i) => (keep.has(i) ? v : ''))
    },

    drawLine(clearOnly = false) {
      if (clearOnly) {
        this.clearChart()
        return
      }
      if (!this.chartHasData) return
      console.log('drawLine categories:', this.chartData.categories)
      // 如果尺寸还没拿到（真机常见），先标记，等 ensureCanvasSize 拿到真实宽高后再重建
      if (!this.cWidth || !this.cHeight) {
        this.pendingRedraw = true
        this.ensureCanvasSize()
        return
      }
      const s = this.chartScale || 1
      const fontSize = Math.max(9, Math.round(11 * s))
      const padding = [
        Math.round(10 * s),
        // 右侧适当放大，避免最后一个刻度文字被 canvas 边缘裁掉
        Math.round(18 * s),
        // 底部加大留白，避免 x 轴标签与时间文字贴得过近
        Math.round(-6 * s),
        Math.round(6 * s)
      ]
      const lineWidth = Math.max(1, Math.round(2 * s))
      if (this.lineChart) {
        this.lineChart.updateData({
          categories: this.getDisplayCategories(),
          series: this.getSeries()
        })
        return
      }
      this.lineChart = new uCharts({
        $this: this,
        canvasId: 'realtimeLine',
        type: 'line',
        fontSize,
        padding,
        legend: { show: true, fontSize: Math.max(9, Math.round(10 * s)), itemGap: Math.round(8 * s), margin: Math.round(4 * s) },
        dataLabel: false,
        // 移动端点太密时会显得“粗大”，这里默认关闭（触摸 tooltip 仍可用）
        dataPointShape: false,
        background: '#FFFFFF',
        pixelRatio: this.pixelRatio,
        categories: this.getDisplayCategories(),
        series: this.getSeries(),
        animation: false, // 关闭渲染动画，避免线条进场动效
        enableScroll: false,
        xAxis: {
          disableGrid: false,
          itemCount: 4,
          // justify 会在右侧额外留出一个 eachSpacing 的空白，真机上观感更明显；用 center 更贴边
          boundaryGap: 'center',
          rotateLabel: false,
          lineHeight: Math.round(32 * s),
          gridType: 'dash',
          gridColor: '#e5e7eb',
          dashLength: 4,
          // 注意：当前 uCharts 版本 drawXAxis 不会调用 formatter
        },
        yAxis: {
          gridType: 'dash',
          // Y 轴刻度太少：增加分割段数，让刻度更密
          splitNumber: 8,
          format: val => (val === null || val === undefined ? '' : Number(val).toFixed(1))
        },
        width: this.cWidth * this.pixelRatio,
        height: this.cHeight * this.pixelRatio,
        extra: {
          line: { type: 'curve', width: lineWidth },
          tooltip: { showBox: true },
          // uCharts 版本不支持 xAxis.textBreak，这里移除，换行由 u-charts.js 的 "|" 两行绘制实现
        }
      })
    },

    rebuildChart() {
      // 重新创建图表（用于尺寸变化/首次拿到真实尺寸）
      this.lineChart = null
      this.drawLine()
    },

    clearChart() {
      this.lineChart = null
    },

    switchChartType(type) {
      if (this.chartType === type) return
      this.chartType = type
      this.rebuildChart()
    },

    touchLine(e) {
      if (this.lineChart) this.lineChart.scrollStart(e)
    },
    moveLine(e) {
      if (this.lineChart) this.lineChart.scroll(e)
    },
    touchEnd(e) {
      if (this.lineChart) {
        this.lineChart.scrollEnd(e)
        this.lineChart.showToolTip(e, {
          // 时间在弹窗顶部单独一行显示
          title: (category, index) => {
            const raw = (this.chartData.categories || [])[index] || category || ''
            // categories 原本是 "MM-DD|HH:MM"，这里把 "|" 换成空格更易读
            if (typeof raw === 'string' && raw.includes('|')) {
              const [d, t] = raw.split('|')
              return `${d} ${t}`
            }
            return raw
          },
          // category 可能是“稀疏显示用”的 categories（部分为空），这里用 index 从完整 categories 里取时间
          format: (item, category, index) => {
            // 文本增加图标与间距，提升可读性（颜色标记仍由 uCharts 左侧色块负责）
            const unit = this.chartType === 'temperature' ? '℃' : '%RH'
            const val = item.data === null || item.data === undefined ? '--' : item.data
            return `${item.name}  ●${val}${unit}`
          }
        })
      }
    },

    getDeviceDataCount(device) {
      // 获取设备的数据条数，优先使用 temperature 数组长度
      if (device && device.temperature && Array.isArray(device.temperature)) {
        return device.temperature.length
      }
      if (device && device.humidity && Array.isArray(device.humidity)) {
        return device.humidity.length
      }
      return 0
    },

    getDeviceCountStatus(device) {
      const count = this.getDeviceDataCount(device)
      // 失败：没有任何数据
      if (!count) {
        return 'device-count-error'
      }
      // 成功：数量与当前选择的条数一致
      if (count === this.rangeMinutes) {
        return 'device-count-success'
      }
      // 进行中：有数据但数量尚未达到选择条数
      return 'device-count-warning'
    },

    formatStat(val) {
      if (val === null || val === undefined || Number.isNaN(val)) return '--'
      // 温度保留 1 位，湿度保留 0-1 位
      const fixed = this.chartType === 'temperature' ? 1 : 0
      const num = Number(val)
      if (!Number.isFinite(num)) return '--'
      return num.toFixed(fixed)
    }
  }
}
</script>

<style scoped>
.realtime-page {
  min-height: 100vh;
  padding: 20rpx 0;
  box-sizing: border-box;
  background: #f5f5f5;
}

.page-header {
  background: #ffffff;
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #6b7280;
}

.hint {
  font-size: 24rpx;
  color: #6b7280;
}

.device-panel,
.chart-panel {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 20rpx;
}

.chart-panel {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 24rpx 0;
  border-radius: 0;
  margin-bottom: 0;
}

.device-list-panel {
  background: #ffffff;
  border-radius: 0;
  padding: 24rpx;
  box-shadow: none;
  margin-top: 20rpx;
}

.panel-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16rpx;
}

.device-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.device-chip {
  padding: 12rpx 16rpx;
  background: #f3f4f6;
  border-radius: 12rpx;
  border: 2rpx solid #e5e7eb;
  min-width: 180rpx;
  box-sizing: border-box;
}

.device-chip.active {
  background: #eef2ff;
  border-color: #667eea;
}

.chip-id {
  display: block;
  font-size: 28rpx;
  color: #111827;
  font-weight: 600;
}

.chip-sn {
  display: block;
  font-size: 22rpx;
  color: #6b7280;
  margin-top: 4rpx;
}

.empty-tip {
  font-size: 26rpx;
  color: #9ca3af;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 12rpx;
  padding: 0 24rpx;
}

.chart-title {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  font-size: 28rpx;
  color: #111827;
}

.loading-text {
  font-size: 24rpx;
  color: #f59e0b;
}

.error-text {
  font-size: 24rpx;
  color: #ef4444;
}

.toggle-group {
  display: flex;
  gap: 8rpx;
}

.range-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 8rpx;
  justify-content: flex-end;
  margin-top: 4rpx;
  overflow-x: auto;
}

.range-btn {
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  border: 2rpx solid #e5e7eb;
  background: #f9fafb;
  color: #374151;
  font-size: 20rpx;
}

.range-btn.active {
  background: #111827;
  border-color: #111827;
  color: #ffffff;
}

.toggle-btn {
  padding: 4rpx 18rpx;
  border-radius: 999rpx;
  border: 2rpx solid #e5e7eb;
  background: #f9fafb;
  color: #374151;
  font-size: 22rpx;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-color: #667eea;
}

.chart-box {
  position: relative;
  background: #f9fafb;
  border-radius: 0;
  /* 减少右侧内边距，避免占用 uni-canvas 可用宽度导致图表整体偏窄 */
  padding: 8rpx 0;
  border: none;
  border-top: 2rpx solid #e5e7eb;
  border-bottom: 2rpx solid #e5e7eb;
  overflow: visible;
}

.chart-stats {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  padding: 12rpx 24rpx 0;
  font-size: 24rpx;
  color: #374151;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 10rpx 12rpx;
  background: #f9fafb;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
}

.stat-label {
  color: #6b7280;
}

.stat-value {
  font-weight: 700;
  color: #111827;
}

.stat-unit {
  margin-left: 4rpx;
  font-weight: 500;
  color: #6b7280;
}

.chart-canvas {
  width: 100%;
  /* 曲线图高度放大一倍：360rpx -> 720rpx */
  height: 720rpx;
  display: block;
}

.placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 26rpx;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.76);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.loading-spinner {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 6rpx solid #e5e7eb;
  border-top-color: #667eea;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.device-list-section {
  border-top: none;
}

.device-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.device-list-header-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
  flex: 1;
}

.device-list-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
}

.device-list-subtitle {
  font-size: 24rpx;
  color: #6b7280;
}

.device-latest-global {
  font-size: 22rpx;
  color: #374151;
  margin-left: auto;
  display: flex;
  align-items: center;
}

.loading-text-inline,
.error-text-inline {
  margin-left: 8rpx;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  border: 2rpx solid #e5e7eb;
}

.device-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12rpx;
}

.device-main {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
  min-width: 0;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex: 1;
}

.device-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #111827;
}

.device-sn {
  font-size: 22rpx;
  color: #6b7280;
}

.device-sn-inline {
  font-size: 22rpx;
  color: #6b7280;
}

.device-latest-inline {
  font-size: 22rpx;
  color: #6b7280;
}

.device-count {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.device-count-inline {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.count-label {
  font-size: 24rpx;
  color: #6b7280;
}

.count-value {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
  border-radius: 8rpx;
}

.count-value.device-count-warning {
  background-color: #fef3c7;
}

.count-value.device-count-success {
  background-color: #dcfce7;
}

.count-value.device-count-error {
  background-color: #fee2e2;
}

.empty-device-list {
  padding: 40rpx;
  text-align: center;
  color: #9ca3af;
  font-size: 26rpx;
}
</style>


<template>
  <div class="prediction-page">
    <!-- 导航栏 -->
    <div class="nav-bar">
      <span class="back" @click="$router.back()">←</span>
      <span class="title">车位预测</span>
      <span class="placeholder"></span>
    </div>

    <!-- 搜索表单 -->
    <div class="search-section">
      <div class="search-card">
        <div class="form-group">
          <label>目标入场时间</label>
          <div class="time-picker">
            <input
              type="datetime-local"
              v-model="targetTime"
              :min="minTime"
            />
          </div>
        </div>

        <div class="form-group">
          <label>需要车位数</label>
          <div class="stepper">
            <button
              class="stepper-btn"
              @click="decreaseSpaces"
              :disabled="requiredSpaces <= 1"
            >
              −
            </button>
            <span class="stepper-value">{{ requiredSpaces }} 辆</span>
            <button
              class="stepper-btn"
              @click="increaseSpaces"
              :disabled="requiredSpaces >= 10"
            >
              +
            </button>
          </div>
        </div>

        <button
          class="search-btn"
          @click="handleSearch"
          :disabled="!targetTime || loading"
        >
          <span v-if="loading" class="loading-text">查询中...</span>
          <span v-else>🔍 查看区域空位预测</span>
        </button>
      </div>
    </div>

    <!-- 搜索条件展示 -->
    <div class="search-summary" v-if="hasSearched">
      <span>入场时间: {{ formatDisplayTime(searchTime) }}</span>
      <span>需要: {{ requiredSpaces }} 辆</span>
      <button class="refresh-btn" @click="handleSearch">刷新</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>正在查询预测数据...</span>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-state">
      <span class="error-icon">❌</span>
      <span>{{ error }}</span>
      <button class="retry-btn" @click="handleSearch">重试</button>
    </div>

    <!-- 预测结果 -->
    <div v-if="!loading && !error && results.length > 0" class="results-section">
      <div class="results-header">
        <span>共 {{ results.length }} 个区域</span>
      </div>

      <div class="area-list">
        <div
          v-for="area in sortedAreas"
          :key="area.areaId"
          class="area-card"
          :class="{ 'is-full': area.isFull }"
          @click="toggleAreaDetail(area.areaId)"
        >
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="area-info">
              <span class="area-name">{{ area.areaName }}</span>
              <span
                v-if="!area.isFull"
                class="status-badge available"
              >
                剩余 {{ area.availableSpaces }}/{{ area.totalSpaces }}
              </span>
              <span v-else class="status-badge full">已满</span>
            </div>
            <span class="expand-icon" :class="{ expanded: isAreaExpanded(area.areaId) }">▼</span>
          </div>

          <!-- 进度条 -->
          <div class="progress-section">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: (area.totalSpaces > 0 ? (area.occupiedSpaces / area.totalSpaces * 100) : 0) + '%' }"
                :class="{ full: area.isFull }"
              ></div>
            </div>
            <div class="progress-label">
              {{ area.occupiedSpaces || 0 }}/{{ area.totalSpaces || 0 }} 已占用
            </div>
          </div>

          <!-- 空闲提示 -->
          <div v-if="!area.isFull" class="available-notice">
            <span class="check-icon">✓</span>
            有足够空位，可直接入场
          </div>

          <!-- 展开详情 -->
          <div v-if="isAreaExpanded(area.areaId)" class="area-detail">
            <!-- 即将离开的车辆列表 -->
            <div v-if="area.leavingReservations && area.leavingReservations.length > 0" class="leaving-section">
              <div class="section-title">🚗 即将离开的预约车 ({{ area.leavingReservations.length }}辆)</div>

              <div class="leaving-list">
                <div
                  v-for="item in area.leavingReservations"
                  :key="item.reservationId"
                  class="leaving-item"
                >
                  <div class="license-plate">{{ item.licensePlate }}</div>
                  <div class="leave-time">→ {{ formatTime(item.expectedEndTime) }}</div>
                  <div class="visitor-name">{{ item.visitorName || '匿名' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && !error && hasSearched && results.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <span>暂无区域数据</span>
    </div>

  </div>
</template>

<script>
import { getAllAreasPrediction } from '@/utils/api'

export default {
  name: 'AreaPrediction',
  data() {
    return {
      targetTime: '',
      requiredSpaces: 1,
      searchTime: '',
      loading: false,
      error: '',
      results: [],
      hasSearched: false,
      expandedAreas: []
    }
  },
  computed: {
    // 最小时间：当前时间之后15分钟
    minTime() {
      const now = new Date()
      now.setMinutes(now.getMinutes() + 15)
      return now.toISOString().slice(0, 16)
    },
    // 排序后的区域列表
    sortedAreas() {
      return [...this.results].sort((a, b) => {
        // 有空位的优先
        if (!a.isFull && b.isFull) return -1
        if (a.isFull && !b.isFull) return 1

        // 都有预测的按预测空位数降序
        const aCount = a.prediction?.predictedVacancyCount || 0
        const bCount = b.prediction?.predictedVacancyCount || 0
        if (aCount !== bCount) return bCount - aCount

        // 按区域ID排序
        return Number(a.areaId) - Number(b.areaId)
      })
    }
  },
  methods: {
    decreaseSpaces() {
      if (this.requiredSpaces > 1) {
        this.requiredSpaces--
      }
    },
    increaseSpaces() {
      if (this.requiredSpaces < 10) {
        this.requiredSpaces++
      }
    },
    handleSearch() {
      if (!this.targetTime) {
        this.error = '请选择目标入场时间'
        return
      }

      this.loading = true
      this.error = ''
      this.hasSearched = true
      this.searchTime = this.targetTime

      // 格式化时间：yyyy-MM-dd HH:mm:ss
      const formattedTime = this.targetTime.replace('T', ' ') + ':00'

      getAllAreasPrediction({
        targetTime: formattedTime,
        requiredSpaces: this.requiredSpaces
      }).then(res => {
        if (res.code === 200) {
          this.results = res.data || []
          // 默认展开前3个区域（确保ID是数字类型）
          this.expandedAreas = this.results.slice(0, 3).map(area => Number(area.areaId))
        } else {
          this.error = res.msg || '查询失败'
        }
      }).catch(err => {
        this.error = '网络请求失败，请检查网络连接'
        console.error('预测查询失败:', err)
      }).finally(() => {
        this.loading = false
      })
    },
    toggleAreaDetail(areaId) {
      // 确保 areaId 类型一致（后端可能返回字符串）
      const numericId = Number(areaId)
      const index = this.expandedAreas.indexOf(numericId)
      if (index > -1) {
        this.expandedAreas.splice(index, 1)
      } else {
        this.expandedAreas.push(numericId)
      }
    },
    isAreaExpanded(areaId) {
      // 确保类型一致
      return this.expandedAreas.includes(Number(areaId))
    },
    formatTime(timeStr) {
      if (!timeStr) return '--:--'
      return timeStr.slice(-8, -3)
    },
    formatDisplayTime(timeStr) {
      if (!timeStr) return '--'
      return timeStr.replace('T', ' ').slice(0, 16)
    }
  }
}
</script>

<style scoped>
.prediction-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-bar .back,
.nav-bar .placeholder {
  width: 40px;
  font-size: 20px;
  color: #409eff;
  cursor: pointer;
}

.nav-bar .title {
  font-size: 17px;
  font-weight: bold;
}

/* 搜索区域 */
.search-section {
  padding: 15px;
}

.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-of-type {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.time-picker input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  box-sizing: border-box;
}

.time-picker input:focus {
  outline: none;
  border-color: #409eff;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stepper-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepper-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stepper-btn:active:not(:disabled) {
  background: #f5f5f5;
}

.stepper-value {
  font-size: 16px;
  min-width: 60px;
  text-align: center;
}

.search-btn {
  width: 100%;
  padding: 14px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.search-btn:disabled {
  background: #a0c79e;
  cursor: not-allowed;
}

.search-btn:active:not(:disabled) {
  background: #66b1ff;
}

/* 搜索条件展示 */
.search-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: #e6f7ff;
  font-size: 13px;
  color: #1890ff;
}

.refresh-btn {
  padding: 4px 12px;
  background: #fff;
  border: 1px solid #1890ff;
  border-radius: 4px;
  color: #1890ff;
  font-size: 12px;
  cursor: pointer;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  gap: 15px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #666;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  gap: 12px;
}

.error-icon {
  font-size: 40px;
}

.error-state span {
  color: #f56c6c;
  font-size: 14px;
}

.retry-btn {
  padding: 8px 20px;
  background: #fff;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  color: #f56c6c;
  cursor: pointer;
  margin-top: 10px;
}

/* 结果区域 */
.results-section {
  padding: 0 15px 20px;
}

.results-header {
  padding: 10px 0;
  font-size: 14px;
  color: #666;
}

.area-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.area-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.area-card:active {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.area-card.is-full {
  border: 1px solid #ff9800;
  background: #fffbf0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.area-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.area-name {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.available {
  background: #e6f7ff;
  color: #1890ff;
}

.status-badge.full {
  background: #fff1f0;
  color: #ff4d4f;
}

.expand-icon {
  font-size: 12px;
  color: #999;
  transition: transform 0.2s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

/* 进度条 */
.progress-section {
  margin-bottom: 12px;
}

.progress-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #66b1ff);
  transition: width 0.3s ease;
}

.progress-fill.full {
  background: linear-gradient(90deg, #ff9800, #ff6b00);
}

.progress-label {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
  text-align: right;
}

/* 空闲提示 */
.available-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f6ffed;
  border-radius: 6px;
  color: #52c41a;
  font-size: 14px;
}

.check-icon {
  font-size: 16px;
}

/* 详情区域 */
.area-detail {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.leaving-section {
  margin-bottom: 12px;
}

.leaving-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.leaving-item {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.leaving-item:last-child {
  border-bottom: none;
}

.license-plate {
  font-weight: 600;
  color: #333;
}

.leave-time {
  color: #1890ff;
  text-align: center;
}

.visitor-name {
  color: #666;
  text-align: right;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 15px;
}

.empty-icon {
  font-size: 60px;
}

.empty-state span {
  color: #999;
  font-size: 15px;
}
</style>

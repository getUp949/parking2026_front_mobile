<template>
  <div class="visitor-notice-page">
    <div class="nav-bar">
      <span class="back" @click="$router.back()">←</span>
      <span class="title">我的通知</span>
      <span class="placeholder"></span>
    </div>

    <div class="content">
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="noticeList.length === 0" class="empty">
        <div class="empty-icon">🔔</div>
        <p>暂无通知</p>
        <p class="empty-hint">预约审批结果会在这里显示</p>
      </div>

      <div v-else class="notice-list">
        <div
          v-for="item in noticeList"
          :key="item.id"
          class="notice-card"
          :class="{ unread: !item.isRead }"
          @click="handleCardClick(item)"
        >
          <div class="notice-icon" :class="getIconClass(item.noticeType)">
            {{ getIcon(item.noticeType) }}
          </div>
          <div class="notice-content-wrapper">
            <div class="notice-header">
              <span class="notice-type">{{ getTypeText(item.noticeType) }}</span>
              <span class="notice-time">{{ formatTime(item.createTime) }}</span>
            </div>
            <h4 class="notice-title">{{ item.title }}</h4>
            <p class="notice-content">{{ item.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetail" class="modal-overlay" @click="closeDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ currentNotice?.title }}</h3>
          <span class="close-btn" @click="closeDetail">×</span>
        </div>
        <div class="modal-body">
          <div class="notice-meta">
            <span class="notice-type-badge" :class="getTypeClass(currentNotice?.noticeType)">
              {{ getTypeText(currentNotice?.noticeType) }}
            </span>
            <span class="notice-time">{{ formatTime(currentNotice?.createTime) }}</span>
          </div>
          <p class="full-content">{{ currentNotice?.content }}</p>
          
          <!-- 预约相关操作按钮 -->
          <div v-if="currentNotice?.noticeType === 'RESERVATION' || currentNotice?.relatedId" class="action-buttons">
            <button v-if="currentNotice?.reservationStatus === 0" class="btn btn-outline" @click="handleViewReservation">
              查看预约详情
            </button>
            <button v-if="currentNotice?.reservationStatus === 0" class="btn btn-danger-outline" @click="handleCancelReservation">
              取消预约
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getVisitorNotices, markVisitorNoticeRead } from '@/utils/api'

export default {
  name: 'VisitorNotice',
  data() {
    return {
      noticeList: [],
      loading: false,
      showDetail: false,
      currentNotice: null
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      getVisitorNotices()
        .then(res => {
          if (res.code === 200) {
            this.noticeList = res.data || []
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    getTypeText(type) {
      const map = {
        SYSTEM: '系统通知',
        OVERDUE: '费用催缴',
        RESERVATION: '预约通知',
        ENTRY_EXIT: '进出通知',
        APPROVAL: '审批通知',
        VISITOR: '访客通知'
      }
      return map[type] || type
    },

    getIcon(type) {
      const map = {
        SYSTEM: '⚙️',
        OVERDUE: '💰',
        RESERVATION: '📅',
        ENTRY_EXIT: '🚗',
        APPROVAL: '✅',
        VISITOR: '👤'
      }
      return map[type] || '📢'
    },

    getIconClass(type) {
      const map = {
        SYSTEM: 'icon-system',
        OVERDUE: 'icon-overdue',
        RESERVATION: 'icon-reservation',
        ENTRY_EXIT: 'icon-entry',
        APPROVAL: 'icon-approval',
        VISITOR: 'icon-visitor'
      }
      return map[type] || 'icon-default'
    },

    getTypeClass(type) {
      const map = {
        SYSTEM: 'type-system',
        OVERDUE: 'type-overdue',
        RESERVATION: 'type-reservation',
        ENTRY_EXIT: 'type-entry',
        APPROVAL: 'type-approval',
        VISITOR: 'type-visitor'
      }
      return map[type] || 'type-default'
    },

    formatTime(time) {
      if (!time) return ''
      return time.substring(0, 16)
    },

    handleCardClick(item) {
      // 标记已读
      if (!item.isRead) {
        markVisitorNoticeRead(item.id).then(() => {
          item.isRead = true
        })
      }
      // 显示详情
      this.currentNotice = item
      this.showDetail = true
    },

    closeDetail() {
      this.showDetail = false
      this.currentNotice = null
    },

    handleViewReservation() {
      this.closeDetail()
      this.$router.push('/mobile/visitor/reservations')
    },

    handleCancelReservation() {
      if (!this.currentNotice?.relatedId) {
        alert('无法取消预约')
        return
      }
      
      if (!confirm('确定取消该预约？')) return
      
      import('@/utils/api').then(api => {
        api.cancelVisitorReservation(this.currentNotice.relatedId).then(res => {
          if (res.code === 200) {
            alert('预约已取消')
            this.closeDetail()
            this.fetchData()
          }
        })
      })
    }
  }
}
</script>

<style scoped>
.visitor-notice-page {
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
  color: #67c23a;
  cursor: pointer;
}

.nav-bar .title {
  font-size: 17px;
  font-weight: bold;
}

.content {
  padding: 15px;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.empty-hint {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-card {
  background: #fff;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  transition: transform 0.2s;
}

.notice-card:active {
  transform: scale(0.98);
}

.notice-card.unread {
  border-left: 3px solid #67c23a;
}

.notice-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.icon-system { background: #f0f0f0; }
.icon-overdue { background: #fef0f0; }
.icon-reservation { background: #f0fdf4; }
.icon-entry { background: #f0f9ff; }
.icon-approval { background: #fef9f0; }
.icon-visitor { background: #fdf4f6; }
.icon-default { background: #f5f5f5; }

.notice-content-wrapper {
  flex: 1;
  min-width: 0;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.notice-type {
  color: #67c23a;
  font-size: 12px;
  font-weight: 500;
}

.notice-time {
  color: #999;
  font-size: 12px;
}

.notice-title {
  font-size: 15px;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-card.unread .notice-title {
  font-weight: bold;
}

.notice-content {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* Modal Styles */
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
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn {
  font-size: 28px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  margin-left: 15px;
  padding: 0 5px;
}

.close-btn:active {
  color: #666;
}

.modal-body {
  padding: 20px;
}

.notice-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.notice-type-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type-system { background: #f0f0f0; color: #666; }
.type-overdue { background: #fef0f0; color: #f56c6c; }
.type-reservation { background: #f0fdf4; color: #67c23a; }
.type-entry { background: #f0f9ff; color: #409eff; }
.type-approval { background: #fef9f0; color: #e6a23c; }
.type-visitor { background: #fdf4f6; color: #f56c6c; }
.type-default { background: #f5f5f5; color: #999; }

.full-content {
  color: #333;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.action-buttons {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.btn-outline {
  background: #fff;
  border: 1px solid #67c23a;
  color: #67c23a;
}

.btn-danger-outline {
  background: #fff;
  border: 1px solid #f56c6c;
  color: #f56c6c;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

<template>
  <div class="my-notice-page">
    <div class="nav-bar">
      <span class="back" @click="$router.back()">←</span>
      <span class="title">我的通知</span>
      <span class="placeholder"></span>
    </div>

    <div class="content">
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="noticeList.length === 0" class="empty">
        <p>暂无通知</p>
      </div>

      <div v-else class="notice-list">
        <div
          v-for="item in noticeList"
          :key="item.id"
          class="notice-card"
          :class="{ unread: !item.isRead }"
          @click="handleCardClick(item)"
        >
          <div class="notice-header">
            <span class="notice-type">{{ getTypeText(item.noticeType) }}</span>
            <span class="notice-time">{{ formatTime(item.createTime) }}</span>
          </div>
          <h4 class="notice-title">{{ item.title }}</h4>
          <p class="notice-content">{{ item.content }}</p>
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
            <span class="notice-type">{{ getTypeText(currentNotice?.noticeType) }}</span>
            <span class="notice-time">{{ formatTime(currentNotice?.createTime) }}</span>
          </div>
          <p class="full-content">{{ currentNotice?.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMyNotices, markNoticeRead } from '@/utils/api'

export default {
  name: 'MobileMyNotice',
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
      getMyNotices()
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
        APPROVAL: '审批通知'
      }
      return map[type] || type
    },

    formatTime(time) {
      if (!time) return ''
      return time.substring(0, 16)
    },

    handleCardClick(item) {
      // 标记已读
      if (!item.isRead) {
        markNoticeRead(item.id).then(() => {
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
  }
}
</script>

<style scoped>
.my-notice-page {
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

.content {
  padding: 15px;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-card {
  background: #fff;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
}

.notice-card.unread {
  border-left: 3px solid #409eff;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.notice-type {
  color: #409eff;
  font-size: 12px;
}

.notice-time {
  color: #999;
  font-size: 12px;
}

.notice-title {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
}

.notice-card.unread .notice-title {
  font-weight: bold;
}

.notice-content {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  margin-bottom: 15px;
  font-size: 12px;
  color: #999;
}

.full-content {
  color: #333;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

<template>
  <div class="visitor-reservation-page">
    <div class="nav-bar">
      <span class="back" @click="$router.back()">←</span>
      <span class="title">我的预约</span>
      <span class="add" @click="$router.push('/mobile/visitor/reservation/add')">+</span>
    </div>

    <div class="content">
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="reservationList.length === 0" class="empty">
        <p>暂无预约记录</p>
        <button class="btn btn-primary" @click="$router.push('/mobile/visitor/reservation/add')">新增预约</button>
      </div>

      <div v-else class="reservation-list">
        <div
          v-for="item in reservationList"
          :key="item.id"
          class="reservation-card"
        >
          <div class="card-header">
            <span class="plate">{{ item.licensePlate }}</span>
            <span class="status-tag" :class="'status-' + item.status">
              {{ getStatusText(item.status) }}
            </span>
          </div>
          <div class="card-body">
            <p><strong>被访业主：</strong>{{ item.ownerName || '-' }}</p>
            <p><strong>访客：</strong>{{ item.visitorName }}</p>
            <p><strong>时间：</strong>{{ formatTime(item.expectedStartTime) }} - {{ formatTime(item.expectedEndTime) }}</p>
            <p v-if="item.visitReason"><strong>原因：</strong>{{ item.visitReason }}</p>
            <p v-if="item.actualStartTime"><strong>入场时间：</strong>{{ formatTime(item.actualStartTime) }}</p>
            <p v-if="item.actualEndTime"><strong>出场时间：</strong>{{ formatTime(item.actualEndTime) }}</p>
          </div>
          <div class="card-footer" v-if="item.status === 1 || item.status === 2">
            <button @click="handleCancel(item)" class="btn-text danger">取消预约</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getVisitorReservations, cancelVisitorReservation } from '@/utils/api'

export default {
  name: 'VisitorReservation',
  data() {
    return {
      reservationList: [],
      loading: false
    }
  },
  created() {
    this.fetchReservations()
  },
  methods: {
    fetchReservations() {
      this.loading = true
      getVisitorReservations()
        .then(res => {
          if (res.code === 200) {
            this.reservationList = res.data || []
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    getStatusText(status) {
      const map = {
        0: '已取消',
        1: '待审批',
        2: '已预约',
        3: '已入场',
        4: '已完成',
        5: '已超时',
        6: '已超时，已拉黑'
      }
      return map[status] || status
    },

    getStatusClass(status) {
      const map = {
        0: 'status-cancelled',
        1: 'status-pending',
        2: 'status-reserved',
        3: 'status-active',
        4: 'status-completed',
        5: 'status-overtime',
        6: 'status-blocked'
      }
      return map[status] || ''
    },

    formatTime(time) {
      if (!time) return '-'
      return time.replace('T', ' ').substring(0, 16)
    },

    handleCancel(item) {
      if (!confirm('确定取消该预约？')) return
      cancelVisitorReservation(item.id).then(res => {
        if (res.code === 200) {
          alert('取消成功')
          this.fetchReservations()
        } else {
          alert(res.message || '取消失败')
        }
      }).catch(err => {
        alert(err.message || '取消失败，请重试')
      })
    }
  }
}
</script>

<style scoped>
.visitor-reservation-page {
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
.nav-bar .add {
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

.reservation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reservation-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #67c23a;
  color: #fff;
}

.card-header .plate {
  font-size: 16px;
  font-weight: bold;
}

.status-tag {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  background: rgba(255,255,255,0.3);
}

.status-tag.status-0 { background: #909399; }
.status-tag.status-1 { background: #e6a23c; }
.status-tag.status-2 { background: #409eff; }
.status-tag.status-3 { background: #409eff; }
.status-tag.status-4 { background: #67c23a; }
.status-tag.status-5 { background: #f56c6c; }
.status-tag.status-6 { background: #f56c6c; }

.card-body {
  padding: 15px;
}

.card-body p {
  margin-bottom: 6px;
  color: #666;
  font-size: 14px;
}

.card-body strong {
  color: #333;
}

.card-footer {
  padding: 12px 15px;
  border-top: 1px solid #eee;
  text-align: right;
}

.btn-text {
  background: none;
  border: none;
  color: #f56c6c;
  font-size: 14px;
  cursor: pointer;
}

.btn-primary {
  background: #67c23a;
  color: #fff;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
</style>

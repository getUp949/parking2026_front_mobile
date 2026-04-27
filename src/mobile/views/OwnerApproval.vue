<template>
  <div class="approval-page">
    <div class="nav-bar">
      <span class="back" @click="$router.back()">←</span>
      <span class="title">访客预约审批</span>
      <span class="placeholder"></span>
    </div>

    <div class="content">
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="pendingList.length === 0 && processedList.length === 0" class="empty">
        <p>暂无预约审批记录</p>
      </div>

      <template v-else>
        <!-- 待处理 -->
        <div class="section" v-if="pendingList.length > 0">
          <h3 class="section-title">待处理 ({{ pendingList.length }})</h3>
          <div class="card-list">
            <div
              v-for="item in pendingList"
              :key="item.id"
              class="reservation-card"
            >
              <div class="card-header">
                <span class="plate">{{ item.licensePlate }}</span>
                <span class="status-tag status-pending">{{ getStatusText(item.status) }}</span>
              </div>
              <div class="card-body">
                <p><strong>访客姓名：</strong>{{ item.visitorName }}</p>
                <p><strong>联系电话：</strong>{{ item.visitorPhone || '-' }}</p>
                <p><strong>访问时间：</strong>{{ formatTime(item.expectedStartTime) }} - {{ formatTime(item.expectedEndTime) }}</p>
                <p v-if="item.visitReason"><strong>访问原因：</strong>{{ item.visitReason }}</p>
                <p><strong>提交时间：</strong>{{ formatTime(item.createTime) }}</p>
              </div>
              <div class="card-footer">
                <button class="btn btn-reject" @click="handleReject(item)">拒绝</button>
                <button class="btn btn-approve" @click="handleApprove(item)">通过</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 已处理 -->
        <div class="section" v-if="processedList.length > 0">
          <h3 class="section-title">已处理</h3>
          <div class="card-list">
            <div
              v-for="item in processedList"
              :key="item.id"
              class="reservation-card processed"
            >
              <div class="card-header">
                <span class="plate">{{ item.licensePlate }}</span>
                <span class="status-tag" :class="item.status === 2 ? 'status-approved' : 'status-rejected'">
                  {{ item.status === 2 ? '已通过' : '已拒绝' }}
                </span>
              </div>
              <div class="card-body">
                <p><strong>访客姓名：</strong>{{ item.visitorName }}</p>
                <p><strong>访问时间：</strong>{{ formatTime(item.expectedStartTime) }} - {{ formatTime(item.expectedEndTime) }}</p>
                <p v-if="item.approveRemark"><strong>审批备注：</strong>{{ item.approveRemark }}</p>
                <p><strong>处理时间：</strong>{{ formatTime(item.approveTime) }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 拒绝原因弹窗 -->
    <div class="modal" v-if="showRejectModal" @click.self="showRejectModal = false">
      <div class="modal-content">
        <h3>拒绝原因</h3>
        <textarea
          v-model="rejectRemark"
          placeholder="请输入拒绝原因（选填）"
          rows="3"
        ></textarea>
        <div class="btn-group">
          <button class="btn btn-default" @click="showRejectModal = false">取消</button>
          <button class="btn btn-reject" @click="confirmReject">确认拒绝</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getOwnerReservations, approveReservation } from '@/utils/api'

export default {
  name: 'OwnerApproval',
  data() {
    return {
      reservationList: [],
      loading: false,
      showRejectModal: false,
      rejectRemark: '',
      currentItem: null
    }
  },
  computed: {
    pendingList() {
      return this.reservationList.filter(item => item.status === 1)
    },
    processedList() {
      return this.reservationList.filter(item => item.status !== 1)
    }
  },
  created() {
    this.fetchReservations()
  },
  methods: {
    fetchReservations() {
      this.loading = true
      getOwnerReservations()
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
        2: '已通过',
        3: '进行中',
        4: '已完成'
      }
      return map[status] || status
    },

    formatTime(time) {
      if (!time) return '-'
      return time.replace('T', ' ').substring(0, 16)
    },

    handleApprove(item) {
      if (!confirm(`确认通过访客"${item.visitorName}"的预约申请吗？`)) return

      approveReservation(item.id, {
        status: 'approved',
        remark: ''
      }).then(res => {
        if (res.code === 200) {
          alert('已通过该预约')
          this.fetchReservations()
        } else {
          alert(res.message || '操作失败')
        }
      }).catch(err => {
        alert(err.message || '操作失败，请重试')
      })
    },

    handleReject(item) {
      this.currentItem = item
      this.rejectRemark = ''
      this.showRejectModal = true
    },

    confirmReject() {
      if (!this.currentItem) return

      approveReservation(this.currentItem.id, {
        status: 'rejected',
        remark: this.rejectRemark
      }).then(res => {
        if (res.code === 200) {
          alert('已拒绝该预约')
          this.showRejectModal = false
          this.fetchReservations()
        } else {
          alert(res.message || '操作失败')
        }
      }).catch(err => {
        alert(err.message || '操作失败，请重试')
      })
    }
  }
}
</script>

<style scoped>
.approval-page {
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

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  padding-left: 5px;
}

.card-list {
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

.status-tag.status-pending { background: #e6a23c; }
.status-tag.status-approved { background: #67c23a; }
.status-tag.status-rejected { background: #909399; }
.status-tag.status-active { background: #409eff; }
.status-tag.status-completed { background: #909399; }

.reservation-card .card-header {
  background: #409eff;
}

.reservation-card.processed .card-header {
  background: #909399;
}

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
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.btn-approve {
  background: #67c23a;
  color: #fff;
}

.btn-reject {
  background: #f56c6c;
  color: #fff;
}

.btn-default {
  background: #ddd;
  color: #333;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: 85%;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.modal-content h3 {
  margin: 0 0 15px;
  font-size: 17px;
  text-align: center;
}

.modal-content textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  resize: none;
  box-sizing: border-box;
}

.modal-content textarea:focus {
  outline: none;
  border-color: #409eff;
}

.btn-group {
  display: flex;
  gap: 12px;
  margin-top: 15px;
}

.btn-group .btn {
  flex: 1;
  padding: 12px;
}
</style>

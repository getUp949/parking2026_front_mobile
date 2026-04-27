<template>
  <div class="my-reservation-page">
    <div class="nav-bar">
      <span class="back" @click="$router.back()">←</span>
      <span class="title">我的预约</span>
      <span class="add" @click="showForm = true">+</span>
    </div>

    <div class="content">
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="reservationList.length === 0" class="empty">
        <p>暂无预约记录</p>
        <button class="btn btn-primary" @click="showForm = true">新增预约</button>
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
            <p>访客：{{ item.visitorName }}</p>
            <p>时间：{{ formatTime(item.expectedStartTime) }} - {{ formatTime(item.expectedEndTime) }}</p>
            <p>审批：{{ getAuthText(item.authorizationStatus) }}</p>
          </div>
          <div class="card-footer" v-if="item.status === 0">
            <button @click="handleCancel(item)" class="btn-text danger">取消预约</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" v-if="showForm" @click.self="showForm = false">
      <div class="modal-content">
        <h3>新增预约</h3>

        <div class="form-group">
          <label>车牌号 <span class="required">*</span></label>
          <input v-model="form.licensePlate" placeholder="请输入车牌号" />
        </div>

        <div class="form-group">
          <label>访客姓名 <span class="required">*</span></label>
          <input v-model="form.visitorName" placeholder="请输入访客姓名" />
        </div>

        <div class="form-group">
          <label>访客电话</label>
          <input v-model="form.visitorPhone" placeholder="请输入电话" />
        </div>

        <div class="form-group">
          <label>目标区域 <span class="required">*</span></label>
          <select v-model="form.targetAreaId">
            <option value="">请选择区域</option>
            <option v-for="area in areaList" :key="area.id" :value="area.id">
              {{ area.areaName }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>开始时间 <span class="required">*</span></label>
          <input v-model="form.expectedStartTime" type="datetime-local" />
        </div>

        <div class="form-group">
          <label>结束时间 <span class="required">*</span></label>
          <input v-model="form.expectedEndTime" type="datetime-local" />
        </div>

        <div class="form-group">
          <label>拜访原因</label>
          <textarea v-model="form.visitReason" placeholder="请输入原因" rows="2"></textarea>
        </div>

        <div class="btn-group">
          <button class="btn btn-default" @click="showForm = false">取消</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="loading">
            {{ loading ? '提交中...' : '提交' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getMyReservations,
  createReservation,
  cancelReservation,
  getAreaList
} from '@/utils/api'

export default {
  name: 'MobileMyReservation',
  data() {
    return {
      reservationList: [],
      areaList: [],
      loading: false,
      showForm: false,
      form: {
        licensePlate: '',
        visitorName: '',
        visitorPhone: '',
        targetAreaId: '',
        expectedStartTime: '',
        expectedEndTime: '',
        visitReason: ''
      }
    }
  },
  created() {
    this.fetchReservations()
    this.fetchAreas()
  },
  methods: {
    fetchReservations() {
      this.loading = true
      getMyReservations()
        .then(res => {
          if (res.code === 200) {
            this.reservationList = res.data || []
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    fetchAreas() {
      getAreaList().then(res => {
        if (res.code === 200) {
          this.areaList = res.data || []
        }
      })
    },

    getStatusText(status) {
      const map = { 0: '待生效', 1: '已生效', 2: '已完成', 3: '已取消' }
      return map[status] || status
    },

    getAuthText(status) {
      const map = { pending: '待审批', approved: '已通过', rejected: '已拒绝' }
      return map[status] || status
    },

    formatTime(time) {
      if (!time) return '-'
      return time.replace('T', ' ').substring(0, 16)
    },

    handleSubmit() {
      if (!this.form.licensePlate || !this.form.visitorName || !this.form.targetAreaId) {
        alert('请填写必填字段')
        return
      }

      const startTime = this.form.expectedStartTime.replace('T', ' ') + ':00'
      const endTime = this.form.expectedEndTime.replace('T', ' ') + ':00'

      createReservation({
        ...this.form,
        expectedStartTime: startTime,
        expectedEndTime: endTime
      }).then(res => {
        if (res.code === 200) {
          alert('预约成功')
          this.showForm = false
          this.fetchReservations()
        }
      })
    },

    handleCancel(item) {
      if (!confirm('确定取消该预约？')) return
      cancelReservation(item.id).then(res => {
        if (res.code === 200) {
          alert('取消成功')
          this.fetchReservations()
        }
      })
    }
  }
}
</script>

<style scoped>
.my-reservation-page {
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

.card-body {
  padding: 15px;
}

.card-body p {
  margin-bottom: 6px;
  color: #666;
  font-size: 14px;
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.modal-content {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 20px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #666;
  font-size: 14px;
}

.required {
  color: #f56c6c;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
}

.btn-group {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn-group .btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
}

.btn-default {
  background: #ddd;
  color: #333;
}

.btn-primary {
  background: #409eff;
  color: #fff;
}
</style>

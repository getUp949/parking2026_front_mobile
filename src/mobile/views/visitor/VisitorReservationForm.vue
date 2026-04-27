<template>
  <div class="visitor-reservation-form-page">
    <div class="nav-bar">
      <span class="back" @click="$router.back()">←</span>
      <span class="title">快速预约</span>
      <span class="placeholder"></span>
    </div>

    <div class="form-container">
      <div class="form-card">
        <h3>预约停车位</h3>
        <p class="form-hint">请填写以下信息提交预约申请</p>

        <div class="form-group">
          <label>邀请码 <span class="required">*</span></label>
          <input
            v-model="form.inviteCode"
            placeholder="请输入业主提供的邀请码"
            @blur="handleResolveCode"
          />
        </div>

        <div class="owner-info-card" v-if="ownerInfo">
          <div class="owner-avatar">{{ ownerInfo.ownerName ? ownerInfo.ownerName.charAt(0) : '业' }}</div>
          <div class="owner-detail">
            <p class="owner-name">被访业主：{{ ownerInfo.ownerName }}</p>
            <p class="owner-user" v-if="ownerInfo.username">业主账号：{{ ownerInfo.username }}</p>
          </div>
          <span class="verify-badge" v-if="codeVerified">✓ 已验证</span>
        </div>

        <div class="form-group">
          <label>车牌号 <span class="required">*</span></label>
          <input
            v-model="form.licensePlate"
            placeholder="请输入车牌号，如：京A12345"
          />
        </div>

        <div class="form-group">
          <label>访客姓名 <span class="required">*</span></label>
          <input
            v-model="form.visitorName"
            placeholder="请输入您的姓名"
          />
        </div>

        <div class="form-group">
          <label>联系电话</label>
          <input
            v-model="form.visitorPhone"
            placeholder="请输入联系电话"
            type="tel"
          />
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
          <textarea
            v-model="form.visitReason"
            placeholder="请输入拜访原因（选填）"
            rows="3"
          ></textarea>
        </div>

        <div class="btn-group">
          <button class="btn btn-primary btn-block" @click="handleSubmit" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交预约' }}
          </button>
        </div>
      </div>

      <div class="tips-card">
        <h4>温馨提示</h4>
        <ul>
          <li>请先获取业主提供的邀请码</li>
          <li>预约申请提交后需要业主审批</li>
          <li>审批结果会通过通知提醒您</li>
          <li>请在预约时间内到达停车场</li>
          <li>预约时长最长为6小时</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { createVisitorReservation, getAreaList, resolveInviteCode } from '@/utils/api'

export default {
  name: 'VisitorReservationForm',
  data() {
    return {
      areaList: [],
      submitting: false,
      ownerInfo: null,
      codeVerified: false,
      form: {
        inviteCode: '',
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
    this.fetchAreas()
    // 预填访客信息
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      if (userInfo.realName) {
        this.form.visitorName = userInfo.realName
      }
      if (userInfo.phone) {
        this.form.visitorPhone = userInfo.phone
      }
    }
  },
  methods: {
    fetchAreas() {
      getAreaList().then(res => {
        if (res.code === 200) {
          this.areaList = res.data || []
        }
      })
    },

    handleResolveCode() {
      if (!this.form.inviteCode) {
        this.ownerInfo = null
        this.codeVerified = false
        return
      }

      resolveInviteCode(this.form.inviteCode)
        .then(res => {
          if (res.code === 200) {
            this.ownerInfo = res.data
            this.codeVerified = true
          } else {
            this.ownerInfo = null
            this.codeVerified = false
            alert(res.message || '邀请码验证失败')
          }
        })
        .catch(() => {
          this.ownerInfo = null
          this.codeVerified = false
        })
    },

    handleSubmit() {
      // 表单验证
      if (!this.form.inviteCode) {
        alert('请输入邀请码')
        return
      }
      if (!this.codeVerified) {
        alert('请先验证邀请码')
        return
      }
      if (!this.form.licensePlate) {
        alert('请输入车牌号')
        return
      }
      if (!this.form.visitorName) {
        alert('请输入访客姓名')
        return
      }
      if (!this.form.targetAreaId) {
        alert('请选择目标区域')
        return
      }
      if (!this.form.expectedStartTime || !this.form.expectedEndTime) {
        alert('请选择预约时间')
        return
      }

      // 验证时间
      const startTime = new Date(this.form.expectedStartTime)
      const endTime = new Date(this.form.expectedEndTime)
      if (endTime <= startTime) {
        alert('结束时间必须大于开始时间')
        return
      }
      // 验证预约时长不超过6小时
      const durationMs = endTime - startTime
      const maxDurationMs = 6 * 60 * 60 * 1000 // 6小时
      if (durationMs > maxDurationMs) {
        alert('预约时长不能超过6小时')
        return
      }

      const startTimeStr = this.form.expectedStartTime.replace('T', ' ') + ':00'
      const endTimeStr = this.form.expectedEndTime.replace('T', ' ') + ':00'

      this.submitting = true
      createVisitorReservation({
        inviteCode: this.form.inviteCode,
        licensePlate: this.form.licensePlate,
        visitorName: this.form.visitorName,
        visitorPhone: this.form.visitorPhone,
        targetAreaId: this.form.targetAreaId,
        expectedStartTime: startTimeStr,
        expectedEndTime: endTimeStr,
        visitReason: this.form.visitReason
      }).then(res => {
        if (res.code === 200) {
          alert('预约申请已提交，请等待审批')
          this.$router.push('/mobile/visitor/reservations')
        } else {
          alert(res.message || '提交失败，请重试')
        }
      }).catch(err => {
        alert(err.message || '提交失败，请重试')
      }).finally(() => {
        this.submitting = false
      })
    }
  }
}
</script>

<style scoped>
.visitor-reservation-form-page {
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

.form-container {
  padding: 15px;
}

.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.form-card h3 {
  text-align: center;
  color: #67c23a;
  font-size: 18px;
  margin-bottom: 5px;
}

.form-hint {
  text-align: center;
  color: #999;
  font-size: 13px;
  margin-bottom: 20px;
}

.owner-info-card {
  display: flex;
  align-items: center;
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
}

.owner-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #67c23a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
}

.owner-detail {
  flex: 1;
}

.owner-name {
  color: #333;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.owner-user {
  color: #999;
  font-size: 12px;
  margin: 4px 0 0;
}

.verify-badge {
  color: #67c23a;
  font-size: 12px;
  font-weight: 500;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
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
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #67c23a;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-group.half {
  flex: 1;
}

.tips-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
}

.tips-card h4 {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
}

.tips-card ul {
  margin: 0;
  padding-left: 20px;
}

.tips-card li {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

.btn-group {
  margin-top: 20px;
}

.btn-primary {
  background: #67c23a;
  color: #fff;
  padding: 14px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
}

.btn-primary:disabled {
  background: #a0c79e;
  cursor: not-allowed;
}

.btn-primary:active:not(:disabled) {
  background: #5daf34;
}
</style>

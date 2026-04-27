<template>
  <div class="home-visitor-page">
    <div class="header">
      <div class="user-info">
        <div class="avatar">{{ userInfo ? userInfo.username.charAt(0) : '访' }}</div>
        <div class="info">
          <p class="welcome">您好，{{ userInfo ? userInfo.username : '访客' }}</p>
          <p class="role">访客用户</p>
        </div>
      </div>
    </div>

    <div class="menu-grid">
      <div class="menu-item" @click="$router.push('/mobile/visitor/reservations')">
        <div class="icon" style="background: #67c23a;">
          <span>📅</span>
        </div>
        <p class="label">我的预约</p>
      </div>

      <div class="menu-item" @click="$router.push('/mobile/visitor/notices')">
        <div class="icon" style="background: #e6a23c;">
          <span>🔔</span>
        </div>
        <p class="label">我的通知</p>
      </div>

      <div class="menu-item" @click="$router.push('/mobile/visitor/profile')">
        <div class="icon" style="background: #909399;">
          <span>👤</span>
        </div>
        <p class="label">个人信息</p>
      </div>

      <div class="menu-item" @click="handleQuickReservation">
        <div class="icon" style="background: #409eff;">
          <span>🚗</span>
        </div>
        <p class="label">快速预约</p>
      </div>
    </div>

    <div class="info-section">
      <h3>使用说明</h3>
      <div class="info-card">
        <div class="info-icon">💡</div>
        <div class="info-text">
          <p class="info-title">如何预约停车位？</p>
          <p class="info-desc">点击"我的预约"或"快速预约"，填写您的访客信息和预计到访时间，即可完成预约。</p>
        </div>
      </div>
      <div class="info-card">
        <div class="info-icon">📱</div>
        <div class="info-text">
          <p class="info-title">预约审批</p>
          <p class="info-desc">您的预约申请将发送给业主审批，审批通过后您将收到通知提醒。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserInfo } from '@/utils/api'

export default {
  name: 'HomeVisitor',
  data() {
    return {
      userInfo: null
    }
  },
  created() {
    this.fetchUserInfo()
  },
  methods: {
    fetchUserInfo() {
      getUserInfo()
        .then(res => {
          if (res.code === 200) {
            this.userInfo = res.data
            localStorage.setItem('userInfo', JSON.stringify(res.data))
          }
        })
        .catch(() => {
          // 如果获取失败，使用本地缓存
          const userInfoStr = localStorage.getItem('userInfo')
          if (userInfoStr) {
            this.userInfo = JSON.parse(userInfoStr)
          }
        })
    },
    handleQuickReservation() {
      this.$router.push('/mobile/visitor/reservation/add')
    }
  }
}
</script>

<style scoped>
.home-visitor-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%);
  padding: 30px 20px;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 15px;
}

.info .welcome {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.info .role {
  font-size: 14px;
  opacity: 0.9;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 20px;
}

.menu-item {
  background: #fff;
  border-radius: 12px;
  padding: 25px 15px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.menu-item:active {
  transform: scale(0.98);
}

.icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.label {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.info-section {
  padding: 0 20px 20px;
}

.info-section h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
}

.info-card {
  background: #fff;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.info-icon {
  font-size: 24px;
  margin-right: 12px;
}

.info-text {
  flex: 1;
}

.info-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 5px;
}

.info-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}
</style>

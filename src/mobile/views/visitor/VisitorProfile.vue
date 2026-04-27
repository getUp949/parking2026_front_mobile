<template>
  <div class="visitor-profile-page">
    <div class="nav-bar">
      <span class="back" @click="$router.back()">←</span>
      <span class="title">个人信息</span>
      <span class="placeholder"></span>
    </div>

    <div class="user-card">
      <div class="avatar">{{ userInfo ? userInfo.username.charAt(0) : '访' }}</div>
      <div class="username">{{ userInfo ? userInfo.username : '-' }}</div>
      <div class="role-tag">访客</div>
    </div>

    <div class="info-list">
      <div class="info-item">
        <span class="label">真实姓名</span>
        <span class="value">{{ userInfo ? (userInfo.realName || '-') : '-' }}</span>
      </div>
      <div class="info-item">
        <span class="label">手机号码</span>
        <span class="value">{{ userInfo ? (userInfo.phone || '-') : '-' }}</span>
      </div>
      <div class="info-item">
        <span class="label">身份证号</span>
        <span class="value">{{ userInfo ? (userInfo.idCard || '-') : '-' }}</span>
      </div>
      <div class="info-item">
        <span class="label">用户类型</span>
        <span class="value visitor-type">访客</span>
      </div>
    </div>

    <div class="tips-section">
      <h4>温馨提示</h4>
      <ul>
        <li>作为访客，您可以预约临时停车位</li>
        <li>预约申请需要业主审批</li>
        <li>审批结果会通过通知提醒您</li>
        <li>请在预约时间内完成访问</li>
      </ul>
    </div>

    <div class="logout-section">
      <button class="btn btn-danger btn-block" @click="handleLogout">
        退出登录
      </button>
    </div>
  </div>
</template>

<script>
import { logout, getUserInfo } from '@/utils/api'

export default {
  name: 'VisitorProfile',
  data() {
    return {
      userInfo: null,
      loading: false
    }
  },
  created() {
    this.fetchUserInfo()
  },
  methods: {
    fetchUserInfo() {
      this.loading = true
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
        .finally(() => {
          this.loading = false
        })
    },
    handleLogout() {
      if (!confirm('确定要退出登录吗？')) return

      logout().then(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('userRole')
        this.$router.replace('/mobile/login')
      }).catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('userRole')
        this.$router.replace('/mobile/login')
      })
    }
  }
}
</script>

<style scoped>
.visitor-profile-page {
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

.user-card {
  background: linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%);
  color: #fff;
  padding: 40px 20px;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.username {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}

.role-tag {
  display: inline-block;
  padding: 4px 16px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  font-size: 13px;
}

.info-list {
  background: #fff;
  margin: 15px;
  border-radius: 10px;
  overflow: hidden;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: #666;
}

.info-item .value {
  color: #333;
}

.visitor-type {
  color: #67c23a;
  font-weight: 500;
}

.tips-section {
  background: #fff;
  margin: 0 15px;
  padding: 15px;
  border-radius: 10px;
}

.tips-section h4 {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
}

.tips-section li {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

.logout-section {
  padding: 20px 15px;
}

.btn-danger {
  background: #f56c6c;
  color: #fff;
}
</style>

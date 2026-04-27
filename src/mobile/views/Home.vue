<template>
  <div class="home-page">
    <div class="header">
      <div class="user-info">
        <div class="avatar">{{ userInfo ? userInfo.username.charAt(0) : '游' }}</div>
        <div class="info">
          <p class="welcome">您好，{{ userInfo ? userInfo.username : '业主' }}</p>
          <p class="role">{{ roleText }}</p>
        </div>
      </div>
    </div>

    <!-- 邀请码卡片 -->
    <div class="invite-card" @click="showInviteModal = true">
      <div class="invite-icon">📤</div>
      <div class="invite-info">
        <p class="invite-title">邀请访客</p>
        <p class="invite-hint">分享邀请码给访客预约停车</p>
      </div>
      <span class="invite-arrow">›</span>
    </div>

    <!-- 审批卡片 -->
    <div class="invite-card" @click="$router.push('/mobile/approval')">
      <div class="invite-icon" style="background: linear-gradient(135deg, #e6a23c 0%, #f56c6c 100%);">📋</div>
      <div class="invite-info">
        <p class="invite-title">访客审批</p>
        <p class="invite-hint">审批访客的预约申请</p>
      </div>
      <span class="invite-arrow">›</span>
    </div>

    <div class="menu-grid">
      <div class="menu-item" @click="$router.push('/mobile/vehicles')">
        <div class="icon" style="background: #409eff;">
          <span>🚗</span>
        </div>
        <p class="label">我的车辆</p>
      </div>

      <div class="menu-item" @click="$router.push('/mobile/reservations')">
        <div class="icon" style="background: #67c23a;">
          <span>📅</span>
        </div>
        <p class="label">我的预约</p>
      </div>

      <div class="menu-item" @click="$router.push('/mobile/notices')">
        <div class="icon" style="background: #e6a23c;">
          <span>🔔</span>
        </div>
        <p class="label">我的通知</p>
      </div>

      <div class="menu-item" @click="$router.push('/mobile/profile')">
        <div class="icon" style="background: #909399;">
          <span>👤</span>
        </div>
        <p class="label">个人信息</p>
      </div>
    </div>

    <!-- 邀请码弹窗 -->
    <div class="modal" v-if="showInviteModal" @click.self="showInviteModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>我的邀请码</h3>
          <span class="close-btn" @click="showInviteModal = false">×</span>
        </div>
        <div class="modal-body">
          <div class="code-display" v-if="inviteCode">
            <p class="code-text">{{ inviteCode }}</p>
            <button class="copy-btn" @click="copyCode">复制邀请码</button>
          </div>
          <div class="loading-text" v-else-if="loadingCode">
            <p>加载中...</p>
          </div>
          <div class="empty-code" v-else>
            <p>暂无可用邀请码</p>
          </div>
          <div class="tips">
            <p>• 将此邀请码分享给访客</p>
            <p>• 访客可凭邀请码预约停车位</p>
            <p>• 您的邀请码是您的用户名 Base64 编码</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMyInviteCode, getUserInfo } from '@/utils/api'

export default {
  name: 'MobileHome',
  data() {
    return {
      userInfo: null,
      userRole: 'owner',
      showInviteModal: false,
      inviteCode: '',
      loadingCode: false
    }
  },
  computed: {
    roleText() {
      return this.userRole === 'visitor' ? '访客用户' : '业主用户'
    }
  },
  created() {
    this.fetchUserInfo()
  },
  watch: {
    showInviteModal(val) {
      if (val && !this.inviteCode) {
        this.fetchInviteCode()
      }
    }
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
        .finally(() => {
          this.userRole = localStorage.getItem('userRole') || 'owner'
        })
    },
    fetchInviteCode() {
      this.loadingCode = true
      getMyInviteCode()
        .then(res => {
          if (res.code === 200) {
            this.inviteCode = res.data
          }
        })
        .catch(() => {
          // 如果获取失败，尝试使用用户名生成
          if (this.userInfo && this.userInfo.username) {
            this.inviteCode = btoa(this.userInfo.username)
          }
        })
        .finally(() => {
          this.loadingCode = false
        })
    },

    copyCode() {
      navigator.clipboard.writeText(this.inviteCode).then(() => {
        alert('邀请码已复制到剪贴板')
      })
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
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

.invite-card {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 15px;
  padding: 15px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.invite-card:active {
  transform: scale(0.98);
}

.invite-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-right: 12px;
}

.invite-info {
  flex: 1;
}

.invite-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 4px;
}

.invite-hint {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.invite-arrow {
  font-size: 24px;
  color: #ccc;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 0 15px 20px;
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
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 17px;
  color: #333;
}

.close-btn {
  font-size: 28px;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 25px 20px;
}

.code-display {
  text-align: center;
}

.code-text {
  font-size: 24px;
  font-weight: bold;
  font-family: monospace;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  letter-spacing: 3px;
  color: #409eff;
  margin-bottom: 15px;
}

.copy-btn {
  width: 100%;
  padding: 12px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.loading-text,
.empty-code {
  text-align: center;
  padding: 30px;
  color: #999;
}

.tips {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.tips p {
  margin: 5px 0;
  font-size: 13px;
  color: #666;
}
</style>

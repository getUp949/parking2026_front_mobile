<template>
  <div class="login-page">
    <div class="login-box">
      <h1 class="title">停车场管理</h1>
      <p class="subtitle">{{ isVisitorLogin ? '访客端' : '业主移动端' }}</p>

      <div class="login-type-switch">
        <button 
          :class="{ active: !isVisitorLogin }" 
          @click="isVisitorLogin = false"
        >
          业主登录
        </button>
        <button 
          :class="{ active: isVisitorLogin }" 
          @click="isVisitorLogin = true"
        >
          访客登录
        </button>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <input
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="register-link">
        <span>还没有账号？</span>
        <router-link 
          :to="isVisitorLogin ? '/mobile/visitor/register' : '/mobile/register'"
        >
          {{ isVisitorLogin ? '访客注册' : '业主注册' }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '@/utils/api'

export default {
  name: 'MobileLogin',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false,
      isVisitorLogin: false
    }
  },
  methods: {
    handleLogin() {
      this.loading = true
      login({
        ...this.form,
        loginType: this.isVisitorLogin ? 'visitor' : 'owner',
        role: this.isVisitorLogin ? 'visitor' : 'owner'
      })
        .then(res => {
          if (res.code === 200) {
            const token = typeof res.data === 'string' ? res.data : (res.data.token || res.data?.access_token)
            localStorage.setItem('token', token)
            
            const user = typeof res.data === 'object' ? res.data.user : null
            if (user) {
              localStorage.setItem('userInfo', JSON.stringify(user))
              // 存储用户角色
              localStorage.setItem('userRole', user.role || (this.isVisitorLogin ? 'visitor' : 'owner'))
            } else {
              localStorage.removeItem('userInfo')
              // 如果没有用户信息，也存储角色
              localStorage.setItem('userRole', this.isVisitorLogin ? 'visitor' : 'owner')
            }
            
            // 根据角色跳转到对应首页
            if (this.isVisitorLogin) {
              this.$router.push('/mobile/visitor')
            } else {
              this.$router.push('/mobile')
            }
          } else {
            alert(res.message || '登录失败')
          }
        })
        .catch(err => {
          alert(err.message || '登录失败，请检查用户名和密码')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 350px;
  background: #fff;
  border-radius: 12px;
  padding: 40px 30px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.title {
  text-align: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 5px;
}

.subtitle {
  text-align: center;
  color: #999;
  margin-bottom: 30px;
  font-size: 14px;
}

.login-type-switch {
  display: flex;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 25px;
}

.login-type-switch button {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.login-type-switch button.active {
  background: #fff;
  color: #667eea;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.login-form .form-group {
  margin-bottom: 20px;
}

.login-form input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
}

.login-form input:focus {
  outline: none;
  border-color: #667eea;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>

<template>
  <div class="register-page">
    <div class="register-box">
      <h1 class="title">访客注册</h1>
      <p class="subtitle">创建您的访客账号</p>

      <form @submit.prevent="handleRegister" class="register-form">
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
        <div class="form-group">
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认密码"
            required
          />
        </div>
        <div class="form-group">
          <input
            v-model="form.phone"
            type="tel"
            placeholder="请输入手机号"
            required
          />
        </div>
        <div class="form-group">
          <input
            v-model="form.realName"
            type="text"
            placeholder="请输入真实姓名"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <div class="login-link">
        已有账号？<router-link to="/mobile/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { visitorRegister } from '@/utils/api'

export default {
  name: 'VisitorRegister',
  data() {
    return {
      form: {
        username: '',
        password: '',
        confirmPassword: '',
        phone: '',
        realName: ''
      },
      loading: false
    }
  },
  methods: {
    handleRegister() {
      // 验证密码
      if (this.form.password !== this.form.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }

      // 验证密码长度
      if (this.form.password.length < 6) {
        alert('密码长度不能少于6位')
        return
      }

      // 验证手机号格式
      const phoneReg = /^1[3-9]\d{9}$/
      if (!phoneReg.test(this.form.phone)) {
        alert('请输入正确的手机号')
        return
      }

      this.loading = true
      
      const registerData = {
        username: this.form.username,
        password: this.form.password,
        phone: this.form.phone,
        realName: this.form.realName,
        role: 'visitor'
      }

      visitorRegister(registerData)
        .then(res => {
          if (res.code === 200) {
            alert('注册成功！请登录')
            this.$router.push('/mobile/login')
          } else {
            alert(res.message || '注册失败')
          }
        })
        .catch(err => {
          alert(err.message || '注册失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
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

.register-form .form-group {
  margin-bottom: 15px;
}

.register-form input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  box-sizing: border-box;
}

.register-form input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  margin-top: 10px;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>

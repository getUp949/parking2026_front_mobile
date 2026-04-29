import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import MyVehicle from '../views/MyVehicle.vue'
import VehicleForm from '../views/VehicleForm.vue'
import MyReservation from '../views/MyReservation.vue'
import MyNotice from '../views/MyNotice.vue'
import Profile from '../views/Profile.vue'
import OwnerApproval from '../views/OwnerApproval.vue'

// 访客相关组件
import HomeVisitor from '../views/visitor/HomeVisitor.vue'
import VisitorReservation from '../views/visitor/VisitorReservation.vue'
import VisitorReservationForm from '../views/visitor/VisitorReservationForm.vue'
import VisitorNotice from '../views/visitor/VisitorNotice.vue'
import VisitorProfile from '../views/visitor/VisitorProfile.vue'
import VisitorRegister from '../views/visitor/VisitorRegister.vue'
import AreaPrediction from '../views/visitor/AreaPrediction.vue'

Vue.use(VueRouter)

// 获取用户角色（从 localStorage 或用户信息中推断）
function getUserRole() {
  // 优先从 localStorage 读取
  const storedRole = localStorage.getItem('userRole')
  if (storedRole) {
    return storedRole
  }

  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr)
      // 如果用户信息中包含角色字段
      if (userInfo.role) {
        return userInfo.role
      }
      // 根据用户类型推断
      if (userInfo.userType === 'VISITOR' || userInfo.userType === 'visitor') {
        return 'visitor'
      }
      // 如果有车辆信息，可能是业主
      if (userInfo.vehicleCount !== undefined || userInfo.hasVehicle) {
        return 'owner'
      }
    } catch (e) {
      console.error('解析用户信息失败', e)
    }
  }
  return 'owner' // 默认是业主
}

const routes = [
  {
    path: '/mobile/login',
    name: 'MobileLogin',
    component: Login
  },
  {
    path: '/mobile/register',
    name: 'MobileRegister',
    component: Register
  },
  {
    path: '/mobile/visitor/register',
    name: 'MobileVisitorRegister',
    component: VisitorRegister
  },
  {
    path: '/mobile',
    name: 'MobileHome',
    component: Home,
    meta: { requiresAuth: true, role: 'owner' }
  },
  {
    path: '/mobile/vehicles',
    name: 'MobileMyVehicle',
    component: MyVehicle,
    meta: { requiresAuth: true, role: 'owner' }
  },
  {
    path: '/mobile/vehicle/add',
    name: 'MobileAddVehicle',
    component: VehicleForm,
    meta: { requiresAuth: true, role: 'owner' }
  },
  {
    path: '/mobile/vehicle/edit/:id',
    name: 'MobileEditVehicle',
    component: VehicleForm,
    meta: { requiresAuth: true, role: 'owner' }
  },
  {
    path: '/mobile/reservations',
    name: 'MobileMyReservation',
    component: MyReservation,
    meta: { requiresAuth: true, role: 'owner' }
  },
  {
    path: '/mobile/approval',
    name: 'MobileOwnerApproval',
    component: OwnerApproval,
    meta: { requiresAuth: true, role: 'owner' }
  },
  {
    path: '/mobile/prediction',
    name: 'MobileOwnerPrediction',
    component: AreaPrediction,
    meta: { requiresAuth: true, role: 'owner' }
  },
  {
    path: '/mobile/notices',
    name: 'MobileMyNotice',
    component: MyNotice,
    meta: { requiresAuth: true, role: 'owner' }
  },
  {
    path: '/mobile/profile',
    name: 'MobileProfile',
    component: Profile,
    meta: { requiresAuth: true, role: 'owner' }
  },
  // 访客路由
  {
    path: '/mobile/visitor',
    name: 'MobileVisitorHome',
    component: HomeVisitor,
    meta: { requiresAuth: true, role: 'visitor' }
  },
  {
    path: '/mobile/visitor/reservations',
    name: 'MobileVisitorReservation',
    component: VisitorReservation,
    meta: { requiresAuth: true, role: 'visitor' }
  },
  {
    path: '/mobile/visitor/reservation/add',
    name: 'MobileVisitorAddReservation',
    component: VisitorReservationForm,
    meta: { requiresAuth: true, role: 'visitor' }
  },
  {
    path: '/mobile/visitor/notices',
    name: 'MobileVisitorNotice',
    component: VisitorNotice,
    meta: { requiresAuth: true, role: 'visitor' }
  },
  {
    path: '/mobile/visitor/profile',
    name: 'MobileVisitorProfile',
    component: VisitorProfile,
    meta: { requiresAuth: true, role: 'visitor' }
  },
  {
    path: '/mobile/visitor/prediction',
    name: 'MobileAreaPrediction',
    component: AreaPrediction,
    meta: { requiresAuth: true, role: 'visitor' }
  },
  {
    path: '/',
    redirect: '/mobile/login'
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRole = getUserRole()

  if (to.meta.requiresAuth && !token) {
    next('/mobile/login')
  } else if (to.path === '/mobile/login' && token) {
    // 已登录，根据角色跳转
    if (userRole === 'visitor') {
      next('/mobile/visitor')
    } else {
      next('/mobile')
    }
  } else if (to.meta.role && to.meta.role !== userRole) {
    // 角色不匹配，跳转到对应角色的首页
    if (userRole === 'visitor') {
      next('/mobile/visitor')
    } else {
      next('/mobile')
    }
  } else {
    next()
  }
})

export default router

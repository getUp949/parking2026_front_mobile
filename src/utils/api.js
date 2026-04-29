import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      window.location.href = '/mobile.html#/mobile/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export function login(data) {
  return request.post('/auth/login', data)
}

export function logout() {
  return request.post('/auth/logout')
}

// 获取用户信息
export function getUserInfo() {
  return request.get('/auth/info')
}

export function getMyVehicles() {
  return request.get('/owner/vehicle/my')
}

export function getVehicleDetail(id) {
  return request.get(`/owner/vehicle/${id}`)
}

export function addVehicle(data) {
  return request.post('/owner/vehicle', data)
}

export function updateVehicle(id, data) {
  return request.put(`/owner/vehicle/${id}`, data)
}

export function deleteVehicle(id) {
  return request.delete(`/owner/vehicle/${id}`)
}

export function setDefaultVehicle(id) {
  return request.put(`/owner/vehicle/${id}/default`)
}

export function getMyReservations() {
  return request.get('/reservation/temp/my')
}

export function createReservation(data) {
  return request.post('/reservation/temp', data)
}

export function cancelReservation(id) {
  return request.put(`/reservation/temp/${id}/cancel`)
}

export function getMyNotices(params) {
  return request.get('/notice/my', { params })
}

export function markNoticeRead(id) {
  return request.put(`/notice/${id}/read`)
}

export function getAreaList() {
  return request.get('/parking/area/list')
}

// ==================== 访客预约相关 API ====================

// 获取我的邀请码（业主）
export function getMyInviteCode() {
  return request.get('/visit/my-invite-code')
}

// 解析邀请码（公开接口）
export function resolveInviteCode(code) {
  return request.get('/visit/resolve', { params: { code } })
}

// 获取访客预约列表
export function getVisitorReservations() {
  return request.get('/reservation/temp/my-as-visitor')
}

// 创建访客预约
export function createVisitorReservation(data) {
  return request.post('/reservation/temp', data)
}

// 取消访客预约
export function cancelVisitorReservation(id) {
  return request.put(`/reservation/temp/${id}/cancel`)
}

// ==================== 业主审批相关 API ====================

// 获取待审批的预约列表（业主视角）
export function getOwnerReservations() {
  return request.get('/reservation/temp/my-as-owner')
}

// 获取预约详情
export function getReservationDetail(id) {
  return request.get(`/reservation/temp/${id}`)
}

// 审批预约（通过/拒绝）
export function approveReservation(id, data) {
  return request.put(`/reservation/temp/${id}/approve`, data)
}

// 获取访客通知列表
export function getVisitorNotices(params) {
  return request.get('/notice/my', { params })
}

// 标记访客通知已读
export function markVisitorNoticeRead(id) {
  return request.put(`/notice/${id}/read`)
}

// 访客注册（如果需要）
export function visitorRegister(data) {
  return request.post('/auth/register', data)
}

// 业主注册
export function ownerRegister(data) {
  return request.post('/auth/register', { ...data, userType: 'owner' })
}

// 访客预约详情
export function getVisitorReservationDetail(id) {
  return request.get(`/visitor/reservation/${id}`)
}

// ==================== 车位预测相关 API ====================

// 预测所有区域空位
export function getAllAreasPrediction(params) {
  return request.get('/prediction/all-areas', { params })
}

// 预测指定区域空位
export function getAreaPrediction(areaId, params) {
  return request.get(`/prediction/area/${areaId}/vacancy`, { params })
}

// 获取即将离开的预约列表
export function getLeavingReservations(areaId, params) {
  return request.get(`/prediction/area/${areaId}/leaving`, { params })
}

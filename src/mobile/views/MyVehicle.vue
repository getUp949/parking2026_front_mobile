<template>
  <div class="my-vehicle-page">
    <div class="nav-bar">
      <span class="back" @click="$router.back()">←</span>
      <span class="title">我的车辆</span>
      <span v-if="vehicleList.length === 0" class="add" @click="$router.push('/mobile/vehicle/add')">+</span>
      <span v-else class="placeholder"></span>
    </div>

    <div class="content">
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="vehicleList.length === 0" class="empty">
        <p>您还没有登记车辆</p>
        <button class="btn btn-primary" @click="$router.push('/mobile/vehicle/add')">
          添加车辆
        </button>
      </div>

      <div v-else class="vehicle-list">
        <div class="limit-notice">
          <span>每位用户最多登记一辆车辆</span>
        </div>
        <div
          v-for="item in vehicleList"
          :key="item.id"
          class="vehicle-card"
        >
          <div class="card-header">
            <span class="plate">{{ item.licensePlate }}</span>
            <span v-if="item.isDefault === 1" class="default-tag">默认</span>
            <span class="status-tag" :class="'status-' + item.status">
              {{ getStatusText(item.status) }}
            </span>
          </div>
          <div class="card-body">
            <p>品牌：{{ item.vehicleBrand || '-' }}</p>
            <p>型号：{{ item.vehicleModel || '-' }}</p>
            <p>类型：{{ getVehicleTypeText(item.vehicleType) }}</p>
          </div>
          <div class="card-footer">
            <button
              v-if="item.status === 1 && item.isDefault !== 1"
              @click="handleSetDefault(item)"
              class="btn-text"
            >设为默认</button>
            <button
              v-if="item.status === 1"
              @click="$router.push(`/mobile/vehicle/edit/${item.id}`)"
              class="btn-text"
            >编辑</button>
            <button @click="handleDelete(item)" class="btn-text danger">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMyVehicles, setDefaultVehicle, deleteVehicle } from '@/utils/api'

export default {
  name: 'MobileMyVehicle',
  data() {
    return {
      vehicleList: [],
      loading: false
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      getMyVehicles()
        .then(res => {
          if (res.code === 200) {
            this.vehicleList = res.data || []
          }
        })
        .catch(err => {
          alert(err.message || '获取车辆列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },

    getStatusText(status) {
      const map = { 0: '待审核', 1: '已通过', 2: '已拒绝' }
      return map[status] || status
    },

    getVehicleTypeText(type) {
      const map = {
        small: '小型车',
        medium: '中型车',
        large: '大型车',
        suv: 'SUV',
        mpv: 'MPV'
      }
      return map[type] || type || '-'
    },

    handleSetDefault(vehicle) {
      if (!confirm(`确定将 "${vehicle.licensePlate}" 设为默认车辆？`)) return
      setDefaultVehicle(vehicle.id)
        .then(res => {
          if (res.code === 200) {
            alert('设置成功')
            this.fetchData()
          }
        })
    },

    handleDelete(vehicle) {
      if (!confirm(`确定删除车牌 "${vehicle.licensePlate}"？`)) return
      deleteVehicle(vehicle.id)
        .then(res => {
          if (res.code === 200) {
            alert('删除成功')
            this.fetchData()
          }
        })
    }
  }
}
</script>

<style scoped>
.my-vehicle-page {
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
  font-size: 20px;
  color: #409eff;
  cursor: pointer;
  width: 40px;
}

.nav-bar .placeholder {
  width: 40px;
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

.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.limit-notice {
  text-align: center;
  padding: 10px;
  margin-bottom: 10px;
  background: #fdf6ec;
  border-radius: 6px;
  font-size: 13px;
  color: #e6a23c;
}

.limit-notice span {
  color: #e6a23c;
}

.vehicle-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #409eff;
  color: #fff;
  gap: 10px;
}

.card-header .plate {
  font-size: 18px;
  font-weight: bold;
}

.default-tag {
  padding: 2px 8px;
  background: #67c23a;
  border-radius: 3px;
  font-size: 12px;
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
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 15px;
  border-top: 1px solid #eee;
  gap: 15px;
}

.btn-text {
  background: none;
  border: none;
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
}

.btn-text.danger {
  color: #f56c6c;
}
</style>

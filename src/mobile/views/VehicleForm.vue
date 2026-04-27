<template>
  <div class="vehicle-form-page">
    <div class="nav-bar">
      <span class="back" @click="$router.back()">←</span>
      <span class="title">{{ isEdit ? '编辑车辆' : '添加车辆' }}</span>
      <span class="placeholder"></span>
    </div>

    <div class="content">
      <div class="form-group">
        <label>车牌号 <span class="required">*</span></label>
        <input
          v-model="form.licensePlate"
          type="text"
          placeholder="请输入车牌号，如：京A12345"
          :disabled="isEdit"
        />
      </div>

      <div class="form-group">
        <label>车辆品牌</label>
        <input v-model="form.vehicleBrand" type="text" placeholder="如：宝马" />
      </div>

      <div class="form-group">
        <label>车辆型号</label>
        <input v-model="form.vehicleModel" type="text" placeholder="如：X5" />
      </div>

      <div class="form-group">
        <label>车辆颜色</label>
        <input v-model="form.vehicleColor" type="text" placeholder="如：黑色" />
      </div>

      <div class="form-group">
        <label>车辆类型</label>
        <select v-model="form.vehicleType">
          <option value="">请选择</option>
          <option value="small">小型车</option>
          <option value="medium">中型车</option>
          <option value="large">大型车</option>
          <option value="suv">SUV</option>
          <option value="mpv">MPV</option>
        </select>
      </div>

      <button
        class="btn btn-primary btn-block"
        @click="handleSubmit"
        :disabled="loading"
      >
        {{ loading ? '提交中...' : '提交' }}
      </button>
    </div>
  </div>
</template>

<script>
import { addVehicle, updateVehicle, getVehicleDetail, getMyVehicles } from '@/utils/api'

export default {
  name: 'VehicleForm',
  data() {
    return {
      vehicleId: null,
      isEdit: false,
      loading: false,
      form: {
        licensePlate: '',
        vehicleBrand: '',
        vehicleModel: '',
        vehicleColor: '',
        vehicleType: ''
      }
    }
  },
  created() {
    const id = this.$route.params.id
    if (id) {
      this.vehicleId = id
      this.isEdit = true
      this.fetchDetail(id)
    } else {
      this.checkVehicleLimit()
    }
  },
  methods: {
    fetchDetail(id) {
      getVehicleDetail(id).then(res => {
        if (res.code === 200) {
          this.form = {
            licensePlate: res.data.licensePlate,
            vehicleBrand: res.data.vehicleBrand,
            vehicleModel: res.data.vehicleModel,
            vehicleColor: res.data.vehicleColor,
            vehicleType: res.data.vehicleType
          }
        }
      })
    },

    checkVehicleLimit() {
      getMyVehicles()
        .then(res => {
          if (res.code === 200 && res.data && res.data.length > 0) {
            alert('您已登记过车辆，每位用户最多只能登记一辆车辆')
            this.$router.replace('/mobile/my-vehicle')
          }
        })
        .catch(() => {
          // If fetch fails, allow the user to proceed
        })
    },

    handleSubmit() {
      if (!this.form.licensePlate) {
        alert('请输入车牌号')
        return
      }

      this.loading = true
      const api = this.isEdit
        ? updateVehicle(this.vehicleId, this.form)
        : addVehicle(this.form)

      api.then(res => {
        if (res.code === 200) {
          alert(this.isEdit ? '修改成功' : '添加成功')
          this.$router.back()
        } else {
          alert(res.message || '操作失败')
        }
      })
      .catch(err => {
        alert(err.message || '操作失败')
      })
      .finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.vehicle-form-page {
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
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
}
</style>

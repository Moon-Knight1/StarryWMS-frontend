<template>
  <el-drawer title="库位详情" v-model="visible" direction="rtl" size="60%" append-to-body :before-close="handleClose" class="detail-drawer">
    <div v-loading="loading" class="drawer-content">
      <h4 class="section-header">基本信息</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">库位编码：</label>
            <span class="info-value plaintext">{{ info.locationCode }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">储位类别：</label>
            <span class="info-value plaintext">
              <dict-tag :options="wms_location_category" :value="info.locationCategory" />
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">库位类型：</label>
            <span class="info-value plaintext">
              <dict-tag :options="wms_location_type" :value="info.locationType" />
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">状态：</label>
            <span class="info-value plaintext">
              <dict-tag :options="wms_location_status" :value="info.status" />
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">是否可售库位：</label>
            <span class="info-value plaintext">
              <dict-tag :options="wms_sellable_status" :value="info.isSellable" />
            </span>
          </div>
        </el-col>
      </el-row>

      <h4 class="section-header">关联信息</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">所属仓库：</label>
            <span class="info-value plaintext">{{ info.warehouseName || info.warehouseId }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">所属库区：</label>
            <span class="info-value plaintext">{{ info.zoneName || info.zoneId }}</span>
          </div>
        </el-col>
      </el-row>

      <h4 class="section-header">位置信息</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="8">
          <div class="info-item">
            <label class="info-label">巷道编号：</label>
            <span class="info-value plaintext">{{ info.locationAisle }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label class="info-label">排编号：</label>
            <span class="info-value plaintext">{{ info.locationLine }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label class="info-label">列编号：</label>
            <span class="info-value plaintext">{{ info.locationRank }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">层编号：</label>
            <span class="info-value plaintext">{{ info.locationLayer }}</span>
          </div>
        </el-col>
      </el-row>

      <h4 class="section-header">规格信息</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="8">
          <div class="info-item">
            <label class="info-label">库位长度 (cm)：</label>
            <span class="info-value plaintext">{{ info.locationLength }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label class="info-label">库位宽度 (cm)：</label>
            <span class="info-value plaintext">{{ info.locationWidth }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label class="info-label">容积 (cm³)：</label>
            <span class="info-value plaintext">{{ info.locationCapacity }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">承重 (kg)：</label>
            <span class="info-value plaintext">{{ info.loadCapacity }}</span>
          </div>
        </el-col>
      </el-row>

      <h4 class="section-header">审计信息</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="8">
          <div class="info-item">
            <label class="info-label">创建者：</label>
            <span class="info-value plaintext">{{ info.createBy }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label class="info-label">创建时间：</label>
            <span class="info-value plaintext">{{ parseTime(info.createTime, '{y}-{m}-{d} {h}:{i}') }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <label class="info-label">更新者：</label>
            <span class="info-value plaintext">{{ info.updateBy }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="8">
          <div class="info-item">
            <label class="info-label">更新时间：</label>
            <span class="info-value plaintext">{{ parseTime(info.updateTime, '{y}-{m}-{d} {h}:{i}') }}</span>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-drawer>
</template>

<script setup lang="ts" name="Storage_locationViewDrawer">
import type { WmsStorageLocations } from "@/types/api/location/storage_location"
import { getStorage_location } from '@/api/location/storage_location'

const { wms_location_status, wms_sellable_status, wms_location_category, wms_location_type } = useDict('wms_location_status', 'wms_sellable_status', 'wms_location_category', 'wms_location_type')

const visible = ref<boolean>(false)
const loading = ref<boolean>(false)
const info = reactive<Partial<WmsStorageLocations>>({})

const open = async (id: string): Promise<void> => {
  visible.value = true
  loading.value = true
  try {
    const res = await getStorage_location(id)
    Object.assign(info, res.data ?? {})
  } catch (error) {
    console.error('获取库位信息失败:', error)
  } finally {
    loading.value = false
  }
}

const handleClose = (): void => {
  visible.value = false
  Object.keys(info).forEach(key => delete (info as any)[key])
}

defineExpose({ open })
</script>

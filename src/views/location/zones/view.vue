<template>
  <el-drawer title="库区详情" v-model="visible" direction="rtl" size="60%" append-to-body :before-close="handleClose" class="detail-drawer">
    <div v-loading="loading" class="drawer-content">
      <h4 class="section-header">基本信息</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">库区编码：</label>
            <span class="info-value plaintext">
              {{ info.zoneCode }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">库区名称：</label>
            <span class="info-value plaintext">
              {{ info.zoneName }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">库区类型：</label>
            <span class="info-value plaintext">
              <dict-tag :options="wms_zone_type" :value="info.zoneType" />
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">状态：</label>
            <span class="info-value plaintext">
              <dict-tag :options="wms_enable_status" :value="info.status" />
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">是否可售库存：</label>
            <span class="info-value plaintext">
              <dict-tag :options="wms_sellable_status" :value="info.isSellable" />
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">所属仓库：</label>
            <span class="info-value plaintext">
              {{ info.warehouseName || info.warehouseId }}
            </span>
          </div>
        </el-col>
      </el-row>
      <h4 class="section-header">审计信息</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">创建者：</label>
            <span class="info-value plaintext">
              {{ info.createBy }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">创建时间：</label>
            <span class="info-value plaintext">
              {{ info.createTime }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">更新者：</label>
            <span class="info-value plaintext">
              {{ info.updateBy }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">更新时间：</label>
            <span class="info-value plaintext">
              {{ info.updateTime }}
            </span>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-drawer>
</template>

<script setup lang="ts" name="ZonesViewDrawer">
import type { WmsStorageZones } from "@/types/api/location/zones"
import { getZones } from '@/api/location/zones'

const { wms_sellable_status, wms_zone_type, wms_enable_status } = useDict('wms_sellable_status', 'wms_zone_type', 'wms_enable_status')

const visible = ref<boolean>(false)
const loading = ref<boolean>(false)
const info = reactive<Partial<WmsStorageZones>>({})

const open = async (id: string): Promise<void> => {
  visible.value = true
  loading.value = true
  try {
    const res = await getZones(id)
    Object.assign(info, res.data ?? {})
  } catch (error) {
    console.error('获取库区信息失败:', error)
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

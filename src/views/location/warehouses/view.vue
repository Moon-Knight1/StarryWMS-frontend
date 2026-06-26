<template>
  <el-drawer title="仓库详情" v-model="visible" direction="rtl" size="60%" append-to-body :before-close="handleClose" class="detail-drawer">
    <div v-loading="loading" class="drawer-content">
      <h4 class="section-header">基本信息</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">创建时间：</label>
            <span class="info-value plaintext">
              {{ parseTime(info.createTime, '{y}-{m}-{d}') }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">更新时间：</label>
            <span class="info-value plaintext">
              {{ parseTime(info.updateTime, '{y}-{m}-{d}') }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">仓库编码 (唯一标识，如 WH001)：</label>
            <span class="info-value plaintext">
              {{ info.warehouseCode }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">仓库名称：</label>
            <span class="info-value plaintext">
              {{ info.warehouseName }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">仓库属性 (如: 常温仓/冷藏仓/危险品仓)：</label>
            <span class="info-value plaintext">
              <dict-tag :options="wms_warehouse_attr" :value="info.warehouseAttr" />
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">状态 (0-创建 1-启用 2-禁用)：</label>
            <span class="info-value plaintext">
              <dict-tag :options="wms_warehouse_status" :value="info.status" />
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">租户ID (多租户隔离)：</label>
            <span class="info-value plaintext">
              {{ info.tenantId }}
            </span>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-drawer>
</template>

<script setup lang="ts" name="WarehousesViewDrawer">
import type { WmsWarehouses } from "@/types/api/location/warehouses"
import { getWarehouses } from '@/api/location/warehouses'

const { wms_warehouse_status, wms_warehouse_attr } = useDict('wms_warehouse_status', 'wms_warehouse_attr')

const visible = ref<boolean>(false)
const loading = ref<boolean>(false)
const info = reactive<Partial<WmsWarehouses>>({})

const open = async (id: string): Promise<void> => {
  visible.value = true
  loading.value = true
  try {
    const res = await getWarehouses(id)
    Object.assign(info, res.data ?? {})
  } catch (error) {
    console.error('获取仓库信息失败:', error)
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

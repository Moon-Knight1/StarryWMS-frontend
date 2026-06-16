<template>
  <el-drawer title="货主详情" v-model="visible" direction="rtl" size="60%" append-to-body :before-close="handleClose" class="detail-drawer">
    <div v-loading="loading" class="drawer-content">
      <h4 class="section-header">基本信息</h4>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">货主名称 (公司全称)：</label>
            <span class="info-value plaintext">
              {{ info.ownerName }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">国家：</label>
            <span class="info-value plaintext">
              {{ info.country }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">城市：</label>
            <span class="info-value plaintext">
              {{ info.city }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">邮编：</label>
            <span class="info-value plaintext">
              {{ info.postalCode }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">邮箱：</label>
            <span class="info-value plaintext">
              {{ info.email }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">电话：</label>
            <span class="info-value plaintext">
              {{ info.phone }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">法人代表：</label>
            <span class="info-value plaintext">
              {{ info.legalPerson }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">联系人：</label>
            <span class="info-value plaintext">
              {{ info.contactPerson }}
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">许可证有效期：</label>
            <span class="info-value plaintext">
              {{ parseTime(info.licenseValidDate, '{y}-{m}-{d}') }}
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">结算币种：</label>
            <span class="info-value plaintext">
              <dict-tag :options="wms_currency" :value="info.settlementCurrency" />
            </span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20" class="mb8">
        <el-col :span="12">
          <div class="info-item">
            <label class="info-label">状态：</label>
            <span class="info-value plaintext">
              <dict-tag :options="wms_enable_status" :value="info.status" />
            </span>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-drawer>
</template>

<script setup lang="ts" name="OwnersViewDrawer">
import type { WmsCargoOwners } from "@/types/api/wms/owners"
import { getOwners } from '@/api/wms/owners'

const { wms_currency, wms_enable_status } = useDict('wms_currency', 'wms_enable_status')

const visible = ref<boolean>(false)
const loading = ref<boolean>(false)
const info = reactive<Partial<WmsCargoOwners>>({})

const open = async (id: string): Promise<void> => {
  visible.value = true
  loading.value = true
  try {
    const res = await getOwners(id)
    Object.assign(info, res.data ?? {})
  } catch (error) {
    console.error('获取货主信息失败:', error)
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

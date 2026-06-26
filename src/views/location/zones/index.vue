<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="库区名称" prop="zoneName">
        <el-input
          v-model="queryParams.zoneName"
          placeholder="请输入库区名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="库区类型" prop="zoneType">
        <el-select v-model="queryParams.zoneType" placeholder="请选择库区类型" clearable>
          <el-option
            v-for="dict in wms_zone_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in wms_enable_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否可售库存" prop="isSellable">
        <el-select v-model="queryParams.isSellable" placeholder="请选择是否可售库存" clearable>
          <el-option
            v-for="dict in wms_sellable_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属仓库" prop="warehouseId">
        <el-select v-model="queryParams.warehouseId" placeholder="请选择所属仓库" clearable>
          <el-option
            v-for="wh in warehousesList"
            :key="wh.id"
            :label="wh.warehouseName"
            :value="wh.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="租户ID" prop="tenantId">
        <el-input
          v-model="queryParams.tenantId"
          placeholder="请输入租户ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['location:zones:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['location:zones:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['location:zones:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['location:zones:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="zonesList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="库区编码" align="center" prop="zoneCode" />
      <el-table-column label="库区名称" align="center" prop="zoneName" />
      <el-table-column label="库区类型" align="center" prop="zoneType">
        <template #default="scope">
          <dict-tag :options="wms_zone_type" :value="scope.row.zoneType"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="wms_enable_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="是否可售库存" align="center" prop="isSellable">
        <template #default="scope">
          <dict-tag :options="wms_sellable_status" :value="scope.row.isSellable"/>
        </template>
      </el-table-column>
      <el-table-column label="所属仓库名称" align="center" prop="warehouseName" />
      <el-table-column label="租户ID" align="center" prop="tenantId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleViewData(scope.row)" v-hasPermi="['location:zones:query']">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['location:zones:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['location:zones:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 库区详情抽屉 -->
    <zones-view-drawer ref="zonesViewRef" />
    <!-- 添加或修改库区对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="zonesRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="库区编码" prop="zoneCode">
              <el-input v-model="form.zoneCode" placeholder="请输入库区编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库区名称" prop="zoneName">
              <el-input v-model="form.zoneName" placeholder="请输入库区名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库区类型" prop="zoneType">
              <el-select v-model="form.zoneType" placeholder="请选择库区类型">
                <el-option
                  v-for="dict in wms_zone_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态">
                <el-option
                  v-for="dict in wms_enable_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否可售库存" prop="isSellable">
              <el-select v-model="form.isSellable" placeholder="请选择是否可售库存">
                <el-option
                  v-for="dict in wms_sellable_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属仓库" prop="warehouseId">
              <el-select v-model="form.warehouseId" placeholder="请选择所属仓库">
                <el-option
                  v-for="wh in warehousesList"
                  :key="wh.id"
                  :label="wh.warehouseName"
                  :value="wh.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租户ID" prop="tenantId">
              <el-input v-model="form.tenantId" placeholder="请输入租户ID" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Zones">
import type { WmsStorageZones, ZonesQueryParams } from "@/types/api/location/zones"
import { listZones, getZones, delZones, addZones, updateZones } from "@/api/location/zones"
import { listWarehouses } from "@/api/location/warehouses"
import type { WmsWarehouses } from "@/types/api/location/warehouses"
import ZonesViewDrawer from "./view"

const { proxy } = getCurrentInstance()
const { wms_sellable_status, wms_zone_type, wms_enable_status } = useDict('wms_sellable_status', 'wms_zone_type', 'wms_enable_status')

const zonesList = ref<WmsStorageZones[]>([])
const warehousesList = ref<WmsWarehouses[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as WmsStorageZones,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    zoneName: undefined,
    zoneType: undefined,
    status: undefined,
    isSellable: undefined,
    warehouseId: undefined,
    tenantId: undefined
  } as ZonesQueryParams,
  rules: {
    zoneCode: [
      { required: true, message: "库区编码不能为空", trigger: "blur" }
    ],
    zoneName: [
      { required: true, message: "库区名称不能为空", trigger: "blur" }
    ],
    zoneType: [
      { required: true, message: "库区类型不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
    warehouseId: [
      { required: true, message: "所属仓库不能为空", trigger: "change" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询库区列表 */
function getList() {
  loading.value = true
  listZones(queryParams.value).then(response => {
    zonesList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 加载仓库列表（供下拉选） */
function loadWarehousesList() {
  listWarehouses({ pageNum: 1, pageSize: 500 }).then(response => {
    warehousesList.value = response.rows
  }).catch(err => {
    console.error('加载仓库列表失败:', err)
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    zoneCode: null,
    zoneName: null,
    zoneType: null,
    status: null,
    isSellable: null,
    warehouseId: null,
    warehouseName: null,
    tenantId: null
  }
  proxy.resetForm("zonesRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: WmsStorageZones[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  loadWarehousesList()
  open.value = true
  title.value = "添加库区"
}

/** 修改按钮操作 */
function handleUpdate(row: WmsStorageZones) {
  reset()
  loadWarehousesList()
  const _id = row.id || ids.value[0]
  getZones(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改库区"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["zonesRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateZones(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addZones(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WmsStorageZones) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除库区编号为"' + _ids + '"的数据项？').then(function() {
    return delZones(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 详情按钮操作 */
function handleViewData(row: WmsStorageZones) {
  proxy.$refs["zonesViewRef"].open(row.id)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('location/zones/export', {
    ...queryParams.value
  }, `zones_${new Date().getTime()}.xlsx`)
}

getList()
loadWarehousesList()
</script>

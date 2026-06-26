<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="库位编码" prop="locationCode">
        <el-input
          v-model="queryParams.locationCode"
          placeholder="请输入库位编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="储位类别" prop="locationCategory">
        <el-select v-model="queryParams.locationCategory" placeholder="请选择储位类别" clearable>
          <el-option
            v-for="dict in wms_location_category"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="库位类型" prop="locationType">
        <el-select v-model="queryParams.locationType" placeholder="请选择库位类型" clearable>
          <el-option
            v-for="dict in wms_location_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in wms_location_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属仓库" prop="warehouseId">
        <el-select
          v-model="queryParams.warehouseId"
          placeholder="请选择所属仓库"
          clearable
          @change="handleQueryWarehouseChange"
        >
          <el-option
            v-for="wh in warehousesList"
            :key="wh.id"
            :label="wh.warehouseName"
            :value="wh.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属库区" prop="zoneId">
        <el-select
          v-model="queryParams.zoneId"
          placeholder="请先选择所属仓库"
          clearable
          :disabled="!queryParams.warehouseId"
        >
          <el-option
            v-for="z in filteredQueryZonesList"
            :key="z.id"
            :label="z.zoneName"
            :value="z.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否可售库位" prop="isSellable">
        <el-select v-model="queryParams.isSellable" placeholder="请选择是否可售库位" clearable>
          <el-option
            v-for="dict in wms_sellable_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['location:storage_location:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['location:storage_location:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['location:storage_location:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['location:storage_location:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="storage_locationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="库位编码" align="center" prop="locationCode" />
      <el-table-column label="所属库区" align="center" prop="zoneName" />
      <el-table-column label="所属仓库" align="center" prop="warehouseName" />
      <el-table-column label="储位类别" align="center" prop="locationCategory">
        <template #default="scope">
          <dict-tag :options="wms_location_category" :value="scope.row.locationCategory"/>
        </template>
      </el-table-column>
      <el-table-column label="库位类型" align="center" prop="locationType">
        <template #default="scope">
          <dict-tag :options="wms_location_type" :value="scope.row.locationType"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="wms_location_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="是否可售" align="center" prop="isSellable">
        <template #default="scope">
          <dict-tag :options="wms_sellable_status" :value="scope.row.isSellable"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleViewData(scope.row)" v-hasPermi="['location:storage_location:query']">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['location:storage_location:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['location:storage_location:remove']">删除</el-button>
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

    <!-- 库位详情抽屉 -->
    <storage_location-view-drawer ref="storage_locationViewRef" />
    <!-- 添加或修改库位对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="storage_locationRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="库位编码" prop="locationCode">
              <el-input v-model="form.locationCode" placeholder="请输入库位编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="储位类别" prop="locationCategory">
              <el-select v-model="form.locationCategory" placeholder="请选择储位类别">
                <el-option
                  v-for="dict in wms_location_category"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库位类型" prop="locationType">
              <el-select v-model="form.locationType" placeholder="请选择库位类型">
                <el-option
                  v-for="dict in wms_location_type"
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
                  v-for="dict in wms_location_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属仓库" prop="warehouseId">
              <el-select
                v-model="form.warehouseId"
                placeholder="请先选择所属仓库"
                @change="handleWarehouseChange"
              >
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
            <el-form-item label="所属库区" prop="zoneId">
              <el-select
                v-model="form.zoneId"
                placeholder="请选择所属库区"
                :disabled="!form.warehouseId"
              >
                <el-option
                  v-for="z in filteredZonesList"
                  :key="z.id"
                  :label="z.zoneName"
                  :value="z.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="巷道编号" prop="locationAisle">
              <el-input v-model="form.locationAisle" placeholder="请输入巷道编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排编号" prop="locationLine">
              <el-input v-model="form.locationLine" placeholder="请输入排编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="列编号" prop="locationRank">
              <el-input v-model="form.locationRank" placeholder="请输入列编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="层编号" prop="locationLayer">
              <el-input v-model="form.locationLayer" placeholder="请输入层编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库位长度 (cm)" prop="locationLength">
              <el-input v-model="form.locationLength" placeholder="请输入库位长度 (cm)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库位宽度 (cm)" prop="locationWidth">
              <el-input v-model="form.locationWidth" placeholder="请输入库位宽度 (cm)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容积 (cm³)" prop="locationCapacity">
              <el-input v-model="form.locationCapacity" placeholder="请输入容积 (cm³)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="承重 (kg)" prop="loadCapacity">
              <el-input v-model="form.loadCapacity" placeholder="请输入承重 (kg)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否可售库位" prop="isSellable">
              <el-select v-model="form.isSellable" placeholder="请选择是否可售库位">
                <el-option
                  v-for="dict in wms_sellable_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="parseInt(dict.value)"
                ></el-option>
              </el-select>
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

<script setup lang="ts" name="Storage_location">
import type { WmsStorageLocations, Storage_locationQueryParams } from "@/types/api/location/storage_location"
import { listStorage_location, getStorage_location, delStorage_location, addStorage_location, updateStorage_location } from "@/api/location/storage_location"
import { listWarehouses } from "@/api/location/warehouses"
import { listZones } from "@/api/location/zones"
import type { WmsWarehouses } from "@/types/api/location/warehouses"
import type { WmsStorageZones } from "@/types/api/location/zones"
import Storage_locationViewDrawer from "./view"

const { proxy } = getCurrentInstance()
const { wms_location_status, wms_sellable_status, wms_location_category, wms_location_type } = useDict('wms_location_status', 'wms_sellable_status', 'wms_location_category', 'wms_location_type')

const storage_locationList = ref<WmsStorageLocations[]>([])
const warehousesList = ref<WmsWarehouses[]>([])
const zonesList = ref<WmsStorageZones[]>([])
const queryZonesList = ref<WmsStorageZones[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")

const data = reactive({
  form: {} as WmsStorageLocations,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    locationCode: undefined,
    locationCategory: undefined,
    locationType: undefined,
    status: undefined,
    zoneId: undefined,
    isSellable: undefined,
    warehouseId: undefined,
  } as Storage_locationQueryParams,
  rules: {
    locationCode: [
      { required: true, message: "库位编码不能为空", trigger: "blur" }
    ],
    locationCategory: [
      { required: true, message: "储位类别不能为空", trigger: "change" }
    ],
    locationType: [
      { required: true, message: "库位类型不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
    zoneId: [
      { required: true, message: "所属库区不能为空", trigger: "change" }
    ],
    isSellable: [
      { required: true, message: "是否可售库位不能为空", trigger: "change" }
    ],
    warehouseId: [
      { required: true, message: "所属仓库不能为空", trigger: "change" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询库位列表 */
function getList() {
  loading.value = true
  listStorage_location(queryParams.value).then(response => {
    storage_locationList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 加载仓库列表（供下拉选） */
function loadWarehousesList() {
  listWarehouses({ pageNum: 1, pageSize: 500 }).then(response => {
    warehousesList.value = response.rows
  })
}

/** 加载库区列表（供下拉选，可按仓库过滤） */
function loadZonesList(warehouseId?: string) {
  listZones({ pageNum: 1, pageSize: 500, warehouseId }).then(response => {
    zonesList.value = response.rows
  })
}

/** 加载筛选区库区列表（全量） */
function loadQueryZonesList() {
  listZones({ pageNum: 1, pageSize: 500 }).then(response => {
    queryZonesList.value = response.rows
  })
}

/** 根据当前选中的仓库过滤库区下拉项 */
const filteredZonesList = computed(() => {
  if (!form.value.warehouseId) return zonesList.value
  return zonesList.value.filter(z => z.warehouseId === form.value.warehouseId)
})

/** 筛选区：根据 queryParams.warehouseId 过滤库区下拉 */
const filteredQueryZonesList = computed(() => {
  if (!queryParams.value.warehouseId) return queryZonesList.value
  return queryZonesList.value.filter(z => z.warehouseId === queryParams.value.warehouseId)
})

/** 表单区仓库切换时触发：清空库区并按仓库重新拉库区列表 */
function handleWarehouseChange(warehouseId: string) {
  form.value.zoneId = null
  loadZonesList(warehouseId)
}

/** 筛选区仓库切换时触发：清空已选库区 */
function handleQueryWarehouseChange() {
  queryParams.value.zoneId = undefined
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
    sysOrgCode: null,
    locationCode: null,
    locationCategory: null,
    locationType: null,
    status: null,
    zoneId: null,
    zoneName: null,
    locationAisle: null,
    locationLine: null,
    locationRank: null,
    locationLayer: null,
    locationLength: null,
    locationWidth: null,
    locationCapacity: null,
    loadCapacity: null,
    isSellable: null,
    warehouseId: null,
    warehouseName: null,
    tenantId: null
  }
  proxy.resetForm("storage_locationRef")
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
function handleSelectionChange(selection: WmsStorageLocations[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  loadWarehousesList()
  loadZonesList()
  open.value = true
  title.value = "添加库位"
}

/** 修改按钮操作 */
function handleUpdate(row: WmsStorageLocations) {
  reset()
  loadWarehousesList()
  loadZonesList()
  const _id = row.id || ids.value[0]
  getStorage_location(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改库位"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["storage_locationRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateStorage_location(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addStorage_location(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WmsStorageLocations) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除库位编号为"' + _ids + '"的数据项？').then(function() {
    return delStorage_location(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 详情按钮操作 */
function handleViewData(row: WmsStorageLocations) {
  proxy.$refs["storage_locationViewRef"].open(row.id)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('location/storage_location/export', {
    ...queryParams.value
  }, `storage_location_${new Date().getTime()}.xlsx`)
}

getList()
loadWarehousesList()
loadQueryZonesList()
</script>

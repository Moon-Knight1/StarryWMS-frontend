<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeCreateTime"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="货主编码 (唯一标识，如 C00001)" prop="ownerCode">
        <el-input
          v-model="queryParams.ownerCode"
          placeholder="请输入货主编码 (唯一标识，如 C00001)"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="货主名称 (公司全称)" prop="ownerName">
        <el-input
          v-model="queryParams.ownerName"
          placeholder="请输入货主名称 (公司全称)"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="国家" prop="country">
        <el-input
          v-model="queryParams.country"
          placeholder="请输入国家"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="城市" prop="city">
        <el-input
          v-model="queryParams.city"
          placeholder="请输入城市"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="结算币种" prop="settlementCurrency">
        <el-select v-model="queryParams.settlementCurrency" placeholder="请选择结算币种" clearable>
          <el-option
            v-for="dict in wms_currency"
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
          v-hasPermi="['master:consgnor:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['master:consgnor:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['master:consgnor:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['master:consgnor:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="consgnorList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货主编码 (唯一标识，如 C00001)" align="center" prop="ownerCode" />
      <el-table-column label="货主名称 (公司全称)" align="center" prop="ownerName" />
      <el-table-column label="国家" align="center" prop="country" />
      <el-table-column label="城市" align="center" prop="city" />
      <el-table-column label="详细地址" align="center" prop="address" />
      <el-table-column label="邮编" align="center" prop="postalCode" />
      <el-table-column label="邮箱" align="center" prop="email" />
      <el-table-column label="电话" align="center" prop="phone" />
      <el-table-column label="法人代表" align="center" prop="legalPerson" />
      <el-table-column label="联系人" align="center" prop="contactPerson" />
      <el-table-column label="联系人电话" align="center" prop="contactPhone" />
      <el-table-column label="许可证号码" align="center" prop="licenseNumber" />
      <el-table-column label="许可证有效期" align="center" prop="licenseValidDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.licenseValidDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="许可证附件路径" align="center" prop="licenseAttachment" />
      <el-table-column label="统一社会信用代码" align="center" prop="usci" />
      <el-table-column label="营业执照附件路径" align="center" prop="businessLicenseAttachment" />
      <el-table-column label="结算币种" align="center" prop="settlementCurrency">
        <template #default="scope">
          <dict-tag :options="wms_currency" :value="scope.row.settlementCurrency"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remarks" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="wms_enable_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleViewData(scope.row)" v-hasPermi="['master:consgnor:query']">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['master:consgnor:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['master:consgnor:remove']">删除</el-button>
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

    <!-- 货主详情抽屉 -->
    <consgnor-view-drawer ref="consgnorViewRef" />
    <!-- 添加或修改货主对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="consgnorRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="货主名称 (公司全称)" prop="ownerName">
              <el-input v-model="form.ownerName" placeholder="请输入货主名称 (公司全称)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="国家" prop="country">
              <el-input v-model="form.country" placeholder="请输入国家" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="城市" prop="city">
              <el-input v-model="form.city" placeholder="请输入城市" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="详细地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入详细地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮编" prop="postalCode">
              <el-input v-model="form.postalCode" placeholder="请输入邮编" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法人代表" prop="legalPerson">
              <el-input v-model="form.legalPerson" placeholder="请输入法人代表" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="许可证号码" prop="licenseNumber">
              <el-input v-model="form.licenseNumber" placeholder="请输入许可证号码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="许可证有效期" prop="licenseValidDate">
              <el-date-picker clearable
                v-model="form.licenseValidDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择许可证有效期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="许可证附件路径" prop="licenseAttachment">
              <el-input v-model="form.licenseAttachment" placeholder="请输入许可证附件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码" prop="usci">
              <el-input v-model="form.usci" placeholder="请输入统一社会信用代码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业执照附件路径" prop="businessLicenseAttachment">
              <el-input v-model="form.businessLicenseAttachment" placeholder="请输入营业执照附件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结算币种" prop="settlementCurrency">
              <el-select v-model="form.settlementCurrency" placeholder="请选择结算币种">
                <el-option
                  v-for="dict in wms_currency"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remarks">
              <el-input v-model="form.remarks" placeholder="请输入备注" />
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

<script setup lang="ts" name="Consgnor">
import type { WmsCargoOwners, ConsgnorQueryParams } from "@/types/api/master/consgnor"
import { listConsgnor, getConsgnor, delConsgnor, addConsgnor, updateConsgnor } from "@/api/master/consgnor"
import ConsgnorViewDrawer from "./view"

const { proxy } = getCurrentInstance()
const { wms_currency, wms_enable_status } = useDict('wms_currency', 'wms_enable_status')

const consgnorList = ref<WmsCargoOwners[]>([])
const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<string[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")
const daterangeCreateTime = ref<string[]>([])
const daterangeUpdateTime = ref<string[]>([])

const data = reactive({
  form: {} as WmsCargoOwners,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    createTime: undefined,
    ownerCode: undefined,
    ownerName: undefined,
    country: undefined,
    city: undefined,
    settlementCurrency: undefined,
    status: undefined,
  } as ConsgnorQueryParams,
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询货主列表 */
function getList() {
  loading.value = true
  queryParams.value.params = {}
  if (null != daterangeCreateTime.value && '' != daterangeCreateTime.value) {
    queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0]
    queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1]
  }
  if (null != daterangeUpdateTime.value && '' != daterangeUpdateTime.value) {
    queryParams.value.params["beginUpdateTime"] = daterangeUpdateTime.value[0]
    queryParams.value.params["endUpdateTime"] = daterangeUpdateTime.value[1]
  }
  listConsgnor(queryParams.value).then(response => {
    consgnorList.value = response.rows
    total.value = response.total
    loading.value = false
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
    sysOrgCode: null,
    ownerCode: null,
    ownerName: null,
    country: null,
    city: null,
    address: null,
    postalCode: null,
    email: null,
    phone: null,
    legalPerson: null,
    contactPerson: null,
    contactPhone: null,
    licenseNumber: null,
    licenseValidDate: null,
    licenseAttachment: null,
    usci: null,
    businessLicenseAttachment: null,
    settlementCurrency: null,
    remarks: null,
    status: null,
    tenantId: null
  }
  proxy.resetForm("consgnorRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeCreateTime.value = []
  daterangeUpdateTime.value = []
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: WmsCargoOwners[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加货主"
}

/** 修改按钮操作 */
function handleUpdate(row: WmsCargoOwners) {
  reset()
  const _id = row.id || ids.value[0]
  getConsgnor(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改货主"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["consgnorRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateConsgnor(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addConsgnor(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: WmsCargoOwners) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除货主编号为"' + _ids + '"的数据项？').then(function() {
    return delConsgnor(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 详情按钮操作 */
function handleViewData(row: WmsCargoOwners) {
  proxy.$refs["consgnorViewRef"].open(row.id)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('master/consgnor/export', {
    ...queryParams.value
  }, `consgnor_${new Date().getTime()}.xlsx`)
}

getList()
</script>

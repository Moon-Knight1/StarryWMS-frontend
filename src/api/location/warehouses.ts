import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, WarehousesQueryParams, WmsWarehouses } from '@/types'

// 查询仓库列表
export function listWarehouses(query: WarehousesQueryParams): Promise<TableDataInfo<WmsWarehouses[]>> {
  return request({
    url: '/location/warehouses/list',
    method: 'get',
    params: query
  })
}

// 查询仓库详细
export function getWarehouses(id: number): Promise<AjaxResult<WmsWarehouses>> {
  return request({
    url: '/location/warehouses/' + id,
    method: 'get'
  })
}

// 新增仓库
export function addWarehouses(data: WmsWarehouses): Promise<AjaxResult> {
  return request({
    url: '/location/warehouses',
    method: 'post',
    data: data
  })
}

// 修改仓库
export function updateWarehouses(data: WmsWarehouses): Promise<AjaxResult> {
  return request({
    url: '/location/warehouses',
    method: 'put',
    data: data
  })
}

// 删除仓库
export function delWarehouses(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/location/warehouses/' + id,
    method: 'delete'
  })
}



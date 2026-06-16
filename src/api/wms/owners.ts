import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, OwnersQueryParams, WmsCargoOwners } from '@/types'

// 查询货主列表
export function listOwners(query: OwnersQueryParams): Promise<TableDataInfo<WmsCargoOwners[]>> {
  return request({
    url: '/wms/owners/list',
    method: 'get',
    params: query
  })
}

// 查询货主详细
export function getOwners(id: number): Promise<AjaxResult<WmsCargoOwners>> {
  return request({
    url: '/wms/owners/' + id,
    method: 'get'
  })
}

// 新增货主
export function addOwners(data: WmsCargoOwners): Promise<AjaxResult> {
  return request({
    url: '/wms/owners',
    method: 'post',
    data: data
  })
}

// 修改货主
export function updateOwners(data: WmsCargoOwners): Promise<AjaxResult> {
  return request({
    url: '/wms/owners',
    method: 'put',
    data: data
  })
}

// 删除货主
export function delOwners(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wms/owners/' + id,
    method: 'delete'
  })
}



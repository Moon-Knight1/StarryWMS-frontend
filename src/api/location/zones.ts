import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, ZonesQueryParams, WmsStorageZones } from '@/types'

// 查询库区列表
export function listZones(query: ZonesQueryParams): Promise<TableDataInfo<WmsStorageZones[]>> {
  return request({
    url: '/location/zones/list',
    method: 'get',
    params: query
  })
}

// 查询库区详细
export function getZones(id: number): Promise<AjaxResult<WmsStorageZones>> {
  return request({
    url: '/location/zones/' + id,
    method: 'get'
  })
}

// 新增库区
export function addZones(data: WmsStorageZones): Promise<AjaxResult> {
  return request({
    url: '/location/zones',
    method: 'post',
    data: data
  })
}

// 修改库区
export function updateZones(data: WmsStorageZones): Promise<AjaxResult> {
  return request({
    url: '/location/zones',
    method: 'put',
    data: data
  })
}

// 删除库区
export function delZones(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/location/zones/' + id,
    method: 'delete'
  })
}



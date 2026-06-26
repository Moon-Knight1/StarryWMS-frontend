import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, Storage_locationQueryParams, WmsStorageLocations } from '@/types'

// 查询库位列表
export function listStorage_location(query: Storage_locationQueryParams): Promise<TableDataInfo<WmsStorageLocations[]>> {
  return request({
    url: '/location/storage_location/list',
    method: 'get',
    params: query
  })
}

// 查询库位详细
export function getStorage_location(id: number): Promise<AjaxResult<WmsStorageLocations>> {
  return request({
    url: '/location/storage_location/' + id,
    method: 'get'
  })
}

// 新增库位
export function addStorage_location(data: WmsStorageLocations): Promise<AjaxResult> {
  return request({
    url: '/location/storage_location',
    method: 'post',
    data: data
  })
}

// 修改库位
export function updateStorage_location(data: WmsStorageLocations): Promise<AjaxResult> {
  return request({
    url: '/location/storage_location',
    method: 'put',
    data: data
  })
}

// 删除库位
export function delStorage_location(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/location/storage_location/' + id,
    method: 'delete'
  })
}



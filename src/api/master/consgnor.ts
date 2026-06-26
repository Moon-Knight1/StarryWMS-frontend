import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, ConsgnorQueryParams, WmsCargoOwners } from '@/types'

// 查询货主列表
export function listConsgnor(query: ConsgnorQueryParams): Promise<TableDataInfo<WmsCargoOwners[]>> {
  return request({
    url: '/master/consgnor/list',
    method: 'get',
    params: query
  })
}

// 查询货主详细
export function getConsgnor(id: string): Promise<AjaxResult<WmsCargoOwners>> {
  return request({
    url: '/master/consgnor/' + id,
    method: 'get'
  })
}

// 新增货主
export function addConsgnor(data: WmsCargoOwners): Promise<AjaxResult> {
  return request({
    url: '/master/consgnor',
    method: 'post',
    data: data
  })
}

// 修改货主
export function updateConsgnor(data: WmsCargoOwners): Promise<AjaxResult> {
  return request({
    url: '/master/consgnor',
    method: 'put',
    data: data
  })
}

// 获取下一个货主编码
export function getNextOwnerCode(): Promise<AjaxResult<string>> {
  return request({
    url: '/master/consgnor/nextCode',
    method: 'get'
  })
}

// 删除货主
export function delConsgnor(id: string | string[]): Promise<AjaxResult> {
  return request({
    url: '/master/consgnor/' + id,
    method: 'delete'
  })
}



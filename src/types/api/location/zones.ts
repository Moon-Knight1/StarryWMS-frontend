import type { PageDomain, BaseEntity } from "../common";

/** 库区配置分页查询参数 */
export interface ZonesQueryParams extends PageDomain {
  /** 库区名称 */
  zoneName?: string;
  /** 库区类型 */
  zoneType?: string;
  /** 状态 */
  status?: string;
  /** 是否可售库存 */
  isSellable?: string;
  /** 所属仓库ID */
  warehouseId?: string;
  /** 所属仓库名称 */
  warehouseName?: string;
  /** 租户ID */
  tenantId?: number;
}

/** 库区配置信息 */
export interface WmsStorageZones extends BaseEntity {
  /** 主键ID */
  id?: string;
  /** 创建人 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新人 */
  updateBy?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 库区编码 */
  zoneCode?: string;
  /** 库区名称 */
  zoneName?: string;
  /** 库区类型 */
  zoneType?: string;
  /** 状态 */
  status?: string;
  /** 是否可售库存 */
  isSellable?: string;
  /** 所属仓库ID */
  warehouseId?: string;
  /** 所属仓库名称 */
  warehouseName?: string;
  /** 租户ID */
  tenantId?: number;
}

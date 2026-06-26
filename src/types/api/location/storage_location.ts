import type { PageDomain, BaseEntity } from "../common";

/** 库位配置分页查询参数 */
export interface Storage_locationQueryParams extends PageDomain {
  /** 库位编码 */
  locationCode?: string;
  /** 储位类别 */
  locationCategory?: string;
  /** 库位类型 */
  locationType?: string;
  /** 状态 */
  status?: string;
  /** 所属库区ID */
  zoneId?: string;
  /** 是否可售库位 */
  isSellable?: number;
  /** 所属仓库ID (关联 wms_warehouses.id) */
  warehouseId?: string;
}

/** 库位配置信息 */
export interface WmsStorageLocations extends BaseEntity {
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
  /** 所属部门编码 */
  sysOrgCode?: string;
  /** 库位编码 */
  locationCode?: string;
  /** 储位类别 */
  locationCategory?: string;
  /** 库位类型 */
  locationType?: string;
  /** 状态 */
  status?: string;
  /** 巷道编号 */
  locationAisle?: string;
  /** 排编号 */
  locationLine?: string;
  /** 列编号 */
  locationRank?: string;
  /** 层编号 */
  locationLayer?: string;
  /** 库位长度 (cm) */
  locationLength?: string;
  /** 库位宽度 (cm) */
  locationWidth?: string;
  /** 容积 (cm³) */
  locationCapacity?: string;
  /** 承重 (kg) */
  loadCapacity?: string;
  /** 是否可售库位 */
  isSellable?: number;
  /** 所属仓库ID (关联 wms_warehouses.id) */
  warehouseId?: string;
  /** 所属仓库名称 */
  warehouseName?: string;
  /** 所属库区ID */
  zoneId?: string;
  /** 所属库区名称 */
  zoneName?: string;
  /** 租户ID */
  tenantId?: number;
}

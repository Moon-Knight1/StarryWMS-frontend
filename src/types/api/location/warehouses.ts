import type { PageDomain, BaseEntity } from "../common";

/** 仓库配置分页查询参数 */
export interface WarehousesQueryParams extends PageDomain {
  /** 创建时间 */
  createTime?: string;
  /** 仓库编码 (唯一标识，如 WH001) */
  warehouseCode?: string;
  /** 仓库名称 */
  warehouseName?: string;
  /** 仓库属性 (如: 常温仓/冷藏仓/危险品仓) */
  warehouseAttr?: string;
  /** 状态 (0-创建 1-启用 2-禁用) */
  status?: string;
}

/** 仓库配置信息 */
export interface WmsWarehouses extends BaseEntity {
  /** 主键ID (UUID) */
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
  /** 仓库编码 (唯一标识，如 WH001) */
  warehouseCode?: string;
  /** 仓库名称 */
  warehouseName?: string;
  /** 仓库属性 (如: 常温仓/冷藏仓/危险品仓) */
  warehouseAttr?: string;
  /** 状态 (0-创建 1-启用 2-禁用) */
  status?: string;
  /** 租户ID (多租户隔离) */
  tenantId?: number;
}

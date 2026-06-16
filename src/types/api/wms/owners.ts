import type { PageDomain, BaseEntity } from "../common";

/** 货主配置分页查询参数 */
export interface OwnersQueryParams extends PageDomain {
  /** 货主名称 (公司全称) */
  ownerName?: string;
  /** 联系人 */
  contactPerson?: string;
  /** 结算币种 */
  settlementCurrency?: string;
  /** 状态 */
  status?: string;
}

/** 货主配置信息 */
export interface WmsCargoOwners extends BaseEntity {
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
  /** 货主编码 (唯一标识，如 C00001) */
  ownerCode?: string;
  /** 货主名称 (公司全称) */
  ownerName?: string;
  /** 国家 */
  country?: string;
  /** 城市 */
  city?: string;
  /** 详细地址 */
  address?: string;
  /** 邮编 */
  postalCode?: string;
  /** 邮箱 */
  email?: string;
  /** 电话 */
  phone?: string;
  /** 法人代表 */
  legalPerson?: string;
  /** 联系人 */
  contactPerson?: string;
  /** 联系人电话 */
  contactPhone?: string;
  /** 许可证号码 */
  licenseNumber?: string;
  /** 许可证有效期 */
  licenseValidDate?: string;
  /** 许可证附件路径 */
  licenseAttachment?: string;
  /** 统一社会信用代码 */
  usci?: string;
  /** 营业执照附件路径 */
  businessLicenseAttachment?: string;
  /** 结算币种 */
  settlementCurrency?: string;
  /** 备注 */
  remarks?: string;
  /** 状态 */
  status?: string;
  /** 租户ID */
  tenantId?: number;
}

export type AdminCustomerStatusFilter = "Active" | "Locked";

export interface AdminCustomerSummaryDto {
  id: string;
  email: string;
  displayName: string | null;
  phoneNumber: string | null;
  roles: string[];
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminCustomerDetailDto extends AdminCustomerSummaryDto {
  addressesCount: number;
}

export interface AdminCustomerListParams {
  keyword?: string;
  role?: string;
  status?: AdminCustomerStatusFilter;
  page?: number;
  pageSize?: number;
}

export interface LockCustomerResultDto {
  id: string;
  isActive: boolean;
}

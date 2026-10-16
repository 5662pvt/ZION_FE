export type AuditAction =
  | "Order.Cancel"
  | "Order.Ship"
  | "Order.Complete"
  | "Inventory.Adjust"
  | "Product.Create"
  | "Product.Update"
  | "Product.Archive"
  | "Product.Publish"
  | "Product.ImageAdd"
  | "Product.ImageRemove"
  | "Product.ImageReorder"
  | "Category.Create"
  | "Category.Update"
  | "Category.Delete"
  | "Promotion.Create"
  | "Promotion.Update"
  | "Promotion.Activate"
  | "Promotion.Deactivate"
  | "Coupon.Create"
  | "Coupon.Generate"
  | "Coupon.Deactivate"
  | "Review.Hide"
  | "Review.Show"
  | "Customer.Lock"
  | "Customer.Unlock"
  | "System.OutboxRetry"
  | "System.OutboxRetryFailed"
  | "System.DlqRequeue"
  | "System.DlqDelete";

export interface AuditLogDto {
  id: string;
  occurredAt: string;
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  httpMethod: string;
  path: string;
  statusCode: number;
  ipAddress: string;
  correlationId: string;
  traceId: string;
}

export interface AuditLogListParams {
  actor?: string;
  action?: AuditAction;
  resourceType?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export type NotificationType = "OrderConfirmed" | "OrderShipped" | "OrderCancelled";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  subject: string;
  orderId: string | null;
  status: string;
  createdAt: string;
  sentAt: string | null;
}

export interface MyNotificationsParams {
  page?: number;
  pageSize?: number;
}

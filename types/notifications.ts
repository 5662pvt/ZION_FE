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

export type UserNotificationType =
  | "OrderPlaced"
  | "OrderConfirmed"
  | "OrderShipped"
  | "OrderCancelled"
  | "PaymentCompleted"
  | "PaymentFailed";

export interface UserNotificationDto {
  id: string;
  type: UserNotificationType;
  title: string;
  message: string;
  orderId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationFeedParams {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}

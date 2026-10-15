import type { OrderHistoryEntry } from "@/types/adminOrders";

export type OrderStatus =
  | "PendingStock"
  | "AwaitingPayment"
  | "Confirmed"
  | "Paid"
  | "Shipped"
  | "Completed"
  | "Cancelled";

export type PaymentMethod = "COD" | "Online";

export type DiscountTarget = "Items" | "Shipping" | null;

export interface ShippingAddressDto {
  addressId: string;
  recipientName: string;
  phoneNumber: string;
  province: string;
  ward: string;
  streetAddress: string;
}

export interface OrderLineDto {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  isGift: boolean;
}

export interface OrderDto {
  id: string;
  code: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  createdAt: string;
  note: string | null;
  cancelReason: string | null;
  couponCode: string | null;
  discountAmount: number;
  discountTarget: DiscountTarget;
  shippingAddress: ShippingAddressDto;
  lines: OrderLineDto[];
  history: OrderHistoryEntry[];
}

export interface OrderSummaryDto {
  id: string;
  code: string;
  status: OrderStatus;
  total: number;
  currency: string;
  createdAt: string;
  itemCount: number;
}

export interface PlaceOrderRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
  note?: string;
  couponCode?: string;
}

export interface CancelOrderRequest {
  reason?: string;
}

export interface MyOrdersParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  from?: string;
  to?: string;
}

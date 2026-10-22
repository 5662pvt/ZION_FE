import type { OrderHistoryEntry } from "@/types/adminOrders";
import type { ReturnRequestDto } from "@/types/returns";

export type OrderStatus =
  | "PendingStock"
  | "AwaitingPayment"
  | "Confirmed"
  | "Paid"
  | "Shipped"
  | "Completed"
  | "Cancelled"
  | "Returned";

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
  variantId: string;
  variantLabel: string | null;
  sku: string | null;
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
  pointsUsed: number;
  pointsDiscount: number;
  shippingAddress: ShippingAddressDto;
  lines: OrderLineDto[];
  history: OrderHistoryEntry[];
  returnRequest: ReturnRequestDto | null;
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
  usePoints?: boolean;
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

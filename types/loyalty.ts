export type LoyaltyTransactionType = "Earn" | "Spend" | "Release" | "Refund" | "Revoke" | "Expire" | "AdminAdjust";

export type LoyaltyLotSource = "Order" | "Review" | "AdminAdjust" | "Restore";

export interface LoyaltySummaryDto {
  balance: number;
  expiringSoonPoints: number;
  expiringSoonDate: string | null;
  maxRedeemPercent: number;
  earnRatePercent: number;
  reviewBonus: number;
}

export interface LoyaltyTransactionDto {
  id: string;
  type: LoyaltyTransactionType;
  points: number;
  balanceAfter: number;
  orderId: string | null;
  description: string;
  createdAt: string;
}

export interface LoyaltyLotDto {
  id: string;
  source: LoyaltyLotSource;
  original: number;
  remaining: number;
  earnedAt: string;
  expiresAt: string;
}

export interface CustomerLoyaltyDto {
  summary: LoyaltySummaryDto;
  recentTransactions: LoyaltyTransactionDto[];
  activeLots: LoyaltyLotDto[];
}

export interface LoyaltyTransactionsParams {
  page?: number;
  pageSize?: number;
  type?: LoyaltyTransactionType;
}

export interface AdjustLoyaltyPointsRequest {
  delta: number;
  reason: string;
}

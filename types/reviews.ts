export interface ReviewDto {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  content: string;
  authorName: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  replyContent: string | null;
  repliedAt: string | null;
}

export type ReviewStatus = "Published" | "Hidden";

export interface AdminReviewDto extends ReviewDto {
  productName: string;
  status: ReviewStatus;
  hiddenReason: string | null;
}

export interface ReplyToReviewRequest {
  content: string;
}

export interface ReviewDistribution {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
}

export interface ReviewSummaryDto {
  productId: string;
  average: number;
  count: number;
  distribution: ReviewDistribution;
}

export interface ReviewBatchSummaryDto {
  productId: string;
  average: number;
  count: number;
}

export interface ReviewEligibilityDto {
  canReview: boolean;
  reason: string | null;
  myReview: ReviewDto | null;
}

export interface ReviewListParams {
  page?: number;
  pageSize?: number;
  rating?: number;
}

export interface CreateReviewRequest {
  rating: number;
  title?: string | null;
  content: string;
}

export type UpdateReviewRequest = CreateReviewRequest;

export interface AdminReviewListParams {
  page?: number;
  pageSize?: number;
  status?: ReviewStatus;
  rating?: number;
  keyword?: string;
}

export interface HideReviewRequest {
  reason?: string;
}

export interface MyReviewDto {
  id: string;
  productId: string;
  productName: string;
  productSlug: string | null;
  rating: number;
  title: string | null;
  content: string;
  status: ReviewStatus;
  hiddenReason: string | null;
  createdAt: string;
  replyContent: string | null;
  repliedAt: string | null;
}

export interface MyReviewsParams {
  page?: number;
  pageSize?: number;
}

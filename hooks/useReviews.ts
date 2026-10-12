import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsService } from "@/services/reviews.service";
import { queryKeys } from "@/constants/queryKeys";
import type { CreateReviewRequest, ReviewBatchSummaryDto, ReviewListParams, UpdateReviewRequest } from "@/types/reviews";

export function useProductReviews(productId: string, params: ReviewListParams) {
  return useQuery({
    queryKey: queryKeys.reviews.list(productId, params),
    queryFn: () => reviewsService.list(productId, params),
    enabled: !!productId,
    placeholderData: (previousData) => previousData,
  });
}

export function useReviewSummary(productId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.summary(productId),
    queryFn: () => reviewsService.getSummary(productId),
    enabled: !!productId,
  });
}

export function useReviewSummaries(productIds: string[]) {
  const sortedIds = [...productIds].sort();
  return useQuery({
    queryKey: queryKeys.reviews.summaries(sortedIds),
    queryFn: async () => {
      const items = await reviewsService.getSummaries(sortedIds);
      return items.reduce<Record<string, ReviewBatchSummaryDto>>((acc, item) => {
        acc[item.productId] = item;
        return acc;
      }, {});
    },
    enabled: sortedIds.length > 0,
    staleTime: 15_000,
  });
}

export function useReviewEligibility(productId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.reviews.eligibility(productId),
    queryFn: () => reviewsService.getEligibility(productId),
    enabled: !!productId && enabled,
  });
}

function useInvalidateReviews(productId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["reviews", "list", productId] });
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.summary(productId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.eligibility(productId) });
    queryClient.invalidateQueries({ queryKey: ["reviews", "summaries"] });
  };
}

export function useCreateReview(productId: string) {
  const invalidate = useInvalidateReviews(productId);
  return useMutation({
    mutationFn: (body: CreateReviewRequest) => reviewsService.create(productId, body),
    onSuccess: invalidate,
  });
}

export function useUpdateReview(productId: string) {
  const invalidate = useInvalidateReviews(productId);
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateReviewRequest }) => reviewsService.update(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteReview(productId: string) {
  const invalidate = useInvalidateReviews(productId);
  return useMutation({
    mutationFn: (id: string) => reviewsService.delete(id),
    onSuccess: invalidate,
  });
}

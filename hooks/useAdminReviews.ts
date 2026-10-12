import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminReviewsService } from "@/services/reviews.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AdminReviewListParams, HideReviewRequest } from "@/types/reviews";

export function useAdminReviews(params: AdminReviewListParams) {
  return useQuery({
    queryKey: queryKeys.reviews.adminList(params),
    queryFn: () => adminReviewsService.list(params),
    placeholderData: (previousData) => previousData,
  });
}

function useInvalidateAdminReviews() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["reviews", "admin", "list"] });
}

export function useHideReview() {
  const invalidate = useInvalidateAdminReviews();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: HideReviewRequest }) => adminReviewsService.hide(id, body),
    onSuccess: invalidate,
  });
}

export function useShowReview() {
  const invalidate = useInvalidateAdminReviews();
  return useMutation({
    mutationFn: (id: string) => adminReviewsService.show(id),
    onSuccess: invalidate,
  });
}

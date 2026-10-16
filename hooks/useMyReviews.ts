"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewsService } from "@/services/reviews.service";
import { queryKeys } from "@/constants/queryKeys";
import type { MyReviewsParams } from "@/types/reviews";

export function useMyReviews(params: MyReviewsParams = {}) {
  return useQuery({
    queryKey: queryKeys.reviews.mine(params),
    queryFn: () => reviewsService.getMine(params),
    placeholderData: (previousData) => previousData,
  });
}

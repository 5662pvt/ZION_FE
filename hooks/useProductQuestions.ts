import { useQuery } from "@tanstack/react-query";
import { questionsService } from "@/services/questions.service";
import { queryKeys } from "@/constants/queryKeys";
import type { ProductQuestionListParams } from "@/types/questions";

export function useProductQuestions(productId: string, params: ProductQuestionListParams) {
  return useQuery({
    queryKey: queryKeys.productQuestions.list(productId, params),
    queryFn: () => questionsService.list(productId, params),
    enabled: !!productId,
    placeholderData: (previousData) => previousData,
  });
}

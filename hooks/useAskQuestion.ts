import { useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsService } from "@/services/questions.service";
import type { AskQuestionRequest } from "@/types/questions";

export function useAskQuestion(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AskQuestionRequest) => questionsService.ask(productId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["productQuestions", "list", productId] }),
  });
}

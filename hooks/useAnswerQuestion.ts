import { useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsService } from "@/services/questions.service";
import type { AnswerQuestionRequest } from "@/types/questions";

export function useAnswerQuestion(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AnswerQuestionRequest }) => questionsService.answer(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["productQuestions", "list", productId] }),
  });
}

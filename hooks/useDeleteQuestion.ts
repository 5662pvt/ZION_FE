import { useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsService } from "@/services/questions.service";

export function useDeleteQuestion(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["productQuestions", "list", productId] }),
  });
}

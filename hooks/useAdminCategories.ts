import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories.service";
import { queryKeys } from "@/constants/queryKeys";
import type { UpdateCategoryRequest, CreateCategoryRequest } from "@/types/categories";

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCategoryRequest) => categoriesService.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.tree }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryRequest }) => categoriesService.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.tree }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.tree }),
  });
}

import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories.service";
import { queryKeys } from "@/constants/queryKeys";

export function useCategoryTree() {
  return useQuery({
    queryKey: queryKeys.categories.tree,
    queryFn: categoriesService.getTree,
  });
}

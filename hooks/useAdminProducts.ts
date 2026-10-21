import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AdminProductListParams, CreateProductRequest, SetVariantsRequest, UpdateProductRequest } from "@/types/products";

export function useAdminProducts(params: AdminProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.adminList(params),
    queryFn: () => productsService.adminList(params),
  });
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.adminDetail(id),
    queryFn: () => productsService.adminGetById(id),
    enabled: !!id,
  });
}

function useInvalidateAdminProducts() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["products", "admin", "list"] });
    if (id) queryClient.invalidateQueries({ queryKey: queryKeys.products.adminDetail(id) });
  };
}

export function useCreateProduct() {
  const invalidate = useInvalidateAdminProducts();
  return useMutation({
    mutationFn: (body: CreateProductRequest) => productsService.create(body),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateAdminProducts();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductRequest }) => productsService.update(id, body),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function useSetVariants() {
  const invalidate = useInvalidateAdminProducts();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SetVariantsRequest }) => productsService.setVariants(id, body),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function usePublishProduct() {
  const invalidate = useInvalidateAdminProducts();
  return useMutation({
    mutationFn: (id: string) => productsService.publish(id),
    onSuccess: (_data, id) => invalidate(id),
  });
}

export function useArchiveProduct() {
  const invalidate = useInvalidateAdminProducts();
  return useMutation({
    mutationFn: (id: string) => productsService.archive(id),
    onSuccess: (_data, id) => invalidate(id),
  });
}

export function useUploadProductImage() {
  const invalidate = useInvalidateAdminProducts();
  return useMutation({
    mutationFn: ({ id, file, alt }: { id: string; file: File; alt?: string }) =>
      productsService.uploadImage(id, file, alt),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function useDeleteProductImage() {
  const invalidate = useInvalidateAdminProducts();
  return useMutation({
    mutationFn: ({ id, imageId }: { id: string; imageId: string }) => productsService.deleteImage(id, imageId),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function useReorderProductImages() {
  const invalidate = useInvalidateAdminProducts();
  return useMutation({
    mutationFn: ({ id, imageIds }: { id: string; imageIds: string[] }) => productsService.reorderImages(id, imageIds),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

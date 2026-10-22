import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { returnsService } from "@/services/returns.service";
import { queryKeys } from "@/constants/queryKeys";
import type {
  AdminRefundListParams,
  AdminReturnListParams,
  AdminReturnRequestDto,
  MarkShippedBackBody,
  RejectReturnBody,
  RequestReturnBody,
} from "@/types/returns";

function useInvalidateReturns() {
  const queryClient = useQueryClient();
  return (orderId?: string, returnId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["returns", "admin", "list"] });
    if (orderId) queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
    if (returnId) queryClient.invalidateQueries({ queryKey: queryKeys.returns.adminDetail(returnId) });
    // Xu được BE hoàn lại bất đồng bộ khi xử lý return/refund - invalidate là đủ, không cần polling.
    queryClient.invalidateQueries({ queryKey: queryKeys.loyalty.me });
  };
}

export function useRequestReturn() {
  const invalidate = useInvalidateReturns();
  return useMutation({
    mutationFn: ({ orderId, body }: { orderId: string; body: RequestReturnBody }) =>
      returnsService.requestReturn(orderId, body),
    onSuccess: (_data, variables) => invalidate(variables.orderId),
  });
}

export function useMarkShippedBack() {
  const invalidate = useInvalidateReturns();
  return useMutation({
    mutationFn: ({ returnId, body }: { orderId: string; returnId: string; body?: MarkShippedBackBody }) =>
      returnsService.markShippedBack(returnId, body),
    onSuccess: (_data, variables) => invalidate(variables.orderId, variables.returnId),
  });
}

export function useAdminReturns(params: AdminReturnListParams) {
  return useQuery({
    queryKey: queryKeys.returns.adminList(params),
    queryFn: () => returnsService.adminSearch(params),
  });
}

export function useAdminReturn(id: string) {
  return useQuery({
    queryKey: queryKeys.returns.adminDetail(id),
    queryFn: () => returnsService.adminGetById(id),
    enabled: !!id,
    refetchInterval: (query) => (query.state.data?.status === "Received" ? 3000 : false),
  });
}

export function useApproveReturn() {
  const invalidate = useInvalidateReturns();
  return useMutation({
    mutationFn: (id: string) => returnsService.approve(id),
    onSuccess: (returnRequest: AdminReturnRequestDto) => invalidate(returnRequest.orderId, returnRequest.id),
  });
}

export function useRejectReturn() {
  const invalidate = useInvalidateReturns();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RejectReturnBody }) => returnsService.reject(id, body),
    onSuccess: (returnRequest: AdminReturnRequestDto) => invalidate(returnRequest.orderId, returnRequest.id),
  });
}

export function useMarkReturnReceived() {
  const invalidate = useInvalidateReturns();
  return useMutation({
    mutationFn: (id: string) => returnsService.markReceived(id),
    onSuccess: (returnRequest: AdminReturnRequestDto) => invalidate(returnRequest.orderId, returnRequest.id),
  });
}

export function useAdminRefunds(params: AdminRefundListParams) {
  return useQuery({
    queryKey: queryKeys.refunds.adminList(params),
    queryFn: () => returnsService.adminListRefunds(params),
  });
}

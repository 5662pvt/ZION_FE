import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { systemService } from "@/services/system.service";
import { queryKeys } from "@/constants/queryKeys";
import type { InboxListParams, OutboxListParams } from "@/types/system";

export function useSystemModules() {
  return useQuery({
    queryKey: queryKeys.system.modules,
    queryFn: systemService.getModules,
  });
}

export function useSystemHealth(autoRefresh: boolean) {
  return useQuery({
    queryKey: queryKeys.system.health,
    queryFn: systemService.getHealth,
    refetchInterval: autoRefresh ? 15000 : false,
  });
}

export function useOutboxList(params: OutboxListParams) {
  return useQuery({
    queryKey: queryKeys.system.outboxList(params),
    queryFn: () => systemService.getOutbox(params),
  });
}

export function useOutboxDetail(module: string, id: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.system.outboxDetail(module, id),
    queryFn: () => systemService.getOutboxDetail(module, id),
    enabled,
  });
}

function useInvalidateOutbox() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["system", "outbox"] });
}

export function useRetryOutbox() {
  const invalidate = useInvalidateOutbox();
  return useMutation({
    mutationFn: ({ module, id }: { module: string; id: string }) => systemService.retryOutbox(module, id),
    onSuccess: invalidate,
  });
}

export function useRetryAllFailed() {
  const invalidate = useInvalidateOutbox();
  return useMutation({
    mutationFn: (module?: string) => systemService.retryAllFailed(module),
    onSuccess: invalidate,
  });
}

export function useInboxList(params: InboxListParams) {
  return useQuery({
    queryKey: queryKeys.system.inboxList(params),
    queryFn: () => systemService.getInbox(params),
  });
}

export function useDlqPeek(limit: number, autoRefresh: boolean) {
  return useQuery({
    queryKey: queryKeys.system.dlq(limit),
    queryFn: () => systemService.getDlq(limit),
    refetchInterval: autoRefresh ? 15000 : false,
  });
}

function useInvalidateDlq() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["system", "dlq"] });
}

export function useRequeueDlq() {
  const invalidate = useInvalidateDlq();
  return useMutation({
    mutationFn: (messageIds?: string[]) => systemService.requeueDlq(messageIds),
    onSuccess: invalidate,
  });
}

export function useDeleteDlq() {
  const invalidate = useInvalidateDlq();
  return useMutation({
    mutationFn: (messageId: string) => systemService.deleteDlq(messageId),
    onSuccess: invalidate,
  });
}

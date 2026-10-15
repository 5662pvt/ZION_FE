"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentsService } from "@/services/payments.service";
import { queryKeys } from "@/constants/queryKeys";
import type { PaymentChannel, SimulatePaymentRequest } from "@/types/payments";

function idempotencyKeyStorageKey(orderId: string): string {
  return `zion.payKey.${orderId}`;
}

function getOrCreateIdempotencyKey(orderId: string): string {
  const storageKey = idempotencyKeyStorageKey(orderId);
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const key = crypto.randomUUID();
  sessionStorage.setItem(storageKey, key);
  return key;
}

function clearIdempotencyKey(orderId: string): void {
  sessionStorage.removeItem(idempotencyKeyStorageKey(orderId));
}

export function usePaymentIntent(intentId: string) {
  return useQuery({
    queryKey: queryKeys.payments.intent(intentId),
    queryFn: () => paymentsService.getIntent(intentId),
    enabled: !!intentId,
  });
}

export function useCreatePaymentIntent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, channel }: { orderId: string; channel?: PaymentChannel }) =>
      paymentsService.createIntent(orderId, getOrCreateIdempotencyKey(orderId), channel),
    onSuccess: (intent) => {
      queryClient.setQueryData(queryKeys.payments.intent(intent.intentId), intent);
      if (intent.status === "Succeeded" || intent.status === "Failed") {
        clearIdempotencyKey(intent.orderId);
      }
    },
  });
}

export function useSimulatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ intentId, result }: { intentId: string; result: SimulatePaymentRequest["result"] }) =>
      paymentsService.simulate(intentId, result),
    onSuccess: (intent) => {
      queryClient.setQueryData(queryKeys.payments.intent(intent.intentId), intent);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(intent.orderId) });
      if (intent.status === "Succeeded" || intent.status === "Failed") {
        clearIdempotencyKey(intent.orderId);
      }
    },
  });
}

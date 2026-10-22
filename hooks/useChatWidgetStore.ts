"use client";

import { useSyncExternalStore } from "react";
import type { PendingChatCard } from "@/types/chat";

interface ChatWidgetState {
  isOpen: boolean;
  pendingCard: PendingChatCard | null;
}

let state: ChatWidgetState = { isOpen: false, pendingCard: null };
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ChatWidgetState {
  return state;
}

/** Opens the customer chat widget from anywhere (product/order pages), optionally pre-filling a card to send. */
export function openChatWidget(pendingCard?: PendingChatCard): void {
  state = { isOpen: true, pendingCard: pendingCard ?? state.pendingCard };
  emit();
}

export function closeChatWidget(): void {
  state = { ...state, isOpen: false };
  emit();
}

export function clearPendingChatCard(): void {
  if (!state.pendingCard) return;
  state = { ...state, pendingCard: null };
  emit();
}

export function useChatWidgetState(): ChatWidgetState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

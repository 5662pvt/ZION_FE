export type OutboxStatus = "Pending" | "Failed" | "Processed";

export interface SystemModulesDto {
  outbox: string[];
  inbox: string[];
}

export interface OutboxMessageSummaryDto {
  id: string;
  module: string;
  eventType: string;
  occurredOn: string;
  processedOn: string | null;
  attempts: number;
  status: OutboxStatus;
  lastError: string | null;
}

export interface OutboxMessageDetailDto extends OutboxMessageSummaryDto {
  traceParent: string | null;
  payload: string;
}

export interface OutboxListParams {
  module?: string;
  status?: OutboxStatus;
  page?: number;
  pageSize?: number;
}

export interface RetryOutboxResultDto {
  id: string;
  status: OutboxStatus;
}

export interface RetryFailedResultDto {
  retried: number;
}

export interface InboxMessageDto {
  messageId: string;
  module: string;
  consumer: string;
  eventType: string;
  processedOn: string;
}

export interface InboxListParams {
  module?: string;
  page?: number;
  pageSize?: number;
}

export interface DlqMessageDto {
  messageId: string;
  eventType: string;
  reason: string;
  deathCount: number;
  firstDeathAt: string;
  lastError: string | null;
  payload: string;
}

export interface DlqPeekDto {
  queue: string;
  messageCount: number;
  messages: DlqMessageDto[];
}

export interface RequeueDlqResultDto {
  requeued: number;
}

export interface DeleteDlqResultDto {
  deleted: number;
}

export type HealthStatus = "Healthy" | "Degraded" | "Unhealthy";

export interface HealthCheckEntryDto {
  name: string;
  status: HealthStatus;
  durationMs: number;
  description: string | null;
}

export interface HealthReportDto {
  status: HealthStatus;
  totalDurationMs: number;
  checkedAt: string;
  checks: HealthCheckEntryDto[];
}

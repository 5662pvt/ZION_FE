import { apiDelete, apiGet, apiPost } from "./apiClient";
import type { Paged } from "@/types/api";
import type {
  DeleteDlqResultDto,
  DlqPeekDto,
  HealthReportDto,
  InboxListParams,
  InboxMessageDto,
  OutboxListParams,
  OutboxMessageDetailDto,
  OutboxMessageSummaryDto,
  RequeueDlqResultDto,
  RetryFailedResultDto,
  RetryOutboxResultDto,
  SystemModulesDto,
} from "@/types/system";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const systemService = {
  getModules: () => apiGet<SystemModulesDto>("/api/v1/admin/system/modules").then((r) => r.data),

  getHealth: () => apiGet<HealthReportDto>("/api/v1/admin/system/health").then((r) => r.data),

  getOutbox: async (params: OutboxListParams = {}): Promise<Paged<OutboxMessageSummaryDto>> => {
    const query = buildQuery({ module: params.module, status: params.status, page: params.page, pageSize: params.pageSize });
    const { data, pagination } = await apiGet<OutboxMessageSummaryDto[]>(`/api/v1/admin/system/outbox${query}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getOutboxDetail: (module: string, id: string) =>
    apiGet<OutboxMessageDetailDto>(`/api/v1/admin/system/outbox/${module}/${id}`).then((r) => r.data),

  retryOutbox: (module: string, id: string) =>
    apiPost<RetryOutboxResultDto>(`/api/v1/admin/system/outbox/${module}/${id}/retry`).then((r) => r.data),

  retryAllFailed: (module?: string) =>
    apiPost<RetryFailedResultDto>(`/api/v1/admin/system/outbox/retry-failed${buildQuery({ module })}`).then((r) => r.data),

  getInbox: async (params: InboxListParams = {}): Promise<Paged<InboxMessageDto>> => {
    const query = buildQuery({ module: params.module, page: params.page, pageSize: params.pageSize });
    const { data, pagination } = await apiGet<InboxMessageDto[]>(`/api/v1/admin/system/inbox${query}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  getDlq: (limit = 20) => apiGet<DlqPeekDto>(`/api/v1/admin/system/dlq${buildQuery({ limit })}`).then((r) => r.data),

  requeueDlq: (messageIds?: string[]) =>
    apiPost<RequeueDlqResultDto>("/api/v1/admin/system/dlq/requeue", { messageIds }).then((r) => r.data),

  deleteDlq: (messageId: string) =>
    apiDelete<DeleteDlqResultDto>(`/api/v1/admin/system/dlq/${messageId}`).then((r) => r.data),
};

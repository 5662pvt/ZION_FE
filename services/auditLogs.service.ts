import { apiGet } from "./apiClient";
import type { Paged } from "@/types/api";
import type { AuditLogDto, AuditLogListParams } from "@/types/auditLogs";

function buildQuery(params: AuditLogListParams): string {
  const search = new URLSearchParams();
  if (params.actor) search.set("actor", params.actor);
  if (params.action) search.set("action", params.action);
  if (params.resourceType) search.set("resourceType", params.resourceType);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const auditLogsService = {
  search: async (params: AuditLogListParams = {}): Promise<Paged<AuditLogDto>> => {
    const { data, pagination } = await apiGet<AuditLogDto[]>(`/api/v1/admin/audit-logs${buildQuery(params)}`);
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },
};

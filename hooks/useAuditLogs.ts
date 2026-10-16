import { useQuery } from "@tanstack/react-query";
import { auditLogsService } from "@/services/auditLogs.service";
import { queryKeys } from "@/constants/queryKeys";
import type { AuditLogListParams } from "@/types/auditLogs";

export function useAuditLogs(params: AuditLogListParams) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(params),
    queryFn: () => auditLogsService.search(params),
    placeholderData: (previousData) => previousData,
  });
}

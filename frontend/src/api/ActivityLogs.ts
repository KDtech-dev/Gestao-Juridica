import { PaginatedResponseType } from "@/@core/types";
import { getAxios } from "@/configs/axios";

export type ActivityLogType = {
  id: number;
  actor_id: string | null;
  actor_name: string;
  module: string;
  event: string;
  subject_type: string | null;
  subject_id: string | null;
  subject_label: string | null;
  changed_fields: string[];
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type ActivityLogFilters = {
  page?: number;
  per_page?: number;
  date?: string;
  module?: string;
  event?: string;
  actor?: string;
  search?: string;
};

export async function getActivityLogs(
  filters: ActivityLogFilters,
): Promise<PaginatedResponseType<ActivityLogType>> {
  const response = await getAxios().get("/activity-logs", { params: filters });
  return response.data;
}

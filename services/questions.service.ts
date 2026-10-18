import { apiDelete, apiGet, apiPost } from "./apiClient";
import type { Paged } from "@/types/api";
import type {
  AnswerQuestionRequest,
  AskQuestionRequest,
  ProductQuestionDto,
  ProductQuestionListParams,
} from "@/types/questions";

function buildQuery(params: ProductQuestionListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const questionsService = {
  list: async (productId: string, params: ProductQuestionListParams = {}): Promise<Paged<ProductQuestionDto>> => {
    const { data, pagination } = await apiGet<ProductQuestionDto[]>(
      `/api/v1/products/${productId}/questions${buildQuery(params)}`,
    );
    return { items: data, pagination: pagination as NonNullable<typeof pagination> };
  },

  ask: (productId: string, body: AskQuestionRequest) =>
    apiPost<ProductQuestionDto>(`/api/v1/products/${productId}/questions`, body).then((r) => r.data),

  answer: (id: string, body: AnswerQuestionRequest) =>
    apiPost<ProductQuestionDto>(`/api/v1/admin/questions/${id}/answer`, body).then((r) => r.data),

  delete: (id: string) => apiDelete<null>(`/api/v1/questions/${id}`).then(() => undefined),
};

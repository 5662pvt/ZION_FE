export interface ProductQuestionDto {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
  answerContent: string | null;
  answeredAt: string | null;
}

export interface ProductQuestionListParams {
  page?: number;
  pageSize?: number;
}

export interface AskQuestionRequest {
  content: string;
}

export interface AnswerQuestionRequest {
  content: string;
}

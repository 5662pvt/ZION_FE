export interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiFieldError {
  field: string | null;
  code: string;
  message: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiFieldError[];
  pagination: Pagination | null;
}

export interface Paged<T> {
  items: T[];
  pagination: Pagination;
}

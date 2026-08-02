export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface DataResponse<T> {
  data: T;
}

export interface PaginationQuery {
  currentPage?: number;
  pageSize?: number;
  search?: string;
  /** When true, hooks/clients should walk all pages and return the full set. */
  fetchAll?: boolean;
}

export interface SoftDeleteResponse {
  id: string;
  active: false;
}

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
  fetchAll?: boolean;
}

export interface CatalogPaginationQuery extends PaginationQuery {
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

export interface SoftDeleteResponse {
  id: string;
  active: false;
}

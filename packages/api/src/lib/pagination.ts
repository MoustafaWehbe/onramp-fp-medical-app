export interface PaginationInput {
  currentPage: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export function getPaginationParams(input: PaginationInput) {
  const { currentPage, pageSize } = input;

  return {
    currentPage,
    pageSize,
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  totalCount: number,
  currentPage: number,
  pageSize: number,
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      currentPage,
      pageSize,
      totalCount,
      totalPages: pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0,
    },
  };
}

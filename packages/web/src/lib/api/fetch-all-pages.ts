import type { PaginatedResponse } from "./types";

const DEFAULT_PAGE_SIZE = 100;

/**
 * Fetches every page of a paginated endpoint and returns one combined
 * PaginatedResponse (same shape consumers already expect).
 */
export async function fetchAllPages<T>(
  fetchPage: (
    currentPage: number,
    pageSize: number,
  ) => Promise<PaginatedResponse<T>>,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<T>> {
  const size = Math.min(Math.max(1, pageSize), DEFAULT_PAGE_SIZE);
  const first = await fetchPage(1, size);
  const totalPages = first.pagination.totalPages;
  const data = [...first.data];

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchPage(page, size);
    data.push(...next.data);
  }

  return {
    data,
    pagination: {
      currentPage: 1,
      pageSize: size,
      totalCount: first.pagination.totalCount,
      totalPages: first.pagination.totalCount === 0 ? 0 : 1,
    },
  };
}

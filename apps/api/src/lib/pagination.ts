export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePaginationParams(params: {
  cursor?: string;
  limit?: string;
}): PaginationParams {
  return {
    cursor: params.cursor || undefined,
    limit: Math.min(
      Math.max(parseInt(params.limit || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    ),
  };
}

export function buildPaginationResult<T extends { id: string }>(
  items: T[],
  limit: number
): PaginationResult<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const cursor = data.length > 0 ? data[data.length - 1].id : null;

  return { data, cursor, hasMore };
}

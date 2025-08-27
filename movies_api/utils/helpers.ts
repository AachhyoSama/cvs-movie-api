export const DEFAULT_PAGE_LIMIT = 50;

export const buildResponse = (
  data: any,
  message = '',
  page?: number,
  total?: number
) => {
  const response: any = {
    success: true,
    message,
    data,
  };
  if (page !== undefined && total !== undefined) {
    response.pagination = {
      page,
      limit: DEFAULT_PAGE_LIMIT,
      total,
    };
  }
  return response;
};

export const parseJSON = <T>(value: string): T => {
  try {
    return JSON.parse(value);
  } catch {
    return [] as unknown as T;
  }
};

export const formatBudget = (budget: number): string => {
  // Show as $0 if null or 0
  return `$${budget ? budget.toLocaleString() : 0}`;
};

export const paginate = (page: number, limit: number = 50) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

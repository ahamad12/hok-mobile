export const moneyKeys = {
  shop: (shopId: string) => ['money', shopId] as const,
  tillEntries: (shopId: string, from?: string, to?: string) =>
    [...moneyKeys.shop(shopId), 'till', 'entries', from, to] as const,
  tillSummary: (shopId: string, date: string) =>
    [...moneyKeys.shop(shopId), 'till', 'summary', date] as const,
  summaries: (shopId: string) => [...moneyKeys.shop(shopId), 'daily'] as const,
  summaryList: (shopId: string, status?: string) =>
    [...moneyKeys.summaries(shopId), 'list', status] as const,
  summaryByDate: (shopId: string, date: string) =>
    [...moneyKeys.summaries(shopId), 'date', date] as const,
  summary: (id: string) => ['daily-summary', id] as const,
  expenseCategories: (shopId: string) =>
    [...moneyKeys.shop(shopId), 'expense-categories'] as const,
  expenses: (shopId: string, from?: string, to?: string) =>
    [...moneyKeys.shop(shopId), 'expenses', from, to] as const,
  profit: (shopId: string, from: string, to: string) =>
    [...moneyKeys.shop(shopId), 'profit', from, to] as const,
};

// Mirrors tapt-api contracts: till-entry, daily-summary, expense,
// expense-category and profit-report. Every amount is Int cents.

export type TillCategory = 'SALES' | 'EXPENSE' | 'WITHDRAWAL' | 'DEPOSIT';

export type TillEntry = {
  id: string;
  shopId: string;
  category: TillCategory;
  /** Positive on originals; negative only on reversal rows. */
  amount: number;
  description: string | null;
  billUrl: string | null;
  recordedById: string;
  transactionDate: string;
  reversesEntryId: string | null;
  correctionReason: string | null;
  createdAt: string;
};

export type CreateTillEntryInput = {
  shopId: string;
  category: TillCategory;
  amount: number;
  description?: string;
  transactionDate?: string;
};

export type TillSummary = {
  shopId: string;
  date: string;
  openingBalance: number;
  expectedClosingBalance: number;
  actualClosingBalance: number | null;
  variance: number | null;
  totalCashIn: number;
  totalCashOut: number;
  breakdown: Record<TillCategory, number>;
};

export type DailySummaryStatus = 'DRAFT' | 'FINALIZED';

export type DailySummary = {
  id: string;
  shopId: string;
  date: string;
  status: DailySummaryStatus;
  openingBalance: number;
  closingBalance: number;
  totalCashIn: number;
  totalCashOut: number;
  scratchRevenue: number;
  deliveryExpense: number;
  otherIncome: number;
  otherExpense: number;
  variance: number;
  breakdown: {
    tillByCategory: Record<string, number>;
    scratchByGame: {
      gameId: string;
      ticketsSold: number;
      revenueCents: number;
    }[];
    deliveryBySupplier: {
      supplierId: string;
      totalAmountCents: number;
      totalPaidCents: number;
    }[];
    expenseByCategory: { categoryId: string; amountCents: number }[];
  };
  notes: string | null;
  createdById: string;
  finalizedAt: string | null;
  finalizedById: string | null;
  voidedAt: string | null;
  voidedById: string | null;
  voidReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDailySummaryInput = {
  shopId: string;
  date: string;
  openingBalance?: number;
  closingBalance: number;
  notes?: string;
};

export type ExpenseCategory = {
  id: string;
  shopId: string | null;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

export type Expense = {
  id: string;
  shopId: string;
  categoryId: string;
  amount: number;
  description: string;
  billUrl: string | null;
  expenseDate: string;
  recordedById: string;
  voidedAt: string | null;
  voidedById: string | null;
  voidReason: string | null;
  createdAt: string;
};

export type CreateExpenseInput = {
  shopId: string;
  categoryId: string;
  amount: number;
  description: string;
  expenseDate: string;
};

export type ProfitPreview = {
  shopId: string;
  periodStart: string;
  periodEnd: string;
  scratchRevenue: number;
  deliveryRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  purchaseCost: number;
  deliveryCost: number;
  licenseFees: number;
  salaryExpense: number;
  utilityExpense: number;
  rentExpense: number;
  otherExpense: number;
  totalExpense: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  scratchCardsCount: number;
  inventoryValue: number;
  uncoveredDates: string[];
};

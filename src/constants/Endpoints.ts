/**
 * Canonical endpoint map for tapt-mobile.
 * Derived from tapt-api/packages/api/src/contracts/* (pathPrefix "/api/v1" stripped — API_BASE_URL already contains it).
 * Only routes that actually exist in the API are listed. Do not add invented AUTH/COMPANIES/UPLOADS entries.
 */
export const ENDPOINTS = {
  AUTH: {
    REGISTER: 'auth/register',
    LOGIN: 'auth/login',
    REFRESH: 'auth/refresh',
    LOGOUT: 'auth/logout',
    PROFILE: 'auth/profile',
    CHANGE_PASSWORD: 'auth/change-password',
    LOGOUT_ALL: 'auth/logout-all',
    SESSIONS: 'auth/sessions',
    SESSION: (id: string) => `auth/sessions/${id}`,
  },
  INVITATIONS: {
    CREATE: 'invitations',
    LIST: 'invitations',
    ACCEPT: 'invitations/accept',
    RESEND: (id: string) => `invitations/${id}/resend`,
    REVOKE: (id: string) => `invitations/${id}`,
  },
  SHOPS: {
    CREATE: 'shops',
    LIST_MY: 'shops/my',
    BY_ID: (id: string) => `shops/${id}`,
    UPDATE: (id: string) => `shops/${id}`,
    DELETE: (id: string) => `shops/${id}`,
    STAFF: (id: string) => `shops/${id}/staff`,
    ADD_STAFF: (id: string) => `shops/${id}/staff`,
    REMOVE_STAFF: (shopId: string, userId: string) =>
      `shops/${shopId}/staff/${userId}`,
  },
  TEAM: {
    MEMBERS: 'team/members',
  },
  CATEGORIES: {
    CREATE: 'categories',
    LIST: 'categories',
    BY_ID: (id: string) => `categories/${id}`,
    UPDATE: (id: string) => `categories/${id}`,
  },
  SUPPLIERS: {
    CREATE: 'suppliers',
    LIST: 'suppliers',
    BY_ID: (id: string) => `suppliers/${id}`,
    UPDATE: (id: string) => `suppliers/${id}`,
  },
  DELIVERIES: {
    CREATE: 'deliveries',
    LIST: 'deliveries',
    SUPPLIER_OUTSTANDING: 'deliveries/supplier-outstanding',
    BY_ID: (id: string) => `deliveries/${id}`,
    RECORD_PAYMENT: (id: string) => `deliveries/${id}/payments`,
    VOID_PAYMENT: (paymentId: string) =>
      `deliveries/payments/${paymentId}/void`,
    VOID: (id: string) => `deliveries/${id}/void`,
    RECEIVE: (id: string) => `deliveries/${id}/receive`,
    BILL: (id: string) => `deliveries/${id}/bill`,
  },
  DAILY_SUMMARIES: {
    CREATE: 'daily-summaries',
    LIST: 'daily-summaries',
    BY_DATE: (shopId: string, date: string) =>
      `daily-summaries/by-date/${shopId}/${date}`,
    BY_ID: (id: string) => `daily-summaries/${id}`,
    FINALIZE: (id: string) => `daily-summaries/${id}/finalize`,
    VOID: (id: string) => `daily-summaries/${id}/void`,
  },
  EXPENSE_CATEGORIES: {
    CREATE: 'expense-categories',
    LIST: 'expense-categories',
    UPDATE: (id: string) => `expense-categories/${id}`,
  },
  EXPENSES: {
    CREATE: 'expenses',
    LIST: 'expenses',
    VOID: (id: string) => `expenses/${id}/void`,
  },
  FORMS: {
    CREATE: 'forms',
    LIST: 'forms',
    BY_ID: (id: string) => `forms/${id}`,
    UPDATE: (id: string) => `forms/${id}`,
    SUBMIT: (id: string) => `forms/${id}/submit`,
    SUBMISSIONS: (id: string) => `forms/${id}/submissions`,
  },
  LICENSES: {
    CREATE: 'licenses',
    LIST: 'licenses',
    EXPIRING: 'licenses/expiring',
    BY_ID: (id: string) => `licenses/${id}`,
    UPDATE: (id: string) => `licenses/${id}`,
    RENEW: (id: string) => `licenses/${id}/renew`,
    RENEWALS: (id: string) => `licenses/${id}/renewals`,
    VOID_RENEWAL: (id: string, renewalId: string) =>
      `licenses/${id}/renewals/${renewalId}/void`,
  },
  PROFIT_REPORTS: {
    GENERATE: 'profit-reports/generate',
    PREVIEW: 'profit-reports/preview',
    LIST: 'profit-reports',
    LATEST: 'profit-reports/latest',
    BY_ID: (id: string) => `profit-reports/${id}`,
    VOID: (id: string) => `profit-reports/${id}/void`,
  },
  SCRATCH: {
    CREATE_GAME: 'scratch/games',
    LIST_GAMES: 'scratch/games',
    GET_GAME: (id: string) => `scratch/games/${id}`,
    CREATE_PACK: 'scratch/packs',
    LIST_PACKS: 'scratch/packs',
    GET_PACK: (id: string) => `scratch/packs/${id}`,
    UPDATE_LOCATION: (id: string) => `scratch/packs/${id}/location`,
    RETURN_PACK: (id: string) => `scratch/packs/${id}/return`,
    SCAN: (id: string) => `scratch/packs/${id}/scans`,
    SUMMARY: 'scratch/summary',
    LIST_SCANS: 'scratch/scans',
    VOID_SCAN: (id: string) => `scratch/scans/${id}/void`,
  },
  TASKS: {
    CREATE: 'tasks',
    LIST: 'tasks',
    BY_ID: (id: string) => `tasks/${id}`,
    UPDATE: (id: string) => `tasks/${id}`,
    TRANSITION: (id: string) => `tasks/${id}/transition`,
    ASSIGN: (id: string) => `tasks/${id}/assign`,
    VOID: (id: string) => `tasks/${id}/void`,
  },
  TICKETS: {
    CREATE: 'tickets',
    LIST: 'tickets',
    BY_ID: (id: string) => `tickets/${id}`,
    MESSAGES: (id: string) => `tickets/${id}/messages`,
    CREATE_MESSAGE: (id: string) => `tickets/${id}/messages`,
    TRANSITION: (id: string) => `tickets/${id}/transition`,
    ASSIGN: (id: string) => `tickets/${id}/assign`,
    ACK: (id: string) => `tickets/${id}/ack`,
    ACKS: (id: string) => `tickets/${id}/acknowledgements`,
  },
  TILL_ENTRIES: {
    CREATE: 'till-entries',
    LIST: 'till-entries',
    SUMMARY: 'till-entries/summary',
    BY_ID: (id: string) => `till-entries/${id}`,
    REVERSE: (id: string) => `till-entries/${id}/reverse`,
  },
} as const;

export type Endpoints = typeof ENDPOINTS;

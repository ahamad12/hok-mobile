// Mirrors tapt-api packages/api/src/contracts/task.contract.ts and
// ticket.contract.ts.

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

export type RecurringConfig =
  | { interval: 'daily' }
  | { interval: 'weekly'; dayOfWeek: number }
  | { interval: 'monthly'; dayOfMonth: number }
  | null;

export type Task = {
  id: string;
  shopId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  status: TaskStatus;
  dueDate: string | null;
  isRecurring: boolean;
  recurringConfig: RecurringConfig;
  priority: number;
  createdById: string;
  completedAt: string | null;
  voidedAt: string | null;
  voidedById: string | null;
  voidReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskFilters = {
  status?: TaskStatus;
  assigneeId?: string;
  isOverdue?: boolean;
  search?: string;
};

export type CreateTaskInput = {
  shopId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  priority?: number;
  isRecurring?: boolean;
  recurringConfig?: RecurringConfig;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: number;
};

export type TicketType = 'ISSUE' | 'INSTRUCTION' | 'ANNOUNCEMENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type Ticket = {
  id: string;
  shopId: string;
  type: TicketType;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  requiresAck: boolean;
  createdById: string;
  assigneeId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  mediaUrl: string | null;
  clientMessageId: string | null;
  sequence: number;
  createdAt: string;
};

export type TicketFilters = {
  type?: TicketType;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string;
  search?: string;
};

export type CreateTicketInput = {
  shopId: string;
  type: TicketType;
  subject: string;
  priority?: TicketPriority;
  assigneeId?: string;
  requiresAck?: boolean;
  body: string;
  clientMessageId: string;
};

export type Acknowledgements = {
  audience: {
    userId: string;
    displayName: string;
    acknowledgedAt: string | null;
  }[];
  totalAudience: number;
  acknowledgedCount: number;
};

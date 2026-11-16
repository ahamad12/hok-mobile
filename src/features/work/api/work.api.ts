import { ENDPOINTS } from '@/constants/Endpoints';
import { apiGet, apiPatch, apiPost, uuidv4 } from '@/services/apiRequest';

import {
  Acknowledgements,
  CreateTaskInput,
  CreateTicketInput,
  Task,
  TaskFilters,
  TaskStatus,
  Ticket,
  TicketFilters,
  TicketMessage,
  TicketStatus,
  UpdateTaskInput,
} from './work.types';

const T = ENDPOINTS.TASKS;
const K = ENDPOINTS.TICKETS;

// ── Tasks ────────────────────────────────────────────────────────────────

export const getTasks = (shopId: string, filters: TaskFilters = {}) =>
  apiGet<{ tasks: Task[]; total: number }>(T.LIST, {
    shopId,
    limit: 100,
    ...filters,
  });

export const getTask = (id: string) => apiGet<Task>(T.BY_ID(id));
export const createTask = (input: CreateTaskInput) =>
  apiPost<Task>(T.CREATE, input);
export const updateTask = (id: string, input: UpdateTaskInput) =>
  apiPatch<Task>(T.UPDATE(id), input);
export const transitionTask = (id: string, to: TaskStatus) =>
  apiPost<Task>(T.TRANSITION(id), { to });
export const assignTask = (id: string, assigneeId: string | null) =>
  apiPost<Task>(T.ASSIGN(id), { assigneeId });
/** OWNER/MANAGER. */
export const voidTask = (id: string, voidReason: string) =>
  apiPost<Task>(T.VOID(id), { voidReason });

// ── Tickets ──────────────────────────────────────────────────────────────

export const getTickets = (shopId: string, filters: TicketFilters = {}) =>
  apiGet<{ tickets: Ticket[]; total: number }>(K.LIST, {
    shopId,
    limit: 100,
    ...filters,
  });

export const getTicket = (id: string) =>
  apiGet<{ ticket: Ticket; messages: TicketMessage[] }>(K.BY_ID(id), {
    recentMessages: 50,
  });

export const createTicket = (
  input: Omit<CreateTicketInput, 'clientMessageId'>,
) =>
  apiPost<{ ticket: Ticket; message: TicketMessage }>(K.CREATE, {
    ...input,
    clientMessageId: uuidv4(),
  });

export const sendTicketMessage = (id: string, message: string) =>
  apiPost<TicketMessage>(K.CREATE_MESSAGE(id), {
    message,
    clientMessageId: uuidv4(),
  });

export const transitionTicket = (id: string, to: TicketStatus) =>
  apiPost<Ticket>(K.TRANSITION(id), { to });

export const assignTicket = (id: string, assigneeId: string | null) =>
  apiPost<Ticket>(K.ASSIGN(id), { assigneeId });

export const acknowledgeTicket = (id: string) =>
  apiPost<{ acknowledgedAt: string }>(K.ACK(id));

export const getAcknowledgements = (id: string) =>
  apiGet<Acknowledgements>(K.ACKS(id));

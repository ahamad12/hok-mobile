import { TaskFilters, TicketFilters } from './work.types';

export const workKeys = {
  tasks: (shopId: string) => ['tasks', shopId] as const,
  taskList: (shopId: string, filters: TaskFilters = {}) =>
    [...workKeys.tasks(shopId), 'list', filters] as const,
  task: (id: string) => ['task', id] as const,

  tickets: (shopId: string) => ['tickets', shopId] as const,
  ticketList: (shopId: string, filters: TicketFilters = {}) =>
    [...workKeys.tickets(shopId), 'list', filters] as const,
  ticket: (id: string) => ['ticket', id] as const,
  acks: (id: string) => ['ticket', id, 'acks'] as const,
};

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { workKeys } from './query-keys';
import {
  acknowledgeTicket,
  assignTask,
  assignTicket,
  createTask,
  createTicket,
  sendTicketMessage,
  transitionTask,
  transitionTicket,
  updateTask,
  voidTask,
} from './work.api';
import {
  CreateTaskInput,
  CreateTicketInput,
  Task,
  TaskStatus,
  Ticket,
  TicketMessage,
  TicketStatus,
  UpdateTaskInput,
} from './work.types';

// ── Tasks ────────────────────────────────────────────────────────────────

export const useCreateTask = (shopId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateTaskInput, 'shopId'>) =>
      createTask({ ...input, shopId }),
    meta: { silent: true },
    onSuccess: () => qc.invalidateQueries({ queryKey: workKeys.tasks(shopId) }),
  });
};

/** Any change to one task: cache it, refresh the shop's lists. */
const useTaskChange = <V>(
  shopId: string,
  fn: (vars: V) => Promise<Task>,
  silent = false,
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    meta: { silent },
    onSuccess: (task) => {
      qc.setQueryData(workKeys.task(task.id), task);
      return qc.invalidateQueries({ queryKey: workKeys.tasks(shopId) });
    },
  });
};

export const useUpdateTask = (shopId: string, id: string) =>
  useTaskChange(
    shopId,
    (input: UpdateTaskInput) => updateTask(id, input),
    true,
  );

export const useTransitionTask = (shopId: string, id: string) =>
  useTaskChange(shopId, (to: TaskStatus) => transitionTask(id, to));

export const useAssignTask = (shopId: string, id: string) =>
  useTaskChange(shopId, (assigneeId: string | null) =>
    assignTask(id, assigneeId),
  );

export const useVoidTask = (shopId: string, id: string) =>
  useTaskChange(shopId, (reason: string) => voidTask(id, reason));

// ── Tickets ──────────────────────────────────────────────────────────────

export const useCreateTicket = (shopId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      input: Omit<CreateTicketInput, 'shopId' | 'clientMessageId'>,
    ) => createTicket({ ...input, shopId }),
    meta: { silent: true },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: workKeys.tickets(shopId) }),
  });
};

type TicketDetail = { ticket: Ticket; messages: TicketMessage[] };

const useTicketChange = <V>(
  shopId: string,
  id: string,
  fn: (vars: V) => Promise<Ticket>,
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (ticket) => {
      qc.setQueryData<TicketDetail>(workKeys.ticket(id), (prev) =>
        prev ? { ...prev, ticket } : prev,
      );
      return qc.invalidateQueries({ queryKey: workKeys.tickets(shopId) });
    },
  });
};

export const useTransitionTicket = (shopId: string, id: string) =>
  useTicketChange(shopId, id, (to: TicketStatus) => transitionTicket(id, to));

export const useAssignTicket = (shopId: string, id: string) =>
  useTicketChange(shopId, id, (assigneeId: string | null) =>
    assignTicket(id, assigneeId),
  );

export const useSendTicketMessage = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => sendTicketMessage(id, message),
    onSuccess: (msg) =>
      qc.setQueryData<TicketDetail>(workKeys.ticket(id), (prev) =>
        prev && !prev.messages.some((m) => m.id === msg.id)
          ? { ...prev, messages: [...prev.messages, msg] }
          : prev,
      ),
  });
};

export const useAcknowledgeTicket = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => acknowledgeTicket(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: workKeys.acks(id) }),
  });
};

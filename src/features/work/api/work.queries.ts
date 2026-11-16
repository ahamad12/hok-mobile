import { useQuery } from '@tanstack/react-query';

import { useIsSignedIn } from '@/features/auth/hooks/useAuth';

import { workKeys } from './query-keys';
import {
  getAcknowledgements,
  getTask,
  getTasks,
  getTicket,
  getTickets,
} from './work.api';
import { TaskFilters, TicketFilters } from './work.types';

export const useTasks = (shopId: string, filters: TaskFilters = {}) =>
  useQuery({
    queryKey: workKeys.taskList(shopId, filters),
    queryFn: () => getTasks(shopId, filters),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 30,
  });

export const useTask = (id?: string) =>
  useQuery({
    queryKey: workKeys.task(id ?? ''),
    queryFn: () => getTask(id as string),
    enabled: useIsSignedIn() && !!id,
  });

export const useTickets = (shopId: string, filters: TicketFilters = {}) =>
  useQuery({
    queryKey: workKeys.ticketList(shopId, filters),
    queryFn: () => getTickets(shopId, filters),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 30,
  });

export const useTicket = (id?: string) =>
  useQuery({
    queryKey: workKeys.ticket(id ?? ''),
    queryFn: () => getTicket(id as string),
    enabled: useIsSignedIn() && !!id,
    staleTime: 1000 * 10,
  });

export const useAcknowledgements = (id: string | undefined, enabled = true) =>
  useQuery({
    queryKey: workKeys.acks(id ?? ''),
    queryFn: () => getAcknowledgements(id as string),
    enabled: useIsSignedIn() && !!id && enabled,
  });

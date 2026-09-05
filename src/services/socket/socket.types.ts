/**
 * Event contract — duplicated from tapt-api's @tapt-api/api/events for now.
 * TODO: once tapt-mobile is wired into the Yarn workspace, replace the
 * contents of this file with re-exports from '@tapt-api/api/events' and
 * delete the duplicated definitions below. Every consumer in this app
 * (socket.service, useSocketEvent, feature code) imports ONLY from this
 * file, never from socket.io-client types directly — so that swap stays
 * a one-file change.
 *
 * Copied from tapt-api/packages/api/src/events/{event-names,schemas}.ts
 */

export const SOCKET_EVENTS = {
  TASK_ASSIGNED: "task:assigned",
  TASK_UPDATED: "task:updated",

  TICKET_CREATED: "ticket:created",
  TICKET_UPDATED: "ticket:updated",
  TICKET_MESSAGE_CREATED: "ticket:message_created",
  TICKET_STATUS_CHANGED: "ticket:status_changed",
  TICKET_ASSIGNED: "ticket:assigned",
  TICKET_ACKNOWLEDGED: "ticket:acknowledged",

  TILL_ENTRY_CREATED: "till:created",

  SCRATCH_SALE_CREATED: "scratch:sale_created",

  DELIVERY_CREATED: "delivery:created",

  DAILY_SUMMARY_FINALIZED: "summary:finalized",
  DAILY_SUMMARY_VOIDED: "summary:voided",

  LICENSE_EXPIRING: "license:expiring",

  PROFIT_REPORT_GENERATED: "report:generated",
  PROFIT_REPORT_VOIDED: "report:voided",

  FORM_SUBMITTED: "form:submitted",

  SESSION_REVOKED: "session:revoked",
} as const;

export type SocketEventName =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export interface SocketEnvelope<TData = unknown> {
  event: SocketEventName;
  shopId: string | null;
  occurredAt: string;
  data: TData;
}

export interface TaskAssignedData {
  taskId: string;
  title: string;
  assigneeId: string;
}

export interface TaskUpdatedData {
  taskId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "BLOCKED";
}

export interface TicketCreatedData {
  ticketId: string;
  shopId: string;
  type: "ISSUE" | "INSTRUCTION" | "ANNOUNCEMENT";
  subject: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
}

export interface TicketUpdatedData {
  ticketId: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
}

export interface TicketMessageCreatedData {
  ticketId: string;
  shopId: string;
  senderId: string;
  assigneeId: string | null;
  message?: string;
  senderName?: string;
}

export interface TicketStatusChangedData {
  ticketId: string;
  shopId: string;
  type: "ISSUE" | "INSTRUCTION" | "ANNOUNCEMENT";
  from: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  to: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
}

export interface TicketAssignedData {
  ticketId: string;
  assigneeId: string;
  subject: string;
}

export interface TicketAcknowledgedData {
  ticketId: string;
  userId: string;
  acknowledgedAt: string;
}

export interface TillEntryCreatedData {
  entryId: string;
  type: "CASH_IN" | "CASH_OUT";
  category: string;
  amount: number;
}

export interface ScratchSaleCreatedData {
  saleId: string;
  cardName: string;
  quantity: number;
  totalAmount: number;
}

export interface DeliveryCreatedData {
  deliveryId: string;
  shopId: string;
  supplierId: string;
  supplierName: string;
  lineItemCount: number;
  totalAmountCents: number;
}

export interface DailySummaryFinalizedData {
  summaryId: string;
  shopId: string;
  date: string;
  closingBalance: number;
  variance: number;
  finalizedById: string;
}

export interface DailySummaryVoidedData {
  summaryId: string;
  shopId: string;
  date: string;
  voidedById: string;
}

export interface LicenseExpiringData {
  licenseId: string;
  productName: string;
  expiryDate: string;
  daysRemaining: number;
}

export interface ProfitReportGeneratedData {
  reportId: string;
  shopId: string;
  periodStart: string;
  periodEnd: string;
  netProfit: number;
  profitMargin: number;
  generatedById: string;
}

export interface ProfitReportVoidedData {
  reportId: string;
  shopId: string;
  periodStart: string;
  periodEnd: string;
  voidedById: string;
}

export interface FormSubmittedData {
  formId: string;
  shopId: string;
  submissionId: string;
  staffId: string;
}

export interface SessionRevokedData {
  message: string;
}

export interface ServerToClientEvents {
  [SOCKET_EVENTS.TASK_ASSIGNED]: (
    envelope: SocketEnvelope<TaskAssignedData>,
  ) => void;
  [SOCKET_EVENTS.TASK_UPDATED]: (
    envelope: SocketEnvelope<TaskUpdatedData>,
  ) => void;
  [SOCKET_EVENTS.TICKET_CREATED]: (
    envelope: SocketEnvelope<TicketCreatedData>,
  ) => void;
  [SOCKET_EVENTS.TICKET_UPDATED]: (
    envelope: SocketEnvelope<TicketUpdatedData>,
  ) => void;
  [SOCKET_EVENTS.TICKET_MESSAGE_CREATED]: (
    envelope: SocketEnvelope<TicketMessageCreatedData>,
  ) => void;
  [SOCKET_EVENTS.TICKET_STATUS_CHANGED]: (
    envelope: SocketEnvelope<TicketStatusChangedData>,
  ) => void;
  [SOCKET_EVENTS.TICKET_ASSIGNED]: (
    envelope: SocketEnvelope<TicketAssignedData>,
  ) => void;
  [SOCKET_EVENTS.TICKET_ACKNOWLEDGED]: (
    envelope: SocketEnvelope<TicketAcknowledgedData>,
  ) => void;
  [SOCKET_EVENTS.TILL_ENTRY_CREATED]: (
    envelope: SocketEnvelope<TillEntryCreatedData>,
  ) => void;
  [SOCKET_EVENTS.SCRATCH_SALE_CREATED]: (
    envelope: SocketEnvelope<ScratchSaleCreatedData>,
  ) => void;
  [SOCKET_EVENTS.DELIVERY_CREATED]: (
    envelope: SocketEnvelope<DeliveryCreatedData>,
  ) => void;
  [SOCKET_EVENTS.DAILY_SUMMARY_FINALIZED]: (
    envelope: SocketEnvelope<DailySummaryFinalizedData>,
  ) => void;
  [SOCKET_EVENTS.DAILY_SUMMARY_VOIDED]: (
    envelope: SocketEnvelope<DailySummaryVoidedData>,
  ) => void;
  [SOCKET_EVENTS.LICENSE_EXPIRING]: (
    envelope: SocketEnvelope<LicenseExpiringData>,
  ) => void;
  [SOCKET_EVENTS.PROFIT_REPORT_GENERATED]: (
    envelope: SocketEnvelope<ProfitReportGeneratedData>,
  ) => void;
  [SOCKET_EVENTS.PROFIT_REPORT_VOIDED]: (
    envelope: SocketEnvelope<ProfitReportVoidedData>,
  ) => void;
  [SOCKET_EVENTS.FORM_SUBMITTED]: (
    envelope: SocketEnvelope<FormSubmittedData>,
  ) => void;
  [SOCKET_EVENTS.SESSION_REVOKED]: (
    envelope: SocketEnvelope<SessionRevokedData>,
  ) => void;
}

// Server is push-only — the mobile client never emits app events — but
// Socket.IO's generics require this type. Keep it empty.
export type ClientToServerEvents = Record<string, never>;

export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

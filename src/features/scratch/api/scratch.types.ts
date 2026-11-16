// Mirrors tapt-api packages/api/src/contracts/scratch.contract.ts.

export type ScratchPackStatus = 'ACTIVE' | 'FINISHED' | 'RETURNED';
export type ScratchPackLocation = 'DISPLAY' | 'BACKSTOCK';
export type ShiftPeriod = 'MORNING' | 'EVENING';

export type ScratchGame = {
  id: string;
  shopId: string;
  gameNumber: string | null;
  name: string;
  priceCents: number;
  ticketsPerPack: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ScratchPack = {
  id: string;
  gameId: string;
  shopId: string;
  serialStart: string;
  status: ScratchPackStatus;
  location: ScratchPackLocation;
  receivedById: string;
  receivedAt: string;
  finishedAt: string | null;
  returnedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ScratchScan = {
  id: string;
  packId: string;
  gameId: string;
  shopId: string;
  scanDate: string;
  shiftPeriod: ShiftPeriod;
  scannedSerial: string;
  ticketsSoldSincePrevious: number;
  ticketsRemaining: number;
  unitPriceCents: number;
  revenueCents: number;
  scannedById: string;
  voidedAt: string | null;
  voidedById: string | null;
  voidReason: string | null;
  createdAt: string;
};

export type ScratchSummary = {
  shopId: string;
  dateFrom: string;
  dateTo: string;
  totalTicketsSold: number;
  totalRevenueCents: number;
  byGame: { gameId: string; ticketsSold: number; revenueCents: number }[];
};

export type CreateScratchGameInput = {
  shopId: string;
  gameNumber?: string;
  name: string;
  priceCents: number;
  ticketsPerPack: number;
};

export type ReceivePackInput = {
  shopId: string;
  gameId: string;
  serialStart: string;
  location: ScratchPackLocation;
};

export type RecordScanInput = {
  /** "YYYY-MM-DD" business day. */
  scanDate: string;
  shiftPeriod: ShiftPeriod;
  scannedSerial: string;
};

export type PackFilters = {
  status?: ScratchPackStatus;
  location?: ScratchPackLocation;
  gameId?: string;
};

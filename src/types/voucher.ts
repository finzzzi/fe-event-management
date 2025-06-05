export interface Voucher {
  id: number;
  name: string;
  eventId: number;
  nominal: number;
  quota: number;
  startDate: string;
  endDate: string;
  deletedAt?: string | Date | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventOption {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

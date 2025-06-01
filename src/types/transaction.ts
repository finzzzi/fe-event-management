export interface CreateTransactionRequest {
  eventId: number;
  quantity: number;
}

export interface CreateTransactionResponse {
  message: string;
  data: {
    id: number;
    event: {
      name: string;
      price: number;
      quota: number;
    };
    quantity: number;
    basePrice: number;
    totalPrice: number;
    totalDiscount: number;
  };
}

export interface Coupon {
  id: number;
  name: string;
  nominal: number;
  quota: number;
}

export interface Voucher {
  id: number;
  name: string;
  eventId: number;
  nominal: number;
  quota: number;
  startDate: string;
  endDate: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDetailResponse {
  success: boolean;
  data: {
    transaction: {
      id: number;
      quantity: number;
      totalPrice: number;
      totalDiscount: number;
      status: string;
    };
    event: {
      name: string;
      price: number;
      quota: number;
      vouchers?: Voucher;
    };
    availableDiscounts: {
      points: {
        available: number;
        maxUsage: number;
      };
      coupon: Coupon | null;
      voucher: {
        id: number;
        name: string;
        nominal: number;
        quota: number;
      } | null;
    };
  };
}

export interface ApplyDiscountRequest {
  use_points?: boolean;
  points_amount?: number;
  use_coupon?: boolean;
  use_voucher?: boolean;
}

export interface ApplyDiscountResponse {
  message: string;
  data: {
    transactionId: number;
    basePrice: number;
    totalDiscount: number;
    finalPrice: number;
    discountsApplied: {
      points: number;
      voucher: boolean;
    };
  };
}

export interface ConfirmTransactionResponse {
  message: string;
}

export interface UploadPaymentProofResponse {
  message: string;
}

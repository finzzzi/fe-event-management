export interface CreateTransactionRequest {
  eventId: number;
  quantity: number;
  use_points?: boolean;
  points_amount?: number;
  use_coupon?: boolean;
  use_voucher?: boolean;
}

export interface CreateTransactionResponse {
  message: string;
  data: {
    transactionId: number;
    event: {
      name: string;
      price: number;
      quota: number;
    };
    quantity: number;
    basePrice: number;
    totalDiscount: number;
    finalPrice: number;
    discountsApplied: {
      points: number;
      coupon: boolean;
      voucher: boolean;
    };
    nextStep: string;
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

// User Transactions Types
export interface TransactionStatus {
  id: number;
  name:
    | "WaitingForPayment"
    | "WaitingForAdminConfirmation"
    | "Done"
    | "Rejected"
    | "Expired"
    | "Canceled";
}

export interface UserTransaction {
  id: number;
  userId: number;
  eventId: number;
  transactionStatusId: number;
  quantity: number;
  totalDiscount: number;
  totalPrice: number;
  paymentProof: string | null;
  createdAt: string;
  updatedAt: string;
  event: {
    id: number;
    name: string;
    price: number;
    location: string;
    startDate: string;
    endDate: string;
  };
  transactionStatus: TransactionStatus;
}

export interface UserTransactionsResponse {
  message: string;
  data: UserTransaction[];
}

// Review Types
export interface CreateReviewRequest {
  eventId: number;
  rating: number;
  comment: string;
  transactionId: number;
}

export interface ReviewData {
  id: number;
  userId: number;
  eventId: number;
  rating: number;
  comment: string;
  transactionId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewResponse {
  message: string;
  data: ReviewData;
}

export interface GetReviewResponse {
  message: string;
  data: ReviewData | null;
}

import {
  CreateTransactionRequest,
  CreateTransactionResponse,
  UploadPaymentProofResponse,
  UserTransactionsResponse,
  CreateReviewRequest,
  CreateReviewResponse,
  GetReviewResponse,
} from "@/types/transaction";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const getAuthHeadersForFile = () => {
  const token = localStorage.getItem("token");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const transactionService = {
  async getUserTransactions(): Promise<UserTransactionsResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/transactions/user`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get user transactions");
    }

    return response.json();
  },

  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<CreateTransactionResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/transactions`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create transaction");
    }

    return response.json();
  },

  async uploadPaymentProof(
    id: string,
    file: File
  ): Promise<UploadPaymentProofResponse> {
    const formData = new FormData();
    formData.append("payment_proof", file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}/payment-proof`,
      {
        method: "PATCH",
        headers: getAuthHeadersForFile(),
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload payment proof");
    }

    return response.json();
  },

  async createReview(data: CreateReviewRequest): Promise<CreateReviewResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/transactions/review`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create review");
    }

    return response.json();
  },

  async getReviewByTransactionId(
    transactionId: number
  ): Promise<GetReviewResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/transactions/review?transactionId=${transactionId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 404) {
      return { message: "Review not found", data: null };
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get review");
    }
    return response.json();
  },
};

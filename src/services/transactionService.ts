import {
  CreateTransactionRequest,
  CreateTransactionResponse,
  TransactionDetailResponse,
  ApplyDiscountRequest,
  ApplyDiscountResponse,
  ConfirmTransactionResponse,
  UploadPaymentProofResponse,
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

  async getTransaction(id: string): Promise<TransactionDetailResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get transaction");
    }

    return response.json();
  },

  async applyDiscount(
    id: string,
    data: ApplyDiscountRequest
  ): Promise<ApplyDiscountResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to apply discount");
    }

    return response.json();
  },

  async confirmTransaction(
    id: string,
    data: ApplyDiscountRequest
  ): Promise<ConfirmTransactionResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}/confirm`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to confirm transaction");
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
};

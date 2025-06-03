export interface UserProfileResponse {
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    role: string;
    referralCode: string;
    points: {
      total: number;
    };
    coupons: Array<{
      id: number;
      nominal: number;
      expiredAt: string;
    }>;
  };
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const userService = {
  async getUserProfile(): Promise<UserProfileResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/user`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get user profile");
    }

    return response.json();
  },
};

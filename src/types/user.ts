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

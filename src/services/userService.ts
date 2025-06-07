import { OrganizerProfile } from "@/types/event";
import { UserProfileResponse } from "@/types/user";

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

  async fetchOrganizerProfile(organizerId: string): Promise<OrganizerProfile> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/organizer/${organizerId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch organizer profile.");
    }

    return response.json();
  },
};

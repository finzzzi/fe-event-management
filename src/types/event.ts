export interface Event {
  id: number;
  userId: number;
  name: string;
  categoryId: number;
  price: number;
  quota: number;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  category: {
    name: string;
  };
  organizer: {
    name: string;
  };
}

export interface EventCategory {
  id: number;
  name: string;
}

export interface EventOrganizer {
  id: number;
  name: string;
  email?: string;
}

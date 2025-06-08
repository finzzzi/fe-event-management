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
  vouchers?: {
    id: number;
    name: string;
    nominal: number;
    quota: number;
    startDate: string;
    endDate: string;
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

export interface Attendee {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  quantity: number;
  transactionDate: string;
}

export interface Review {
  rating: number;
  comment: string;
  eventName: string;
  reviewedBy: string;
}

export interface OrganizerProfile {
  name: string;
  overallRating: number;
  reviews: Review[];
}

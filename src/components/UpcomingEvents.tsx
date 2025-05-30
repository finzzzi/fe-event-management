"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, User, Banknote } from "lucide-react";

type Event = {
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
};

const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/all`);
      const data: Event[] = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const EventSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Upcoming Events
          </h1>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {initialLoading
            ? // Show skeleton cards during initial loading
              Array(6)
                .fill(0)
                .map((_, index) => <EventSkeleton key={index} />)
            : events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300  group cursor-pointer transform hover:-translate-y-1 h-full flex flex-col"
                >
                  {/* Event Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {event.name}
                      </h2>
                      <span className="bg-black text-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium">
                        {event.category.name}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      {/* Date Range */}
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {(() => {
                            const startDate = new Date(
                              event.startDate
                            ).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            });

                            const endDate = new Date(
                              event.endDate
                            ).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            });

                            return startDate === endDate
                              ? startDate
                              : `${startDate} - ${endDate}`;
                          })()}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 " />
                        <span className="text-sm">{event.location}</span>
                      </div>

                      {/* Organizer */}
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2 " />
                        <span className="text-sm">{event.organizer.name}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                      {event.description}
                    </p>

                    {/* Price and Quota - Always at bottom */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex items-center">
                        <Banknote className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="font-bold text-lg text-gray-800">
                          Rp{event.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1 text-purple-500" />
                        <span className="text-sm font-medium">
                          {event.quota} seats left
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;

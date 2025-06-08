"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Calendar,
  MapPin,
  Users,
  User,
  Banknote,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import Link from "next/link";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  data: Event[];
  pagination: PaginationInfo;
}

const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
    limit: 6,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [allCategories, setAllCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);

  const fetchEvents = async (
    page: number = 1,
    categories: string[] = [],
    isInitialLoad: boolean = false
  ) => {
    try {
      if (isInitialLoad) {
        setInitialLoading(true);
      } else {
        setPageLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "6",
      });

      if (categories.length > 0) {
        params.append("categories", categories.join(","));
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/all-with-pagination?${params}`
      );
      const data: ApiResponse = await res.json();

      setEvents(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setInitialLoading(false);
      setPageLoading(false);
    }
  };

  // Fetch all categories for filter
  const fetchAllCategories = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/categories`
      );
      const data: Array<{ id: number; name: string }> = await res.json();

      setAllCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchEvents(1, selectedCategories, true); // true for initial load
    fetchAllCategories();
  }, []);

  // Handle category toggle
  const toggleCategory = (categoryName: string) => {
    const updatedCategories = selectedCategories.includes(categoryName)
      ? selectedCategories.filter((cat) => cat !== categoryName)
      : [...selectedCategories, categoryName];

    setSelectedCategories(updatedCategories);
    fetchEvents(1, updatedCategories, false);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchEvents(newPage, selectedCategories);
    }
  };

  const EventSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 space-y-4">
        <Skeleton className="h-13 w-3/4" />
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

        {/* Category Filter Chips */}
        {!initialLoading && allCategories.length > 0 && (
          <div className="mb-8 md:px-10">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Filter by Category
              </h3>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                <Badge
                  variant={
                    selectedCategories.length === 0 ? "default" : "secondary"
                  }
                  className={`cursor-pointer px-4 py-2 text-sm font-medium ${
                    selectedCategories.length === 0
                      ? "bg-blue-800 hover:bg-blue-900 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedCategories([]);
                    fetchEvents(1, [], false);
                  }}
                >
                  All Categories
                </Badge>
                {allCategories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={
                      selectedCategories.includes(category.name)
                        ? "default"
                        : "secondary"
                    }
                    className={`cursor-pointer px-4 py-2 text-sm font-medium whitespace-nowrap ${
                      selectedCategories.includes(category.name)
                        ? "bg-blue-800 hover:bg-blue-900 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                    onClick={() => toggleCategory(category.name)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Selected categories display */}
            {selectedCategories.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                Selected: {selectedCategories.join(", ")}
              </div>
            )}
          </div>
        )}

        {/* Events Grid */}
        <div className="md:px-10">
          {initialLoading ? (
            // Show skeleton grid during initial loading
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <EventSkeleton key={index} />
                ))}
            </div>
          ) : events.length > 0 ? (
            <>
              {/* Events Grid */}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ${
                  pageLoading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/event/${event.id}`}
                    className="block h-full"
                  >
                    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                      {/* Event Content */}
                      <div className="p-6 flex flex-col flex-1 space-y-3">
                        <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                          {event.name}
                        </h2>

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
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="text-sm">{event.location}</span>
                          </div>

                          {/* Organizer */}
                          <div className="flex items-center text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              {event.organizer.name}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                          {event.description}
                        </p>

                        {/* Category */}
                        <div className="flex items-center text-white">
                          <span className="bg-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                            {event.category.name}
                          </span>
                        </div>

                        {/* Price and Quota - Always at bottom */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                          <div className="flex items-center">
                            <Banknote className="h-4 w-4 mr-2 text-blue-800" />
                            <span className="font-bold text-lg text-gray-800">
                              Rp{event.price.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-1 text-blue-800" />
                            <span className="text-sm font-medium">
                              {event.quota} seats left
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage || pageLoading}
                    className="flex items-center space-x-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>

                  <div className="flex items-center space-x-2">
                    {/* Page numbers */}
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <Button
                        key={page}
                        variant={
                          page === pagination.currentPage
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        disabled={pageLoading}
                        className={`min-w-[40px] ${
                          page === pagination.currentPage
                            ? "bg-blue-800 hover:bg-blue-900"
                            : ""
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage || pageLoading}
                    className="flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            // No events found
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No events found
              </h3>
              <p className="text-gray-500">
                Try adjusting your category filters or check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;

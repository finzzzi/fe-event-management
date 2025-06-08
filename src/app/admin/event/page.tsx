"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Event } from "@/types/event";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loadingspinner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { format } from "date-fns";
import { id as indonesian } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function EventListPage() {
  const { token, isLoading, redirectToLogin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const router = useRouter();

  // Sorting and filtering states
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Event;
    direction: "asc" | "desc";
  } | null>(null);
  const [filter, setFilter] = useState({ name: "", category: "all" }); // Changed default to 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      redirectToLogin("/admin/event");
      return;
    }

    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const message = await res.text();
          throw new Error(message);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Expected an array of events");
        }

        setEvents(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [token, isLoading, redirectToLogin]);

  // Handle sorting
  const handleSort = (key: keyof Event) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and filtering
  const processedEvents = useMemo(() => {
    let filteredEvents = [...events];

    // Apply filters
    if (filter.name) {
      filteredEvents = filteredEvents.filter((event) =>
        event.name.toLowerCase().includes(filter.name.toLowerCase())
      );
    }

    if (filter.category !== "all") {
      // Changed condition
      filteredEvents = filteredEvents.filter(
        (event) => event.category?.name === filter.category
      );
    }

    // Apply sorting
    if (sortConfig) {
      filteredEvents.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested objects
        if (sortConfig.key === "category") {
          aValue = a.category?.name;
          bValue = b.category?.name;
        }

        // Handle dates
        if (sortConfig.key === "startDate" || sortConfig.key === "endDate") {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }

        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredEvents;
  }, [events, filter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = processedEvents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    events.forEach((event) => {
      if (event.category?.name) {
        uniqueCategories.add(event.category.name);
      }
    });
    return Array.from(uniqueCategories);
  }, [events]);

  const handleDelete = async (eventId: number) => {
    const confirmed = confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete event");
      }

      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      toast.success("Event deleted successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading || loadingEvents) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Failed to load events: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <Button
            onClick={() => router.push("/admin/event/create")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Create Event
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>All Events</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Input
                  placeholder="Search by event name..."
                  value={filter.name}
                  onChange={(e) =>
                    setFilter({ ...filter, name: e.target.value })
                  }
                  className="max-w-md"
                />
                <Select
                  value={filter.category}
                  onValueChange={(value) =>
                    setFilter({ ...filter, category: value })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Fixed: Use "all" instead of empty string */}
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-10">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No events
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't created any events yet. Start by creating one!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Event Name
                          {sortConfig?.key === "name" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("category")}
                      >
                        <div className="flex items-center">
                          Category
                          {sortConfig?.key === "category" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Location
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("startDate")}
                      >
                        <div className="flex items-center">
                          Start Date
                          {sortConfig?.key === "startDate" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("endDate")}
                      >
                        <div className="flex items-center">
                          End Date
                          {sortConfig?.key === "endDate" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("price")}
                      >
                        <div className="flex items-center">
                          Price
                          {sortConfig?.key === "price" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("quota")}
                      >
                        <div className="flex items-center">
                          Quota
                          {sortConfig?.key === "quota" &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {event.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.category?.name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(event.startDate), "dd MMM yyyy", {
                            locale: indonesian,
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(event.endDate), "dd MMM yyyy", {
                            locale: indonesian,
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          IDR {event.price.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.quota}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/event/edit/${event.id}`}>
                                Edit
                              </Link>
                            </Button>
                            <Button variant="secondary" size="sm" asChild>
                              <Link href={`/admin/event/${event.id}`}>
                                Attendees
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(event.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          {events.length > 0 && (
            <CardFooter className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, processedEvents.length)}
                </span>{" "}
                of <span className="font-medium">{processedEvents.length}</span>{" "}
                events
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4 text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

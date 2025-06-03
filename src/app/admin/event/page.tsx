"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Event } from "@/types/event";
import { toast } from "sonner";

export default function EventListPage() {
  const { token, isLoading, redirectToLogin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const router = useRouter();

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

  const handleDelete = async (eventId: number) => {
    const token = localStorage.getItem("token");
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

      // Refetch events after delete
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      toast.success("Event deleted successfully!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading || loadingEvents) {
    return <div className="text-center py-10">Loading events...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-10">
        Failed to load events: {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Events</h1>
        <button
          onClick={() => router.push("/event/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <p>No events found. Start by creating one!</p>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border border-gray-200 p-4 rounded-lg shadow-sm"
            >
              <h2 className="text-xl font-semibold">{event.name}</h2>
              <p className="text-sm text-gray-600 mb-2">
                {event.category?.name} | {event.location}
              </p>
              <p className="text-sm text-gray-700">{event.description}</p>
              <p className="text-sm mt-2">
                🗓️ {new Date(event.startDate).toLocaleDateString()} -{" "}
                {new Date(event.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm">
                💵 IDR {event.price.toLocaleString("id-ID")}
              </p>
              <p className="text-sm">👥 Quota: {event.quota}</p>

              <div className="flex gap-2">
                <Link
                  href={`/event/edit/${event.id}`}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

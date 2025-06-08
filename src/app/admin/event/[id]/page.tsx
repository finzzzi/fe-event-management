"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Event } from "@/types/event";
import LoadingSpinner from "@/components/ui/loadingspinner";
import { toast } from "sonner";
import { Attendee } from "@/types/event";

export default function AttendeeListPage() {
  const { id } = useParams();
  const { token, isLoading, redirectToLogin } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      redirectToLogin(`/admin/event/${id}`);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch event details
        const eventRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/events/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!eventRes.ok) {
          throw new Error("Failed to fetch event details");
        }

        const eventData = await eventRes.json();
        setEvent(eventData);

        // Fetch attendees
        const attendeesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/events/${id}/attendees`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!attendeesRes.ok) {
          throw new Error("Failed to fetch attendees");
        }

        const attendeesData = await attendeesRes.json();
        setAttendees(attendeesData);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isLoading, redirectToLogin, id]);

  if (isLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-10">
          <LoadingSpinner size="medium" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-red-500 text-center py-10">
          Failed to load attendees: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Events
        </button>

        <h1 className="text-3xl font-bold mb-2">Attendees for {event?.name}</h1>
        <p className="text-gray-600 mb-4">
          {event?.location} •
          <span className="font-semibold"> {attendees.length} </span>
          attendees registered
          {event?.quota && <span> (Capacity: {event.quota})</span>}
        </p>
      </div>

      {attendees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No attendees yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Attendees will appear here once they purchase tickets to your event.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tickets
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Registered On
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendees.map((attendee) => (
                <tr key={attendee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {attendee.user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendee.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendee.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(attendee.transactionDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

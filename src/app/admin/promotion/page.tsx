"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loadingspinner";
import VoucherList from "@/components/admin/VoucherList";
import { Voucher, EventOption } from "@/types/voucher";

const PromotionsPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, user, isInitialized } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user || user.role !== "EventOrganizer") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch events
        const eventsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/events`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!eventsResponse.ok) {
          throw new Error("Failed to fetch events");
        }

        const eventsData = await eventsResponse.json();
        setEvents(
          eventsData.map((event: any) => ({
            id: event.id,
            name: event.name,
            startDate: event.startDate,
            endDate: event.endDate,
          }))
        );

        // Fetch vouchers
        const vouchersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vouchers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!vouchersResponse.ok) {
          throw new Error("Failed to fetch vouchers");
        }

        const vouchersData = await vouchersResponse.json();
        setVouchers(vouchersData);

        setError("");
      } catch (err) {
        setError("Failed to load data");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isInitialized) {
      fetchData();
    }
  }, [token, user, isInitialized, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user || user.role !== "EventOrganizer") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-700">
            You must be an Event Organizer to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Promotion Management
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="medium" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <VoucherList
            vouchers={vouchers}
            events={events}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </div>
  );
};

export default PromotionsPage;

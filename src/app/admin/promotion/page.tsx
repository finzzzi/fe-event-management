"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loadingspinner";
import VoucherList from "@/components/admin/VoucherList";
import { Voucher, EventOption } from "@/types/voucher";
import {
  AccessDenied,
  EmptyState,
  ErrorDisplay,
} from "@/components/admin/StandardComponents";

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
    return <AccessDenied />;
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
          <ErrorDisplay error={error} />
        ) : vouchers.length === 0 ? (
          <EmptyState
            title="No vouchers found"
            description="You haven't created any vouchers yet. Start by creating one!"
          />
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

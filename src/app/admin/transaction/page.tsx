"use client";

import React, { useEffect, useState } from "react";
// import axios from "axios";
import TransactionList from "@/components/admin/TransactionList";
import { useAuth } from "@/contexts/AuthContext";
// import LoadingSpinner from '../../components/common/LoadingSpinner';
import { UserTransaction } from "@/types/transaction";

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/eo`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();
        const transformedTransactions: UserTransaction[] = data.map(
          (tx: any) => ({
            ...tx,
            event: {
              ...tx.event,
              // Ensure dates are strings if they come as Date objects
              startDate: tx.event.startDate
                ? new Date(tx.event.startDate).toISOString()
                : "",
              endDate: tx.event.endDate
                ? new Date(tx.event.endDate).toISOString()
                : "",
            },
          })
        );

        setTransactions(transformedTransactions);
      } catch (err) {
        setError("Failed to load transactions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === "EventOrganizer") {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [token, user]);

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
            Transaction Management
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center mt-12">
            {/* <LoadingSpinner size="large" /> */}
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
        ) : transactions.length === 0 ? (
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No transactions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any transactions yet. Transactions will appear here
              once customers purchase tickets to your events.
            </p>
          </div>
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;

// Replace the entire file with this corrected version
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loadingspinner";
import { UserTransaction } from "@/types/transaction";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { id as indonesian } from "date-fns/locale";
import PaymentProofModal from "@/components/admin/PaymentProofModal";
import {
  AccessDenied,
  EmptyState,
  ErrorDisplay,
} from "@/components/admin/StandardComponents";

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, user, isInitialized, isLoading: authLoading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedProof, setSelectedProof] = useState<string | null>(null); // For payment proof modal

  // Sorting and filtering states
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserTransaction;
    direction: "asc" | "desc";
  } | null>(null);
  const [filter, setFilter] = useState({
    eventName: "",
    status: "all",
    customerName: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!token || !user || user.role !== "EventOrganizer") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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
        setTransactions(data);
        setError("");
      } catch (err) {
        setError("Failed to load transactions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isInitialized) {
      fetchTransactions();
    }
  }, [token, user, isInitialized, refreshKey]);

  // Apply sorting and filtering
  const processedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply filters
    if (filter.eventName) {
      filtered = filtered.filter((tx) =>
        tx.event.name.toLowerCase().includes(filter.eventName.toLowerCase())
      );
    }

    if (filter.customerName) {
      filtered = filtered.filter((tx) =>
        tx.user?.name.toLowerCase().includes(filter.customerName.toLowerCase())
      );
    }

    if (filter.status !== "all") {
      filtered = filtered.filter(
        (tx) =>
          tx.transactionStatus.name.toLowerCase() ===
          filter.status.toLowerCase()
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

        // Handle nested properties
        if (sortConfig.key === "event") {
          aValue = a.event.name;
          bValue = b.event.name;
        } else if (sortConfig.key === "user") {
          aValue = a.user?.name;
          bValue = b.user?.name;
        } else if (sortConfig.key === "transactionStatus") {
          aValue = a.transactionStatus.name;
          bValue = b.transactionStatus.name;
        }

        // Handle dates
        if (sortConfig.key === "createdAt") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [transactions, filter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = processedTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle sorting
  const handleSort = (key: keyof UserTransaction) => {
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

  const handleAccept = async (transactionId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionId}/accept`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to accept transaction");
      }

      toast.success("Transaction accepted");
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      console.error("Error accepting transaction:", error);
      toast.error(error.message || "Failed to accept transaction");
    }
  };

  const handleReject = async (transactionId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject transaction");
      }

      toast.success("Transaction rejected");
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      console.error("Error rejecting transaction:", error);
      toast.error(error.message || "Failed to reject transaction");
    }
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle payment proof viewing
  const handleViewProof = (proofUrl: string | null) => {
    if (!proofUrl) {
      alert("No payment proof available");
      return;
    }

    // Prepend backend URL to relative paths
    if (!proofUrl.startsWith("http") && !proofUrl.startsWith("data:")) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const separator =
        backendUrl.endsWith("/") || proofUrl.startsWith("") ? "" : "/";
      setSelectedProof(`${backendUrl}${separator}${proofUrl}`);
    } else {
      setSelectedProof(proofUrl);
    }
  };

  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Standardized access control
  if (!user || user.role !== "EventOrganizer") {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Transaction Management
          </h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>All Transactions</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Input
                  placeholder="Search by event name..."
                  value={filter.eventName}
                  onChange={(e) =>
                    setFilter({ ...filter, eventName: e.target.value })
                  }
                  className="max-w-md"
                />
                <Input
                  placeholder="Search by customer..."
                  value={filter.customerName}
                  onChange={(e) =>
                    setFilter({ ...filter, customerName: e.target.value })
                  }
                  className="max-w-md"
                />
                <Select
                  value={filter.status}
                  onValueChange={(value) =>
                    setFilter({ ...filter, status: value })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="WaitingForPayment">
                      Waiting for Payment
                    </SelectItem>
                    <SelectItem value="WaitingForAdminConfirmation">
                      Pending
                    </SelectItem>
                    <SelectItem value="Done">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="large" />
              </div>
            ) : error ? (
              <ErrorDisplay error={error} />
            ) : processedTransactions.length === 0 ? (
              <EmptyState
                title="No transactions found"
                description={
                  filter.eventName ||
                  filter.customerName ||
                  filter.status !== "all"
                    ? "No transactions match your filters"
                    : "You don't have any transactions yet"
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("event")}
                      >
                        <div className="flex items-center">
                          Event
                          {sortConfig?.key === "event" &&
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
                        onClick={() => handleSort("user")}
                      >
                        <div className="flex items-center">
                          Customer
                          {sortConfig?.key === "user" &&
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
                        Tickets
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("totalPrice")}
                      >
                        <div className="flex items-center">
                          Amount
                          {sortConfig?.key === "totalPrice" &&
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
                        onClick={() => handleSort("transactionStatus")}
                      >
                        <div className="flex items-center">
                          Status
                          {sortConfig?.key === "transactionStatus" &&
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
                        onClick={() => handleSort("createdAt")}
                      >
                        <div className="flex items-center">
                          Date
                          {sortConfig?.key === "createdAt" &&
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
                    {paginatedTransactions.map((transaction) => {
                      // Get status display properties
                      const getStatusProperties = (statusName: string) => {
                        switch (statusName) {
                          case "WaitingForPayment":
                            return {
                              text: "Waiting for Payment",
                              color: "bg-yellow-100 text-yellow-800",
                            };
                          case "WaitingForAdminConfirmation":
                            return {
                              text: "Pending",
                              color: "bg-blue-100 text-blue-800",
                            };
                          case "Done":
                            return {
                              text: "Approved",
                              color: "bg-green-100 text-green-800",
                            };
                          case "Rejected":
                            return {
                              text: "Rejected",
                              color: "bg-red-100 text-red-800",
                            };
                          case "Expired":
                            return {
                              text: "Expired",
                              color: "bg-gray-100 text-gray-800",
                            };
                          case "Canceled":
                            return {
                              text: "Canceled",
                              color: "bg-gray-100 text-gray-800",
                            };
                          default:
                            return {
                              text: statusName,
                              color: "bg-gray-100 text-gray-800",
                            };
                        }
                      };

                      const statusProps = getStatusProperties(
                        transaction.transactionStatus.name
                      );

                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {transaction.event.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.event.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {transaction.user?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.user?.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="font-medium">
                              {formatCurrency(transaction.totalPrice)}
                            </div>
                            {transaction.totalDiscount > 0 && (
                              <div className="text-xs text-green-600">
                                -{formatCurrency(transaction.totalDiscount)}{" "}
                                discount
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusProps.color}`}
                            >
                              {statusProps.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(
                              new Date(transaction.createdAt),
                              "dd MMM yyyy, HH:mm",
                              { locale: indonesian }
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleViewProof(transaction.paymentProof)
                                }
                                disabled={!transaction.paymentProof}
                              >
                                View Proof
                              </Button>
                              {transaction.transactionStatus.name ===
                                "WaitingForAdminConfirmation" && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleAccept(transaction.id)}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleReject(transaction.id)}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          {processedTransactions.length > 0 && (
            <CardFooter className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(
                    startIndex + itemsPerPage,
                    processedTransactions.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {processedTransactions.length}
                </span>{" "}
                transactions
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

      {/* Payment Proof Modal */}
      {selectedProof && (
        <PaymentProofModal
          imageUrl={selectedProof}
          onClose={() => setSelectedProof(null)}
        />
      )}
    </div>
  );
};

export default TransactionsPage;

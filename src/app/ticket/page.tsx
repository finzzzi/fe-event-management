"use client";

import { useEffect, useState } from "react";
import { UserTransaction } from "@/types/transaction";
import { transactionService } from "@/services/transactionService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import {
  Ticket,
  Calendar,
  MapPin,
  CreditCard,
  Filter,
  Clock,
} from "lucide-react";

const MyTicket = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    UserTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { token, isLoading, redirectToLogin } = useAuth();

  const statusMapping = {
    WaitingForPayment: {
      label: "Waiting for Payment",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    WaitingForAdminConfirmation: {
      label: "Waiting for Admin Confirmation",
      color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    Done: {
      label: "Done",
      color: "bg-green-100 text-green-800 border-green-300",
    },
    Rejected: {
      label: "Rejected",
      color: "bg-red-100 text-red-800 border-red-300",
    },
    Expired: {
      label: "Expired",
      color: "bg-gray-100 text-gray-800 border-gray-300",
    },
    Canceled: {
      label: "Canceled",
      color: "bg-orange-100 text-orange-800 border-orange-300",
    },
  };

  useEffect(() => {
    if (!isLoading && !token) {
      redirectToLogin("/ticket");
    }
  }, [token, isLoading, redirectToLogin]);

  useEffect(() => {
    fetchUserTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, statusFilter]);

  const fetchUserTransactions = async () => {
    try {
      const response = await transactionService.getUserTransactions();
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch user transactions:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch user transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    if (statusFilter === "all") {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter(
          (transaction) => transaction.transactionStatus.name === statusFilter
        )
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTicketClick = (transactionId: number) => {
    router.push(`/ticket/${transactionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header Skeleton */}
            <div className="mb-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-72 mb-6" />
              <Skeleton className="h-10 w-64" />
            </div>

            {/* Cards Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-64" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Ticket className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">My Ticket</h1>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-600" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter berdasarkan status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="WaitingForPayment">
                    Waiting for Payment
                  </SelectItem>
                  <SelectItem value="WaitingForAdminConfirmation">
                    Waiting for Admin Confirmation
                  </SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tickets List */}
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {statusFilter === "all"
                    ? "No Ticket"
                    : "No Ticket with this status"}
                </h3>
                <p className="text-gray-500">
                  {statusFilter === "all"
                    ? "You haven't bought any tickets yet. Start exploring interesting events!"
                    : "No tickets with the selected status."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <Card
                  key={transaction.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleTicketClick(transaction.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                          {transaction.event.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Purchased on {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <Badge
                        className={
                          statusMapping[transaction.transactionStatus.name]
                            .color
                        }
                      >
                        {
                          statusMapping[transaction.transactionStatus.name]
                            .label
                        }
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Event Info */}
                      <div className="flex items-start space-x-3">
                        <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-800">
                            Event Date
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(transaction.event.startDate)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(transaction.event.startDate)}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-800">Location</p>
                          <p className="text-sm text-gray-600">
                            {transaction.event.location}
                          </p>
                        </div>
                      </div>

                      {/* Price & Quantity */}
                      <div className="flex items-start space-x-3">
                        <CreditCard className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-800">
                            Total Payment
                          </p>
                          <p className="text-sm text-gray-600">
                            Rp{transaction.totalPrice.toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.quantity} ticket
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Proof Status */}
                    {transaction.transactionStatus.name ===
                      "WaitingForPayment" && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <p className="text-sm text-yellow-800">
                              Waiting for payment - Click to upload payment
                              proof
                            </p>
                          </div>
                          <CountdownTimer
                            createdAt={transaction.createdAt}
                            onExpire={() => {
                              toast.warning(
                                "Payment time has expired. Transaction will be automatically canceled."
                              );
                            }}
                          />
                          <p className="text-xs text-yellow-700">
                            ⚠️ Upload payment proof in 2 hours or transaction
                            will be automatically canceled
                          </p>
                        </div>
                      </div>
                    )}

                    {transaction.transactionStatus.name ===
                      "WaitingForAdminConfirmation" && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <p className="text-sm text-blue-800">
                            Payment proof has been uploaded, waiting for admin
                            confirmation
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTicket;

"use client";

import { useEffect, useState, useRef } from "react";
import { UserTransaction } from "@/types/transaction";
import { transactionService } from "@/services/transactionService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Ticket,
  Calendar,
  MapPin,
  CreditCard,
  Upload,
  FileImage,
  CheckCircle,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const TicketDetailPage = ({ params }: Props) => {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [transaction, setTransaction] = useState<UserTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    fetchTransactionDetail();
  }, []);

  const fetchTransactionDetail = async () => {
    try {
      const response = await transactionService.getUserTransactions();
      const transaction = response.data.find((t) => t.id === parseInt(id));

      if (!transaction) {
        toast.error("Ticket not found");
        router.push("/ticket");
        return;
      }

      setTransaction(transaction);
    } catch (error) {
      console.error("Failed to fetch transaction detail:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch transaction detail"
      );
      router.push("/ticket");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error("File must be in JPG, JPEG, or PNG format");
        return;
      }

      if (file.size > maxSize) {
        toast.error("Maximum file size is 5MB");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadPaymentProof = async () => {
    if (!selectedFile) {
      toast.error("Select payment proof file first");
      return;
    }

    setUploading(true);
    try {
      await transactionService.uploadPaymentProof(id, selectedFile);
      toast.success("Payment proof uploaded successfully");

      // Refresh data
      await fetchTransactionDetail();
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to upload payment proof:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload payment proof"
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header Skeleton */}
            <div className="mb-8">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Ticket Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The ticket you are looking for is not available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {transaction.event.name}
                </h1>
                <div className="flex items-center space-x-3">
                  <Badge
                    className={
                      statusMapping[transaction.transactionStatus.name].color
                    }
                  >
                    {statusMapping[transaction.transactionStatus.name].label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-800">Start Date</p>
                        <p className="text-gray-600">
                          {formatDate(transaction.event.startDate)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTime(transaction.event.startDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-800">End Date</p>
                        <p className="text-gray-600">
                          {formatDate(transaction.event.endDate)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTime(transaction.event.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">Location</p>
                      <p className="text-gray-600">
                        {transaction.event.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Payment Proof */}
              {transaction.transactionStatus.name === "WaitingForPayment" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800 flex items-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Payment Proof
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-2">
                            Upload Requirements:
                          </p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Accepted formats: JPEG, PNG, PDF</li>
                            <li>Maximum file size: 5MB</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-proof">
                        Select Payment Proof File
                      </Label>
                      <Input
                        id="payment-proof"
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                      />
                    </div>

                    {selectedFile && (
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                        <FileImage className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          {selectedFile.name}
                        </span>
                      </div>
                    )}

                    <Button
                      onClick={handleUploadPaymentProof}
                      disabled={!selectedFile || uploading}
                      className="w-full"
                    >
                      {uploading ? (
                        "Mengupload..."
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Payment Proof
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Payment Proof Uploaded */}
              {transaction.paymentProof && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Payment Proof Uploaded
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        Your payment proof has been uploaded and is waiting for
                        confirmation from the admin.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Event Info */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Event</p>
                    <p className="font-semibold text-gray-800">
                      {transaction.event.name}
                    </p>
                  </div>

                  <Separator />

                  {/* Quantity */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium">
                      {transaction.quantity} ticket
                    </span>
                  </div>

                  {/* Price per ticket */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per Ticket</span>
                    <span className="font-medium">
                      Rp{transaction.event.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      Rp
                      {(
                        transaction.event.price * transaction.quantity
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Discount */}
                  {transaction.totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">
                        -Rp{transaction.totalDiscount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Payment</span>
                    <span className="text-blue-600">
                      Rp{transaction.totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <Separator />

                  {/* Order Date */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Date</p>
                    <p className="text-gray-800">
                      {formatDate(transaction.createdAt)}
                    </p>
                    <p className="text-gray-800">
                      {formatTime(transaction.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;

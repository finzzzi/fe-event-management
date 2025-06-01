"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { transactionService } from "@/services/transactionService";
import { TransactionDetailResponse } from "@/types/transaction";
import { toast } from "sonner";
import { Ticket, Gift, AlertCircle } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

type TransactionData = TransactionDetailResponse["data"];

const TransactionDetailPage = ({ params }: Props) => {
  const { id } = use(params);
  const router = useRouter();
  const [transactionData, setTransactionData] =
    useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);

  // discount states
  const [usePoints, setUsePoints] = useState(false);
  const [pointsAmount, setPointsAmount] = useState(0);
  const [useVoucher, setUseVoucher] = useState(false);
  const [useCoupon, setUseCoupon] = useState(false);

  const [currentTotalDiscount, setCurrentTotalDiscount] = useState(0);
  const [currentFinalPrice, setCurrentFinalPrice] = useState(0);

  const fetchTransactionData = async () => {
    try {
      const response = await transactionService.getTransaction(id);
      setTransactionData(response.data);
      setCurrentFinalPrice(
        response.data.transaction.totalPrice -
          response.data.transaction.totalDiscount
      );
      setCurrentTotalDiscount(response.data.transaction.totalDiscount);

      // load saved checkbox states from local storage
      loadCheckboxStates();
    } catch (error) {
      console.error("Failed to fetch transaction:", error);
      toast.error("Failed to load transaction data");
    } finally {
      setLoading(false);
    }
  };

  // helper function to calculate subtotal
  const getSubtotal = () => {
    if (!transactionData) return 0;
    return transactionData.event.price * transactionData.transaction.quantity;
  };

  // helper function to calculate total discount from coupon, voucher, and points
  const getTotalDiscount = () => {
    if (!transactionData) return 0;

    let totalDiscount = 0;

    if (useCoupon && transactionData.availableDiscounts.coupon) {
      totalDiscount += transactionData.availableDiscounts.coupon.nominal;
    }

    if (useVoucher && transactionData.availableDiscounts.voucher) {
      totalDiscount += transactionData.availableDiscounts.voucher.nominal;
    }

    if (usePoints && pointsAmount > 0) {
      totalDiscount += pointsAmount;
    }

    return totalDiscount;
  };

  // helper function to calculate discount from coupon and voucher (without points)
  const getOtherDiscounts = () => {
    if (!transactionData) return 0;

    let otherDiscounts = 0;

    if (useCoupon && transactionData.availableDiscounts.coupon) {
      otherDiscounts += transactionData.availableDiscounts.coupon.nominal;
    }

    if (useVoucher && transactionData.availableDiscounts.voucher) {
      otherDiscounts += transactionData.availableDiscounts.voucher.nominal;
    }

    return otherDiscounts;
  };

  const getStorageKey = () => `transaction-${id}-checkboxes`;

  const getCheckboxStates = () => ({
    usePoints,
    pointsAmount,
    useVoucher,
    useCoupon,
  });

  // function to save checkbox states to local storage
  const saveCheckboxStates = () => {
    localStorage.setItem(getStorageKey(), JSON.stringify(getCheckboxStates()));
  };

  // function to load checkbox states from local storage
  const loadCheckboxStates = () => {
    try {
      const savedStates = localStorage.getItem(getStorageKey());
      if (savedStates) {
        const states = JSON.parse(savedStates);
        setUsePoints(states.usePoints || false);
        setPointsAmount(states.pointsAmount || 0);
        setUseVoucher(states.useVoucher || false);
        setUseCoupon(states.useCoupon || false);
      }
    } catch (error) {
      console.error("Failed to load checkbox states:", error);
    }
  };

  // function to calculate discount real-time on the frontend
  const calculateDiscounts = () => {
    if (!transactionData) return;

    const totalDiscount = getTotalDiscount();
    const finalPrice = Math.max(0, getSubtotal() - totalDiscount);

    setCurrentTotalDiscount(totalDiscount);
    setCurrentFinalPrice(finalPrice);
  };

  // function to get maximum points that can be used
  const getMaximumPoints = () => {
    if (!transactionData) return 0;

    const otherDiscounts = getOtherDiscounts();
    const remainingPrice = Math.max(0, getSubtotal() - otherDiscounts);

    // maximum points is the smallest of: available points, maxUsage, remaining price
    return Math.min(
      transactionData.availableDiscounts.points.available,
      remainingPrice
    );
  };

  const hasUnappliedDiscounts = () => {
    const hasSelectedDiscounts =
      useCoupon || useVoucher || (usePoints && pointsAmount > 0);
    return hasSelectedDiscounts && !isDiscountApplied;
  };

  // useEffect to calculate discounts automatically when there is a change
  useEffect(() => {
    if (transactionData) {
      calculateDiscounts();
    }
  }, [useCoupon, useVoucher, usePoints, pointsAmount, transactionData]);

  // useEffect to reset points amount if it exceeds the maximum
  useEffect(() => {
    if (transactionData && usePoints) {
      const maxPoints = getMaximumPoints();
      if (pointsAmount > maxPoints) {
        setPointsAmount(maxPoints);
      }
    }
  }, [useCoupon, useVoucher, transactionData]);

  // useEffect to reset discount applied when checkbox is changed
  useEffect(() => {
    setIsDiscountApplied(false);
  }, [useCoupon, useVoucher, usePoints, pointsAmount]);

  // useEffect to save checkbox states to local storage
  useEffect(() => {
    if (transactionData) {
      saveCheckboxStates();
    }
  }, [usePoints, pointsAmount, useVoucher, useCoupon, transactionData]);

  useEffect(() => {
    fetchTransactionData();
  }, []);

  const handleApplyDiscount = async () => {
    if (!transactionData) return;

    try {
      const response = await transactionService.applyDiscount(id, {
        use_points: usePoints,
        points_amount: usePoints ? pointsAmount : undefined,
        use_voucher: useVoucher,
        use_coupon: useCoupon,
      });

      setCurrentTotalDiscount(response.data.totalDiscount);
      setCurrentFinalPrice(response.data.finalPrice);
      setIsDiscountApplied(true);
      toast.success("Discount applied successfully!");
    } catch (error) {
      console.error("Failed to apply discount:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to apply discount"
      );
    }
  };

  const handleConfirmPayment = async () => {
    if (!transactionData) return;

    try {
      await transactionService.confirmTransaction(id, {
        use_points: usePoints,
        points_amount: usePoints ? pointsAmount : undefined,
        use_voucher: useVoucher,
        use_coupon: useCoupon,
      });

      // remove saved states after transaction is successful
      localStorage.removeItem(getStorageKey());

      toast.success("Transaction created! Please upload payment proof.");
      router.push(`/transaction/${id}/payment-proof`);
    } catch (error) {
      console.error("Failed to confirm transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm transaction"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!transactionData) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Transaction Not Found
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Transaction Details
            </h1>
          </div>

          {/* transaction info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-blue-600" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Event:</span>
                <span className="font-semibold">
                  {transactionData.event.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Quantity:</span>
                <span>{transactionData.transaction.quantity} tickets</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  Price per ticket:
                </span>
                <span>
                  Rp{transactionData.event.price.toLocaleString("id-ID")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Subtotal:</span>
                <span className="font-semibold">
                  Rp
                  {getSubtotal().toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">Total Discount:</span>
                <span className="font-semibold">
                  -Rp{currentTotalDiscount.toLocaleString("id-ID")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-gray-800">Final Price:</span>
                <span className="font-bold text-blue-600">
                  Rp{currentFinalPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Available Discounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                Available Discounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Coupon */}
              {transactionData.availableDiscounts.coupon && (
                <div className="flex items-center space-x-3">
                  <Checkbox
                    className="cursor-pointer"
                    id="use-coupon"
                    checked={useCoupon}
                    onCheckedChange={(checked: boolean) =>
                      setUseCoupon(checked)
                    }
                  />
                  <Label
                    htmlFor="use-coupon"
                    className="flex items-center gap-2 flex-1"
                  >
                    <div>
                      <div className="font-medium">Coupon: Bonus Referral</div>
                      <div className="text-sm text-gray-600">
                        Discount: Rp
                        {transactionData.availableDiscounts.coupon.nominal.toLocaleString(
                          "id-ID"
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              )}

              {/* Voucher */}
              {transactionData.availableDiscounts.voucher && (
                <div className="flex items-center space-x-3">
                  <Checkbox
                    className="cursor-pointer"
                    id="use-voucher"
                    checked={useVoucher}
                    onCheckedChange={(checked: boolean) =>
                      setUseVoucher(checked)
                    }
                  />
                  <Label
                    htmlFor="use-voucher"
                    className="flex items-center gap-2 flex-1"
                  >
                    <div>
                      <div className="font-medium">
                        Voucher:{" "}
                        {transactionData.availableDiscounts.voucher.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Discount: Rp
                        {transactionData.availableDiscounts.voucher.nominal.toLocaleString(
                          "id-ID"
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              )}

              {/* Points */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  className="cursor-pointer"
                  id="use-points"
                  checked={usePoints}
                  onCheckedChange={(checked: boolean) => {
                    setUsePoints(checked);
                    if (!checked) setPointsAmount(0);
                  }}
                  disabled={
                    transactionData.availableDiscounts.points.available === 0
                  }
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="use-points"
                      className="flex items-center gap-2"
                    >
                      Use Points
                    </Label>
                    <Badge variant="secondary">
                      {transactionData.availableDiscounts.points.available.toLocaleString(
                        "id-ID"
                      )}{" "}
                      available
                    </Badge>
                  </div>
                  {usePoints && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="points-amount"
                        className="text-sm text-gray-600"
                      >
                        Amount of points to use:
                      </Label>
                      <Input
                        id="points-amount"
                        type="number"
                        min="0"
                        max={getMaximumPoints()}
                        value={pointsAmount}
                        onChange={(e) =>
                          setPointsAmount(parseInt(e.target.value) || 0)
                        }
                        placeholder="Enter points amount"
                      />
                      <p className="text-xs text-gray-500">
                        Maximum: {getMaximumPoints().toLocaleString("id-ID")}{" "}
                        points
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleApplyDiscount}
              variant="outline"
              className="flex-1"
            >
              Apply Discount
            </Button>
            <Button
              onClick={handleConfirmPayment}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={hasUnappliedDiscounts()}
            >
              Pay Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailPage;

"use client";

import { useEffect, useState } from "react";
import { Event } from "@/types/event";
import { use } from "react";
import {
  Calendar,
  MapPin,
  Users,
  User,
  Banknote,
  Clock,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { transactionService } from "@/services/transactionService";
import { userService } from "@/services/userService";
import { UserProfileResponse } from "@/types/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

const DetailEventPage = ({ params }: Props) => {
  const { id } = use(params);
  const { token, redirectToLogin } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<
    UserProfileResponse["data"] | null
  >(null);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsAmount, setPointsAmount] = useState(0);
  const [useCoupon, setUseCoupon] = useState(false);
  const [useVoucher, setUseVoucher] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/detail/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch event");
      const data: Event = await res.json();
      setEvent(data);
    } catch (error) {
      console.error("Failed to fetch event:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!token) return;

    try {
      const response = await userService.getUserProfile();
      setUserProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  useEffect(() => {
    if (event && event.vouchers && !isVoucherValid(event.vouchers)) {
      setUseVoucher(false);
    }
  }, [event]);

  const handleBuyTicket = async () => {
    // check if user is logged in
    if (!token) {
      setShowDialog(true);
      return;
    }

    // fetch user profile
    if (!userProfile) {
      await fetchUserProfile();
    }

    setShowDialog(true);
  };

  const calculateTotalPrice = () => {
    if (!event) return 0;

    const basePrice = event.price * quantity;
    let discount = 0;

    // calculate points discount
    if (usePoints && pointsAmount > 0) {
      discount += pointsAmount;
    }

    // calculate coupon discount
    if (useCoupon && userProfile?.coupons && userProfile.coupons.length > 0) {
      discount += userProfile.coupons[0].nominal;
    }

    // calculate voucher discount
    if (useVoucher && event.vouchers) {
      discount += event.vouchers.nominal;
    }

    return Math.max(basePrice - discount, 0);
  };

  const handleConfirmPurchase = async () => {
    if (!event || !token) return;

    setIsProcessing(true);

    try {
      const requestData = {
        eventId: parseInt(id),
        quantity: quantity,
        use_points: usePoints,
        points_amount: usePoints ? pointsAmount : 0,
        use_coupon: useCoupon,
        use_voucher: useVoucher,
      };

      const response = await transactionService.createTransaction(requestData);

      toast.success(
        "Transaksi berhasil dibuat! Silakan upload bukti pembayaran."
      );

      // navigate to payment proof upload page
      router.push(`/transaction/${response.data.transactionId}/payment-proof`);
    } catch (error) {
      console.error("Failed to create transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create transaction"
      );
    } finally {
      setIsProcessing(false);
      setShowDialog(false);
    }
  };

  const resetDialog = () => {
    setUsePoints(false);
    setPointsAmount(0);
    setUseCoupon(false);
    setUseVoucher(false);
    setShowDialog(false);
  };

  const isVoucherValid = (voucher: Event["vouchers"]) => {
    if (!voucher) return false;
    const now = new Date();
    const endDate = new Date(voucher.endDate);
    return endDate > now && voucher.quota > 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
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

  const totalPrice = (event?.price || 0) * quantity;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        {/* Hero Section Skeleton */}
        <div className="bg-blue-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 mb-4">
                <Skeleton className="h-5 w-5 bg-blue-700" />
                <Skeleton className="h-6 w-24 bg-blue-700" />
              </div>
              <Skeleton className="h-12 w-3/4 mb-4 bg-blue-700" />
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5 bg-blue-700" />
                  <Skeleton className="h-4 w-32 bg-blue-700" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5 bg-blue-700" />
                  <Skeleton className="h-4 w-28 bg-blue-700" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date & Time Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <Skeleton className="h-5 w-5 mt-1" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Skeleton className="h-5 w-5 mt-1" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>

                  {/* Location Skeleton */}
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-5 w-5 mt-1" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>

                  {/* Description Skeleton */}
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-2" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Skeleton */}
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Skeleton className="h-4 w-24 mx-auto mb-2" />
                    <Skeleton className="h-6 w-32 mx-auto" />
                  </div>

                  {/* Quantity Input Skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-3 w-28 mx-auto" />
                  </div>

                  {/* Total Price Skeleton */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col justify-between items-center space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  </div>

                  {/* Buy Button Skeleton */}
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Event Not Found
            </h2>
            <p className="text-gray-600">
              The event you are looking for is not available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <div className="bg-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="h-5 w-5" />
              <span className="bg-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {event.category.name}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-blue-100">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span>By {event.organizer.name}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>{event.quota} seats available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800">
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
                        {formatDate(event.startDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatTime(event.startDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-800">End Date</p>
                      <p className="text-gray-600">
                        {formatDate(event.endDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatTime(event.endDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Location</p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Event Description
                  </h3>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Ticket Purchase */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center">
                  <Banknote className="h-5 w-5 mr-2 text-blue-600" />
                  Buy Ticket
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Price per ticket</p>
                  <p className="text-xl font-bold text-blue-800">
                    Rp{event.price.toLocaleString("id-ID")}
                  </p>
                </div>

                {/* Quantity Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="quantity"
                    className="text-sm font-medium text-gray-700"
                  >
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={event.quota}
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value) || value < 1) {
                        setQuantity(1);
                      } else {
                        setQuantity(value);
                      }
                    }}
                    className="text-center text-lg font-semibold"
                  />
                  <p className="text-xs text-gray-500 text-center">
                    Maximum {event.quota} tickets
                  </p>
                </div>

                {/* Total Price */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col justify-between items-center">
                    <span className="text-gray-600">
                      Total ({quantity} tickets):
                    </span>
                    <span className="text-3xl font-bold text-gray-800">
                      Rp{totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Buy Button */}
                <Button
                  className="w-full bg-blue-800 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                  size="lg"
                  onClick={handleBuyTicket}
                >
                  Buy Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showDialog && !token && (
        <Dialog open={showDialog} onOpenChange={resetDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Login Required</DialogTitle>
              <DialogDescription>
                You need to login first to buy tickets.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="blue"
                onClick={() => {
                  const currentUrl = window.location.pathname;
                  resetDialog();
                  redirectToLogin(currentUrl);
                }}
              >
                Login Now
              </Button>
              <Button variant="outline" onClick={resetDialog}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showDialog && token && (
        <Dialog open={showDialog} onOpenChange={resetDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Select the discount option you want to use
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Event Info */}
              <div className="space-y-2">
                <h4 className="font-medium">{event?.name}</h4>
                <p className="text-sm text-gray-600">
                  {quantity} tickets × Rp{event?.price.toLocaleString("id-ID")}
                </p>
                <p className="text-lg font-semibold">
                  Subtotal: Rp{totalPrice.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Points Option */}
              {userProfile?.points && userProfile.points.total > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-points"
                      checked={usePoints}
                      onCheckedChange={(checked) => {
                        setUsePoints(!!checked);
                        if (!checked) setPointsAmount(0);
                      }}
                    />
                    <Label htmlFor="use-points" className="text-sm font-medium">
                      Use Points (Available:{" "}
                      {userProfile.points.total.toLocaleString("id-ID")})
                    </Label>
                  </div>
                  {usePoints && (
                    <div className="ml-6">
                      <Label htmlFor="points-amount" className="text-sm">
                        Points Amount
                      </Label>
                      <Input
                        id="points-amount"
                        type="number"
                        min="0"
                        max={Math.min(userProfile.points.total, totalPrice)}
                        value={pointsAmount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          const maxPoints = Math.min(
                            userProfile.points.total,
                            totalPrice
                          );
                          setPointsAmount(Math.min(value, maxPoints));
                        }}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Coupon Option */}
              {userProfile?.coupons && userProfile.coupons.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-coupon"
                      checked={useCoupon}
                      onCheckedChange={(checked) => setUseCoupon(!!checked)}
                    />
                    <Label htmlFor="use-coupon" className="text-sm font-medium">
                      Use Coupon (Rp
                      {userProfile.coupons[0].nominal.toLocaleString("id-ID")})
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Valid until: {formatDate(userProfile.coupons[0].expiredAt)}
                  </p>
                </div>
              )}

              {/* Voucher Option */}
              {event.vouchers && isVoucherValid(event.vouchers) ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-voucher"
                      checked={useVoucher}
                      onCheckedChange={(checked) => setUseVoucher(!!checked)}
                    />
                    <Label
                      htmlFor="use-voucher"
                      className="text-sm font-medium"
                    >
                      Gunakan Voucher &quot;{event.vouchers.name}&quot; (Rp
                      {event.vouchers.nominal.toLocaleString("id-ID")})
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Valid until: {formatDate(event.vouchers.endDate)} | Quota:{" "}
                    {event.vouchers.quota}
                  </p>
                </div>
              ) : event.vouchers && !isVoucherValid(event.vouchers) ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-voucher"
                      checked={false}
                      disabled={true}
                    />
                    <Label
                      htmlFor="use-voucher"
                      className="text-sm font-medium text-gray-400"
                    >
                      Voucher &quot;{event.vouchers.name}&quot; is expired or
                      out of stock
                    </Label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-voucher"
                      checked={false}
                      disabled={true}
                    />
                    <Label
                      htmlFor="use-voucher"
                      className="text-sm font-medium text-gray-400"
                    >
                      No voucher available for this event
                    </Label>
                  </div>
                </div>
              )}

              {/* Price Calculation */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>Rp{totalPrice.toLocaleString("id-ID")}</span>
                </div>
                {usePoints && pointsAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Points Discount:</span>
                    <span>-Rp{pointsAmount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                {useCoupon &&
                  userProfile?.coupons &&
                  userProfile.coupons.length > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon Discount:</span>
                      <span>
                        -Rp
                        {userProfile.coupons[0].nominal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                {useVoucher && event.vouchers && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Voucher Discount:</span>
                    <span>
                      -Rp{event.vouchers.nominal.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total Payment:</span>
                  <span>Rp{calculateTotalPrice().toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPurchase}
                disabled={isProcessing}
                className="bg-blue-800 hover:bg-blue-700"
              >
                {isProcessing ? "Processing..." : "Pay Now"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DetailEventPage;

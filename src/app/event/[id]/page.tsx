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
import { useAuth } from "@/contexts/AuthContext";
import { transactionService } from "@/services/transactionService";
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleBuyTicket = async () => {
    // check if user is logged in
    if (!token) {
      toast.error("Please log in to purchase tickets");

      const currentUrl = window.location.pathname;
      redirectToLogin(currentUrl);
      return;
    }

    // create transaction
    try {
      const response = await transactionService.createTransaction({
        eventId: parseInt(id),
        quantity: quantity,
      });

      router.push(`/transaction/${response.data.id}`);
    } catch (error) {
      console.error("Failed to create transaction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create transaction"
      );
    }
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
                  Detail Event
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
    </div>
  );
};

export default DetailEventPage;

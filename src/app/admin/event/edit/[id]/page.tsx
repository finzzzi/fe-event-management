"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { EventCategory } from "@/types/event";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/loadingspinner";

export default function EditEventPage() {
  const { token, isLoading, redirectToLogin } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    categoryId: "",
    price: "",
    quota: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (!isLoading && !token) {
      redirectToLogin(`/admin/event/edit/${id}`);
    }

    const fetchData = async () => {
      try {
        setIsLoadingEvent(true);

        // Fetch categories
        const categoriesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/events/categories`
        );
        if (!categoriesRes.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);

        // Fetch event data
        const eventRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/events/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!eventRes.ok) {
          throw new Error("Failed to fetch event");
        }

        const eventData = await eventRes.json();
        setForm({
          name: eventData.name,
          description: eventData.description,
          location: eventData.location,
          categoryId: eventData.categoryId.toString(),
          price: eventData.price.toString(),
          quota: eventData.quota.toString(),
          startDate: eventData.startDate.slice(0, 10),
          endDate: eventData.endDate.slice(0, 10),
        });
      } catch (err) {
        console.error("Failed to fetch event:", err);
        toast.error("Could not load event");
      } finally {
        setIsLoadingEvent(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, isLoading, redirectToLogin, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCategoryChange = (value: string) => {
    setForm((prev) => ({ ...prev, categoryId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            categoryId: parseInt(form.categoryId),
            price: parseFloat(form.price),
            quota: parseInt(form.quota),
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update event");
      }

      toast.success("Event updated successfully!");
      router.push("/admin/event");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update event";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Event</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter event name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter event description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[100px] p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Enter event location"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (IDR)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="Enter price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quota">Quota</Label>
                  <Input
                    id="quota"
                    name="quota"
                    type="number"
                    placeholder="Enter quota"
                    value={form.quota}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <CardFooter className="p-0 pt-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="small" />
                      Updating...
                    </>
                  ) : (
                    "Update Event"
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

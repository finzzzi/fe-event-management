"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { EventCategory } from "@/types/event";

export default function EditEventPage() {
  const { token, isLoading, redirectToLogin } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [categories, setCategories] = useState<EventCategory[]>([]);
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

    const fetchEvent = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/events/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch event");
        }

        const data = await res.json();
        setForm({
          name: data.name,
          description: data.description,
          location: data.location,
          categoryId: data.categoryId.toString(),
          price: data.price.toString(),
          quota: data.quota.toString(),
          startDate: data.startDate.slice(0, 10),
          endDate: data.endDate.slice(0, 10),
        });
      } catch (err) {
        toast.error("Could not load event");
      }
    };

    const fetchCategories = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/categories`
      );
      const data = await res.json();
      setCategories(data);
    };

    if (token) {
      fetchEvent();
      fetchCategories();
    }
  }, [token, isLoading, redirectToLogin, id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      toast.success("Event updated!");
      router.push("/admin/event");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          name="name"
          placeholder="Event Name"
          value={form.name}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <input
          name="quota"
          type="number"
          placeholder="Quota"
          value={form.quota}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <input
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <input
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update
        </button>
      </form>
    </div>
  );
}

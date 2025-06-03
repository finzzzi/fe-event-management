"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EventCategory } from "@/types/event";

export default function CreateEventPage() {
  const { token, isLoading, redirectToLogin } = useAuth();
  const router = useRouter();

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
      redirectToLogin("/admin/event/create");
    }

    const fetchCategories = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/categories`
      );
      const data = await res.json();
      setCategories(data);
    };

    fetchCategories();
  }, [token, isLoading, redirectToLogin]);

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
        method: "POST",
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
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      toast.success("Event created successfully!");
      router.push("/event");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Event</h1>
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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create
        </button>
      </form>
    </div>
  );
}

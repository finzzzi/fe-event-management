import React, { useState, useEffect } from "react";
import { Voucher, EventOption } from "../../types/voucher";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface VoucherFormProps {
  voucher?: Voucher;
  onSuccess: () => void;
  events: EventOption[];
}

const VoucherForm: React.FC<VoucherFormProps> = ({
  voucher,
  onSuccess,
  events,
}) => {
  const [formData, setFormData] = useState({
    eventId: voucher?.eventId || "",
    name: voucher?.name || "",
    nominal: voucher?.nominal ? voucher.nominal.toString() : "",
    quota: voucher?.quota ? voucher.quota.toString() : "",
    startDate: voucher?.startDate ? new Date(voucher.startDate) : new Date(),
    endDate: voucher?.endDate ? new Date(voucher.endDate) : new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { token } = useAuth();

  useEffect(() => {
    if (voucher) {
      setFormData({
        eventId: voucher.eventId,
        name: voucher.name,
        nominal: voucher.nominal.toString(),
        quota: voucher.quota.toString(),
        startDate: new Date(voucher.startDate),
        endDate: new Date(voucher.endDate),
      });
    }
  }, [voucher]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.eventId) newErrors.eventId = "Event is required";
    if (!formData.name) newErrors.name = "Voucher name is required";
    if (!formData.nominal || parseInt(formData.nominal) <= 0)
      newErrors.nominal = "Nominal must be positive";
    if (!formData.quota || parseInt(formData.quota) <= 0)
      newErrors.quota = "Quota must be positive";
    if (formData.startDate >= formData.endDate)
      newErrors.endDate = "End date must be after start date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const url = voucher
        ? `${process.env.NEXT_PUBLIC_API_URL}/vouchers/${voucher.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/vouchers`;

      const method = voucher ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          nominal: parseInt(formData.nominal),
          quota: parseInt(formData.quota),
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save voucher");
      }

      toast.success(
        voucher
          ? "Voucher updated successfully"
          : "Voucher created successfully"
      );
      onSuccess();
    } catch (error) {
      console.error("Error saving voucher:", error);
      let errorMessage = "Failed to save voucher";

      // Handle different error types
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="eventId"
          className="block text-sm font-medium text-gray-700"
        >
          Event
        </label>
        <select
          id="eventId"
          value={formData.eventId}
          onChange={(e) =>
            setFormData({ ...formData, eventId: e.target.value })
          }
          className={`p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.eventId ? "border-red-500" : ""
          }`}
          disabled={!!voucher}
        >
          <option value="">Select an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name} ({new Date(event.startDate).toLocaleDateString()})
            </option>
          ))}
        </select>
        {errors.eventId && (
          <p className="mt-1 text-sm text-red-600">{errors.eventId}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Voucher Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.name ? "border-red-500" : ""
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="nominal"
            className="block text-sm font-medium text-gray-700"
          >
            Discount Amount (IDR)
          </label>
          <input
            type="number"
            id="nominal"
            value={formData.nominal}
            onChange={(e) =>
              setFormData({ ...formData, nominal: e.target.value })
            }
            className={`p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.nominal ? "border-red-500" : ""
            }`}
            min="1"
          />
          {errors.nominal && (
            <p className="mt-1 text-sm text-red-600">{errors.nominal}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="quota"
            className="block text-sm font-medium text-gray-700"
          >
            Usage Quota
          </label>
          <input
            type="number"
            id="quota"
            value={formData.quota}
            onChange={(e) =>
              setFormData({ ...formData, quota: e.target.value })
            }
            className={`p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.quota ? "border-red-500" : ""
            }`}
            min="1"
          />
          {errors.quota && (
            <p className="mt-1 text-sm text-red-600">{errors.quota}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <DatePicker
            selected={formData.startDate}
            onChange={(date: Date | null) =>
              setFormData({ ...formData, startDate: date! })
            }
            className={`p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.startDate ? "border-red-500" : ""
            }`}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
          />
        </div>

        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700"
          >
            End Date
          </label>
          <DatePicker
            selected={formData.endDate}
            onChange={(date: Date | null) =>
              setFormData({ ...formData, endDate: date! })
            }
            className={`p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.endDate ? "border-red-500" : ""
            }`}
            minDate={formData.startDate}
            dateFormat="dd/MM/yyyy"
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : voucher ? (
            "Update Voucher"
          ) : (
            "Create Voucher"
          )}
        </button>
      </div>
    </form>
  );
};

export default VoucherForm;

// src/components/admin/VoucherList.tsx
import React, { useState } from "react";
import { Voucher } from "../../types/voucher";
import { formatCurrency, formatDate } from "@/lib/format";
import VoucherForm from "./VoucherForm";
import { EventOption } from "../../types/voucher";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface VoucherListProps {
  vouchers: Voucher[];
  events: EventOption[];
  onRefresh: () => void;
}

const VoucherList: React.FC<VoucherListProps> = ({
  vouchers,
  events,
  onRefresh,
}) => {
  const [editingVoucher, setEditingVoucher] = useState<Voucher | undefined>();
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingVoucher(undefined);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    onRefresh();
  };

  const handleDelete = async (voucherId: number) => {
    if (window.confirm("Are you sure you want to delete this voucher?")) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vouchers/${voucherId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete voucher");
        }

        toast.success("Voucher marked as deleted");
        onRefresh();
      } catch (error: any) {
        console.error("Error deleting voucher:", error);
        toast.error(error.message || "Failed to delete voucher");
      }
    }
  };

  const getStatus = (voucher: Voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    if (voucher.deletedAt) return "Deleted";
    if (now < startDate) return "Scheduled";
    if (now > endDate) return "Expired";
    return "Active";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Expired":
        return "bg-gray-100 text-gray-800";
      case "Deleted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Vouchers</h2>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create New Voucher
        </button>
      </div>

      {showForm ? (
        <VoucherForm
          voucher={editingVoucher}
          onSuccess={handleSuccess}
          events={events}
        />
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vouchers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No vouchers found. Create your first voucher!
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => {
                  const status = getStatus(voucher);
                  const statusColor = getStatusColor(status);

                  return (
                    <tr key={voucher.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {voucher.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {events.find((e) => e.id === voucher.eventId)?.name ||
                          "Unknown Event"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(voucher.nominal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {voucher.quota}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(voucher.startDate)} -{" "}
                        {formatDate(voucher.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {status !== "Deleted" && (
                          <button
                            onClick={() => handleEdit(voucher)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Edit
                          </button>
                        )}
                        {status === "Active" && (
                          <button
                            onClick={() => handleDelete(voucher.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VoucherList;

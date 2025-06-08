import React, { useState } from "react";
import PaymentProofModal from "./PaymentProofModal";
import { UserTransaction } from "../../types/transaction";

interface TransactionListProps {
  transactions: UserTransaction[];
  onAccept: (transactionId: number) => Promise<void>;
  onReject: (transactionId: number) => Promise<void>;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onAccept,
  onReject,
}) => {
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<
    Record<number, "accept" | "reject" | null>
  >({});

  const handleAccept = async (transactionId: number) => {
    setLoadingStates((prev) => ({ ...prev, [transactionId]: "accept" }));
    try {
      await onAccept(transactionId);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [transactionId]: null }));
    }
  };

  const handleReject = async (transactionId: number) => {
    setLoadingStates((prev) => ({ ...prev, [transactionId]: "reject" }));
    try {
      await onReject(transactionId);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [transactionId]: null }));
    }
  };

  const handleViewProof = (proofUrl: string | null) => {
    if (!proofUrl) {
      alert("No payment proof available");
      return;
    }
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const fullImageUrl = `${backendUrl}${proofUrl}`;
    setSelectedProof(fullImageUrl);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status display properties
  const getStatusProperties = (statusName: string) => {
    switch (statusName) {
      case "WaitingForPayment":
        return {
          text: "Waiting for Payment",
          color: "bg-yellow-100 text-yellow-800",
        };
      case "WaitingForAdminConfirmation":
        return {
          text: "Pending Confirmation",
          color: "bg-blue-100 text-blue-800",
        };
      case "Done":
        return { text: "Approved", color: "bg-green-100 text-green-800" };
      case "Rejected":
        return { text: "Rejected", color: "bg-red-100 text-red-800" };
      case "Expired":
        return { text: "Expired", color: "bg-gray-100 text-gray-800" };
      case "Canceled":
        return { text: "Canceled", color: "bg-gray-100 text-gray-800" };
      default:
        return { text: statusName, color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tickets
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
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
          {transactions.map((transaction) => {
            const statusProps = getStatusProperties(
              transaction.transactionStatus.name
            );

            return (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.event.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.event.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {transaction.user?.name || "Unknown User"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.user?.email || "No email"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="font-medium">
                    {formatCurrency(transaction.totalPrice)}
                  </div>
                  {transaction.totalDiscount > 0 && (
                    <div className="text-xs text-green-600">
                      -{formatCurrency(transaction.totalDiscount)} discount
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusProps.color}`}
                  >
                    {statusProps.text}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewProof(transaction.paymentProof)}
                    className="mr-2 text-indigo-600 hover:text-indigo-900"
                    disabled={!transaction.paymentProof}
                  >
                    View Proof
                  </button>
                  {transaction.transactionStatus.name ===
                    "WaitingForAdminConfirmation" && (
                    <>
                      <button
                        onClick={() => handleAccept(transaction.id)}
                        disabled={loadingStates[transaction.id] === "accept"}
                        className="mr-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        {loadingStates[transaction.id] === "accept"
                          ? "Processing..."
                          : "Accept"}
                      </button>
                      <button
                        onClick={() => handleReject(transaction.id)}
                        disabled={loadingStates[transaction.id] === "reject"}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                      >
                        {loadingStates[transaction.id] === "reject"
                          ? "Processing..."
                          : "Reject"}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedProof && (
        <PaymentProofModal
          imageUrl={selectedProof}
          onClose={() => setSelectedProof(null)}
        />
      )}
    </div>
  );
};

export default TransactionList;

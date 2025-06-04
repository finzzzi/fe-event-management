import React, { useEffect, useState } from "react";

interface PaymentProofModalProps {
  imageUrl: string;
  onClose: () => void;
}

const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  imageUrl,
  onClose,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setImageSrc(null);
      return;
    }

    // Handle full data URLs
    if (imageUrl.startsWith("data:image")) {
      setImageSrc(imageUrl);
      return;
    }

    // Handle base64 without prefix
    if (/^[a-zA-Z0-9+/]+={0,2}$/.test(imageUrl)) {
      // common image types
      const types = ["png", "jpg", "jpeg", "gif"];
      for (const type of types) {
        const testSrc = `data:image/${type};base64,${imageUrl}`;
        setImageSrc(testSrc);
        return;
      }
    }

    // Handle URL strings
    setImageSrc(imageUrl);
  }, [imageUrl]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">Payment Proof</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-auto">
          <img
            src={imageUrl}
            alt="Payment proof"
            className="w-full h-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              const parent = target.parentNode as HTMLElement;
              parent.innerHTML = `
                <div class="text-center p-8 text-red-500">
                  Failed to load payment proof image.<br>
                  <a href="${imageUrl}" target="_blank" class="text-indigo-600 underline">
                    Open in new tab
                  </a>
                </div>
              `;
            }}
          />
        </div>
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentProofModal;

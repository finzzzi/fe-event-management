"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { transactionService } from "@/services/transactionService";
import { toast } from "sonner";
import { Formik, Form, ErrorMessage, FormikHelpers } from "formik";
import {
  paymentProofSchema,
  PaymentProofFormValues,
} from "@/lib/validationSchemas";

interface Props {
  params: Promise<{ id: string }>;
}

const PaymentProofPage = ({ params }: Props) => {
  const { id } = use(params);
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handlePaymentProofSubmit = async (
    values: PaymentProofFormValues,
    { setSubmitting, setFieldError }: FormikHelpers<PaymentProofFormValues>
  ) => {
    try {
      if (!values.paymentProof) {
        setFieldError("paymentProof", "Please select a file first");
        return;
      }

      await transactionService.uploadPaymentProof(id, values.paymentProof);
      toast.success(
        <div className="flex flex-col">
          <span>Payment proof uploaded.</span>
          <span>Please wait for admin confirmation.</span>
        </div>
      );

      // redirect to ticket page
      setTimeout(() => {
        router.push("/ticket");
      }, 2000);
    } catch (error) {
      console.error("Failed to upload payment proof:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload payment proof";
      setFieldError("paymentProof", errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Upload Payment Proof
            </h1>
          </div>

          {/* Upload Card */}
          <Card>
            <CardContent className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Upload Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Accepted formats: JPEG, PNG, PDF</li>
                      <li>Maximum file size: 5MB</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Formik
                initialValues={{ paymentProof: null as File | null }}
                validationSchema={paymentProofSchema}
                onSubmit={handlePaymentProofSubmit}
              >
                {({ isSubmitting, setFieldValue }) => (
                  <Form className="space-y-4">
                    {/* File Input */}
                    <div className="space-y-4">
                      <Label
                        htmlFor="payment-proof"
                        className="text-sm font-medium"
                      >
                        Select Payment Proof File:
                      </Label>
                      <Input
                        id="payment-proof"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setFieldValue("paymentProof", file);
                          setSelectedFile(file);
                        }}
                        className="cursor-pointer"
                      />
                      <ErrorMessage
                        name="paymentProof"
                        component="div"
                        className="text-sm text-red-600"
                      />

                      {/* Selected file info */}
                      {selectedFile && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-700">
                                Selected: {selectedFile.name}
                              </p>
                              <p className="text-xs text-green-600">
                                Size:{" "}
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFile(null);
                                setFieldValue("paymentProof", null);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          Uploading...
                        </>
                      ) : (
                        <>Upload Payment Proof</>
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentProofPage;

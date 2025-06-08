"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import {
  resetPasswordConfirmSchema,
  ResetPasswordConfirmFormValues,
} from "@/lib/validationSchemas";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // validate token when component mounts
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error("Invalid reset password token");
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/validate?token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
        } else {
          toast.error(data.message || "Invalid or expired reset token");
        }
      } catch {
        toast.error("Failed to validate reset token");
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token, router]);

  const handleResetSubmit = async (
    values: ResetPasswordConfirmFormValues,
    {
      setSubmitting,
      setFieldError,
    }: FormikHelpers<ResetPasswordConfirmFormValues>
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            newPassword: values.newPassword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      const data = await response.json();
      toast.success(data.message || "Password has been reset successfully");

      // redirect to login after successful reset
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setFieldError("newPassword", errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // show loading while validating token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-muted-foreground mt-4">
              Validating reset token...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Invalid or Expired Token
            </h2>
            <p className="text-muted-foreground mb-6">
              Please request a new one.
            </p>
            <Button onClick={() => router.push("/login")} variant="blue">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
          </CardHeader>

          <CardContent>
            <Formik
              initialValues={{ newPassword: "", confirmPassword: "" }}
              validationSchema={resetPasswordConfirmSchema}
              onSubmit={handleResetSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Field
                      as={Input}
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="Enter your new password"
                    />
                    <ErrorMessage
                      name="newPassword"
                      component="div"
                      className="text-sm text-red-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Field
                      as={Input}
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                    />
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-sm text-red-600"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="blue"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Resetting Password..." : "Reset Password"}
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import {
  loginSchema,
  resetPasswordSchema,
  LoginFormValues,
  ResetPasswordFormValues,
} from "@/lib/validationSchemas";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { token, login } = useAuth();
  const router = useRouter();
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  // reset password states
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  useEffect(() => {
    // get return URL from localStorage
    const savedReturnUrl = localStorage.getItem("returnUrl");
    if (savedReturnUrl) {
      setReturnUrl(savedReturnUrl);
    }
  }, []);

  useEffect(() => {
    if (token) {
      router.push(returnUrl || "/");
      localStorage.removeItem("returnUrl");
    }
  }, [token]);

  const handleLoginSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      await login(values.email, values.password, returnUrl || undefined);
    } catch (err: Error | unknown) {
      toast.error(err instanceof Error ? err.message : "Error when logging in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (
    values: ResetPasswordFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ResetPasswordFormValues>
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: values.email }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        resetForm();
        setIsResetDialogOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to send reset password link");
      }
    } catch {
      toast.error("An error occurred while sending reset link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={handleLoginSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Welcome back!</h1>
                    <p className="text-muted-foreground text-balance">
                      Login to your EVENTIO account
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@example.com"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-sm text-red-600"
                    />
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Dialog
                        open={isResetDialogOpen}
                        onOpenChange={setIsResetDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="ml-auto text-sm underline-offset-2 hover:underline"
                          >
                            Forgot your password?
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                          </DialogHeader>
                          <Formik
                            initialValues={{ email: "" }}
                            validationSchema={resetPasswordSchema}
                            onSubmit={handleResetPassword}
                          >
                            {({ isSubmitting: isResetSubmitting }) => (
                              <Form className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="reset-email">Email</Label>
                                  <Field
                                    as={Input}
                                    id="reset-email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                  />
                                  <ErrorMessage
                                    name="email"
                                    component="div"
                                    className="text-sm text-red-600"
                                  />
                                </div>
                                <div className="flex gap-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsResetDialogOpen(false)}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    variant="blue"
                                    disabled={isResetSubmitting}
                                    className="flex-1"
                                  >
                                    {isResetSubmitting
                                      ? "Sending..."
                                      : "Reset Password"}
                                  </Button>
                                </div>
                              </Form>
                            )}
                          </Formik>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type="password"
                      placeholder="password"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-sm text-red-600"
                    />
                  </div>

                  <Button
                    variant="blue"
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Login"}
                  </Button>

                  <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <a
                      href="/register"
                      className="underline underline-offset-4"
                    >
                      Sign up
                    </a>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?q=80&w=2030&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Image"
              fill
              className="object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

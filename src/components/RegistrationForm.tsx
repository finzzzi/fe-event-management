"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { registerSchema, RegisterFormValues } from "@/lib/validationSchemas";

export function RegistrationForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { token, register } = useAuth();
  const router = useRouter();

  const handleRegisterSubmit = async (
    values: RegisterFormValues,
    { setSubmitting, setFieldError }: FormikHelpers<RegisterFormValues>
  ) => {
    try {
      await register(
        values.name,
        values.email,
        values.password,
        values.referral || undefined
      );
      router.push("/"); // Redirect to home page after successful registration
    } catch (err: Error | unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error when registering";
      setFieldError("email", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (token) {
      router.push("/");
    }
  }, [token]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Formik
            initialValues={{ name: "", email: "", password: "", referral: "" }}
            validationSchema={registerSchema}
            onSubmit={handleRegisterSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">
                      Create your <br /> EVENTIO account
                    </h1>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="name">Full name</Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-sm text-red-600"
                    />
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

                  <div className="grid gap-3">
                    <Label htmlFor="referral">Referral number (optional)</Label>
                    <Field
                      as={Input}
                      id="referral"
                      name="referral"
                      type="text"
                    />
                    <ErrorMessage
                      name="referral"
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
                    {isSubmitting ? "Signing up..." : "Sign up"}
                  </Button>

                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <a href="/login" className="underline underline-offset-4">
                      Sign in
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

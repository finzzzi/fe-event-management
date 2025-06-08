"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import {
  profileUpdateSchema,
  ProfileUpdateFormValues,
} from "@/lib/validationSchemas";

interface UserProfile {
  name: string;
  email: string;
}

interface UpdateProfileData {
  name: string;
  email?: string;
  password?: string;
}

const UserProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormValues, setPendingFormValues] =
    useState<ProfileUpdateFormValues | null>(null);
  const [pendingFormHelpers, setPendingFormHelpers] =
    useState<FormikHelpers<ProfileUpdateFormValues> | null>(null);
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showCancelEditDialog, setShowCancelEditDialog] = useState(false);
  const { token, isLoading, redirectToLogin } = useAuth();

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      setProfile(data);
      setEditForm({
        name: data.name,
        email: data.email,
        password: "",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (
    values: ProfileUpdateFormValues,
    helpers: FormikHelpers<ProfileUpdateFormValues>
  ) => {
    // Store form values and helpers for confirmation
    setPendingFormValues(values);
    setPendingFormHelpers(helpers);
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    if (!pendingFormValues || !pendingFormHelpers) return;

    const { setSubmitting, setFieldError } = pendingFormHelpers;
    setIsConfirmSubmitting(true);

    try {
      setError(null);
      setShowConfirmDialog(false);

      const updateData: UpdateProfileData = {
        name: pendingFormValues.name,
        email: pendingFormValues.email,
      };

      if (pendingFormValues.password && pendingFormValues.password.trim()) {
        updateData.password = pendingFormValues.password;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();
      setProfile(result.data);
      setIsEditing(false);
      setEditForm({
        name: result.data.name,
        email: result.data.email,
        password: "",
      });

      toast.success("Profile updated successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setFieldError("email", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConfirmSubmitting(false);
      setSubmitting(false);
      setPendingFormValues(null);
      setPendingFormHelpers(null);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmDialog(false);
    if (pendingFormHelpers) {
      pendingFormHelpers.setSubmitting(false);
    }
    setPendingFormValues(null);
    setPendingFormHelpers(null);
  };

  const handleCancelEditClick = () => {
    setShowCancelEditDialog(true);
  };

  const handleConfirmCancelEdit = () => {
    setShowCancelEditDialog(false);
    setIsEditing(false);
    setEditForm({
      name: profile?.name || "",
      email: profile?.email || "",
      password: "",
    });
    setError(null);
  };

  const handleResetPasswordClick = () => {
    setShowResetPasswordDialog(true);
  };

  const handleConfirmResetPassword = async () => {
    if (!profile?.email) {
      toast.error("No email found for reset password");
      return;
    }

    setResettingPassword(true);
    setShowResetPasswordDialog(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: profile.email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Reset link has been sent to your email");
      } else {
        toast.error(data.message || "Failed to send reset password link");
      }
    } catch {
      toast.error("An error occurred while sending reset link");
    } finally {
      setResettingPassword(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!isLoading && !token) {
      redirectToLogin("/profile");
    }
  }, [token, isLoading, redirectToLogin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-12 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
            </div>
            <Button onClick={fetchProfile} variant="blue">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Profile</CardTitle>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="blue"
                  size="sm"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                <p>{error}</p>
              </div>
            )}

            {!isEditing ? (
              // Display Mode
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Name</Label>
                  <div className="p-3 bg-muted rounded-md border">
                    <p className="text-foreground">{profile?.name}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display-email">Email</Label>
                  <div className="p-3 bg-muted rounded-md border">
                    <p className="text-foreground">{profile?.email}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">
                        Password
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Send a reset link to your email to change your password
                      </p>
                    </div>
                    <Button
                      onClick={handleResetPasswordClick}
                      disabled={resettingPassword}
                      variant="outline"
                      size="sm"
                    >
                      {resettingPassword ? "Sending..." : "Reset Password"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <Formik
                initialValues={{
                  name: editForm.name,
                  email: editForm.email,
                  password: "",
                }}
                validationSchema={profileUpdateSchema}
                onSubmit={handleFormSubmit}
                enableReinitialize
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Field
                        as={Input}
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-sm text-red-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Field
                        as={Input}
                        id="email"
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

                    <div className="space-y-2">
                      <Label htmlFor="password">New Password (Optional)</Label>
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Leave blank if you don't want to change password"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-sm text-red-600"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="blue"
                        size="lg"
                        className="flex-1"
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCancelEditClick}
                        disabled={isSubmitting}
                        variant="outline"
                        size="lg"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmation</DialogTitle>
              <DialogDescription>
                Are you sure you want to save the changes to your profile?
                {pendingFormValues?.password &&
                  pendingFormValues.password.trim() && (
                    <span className="block mt-2 text-orange-600 font-medium">
                      New password will be applied.
                    </span>
                  )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancelUpdate}
                disabled={isConfirmSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="blue"
                onClick={handleConfirmUpdate}
                disabled={isConfirmSubmitting}
              >
                {isConfirmSubmitting ? "Saving..." : "Yes, Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Confirmation Dialog */}
        <Dialog
          open={showResetPasswordDialog}
          onOpenChange={setShowResetPasswordDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password Confirmation</DialogTitle>
              <DialogDescription>
                Are you sure you want to reset your password? A reset link will
                be sent to your email address: <strong>{profile?.email}</strong>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowResetPasswordDialog(false)}
                disabled={resettingPassword}
              >
                Cancel
              </Button>
              <Button
                variant="blue"
                onClick={handleConfirmResetPassword}
                disabled={resettingPassword}
              >
                {resettingPassword ? "Sending..." : "Yes, Send Reset Link"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Edit Confirmation Dialog */}
        <Dialog
          open={showCancelEditDialog}
          onOpenChange={setShowCancelEditDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Editing</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel editing? Any unsaved changes
                will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCancelEditDialog(false)}
              >
                Continue Editing
              </Button>
              <Button variant="destructive" onClick={handleConfirmCancelEdit}>
                Yes, Cancel Editing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserProfilePage;

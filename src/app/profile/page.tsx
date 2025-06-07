"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  const [updating, setUpdating] = useState(false);

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

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

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

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUpdating(true);
      setError(null);

      const updateData: UpdateProfileData = {
        name: editForm.name,
        email: editForm.email,
      };

      if (editForm.password.trim()) {
        updateData.password = editForm.password;
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
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: profile?.name || "",
      email: profile?.email || "",
      password: "",
    });
    setError(null);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={updateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={editForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password (Optional)</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={editForm.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank if you don't want to change password"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={updating}
                    variant="blue"
                    size="lg"
                    className="flex-1"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    onClick={cancelEdit}
                    disabled={updating}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;

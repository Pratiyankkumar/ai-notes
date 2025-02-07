"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Add router import
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getUser, updateUser, deleteUser } from "@/api/queries/user";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  name: string;
  email: string;
  password: string;
}

export default function Page() {
  const router = useRouter(); // Initialize router
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User>({
    name: "John Doe",
    email: "john@example.com",
    password: "********",
  });

  const { data, isError } = useQuery("user", getUser);
  const updateMutation = useMutation(updateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries("user");
      alert("Profile updated successfully");
    },
    onError: (error) => {
      alert("Failed to update profile");
    },
  });

  const deleteMutation = useMutation(deleteUser, {
    onSuccess: () => {
      alert("Profile deleted successfully");
      router.push("/signup"); // Redirect to signup page
    },
    onError: (error) => {
      alert("Failed to delete profile");
    },
  });

  useEffect(() => {
    if (data) {
      setUser(data.data.user);
    }
  }, [data]);

  const [formData, setFormData] = useState<User>(data?.data.user || user);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUpdate = async () => {
    const updates: Partial<User> = {};

    if (formData.name !== user.name) updates.name = formData.name;
    if (formData.email !== user.email) updates.email = formData.email;
    if (formData.password !== "********") updates.password = formData.password;

    if (Object.keys(updates).length > 0) {
      try {
        await updateMutation.mutateAsync(updates);
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      alert("No changes were made to update");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      console.error("Error deleting profile:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>Please authentcate first</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {getInitials(user.name)}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="mt-1">{user.email}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {/* Update Profile Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Update Profile</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleUpdate}
                  disabled={updateMutation.isLoading}
                >
                  {updateMutation.isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogContent>
            </Dialog>

            {/* Delete Profile Alert Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Profile</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Profile"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useMutation } from "react-query";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import Link from "next/link";
import { signup } from "@/api/mutations/auth";
import { AxiosError } from "axios";
import { useAuth } from "@/contexts/AuthContext";
import Alert from "./Alert";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [stausCode, setStatusCode] = useState<number | null>();

  const { login } = useAuth();

  // React Query mutation for handling signup
  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      login(data.token);
    },
    onError: (error: AxiosError) => {
      console.error("Signup failed:", error.message);
      setStatusCode(error.status);
    },
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {mutation.isError && stausCode === 400 && (
        <Alert text="Email id is already taken" isError={true} />
      )}
      {mutation.isError && stausCode === 500 && (
        <Alert text="There was an error in server" isError={true} />
      )}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome !</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Please Enter details
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading
                    ? "Creating Account..."
                    : "Create Account"}
                </Button>
                {mutation.isError && (
                  <p className="text-red-500 text-center text-sm">
                    {mutation.error?.message || "Signup failed. Try again."}
                  </p>
                )}
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

"use client";

import { Home, Star, Menu, LogOut, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import type React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "react-query";
import { getUser } from "@/api/queries/user";
import { useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
  password: string;
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  // Mock user data - replace with your actual user data
  const { data } = useQuery("user", getUser);

  const [user, setUser] = useState<User>();

  useEffect(() => {
    if (data) {
      setUser(data.data.user);
    }
  }, [data]);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const { logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen justify-center w-full">
        {/* Collapsible Sidebar */}
        <Sidebar collapsible="offcanvas">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-600 text-white grid place-items-center">
                AI
              </div>
              <span className="font-semibold">AI Notes</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="flex flex-col h-full">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/home" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/favorite" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>Favourites</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {/* User Footer */}
            <div className="mt-auto border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-4 w-full hover:bg-accent transition-colors">
                    <Avatar>
                      <AvatarFallback>
                        {user && getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{user && user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user && user.email}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1">
          <header className="flex items-center p-4">
            {/* Mobile Menu Trigger */}
            <SidebarTrigger className="md:hidden">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
          </header>
          <main className="p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

"use client";

import { Home, Star, Search, SlidersHorizontal, Menu } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
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
import type React from "react";
import Link from "next/link";

export function MainLayout({ children }: { children: React.ReactNode }) {
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
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/" className="flex items-center gap-2">
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
          </SidebarContent>
        </Sidebar>

        <div className="flex-1">
          <header className="flex items-center gap-4 justify-center p-4">
            {/* Mobile Menu Trigger */}
            <SidebarTrigger className="md:hidden">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>

            <div className="flex-1 flex items-center gap-2 px-2 rounded-md border">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search"
                className="border-0 focus-visible:ring-0"
              />
            </div>
            <Button variant="ghost" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sr-only">Sort</span>
            </Button>
          </header>
          <main className="p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import * as React from "react";
import {
  Shield,
  Users,
  FileText,
  Activity,
  Settings,
  Home,
  Clock,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getUserData } from "@/lib/api";

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const userData = getUserData();

  const data = {
    user: {
      name: userData?.username || "Admin",
      email: userData?.email || "admin@example.com",
      avatar: "/avatars/admin.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/admin/dashboard#dashboard",
        icon: Home,
        isActive: true,
      },
      {
        title: "Download Requests",
        url: "#requests",
        icon: Clock,
        items: [
          {
            title: "Pending Requests",
            url: "#requests",
          },
          {
            title: "All Requests",
            url: "#all-requests",
          },
        ],
      },
      {
        title: "Files Management",
        url: "#files",
        icon: FileText,
        items: [
          {
            title: "All Files",
            url: "#files",
          },
          {
            title: "Approved Files",
            url: "#approved",
          },
          {
            title: "Rejected Files",
            url: "#rejected",
          },
        ],
      },
      {
        title: "User Management",
        url: "#users",
        icon: Users,
        items: [
          {
            title: "All Users",
            url: "#users",
          },
          {
            title: "Active Users",
            url: "#active-users",
          },
        ],
      },
      {
        title: "Audit Logs",
        url: "#logs",
        icon: Activity,
        items: [
          {
            title: "All Activities",
            url: "#logs",
          },
        ],
      },
      {
        title: "Settings",
        url: "#settings",
        icon: Settings,
        items: [
          {
            title: "Profile",
            url: "#profile",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Secure File Sharing</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} isAdmin={true} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

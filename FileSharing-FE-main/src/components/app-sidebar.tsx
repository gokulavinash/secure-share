import * as React from "react";
import {
  FileUp,
  FileDown,
  Shield,
  Activity,
  Settings,
  Home,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userData = getUserData();

  const data = {
    user: {
      name: userData?.username || "User",
      email: userData?.email || "user@example.com",
      avatar: "/avatars/user.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/user/dashboard#dashboard",
        icon: Home,
        isActive: true,
      },
      {
        title: "My Files",
        url: "#uploaded",
        icon: FileUp,
        items: [
          {
            title: "Uploaded Files",
            url: "#uploaded",
          },
          {
            title: "Upload New",
            url: "#upload",
          },
        ],
      },
      {
        title: "Received Files",
        url: "#received",
        icon: FileDown,
        items: [
          {
            title: "All Received",
            url: "#received",
          },
          {
            title: "Pending Approval",
            url: "#pending",
          },
        ],
      },
      {
        title: "Security",
        url: "#encryption",
        icon: Shield,
        items: [
          {
            title: "Encryption Key",
            url: "#encryption",
          },
        ],
      },
      {
        title: "Settings",
        url: "#profile",
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
            <span className="text-xs text-muted-foreground">
              Encrypted & Protected
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

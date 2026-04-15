import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Shield,
} from "lucide-react";
import { adminAPI, clearAuthData } from "@/lib/api";
import EncryptedSearchBar from "@/components/EncryptedSearchBar";
import Pagination from "@/components/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<any>(null);
  const [downloadRequests, setDownloadRequests] = useState<any[]>([]);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeView, setActiveView] = useState<string>("requests");
  const [activeTab, setActiveTab] = useState<string>("requests");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsPerPage, setRequestsPerPage] = useState(10);
  const [filesPage, setFilesPage] = useState(1);
  const [filesPerPage, setFilesPerPage] = useState(10);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);

  useEffect(() => {
    loadDashboardData();

    // Handle hash navigation
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setActiveView(hash);
        // Reset to first page when view changes
        setRequestsPage(1);
        setFilesPage(1);
        setUsersPage(1);
        setLogsPage(1);

        if (hash === "requests" || hash === "all-requests") {
          setActiveTab("requests");
        } else if (
          hash === "files" ||
          hash === "approved" ||
          hash === "rejected"
        ) {
          setActiveTab("files");
        } else if (
          hash === "users" ||
          hash === "active-users" ||
          hash === "inactive-users"
        ) {
          setActiveTab("users");
        } else if (
          hash === "logs" ||
          hash === "upload-logs" ||
          hash === "download-logs"
        ) {
          setActiveTab("logs");
        } else if (hash === "profile") {
          setActiveTab("profile");
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profile, requests, files, usersList, logs] = await Promise.all([
        adminAPI.getProfile(),
        adminAPI.getDownloadRequests(),
        adminAPI.getAllFiles(),
        adminAPI.getAllUsers(),
        adminAPI.getAuditLogs({ limit: 50 }),
      ]);

      setAdminData(profile.data);
      setDownloadRequests(requests.data);
      setAllFiles(files.data);
      setUsers(usersList.data);
      setAuditLogs(logs.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load dashboard");
      if (error.message.includes("token")) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    navigate("/admin/login");
  };

  const handleApprove = async (fileId: string, fileName: string) => {
    try {
      await adminAPI.approveDownload(fileId);
      toast.success(`Approved download for "${fileName}"`);
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve");
    }
  };

  const handleRejectClick = (file: any) => {
    setSelectedFile(file);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await adminAPI.rejectDownload(selectedFile.id, rejectionReason);
      toast.success(`Rejected download for "${selectedFile.originalFileName}"`);
      setRejectDialogOpen(false);
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "not_requested":
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Requested
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getActionBadge = (action: string) => {
    const colors: any = {
      upload: "bg-blue-500",
      download: "bg-green-500",
      approve: "bg-emerald-500",
      reject: "bg-red-500",
      key_generate: "bg-purple-500",
      key_update: "bg-indigo-500",
    };
    return <Badge className={colors[action] || "bg-gray-500"}>{action}</Badge>;
  };

  const getFilteredFiles = () => {
    if (showSearchResults && activeTab === "files") {
      return searchResults;
    }
    if (activeView === "approved") {
      return allFiles.filter((f) => f.downloadRequestStatus === "approved");
    } else if (activeView === "rejected") {
      return allFiles.filter((f) => f.downloadRequestStatus === "rejected");
    }
    return allFiles;
  };

  const getFilteredUsers = () => {
    if (showSearchResults && activeTab === "users") {
      return searchResults;
    }
    if (activeView === "active-users") {
      return users.filter((u) => u.isActive);
    } else if (activeView === "inactive-users") {
      return users.filter((u) => !u.isActive);
    }
    return users;
  };

  const getFilteredLogs = () => {
    if (activeView === "upload-logs") {
      return auditLogs.filter((log) => log.action === "upload");
    } else if (activeView === "download-logs") {
      return auditLogs.filter((log) => log.action === "download");
    }
    return auditLogs;
  };

  const handleFileSearch = async (query: string) => {
    try {
      setIsSearching(true);
      setSearchQuery(query);

      const response = await adminAPI.searchFiles(query);

      setSearchResults(response.data || []);
      setShowSearchResults(true);
      toast.success(`Found ${response.count || 0} file(s)`);
    } catch (error: any) {
      toast.error(error.message || "Search failed");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSearch = async (query: string) => {
    try {
      setIsSearching(true);
      setSearchQuery(query);

      const response = await adminAPI.searchUsers(query);

      setSearchResults(response.data || []);
      setShowSearchResults(true);
      toast.success(`Found ${response.count || 0} user(s)`);
    } catch (error: any) {
      toast.error(error.message || "Search failed");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Paginated data
  const getPaginatedRequests = () => {
    const startIndex = (requestsPage - 1) * requestsPerPage;
    const endIndex = startIndex + requestsPerPage;
    return downloadRequests.slice(startIndex, endIndex);
  };

  const getPaginatedFiles = () => {
    const filtered = getFilteredFiles();
    const startIndex = (filesPage - 1) * filesPerPage;
    const endIndex = startIndex + filesPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getPaginatedUsers = () => {
    const filtered = getFilteredUsers();
    const startIndex = (usersPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getPaginatedLogs = () => {
    const filtered = getFilteredLogs();
    const startIndex = (logsPage - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getBreadcrumbText = () => {
    switch (activeView) {
      case "requests":
        return "Pending Requests";
      case "all-requests":
        return "All Requests";
      case "files":
        return "All Files";
      case "approved":
        return "Approved Files";
      case "rejected":
        return "Rejected Files";
      case "users":
        return "All Users";
      case "active-users":
        return "Active Users";
      case "inactive-users":
        return "Inactive Users";
      case "logs":
        return "All Activities";
      case "upload-logs":
        return "Upload Activities";
      case "download-logs":
        return "Download Activities";
      case "profile":
        return "Admin Profile";
      default:
        return "Dashboard";
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/dashboard">
                    Admin Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getBreadcrumbText()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Stats Cards */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {downloadRequests.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {allFiles.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In the system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {users.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {auditLogs.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Audit logs</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          {activeTab === "profile" ? (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl">Admin Profile</CardTitle>
                <CardDescription>
                  Your account information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">
                      {adminData?.username}
                    </h3>
                    <p className="text-muted-foreground">{adminData?.email}</p>
                    <Badge className="bg-purple-600">Administrator</Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Username
                    </Label>
                    <p className="text-lg">{adminData?.username}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Email
                    </Label>
                    <p className="text-lg">{adminData?.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Account Created
                    </Label>
                    <p className="text-lg">
                      {adminData?.createdAt
                        ? new Date(adminData.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Last Login
                    </Label>
                    <p className="text-lg">
                      {adminData?.lastLogin
                        ? new Date(adminData.lastLogin).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Account Statistics</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Approvals
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {
                            allFiles.filter(
                              (f) => f.downloadRequestStatus === "approved"
                            ).length
                          }
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Rejections
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          {
                            allFiles.filter(
                              (f) => f.downloadRequestStatus === "rejected"
                            ).length
                          }
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Pending Reviews
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {downloadRequests.length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="requests">
                  <Clock className="w-4 h-4 mr-2" />
                  Requests ({downloadRequests.length})
                </TabsTrigger>
                <TabsTrigger value="files">
                  <FileText className="w-4 h-4 mr-2" />
                  Files ({allFiles.length})
                </TabsTrigger>
                <TabsTrigger value="users">
                  <Users className="w-4 h-4 mr-2" />
                  Users ({users.length})
                </TabsTrigger>
                <TabsTrigger value="logs">
                  <Activity className="w-4 h-4 mr-2" />
                  Audit Logs
                </TabsTrigger>
              </TabsList>

              {/* Download Requests Tab */}
              <TabsContent value="requests" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Download Requests</CardTitle>
                    <CardDescription>
                      Review and approve/reject download requests from users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {downloadRequests.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        No pending requests
                      </div>
                    ) : (
                      <>
                      <div className="space-y-4">
                        {getPaginatedRequests().map((file) => (
                          <Card key={file.id} className="border-orange-200">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    {file.originalFileName}
                                  </CardTitle>
                                  <CardDescription className="mt-2 space-y-1">
                                    <div>
                                      <strong>Sender:</strong>{" "}
                                      {file.sender.username} (
                                      {file.sender.email}) - {file.sender.type}
                                    </div>
                                    <div>
                                      <strong>Recipient:</strong>{" "}
                                      {file.recipient.username} (
                                      {file.recipient.email}) -{" "}
                                      {file.recipient.type}
                                    </div>
                                    <div>
                                      <strong>Size:</strong>{" "}
                                      {(file.fileSize / 1024).toFixed(2)} KB
                                    </div>
                                    <div>
                                      <strong>Uploaded:</strong>{" "}
                                      {new Date(
                                        file.uploadedAt
                                      ).toLocaleString()}
                                    </div>
                                    <div>
                                      <strong>Requested:</strong>{" "}
                                      {new Date(
                                        file.downloadRequestedAt
                                      ).toLocaleString()}
                                    </div>
                                  </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() =>
                                      handleApprove(
                                        file.id,
                                        file.originalFileName
                                      )
                                    }
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejectClick(file)}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                      <Pagination
                        currentPage={requestsPage}
                        totalItems={downloadRequests.length}
                        itemsPerPage={requestsPerPage}
                        onPageChange={setRequestsPage}
                        onItemsPerPageChange={setRequestsPerPage}
                      />
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* All Files Tab */}
              <TabsContent value="files" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>
                          {showSearchResults ? `Search Results (${searchResults.length})` : getBreadcrumbText()}
                        </CardTitle>
                        <CardDescription>
                          {showSearchResults ? `Showing results for: "${searchQuery}"` : "View all files in the system"}
                        </CardDescription>
                      </div>
                      {showSearchResults && (
                        <Button variant="outline" size="sm" onClick={handleClearSearch}>
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search Bar */}
                    <div className="mb-4">
                      <EncryptedSearchBar
                        onSearch={handleFileSearch}
                        onClear={handleClearSearch}
                        placeholder="Search files... (e.g., report AND 2024 NOT draft)"
                        isLoading={isSearching}
                      />
                    </div>

                    <div className="space-y-4">
                      {getPaginatedFiles().map((file) => (
                        <Card key={file.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <FileText className="w-5 h-5" />
                                  {file.originalFileName}
                                </CardTitle>
                                <CardDescription className="mt-2 space-y-1">
                                  <div>
                                    <strong>Sender:</strong>{" "}
                                    {file.sender.username} ({file.sender.email})
                                  </div>
                                  <div>
                                    <strong>Recipient:</strong>{" "}
                                    {file.recipient.username} (
                                    {file.recipient.email})
                                  </div>
                                  <div>
                                    <strong>Uploaded:</strong>{" "}
                                    {new Date(file.uploadedAt).toLocaleString()}
                                  </div>
                                  {file.approvedAt && (
                                    <div>
                                      <strong>Approved:</strong>{" "}
                                      {new Date(
                                        file.approvedAt
                                      ).toLocaleString()}
                                    </div>
                                  )}
                                </CardDescription>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(file.downloadRequestStatus)}
                                {file.rejectionReason && (
                                  <p className="text-sm text-red-600">
                                    Reason: {file.rejectionReason}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                    <Pagination
                      currentPage={filesPage}
                      totalItems={getFilteredFiles().length}
                      itemsPerPage={filesPerPage}
                      onPageChange={setFilesPage}
                      onItemsPerPageChange={setFilesPerPage}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>
                          {showSearchResults ? `Search Results (${searchResults.length})` : getBreadcrumbText()}
                        </CardTitle>
                        <CardDescription>
                          {showSearchResults ? `Showing results for: "${searchQuery}"` : "Manage user accounts and permissions"}
                        </CardDescription>
                      </div>
                      {showSearchResults && (
                        <Button variant="outline" size="sm" onClick={handleClearSearch}>
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search Bar */}
                    <div className="mb-4">
                      <EncryptedSearchBar
                        onSearch={handleUserSearch}
                        onClear={handleClearSearch}
                        placeholder="Search users by username or email..."
                        isLoading={isSearching}
                      />
                    </div>

                    <div className="space-y-4">
                      {getPaginatedUsers().map((user) => (
                        <Card key={user.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {user.username}
                                </CardTitle>
                                <CardDescription className="mt-2 space-y-1">
                                  <div>{user.email}</div>
                                  <div>Type: {user.type}</div>
                                  <div>
                                    Joined:{" "}
                                    {new Date(
                                      user.createdAt
                                    ).toLocaleDateString()}
                                  </div>
                                  {user.lastLogin && (
                                    <div>
                                      Last Login:{" "}
                                      {new Date(
                                        user.lastLogin
                                      ).toLocaleString()}
                                    </div>
                                  )}
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    user.isActive ? "default" : "secondary"
                                  }
                                >
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                    <Pagination
                      currentPage={usersPage}
                      totalItems={getFilteredUsers().length}
                      itemsPerPage={usersPerPage}
                      onPageChange={setUsersPage}
                      onItemsPerPageChange={setUsersPerPage}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Audit Logs Tab */}
              <TabsContent value="logs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Audit Logs</CardTitle>
                    <CardDescription>
                      System activity and security logs (sorted from recent to past)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getPaginatedLogs().map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getActionBadge(log.action)}
                                <span className="font-medium">
                                  {log.actor.username || log.actor.email}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ({log.actorModel})
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {log.details}
                              </p>
                              {log.targetFile && (
                                <p className="text-sm text-blue-600">
                                  File: {log.targetFile}
                                </p>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                    </div>
                    <Pagination
                      currentPage={logsPage}
                      totalItems={getFilteredLogs().length}
                      itemsPerPage={logsPerPage}
                      onPageChange={setLogsPage}
                      onItemsPerPageChange={setLogsPerPage}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SidebarInset>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Download Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting the download request for "
              {selectedFile?.originalFileName}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectSubmit}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

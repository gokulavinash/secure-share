import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Upload, 
  Download, 
  FileText, 
  Key, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { userAPI, fileAPI, clearAuthData } from '@/lib/api';
import UploadFilesDialog from '@/components/UploadFilesDialog';
import EncryptionKeyDialog from '@/components/EncryptionKeyDialog';
import EncryptedSearchBar from '@/components/EncryptedSearchBar';
import Pagination from '@/components/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [myUploads, setMyUploads] = useState<any[]>([]);
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [activeTab, setActiveTab] = useState<string>('received');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [receivedPage, setReceivedPage] = useState(1);
  const [receivedPerPage, setReceivedPerPage] = useState(10);
  const [uploadsPage, setUploadsPage] = useState(1);
  const [uploadsPerPage, setUploadsPerPage] = useState(10);

  useEffect(() => {
    loadDashboardData();
    
    // Handle hash navigation
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setActiveView(hash);
        
        // Set appropriate tab based on hash
        if (hash === 'uploaded' || hash === 'upload') {
          setActiveTab('uploads');
          if (hash === 'upload') {
            setUploadDialogOpen(true);
          }
        } else if (hash === 'received' || hash === 'pending') {
          setActiveTab('received');
        } else if (hash === 'encryption') {
          setKeyDialogOpen(true);
        } else if (hash === 'profile') {
          setActiveTab('profile');
        } else if (hash === 'activity' || hash === 'preferences') {
          // Handle other sections
          toast.info(`${hash.charAt(0).toUpperCase() + hash.slice(1)} section coming soon!`);
        }
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profile, uploads, received] = await Promise.all([
        userAPI.getProfile(),
        fileAPI.getMyUploads(),
        fileAPI.getReceivedFiles(),
      ]);

      setUserData(profile.data);
      setMyUploads(uploads.data);
      setReceivedFiles(received.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard');
      if (error.message.includes('token')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    navigate('/user/login');
  };

  const handleRequestDownload = async (fileId: string, fileName: string) => {
    try {
      await fileAPI.requestDownload(fileId);
      toast.success(`Download request sent for "${fileName}"`);
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to request download');
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      await fileAPI.downloadFile(fileId, fileName);
      toast.success(`Downloaded "${fileName}" successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to download file');
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setIsSearching(true);
      setSearchQuery(query);
      
      const searchIn = activeTab === 'received' ? 'received' : 'uploaded';
      const response = await fileAPI.searchFiles(query, searchIn);
      
      setSearchResults(response.data || []);
      setShowSearchResults(true);
      toast.success(`Found ${response.count || 0} file(s)`);
    } catch (error: any) {
      toast.error(error.message || 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_requested':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Not Requested</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filter files based on active view
  const getFilteredReceivedFiles = () => {
    if (showSearchResults && activeTab === 'received') {
      return searchResults;
    }
    if (activeView === 'pending') {
      return receivedFiles.filter(f => f.downloadRequestStatus === 'pending');
    }
    return receivedFiles;
  };

  const getFilteredUploads = () => {
    if (showSearchResults && activeTab === 'uploads') {
      return searchResults;
    }
    return myUploads;
  };

  // Paginated files
  const getPaginatedReceivedFiles = () => {
    const filtered = getFilteredReceivedFiles();
    const startIndex = (receivedPage - 1) * receivedPerPage;
    const endIndex = startIndex + receivedPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getPaginatedUploads = () => {
    const filtered = getFilteredUploads();
    const startIndex = (uploadsPage - 1) * uploadsPerPage;
    const endIndex = startIndex + uploadsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getBreadcrumbText = () => {
    switch (activeView) {
      case 'uploaded': return 'Uploaded Files';
      case 'upload': return 'Upload New';
      case 'received': return 'All Received';
      case 'pending': return 'Pending Approval';
      case 'encryption': return 'Encryption Key';
      case 'activity': return 'Activity Log';
      case 'profile': return 'User Profile';
      case 'preferences': return 'Preferences';
      default: return 'File Management';
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
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
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/user/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getBreadcrumbText()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <Button variant="outline" size="sm" onClick={() => setKeyDialogOpen(true)}>
              <Key className="w-4 h-4 mr-2" />
              Encryption Key
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Stats Cards */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Received Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{receivedFiles.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Files shared with you</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">My Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{myUploads.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Files you've shared</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Encryption Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {userData?.encryptionKeySet ? <CheckCircle className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {userData?.encryptionKeySet ? 'Key configured' : 'Key required'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Encryption Key Status */}
          {!userData?.encryptionKeySet && (
            <Card className="border-yellow-500 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Encryption Key Required
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  You need to generate an encryption key before uploading files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setKeyDialogOpen(true)} className="bg-yellow-600 hover:bg-yellow-700">
                  <Key className="w-4 h-4 mr-2" />
                  Generate Encryption Key
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          {activeTab === 'profile' ? (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl">User Profile</CardTitle>
                <CardDescription>Your account information and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{userData?.username}</h3>
                    <p className="text-muted-foreground">{userData?.email}</p>
                    <Badge className="bg-blue-600">{userData?.type || 'User'}</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="text-lg">{userData?.username}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg">{userData?.email}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">User Type</label>
                    <p className="text-lg capitalize">{userData?.type || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                    <p className="text-lg">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                    <p className="text-lg">{userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Encryption Key Status</label>
                    <div className="flex items-center gap-2">
                      {userData?.encryptionKeySet ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-lg text-green-600">Configured</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <span className="text-lg text-yellow-600">Not Set</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Account Statistics</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Files Uploaded
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {myUploads.length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Files Received
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {receivedFiles.length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Pending Approvals
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {receivedFiles.filter(f => f.downloadRequestStatus === 'pending').length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="received">
                  <Download className="w-4 h-4 mr-2" />
                  Received Files ({receivedFiles.length})
                </TabsTrigger>
                <TabsTrigger value="uploads">
                  <Upload className="w-4 h-4 mr-2" />
                  My Uploads ({myUploads.length})
                </TabsTrigger>
              </TabsList>

          {/* Received Files Tab */}
          <TabsContent value="received" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {showSearchResults ? `Search Results (${searchResults.length})` : 
                 activeView === 'pending' ? 'Pending Approval Files' : 'Files Shared With You'}
              </h2>
              {activeView === 'pending' && !showSearchResults && (
                <Button variant="outline" size="sm" onClick={() => { setActiveView('received'); window.location.hash = 'received'; }}>
                  View All
                </Button>
              )}
              {showSearchResults && (
                <Button variant="outline" size="sm" onClick={handleClearSearch}>
                  Clear Search
                </Button>
              )}
            </div>

            {/* Search Bar */}
            <EncryptedSearchBar 
              onSearch={handleSearch}
              onClear={handleClearSearch}
              placeholder="Search received files... (e.g., report AND 2024 NOT draft)"
              isLoading={isSearching}
            />

            {getFilteredReceivedFiles().length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    {activeView === 'pending' ? 'No pending files' : 'No files received yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
              <div className="grid gap-4">
                {getPaginatedReceivedFiles().map((file) => (
                  <Card key={file.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {file.originalFileName}
                          </CardTitle>
                          <CardDescription className="mt-2 space-y-1">
                            <div>From: <span className="font-medium">{file.senderUsername}</span> ({file.senderEmail})</div>
                            <div>Size: {(file.fileSize / 1024).toFixed(2)} KB</div>
                            <div>Uploaded: {new Date(file.uploadedAt).toLocaleString()}</div>
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(file.downloadRequestStatus)}
                          {file.downloadRequestStatus === 'not_requested' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleRequestDownload(file.id, file.originalFileName)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Request Download
                            </Button>
                          )}
                          {file.downloadRequestStatus === 'approved' && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleDownload(file.id, file.originalFileName)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          )}
                          {file.downloadRequestStatus === 'rejected' && file.rejectionReason && (
                            <p className="text-sm text-red-600 mt-2">Reason: {file.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <Pagination
                currentPage={receivedPage}
                totalItems={getFilteredReceivedFiles().length}
                itemsPerPage={receivedPerPage}
                onPageChange={setReceivedPage}
                onItemsPerPageChange={setReceivedPerPage}
              />
              </>
            )}
          </TabsContent>

          {/* My Uploads Tab */}
          <TabsContent value="uploads" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {showSearchResults ? `Search Results (${searchResults.length})` : 'Files You\'ve Shared'}
              </h2>
              <div className="flex gap-2">
                {showSearchResults && (
                  <Button variant="outline" size="sm" onClick={handleClearSearch}>
                    Clear Search
                  </Button>
                )}
                <Button 
                  onClick={() => { 
                    setUploadDialogOpen(true); 
                    setActiveView('upload');
                    window.location.hash = 'upload';
                  }}
                  disabled={!userData?.encryptionKeySet}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <EncryptedSearchBar 
              onSearch={handleSearch}
              onClear={handleClearSearch}
              placeholder="Search uploaded files... (e.g., invoice OR receipt)"
              isLoading={isSearching}
            />

            {getFilteredUploads().length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Upload className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No files uploaded yet</p>
                  <Button 
                    onClick={() => { 
                      setUploadDialogOpen(true);
                      setActiveView('upload');
                      window.location.hash = 'upload';
                    }}
                    disabled={!userData?.encryptionKeySet}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your First File
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
              <div className="grid gap-4">
                {getPaginatedUploads().map((file) => (
                  <Card key={file.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {file.originalFileName}
                          </CardTitle>
                          <CardDescription className="mt-2 space-y-1">
                            <div>Shared with: <span className="font-medium">{file.recipientEmail}</span></div>
                            <div>Recipient: {file.recipientUsername}</div>
                            <div>Uploaded: {new Date(file.uploadedAt).toLocaleString()}</div>
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(file.downloadRequestStatus)}
                          {file.downloadRequestStatus === 'approved' && file.approvedAt && (
                            <p className="text-sm text-green-600">
                              Approved: {new Date(file.approvedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <Pagination
                currentPage={uploadsPage}
                totalItems={getFilteredUploads().length}
                itemsPerPage={uploadsPerPage}
                onPageChange={setUploadsPage}
                onItemsPerPageChange={setUploadsPerPage}
              />
              </>
            )}
          </TabsContent>
            </Tabs>
          )}
        </div>
      </SidebarInset>

      {/* Dialogs */}
      <UploadFilesDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen}
        onSuccess={loadDashboardData}
      />
      <EncryptionKeyDialog 
        open={keyDialogOpen} 
        onOpenChange={setKeyDialogOpen}
        currentKey={userData?.encryptionKey}
        onSuccess={loadDashboardData}
      />
    </SidebarProvider>
  );
}

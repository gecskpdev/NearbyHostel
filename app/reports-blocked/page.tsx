"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { auth, firestore } from "@/lib/firebase/config";
import { doc, getDoc, deleteDoc, collection, getDocs, query, where, updateDoc, Timestamp, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Report {
  reportId: string;
  commentId: number;
  reportedBy: string;
  reportReason: string;
  reportDetails: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
  commentText?: string;
  userName?: string;
  userEmail?: string;
}

interface BlockedUser {
  userId: number;
  userEmail: string;
  userName: string;
  blockedBy: string;
  blockReason: string;
  blockedAt: Date;
  isActive: boolean;
}

interface Notification {
  userId?: number;
  userEmail: string;
  userName: string;
  type: 'report' | 'block' | 'unblock';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  createdBy: string;
}

export default function ReportsBlockedPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(true);
  
  // Unreport modal state
  const [unreportModalOpen, setUnreportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [unreportLoading, setUnreportLoading] = useState(false);
  
  // Unblock modal state
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [selectedBlockedUser, setSelectedBlockedUser] = useState<BlockedUser | null>(null);
  const [unblockLoading, setUnblockLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        const docRef = doc(firestore, "adminemail", user.email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoadingAccess(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'superadmin') {
      fetchReports();
      fetchBlockedUsers();
    }
  }, [userRole]);

  const fetchReports = async () => {
    try {
      const reportsQuery = query(collection(firestore, "reports"));
      const querySnapshot = await getDocs(reportsQuery);
      const reportsData: Report[] = [];
      
      for (const doc of querySnapshot.docs) {
        const reportData = doc.data() as any;
        reportsData.push({
          ...reportData,
          reportId: doc.id,
          createdAt: (reportData.createdAt as Timestamp).toDate(),
        } as Report);
      }
      
      // Sort by creation date (newest first)
      reportsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setReports(reportsData);
    } catch (e: any) {
      console.error("Error fetching reports:", e);
      setError("Failed to fetch reports");
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const blockedUsersQuery = query(
        collection(firestore, "blockedUsers"),
        where("isActive", "==", true)
      );
      const querySnapshot = await getDocs(blockedUsersQuery);
      const blockedUsersData: BlockedUser[] = [];
      
      for (const doc of querySnapshot.docs) {
        const userData = doc.data() as any;
        blockedUsersData.push({
          ...userData,
          blockedAt: (userData.blockedAt as Timestamp).toDate(),
        } as BlockedUser);
      }
      
      // Sort by block date (newest first)
      blockedUsersData.sort((a, b) => b.blockedAt.getTime() - a.blockedAt.getTime());
      setBlockedUsers(blockedUsersData);
    } catch (e: any) {
      console.error("Error fetching blocked users:", e);
      setError("Failed to fetch blocked users");
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (notification: Omit<Notification, 'createdAt'>) => {
    try {
      await addDoc(collection(firestore, "notifications"), {
        ...notification,
        createdAt: new Date(),
      });
      // Removed email notification logic
    } catch (e: any) {
      console.error("Error sending notification:", e);
    }
  };

  const handleUnreport = (report: Report) => {
    setSelectedReport(report);
    setUnreportModalOpen(true);
  };

  const handleUnreportConfirm = async () => {
    if (!selectedReport) return;
    setUnreportLoading(true);
    try {
      await deleteDoc(doc(firestore, "reports", selectedReport.reportId));
      
      // Send notification to the reported user
      if (selectedReport.userEmail) {
        await sendNotification({
          userEmail: selectedReport.userEmail,
          userName: selectedReport.userName || 'User',
          type: 'report',
          title: 'Report Removed',
          message: `Your comment (ID: ${selectedReport.commentId}) has been reviewed and the report has been removed. Your comment is now visible again.`,
          isRead: false,
          createdBy: auth.currentUser?.email || 'Admin',
        });
      }
      
      setUnreportModalOpen(false);
      setSelectedReport(null);
      fetchReports();
      alert("Report removed successfully and user notified");
    } catch (e: any) {
      alert("Failed to remove report: " + e.message);
    } finally {
      setUnreportLoading(false);
    }
  };

  const handleUnblock = (blockedUser: BlockedUser) => {
    setSelectedBlockedUser(blockedUser);
    setUnblockModalOpen(true);
  };

  const handleUnblockConfirm = async () => {
    if (!selectedBlockedUser) return;
    setUnblockLoading(true);
    try {
      await updateDoc(doc(firestore, "blockedUsers", selectedBlockedUser.userEmail), {
        isActive: false,
      });
      
      // Send notification to the unblocked user
      await sendNotification({
        userEmail: selectedBlockedUser.userEmail,
        userName: selectedBlockedUser.userName,
        type: 'unblock',
        title: 'Account Unblocked',
        message: `Your account has been unblocked. You can now comment on hostels again.`,
        isRead: false,
        createdBy: auth.currentUser?.email || 'Admin',
      });
      
      setUnblockModalOpen(false);
      setSelectedBlockedUser(null);
      fetchBlockedUsers();
      alert("User unblocked successfully and notified");
    } catch (e: any) {
      alert("Failed to unblock user: " + e.message);
    } finally {
      setUnblockLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Reviewed</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loadingAccess) return <div className="text-center py-8">Checking admin access...</div>;
  if (userRole !== "admin" && userRole !== "superadmin") {
    return <div className="text-red-600 text-center py-8">Access denied. Admins or Super Admins only.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Reports & Blocked Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <Tabs defaultValue="reports" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
                <TabsTrigger value="blocked">Blocked Users ({blockedUsers.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="reports" className="mt-6">
                <div className="overflow-x-auto">
                  <Table className="w-full border-collapse">
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead className="p-3 text-left font-semibold">Comment ID</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Reported By</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Reason</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Details</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Status</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Date</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.reportId}>
                          <TableCell className="p-3">{report.commentId}</TableCell>
                          <TableCell className="p-3">{report.reportedBy}</TableCell>
                          <TableCell className="p-3">{report.reportReason}</TableCell>
                          <TableCell className="p-3 max-w-xs truncate">{report.reportDetails}</TableCell>
                          <TableCell className="p-3">{getStatusBadge(report.status)}</TableCell>
                          <TableCell className="p-3 text-xs">{report.createdAt.toLocaleString()}</TableCell>
                          <TableCell className="p-3">
                            <Button size="sm" variant="outline" onClick={() => handleUnreport(report)}>
                              Remove Report
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="blocked" className="mt-6">
                <div className="overflow-x-auto">
                  <Table className="w-full border-collapse">
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead className="p-3 text-left font-semibold">User</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Email</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Blocked By</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Reason</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Blocked Date</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blockedUsers.map((user) => (
                        <TableRow key={user.userEmail}>
                          <TableCell className="p-3">{user.userName}</TableCell>
                          <TableCell className="p-3">{user.userEmail}</TableCell>
                          <TableCell className="p-3">{user.blockedBy}</TableCell>
                          <TableCell className="p-3">{user.blockReason}</TableCell>
                          <TableCell className="p-3 text-xs">{user.blockedAt.toLocaleString()}</TableCell>
                          <TableCell className="p-3">
                            <Button size="sm" variant="outline" onClick={() => handleUnblock(user)}>
                              Unblock User
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Unreport Confirmation Modal */}
      <Dialog open={unreportModalOpen} onOpenChange={setUnreportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Report</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to remove this report? The user will be notified that their comment has been reviewed and cleared.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnreportModalOpen(false)} disabled={unreportLoading}>
              Cancel
            </Button>
            <Button onClick={handleUnreportConfirm} disabled={unreportLoading}>
              {unreportLoading ? 'Removing...' : 'Remove Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock Confirmation Modal */}
      <Dialog open={unblockModalOpen} onOpenChange={setUnblockModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unblock User</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to unblock this user? They will be notified and able to comment again.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnblockModalOpen(false)} disabled={unblockLoading}>
              Cancel
            </Button>
            <Button onClick={handleUnblockConfirm} disabled={unblockLoading}>
              {unblockLoading ? 'Unblocking...' : 'Unblock User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
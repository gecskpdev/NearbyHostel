"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { auth, firestore } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Comment {
  commentId: number;
  commentText: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  hostelId: number;
  userId: number;
  isVerified: boolean;
}

interface Report {
  reportId?: string;
  commentId: number;
  reportedBy: string;
  reportReason: string;
  reportDetails: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
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

export default function ManageCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(true);
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editComment, setEditComment] = useState<Comment | null>(null);
  const [editText, setEditText] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  
  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportComment, setReportComment] = useState<Comment | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  
  // Block user modal state
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockUser, setBlockUser] = useState<Comment | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);
  
  // Delete state
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/comments/all");
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditComment(comment);
    setEditText(comment.commentText);
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editComment) return;
    setEditLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: editComment.commentId, commentText: editText }),
      });
      if (!res.ok) throw new Error("Failed to update comment");
      setEditModalOpen(false);
      setEditComment(null);
      setEditText("");
      fetchComments();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (comment: Comment) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/comments?commentId=${comment.commentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete comment");
      fetchComments();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReport = (comment: Comment) => {
    setReportComment(comment);
    setReportReason("");
    setReportDetails("");
    setReportModalOpen(true);
  };

  const sendNotification = async (notification: any) => {
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

  const handleReportSubmit = async () => {
    if (!reportComment || !reportReason.trim()) return;
    setReportLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser?.email) throw new Error("User not authenticated");

      const report: Omit<Report, 'reportId'> = {
        commentId: reportComment.commentId,
        reportedBy: currentUser.email,
        reportReason,
        reportDetails,
        status: 'pending',
        createdAt: new Date(),
      };

      await addDoc(collection(firestore, "reports"), report);
      
      // Send notification to the reported user
      if (reportComment.userEmail) {
        await sendNotification({
          userEmail: reportComment.userEmail,
          userName: reportComment.userName || 'User',
          type: 'report',
          title: 'Comment Reported',
          message: `Your comment has been reported for: ${reportReason}. It is under review by our moderation team.`,
          isRead: false,
          createdBy: currentUser.email,
        });
      }
      
      setReportModalOpen(false);
      setReportComment(null);
      setReportReason("");
      setReportDetails("");
      alert("Report submitted successfully and user notified");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setReportLoading(false);
    }
  };

  const handleBlockUser = (comment: Comment) => {
    setBlockUser(comment);
    setBlockReason("");
    setBlockModalOpen(true);
  };

  const handleBlockUserSubmit = async () => {
    if (!blockUser || !blockReason.trim()) return;
    setBlockLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser?.email) throw new Error("User not authenticated");

      const blockedUser: Omit<BlockedUser, 'blockedAt'> = {
        userId: blockUser.userId,
        userEmail: blockUser.userEmail,
        userName: blockUser.userName,
        blockedBy: currentUser.email,
        blockReason,
        isActive: true,
      };

      await setDoc(doc(firestore, "blockedUsers", blockUser.userEmail), {
        ...blockedUser,
        blockedAt: new Date(),
      });

      // Send notification to the blocked user
      await sendNotification({
        userEmail: blockUser.userEmail,
        userName: blockUser.userName,
        type: 'block',
        title: 'Account Blocked',
        message: `Your account has been blocked for: ${blockReason}. You are no longer able to comment on hostels.`,
        isRead: false,
        createdBy: currentUser.email,
      });

      setBlockModalOpen(false);
      setBlockUser(null);
      setBlockReason("");
      alert("User blocked successfully and notified");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBlockLoading(false);
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
          <CardTitle>Manage Comments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading comments...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full border-collapse mt-4">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="p-3 text-left font-semibold">User</TableHead>
                    <TableHead className="p-3 text-left font-semibold">Email</TableHead>
                    <TableHead className="p-3 text-left font-semibold">Comment</TableHead>
                    <TableHead className="p-3 text-left font-semibold">Date</TableHead>
                    <TableHead className="p-3 text-left font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comments.map((comment) => (
                    <TableRow key={comment.commentId}>
                      <TableCell className="p-3">{comment.userName || "Anonymous"}</TableCell>
                      <TableCell className="p-3">{comment.userEmail || "-"}</TableCell>
                      <TableCell className="p-3 max-w-xs truncate">{comment.commentText}</TableCell>
                      <TableCell className="p-3 text-xs">{new Date(comment.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="p-3">
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(comment)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleReport(comment)}>
                            Report
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleBlockUser(comment)}>
                            Block User
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(comment)} disabled={deleteLoading}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Comment Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Comment</DialogTitle>
          </DialogHeader>
          <Textarea
            className="w-full mb-4 min-h-[100px]"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            disabled={editLoading}
            placeholder="Edit comment text..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={editLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editLoading || !editText.trim()}>
              {editLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Comment Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Report Reason</label>
              <select 
                value={reportReason} 
                onChange={e => setReportReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a reason</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="fake">Fake Information</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Additional Details</label>
              <Textarea
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
                placeholder="Provide additional details about the report..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportModalOpen(false)} disabled={reportLoading}>
              Cancel
            </Button>
            <Button onClick={handleReportSubmit} disabled={reportLoading || !reportReason.trim()}>
              {reportLoading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block User Modal */}
      <Dialog open={blockModalOpen} onOpenChange={setBlockModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Block Reason</label>
              <select 
                value={blockReason} 
                onChange={e => setBlockReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a reason</option>
                <option value="inappropriate_comments">Inappropriate Comments</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="fake_reviews">Fake Reviews</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockModalOpen(false)} disabled={blockLoading}>
              Cancel
            </Button>
            <Button onClick={handleBlockUserSubmit} disabled={blockLoading || !blockReason.trim()}>
              {blockLoading ? 'Blocking...' : 'Block User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
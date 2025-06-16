"use client";

import React, { useEffect, useState } from "react";
import { firestore, auth } from "@/lib/firebase/config";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AddAdmin, AdminList, RemoveAdmin, RemovedAdminsList } from "@/components/admin-components";

export default function AdminPanel() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (!user?.email) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      const docRef = doc(firestore, "adminemail", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserRole(docSnap.data().role);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    };

    fetchRole();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  if (userRole !== "superadmin") {
    return (
      <div className="p-6 text-red-600 font-semibold">
        You are not authorized to access this page.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <Tabs defaultValue="add">
        <TabsList className="mb-4">
          <TabsTrigger value="add">Add Admin</TabsTrigger>
          <TabsTrigger value="list">List Admins</TabsTrigger>
          <TabsTrigger value="remove">Remove Admin</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <AddAdmin />
        </TabsContent>
        <TabsContent value="list">
          <AdminList />
        </TabsContent>
        <TabsContent value="remove">
          <RemoveAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
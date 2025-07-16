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
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const AddAdmin = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "superadmin">("admin");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleAdd = async () => {
    setStatus(null);
    setLoading(true);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setStatus("Must be logged in.");
      setLoading(false);
      return;
    }

    const currentUserRef = doc(firestore, "adminemail", currentUser.email!);
    const currentUserSnap = await getDoc(currentUserRef);

    if (!currentUserSnap.exists() || currentUserSnap.data().role !== "superadmin") {
      setStatus("Not authorized.");
      setLoading(false);
      return;
    }

    try {
      const targetRef = doc(firestore, "adminemail", email);
      const targetSnap = await getDoc(targetRef);

      // If already exists, delete first
      if (targetSnap.exists()) {
        await deleteDoc(targetRef);
      }

      await setDoc(targetRef, {
        role,
        addedBy: currentUser.email,
        addedAt: Timestamp.now(),
        isActive: true,
      });

      setStatus(`Admin added successfully with role: ${role}`);
      setEmail("");
      setRole("admin");
      setConfirming(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatus("Error: " + err.message);
      } else {
        setStatus("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4 max-w-md">
      <Input
        type="email"
        placeholder="Admin email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as 'admin' | 'superadmin')}
        className="border p-2 w-full rounded mb-2"
      >
        <option value="admin">Admin</option>
        <option value="superadmin">Superadmin</option>
      </select>
      {!confirming ? (
        <Button
          onClick={() => setConfirming(true)}
          disabled={loading || !email}
          className="w-full"
        >
          Add Admin
        </Button>
      ) : (
        <div className="flex gap-4">
          <Button
            onClick={handleAdd}
            disabled={loading}
            variant="default"
            className="flex-1"
          >
            Confirm Add
          </Button>
          <Button
            onClick={() => setConfirming(false)}
            disabled={loading}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      )}
      {status && <Badge className="mt-2">{status}</Badge>}
    </Card>
  );
};

export const AdminList = () => {
  interface Admin {
    id: string;
    role: string;
    addedBy: string;
    addedAt: Timestamp;
    isActive: boolean;
  }

  const [admins, setAdmins] = useState<Admin[]>([]);

  useEffect(() => {
    const fetchAdmins = async () => {
      const snap = await getDocs(collection(firestore, "adminemail"));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        role: doc.data().role,
        addedBy: doc.data().addedBy,
        addedAt: doc.data().addedAt,
        isActive: doc.data().isActive,
      }));
      setAdmins(list);
    };
    fetchAdmins();
  }, []);

  return (
    <div className="space-y-4">
      {admins.map((admin) => (
        <Card
          key={admin.id}
          className="p-4 flex flex-col gap-2 shadow-sm bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">Email:</span> {admin.id}
            <Badge variant="outline" className="ml-2">{admin.role}</Badge>
          </div>
          <div className="text-sm text-gray-500">Added By: {admin.addedBy}</div>
          <div className="text-sm text-gray-500">Added At: {admin.addedAt?.toDate().toLocaleString()}</div>
        </Card>
      ))}
    </div>
  );
};

export const RemoveAdmin = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleRemove = async () => {
    setStatus(null);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setStatus("Must be logged in.");
      return;
    }

    const ref = doc(firestore, "adminemail", currentUser.email!);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().role !== "superadmin") {
      setStatus("Not authorized.");
      return;
    }

    try {
      const removedAdmin = await getDoc(doc(firestore, "adminemail", email));
      if (!removedAdmin.exists()) {
        setStatus("Admin not found.");
        return;
      }

      await deleteDoc(doc(firestore, "adminemail", email));

      await setDoc(doc(firestore, "removedadmin", email), {
        email,
        removedBy: currentUser.email,
        removedAt: Timestamp.now(),
        roleAtRemoval: removedAdmin.data().role,
      });

      setStatus("Admin removed.");
      setEmail("");
      setConfirming(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatus("Error: " + err.message);
      } else {
        setStatus("An unknown error occurred.");
      }
    }
  };

  return (
    <Card className="p-6 space-y-4 max-w-md">
      <Input
        type="email"
        placeholder="Admin email to remove"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2"
      />
      {!confirming ? (
        <Button
          onClick={() => setConfirming(true)}
          variant="destructive"
          className="w-full"
        >
          Remove Admin
        </Button>
      ) : (
        <div className="flex gap-4">
          <Button
            onClick={handleRemove}
            variant="destructive"
            className="flex-1"
          >
            Yes, Remove
          </Button>
          <Button
            onClick={() => setConfirming(false)}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      )}
      {status && <Badge className="mt-2">{status}</Badge>}
      <RemovedAdminsList />
    </Card>
  );
};

export const RemovedAdminsList = () => {
  interface RemovedAdmin {
    id: string;
    email: string;
    removedBy: string;
    roleAtRemoval: string;
    removedAt: Timestamp;
  }

  const [removed, setRemoved] = useState<RemovedAdmin[]>([]);

  useEffect(() => {
    const fetchRemoved = async () => {
      const snap = await getDocs(collection(firestore, "removedadmin"));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        removedBy: doc.data().removedBy,
        roleAtRemoval: doc.data().roleAtRemoval,
        removedAt: doc.data().removedAt,
      }));
      setRemoved(list);
    };
    fetchRemoved();
  }, []);

  return (
    <div className="mt-6 space-y-2">
      <h3 className="font-semibold mb-2">Removed Admins</h3>
      {removed.map((admin) => (
        <Card
          key={admin.id}
          className="p-4 flex flex-col gap-2 shadow-sm bg-red-50"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">Email:</span> {admin.email}
            <Badge variant="destructive" className="ml-2">Removed</Badge>
          </div>
          <div className="text-sm text-gray-500">Removed By: {admin.removedBy}</div>
          <div className="text-sm text-gray-500">Role: {admin.roleAtRemoval}</div>
          <div className="text-sm text-gray-500">Removed At: {admin.removedAt?.toDate().toLocaleString()}</div>
        </Card>
      ))}
    </div>
  );
}; 
"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { auth, firestore } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useUserSession } from '@/hook/use_user_session';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged } from 'firebase/auth';

interface Hostel {
  hostelId: number;
  hostelName: string;
  hostelDescription: string;
  address?: string;
  location?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  priceRange?: string;
  images?: { imageId: number; imageUrl: string; isPrimary: boolean }[];
}

export default function ManageHostelsPage() {
  const userUid = useUserSession(null);
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    location: '',
    phoneNumber: '',
    email: '',
    website: '',
    priceRange: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ imageId: number; imageUrl: string; isPrimary: boolean }[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loadingHostels, setLoadingHostels] = useState(false);
  const [hostelError, setHostelError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Hostel | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingHostelId, setEditingHostelId] = useState<number | null>(null);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);

  const fetchHostels = async () => {
    setLoadingHostels(true);
    setHostelError(null);
    try {
      const res = await fetch('/api/hostels');
      if (!res.ok) throw new Error('Failed to fetch hostels');
      const data = await res.json();
      setHostels(data);
    } catch (e: any) {
      setHostelError(e.message);
    } finally {
      setLoadingHostels(false);
    }
  };

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
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = () => {
    setEditMode(false);
    setEditingHostelId(null);
    setEditingImageId(null);
    setForm({
      name: '',
      description: '',
      address: '',
      location: '',
      phoneNumber: '',
      email: '',
      website: '',
      priceRange: '',
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setPrimaryImageIndex(0);
    setSelectedOptions({});
    setSubmitError(null);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm({
      name: '',
      description: '',
      address: '',
      location: '',
      phoneNumber: '',
      email: '',
      website: '',
      priceRange: '',
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setPrimaryImageIndex(0);
    setSelectedOptions({});
    setSubmitError(null);
    setEditMode(false);
    setEditingHostelId(null);
    setEditingImageId(null);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };
  const handleRemoveNewImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    if (primaryImageIndex >= existingImages.length && (primaryImageIndex - existingImages.length) === idx) {
      setPrimaryImageIndex(0);
    }
  };
  const handleRemoveExistingImage = (imageId: number) => {
    setExistingImages(prev => prev.filter(img => img.imageId !== imageId));
    if (primaryImageIndex < existingImages.length && existingImages[primaryImageIndex]?.imageId === imageId) {
      setPrimaryImageIndex(0);
    }
  };
  const handleCategoryChange = (categoryName: string, optionName: string) => {
    setSelectedOptions((prev) => ({ ...prev, [categoryName]: optionName }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const uploadedImageUrls: string[] = [];
      const hostelCategoryOptions = Object.entries(selectedOptions).map(([categoryName, optionName]) => ({ categoryName, optionName }));
      let hostelId = editingHostelId;
      if (editMode && editingHostelId) {
        // Edit mode: upload images with existing hostelId
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const formData = new FormData();
          formData.append('hostelId', String(editingHostelId));
          formData.append('file', file);
          formData.append('imageType', 'general');
          formData.append('isPrimary', String(existingImages.length + i === primaryImageIndex));
          const res = await fetch('/api/hostel-images', {
            method: 'POST',
            body: formData,
          });
          if (!res.ok) throw new Error('Failed to upload image');
          const data = await res.json();
          uploadedImageUrls.push(data.imageUrl);
        }
        let hostelRes: Response;
        hostelRes = await fetch('/api/hostels', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostelId: editingHostelId,
            hostelName: form.name,
            hostelDescription: form.description,
            address: form.address,
            location: form.location,
            phoneNumber: form.phoneNumber,
            email: form.email,
            website: form.website,
            priceRange: form.priceRange,
            hostelCategoryOptions,
          }),
        });
        if (!hostelRes.ok) throw new Error('Failed to update hostel');
        const originalImageIds = (hostels.find(h => h.hostelId === editingHostelId)?.images || []).map((img: any) => img.imageId);
        const removedImageIds = originalImageIds.filter((id: number) => !existingImages.some(img => img.imageId === id));
        for (const id of removedImageIds) {
          await fetch(`/api/hostel-images?imageId=${id}`, { method: 'DELETE' });
        }
        // Set primary image
        const allImages = [...existingImages, ...uploadedImageUrls.map((url, i) => ({ imageUrl: url, imageId: null, isPrimary: false, isNew: true, idx: i }))];
        for (let i = 0; i < allImages.length; i++) {
          const img = allImages[i];
          if (i === primaryImageIndex) {
            if (img.imageId) {
              await fetch('/api/hostel-images', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imageId: img.imageId,
                  isPrimary: true,
                }),
              });
            }
          } else {
            if (img.imageId) {
              await fetch('/api/hostel-images', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imageId: img.imageId,
                  isPrimary: false,
                }),
              });
            }
          }
        }
      } else {
        // Create hostel first, then upload images with real hostelId
        let hostelRes: Response;
        hostelRes = await fetch('/api/hostels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostelName: form.name,
            hostelDescription: form.description,
            address: form.address,
            location: form.location,
            phoneNumber: form.phoneNumber,
            email: form.email,
            website: form.website,
            priceRange: form.priceRange,
            hostelCategoryOptions,
          }),
        });
        if (!hostelRes.ok) throw new Error('Failed to create hostel');
        let hostelData: any = await hostelRes.json();
        hostelId = hostelData.hostelId;
        // Now upload images with correct hostelId
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const formData = new FormData();
          formData.append('hostelId', String(hostelId));
          formData.append('file', file);
          formData.append('imageType', 'general');
          formData.append('isPrimary', String(existingImages.length + i === primaryImageIndex));
          const res = await fetch('/api/hostel-images', {
            method: 'POST',
            body: formData,
          });
          if (!res.ok) throw new Error('Failed to upload image');
        }
      }
      handleCloseModal();
      fetchHostels();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save hostel');
    } finally {
      setSubmitLoading(false);
      setEditMode(false);
      setEditingHostelId(null);
      setEditingImageId(null);
    }
  };

  const handleDeleteHostel = (hostel: Hostel) => {
    setDeleteTarget(hostel);
    setDeleteError(null);
  };
  const confirmDeleteHostel = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/hostels?hostelId=${deleteTarget.hostelId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete hostel');
      setDeleteTarget(null);
      fetchHostels();
    } catch (e: any) {
      setDeleteError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };
  const cancelDeleteHostel = () => {
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const handleEditHostel = (hostel: any) => {
    setEditMode(true);
    setEditingHostelId(hostel.hostelId);
    setForm({
      name: hostel.hostelName || '',
      description: hostel.hostelDescription || '',
      address: hostel.address || '',
      location: hostel.location || '',
      phoneNumber: hostel.phoneNumber || '',
      email: hostel.email || '',
      website: hostel.website || '',
      priceRange: hostel.priceRange || '',
    });
    const catOptions: Record<string, string> = {};
    if (hostel.categories) {
      hostel.categories.forEach((cat: any) => {
        catOptions[cat.categoryName] = cat.optionName;
      });
    }
    setSelectedOptions(catOptions);
    if (hostel.images && hostel.images.length > 0) {
      setExistingImages(hostel.images.map((img: any) => ({ imageId: img.imageId, imageUrl: img.imageUrl, isPrimary: img.isPrimary })));
      const primaryIdx = hostel.images.findIndex((img: any) => img.isPrimary);
      setPrimaryImageIndex(primaryIdx >= 0 ? primaryIdx : 0);
    } else {
      setExistingImages([]);
      setPrimaryImageIndex(0);
    }
    setImageFiles([]);
    setImagePreviews([]);
    setIsModalOpen(true);
    setSubmitError(null);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (e: any) {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchHostels();
  }, []);

  return (
    <>
      {loading ? (
        <div className="text-center py-8">Checking admin access...</div>
      ) : userRole !== "admin" && userRole !== "superadmin" ? (
        <div className="text-red-600 text-center py-8">Access denied. Admins or Super Admins only.</div>
      ) : (
        <div className="max-w-5xl mx-auto p-8">
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold">Manage Hostels</CardTitle>
              <Button onClick={handleOpenModal}>Add Hostel</Button>
            </CardHeader>
            <CardContent>
              {loadingHostels ? (
                <div className="text-center py-8">Loading hostels...</div>
              ) : hostelError ? (
                <div className="text-center py-8 text-red-500">{hostelError}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="w-full border-collapse mt-4">
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead className="p-3 text-left font-semibold">Name</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Address</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Price Range</TableHead>
                        <TableHead className="p-3 text-left font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
            {hostels.map((hostel) => (
                        <TableRow key={hostel.hostelId} className="border-b hover:bg-gray-50">
                          <TableCell className="p-3 font-medium align-middle">{hostel.hostelName}</TableCell>
                          <TableCell className="p-3 text-gray-600 align-middle break-words whitespace-pre-line max-w-xs">{hostel.address}</TableCell>
                          <TableCell className="p-3 text-gray-600 align-middle">{hostel.priceRange}</TableCell>
                          <TableCell className="p-3 flex gap-2 align-middle">
                            <Button variant="outline" size="sm" onClick={() => handleEditHostel(hostel)}>Edit</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteHostel(hostel)}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
      </div>
              )}
            </CardContent>
          </Card>

          {/* Modal for Add/Edit Hostel */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent aria-describedby={undefined} className="w-full max-w-2xl z-[9999] max-h-[90vh] overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold mb-4">{editMode ? 'Edit Hostel' : 'Add Hostel'}</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new hostel.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Hostel Name"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Hostel Description"
                    rows={3}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <Input
                    name="address"
                    value={form.address || ''}
                    onChange={handleChange}
                    placeholder="Hostel Address"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Google Maps Link</label>
                  <Input
                    name="location"
                    value={form.location || ''}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <Input
                      name="phoneNumber"
                      value={form.phoneNumber || ''}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      name="email"
                      value={form.email || ''}
                      onChange={handleChange}
                      placeholder="Email"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Website</label>
                    <Input
                      name="website"
                      value={form.website || ''}
                      onChange={handleChange}
                      placeholder="Website"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price Range</label>
                    <Input
                      name="priceRange"
                      value={form.priceRange || ''}
                      onChange={handleChange}
                      placeholder="e.g., $25-50"
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Images</label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full"
                  />
                  <div className="flex flex-wrap gap-4 mt-2">
                    {/* Existing images */}
                    {existingImages.map((img, idx) => (
                      <div key={img.imageId} className="relative group">
                        <img src={img.imageUrl} alt="Hostel" className="rounded-md max-h-32 border" />
                        <button type="button" onClick={() => handleRemoveExistingImage(img.imageId)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow text-red-600 hover:bg-red-100">×</button>
                        <label className="absolute bottom-1 left-1 bg-white rounded px-2 py-0.5 text-xs font-semibold cursor-pointer">
                          <input type="radio" name="primaryImage" checked={primaryImageIndex === idx} onChange={() => setPrimaryImageIndex(idx)} /> Primary
                        </label>
                      </div>
                    ))}
                    {/* New images */}
                    {imagePreviews.map((url, idx) => (
                      <div key={url} className="relative group">
                        <img src={url} alt="Preview" className="rounded-md max-h-32 border" />
                        <button type="button" onClick={() => handleRemoveNewImage(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow text-red-600 hover:bg-red-100">×</button>
                        <label className="absolute bottom-1 left-1 bg-white rounded px-2 py-0.5 text-xs font-semibold cursor-pointer">
                          <input type="radio" name="primaryImage" checked={primaryImageIndex === (existingImages.length + idx)} onChange={() => setPrimaryImageIndex(existingImages.length + idx)} /> Primary
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Category Selectors */}
                {!loadingCategories && categories.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Categories</h4>
                    {categories.map((category) => (
                      <div key={category.categoryId}>
                        <label className="block text-sm font-medium mb-2">{category.categoryName}</label>
                        <select
                          value={selectedOptions[category.categoryName] || ''}
                          onChange={e => handleCategoryChange(category.categoryName, e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select {category.categoryName}</option>
                          {category.options.map((option: any) => (
                            <option key={option.optionId} value={option.optionName}>{option.optionName}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
                {submitError && <div className="text-red-600 text-sm text-center">{submitError}</div>}
                <DialogFooter className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseModal} disabled={submitLoading}>Cancel</Button>
                  <Button type="submit" disabled={submitLoading}>{submitLoading ? (editMode ? 'Saving...' : 'Adding...') : (editMode ? 'Save' : 'Add')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          {deleteTarget && (
            <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
              <DialogContent className="w-full max-w-md relative z-[9999]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold mb-4 text-red-600">Delete Hostel</DialogTitle>
                </DialogHeader>
                <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{deleteTarget.hostelName}</span>? This action cannot be undone.</p>
                {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
                <DialogFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={cancelDeleteHostel} disabled={deleteLoading}>Cancel</Button>
                  <Button variant="destructive" onClick={confirmDeleteHostel} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </>
  );
} 
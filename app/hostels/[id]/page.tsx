import React from 'react';
import { notFound } from 'next/navigation';
import HostelInteractionWrapper from './HostelInteractionWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import HostelImageSlider from '@/components/main/HostelImageSlider';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function getHostelDetails(id: string) {
  const res = await fetch(`${BASE_URL}/api/hostels/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function HostelDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hostel = await getHostelDetails(id);
  if (!hostel) return notFound();

  const mainImage = hostel.images && hostel.images.length > 0 ? hostel.images[0].imageUrl : null;

  return (
    <div className="max-w-5xl mx-auto p-0 md:p-6">
      {/* Hero Section with Image Slider */}
      <Card className="relative rounded-3xl overflow-hidden shadow-lg mb-8 border-none">
        {hostel.images && hostel.images.length > 0 ? (
          <HostelImageSlider images={hostel.images} alt={hostel.hostelName} large />
        ) : (
          <div className="w-full h-[60vh] md:h-[66vh] bg-gradient-to-r from-blue-200 to-blue-400 flex items-center justify-center text-4xl text-white font-bold rounded-3xl">
            {hostel.hostelName.charAt(0)}
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{hostel.hostelName}</h1>
        </div>
      </Card>
      {/* Hostel Description & Categories */}
      <Card className="bg-white/90 rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
        <CardContent>
          <p className="text-gray-700 mb-4 text-lg font-medium">{hostel.hostelDescription}</p>
          {hostel.categories && hostel.categories.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-blue-700 mb-2">Categories</h3>
              <ul className="flex flex-wrap gap-2">
                {hostel.categories.map((cat: any, i: number) => (
                  <Badge key={i} variant="outline" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm border-none">
                    {cat.categoryName}: {cat.optionName}
                  </Badge>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Ratings */}
      <section className="mb-8">
        <Card className="bg-yellow-50 rounded-xl px-6 py-4 shadow-sm border-none">
          <CardHeader className="flex flex-row items-center gap-3 p-0 pb-2">
            <CardTitle className="text-xl font-bold text-yellow-600 flex items-center gap-2">
              <span className="text-2xl">★</span> Ratings
            </CardTitle>
            <span className="text-yellow-500 font-bold text-3xl ml-auto">
              {hostel.averageRating ? hostel.averageRating.toFixed(1) : 'N/A'}
            </span>
            <span className="text-gray-700 text-lg">({hostel.totalRatings} reviews)</span>
          </CardHeader>
        </Card>
      </section>
      {/* Comments */}
      <section className="mb-10">
        <Card className="bg-white/90 border border-gray-100 rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold mb-3 text-blue-700 flex items-center gap-2">
              <span className="text-2xl">💬</span> Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hostel.comments && hostel.comments.length > 0 ? (
              <ul className="space-y-4">
                {hostel.comments.map((comment: any) => (
                  <li key={comment.commentId} className="flex gap-3 items-start bg-white/90 border border-gray-100 rounded-xl shadow-sm p-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-200 text-blue-800 font-bold">
                        {comment.userName ? comment.userName.charAt(0) : 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-blue-800 flex items-center gap-1">
                          {comment.userName || 'Anonymous'}
                        </span>
                        {comment.isVerified && <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Verified</Badge>}
                        <span className="text-xs text-gray-400 ml-auto">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 text-base mt-1">{comment.commentText}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No comments yet.</p>
            )}
          </CardContent>
        </Card>
      </section>
      {/* Authenticated interaction (rating/comment forms) */}
      <HostelInteractionWrapper hostelId={id} />
    </div>
  );
} 
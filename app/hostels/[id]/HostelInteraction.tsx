"use client";
import { useState, useEffect } from 'react';
import { useUserSession } from '@/hook/use_user_session';
import { useRouter } from 'next/navigation';
import { UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function HostelInteraction({ hostelId }: { hostelId: string }) {
  const userUid = useUserSession(null);
  const [dbUserId, setDbUserId] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [loadingUserId, setLoadingUserId] = useState(false);
  // Rating state
  const [rating, setRating] = useState(0);
  const [ratingId, setRatingId] = useState<number | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  // Comment state
  const [comment, setComment] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch DB user ID and displayName after login
  useEffect(() => {
    const fetchDbUserId = async () => {
      if (!userUid) return;
      setLoadingUserId(true);
      try {
        const res = await fetch('/api/users/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firebaseUid: userUid }),
        });
        if (!res.ok) throw new Error('Failed to fetch DB user ID');
        const data = await res.json();
        setDbUserId(data.userId);
        setDisplayName(data.displayName || '');
      } catch (err) {
        setRatingError('Failed to fetch user ID');
        setCommentError('Failed to fetch user ID');
      } finally {
        setLoadingUserId(false);
      }
    };
    fetchDbUserId();
  }, [userUid]);

  // Fetch user's existing rating for this hostel
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!dbUserId) return;
      try {
        const res = await fetch(`/api/ratings?hostelId=${hostelId}&userId=${dbUserId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRating(data[0].overallRating ? Number(data[0].overallRating) : 0);
          setRatingId(data[0].ratingId);
        } else {
          setRating(0);
          setRatingId(null);
        }
      } catch {}
    };
    fetchUserRating();
  }, [dbUserId, hostelId]);

  if (!userUid) {
    return (
      <Card className="mt-8 bg-yellow-50 border-yellow-200">
        <CardContent className="py-6">
          <Alert variant="default">
            <AlertDescription className="text-yellow-800 text-center font-medium">
              Please log in to rate or comment on this hostel.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loadingUserId) {
    return (
      <Card className="mt-8 bg-gray-50 border-gray-200">
        <CardContent className="py-6">
          <div className="text-gray-700 text-center">Loading user info...</div>
        </CardContent>
      </Card>
    );
  }

  if (!dbUserId) {
    return (
      <Card className="mt-8 bg-red-50 border-red-200">
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertDescription className="text-red-700 text-center font-medium">
              Failed to load user information. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Submit rating (create or update)
  const handleSubmitRating = async () => {
    setRatingSubmitting(true);
    setRatingError(null);
    try {
      let res;
      if (ratingId) {
        // Update existing rating
        res = await fetch('/api/ratings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ratingId,
            overallRating: rating,
          }),
        });
      } else {
        // Create new rating
        res = await fetch('/api/ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostelId: Number(hostelId),
            userId: dbUserId,
            overallRating: rating,
          }),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit rating');
      }
      router.refresh();
    } catch (err: any) {
      setRatingError(err.message || 'Submission failed');
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Submit comment only
  const handleSubmitComment = async () => {
    setCommentSubmitting(true);
    setCommentError(null);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostelId: Number(hostelId),
          userId: dbUserId,
          commentText: comment.trim(),
          userName: displayName || nameInput,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit comment');
      }
      setComment('');
      router.refresh();
    } catch (err: any) {
      setCommentError(err.message || 'Submission failed');
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <Card className="mt-10 max-w-xl mx-auto bg-white/80 rounded-2xl shadow-lg border border-gray-100">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-700 text-center">Share Your Experience</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Rating Section */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-2 text-gray-800 flex items-center gap-2">
            <span className="text-yellow-500">★</span> Rate this Hostel
          </h3>
          <div className="flex items-center gap-2 mb-2">
            {[1,2,3,4,5].map(star => (
              <Button
                key={star}
                type="button"
                variant={star <= rating ? 'default' : 'outline'}
                className={`text-2xl px-3 py-1 ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300'} hover:scale-125 transition-transform`}
                onClick={() => setRating(star)}
                disabled={ratingSubmitting}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                ★
              </Button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mb-2">
            {rating > 0
              ? ratingId
                ? `You rated this hostel ${rating} star${rating > 1 ? 's' : ''}. You can update your rating below.`
                : `You rated this hostel ${rating} star${rating > 1 ? 's' : ''}`
              : 'Click a star to rate.'}
          </p>
          {ratingError && (
            <Alert variant="destructive" className="mb-2 text-center font-medium">
              <AlertDescription>{ratingError}</AlertDescription>
            </Alert>
          )}
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-xl shadow-md hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 mt-2"
            disabled={ratingSubmitting || rating === 0}
            onClick={handleSubmitRating}
          >
            {ratingSubmitting
              ? 'Submitting...'
              : ratingId
                ? 'Update Rating'
                : 'Submit Rating'}
          </Button>
        </div>
        <div className="border-t border-gray-200 my-6" />
        {/* Comment Section */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-800 flex items-center gap-2">
            <span className="text-blue-600"><UserCircle className="w-6 h-6" /></span> Leave a Comment
          </h3>
          <Textarea
            className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none min-h-[80px] bg-white/90"
            rows={3}
            placeholder="Write your comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={commentSubmitting}
          />
          {/* Show name input if displayName is not available */}
          {!displayName && (
            <div className="flex items-center gap-2 mb-3">
              <UserCircle className="w-6 h-6 text-gray-400" />
              <Input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all bg-white/90"
                placeholder="Your name"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                disabled={commentSubmitting}
              />
            </div>
          )}
          {commentError && (
            <Alert variant="destructive" className="mb-2 text-center font-medium">
              <AlertDescription>{commentError}</AlertDescription>
            </Alert>
          )}
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-xl shadow-md hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 mt-2"
            disabled={commentSubmitting || !comment.trim() || (!displayName && !nameInput)}
            onClick={handleSubmitComment}
          >
            {commentSubmitting ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
 
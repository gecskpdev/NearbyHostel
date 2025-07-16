import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { comments } from '../../../lib/schema';
import { eq } from 'drizzle-orm';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hostelId = searchParams.get('hostelId');

    if (!hostelId) {
      return NextResponse.json({ message: 'Hostel ID is required.' }, { status: 400 });
    }

    const hostelComments = await db.select().from(comments)
      .where(eq(comments.hostelId, parseInt(hostelId)))
      .orderBy(comments.createdAt);

    return NextResponse.json(hostelComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ message: 'Failed to fetch comments.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // userId is now the DB user ID (integer)
    const { hostelId, userId, commentText, userName, userEmail } = await req.json();
    const hostelIdNum = Number(hostelId);
    const userIdNum = Number(userId);

    // Type guard for new logic
    if (typeof hostelIdNum !== 'number' || isNaN(hostelIdNum) || typeof userIdNum !== 'number' || isNaN(userIdNum)) {
      return NextResponse.json({ message: 'Invalid hostelId or userId.' }, { status: 400 });
    }

    const [newComment] = await db.insert(comments).values({
      hostelId: hostelIdNum,
      userId: userIdNum,
      commentText,
      userName,
      userEmail,
      isVerified: false,
      createdAt: new Date(),
    }).returning();

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ message: 'Failed to add comment.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { commentId, commentText, isVerified } = await req.json();

    if (!commentId) {
      return NextResponse.json({ message: 'Comment ID is required for update.' }, { status: 400 });
    }

    const updateData: any = {};
    if (commentText !== undefined) updateData.commentText = commentText;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    await db.update(comments).set(updateData).where(eq(comments.commentId, commentId));

    return NextResponse.json({ message: 'Comment updated successfully.' });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ message: 'Failed to update comment.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ message: 'Comment ID is required for deletion.' }, { status: 400 });
    }

    await db.delete(comments).where(eq(comments.commentId, parseInt(commentId)));

    return NextResponse.json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ message: 'Failed to delete comment.' }, { status: 500 });
  }
} 
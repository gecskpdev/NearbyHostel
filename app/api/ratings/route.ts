import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { ratings } from '../../../lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hostelId = searchParams.get('hostelId');

    if (!hostelId) {
      return NextResponse.json({ message: 'Hostel ID is required.' }, { status: 400 });
    }

    const hostelRatings = await db.select().from(ratings).where(eq(ratings.hostelId, parseInt(hostelId)));

    return NextResponse.json(hostelRatings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json({ message: 'Failed to fetch ratings.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // userId is now the DB user ID (integer)
    const { hostelId, userId, overallRating } = await req.json();
    const hostelIdNum = Number(hostelId);
    const userIdNum = Number(userId);

    // Type guard for new logic
    if (typeof hostelIdNum !== 'number' || isNaN(hostelIdNum) || typeof userIdNum !== 'number' || isNaN(userIdNum)) {
      return NextResponse.json({ message: 'Invalid hostelId or userId.' }, { status: 400 });
    }

    // Duplicate check (using DB user ID now)
    const existingRating = await db.select().from(ratings)
      .where(and(eq(ratings.hostelId, hostelIdNum), eq(ratings.userId, userIdNum)));

    if (existingRating.length > 0) {
      return NextResponse.json({ message: 'You have already rated this hostel.' }, { status: 400 });
    }

    const [newRating] = await db.insert(ratings).values({
      hostelId: hostelIdNum,
      userId: userIdNum,
      overallRating,
      createdAt: new Date(),
    }).returning();

    return NextResponse.json(newRating, { status: 201 });
  } catch (error) {
    console.error('Error adding rating:', error);
    return NextResponse.json({ message: 'Failed to add rating.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { ratingId, overallRating } = await req.json();

    if (!ratingId) {
      return NextResponse.json({ message: 'Rating ID is required for update.' }, { status: 400 });
    }

    await db.update(ratings).set({
      overallRating,
    }).where(eq(ratings.ratingId, ratingId));

    return NextResponse.json({ message: 'Rating updated successfully.' });
  } catch (error) {
    console.error('Error updating rating:', error);
    return NextResponse.json({ message: 'Failed to update rating.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ratingId = searchParams.get('ratingId');

    if (!ratingId) {
      return NextResponse.json({ message: 'Rating ID is required for deletion.' }, { status: 400 });
    }

    await db.delete(ratings).where(eq(ratings.ratingId, parseInt(ratingId)));

    return NextResponse.json({ message: 'Rating deleted successfully.' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return NextResponse.json({ message: 'Failed to delete rating.' }, { status: 500 });
  }
} 

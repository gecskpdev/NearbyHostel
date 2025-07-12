import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { users } from '../../../../lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { firebaseUid, displayName } = await req.json();
    if (!firebaseUid || typeof firebaseUid !== 'string') {
      return NextResponse.json({ message: 'firebaseUid is required.' }, { status: 400 });
    }

    // Try to find the user by firebaseUid
    let user = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    if (user.length > 0) {
      return NextResponse.json({ userId: user[0].uid, displayName: user[0].displayName });
    }

    // If not found, create the user with default userRole 'user' and displayName if provided
    const [newUser] = await db.insert(users).values({ firebaseUid, userRole: 'user', displayName }).returning();
    return NextResponse.json({ userId: newUser.uid, displayName: newUser.displayName });
  } catch (error) {
    console.error('Error in user lookup:', error);
    return NextResponse.json({ message: 'Failed to lookup or create user.' }, { status: 500 });
  }
} 
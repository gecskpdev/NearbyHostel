import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { comments } from '../../../../lib/schema';
import { sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const allComments = await db.select().from(comments).orderBy(sql`${comments.createdAt} DESC`);
    return NextResponse.json(allComments);
  } catch (error) {
    console.error('Error fetching all comments:', error);
    return NextResponse.json({ message: 'Failed to fetch comments.' }, { status: 500 });
  }
} 
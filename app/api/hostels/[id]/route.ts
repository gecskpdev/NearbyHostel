import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { hostels, hostelImages, ratings, comments, hostelOptions, categories, categoryOptionValues } from '../../../../lib/schema';
import { eq, and, sql, avg, count } from 'drizzle-orm';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const hostelId = parseInt(id);
    if (isNaN(hostelId)) {
      return NextResponse.json({ message: 'Invalid hostel ID.' }, { status: 400 });
    }

    const hostel = await db.select().from(hostels).where(and(eq(hostels.hostelId, hostelId), eq(hostels.isActive, true)));
    if (!hostel || hostel.length === 0) {
      return NextResponse.json({ message: 'Hostel not found.' }, { status: 404 });
    }
    const h = hostel[0];

    // Fetch categories and options
    const hostelCategoryOptions: { categoryName: string; optionName: string }[] = [];
    const hostelOpts = await db.select({
      categoryId: hostelOptions.categoryId,
      optionId: hostelOptions.optionId
    })
      .from(hostelOptions)
      .where(eq(hostelOptions.hostelId, hostelId));

    for (const opt of hostelOpts) {
      const category = await db.select({ categoryName: categories.category }).from(categories).where(eq(categories.categoryId, opt.categoryId!));
      if (category.length > 0) {
        const optionValue = await db.select({ optionName: categoryOptionValues.optionName }).from(categoryOptionValues).where(eq(categoryOptionValues.optionId, opt.optionId!));
        if (optionValue.length > 0) {
          hostelCategoryOptions.push({
            categoryName: category[0].categoryName!,
            optionName: optionValue[0].optionName!,
          });
        }
      }
    }

    // Fetch images
    const hostelImagesData = await db.select().from(hostelImages).where(eq(hostelImages.hostelId, hostelId));

    // Fetch average rating
    const ratingData = await db.select({
      averageRating: avg(ratings.overallRating),
      totalRatings: count(ratings.ratingId)
    }).from(ratings).where(eq(ratings.hostelId, hostelId));

    // Fetch recent comments
    const recentComments = await db.select().from(comments)
      .where(eq(comments.hostelId, hostelId))
      .orderBy(sql`${comments.createdAt} DESC`)
      .limit(10);

    const result = {
      ...h,
      categories: hostelCategoryOptions,
      images: hostelImagesData,
      averageRating: ratingData[0]?.averageRating ? Number(ratingData[0].averageRating) : null,
      totalRatings: Number(ratingData[0]?.totalRatings || 0),
      comments: recentComments,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching hostel by ID:', error);
    return NextResponse.json({ message: 'Failed to fetch hostel.' }, { status: 500 });
  }
} 
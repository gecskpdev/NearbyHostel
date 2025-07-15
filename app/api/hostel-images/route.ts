import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { hostelImages } from '../../../lib/schema';
import { eq } from 'drizzle-orm';
import { uploadImageToCloudinary } from '@/util/uploadImage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hostelId = searchParams.get('hostelId');

    if (!hostelId) {
      return NextResponse.json({ message: 'Hostel ID is required.' }, { status: 400 });
    }

    const images = await db.select().from(hostelImages)
      .where(eq(hostelImages.hostelId, parseInt(hostelId)))
      .orderBy(hostelImages.uploadedAt);

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching hostel images:', error);
    return NextResponse.json({ message: 'Failed to fetch hostel images.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse multipart/form-data
    const formData = await req.formData();
    const hostelId = formData.get('hostelId');
    const imageType = formData.get('imageType') || 'general';
    const isPrimary = formData.get('isPrimary') === 'true';
    const file = formData.get('file');

    if (!hostelId || !file || typeof file === 'string') {
      return NextResponse.json({ message: 'hostelId and image file are required.' }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}_${file.name}`;

    // Upload to Cloudinary
    const result: any = await uploadImageToCloudinary(buffer, filename);
    const imageUrl = result.secure_url;

    // If this is a primary image, unset other primary images for this hostel
    if (isPrimary) {
      await db.update(hostelImages)
        .set({ isPrimary: false })
        .where(eq(hostelImages.hostelId, Number(hostelId)));
    }

    const [newImage] = await db.insert(hostelImages).values({
      hostelId: Number(hostelId),
      imageUrl,
      imageType: imageType as string,
      isPrimary: isPrimary || false,
      uploadedAt: new Date(),
    }).returning();

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error('Error adding hostel image:', error);
    return NextResponse.json({ message: 'Failed to add hostel image.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { imageId, imageUrl, imageType, isPrimary } = await req.json();

    if (!imageId) {
      return NextResponse.json({ message: 'Image ID is required for update.' }, { status: 400 });
    }

    // If this is a primary image, unset other primary images for this hostel
    if (isPrimary) {
      const image = await db.select({ hostelId: hostelImages.hostelId }).from(hostelImages).where(eq(hostelImages.imageId, imageId));
      if (image.length > 0) {
        await db.update(hostelImages)
          .set({ isPrimary: false })
          .where(eq(hostelImages.hostelId, image[0].hostelId));
      }
    }

    const updateData: any = {};
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (imageType !== undefined) updateData.imageType = imageType;
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary;

    await db.update(hostelImages).set(updateData).where(eq(hostelImages.imageId, imageId));

    return NextResponse.json({ message: 'Hostel image updated successfully.' });
  } catch (error) {
    console.error('Error updating hostel image:', error);
    return NextResponse.json({ message: 'Failed to update hostel image.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json({ message: 'Image ID is required for deletion.' }, { status: 400 });
    }

    await db.delete(hostelImages).where(eq(hostelImages.imageId, parseInt(imageId)));

    return NextResponse.json({ message: 'Hostel image deleted successfully.' });
  } catch (error) {
    console.error('Error deleting hostel image:', error);
    return NextResponse.json({ message: 'Failed to delete hostel image.' }, { status: 500 });
  }
} 
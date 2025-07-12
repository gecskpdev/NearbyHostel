import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { hostels, hostelImages, ratings, comments, hostelOptions, categories, categoryOptionValues } from '../../../lib/schema';
import { eq, and, sql, avg, count } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const allHostels = await db.select().from(hostels).where(eq(hostels.isActive, true));
    
    // Fetch categories and options for each hostel
    const finalHostels = await Promise.all(allHostels.map(async (hostel) => {
      const hostelCategoryOptions: { categoryName: string; optionName: string }[] = [];

      const hostelOpts = await db.select({
          categoryId: hostelOptions.categoryId,
          optionId: hostelOptions.optionId
      })
        .from(hostelOptions)
        .where(eq(hostelOptions.hostelId, hostel.hostelId));

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
      const hostelImagesData = await db.select().from(hostelImages).where(eq(hostelImages.hostelId, hostel.hostelId));

      // Fetch average rating
      const ratingData = await db.select({
        averageRating: avg(ratings.overallRating),
        totalRatings: count(ratings.ratingId)
      }).from(ratings).where(eq(ratings.hostelId, hostel.hostelId));

      // Fetch recent comments
      const recentComments = await db.select().from(comments)
        .where(eq(comments.hostelId, hostel.hostelId))
        .orderBy(sql`${comments.createdAt} DESC`)
        .limit(5);

      return {
        ...hostel,
        categories: hostelCategoryOptions,
        images: hostelImagesData,
        averageRating: ratingData[0]?.averageRating ? Number(ratingData[0].averageRating) : null,
        totalRatings: Number(ratingData[0]?.totalRatings || 0),
        comments: recentComments,
      };
    }));

    console.log('GET /api/hostels - Final hostels data sent:', JSON.stringify(finalHostels, null, 2));

    return NextResponse.json(finalHostels);
  } catch (error) {
    console.error('Error fetching hostels:', error);
    
    // Return sample data for testing when database is not connected
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      console.log('Database not connected, returning sample data for testing');
      return NextResponse.json([
        {
          hostelId: 1,
          hostelName: "Sample Hostel - Backpacker's Paradise",
          hostelDescription: "A vibrant hostel in the heart of the city, perfect for budget travelers looking to meet fellow adventurers. Features a lively common room, free breakfast, and organized tours.",
          location: "https://maps.google.com/?q=123+Main+St+City+Center",
          address: "123 Main Street, City Center, 12345",
          phoneNumber: "+1 555 123 4567",
          email: "info@backpackersparadise.com",
          website: "https://www.backpackersparadise.com",
          priceRange: "$25-50",
          createdAt: new Date().toISOString(),
          isActive: true,
          categories: [
            { categoryName: "Amenities", optionName: "Free WiFi" },
            { categoryName: "Room Type", optionName: "Dormitory" },
            { categoryName: "Location Type", optionName: "City Center" },
            { categoryName: "Price Range", optionName: "Economy ($25-50)" },
            { categoryName: "Atmosphere", optionName: "Party/Social" }
          ],
          images: [
            {
              imageId: 1,
              imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
              imageType: "general",
              isPrimary: true,
              uploadedAt: new Date().toISOString()
            }
          ],
          averageRating: 4.5,
          totalRatings: 127,
          comments: [
            {
              commentId: 1,
              commentText: "Great atmosphere and friendly staff! Perfect for meeting other travelers.",
              userName: "Sarah M.",
              userEmail: "sarah@example.com",
              isVerified: true,
              createdAt: new Date().toISOString()
            }
          ]
        },
        {
          hostelId: 2,
          hostelName: "Mountain View Lodge",
          hostelDescription: "Peaceful hostel with stunning mountain views. Perfect for nature lovers and those seeking a quiet retreat. Features hiking trails, garden, and cozy common areas.",
          location: "https://maps.google.com/?q=456+Mountain+Rd+Scenic+View",
          address: "456 Mountain Road, Scenic View, 67890",
          phoneNumber: "+1 555 987 6543",
          email: "hello@mountainviewlodge.com",
          website: "https://www.mountainviewlodge.com",
          priceRange: "$50-100",
          createdAt: new Date().toISOString(),
          isActive: true,
          categories: [
            { categoryName: "Amenities", optionName: "Garden/Terrace" },
            { categoryName: "Room Type", optionName: "Private Room" },
            { categoryName: "Location Type", optionName: "Mountain View" },
            { categoryName: "Price Range", optionName: "Mid-range ($50-100)" },
            { categoryName: "Atmosphere", optionName: "Quiet/Relaxed" }
          ],
          images: [
            {
              imageId: 2,
              imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
              imageType: "general",
              isPrimary: true,
              uploadedAt: new Date().toISOString()
            }
          ],
          averageRating: 4.8,
          totalRatings: 89,
          comments: [
            {
              commentId: 2,
              commentText: "Absolutely beautiful location and very peaceful. Perfect for a relaxing getaway.",
              userName: "Mike R.",
              userEmail: "mike@example.com",
              isVerified: true,
              createdAt: new Date().toISOString()
            }
          ]
        }
      ]);
    }
    
    return NextResponse.json({ message: 'Failed to fetch hostels.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { hostelName, hostelDescription, location, address, phoneNumber, email, website, priceRange, hostelCategoryOptions } = await req.json();

    console.log('POST /api/hostels - Incoming hostel data:', { hostelName, hostelDescription, hostelCategoryOptions });

    const [newHostel] = await db.insert(hostels).values({
      hostelName,
      hostelDescription,
      location,
      address,
      phoneNumber,
      email,
      website,
      priceRange,
      createdAt: new Date(),
    }).returning({ hostelId: hostels.hostelId });

    if (!newHostel || !newHostel.hostelId) {
      console.error('Failed to insert new hostel:', hostelName);
      return NextResponse.json({ message: 'Failed to create hostel.' }, { status: 500 });
    }

    console.log('POST /api/hostels - New hostel created with ID:', newHostel.hostelId);

    // Link hostel to categories using the dynamic schema
    if (hostelCategoryOptions && newHostel.hostelId) {
      for (const mapping of hostelCategoryOptions) {
        console.log(`POST /api/hostels - Processing category mapping: ${mapping.categoryName} = ${mapping.optionName}`);
        if (mapping.optionName) { 
          const category = await db.select({ categoryId: categories.categoryId }).from(categories).where(eq(categories.category, mapping.categoryName));
          console.log(`POST /api/hostels - Category lookup result for ${mapping.categoryName}:`, category);

          if (category.length > 0 && category[0].categoryId) {
            const option = await db.select({ optionId: categoryOptionValues.optionId }).from(categoryOptionValues)
                                   .where(and(
                                       eq(categoryOptionValues.optionName, mapping.optionName),
                                       eq(categoryOptionValues.categoryId, category[0].categoryId)
                                   ));
            console.log(`POST /api/hostels - Option lookup result for ${mapping.optionName} in category ${mapping.categoryName}:`, option);

            if (option.length > 0 && option[0].optionId) {
              console.log('POST /api/hostels - Inserting into hostelOptions:', { hostelId: newHostel.hostelId, categoryId: category[0].categoryId, optionId: option[0].optionId });
              await db.insert(hostelOptions).values({
                hostelId: newHostel.hostelId,
                categoryId: category[0].categoryId,
                optionId: option[0].optionId,
              });
              console.log('POST /api/hostels - Inserted into hostelOptions.');
            } else {
              console.warn(`POST /api/hostels - Option not found for ${mapping.optionName} in category ${mapping.categoryName}. Skipping linking.`);
            }
          } else {
            console.warn(`POST /api/hostels - Category not found for name: ${mapping.categoryName}. Skipping linking.`);
          }
        } else {
          console.log(`POST /api/hostels - Option name is empty for category ${mapping.categoryName}. Skipping linking.`);
        }
      }
    }

    return NextResponse.json(newHostel, { status: 201 });
  } catch (error) {
    console.error('Error adding hostel:', error);
    return NextResponse.json({ message: 'Failed to add hostel.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { hostelId, hostelName, hostelDescription, location, address, phoneNumber, email, website, priceRange, hostelCategoryOptions } = await req.json();

    console.log('PUT /api/hostels - Incoming hostel data:', { hostelId, hostelName, hostelDescription, hostelCategoryOptions });

    if (!hostelId) {
      return NextResponse.json({ message: 'Hostel ID is required for update.' }, { status: 400 });
    }

    // Update hostel details
    await db.update(hostels).set({
      hostelName,
      hostelDescription,
      location,
      address,
      phoneNumber,
      email,
      website,
      priceRange,
    }).where(eq(hostels.hostelId, hostelId));

    console.log('PUT /api/hostels - Hostel details updated.');

    // Update hostel category options: clear existing and insert new ones
    await db.delete(hostelOptions).where(eq(hostelOptions.hostelId, hostelId));
    if (hostelCategoryOptions && hostelCategoryOptions.length > 0) {
      for (const mapping of hostelCategoryOptions) {
        console.log(`PUT /api/hostels - Processing category mapping: ${mapping.categoryName} = ${mapping.optionName}`);
        if (mapping.optionName) {
          const category = await db.select({ categoryId: categories.categoryId }).from(categories).where(eq(categories.category, mapping.categoryName));

          if (category.length > 0 && category[0].categoryId) {
            const option = await db.select({ optionId: categoryOptionValues.optionId }).from(categoryOptionValues)
                                   .where(and(
                                       eq(categoryOptionValues.optionName, mapping.optionName),
                                       eq(categoryOptionValues.categoryId, category[0].categoryId)
                                   ));
            console.log(`PUT /api/hostels - Option lookup result for ${mapping.optionName} in category ${mapping.categoryName}:`, option);

            if (option.length > 0 && option[0].optionId) {
              await db.insert(hostelOptions).values({
                hostelId: hostelId,
                categoryId: category[0].categoryId,
                optionId: option[0].optionId,
              });
            } else {
              console.warn(`PUT /api/hostels - Option not found for ${mapping.optionName} in category ${mapping.categoryName}. Skipping linking.`);
            }
          } else {
            console.warn(`PUT /api/hostels - Category not found for name: ${mapping.categoryName}. Skipping linking.`);
          }
        } else {
          console.log(`PUT /api/hostels - Option name is empty for category ${mapping.categoryName}. Skipping linking.`);
        }
      }
    }

    return NextResponse.json({ message: 'Hostel updated successfully.' });
  } catch (error) {
    console.error('Error updating hostel:', error);
    return NextResponse.json({ message: 'Failed to update hostel.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hostelId = searchParams.get('hostelId');

    if (!hostelId) {
      return NextResponse.json({ message: 'Hostel ID is required for deletion.' }, { status: 400 });
    }

    // Soft delete by setting isActive to false
    await db.update(hostels).set({ isActive: false }).where(eq(hostels.hostelId, parseInt(hostelId)));

    return NextResponse.json({ message: 'Hostel deleted successfully.' });
  } catch (error) {
    console.error('Error deleting hostel:', error);
    return NextResponse.json({ message: 'Failed to delete hostel.' }, { status: 500 });
  }
} 
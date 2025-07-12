import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { categories, categoryOptionValues, hostelOptions } from "@/lib/schema";
import { sql, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const allCategories = await db.select().from(categories);
    
    const categoriesWithOptions = await Promise.all(allCategories.map(async (category) => {
      const options = await db.select().from(categoryOptionValues).where(eq(categoryOptionValues.categoryId, category.categoryId));
      
      return {
        categoryId: category.categoryId,
        categoryName: category.category,
        options: options.map(option => ({
          optionId: option.optionId,
          optionName: option.optionName
        }))
      };
    }));

    return NextResponse.json(categoriesWithOptions);
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Return sample categories for testing when database is not connected
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      console.log('Database not connected, returning sample categories for testing');
      return NextResponse.json([
        {
          categoryId: 1,
          categoryName: "Amenities",
          options: [
            { optionId: 1, optionName: "Free WiFi" },
            { optionId: 2, optionName: "Kitchen" },
            { optionId: 3, optionName: "Laundry" },
            { optionId: 4, optionName: "Common Room" },
            { optionId: 5, optionName: "Garden/Terrace" },
            { optionId: 6, optionName: "Bar" },
            { optionId: 7, optionName: "Breakfast Included" },
            { optionId: 8, optionName: "Air Conditioning" },
            { optionId: 9, optionName: "Heating" },
            { optionId: 10, optionName: "Luggage Storage" },
            { optionId: 11, optionName: "24/7 Reception" },
            { optionId: 12, optionName: "Security Lockers" },
            { optionId: 13, optionName: "Bicycle Rental" },
            { optionId: 14, optionName: "Tour Desk" },
            { optionId: 15, optionName: "BBQ Area" }
          ]
        },
        {
          categoryId: 2,
          categoryName: "Room Type",
          options: [
            { optionId: 16, optionName: "Dormitory" },
            { optionId: 17, optionName: "Private Room" },
            { optionId: 18, optionName: "Double Room" },
            { optionId: 19, optionName: "Twin Room" },
            { optionId: 20, optionName: "Single Room" },
            { optionId: 21, optionName: "Family Room" },
            { optionId: 22, optionName: "Female Only Dorm" },
            { optionId: 23, optionName: "Male Only Dorm" },
            { optionId: 24, optionName: "Mixed Dorm" }
          ]
        },
        {
          categoryId: 3,
          categoryName: "Location Type",
          options: [
            { optionId: 25, optionName: "City Center" },
            { optionId: 26, optionName: "Near Train Station" },
            { optionId: 27, optionName: "Near Airport" },
            { optionId: 28, optionName: "Beachfront" },
            { optionId: 29, optionName: "Mountain View" },
            { optionId: 30, optionName: "Rural Area" },
            { optionId: 31, optionName: "University District" },
            { optionId: 32, optionName: "Shopping District" },
            { optionId: 33, optionName: "Historic District" },
            { optionId: 34, optionName: "Business District" }
          ]
        },
        {
          categoryId: 4,
          categoryName: "Price Range",
          options: [
            { optionId: 35, optionName: "Budget ($10-25)" },
            { optionId: 36, optionName: "Economy ($25-50)" },
            { optionId: 37, optionName: "Mid-range ($50-100)" },
            { optionId: 38, optionName: "Premium ($100-200)" },
            { optionId: 39, optionName: "Luxury ($200+)" }
          ]
        },
        {
          categoryId: 5,
          categoryName: "Atmosphere",
          options: [
            { optionId: 40, optionName: "Party/Social" },
            { optionId: 41, optionName: "Quiet/Relaxed" },
            { optionId: 42, optionName: "Family Friendly" },
            { optionId: 43, optionName: "Backpacker" },
            { optionId: 44, optionName: "Digital Nomad" },
            { optionId: 45, optionName: "Student" },
            { optionId: 46, optionName: "Eco-friendly" },
            { optionId: 47, optionName: "Boutique" },
            { optionId: 48, optionName: "Traditional" }
          ]
        }
      ]);
    }
    
    return NextResponse.json({ message: 'Failed to fetch categories.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { categoryName, options } = await req.json();

    const [newCategory] = await db.insert(categories).values({
      category: categoryName
    }).returning({ categoryId: categories.categoryId });

    if (options && options.length > 0) {
      for (const option of options) {
        await db.insert(categoryOptionValues).values({
          optionName: typeof option === 'string' ? option : option.optionName,
          categoryId: newCategory.categoryId
        });
      }
    }

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ message: 'Failed to add category.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { categoryId, categoryName, options } = await req.json();

    console.log('PUT /api/categories - Incoming data:', { categoryId, categoryName, options });

    if (!categoryId || !categoryName) {
      console.error('Validation Error: Category ID or name missing for update.', { categoryId, categoryName });
      return NextResponse.json({ message: "Category ID and name are required for update." }, { status: 400 });
    }

    const [updatedCategory] = await db.update(categories)
      .set({ category: categoryName })
      .where(eq(categories.categoryId, categoryId))
      .returning();

    console.log('PUT /api/categories - Updated category result:', updatedCategory);

    if (!updatedCategory) {
      console.error('Category Not Found: No category found with ID:', categoryId);
      return NextResponse.json({ message: "Category not found." }, { status: 404 });
    }

    const optionsToProcess = Array.isArray(options) ? options : [];

    if (optionsToProcess.length > 0) {
      console.log('PUT /api/categories - Deleting existing hostel options for categoryId:', categoryId);
      // First, delete related entries from hostelOptions to satisfy foreign key constraint
      await db.delete(hostelOptions).where(eq(hostelOptions.categoryId, categoryId));
      console.log('PUT /api/categories - Existing hostel options deleted.');

      console.log('PUT /api/categories - Deleting existing category options for categoryId:', categoryId);
      await db.delete(categoryOptionValues).where(eq(categoryOptionValues.categoryId, categoryId));
      console.log('PUT /api/categories - Existing category options deleted.');

      const optionsToInsert = [];
      for (const option of optionsToProcess) {
        if (option.optionName) { // Only insert options with a name
          optionsToInsert.push({ 
            optionName: option.optionName, 
            categoryId: categoryId 
          });
        }
      }
      
      if (optionsToInsert.length > 0) {
        console.log('PUT /api/categories - Inserting new options:', optionsToInsert);
        await db.insert(categoryOptionValues).values(optionsToInsert).execute();
        console.log('PUT /api/categories - New options inserted.');
      } else {
        console.log('PUT /api/categories - No valid options to insert.');
      }
    } else if (optionsToProcess.length === 0 && options !== undefined) { // Check if options was explicitly an empty array
      console.log('PUT /api/categories - Options array is empty, deleting all existing hostel options and category options.');
      // Delete related entries from hostelOptions first
      await db.delete(hostelOptions).where(eq(hostelOptions.categoryId, categoryId));
      await db.delete(categoryOptionValues).where(eq(categoryOptionValues.categoryId, categoryId));
    } else {
      console.log('PUT /api/categories - No options provided or options is not an array. Skipping option updates.');
    }

    return NextResponse.json({ message: "Category updated successfully." });
  } catch (error) {
    console.error("Error updating category:", error);
    // Re-throw or return more specific error if possible
    return NextResponse.json({ message: "Failed to update category.", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { categoryId } = await req.json();

    if (!categoryId) {
      return NextResponse.json({ message: "Category ID is required for deletion." }, { status: 400 });
    }

    await db.delete(categoryOptionValues).where(eq(categoryOptionValues.categoryId, categoryId));

    const [deletedCategory] = await db.delete(categories).where(eq(categories.categoryId, categoryId)).returning();

    if (!deletedCategory) {
      return NextResponse.json({ message: "Category not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ message: "Failed to delete category.", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 
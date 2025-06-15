import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { categories, categoryOptionValues, projectOptions } from "@/lib/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    const allCategories = await db.select().from(categories).execute();
    
    const results = await Promise.all(allCategories.map(async (cat) => {
      let options: { optionId: number | null; optionName: string | null; }[] = [];
      options = await db.select({ optionId: categoryOptionValues.optionId, optionName: categoryOptionValues.optionName })
                        .from(categoryOptionValues)
                        .where(eq(categoryOptionValues.categoryId, cat.categoryId!))
                        .execute();
      return { categoryId: cat.categoryId, categoryName: cat.category, options: options.filter(o => o.optionName !== null) };
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ message: "Failed to fetch categories", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { categoryName, options } = await req.json();

    if (!categoryName) {
      return NextResponse.json({ message: "Category name is required." }, { status: 400 });
    }

    const [newCategory] = await db.insert(categories).values({ category: categoryName }).returning({ categoryId: categories.categoryId });

    if (options && options.length > 0 && newCategory && newCategory.categoryId) {
      for (const option of options) {
        if (option.optionName) {
          await db.insert(categoryOptionValues).values({ 
            optionName: option.optionName, 
            categoryId: newCategory.categoryId 
          }).execute();
        }
      }
    }

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json({ message: "Failed to add category.", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
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
      console.log('PUT /api/categories - Deleting existing project options for categoryId:', categoryId);
      // First, delete related entries from projectOptions to satisfy foreign key constraint
      await db.delete(projectOptions).where(eq(projectOptions.categoryId, categoryId));
      console.log('PUT /api/categories - Existing project options deleted.');

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
      console.log('PUT /api/categories - Options array is empty, deleting all existing project options and category options.');
      // Delete related entries from projectOptions first
      await db.delete(projectOptions).where(eq(projectOptions.categoryId, categoryId));
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
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { categories, categoryOptionValues } from '../../../lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryName = searchParams.get('categoryName');

    if (!categoryName) {
      return NextResponse.json({ message: 'Category name is required.' }, { status: 400 });
    }

    // Find the category by name to get its ID
    const category = await db.select().from(categories).where(eq(categories.category, categoryName)).execute();
    if (category.length === 0 || !category[0].categoryId) {
      return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    }
    const categoryId = category[0].categoryId;

    // Fetch options from the generic categoryOptionValues table for this categoryId
    const options = await db.select({ optionId: categoryOptionValues.optionId, optionName: categoryOptionValues.optionName })
                            .from(categoryOptionValues)
                            .where(eq(categoryOptionValues.categoryId, categoryId))
                            .execute();
    return NextResponse.json(options);
  } catch (error) {
    console.error('Error fetching category options:', error);
    return NextResponse.json({ message: 'Failed to fetch category options.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { categoryName, optionName } = await req.json();

    if (!categoryName || !optionName) {
      return NextResponse.json({ message: 'Category name and option name are required.' }, { status: 400 });
    }

    // Find the category by name to get its ID
    const category = await db.select().from(categories).where(eq(categories.category, categoryName)).execute();
    if (category.length === 0 || !category[0].categoryId) {
      return NextResponse.json({ message: 'Category not found. Cannot add option.' }, { status: 404 });
    }
    const categoryId = category[0].categoryId;

    // Insert new option into the generic categoryOptionValues table
    const [newOption] = await db.insert(categoryOptionValues).values({ optionName, categoryId }).returning();
    return NextResponse.json(newOption, { status: 201 });
  } catch (error) {
    console.error('Error adding category option:', error);
    return NextResponse.json({ message: 'Failed to add category option.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { categoryName, optionId, optionName } = await req.json();

    if (!categoryName || !optionId || !optionName) {
      return NextResponse.json({ message: 'Category name, option ID, and new option name are required.' }, { status: 400 });
    }

    // Find the category by name to get its ID (though optionId should be sufficient if unique across categories)
    const category = await db.select().from(categories).where(eq(categories.category, categoryName)).execute();
    if (category.length === 0 || !category[0].categoryId) {
      return NextResponse.json({ message: 'Category not found. Cannot update option.' }, { status: 404 });
    }
    const categoryId = category[0].categoryId;

    // Update option in the generic categoryOptionValues table
    const [updatedOption] = await db.update(categoryOptionValues).set({ optionName })
      .where(and(eq(categoryOptionValues.optionId, optionId), eq(categoryOptionValues.categoryId, categoryId)))
      .returning();

    if (!updatedOption) {
      return NextResponse.json({ message: 'Option not found or does not belong to the specified category.' }, { status: 404 });
    }

    return NextResponse.json(updatedOption);
  } catch (error) {
    console.error('Error updating category option:', error);
    return NextResponse.json({ message: 'Failed to update category option.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { categoryName, optionId } = await req.json();

    if (!categoryName || !optionId) {
      return NextResponse.json({ message: 'Category name and option ID are required.' }, { status: 400 });
    }

    // Find the category by name to get its ID
    const category = await db.select().from(categories).where(eq(categories.category, categoryName)).execute();
    if (category.length === 0 || !category[0].categoryId) {
      return NextResponse.json({ message: 'Category not found. Cannot delete option.' }, { status: 404 });
    }
    const categoryId = category[0].categoryId;

    // Delete option from the generic categoryOptionValues table
    const [deletedOption] = await db.delete(categoryOptionValues)
      .where(and(eq(categoryOptionValues.optionId, optionId), eq(categoryOptionValues.categoryId, categoryId)))
      .returning();

    if (!deletedOption) {
      return NextResponse.json({ message: 'Option not found or does not belong to the specified category.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Option deleted successfully.' });
  } catch (error) {
    console.error('Error deleting category option:', error);
    return NextResponse.json({ message: 'Failed to delete category option.' }, { status: 500 });
  }
} 
import { db } from '../lib/db';
import { categories, categoryOptionValues } from '../lib/schema';

export async function seedHostelCategories() {
  try {
    console.log('Seeding hostel categories...');

    // Insert categories
    const hostelCategories = [
      { category: 'Amenities' },
      { category: 'Room Type' },
      { category: 'Location Type' },
      { category: 'Price Range' },
      { category: 'Atmosphere' },
    ];

    for (const category of hostelCategories) {
      const [insertedCategory] = await db.insert(categories).values(category).returning();
      console.log(`Inserted category: ${category.category}`);

      // Insert options for each category
      let options: string[] = [];

      switch (category.category) {
        case 'Amenities':
          options = [
            'Free WiFi',
            'Kitchen',
            'Laundry',
            'Common Room',
            'Garden/Terrace',
            'Bar',
            'Breakfast Included',
            'Air Conditioning',
            'Heating',
            'Luggage Storage',
            '24/7 Reception',
            'Security Lockers',
            'Bicycle Rental',
            'Tour Desk',
            'BBQ Area'
          ];
          break;

        case 'Room Type':
          options = [
            'Dormitory',
            'Private Room',
            'Double Room',
            'Twin Room',
            'Single Room',
            'Family Room',
            'Female Only Dorm',
            'Male Only Dorm',
            'Mixed Dorm'
          ];
          break;

        case 'Location Type':
          options = [
            'City Center',
            'Near Train Station',
            'Near Airport',
            'Beachfront',
            'Mountain View',
            'Rural Area',
            'University District',
            'Shopping District',
            'Historic District',
            'Business District'
          ];
          break;

        case 'Price Range':
          options = [
            'Budget ($10-25)',
            'Economy ($25-50)',
            'Mid-range ($50-100)',
            'Premium ($100-200)',
            'Luxury ($200+)'
          ];
          break;

        case 'Atmosphere':
          options = [
            'Party/Social',
            'Quiet/Relaxed',
            'Family Friendly',
            'Backpacker',
            'Digital Nomad',
            'Student',
            'Eco-friendly',
            'Boutique',
            'Traditional'
          ];
          break;
      }

      for (const option of options) {
        await db.insert(categoryOptionValues).values({
          optionName: option,
          categoryId: insertedCategory.categoryId,
        });
        console.log(`Inserted option: ${option} for category: ${category.category}`);
      }
    }

    console.log('Hostel categories seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding hostel categories:', error);
    throw error;
  }
}

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedHostelCategories()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 
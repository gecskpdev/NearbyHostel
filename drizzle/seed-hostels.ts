import { db } from '../lib/db';
import { hostels, hostelOptions, categories, categoryOptionValues } from '../lib/schema';
import { eq } from 'drizzle-orm';

export async function seedHostels() {
  try {
    console.log('Seeding sample hostels...');

    // Sample hostel data
    const sampleHostels = [
      {
        hostelName: "Backpacker's Paradise",
        hostelDescription: "A vibrant hostel in the heart of the city, perfect for budget travelers looking to meet fellow adventurers. Features a lively common room, free breakfast, and organized tours.",
        location: "https://maps.google.com/?q=123+Main+St+City+Center",
        address: "123 Main Street, City Center, 12345",
        phoneNumber: "+1 555 123 4567",
        email: "info@backpackersparadise.com",
        website: "https://www.backpackersparadise.com",
        priceRange: "$25-50",
        categories: {
          'Amenities': 'Free WiFi',
          'Room Type': 'Dormitory',
          'Location Type': 'City Center',
          'Price Range': 'Economy ($25-50)',
          'Atmosphere': 'Party/Social'
        }
      },
      {
        hostelName: "Mountain View Lodge",
        hostelDescription: "Peaceful hostel with stunning mountain views. Perfect for nature lovers and those seeking a quiet retreat. Features hiking trails, garden, and cozy common areas.",
        location: "https://maps.google.com/?q=456+Mountain+Rd+Scenic+View",
        address: "456 Mountain Road, Scenic View, 67890",
        phoneNumber: "+1 555 987 6543",
        email: "hello@mountainviewlodge.com",
        website: "https://www.mountainviewlodge.com",
        priceRange: "$50-100",
        categories: {
          'Amenities': 'Garden/Terrace',
          'Room Type': 'Private Room',
          'Location Type': 'Mountain View',
          'Price Range': 'Mid-range ($50-100)',
          'Atmosphere': 'Quiet/Relaxed'
        }
      },
      {
        hostelName: "Beachside Bunkhouse",
        hostelDescription: "Steps away from the beach, this hostel offers the perfect blend of beach life and social atmosphere. Features beach access, surfboard rentals, and beachfront BBQ area.",
        location: "https://maps.google.com/?q=789+Beach+Ave+Coastal+Town",
        address: "789 Beach Avenue, Coastal Town, 11111",
        phoneNumber: "+1 555 456 7890",
        email: "stay@beachsidebunkhouse.com",
        website: "https://www.beachsidebunkhouse.com",
        priceRange: "$30-60",
        categories: {
          'Amenities': 'BBQ Area',
          'Room Type': 'Mixed Dorm',
          'Location Type': 'Beachfront',
          'Price Range': 'Economy ($25-50)',
          'Atmosphere': 'Backpacker'
        }
      },
      {
        hostelName: "Digital Nomad Hub",
        hostelDescription: "Designed for remote workers and digital nomads. Features high-speed WiFi, dedicated workspaces, quiet zones, and networking events. Perfect for productivity and community.",
        location: "https://maps.google.com/?q=321+Tech+St+Innovation+District",
        address: "321 Tech Street, Innovation District, 22222",
        phoneNumber: "+1 555 789 0123",
        email: "work@digitalnomadhub.com",
        website: "https://www.digitalnomadhub.com",
        priceRange: "$75-150",
        categories: {
          'Amenities': 'Free WiFi',
          'Room Type': 'Private Room',
          'Location Type': 'Business District',
          'Price Range': 'Mid-range ($50-100)',
          'Atmosphere': 'Digital Nomad'
        }
      },
      {
        hostelName: "Historic Inn",
        hostelDescription: "A beautifully restored historic building in the heart of the old town. Experience the charm of the past with modern comforts. Features guided tours and cultural events.",
        location: "https://maps.google.com/?q=654+Heritage+Ln+Old+Town",
        address: "654 Heritage Lane, Old Town, 33333",
        phoneNumber: "+1 555 321 6540",
        email: "experience@historicinn.com",
        website: "https://www.historicinn.com",
        priceRange: "$100-200",
        categories: {
          'Amenities': 'Tour Desk',
          'Room Type': 'Double Room',
          'Location Type': 'Historic District',
          'Price Range': 'Premium ($100-200)',
          'Atmosphere': 'Traditional'
        }
      }
    ];

    for (const hostelData of sampleHostels) {
      // Insert hostel
      const [newHostel] = await db.insert(hostels).values({
        hostelName: hostelData.hostelName,
        hostelDescription: hostelData.hostelDescription,
        location: hostelData.location,
        address: hostelData.address,
        phoneNumber: hostelData.phoneNumber,
        email: hostelData.email,
        website: hostelData.website,
        priceRange: hostelData.priceRange,
        createdAt: new Date(),
      }).returning();

      console.log(`Inserted hostel: ${hostelData.hostelName}`);

      // Link hostel to categories
      for (const [categoryName, optionName] of Object.entries(hostelData.categories)) {
        // Find category
        const category = await db.select({ categoryId: categories.categoryId })
          .from(categories)
          .where(eq(categories.category, categoryName));

        if (category.length > 0) {
          // Find option
          const option = await db.select({ optionId: categoryOptionValues.optionId })
            .from(categoryOptionValues)
            .where(eq(categoryOptionValues.optionName, optionName));

          if (option.length > 0) {
            // Link hostel to category option
            await db.insert(hostelOptions).values({
              hostelId: newHostel.hostelId,
              categoryId: category[0].categoryId,
              optionId: option[0].optionId,
            });
            console.log(`Linked ${hostelData.hostelName} to ${categoryName}: ${optionName}`);
          }
        }
      }
    }

    console.log('Sample hostels seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding sample hostels:', error);
    throw error;
  }
}

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedHostels()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 
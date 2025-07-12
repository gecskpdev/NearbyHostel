# Hostel Management System

This project has been converted from a project management system to a comprehensive hostel management system. The system allows admins and super admins to manage hostels, while users can browse, filter, and review hostels.

## Features

### 🏨 Hostel Management
- **Add Hostels**: Only admins and super admins can add new hostels
- **Hostel Information**: Complete hostel details including name, description, location (Google Maps link), contact info, and pricing
- **Image Management**: Support for multiple hostel images with primary image designation
- **Categories & Filtering**: Dynamic categorization system for amenities, room types, location types, price ranges, and atmosphere

### ⭐ Ratings & Reviews
- **Rating System**: 5-star rating system with categories (overall, cleanliness, location, value, atmosphere)
- **Comments**: User reviews with verification system
- **Average Ratings**: Automatic calculation and display of average ratings

### 🔍 Search & Filtering
- **Advanced Filtering**: Filter by amenities, room types, location types, price ranges, and atmosphere
- **Tab Categories**: 
  - All Hostels
  - Latest (added in last month)
  - Top Rated (4+ stars)
  - Budget Friendly (under $50)
  - This Week (added in last week)
  - Oldest (chronological order)

### 👥 User Management
- **Admin System**: Firebase-based authentication with admin and super admin roles
- **Role-based Access**: Only authorized users can add/edit hostels
- **User Reviews**: Any authenticated user can rate and review hostels

## Database Schema

### Core Tables
- **hostels**: Main hostel information
- **hostel_images**: Image management with primary image support
- **ratings**: User ratings with multiple categories
- **comments**: User reviews and feedback
- **categories**: Dynamic category system
- **category_option_values**: Options for each category
- **hostel_options**: Many-to-many relationship between hostels and category options

### Key Features
- **Soft Delete**: Hostels are marked as inactive rather than deleted
- **Image Management**: Support for multiple images per hostel
- **Rating Categories**: Detailed rating system with multiple aspects
- **Flexible Categories**: Dynamic category system that can be easily extended

## API Endpoints

### Hostels
- `GET /api/hostels` - Fetch all active hostels with ratings and images
- `POST /api/hostels` - Create new hostel (admin only)
- `PUT /api/hostels` - Update hostel (admin only)
- `DELETE /api/hostels` - Soft delete hostel (admin only)

### Ratings
- `GET /api/ratings?hostelId=X` - Get ratings for a hostel
- `POST /api/ratings` - Add new rating
- `PUT /api/ratings` - Update rating
- `DELETE /api/ratings?ratingId=X` - Delete rating

### Comments
- `GET /api/comments?hostelId=X` - Get comments for a hostel
- `POST /api/comments` - Add new comment
- `PUT /api/comments` - Update comment
- `DELETE /api/comments?commentId=X` - Delete comment

### Images
- `GET /api/hostel-images?hostelId=X` - Get images for a hostel
- `POST /api/hostel-images` - Add new image
- `PUT /api/hostel-images` - Update image
- `DELETE /api/hostel-images?imageId=X` - Delete image

## Setup Instructions

### 1. Database Setup
```bash
# Run migrations
npm run db:migrate

# Seed categories
npx tsx drizzle/seed-hostel-categories.ts

# Seed sample hostels (optional)
npx tsx drizzle/seed-hostels.ts
```

### 2. Environment Variables
Ensure your `.env` file includes:
- Database connection string
- Firebase configuration
- Any other required environment variables

### 3. Admin Setup
1. Set up Firebase authentication
2. Add admin users through the admin interface
3. Configure admin roles (admin/superadmin)

## Category System

The system uses a flexible category system with the following default categories:

### Amenities
- Free WiFi, Kitchen, Laundry, Common Room, Garden/Terrace, Bar, Breakfast Included, Air Conditioning, Heating, Luggage Storage, 24/7 Reception, Security Lockers, Bicycle Rental, Tour Desk, BBQ Area

### Room Types
- Dormitory, Private Room, Double Room, Twin Room, Single Room, Family Room, Female Only Dorm, Male Only Dorm, Mixed Dorm

### Location Types
- City Center, Near Train Station, Near Airport, Beachfront, Mountain View, Rural Area, University District, Shopping District, Historic District, Business District

### Price Ranges
- Budget ($10-25), Economy ($25-50), Mid-range ($50-100), Premium ($100-200), Luxury ($200+)

### Atmosphere
- Party/Social, Quiet/Relaxed, Family Friendly, Backpacker, Digital Nomad, Student, Eco-friendly, Boutique, Traditional

## Usage

### For Admins
1. **Add Hostels**: Use the "Add Hostel" button (FAB) to create new hostels
2. **Manage Categories**: Add/edit categories and options through the admin interface
3. **Moderate Reviews**: Approve/verify user comments and ratings
4. **Update Information**: Edit hostel details, images, and contact information

### For Users
1. **Browse Hostels**: View all hostels with filtering options
2. **Search & Filter**: Use the filter panel to find specific hostels
3. **View Details**: Click on hostel cards to see full information
4. **Rate & Review**: Leave ratings and comments for hostels you've visited
5. **View on Map**: Click "View on Map" to see hostel location on Google Maps

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Auth
- **Deployment**: Vercel (recommended)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository or contact the development team. 
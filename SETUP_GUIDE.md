# Setup Guide for Hostel Management System

## Prerequisites

1. **PostgreSQL Database**: You need a PostgreSQL database running
2. **Firebase Project**: For authentication (optional but recommended)
3. **Cloudinary Account**: For image uploads and management
4. **Node.js**: Version 18 or higher

## Step 1: Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/hostel_management"

# Firebase Configuration (for authentication)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID="your-project-id"
FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"
FIREBASE_ADMIN_CLIENT_EMAIL="your-client-email"

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Database Setup Options:

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb hostel_management

# Create user (optional)
sudo -u postgres createuser --interactive

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/hostel_management"
```

#### Option B: Cloud Database (Recommended)
- **Neon**: Free PostgreSQL hosting
- **Supabase**: Free PostgreSQL hosting with additional features
- **Railway**: Easy PostgreSQL deployment

Example Neon URL:
```
DATABASE_URL="postgresql://username:password@ep-xyz.us-east-1.aws.neon.tech/hostel_management?sslmode=require"
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Run Database Migration

```bash
npm run drizzle:migrate
```

## Step 4: Seed the Database

```bash
# Seed categories
npx tsx drizzle/seed-hostel-categories.ts

# Seed sample hostels (optional)
npx tsx drizzle/seed-hostels.ts
```

## Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## Step 6: Cloudinary Setup for Images

1. Go to [Cloudinary Console](https://cloudinary.com/)
2. Create a free account
3. Get your Cloudinary credentials (cloud name, API key, API secret)
4. Add them to your `.env.local` as shown above
5. Images will be uploaded and served from Cloudinary with high-quality transformations (`q_auto:best`)
6. All hostel images are displayed in a Swiper slider; click any image to view it fullscreen in a modal/lightbox

## Step 7: Firebase Setup (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Get your project credentials
5. Update the Firebase variables in `.env.local`

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check your DATABASE_URL format
- Verify database exists and user has permissions

### Migration Issues
- Make sure DATABASE_URL is set correctly
- Check if database is accessible
- Verify drizzle config is correct

### Cloudinary Issues
- Ensure all Cloudinary variables are set in `.env.local`
- Check your Cloudinary account for usage limits
- If images look blurry, check the transformation in the image URL (should use `q_auto:best`)
- Make sure the Cloudinary SDK is installed (`npm install cloudinary`)

### Firebase Issues
- Ensure all Firebase variables are set
- Check Firebase project configuration
- Verify authentication is enabled

## Quick Start with Sample Data

If you want to test the system quickly:

1. Set up a free Neon database
2. Update DATABASE_URL in .env.local
3. Run migrations and seed scripts
4. Set up Cloudinary credentials
5. Start the development server

You'll have a fully functional hostel management system with sample data and image upload/viewing!

## Admin Access

To add hostels, you need admin privileges:

1. Set up Firebase authentication
2. Add admin users through the admin interface
3. Login with admin credentials to add/edit hostels

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure database is accessible
4. Check Cloudinary and Firebase configuration 
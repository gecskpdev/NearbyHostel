export interface Hostel {
  hostelId?: number;
  hostelName: string;
  hostelDescription: string;
  location: string; // Google Maps link
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  priceRange?: string;
  createdAt: string; // Ensure createdAt exists as a string (ISO format)
  isActive?: boolean;
  // New generic categories structure
  categories?: { categoryName: string; optionName: string }[];
  // Images
  images?: HostelImage[];
  // Ratings and comments
  averageRating?: number;
  totalRatings?: number;
  comments?: Comment[];
}

export interface HostelImage {
  imageId?: number;
  imageUrl: string;
  imageType?: string; // general, room, common_area, etc.
  isPrimary?: boolean;
  uploadedAt?: string;
}

export interface Rating {
  ratingId?: number;
  overallRating: number;
  cleanlinessRating?: number;
  locationRating?: number;
  valueRating?: number;
  atmosphereRating?: number;
  createdAt?: string;
}

export interface Comment {
  commentId?: number;
  commentText: string;
  userName?: string;
  userEmail?: string;
  isVerified?: boolean;
  createdAt?: string;
}

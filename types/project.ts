export interface Project {
  projectId?: number;
  projectName: string;
  projectDescription: string;
  projectLink: string;
  members?: { name: string; linkedin: string }[];
  createdAt: string; // Ensure createdAt exists as a string (ISO format)
  customDomain?: string; // Re-adding customDomain field
  // New generic categories structure
  categories?: { categoryName: string; optionName: string }[];
}

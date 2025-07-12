"use client";

import { useEffect, useState } from "react";
import HostelCard from "./hostelCard"; // We'll rename this file later
import { Hostel } from "@/types/project";
import ProjectCardSkeleton from './hostelCardSkeleton'; // We'll rename this file later

interface HostelGridProps {
  activeTab: string;
  filters: Record<string, string[]>; // Accept selected filters
  refreshTrigger?: boolean; // New prop to trigger re-fetch
}

const HostelGrid = ({ activeTab, filters, refreshTrigger }: HostelGridProps) => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allHostels, setAllHostels] = useState<Hostel[]>([]); // To store all fetched hostels

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setLoading(true); // Set loading to true at the start of fetch
        const res = await fetch('/api/hostels');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: Hostel[] = await res.json();
        // Ensure all necessary fields are present or defaulted
        const formattedData: Hostel[] = data.map((h) => ({
          ...h,
          createdAt: h.createdAt ?? new Date().toISOString(),
          location: h.location ?? "",
          images: h.images ?? [],
          categories: h.categories ?? [], // Ensure categories array is present
          comments: h.comments ?? [],
        }));
        setAllHostels(formattedData);
        setLoading(false);
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch hostels:", e);
        setLoading(false);
      }
    };

    fetchHostels();
  }, [refreshTrigger]); // Add refreshTrigger to dependency array to re-fetch when it changes

  useEffect(() => {
    let filteredHostels: Hostel[] = [...allHostels];

    // Apply Tab Filters
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    switch (activeTab) {
      case "All":
        break;

      case "Latest":
        filteredHostels = filteredHostels
          .filter((h) => new Date(h.createdAt) >= oneMonthAgo)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;

      case "Oldest":
        filteredHostels = filteredHostels.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;

      case "This Week":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredHostels = filteredHostels.filter(
          (h) => new Date(h.createdAt) >= oneWeekAgo
        );
        break;

      case "Top Rated":
        filteredHostels = filteredHostels
          .filter((h) => h.averageRating && h.averageRating >= 4.0)
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;

      case "Budget Friendly":
        filteredHostels = filteredHostels
          .filter((h) => h.priceRange && (h.priceRange.includes("$20") || h.priceRange.includes("$30") || h.priceRange.includes("$40")))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    // Apply Filters
    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([filterCategoryName, selectedOptionNames]) => {
        if (selectedOptionNames.length > 0) {
          filteredHostels = filteredHostels.filter((hostel) => {
            // Check if the hostel has the category being filtered
            const hostelCategory = hostel.categories?.find(
              (cat) => cat.categoryName === filterCategoryName
            );

            if (hostelCategory) {
              const isMatch = selectedOptionNames.includes(hostelCategory.optionName);
              
              // console.log(`Filtering by Category: ${filterCategoryName}`);
              // console.log(`  Hostel Name: ${hostel.hostelName}`);
              // console.log(`  Hostel's Category Options:`, hostel.categories);
              // console.log(`  Hostel's Option for ${filterCategoryName}: ${hostelCategory.optionName}`);
              // console.log(`  Selected Filter Options: ${JSON.stringify(selectedOptionNames)}`);
              // console.log(`  Is Match: ${isMatch}`);

              return isMatch;
            }
            return false; // Hostel does not have this category, so it doesn't match the filter
          });
        }
      });
    }

    setHostels(filteredHostels);
  }, [activeTab, filters, allHostels]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6 animate-fadeIn">
        {hostels.length > 0 ? (
          hostels.map((hostel, index) => (
            <div
              key={hostel.hostelId || index}
              className="opacity-0 animate-slideUp"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
            >
              <HostelCard hostel={hostel} />
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No hostels available.</p>
        )}
      </div>
    </div>
  );
};

export default HostelGrid;

"use client";

import { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import { Project } from "@/types/project";
import ProjectCardSkeleton from './ProjectCardSkeleton'; // Import the skeleton component

interface ProjectGridProps {
  activeTab: string;
  filters: Record<string, string[]>; // Accept selected filters
  refreshTrigger?: boolean; // New prop to trigger re-fetch
}

const ProjectGrid = ({ activeTab, filters, refreshTrigger }: ProjectGridProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]); // To store all fetched projects

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true); // Set loading to true at the start of fetch
        const res = await fetch('/api/projects');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: Project[] = await res.json();
        // Ensure all necessary fields are present or defaulted
        const formattedData: Project[] = data.map((p) => ({
          ...p,
          createdAt: p.createdAt ?? new Date().toISOString(),
          projectLink: p.projectLink ?? "",
          members: p.members ?? [],
          categories: p.categories ?? [], // Ensure categories array is present
        }));
        setAllProjects(formattedData);
        setLoading(false);
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch projects:", e);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [refreshTrigger]); // Add refreshTrigger to dependency array to re-fetch when it changes

  useEffect(() => {
    let filteredProjects: Project[] = [...allProjects];

    // Apply Tab Filters
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    switch (activeTab) {
      case "All":
        break;

      case "Latest":
        filteredProjects = filteredProjects
          .filter((p) => new Date(p.createdAt) >= oneMonthAgo)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;

      case "Oldest":
        filteredProjects = filteredProjects.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;

      case "This Week":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredProjects = filteredProjects.filter(
          (p) => new Date(p.createdAt) >= oneWeekAgo
        );
        break;
    }

    // Apply Filters
    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([filterCategoryName, selectedOptionNames]) => {
        if (selectedOptionNames.length > 0) {
          filteredProjects = filteredProjects.filter((project) => {
            // Check if the project has the category being filtered
            const projectCategory = project.categories?.find(
              (cat) => cat.categoryName === filterCategoryName
            );

            if (projectCategory) {
              const isMatch = selectedOptionNames.includes(projectCategory.optionName);
              
              // console.log(`Filtering by Category: ${filterCategoryName}`);
              // console.log(`  Project Name: ${project.projectName}`);
              // console.log(`  Project's Category Options:`, project.categories);
              // console.log(`  Project's Option for ${filterCategoryName}: ${projectCategory.optionName}`);
              // console.log(`  Selected Filter Options: ${JSON.stringify(selectedOptionNames)}`);
              // console.log(`  Is Match: ${isMatch}`);

              return isMatch;
            }
            return false; // Project does not have this category, so it doesn't match the filter
          });
        }
      });
    }

    setProjects(filteredProjects);
  }, [activeTab, filters, allProjects]);

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
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <div
              key={project.projectId || index}
              className="opacity-0 animate-slideUp"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
            >
              <ProjectCard project={project} />
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No projects available.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectGrid;

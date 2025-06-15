"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProjectGrid from '@/components/repeto/ProjectGrid';
import FilterSection from '@/components/repeto/FilterSection';
import TabSection from '@/components/repeto/TabSection';
import LoadingScreen from "@/components/loadingScrenn";
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("All");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    setRefreshTrigger(prev => !prev);
    return () => clearTimeout(timer);
  }, []);

  const handleClearFilters = () => {
    setFilters({});
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <FilterSection onFilterSubmit={setFilters} onClearFilters={handleClearFilters} />
        <div className="flex-1 max-w-7xl px-4 py-6 space-y-8">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <TabSection activeTab={activeTab} onTabChange={setActiveTab} />
            {/* Wrapper div to push buttons to the right */}
            <div className="ml-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Link href="/manage-projects" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-center">
                Manage Projects
              </Link>
              <Link href="/manage-categories" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-center">
                Manage Categories
              </Link>
            </div>
          </div>
          <ProjectGrid activeTab={activeTab} filters={filters} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </main>
  );
} 
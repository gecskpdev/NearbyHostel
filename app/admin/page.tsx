"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import HostelGrid from '@/components/repeto/ProjectGrid';
import FilterSection from '@/components/repeto/FilterSection';
import TabSection from '@/components/repeto/TabSection';
import LoadingScreen from "@/components/loadingScrenn";
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Building, Tag, User } from 'lucide-react';

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

  // Sample stats (replace with real data if available)
  const stats = [
    { label: 'Hostels', value: 42, icon: <Building className="w-6 h-6 text-blue-500" /> },
    { label: 'Categories', value: 8, icon: <Tag className="w-6 h-6 text-green-500" /> },
    { label: 'Admins', value: 3, icon: <User className="w-6 h-6 text-purple-500" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Home className="w-8 h-8 text-black" />
          <span className="text-2xl font-bold">Admin Dashboard</span>
          <Badge variant="secondary" className="ml-2">Welcome, Admin</Badge>
        </div>
      </div>
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4 p-6 shadow hover:shadow-lg transition">
            {stat.icon}
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-gray-500">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>
      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <FilterSection onFilterSubmit={setFilters} onClearFilters={handleClearFilters} />
        </div>
        <div className="flex-1">
          <TabSection activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex gap-4 my-4">
            <Button asChild variant="outline">
              <Link href="/manage-hostels">Manage Hostels</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/manage-categories">Manage Categories</Link>
            </Button>
          </div>
          <HostelGrid activeTab={activeTab} filters={filters} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
} 
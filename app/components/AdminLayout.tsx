import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 space-y-4">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/manage-projects" className="block p-2 text-gray-700 hover:bg-gray-200 rounded">
                Manage Projects
              </Link>
            </li>
            <li>
              <Link href="/manage-categories" className="block p-2 text-gray-700 hover:bg-gray-200 rounded">
                Manage Categories
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
} 
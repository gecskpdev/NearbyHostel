interface TabSectionProps {
  activeTab: string;
  onTabChange: (tab: string) => void; // Ensure correct function type
}

export default function TabSection({ activeTab, onTabChange }: TabSectionProps) {
  const tabs = ["All", "Latest", "Oldest", "This Week",];
  
  return (
    <div className="bg-white rounded-lg shadow w-full">
      <div className="flex space-x-6 p-4 overflow-x-auto w-full justify-evenly">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`text-gray-600 hover:text-blue-600 whitespace-nowrap font-medium
              ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

import { Bell, Search } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search functionality
  };

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-secondary-600">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button 
            className="relative p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5" />
            {/* Notification badge - hidden by default */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full hidden"></span>
          </button>
          
          {/* Search */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={handleSearch}
              className="w-64 pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}

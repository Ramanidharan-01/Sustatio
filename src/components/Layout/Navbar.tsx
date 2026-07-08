import React from 'react';
import { User, LogOut, Settings, Bell, Leaf } from 'lucide-react';
import { authService } from '../../services/auth.service';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Navbar({ user, onLogout, currentPage, onPageChange }: NavbarProps) {
  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'factory_admin': return 'bg-blue-100 text-blue-800';
      case 'microhub': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'segregation', label: 'Segregation' },
    { key: 'disposal', label: 'Disposal' },
    { key: 'sanitization', label: 'Sanitization' },
    ...(user.role === 'admin' ? [{ key: 'admin', label: 'Admin Panel' }] : [])
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sustatio</h1>
                <p className="text-xs text-gray-500">Waste Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onPageChange(item.key)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === item.key
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Bell className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.profile?.name || user.username}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              
              <div className="bg-gray-200 p-2 rounded-full">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 pt-2 pb-3">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onPageChange(item.key)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  currentPage === item.key
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
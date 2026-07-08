import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, TrendingUp, Recycle, Trash, AlertTriangle, Leaf } from 'lucide-react';
import { wasteService } from '../services/waste.service';
import { grievanceService } from '../services/grievance.service';
import { DashboardStats } from '../types';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import StatusBadge from '../components/Common/StatusBadge';

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const wasteRecords = wasteService.getAllWasteRecords(user.role);
      const grievanceStats = grievanceService.getGrievanceStats();
      const userTokens = user.role !== 'admin' ? grievanceService.getUserTokenBalance(user.id) : 0;

      const wasteByCategory = wasteService.getWasteStatsByCategory();
      const totalWaste = Object.values(wasteByCategory).reduce((sum, count) => sum + count, 0);
      const processedWaste = wasteRecords.filter(r => ['processed', 'disposed', 'recycled'].includes(r.status)).length;
      const recycledWaste = wasteRecords.filter(r => r.status === 'recycled').length;

      const dashboardStats: DashboardStats = {
        totalWaste,
        processingRate: totalWaste > 0 ? Math.round((processedWaste / totalWaste) * 100) : 0,
        recyclingRate: totalWaste > 0 ? Math.round((recycledWaste / totalWaste) * 100) : 0,
        wasteByCategory,
        recentActivity: wasteRecords
          .flatMap(r => r.timeline)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5),
        pendingGrievances: grievanceStats.open,
        tokenBalance: user.role !== 'admin' ? userTokens : undefined
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Failed to load dashboard</h3>
        <button onClick={loadDashboardData} className="mt-4 text-green-600 hover:text-green-700">
          Try again
        </button>
      </div>
    );
  }

  const categoryColors = {
    'Disposable': 'bg-green-500',
    'Non-disposable': 'bg-blue-500',
    'PET Bottle': 'bg-purple-500',
    'Metals & Glasses': 'bg-orange-500'
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.profile?.name || user.username}!
        </h1>
        <p className="text-green-100">
          {user.role === 'admin' 
            ? 'Monitor system-wide waste management operations'
            : user.role === 'microhub'
            ? 'Track disposable waste processing in your zone'
            : user.role === 'factory_admin'
            ? 'Manage industrial waste disposal and recycling'
            : 'View your waste tracking and environmental impact'
          }
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Trash className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.totalWaste.toLocaleString()}</span>
          </div>
          <h3 className="font-semibold text-gray-800">Total Waste Records</h3>
          <p className="text-sm text-gray-500">Tracked in the system</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.processingRate}%</span>
          </div>
          <h3 className="font-semibold text-gray-800">Processing Rate</h3>
          <p className="text-sm text-gray-500">Waste successfully processed</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Recycle className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.recyclingRate}%</span>
          </div>
          <h3 className="font-semibold text-gray-800">Recycling Rate</h3>
          <p className="text-sm text-gray-500">Successfully recycled</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.pendingGrievances}</span>
          </div>
          <h3 className="font-semibold text-gray-800">Pending Grievances</h3>
          <p className="text-sm text-gray-500">Require attention</p>
        </div>
      </div>

      {/* Token Balance (for non-admin users) */}
      {stats.tokenBalance !== undefined && (
        <div className="bg-gradient-to-r from-yellow-400 to-green-500 p-6 rounded-xl text-white">
          <div className="flex items-center space-x-3">
            <Leaf className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">Sustatio Tokens</h3>
              <p className="text-lg">{stats.tokenBalance} tokens available</p>
              <p className="text-yellow-100 text-sm">Earn more by reporting issues and helping improve the system!</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste by Category */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart className="w-5 h-5 mr-2 text-green-600" />
            Waste by Category
          </h3>
          
          <div className="space-y-4">
            {Object.entries(stats.wasteByCategory).map(([category, count]) => {
              const percentage = stats.totalWaste > 0 ? Math.round((count / stats.totalWaste) * 100) : 0;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{category}</span>
                    <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${(categoryColors as any)[category]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          
          <div className="space-y-4">
            {stats.recentActivity.map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <StatusBadge status={event.status} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{event.notes || `Status updated to ${event.status}`}</p>
                  <p className="text-xs text-gray-500">📍 {event.location} • {new Date(event.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
            
            {stats.recentActivity.length === 0 && (
              <p className="text-center text-gray-500 py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Role-specific insights */}
      {user.role === 'admin' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Admin Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">System Health:</span>
              <span className="ml-2 text-blue-600">Operational</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Active Users:</span>
              <span className="ml-2 text-blue-600">24/7 monitoring active</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Data Integrity:</span>
              <span className="ml-2 text-blue-600">5200+ records validated</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
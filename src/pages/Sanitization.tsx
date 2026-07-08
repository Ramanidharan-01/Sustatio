import React, { useState, useEffect } from 'react';
import { Shield, Plus, MessageSquare, Coins, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { grievanceService } from '../services/grievance.service';
import { Grievance, SustatioToken } from '../types';
import { getRelativeTime } from '../utils/security';
import LoadingSpinner from '../components/Common/LoadingSpinner';

interface SanitizationProps {
  user: any;
}

export default function Sanitization({ user }: SanitizationProps) {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [userTokens, setUserTokens] = useState<SustatioToken[]>([]);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  
  const [newGrievance, setNewGrievance] = useState({
    title: '',
    description: '',
    category: 'sanitation' as Grievance['category'],
    priority: 'medium' as Grievance['priority']
  });

  const isAdmin = user.role === 'admin' || user.role === 'factory_admin';

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allGrievances = grievanceService.getAllGrievances();
      setGrievances(allGrievances);

      const tokens = grievanceService.getUserTokens(user.id);
      setUserTokens(tokens);
      
      const balance = grievanceService.getUserTokenBalance(user.id);
      setTokenBalance(balance);
    } catch (error) {
      console.error('Failed to load sanitization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const grievance = grievanceService.createGrievance({
        ...newGrievance,
        submittedBy: user.id
      });

      // Award tokens for submitting grievance
      grievanceService.awardTokens(
        user.id,
        25,
        'Bonus for reporting grievance',
        grievance.id
      );

      setNewGrievance({
        title: '',
        description: '',
        category: 'sanitation',
        priority: 'medium'
      });
      setShowSubmitForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to submit grievance:', error);
    }
  };

  const updateGrievanceStatus = (grievanceId: string, newStatus: Grievance['status'], resolution?: string) => {
    const success = grievanceService.updateGrievance(grievanceId, {
      status: newStatus,
      assignedTo: user.id,
      resolution
    });

    if (success && newStatus === 'resolved') {
      // Award tokens for resolving grievance
      const grievance = grievanceService.getGrievanceById(grievanceId);
      if (grievance) {
        grievanceService.awardTokens(
          grievance.submittedBy,
          50,
          'Grievance resolved successfully',
          grievanceId
        );
      }
    }

    if (success) {
      loadData();
      if (selectedGrievance?.id === grievanceId) {
        setSelectedGrievance(grievanceService.getGrievanceById(grievanceId));
      }
    }
  };

  const purchaseTokens = (amount: number) => {
    grievanceService.purchaseTokens(
      user.id,
      amount,
      `Purchased ${amount} Sustatio tokens`
    );
    loadData();
  };

  const getStatusIcon = (status: Grievance['status']) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'in_progress': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'closed': return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Grievance['status']) => {
    switch (status) {
      case 'open': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Grievance['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'urgent': return 'text-red-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const userGrievances = grievances.filter(g => g.submittedBy === user.id);
  const openGrievances = grievances.filter(g => g.status === 'open');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <Shield className="w-8 h-8 mr-3" />
          Sanitization & Grievance Center
        </h1>
        <p className="text-cyan-100">
          Report issues, track resolutions, and earn Sustatio tokens for community contributions
        </p>
      </div>

      {/* Token Balance & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <Coins className="w-8 h-8" />
            <span className="text-3xl font-bold">{tokenBalance}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Sustatio Tokens</h3>
          <p className="text-yellow-100 text-sm">Your environmental impact credits</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">{userGrievances.length}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Your Grievances</h3>
          <p className="text-gray-500 text-sm">Reports you've submitted</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <button
            onClick={() => setShowSubmitForm(true)}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Token Purchase (for admins) */}
      {isAdmin && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Coins className="w-5 h-5 mr-2 text-yellow-500" />
            Purchase Sustatio Tokens
          </h3>
          <p className="text-gray-600 mb-4">
            As an industry admin, you can purchase tokens to reward community members and fund sustainability initiatives.
          </p>
          <div className="flex flex-wrap gap-4">
            {[100, 250, 500, 1000].map(amount => (
              <button
                key={amount}
                onClick={() => purchaseTokens(amount)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Buy {amount} tokens
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit Grievance Form */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit New Grievance</h3>
            
            <form onSubmit={submitGrievance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newGrievance.title}
                  onChange={(e) => setNewGrievance({ ...newGrievance, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={newGrievance.description}
                  onChange={(e) => setNewGrievance({ ...newGrievance, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed description of the issue and its impact"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newGrievance.category}
                    onChange={(e) => setNewGrievance({ ...newGrievance, category: e.target.value as Grievance['category'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="collection">Collection</option>
                    <option value="disposal">Disposal</option>
                    <option value="sanitation">Sanitation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newGrievance.priority}
                    onChange={(e) => setNewGrievance({ ...newGrievance, priority: e.target.value as Grievance['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit (+25 tokens)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grievances List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Grievances / Open Grievances */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {isAdmin ? `Open Grievances (${openGrievances.length})` : `Your Grievances (${userGrievances.length})`}
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {(isAdmin ? openGrievances : userGrievances).slice(0, 20).map(grievance => (
              <div
                key={grievance.id}
                onClick={() => setSelectedGrievance(grievance)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedGrievance?.id === grievance.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 line-clamp-1">{grievance.title}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(grievance.status)}`}>
                    {grievance.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{grievance.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span className="capitalize">{grievance.category}</span>
                    <span className={`font-medium ${getPriorityColor(grievance.priority)}`}>
                      {grievance.priority.toUpperCase()}
                    </span>
                  </div>
                  <span>{getRelativeTime(grievance.createdAt)}</span>
                </div>

                {grievance.tokenReward && (
                  <div className="mt-2 flex items-center text-xs text-yellow-600">
                    <Coins className="w-3 h-3 mr-1" />
                    {grievance.tokenReward} tokens earned
                  </div>
                )}
              </div>
            ))}

            {(isAdmin ? openGrievances : userGrievances).length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No grievances found</h3>
                <p className="text-gray-500">
                  {isAdmin ? 'All reported issues have been addressed' : 'You haven\'t submitted any grievances yet'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Grievance Details */}
        <div className="bg-white rounded-xl border border-gray-200">
          {selectedGrievance ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Grievance Details</h3>
                <button
                  onClick={() => setSelectedGrievance(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{selectedGrievance.title}</h4>
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(selectedGrievance.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedGrievance.status)}`}>
                      {selectedGrievance.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(selectedGrievance.priority)}`}>
                      {selectedGrievance.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-600">{selectedGrievance.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <span className="text-sm text-gray-900 capitalize">{selectedGrievance.category}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                    <span className="text-sm text-gray-900">{getRelativeTime(selectedGrievance.createdAt)}</span>
                  </div>
                </div>

                {selectedGrievance.resolution && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
                    <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{selectedGrievance.resolution}</p>
                  </div>
                )}

                {selectedGrievance.tokenReward && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center text-yellow-800">
                      <Coins className="w-4 h-4 mr-2" />
                      <span className="font-medium">{selectedGrievance.tokenReward} tokens earned</span>
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                {isAdmin && selectedGrievance.status !== 'resolved' && selectedGrievance.status !== 'closed' && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Admin Actions</h4>
                    <div className="space-y-2">
                      {selectedGrievance.status === 'open' && (
                        <button
                          onClick={() => updateGrievanceStatus(selectedGrievance.id, 'in_progress')}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Mark as In Progress
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          const resolution = prompt('Enter resolution details:');
                          if (resolution) {
                            updateGrievanceStatus(selectedGrievance.id, 'resolved', resolution);
                          }
                        }}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark as Resolved (+50 tokens to user)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Select a Grievance</h3>
              <p className="text-gray-500">Click on a grievance to view details and take actions</p>
            </div>
          )}
        </div>
      </div>

      {/* Token History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Token History</h3>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {userTokens.map(token => (
            <div key={token.id} className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">{token.description}</p>
                <p className="text-xs text-gray-500">{getRelativeTime(token.timestamp)}</p>
              </div>
              <div className={`flex items-center space-x-1 ${
                token.type === 'earned' || token.type === 'purchased' ? 'text-green-600' : 'text-red-600'
              }`}>
                <Coins className="w-4 h-4" />
                <span className="font-medium">
                  {token.type === 'earned' || token.type === 'purchased' ? '+' : '-'}{token.amount}
                </span>
              </div>
            </div>
          ))}
          
          {userTokens.length === 0 && (
            <div className="text-center py-8">
              <Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No token history yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Truck, Search, Plus, Eye, Tag, MapPin, Calendar } from 'lucide-react';
import { wasteService } from '../services/waste.service';
import { authService } from '../services/auth.service';
import { WasteRecord, WasteStatus } from '../types';
import { generateWasteTag } from '../utils/security';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import StatusBadge from '../components/Common/StatusBadge';
import Timeline from '../components/Common/Timeline';

interface DisposalProps {
  user: any;
}

export default function Disposal({ user }: DisposalProps) {
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<WasteRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTagGenerator, setShowTagGenerator] = useState(false);
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    loadWasteData();
  }, [user]);

  const loadWasteData = () => {
    setLoading(true);
    try {
      const records = wasteService.getAllWasteRecords(user.role);
      setWasteRecords(records);
    } catch (error) {
      console.error('Failed to load waste records:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewTags = (count: number = 10) => {
    const newTags = Array.from({ length: count }, () => generateWasteTag());
    setGeneratedTags(newTags);
  };

  const copyTagToClipboard = async (tag: string) => {
    try {
      await navigator.clipboard.writeText(tag);
      // You could add a toast notification here
      alert('Tag copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy tag:', err);
    }
  };

  const updateWasteStatus = (tag: string, newStatus: WasteStatus) => {
    const success = wasteService.updateWasteStatus(
      tag, 
      newStatus, 
      user.username,
      `Status updated via disposal management`
    );
    
    if (success) {
      loadWasteData();
      // Update selected record if it's the one being updated
      if (selectedRecord && selectedRecord.tag === tag) {
        const updatedRecord = wasteService.getWasteRecordByTag(tag);
        setSelectedRecord(updatedRecord);
      }
    }
  };

  const filteredRecords = wasteRecords.filter(record => 
    !searchQuery || 
    record.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.metadata.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const disposalStatuses: WasteStatus[] = ['collected', 'in_transit', 'segregated', 'processed', 'disposed', 'recycled'];

  const getStatusColor = (status: WasteStatus) => {
    switch (status) {
      case 'collected': return 'bg-blue-500';
      case 'in_transit': return 'bg-yellow-500';
      case 'segregated': return 'bg-purple-500';
      case 'processed': return 'bg-green-500';
      case 'disposed': return 'bg-gray-500';
      case 'recycled': return 'bg-emerald-500';
      default: return 'bg-orange-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <Truck className="w-8 h-8 mr-3" />
          Disposal Management Center
        </h1>
        <p className="text-orange-100">
          Track waste disposal, manage logistics, and monitor processing status
        </p>
      </div>

      {/* Admin Tag Generator */}
      {isAdmin && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowTagGenerator(!showTagGenerator)}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 flex items-center justify-between hover:from-green-100 hover:to-blue-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Tag className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Secure Tag Generator</h3>
                <p className="text-sm text-gray-600">Generate secure 25-character waste tracking tags</p>
              </div>
            </div>
            <Plus className={`w-5 h-5 text-gray-400 transition-transform ${showTagGenerator ? 'rotate-45' : ''}`} />
          </button>

          {showTagGenerator && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Generated Tags</h4>
                <button
                  onClick={() => generateNewTags(10)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Tag className="w-4 h-4" />
                  <span>Generate 10 Tags</span>
                </button>
              </div>

              {generatedTags.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {generatedTags.map((tag, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                      <span className="font-mono text-sm text-gray-800 truncate">{tag}</span>
                      <button
                        onClick={() => copyTagToClipboard(tag)}
                        className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Security Features</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 25-character length with alphanumeric + symbols</li>
                  <li>• Cryptographically secure random generation</li>
                  <li>• Unique collision-resistant identifiers</li>
                  <li>• Production-ready for physical tag printing</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by tag, location, or description..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Disposal Status Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {disposalStatuses.map(status => {
              const count = wasteRecords.filter(r => r.status === status).length;
              return (
                <div key={status} className="text-center">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${getStatusColor(status)}`} />
                  <div className="text-lg font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-500 capitalize">{status.replace('_', ' ')}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Records</span>
              <span className="font-semibold">{wasteRecords.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">In Transit</span>
              <span className="font-semibold text-yellow-600">
                {wasteRecords.filter(r => r.status === 'in_transit').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Processed</span>
              <span className="font-semibold text-green-600">
                {wasteRecords.filter(r => r.status === 'processed').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Waste Records List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Waste Records ({filteredRecords.length})
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredRecords.slice(0, 50).map(record => (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedRecord?.id === record.id ? 'bg-orange-50 border-orange-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {record.tag}
                  </span>
                  <StatusBadge status={record.status} size="sm" />
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {record.location}
                  <span className="mx-2">•</span>
                  <span>{record.weight} kg</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(record.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No records found</h3>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Record Details */}
        <div className="bg-white rounded-xl border border-gray-200">
          {selectedRecord ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Record Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag ID</label>
                  <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded block">
                    {selectedRecord.tag}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <span className="text-sm text-gray-900">{selectedRecord.category}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                    <span className="text-sm text-gray-900">{selectedRecord.weight} kg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={selectedRecord.status} />
                    {isAdmin && (
                      <select
                        value={selectedRecord.status}
                        onChange={(e) => updateWasteStatus(selectedRecord.tag, e.target.value as WasteStatus)}
                        className="ml-4 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {disposalStatuses.map(status => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <span className="text-sm text-gray-900">📍 {selectedRecord.location}</span>
                </div>

                {selectedRecord.metadata.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-sm text-gray-600">{selectedRecord.metadata.description}</p>
                  </div>
                )}

                <Timeline events={selectedRecord.timeline} />
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Select a Record</h3>
              <p className="text-gray-500">Click on a waste record to view details and tracking information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
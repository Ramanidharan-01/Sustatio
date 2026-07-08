import React, { useState, useEffect } from 'react';
import { Brain, Recycle, Search, Filter, ChevronDown, Lightbulb, TrendingUp } from 'lucide-react';
import { wasteService } from '../services/waste.service';
import { WasteRecord, WasteCategory, AISuggestion } from '../types';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import StatusBadge from '../components/Common/StatusBadge';

interface SegregationProps {
  user: any;
}

export default function Segregation({ user }: SegregationProps) {
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | 'all'>('all');
  const [aiInput, setAiInput] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const categories: WasteCategory[] = ['Disposable', 'Non-disposable', 'PET Bottle', 'Metals & Glasses'];

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

  const handleAiSuggestion = () => {
    if (!aiInput.trim()) return;
    
    const suggestion = wasteService.getAISuggestion(aiInput);
    setAiSuggestion(suggestion);
  };

  const filteredRecords = wasteRecords.filter(record => {
    const matchesSearch = !searchQuery || 
      record.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.metadata.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: WasteCategory) => {
    switch (category) {
      case 'Disposable': return 'bg-green-100 text-green-800 border-green-200';
      case 'Non-disposable': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PET Bottle': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Metals & Glasses': return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getCategoryIcon = (category: WasteCategory) => {
    switch (category) {
      case 'Disposable': return '🗑️';
      case 'Non-disposable': return '♻️';
      case 'PET Bottle': return '🍶';
      case 'Metals & Glasses': return '⚡';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <Recycle className="w-8 h-8 mr-3" />
          Waste Segregation Center
        </h1>
        <p className="text-purple-100">
          AI-powered waste categorization and intelligent segregation recommendations
        </p>
      </div>

      {/* AI Suggestion Panel */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAiPanel(!showAiPanel)}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex items-center justify-between hover:from-blue-100 hover:to-purple-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">AI Segregation Assistant</h3>
              <p className="text-sm text-gray-600">Get intelligent waste categorization suggestions</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showAiPanel ? 'rotate-180' : ''}`} />
        </button>

        {showAiPanel && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Describe the waste item (e.g., 'plastic bottle', 'food scraps', 'glass jar')"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAiSuggestion}
                disabled={!aiInput.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>Analyze</span>
              </button>
            </div>

            {aiSuggestion && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-6 h-6 text-yellow-500 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">AI Recommendation</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(aiSuggestion.category)}`}>
                          {getCategoryIcon(aiSuggestion.category)} {aiSuggestion.category}
                        </span>
                        <span className={`font-semibold ${getConfidenceColor(aiSuggestion.confidence)}`}>
                          {Math.round(aiSuggestion.confidence * 100)}% confidence
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reasoning:</span> {aiSuggestion.reasoning}
                      </p>

                      {aiSuggestion.alternativeCategories && aiSuggestion.alternativeCategories.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Alternative categories:</p>
                          <div className="flex flex-wrap gap-2">
                            {aiSuggestion.alternativeCategories.map((alt, index) => (
                              <span
                                key={index}
                                className={`inline-flex px-2 py-1 rounded text-xs ${getCategoryColor(alt.category)}`}
                              >
                                {getCategoryIcon(alt.category)} {alt.category} ({Math.round(alt.confidence * 100)}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                AI Enhancement Ready
              </h4>
              <p className="text-sm text-yellow-700">
                This rule-based AI can be easily replaced with a TensorFlow.js model for more sophisticated pattern recognition and learning capabilities.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tag, description, or location..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as WasteCategory | 'all')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Waste Categories Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map(category => {
          const categoryRecords = wasteRecords.filter(r => r.category === category);
          const categoryCount = categoryRecords.length;
          
          return (
            <div key={category} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{getCategoryIcon(category)}</div>
                <span className="text-2xl font-bold text-gray-900">{categoryCount}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{category}</h3>
              <p className="text-sm text-gray-500">
                {Math.round((categoryCount / wasteRecords.length) * 100)}% of total waste
              </p>
            </div>
          );
        })}
      </div>

      {/* Waste Records Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Waste Records ({filteredRecords.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.slice(0, 50).map(record => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {record.tag}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(record.category)}`}>
                      {getCategoryIcon(record.category)} {record.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.weight} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    📍 {record.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={record.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {record.metadata.description || 'No description'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <Recycle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No waste records found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {filteredRecords.length > 50 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing first 50 of {filteredRecords.length} records. Use filters to narrow down results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
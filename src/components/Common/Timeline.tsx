import React from 'react';
import { TimelineEvent } from '../../types';
import { formatDateTime, getRelativeTime } from '../../utils/security';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export default function Timeline({ events, className = '' }: TimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'collected':
      case 'processed':
      case 'recycled':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_transit':
      case 'segregated':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
      
      <div className="space-y-3">
        {sortedEvents.map((event, index) => (
          <div key={event.id} className="flex items-start space-x-3">
            {/* Timeline Line */}
            <div className="relative">
              <div className="flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 rounded-full">
                {getStatusIcon(event.status)}
              </div>
              {index < sortedEvents.length - 1 && (
                <div className="absolute top-8 left-1/2 w-0.5 h-8 bg-gray-200 transform -translate-x-1/2" />
              )}
            </div>

            {/* Event Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <StatusBadge status={event.status} size="sm" />
                <span className="text-sm text-gray-500" title={formatDateTime(event.timestamp)}>
                  {getRelativeTime(event.timestamp)}
                </span>
              </div>
              
              <p className="mt-1 text-sm text-gray-600">
                {event.notes || `Status updated to ${event.status}`}
              </p>
              
              <div className="mt-1 text-xs text-gray-500">
                <span>📍 {event.location}</span>
                <span className="mx-2">•</span>
                <span>By: {event.updatedBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No timeline events available
        </p>
      )}
    </div>
  );
}
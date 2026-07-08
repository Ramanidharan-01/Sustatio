import React from 'react';
import { WasteStatus } from '../../types';

interface StatusBadgeProps {
  status: WasteStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusStyle = (status: WasteStatus) => {
    switch (status) {
      case 'collected':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'segregated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'processed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disposed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'recycled':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${getStatusStyle(status)} ${sizeClasses[size]}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
}
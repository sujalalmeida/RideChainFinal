"use client";

import React from 'react';
import { Car, Leaf, Shield, Users, Clock } from 'lucide-react';
import { RideType } from '@/contexts/app-context';

interface VehicleOptionCardProps {
  type: RideType;
  title: string;
  description: string;
  price: number;
  eta: string;
  isSelected?: boolean;
  onSelect: () => void;
}

export function VehicleOptionCard({
  type,
  title,
  description,
  price,
  eta,
  isSelected = false,
  onSelect
}: VehicleOptionCardProps) {
  // Get icon based on ride type
  const getIcon = () => {
    switch (type) {
      case 'green':
        return <Leaf className="h-5 w-5 text-green-600" />;
      case 'premium':
        return <Shield className="h-5 w-5 text-indigo-600" />;
      case 'carpool':
        return <Users className="h-5 w-5 text-blue-600" />;
      default:
        return <Car className="h-5 w-5 text-indigo-600" />;
    }
  };
  
  // Get background style based on selection
  const getBackgroundStyle = () => {
    return isSelected 
      ? 'border-2 border-indigo-600 bg-indigo-50' 
      : 'border border-gray-200 hover:border-indigo-300 hover:bg-gray-50';
  };

  return (
    <div 
      className={`rounded-lg p-4 cursor-pointer transition-all ${getBackgroundStyle()}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-full bg-gray-100 flex-shrink-0">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{eta}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="font-medium">${price.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Show the checkmark for selected option */}
      {isSelected && (
        <div className="mt-2 text-xs font-medium text-indigo-600">
          ✓ Selected
        </div>
      )}
      
      {/* Special badges for certain vehicle types */}
      {type === 'green' && (
        <div className="mt-2 text-xs font-medium px-2 py-0.5 bg-green-100 text-green-800 rounded-full inline-block">
          <Leaf className="inline h-3 w-3 mr-1" />
          Eco-friendly
        </div>
      )}
      
      {type === 'carpool' && (
        <div className="mt-2 text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full inline-block">
          <Users className="inline h-3 w-3 mr-1" />
          Shared ride
        </div>
      )}
    </div>
  );
} 
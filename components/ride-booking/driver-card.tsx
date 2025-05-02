"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Clock, Leaf, Star } from 'lucide-react';
import { Driver } from '@/contexts/app-context';

interface DriverCardProps {
  driver: Driver;
  estimatedArrival: string;
  isSelected?: boolean;
  onSelect: () => void;
}

export function DriverCard({
  driver,
  estimatedArrival,
  isSelected = false,
  onSelect
}: DriverCardProps) {
  // Get background style based on selection
  const getBackgroundStyle = () => {
    return isSelected 
      ? 'border-2 border-indigo-600 bg-indigo-50' 
      : 'border border-gray-200 hover:border-indigo-300 hover:bg-gray-50';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all ${getBackgroundStyle()}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
            <AvatarImage src={driver.avatar} alt={driver.name} />
            <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{driver.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                  <span>{driver.rating}</span>
                </div>
              </div>
              
              <Badge className="bg-indigo-100 text-indigo-800 font-normal">
                <Clock className="h-3 w-3 mr-1" />
                {estimatedArrival}
              </Badge>
            </div>
            
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <Car className="h-3 w-3 mr-1" />
              <span>
                {driver.car.model} • {driver.car.color}
                {driver.car.plate && ` • ${driver.car.plate}`}
              </span>
            </div>
            
            {driver.car.isGreen && (
              <div className="mt-2 flex items-center">
                <Badge className="bg-green-100 text-green-800 font-normal text-xs">
                  <Leaf className="h-3 w-3 mr-1" />
                  Electric Vehicle
                </Badge>
              </div>
            )}
            
            {driver.safetyScore && (
              <div className="mt-2 text-xs">
                <span className="text-gray-500">Safety Score:</span>
                <span className="ml-1 text-indigo-600 font-medium">{driver.safetyScore}/100</span>
              </div>
            )}
          </div>
        </div>
        
        {isSelected && (
          <div className="mt-2 text-xs font-medium text-indigo-600 text-right">
            ✓ Selected
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
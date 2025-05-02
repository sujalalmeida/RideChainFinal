"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, MapPin, Navigation, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Location } from '@/lib/types';
import { getLocationSuggestions } from '@/lib/gemini-service';
import { debounce } from 'lodash';

interface LocationSearchProps {
  type: 'pickup' | 'destination';
  value?: string;
  onChange: (location: Location) => void;
  placeholder?: string;
}

export function LocationSearch({ type, value = '', onChange, placeholder }: LocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create a debounced search function to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) return;
      
      setIsLoading(true);
      try {
        const results = await getLocationSuggestions(query);
        setSuggestions(results);
      } catch (error) {
        console.error("Error getting location suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );
  
  // Update inputValue when the value prop changes
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.length >= 2) {
      setOpen(true);
      console.log("Searching for locations with query:", value);
      debouncedSearch(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectLocation = (location: Location) => {
    console.log("Selected location:", location);
    setInputValue(location.address || '');
    onChange(location);
    setOpen(false);
  };

  // Function to create a location from the entered text when no suggestions are found
  const useManualLocation = () => {
    if (!inputValue) return;
    
    console.log("Using manual location:", inputValue);
    
    // Create a new location with default coordinates that will be updated later
    const manualLocation: Location = {
      lat: 19.0760 + (Math.random() * 0.01), // Random coordinates near Mumbai for testing
      lng: 72.8777 + (Math.random() * 0.01),
      address: inputValue,
      name: inputValue.split(',')[0]
    };
    
    // Log the created manual location and pass it to the parent
    console.log("Created manual location:", manualLocation);
    handleSelectLocation(manualLocation);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative flex-1">
              {type === 'pickup' ? (
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              ) : (
                <Navigation className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                placeholder={placeholder || (type === 'pickup' ? 'Enter pickup location' : 'Enter destination')}
                value={inputValue}
                onChange={handleInputChange}
                className="pl-9 pr-8"
              />
              {inputValue && (
                <ChevronDown 
                  className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                  onClick={() => setOpen(!open)}
                />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-full min-w-[300px]" align="start">
            <Command>
              <CommandList>
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600 mr-2" />
                    <span className="text-sm text-gray-500">Searching for locations...</span>
                  </div>
                ) : (
                  <>
                    <CommandEmpty>
                      <div className="p-2 text-sm">
                        No locations found.
                        <Button 
                          variant="link" 
                          className="text-indigo-600 p-0 h-auto ml-1"
                          onClick={useManualLocation}
                        >
                          Use this text as location
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {suggestions.map((location) => (
                        <CommandItem
                          key={`${location.lat}-${location.lng}`}
                          onSelect={() => handleSelectLocation(location)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full">
                            {type === 'pickup' ? (
                              <MapPin className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                            ) : (
                              <Navigation className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-medium truncate">{location.name}</span>
                              <span className="text-xs text-gray-500 truncate">
                                {location.address}
                              </span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        <Button
          variant="outline"
          size="icon"
          onClick={useManualLocation}
          title="Use current input"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 
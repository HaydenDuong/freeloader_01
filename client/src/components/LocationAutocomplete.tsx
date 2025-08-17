import React, { useState, useEffect, useRef } from 'react';
import './LocationAutocomplete.css';

interface LocationSuggestion {
  place_id: number;
  display_name: string;
  name: string;
  type: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter location",
  disabled = false,
  required = false,
  id = "location-autocomplete"
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      // Using Nominatim API (free OpenStreetMap geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const formattedSuggestions: LocationSuggestion[] = data.map((item: any) => ({
          place_id: item.place_id,
          display_name: item.display_name,
          name: item.name || item.display_name.split(',')[0],
          type: item.type || 'location'
        }));
        
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onChange(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur (with delay to allow for clicks)
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Get icon for location type
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'university':
      case 'school':
      case 'college':
        return '🎓';
      case 'hospital':
      case 'clinic':
        return '🏥';
      case 'restaurant':
      case 'cafe':
        return '🍽️';
      case 'shop':
      case 'mall':
        return '🛍️';
      case 'park':
        return '🌳';
      case 'hotel':
        return '🏨';
      case 'building':
      case 'office':
        return '🏢';
      case 'station':
      case 'transport':
        return '🚉';
      default:
        return '📍';
    }
  };

  return (
    <div className="location-autocomplete-container">
      <input
        ref={inputRef}
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="location-autocomplete-input"
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="location-loading">
          <div className="loading-spinner-small"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="location-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              className={`location-suggestion ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="suggestion-icon">
                {getLocationIcon(suggestion.type)}
              </div>
              <div className="suggestion-content">
                <div className="suggestion-name">{suggestion.name}</div>
                <div className="suggestion-address">{suggestion.display_name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;

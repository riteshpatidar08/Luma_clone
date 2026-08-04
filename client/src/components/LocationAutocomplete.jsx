import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { Input } from './ui/Input';

export function LocationAutocomplete({ value, onChange, onSelect, placeholder, className, id }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync internal state if prop value changes externally
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Handle outside click to close dropdown suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch location suggestions from OpenStreetMap Nominatim API
  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setIsOpen(data.length > 0);
        }
      } catch (err) {
        console.error('Error fetching OpenStreetMap Nominatim suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    }, 350); // Debounce API calls by 350ms

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange?.(val);
  };

  const handleSelectSuggestion = (item) => {
    const formattedAddress = item.display_name;
    setQuery(formattedAddress);
    onChange?.(formattedAddress);

    const addressComp = item.address || {};
    const city = addressComp.city || addressComp.town || addressComp.village || addressComp.state_district || addressComp.state;
    const country = addressComp.country;
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    onSelect?.({
      formattedAddress,
      placeId: String(item.place_id),
      lat,
      lng,
      city,
      country,
    });

    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange?.('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-luma-text-gray z-10" />
        <Input
          id={id}
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder || 'Search address or location...'}
          className={className ? `pl-10 pr-8 ${className}` : 'pl-10 pr-8'}
          autoComplete="off"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-luma-text-gray animate-spin z-10" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-luma-text-gray hover:text-white z-10"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-[#181a1d] border border-white/10 rounded-xl shadow-2xl py-1 text-sm">
          {suggestions.map((item) => (
            <li
              key={item.place_id}
              onClick={() => handleSelectSuggestion(item)}
              className="px-4 py-2.5 hover:bg-white/10 cursor-pointer transition-colors duration-150 flex items-start gap-2.5 text-luma-text-main"
            >
              <MapPin className="w-4 h-4 text-luma-yellow shrink-0 mt-0.5" />
              <span className="line-clamp-2">{item.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

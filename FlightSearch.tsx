import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plane, MapPin, Search, ArrowUpDown, Calendar, Users, ChevronDown, X } from 'lucide-react';
import DatePicker from './DatePicker';

interface FlightSearchProps {
  tripStartDate: string;
  tripEndDate: string;
}

interface FlightSegment {
  id: string;
  from: string;
  to: string;
  departureDate: string;
}

// Airport data with codes and icons
const airports = [
  // India - Major Cities
  { city: 'Mumbai', code: 'BOM', country: 'India', icon: '🏙️' },
  { city: 'Delhi', code: 'DEL', country: 'India', icon: '🏛️' },
  { city: 'Bangalore', code: 'BLR', country: 'India', icon: '🌆' },
  { city: 'Chennai', code: 'MAA', country: 'India', icon: '🏖️' },
  { city: 'Kolkata', code: 'CCU', country: 'India', icon: '🎭' },
  { city: 'Hyderabad', code: 'HYD', country: 'India', icon: '💎' },
  { city: 'Pune', code: 'PNQ', country: 'India', icon: '🎓' },
  { city: 'Ahmedabad', code: 'AMD', country: 'India', icon: '🕌' },
  { city: 'Kochi', code: 'COK', country: 'India', icon: '🌴' },
  { city: 'Goa', code: 'GOI', country: 'India', icon: '🏖️' },
  
  // International - Popular Destinations
  { city: 'London', code: 'LHR', country: 'United Kingdom', icon: '🇬🇧' },
  { city: 'New York', code: 'JFK', country: 'United States', icon: '🇺🇸' },
  { city: 'Dubai', code: 'DXB', country: 'UAE', icon: '🇦🇪' },
  { city: 'Singapore', code: 'SIN', country: 'Singapore', icon: '🇸🇬' },
  { city: 'Tokyo', code: 'NRT', country: 'Japan', icon: '🇯🇵' },
  { city: 'Paris', code: 'CDG', country: 'France', icon: '🇫🇷' },
  { city: 'Frankfurt', code: 'FRA', country: 'Germany', icon: '🇩🇪' },
  { city: 'Amsterdam', code: 'AMS', country: 'Netherlands', icon: '🇳🇱' },
  { city: 'Bangkok', code: 'BKK', country: 'Thailand', icon: '🇹🇭' },
  { city: 'Hong Kong', code: 'HKG', country: 'Hong Kong', icon: '🇭🇰' },
  { city: 'Sydney', code: 'SYD', country: 'Australia', icon: '🇦🇺' },
  { city: 'Toronto', code: 'YYZ', country: 'Canada', icon: '🇨🇦' },
  { city: 'Zurich', code: 'ZUR', country: 'Switzerland', icon: '🇨🇭' },
  { city: 'Seoul', code: 'ICN', country: 'South Korea', icon: '🇰🇷' },
  { city: 'Kuala Lumpur', code: 'KUL', country: 'Malaysia', icon: '🇲🇾' },
];

interface AirportDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

const AirportDropdown: React.FC<AirportDropdownProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter airports based on search term
  const filteredAirports = React.useMemo(() => {
    if (!searchTerm.trim()) return airports;
    return airports.filter(airport =>
      airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Get selected airport details
  const selectedAirport = airports.find(airport => 
    `${airport.city} (${airport.code})` === value
  );

  // Handle click outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredAirports.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredAirports.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredAirports[highlightedIndex]) {
          handleSelect(filteredAirports[highlightedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, highlightedIndex, filteredAirports]);

  const handleSelect = useCallback((airport: typeof airports[0]) => {
    onChange(`${airport.city} (${airport.code})`);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  }, [onChange]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) {
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
      return !prev;
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setHighlightedIndex(-1);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  }, []);

  // Event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleClickOutside, handleKeyDown]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-sf-semibold text-gray-800 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-sf-medium bg-white transition-all duration-200 hover:border-gray-400 text-left text-gray-900 min-h-[48px] flex items-center justify-between"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedAirport ? (
            <>
              <span className="text-lg flex-shrink-0">{selectedAirport.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-sf-semibold text-gray-900">{selectedAirport.city}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-sf-bold rounded-md">
                    {selectedAirport.code}
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate">{selectedAirport.country}</div>
              </div>
            </>
          ) : (
            <>
              <MapPin size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-500 truncate">{placeholder}</span>
            </>
          )}
        </div>
        <ChevronDown 
          size={18} 
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <Search size={16} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by city, airport code, or country..."
                className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-sf-medium bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                autoComplete="off"
                spellCheck="false"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Results Counter */}
            <div className="mt-3 text-xs font-sf-medium text-gray-500">
              {filteredAirports.length} airport{filteredAirports.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          </div>

          {/* Options List */}
          <div className="flex-1 overflow-y-auto">
            {filteredAirports.length > 0 ? (
              filteredAirports.map((airport, index) => (
                <button
                  key={`${airport.code}-${airport.city}`}
                  type="button"
                  onClick={() => handleSelect(airport)}
                  className={`w-full px-5 py-4 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0 flex items-center gap-3 ${
                    index === highlightedIndex 
                      ? 'bg-blue-50 text-blue-700' 
                      : value === `${airport.city} (${airport.code})`
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-900'
                  }`}
                  role="option"
                  aria-selected={value === `${airport.city} (${airport.code})`}
                >
                  <span className="text-lg flex-shrink-0">{airport.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-sf-semibold text-gray-900">{airport.city}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-sf-bold rounded-md">
                        {airport.code}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{airport.country}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-5 py-12 text-center text-gray-500">
                <Search size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-sf-medium">No airports found</p>
                {searchTerm && (
                  <p className="text-xs font-sf-regular mt-2 text-gray-400">
                    Try searching by city name, airport code, or country
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredAirports.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
              <p className="text-xs font-sf-medium text-gray-600">
                Use ↑↓ arrow keys to navigate, Enter to select, Esc to close
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FlightSearch: React.FC<FlightSearchProps> = ({ tripStartDate, tripEndDate }) => {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('round-trip');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0
  });
  const [classType, setClassType] = useState('economy');
  const [isPassengerDropdownOpen, setIsPassengerDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const passengerDropdownRef = useRef<HTMLDivElement>(null);

  // Validate flight dates against trip dates
  const validateFlightDates = useCallback(() => {
    const newErrors: {[key: string]: string} = {};
    
    if (!tripStartDate || !tripEndDate) return newErrors;
    
    const tripStart = new Date(tripStartDate);
    const tripEnd = new Date(tripEndDate);
    
    if (departureDate) {
      const depDate = new Date(departureDate);
      if (depDate < tripStart || depDate > tripEnd) {
        newErrors.departureDate = `Must be between ${tripStartDate} and ${tripEndDate}`;
      }
    }
    
    if (tripType === 'round-trip' && returnDate) {
      const retDate = new Date(returnDate);
      if (retDate < tripStart || retDate > tripEnd) {
        newErrors.returnDate = `Must be between ${tripStartDate} and ${tripEndDate}`;
      }
    }
    
    return newErrors;
  }, [departureDate, returnDate, tripStartDate, tripEndDate, tripType]);

  // Update errors when dates change
  useEffect(() => {
    const newErrors = validateFlightDates();
    setErrors(newErrors);
  }, [validateFlightDates]);

  // Handle click outside for passenger dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (passengerDropdownRef.current && !passengerDropdownRef.current.contains(event.target as Node)) {
        setIsPassengerDropdownOpen(false);
      }
    };

    if (isPassengerDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPassengerDropdownOpen]);

  const swapAirports = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const updatePassengers = (type: 'adults' | 'children' | 'infants', increment: boolean) => {
    setPassengers(prev => {
      const newCount = increment ? prev[type] + 1 : Math.max(0, prev[type] - 1);
      
      // Ensure at least 1 adult
      if (type === 'adults' && newCount < 1) return prev;
      
      return { ...prev, [type]: newCount };
    });
  };

  const getTotalPassengers = () => {
    return passengers.adults + passengers.children + passengers.infants;
  };

  const getPassengerText = () => {
    const total = getTotalPassengers();
    if (total === 1) return '1 Passenger';
    
    const parts = [];
    if (passengers.adults > 0) parts.push(`${passengers.adults} Adult${passengers.adults > 1 ? 's' : ''}`);
    if (passengers.children > 0) parts.push(`${passengers.children} Child${passengers.children > 1 ? 'ren' : ''}`);
    if (passengers.infants > 0) parts.push(`${passengers.infants} Infant${passengers.infants > 1 ? 's' : ''}`);
    
    return parts.join(', ');
  };

  const isSearchDisabled = () => {
    const hasErrors = Object.keys(errors).length > 0;
    const missingRequired = !from || !to || !departureDate || (tripType === 'round-trip' && !returnDate);
    return hasErrors || missingRequired;
  };

  const handleSearch = () => {
    if (isSearchDisabled()) return;
    
    // Handle flight search logic here
    console.log('Searching flights:', {
      tripType,
      from,
      to,
      departureDate,
      returnDate,
      passengers,
      classType
    });
    
    alert('Flight search functionality would be implemented here!');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Plane className="text-blue-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-sf-bold text-gray-900">Flight Search</h3>
          <p className="text-sm font-sf-medium text-gray-600">Find and book flights for your trip</p>
        </div>
      </div>

      {/* Trip Date Constraint Info */}
      {tripStartDate && tripEndDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-blue-600" />
            <span className="text-sm font-sf-semibold text-blue-800">Flight Date Constraints</span>
          </div>
          <p className="text-sm font-sf-medium text-blue-700">
            Flight dates must be within your trip period: <strong>{tripStartDate}</strong> to <strong>{tripEndDate}</strong>
          </p>
        </div>
      )}

      {/* Trip Type Selection */}
      <div className="mb-6">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              value="round-trip"
              checked={tripType === 'round-trip'}
              onChange={(e) => setTripType(e.target.value as 'round-trip')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-sf-medium text-gray-700">Round Trip</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              value="one-way"
              checked={tripType === 'one-way'}
              onChange={(e) => setTripType(e.target.value as 'one-way')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-sf-medium text-gray-700">One Way</span>
          </label>
        </div>
      </div>

      {/* Airport Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <AirportDropdown
            label="From"
            value={from}
            onChange={setFrom}
            placeholder="Select departure city"
            required
          />
        </div>
        
        {/* Swap Button */}
        <div className="relative">
          <AirportDropdown
            label="To"
            value={to}
            onChange={setTo}
            placeholder="Select destination city"
            required
          />
          <button
            type="button"
            onClick={swapAirports}
            className="absolute -left-6 top-1/2 transform -translate-y-1/2 lg:top-10 lg:-left-6 p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-sm z-10"
            title="Swap airports"
          >
            <ArrowUpDown size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div>
          <DatePicker
            label="Departure Date"
            value={departureDate}
            onChange={setDepartureDate}
            required
            placeholder="Select departure date"
            minDate={tripStartDate}
          />
          {errors.departureDate && (
            <p className="text-xs text-red-500 mt-1 font-sf-medium">
              {errors.departureDate}
            </p>
          )}
        </div>
        
        {tripType === 'round-trip' && (
          <div>
            <DatePicker
              label="Return Date"
              value={returnDate}
              onChange={setReturnDate}
              required
              placeholder="Select return date"
              minDate={departureDate || tripStartDate}
            />
            {errors.returnDate && (
              <p className="text-xs text-red-500 mt-1 font-sf-medium">
                {errors.returnDate}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Passengers and Class */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Passengers Dropdown */}
        <div ref={passengerDropdownRef} className="relative">
          <label className="block text-sm font-sf-semibold text-gray-800 mb-2">
            Passengers
          </label>
          <button
            type="button"
            onClick={() => setIsPassengerDropdownOpen(!isPassengerDropdownOpen)}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-sf-medium bg-white transition-all duration-200 hover:border-gray-400 text-left text-gray-900 min-h-[48px] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Users size={16} className="text-gray-400" />
              <span>{getPassengerText()}</span>
            </div>
            <ChevronDown 
              size={18} 
              className={`text-gray-400 transition-transform duration-200 ${
                isPassengerDropdownOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </button>

          {/* Passengers Dropdown Menu */}
          {isPassengerDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-40 p-4">
              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-sf-semibold text-gray-900">Adults</div>
                    <div className="text-xs text-gray-500">12+ years</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updatePassengers('adults', false)}
                      disabled={passengers.adults <= 1}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-sf-medium">{passengers.adults}</span>
                    <button
                      type="button"
                      onClick={() => updatePassengers('adults', true)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-sf-semibold text-gray-900">Children</div>
                    <div className="text-xs text-gray-500">2-11 years</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updatePassengers('children', false)}
                      disabled={passengers.children <= 0}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-sf-medium">{passengers.children}</span>
                    <button
                      type="button"
                      onClick={() => updatePassengers('children', true)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-sf-semibold text-gray-900">Infants</div>
                    <div className="text-xs text-gray-500">0-23 months</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updatePassengers('infants', false)}
                      disabled={passengers.infants <= 0}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-sf-medium">{passengers.infants}</span>
                    <button
                      type="button"
                      onClick={() => updatePassengers('infants', true)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Class Selection */}
        <div>
          <label className="block text-sm font-sf-semibold text-gray-800 mb-2">
            Class
          </label>
          <select
            value={classType}
            onChange={(e) => setClassType(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-sf-medium bg-white transition-all duration-200 hover:border-gray-400 text-gray-900 appearance-none cursor-pointer min-h-[48px]"
          >
            <option value="economy">Economy</option>
            <option value="premium-economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={isSearchDisabled()}
        className={`w-full py-4 rounded-xl font-sf-semibold transition-all duration-200 text-base flex items-center justify-center gap-3 ${
          isSearchDisabled()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02] shadow-lg hover:shadow-xl'
        }`}
      >
        <Search size={20} />
        Search Flights
      </button>
    </div>
  );
};

export default FlightSearch;
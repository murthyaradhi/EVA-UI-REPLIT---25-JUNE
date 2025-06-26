import React, { useState, useEffect, useCallback } from 'react';
import FormField from './FormField';
import DatePicker from './DatePicker';
import { ChevronDown, Phone } from 'lucide-react';

interface TravelerDetailsProps {
  isInternational: boolean;
  onDataChange: (data: TravelerData) => void;
  initialData: TravelerData;
}

interface TravelerData {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  mobileNumber: string;
  emailId: string;
}

// Country codes data
const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
  { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico' },
  { code: '+31', country: 'NL', flag: '🇳🇱', name: 'Netherlands' },
];

const TravelerDetails: React.FC<TravelerDetailsProps> = ({ 
  isInternational, 
  onDataChange, 
  initialData 
}) => {
  const [travelerData, setTravelerData] = useState<TravelerData>(initialData);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoized handlers to prevent unnecessary re-renders
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('[data-country-dropdown]')) {
      setIsCountryDropdownOpen(false);
    }
  }, []);

  // FIXED: Initialize mobile number from pre-populated data - ONLY ONCE
  useEffect(() => {
    if (!isInitialized && initialData.mobileNumber) {
      if (initialData.mobileNumber.includes('-')) {
        const [code, number] = initialData.mobileNumber.split('-');
        if (code && number) {
          setSelectedCountryCode(code);
          setMobileNumber(number);
        }
      } else {
        // If mobile number doesn't have country code, assume it's Indian number
        setMobileNumber(initialData.mobileNumber.replace(/^\+91-?/, ''));
        setSelectedCountryCode('+91');
      }
      setIsInitialized(true);
    }
  }, [initialData.mobileNumber, isInitialized]);

  // FIXED: Update parent component when data changes - WITH PROPER DEPENDENCIES
  useEffect(() => {
    if (isInitialized) {
      const fullMobileNumber = mobileNumber ? `${selectedCountryCode}-${mobileNumber}` : initialData.mobileNumber;
      const updatedData = { ...travelerData, mobileNumber: fullMobileNumber };
      
      // FIXED: Only call onDataChange if data actually changed
      const hasChanged = JSON.stringify(updatedData) !== JSON.stringify(initialData);
      if (hasChanged) {
        onDataChange(updatedData);
      }
    }
  }, [travelerData, selectedCountryCode, mobileNumber, isInitialized]); // REMOVED onDataChange and initialData from dependencies

  // FIXED: Update local state when initialData changes - ONLY WHEN NECESSARY
  useEffect(() => {
    // Only update if the data is actually different
    const isDifferent = JSON.stringify(travelerData) !== JSON.stringify(initialData);
    if (isDifferent && !isInitialized) {
      setTravelerData(initialData);
    }
  }, [initialData]); // REMOVED travelerData from dependencies to prevent loop

  // Handle click outside for country dropdown
  useEffect(() => {
    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isCountryDropdownOpen, handleClickOutside]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleInputChange = useCallback((field: keyof TravelerData, value: string) => {
    setTravelerData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMobileNumberChange = useCallback((value: string) => {
    // Only allow numeric input and limit to 10 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(numericValue);
  }, []);

  const handleCountrySelect = useCallback((countryCode: string) => {
    setSelectedCountryCode(countryCode);
    setIsCountryDropdownOpen(false);
  }, []);

  const toggleCountryDropdown = useCallback(() => {
    setIsCountryDropdownOpen(prev => !prev);
  }, []);

  const selectedCountry = React.useMemo(() => 
    countryCodes.find(c => c.code === selectedCountryCode) || countryCodes[3], // Default to India
    [selectedCountryCode]
  );

  return (
    <div className="space-y-6">
      {/* Personal Information Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Title - Smaller column */}
        <div className="col-span-12 sm:col-span-2">
          <label className="block text-sm font-sf-semibold text-gray-800 mb-2">
            Title
          </label>
          <div className="relative">
            <select
              value={travelerData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-sf-medium bg-white transition-all duration-200 hover:border-gray-400 text-gray-900 appearance-none cursor-pointer min-h-[48px]"
            >
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Dr.">Dr.</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* First Name - Larger column */}
        <div className="col-span-12 sm:col-span-5">
          <FormField
            label="First Name"
            value={travelerData.firstName}
            onChange={(value) => handleInputChange('firstName', value)}
            placeholder="Enter first name"
            required
          />
        </div>

        {/* Last Name - Larger column */}
        <div className="col-span-12 sm:col-span-5">
          <FormField
            label="Last Name"
            value={travelerData.lastName}
            onChange={(value) => handleInputChange('lastName', value)}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>

      {/* International Travel DOB Section */}
      {isInternational && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-sf-semibold text-yellow-800">International Travel Requirement</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DatePicker
              label="Date of Birth"
              value={travelerData.dateOfBirth}
              onChange={(value) => handleInputChange('dateOfBirth', value)}
              required
              placeholder="Select date of birth"
            />
          </div>
        </div>
      )}

      {/* Contact Information Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mobile Number with Country Code */}
        <div>
          <label className="block text-sm font-sf-semibold text-gray-800 mb-2">
            Mobile Number
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex">
            {/* Country Code Dropdown */}
            <div className="relative" data-country-dropdown>
              <button
                type="button"
                onClick={toggleCountryDropdown}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 border-r-0 rounded-l-lg bg-white hover:bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[110px] h-[48px]"
                aria-expanded={isCountryDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Select country code"
              >
                <span className="text-lg" role="img" aria-label={selectedCountry.name}>
                  {selectedCountry.flag}
                </span>
                <span className="text-sm font-sf-medium text-gray-700">{selectedCountry.code}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {/* Country Dropdown */}
              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-90 max-h-60 overflow-y-auto w-[300px]">
                  {countryCodes.map((country) => (
                    <button
                      key={`${country.code}-${country.country}`}
                      type="button"
                      onClick={() => handleCountrySelect(country.code)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                      role="option"
                      aria-selected={selectedCountryCode === country.code}
                    >
                      <span className="text-base" role="img" aria-label={country.name}>
                        {country.flag}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-sf-medium text-gray-900 truncate">{country.name}</div>
                        <div className="text-xs font-sf-regular text-gray-500">{country.code}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Number Input */}
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <Phone size={16} />
              </div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => handleMobileNumberChange(e.target.value)}
                placeholder="Enter 10-digit number"
                maxLength={10}
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm font-sf-medium bg-white hover:border-gray-400 text-gray-900 placeholder-gray-500 h-[48px]"
                required
                autoComplete="tel"
              />
              {/* Character counter - only show when typing */}
              {mobileNumber.length > 0 && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  {mobileNumber.length}/10
                </div>
              )}
            </div>
          </div>
          {mobileNumber.length > 0 && mobileNumber.length < 10 && (
            <p className="text-xs text-red-500 mt-1 font-sf-medium">
              Please enter exactly 10 digits
            </p>
          )}
        </div>

        {/* Email ID */}
        <div>
          <FormField
            label="Email ID"
            type="email"
            value={travelerData.emailId}
            onChange={(value) => handleInputChange('emailId', value)}
            placeholder="Enter email address"
            required
          />
        </div>
      </div>

      {/* Information Notice - Updated to reflect mandatory pre-populated fields */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-sf-semibold text-blue-800">Employee Profile Information</span>
        </div>
        <p className="text-sm font-sf-medium text-blue-700 leading-relaxed">
          <strong>Mobile Number</strong> and <strong>Email ID</strong> are mandatory fields pre-populated from your employee profile. Other traveler details can be updated as needed for this trip.
        </p>
      </div>
    </div>
  );
};

export default TravelerDetails;
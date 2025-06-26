import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Users, Baby, User, UserCheck, ChevronDown } from 'lucide-react';
import FormField from './FormField';
import DatePicker from './DatePicker';

interface GuestTraveler {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  mobileNumber: string;
  emailId: string;
  countryCode: string;
  mobileOnly: string;
}

interface GuestTravelerManagerProps {
  isInternational: boolean;
  onDataChange: (travelers: GuestTraveler[]) => void;
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

const GuestTravelerManager: React.FC<GuestTravelerManagerProps> = ({ 
  isInternational, 
  onDataChange 
}) => {
  const [travelers, setTravelers] = useState<GuestTraveler[]>([]);
  const [openCountryDropdowns, setOpenCountryDropdowns] = useState<{ [key: string]: boolean }>({});

  // Memoized handlers to prevent unnecessary re-renders
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('[data-country-dropdown]')) {
      setOpenCountryDropdowns({});
    }
  }, []);

  // Initialize with one adult traveler
  useEffect(() => {
    if (travelers.length === 0) {
      addTraveler('adult');
    }
  }, []);

  // Update parent component when travelers change
  useEffect(() => {
    onDataChange(travelers);
  }, [travelers, onDataChange]);

  // Handle click outside for country dropdowns
  useEffect(() => {
    const hasOpenDropdowns = Object.values(openCountryDropdowns).some(isOpen => isOpen);
    if (hasOpenDropdowns) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openCountryDropdowns, handleClickOutside]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const generateId = useCallback(() => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }, []);

  const addTraveler = useCallback((type: 'adult' | 'child' | 'infant') => {
    const newTraveler: GuestTraveler = {
      id: generateId(),
      type,
      title: 'Mr.',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      mobileNumber: '',
      emailId: '',
      countryCode: '+91',
      mobileOnly: '',
    };
    setTravelers(prev => [...prev, newTraveler]);
  }, [generateId]);

  const removeTraveler = useCallback((id: string) => {
    setTravelers(prev => prev.filter(t => t.id !== id));
    // Clean up any open dropdowns for removed traveler
    setOpenCountryDropdowns(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  }, []);

  const updateTraveler = useCallback((id: string, field: keyof GuestTraveler, value: string) => {
    setTravelers(prev => prev.map(traveler => 
      traveler.id === id 
        ? { 
            ...traveler, 
            [field]: value,
            // Update full mobile number when country code or mobile changes
            ...(field === 'countryCode' || field === 'mobileOnly' 
              ? { mobileNumber: field === 'countryCode' 
                  ? `${value}-${traveler.mobileOnly}` 
                  : `${traveler.countryCode}-${value}` 
                }
              : {})
          }
        : traveler
    ));
  }, []);

  const handleMobileNumberChange = useCallback((id: string, value: string) => {
    // Only allow numeric input and limit to 10 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    updateTraveler(id, 'mobileOnly', numericValue);
  }, [updateTraveler]);

  const toggleCountryDropdown = useCallback((travelerId: string) => {
    setOpenCountryDropdowns(prev => ({
      ...prev,
      [travelerId]: !prev[travelerId]
    }));
  }, []);

  const selectCountryCode = useCallback((travelerId: string, countryCode: string) => {
    updateTraveler(travelerId, 'countryCode', countryCode);
    setOpenCountryDropdowns(prev => ({
      ...prev,
      [travelerId]: false
    }));
  }, [updateTraveler]);

  const getTypeIcon = useCallback((type: 'adult' | 'child' | 'infant') => {
    switch (type) {
      case 'adult':
        return <User size={16} className="text-blue-600" />;
      case 'child':
        return <UserCheck size={16} className="text-green-600" />;
      case 'infant':
        return <Baby size={16} className="text-purple-600" />;
    }
  }, []);

  const getTypeColor = useCallback((type: 'adult' | 'child' | 'infant') => {
    switch (type) {
      case 'adult':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'child':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'infant':
        return 'bg-purple-50 border-purple-200 text-purple-800';
    }
  }, []);

  const getTypeLabel = useCallback((type: 'adult' | 'child' | 'infant') => {
    switch (type) {
      case 'adult':
        return 'Adult (12+ years)';
      case 'child':
        return 'Child (2-11 years)';
      case 'infant':
        return 'Infant (0-23 months)';
    }
  }, []);

  const getTravelerCounts = useCallback(() => {
    const counts = travelers.reduce((acc, traveler) => {
      acc[traveler.type] = (acc[traveler.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      adults: counts.adult || 0,
      children: counts.child || 0,
      infants: counts.infant || 0,
      total: travelers.length
    };
  }, [travelers]);

  const counts = getTravelerCounts();

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h3 className="text-base font-sf-semibold text-blue-800">Guest Travelers Summary</h3>
          </div>
          <div className="text-sm font-sf-medium text-blue-700">
            Total: {counts.total} traveler{counts.total !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-sf-bold text-blue-800">{counts.adults}</div>
            <div className="text-xs font-sf-medium text-blue-600">Adults</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-sf-bold text-green-800">{counts.children}</div>
            <div className="text-xs font-sf-medium text-green-600">Children</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-sf-bold text-purple-800">{counts.infants}</div>
            <div className="text-xs font-sf-medium text-purple-600">Infants</div>
          </div>
        </div>
      </div>

      {/* Add Traveler Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => addTraveler('adult')}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-sf-semibold transition-all duration-200 text-sm"
        >
          <Plus size={16} />
          Add Adult
        </button>
        <button
          type="button"
          onClick={() => addTraveler('child')}
          className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-sf-semibold transition-all duration-200 text-sm"
        >
          <Plus size={16} />
          Add Child
        </button>
        <button
          type="button"
          onClick={() => addTraveler('infant')}
          className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-sf-semibold transition-all duration-200 text-sm"
        >
          <Plus size={16} />
          Add Infant
        </button>
      </div>

      {/* Traveler Cards */}
      <div className="space-y-4">
        {travelers.map((traveler, index) => {
          const selectedCountry = countryCodes.find(c => c.code === traveler.countryCode) || countryCodes[3];
          
          return (
            <div key={traveler.id} className="bg-white border border-gray-200 rounded-xl p-5">
              {/* Traveler Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getTypeIcon(traveler.type)}
                  </div>
                  <div>
                    <h4 className="text-base font-sf-semibold text-gray-900">
                      Traveler #{index + 1}
                    </h4>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-sf-medium border ${getTypeColor(traveler.type)}`}>
                      {getTypeLabel(traveler.type)}
                    </div>
                  </div>
                </div>
                
                {travelers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTraveler(traveler.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Remove traveler"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-12 gap-4 mb-4">
                {/* Title */}
                <div className="col-span-12 sm:col-span-2">
                  <label className="block text-sm font-sf-semibold text-gray-800 mb-2">
                    Title
                  </label>
                  <div className="relative">
                    <select
                      value={traveler.title}
                      onChange={(e) => updateTraveler(traveler.id, 'title', e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-sf-medium bg-white transition-all duration-200 hover:border-gray-400 text-gray-900 appearance-none cursor-pointer min-h-[48px]"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Master">Master</option>
                      <option value="Miss">Miss</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* First Name */}
                <div className="col-span-12 sm:col-span-5">
                  <FormField
                    label="First Name"
                    value={traveler.firstName}
                    onChange={(value) => updateTraveler(traveler.id, 'firstName', value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="col-span-12 sm:col-span-5">
                  <FormField
                    label="Last Name"
                    value={traveler.lastName}
                    onChange={(value) => updateTraveler(traveler.id, 'lastName', value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth - Required for all international travelers and children/infants */}
              {(isInternational || traveler.type === 'child' || traveler.type === 'infant') && (
                <div className="mb-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-sf-semibold text-yellow-800">
                        {isInternational ? 'International Travel Requirement' : 'Age Verification Required'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <DatePicker
                        label="Date of Birth"
                        value={traveler.dateOfBirth}
                        onChange={(value) => updateTraveler(traveler.id, 'dateOfBirth', value)}
                        required
                        placeholder="Select date of birth"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information - Only for adults */}
              {traveler.type === 'adult' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Mobile Number */}
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
                          onClick={() => toggleCountryDropdown(traveler.id)}
                          className="flex items-center gap-2 px-4 py-3 border border-gray-300 border-r-0 rounded-l-lg bg-white hover:bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[110px] h-[48px]"
                          aria-expanded={openCountryDropdowns[traveler.id]}
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
                        {openCountryDropdowns[traveler.id] && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-90 max-h-60 overflow-y-auto w-[300px]">
                            {countryCodes.map((country) => (
                              <button
                                key={`${country.code}-${country.country}`}
                                type="button"
                                onClick={() => selectCountryCode(traveler.id, country.code)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                                role="option"
                                aria-selected={traveler.countryCode === country.code}
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
                        <input
                          type="tel"
                          value={traveler.mobileOnly}
                          onChange={(e) => handleMobileNumberChange(traveler.id, e.target.value)}
                          placeholder="Enter 10-digit number"
                          maxLength={10}
                          className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm font-sf-medium bg-white hover:border-gray-400 text-gray-900 placeholder-gray-500 h-[48px]"
                          required
                          autoComplete="tel"
                        />
                        {/* Character counter */}
                        {traveler.mobileOnly.length > 0 && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                            {traveler.mobileOnly.length}/10
                          </div>
                        )}
                      </div>
                    </div>
                    {traveler.mobileOnly.length > 0 && traveler.mobileOnly.length < 10 && (
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
                      value={traveler.emailId}
                      onChange={(value) => updateTraveler(traveler.id, 'emailId', value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Child/Infant Contact Notice */}
              {(traveler.type === 'child' || traveler.type === 'infant') && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-sf-semibold text-gray-800">Contact Information</span>
                  </div>
                  <p className="text-sm font-sf-medium text-gray-600 leading-relaxed">
                    Contact details will be inherited from the accompanying adult traveler during booking confirmation.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-sf-semibold text-blue-800">Guest Traveler Guidelines</span>
        </div>
        <div className="text-sm font-sf-medium text-blue-700 leading-relaxed space-y-1">
          <p><strong>Adults (12+ years):</strong> Full contact details required for all adult travelers.</p>
          <p><strong>Children (2-11 years):</strong> Date of birth required for age verification and fare calculation.</p>
          <p><strong>Infants (0-23 months):</strong> Date of birth mandatory. May travel on adult's lap on some airlines.</p>
        </div>
      </div>
    </div>
  );
};

export default GuestTravelerManager;
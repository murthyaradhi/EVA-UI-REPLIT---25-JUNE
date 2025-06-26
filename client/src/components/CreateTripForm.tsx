import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, Users, Building, MapPin, Plane, Car, Utensils, Coffee, Briefcase, UserPlus, Clock, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import FormField from './FormField';
import DatePicker, { DatePickerRef } from './DatePicker';
import SearchableDropdown, { SearchableDropdownRef } from './SearchableDropdown';
import TravelerDetails from './TravelerDetails';
import GuestTravelerManager from './GuestTravelerManager';
import FlightSearch from './FlightSearch';
import FlightSearchModal from './FlightSearchModal';
import HotelSearchModal from './HotelSearchModal';
import TripConflictModal from './TripConflictModal';
import { getAirportsByTravelMode, formatAirportOption } from '../../../shared/airports';

interface CreateTripFormProps {
  onClose: () => void;
}

interface TravelerData {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  mobileNumber: string;
  emailId: string;
}

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

interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  selected: boolean;
  color: string;
}

const CreateTripForm: React.FC<CreateTripFormProps> = ({ onClose }) => {
  // Form state
  const [tripName, setTripName] = useState('');
  const [bookingType, setBookingType] = useState<'business' | 'guest' | 'personal'>('business');
  const [travelMode, setTravelMode] = useState<'domestic' | 'international'>('domestic');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [entityName, setEntityName] = useState('');
  const [billingEntity, setBillingEntity] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [purpose, setPurpose] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');

  // Traveler state
  const [primaryTravelerData, setPrimaryTravelerData] = useState<TravelerData>({
    title: 'Mr.',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '',
    mobileNumber: '+91-9876543210',
    emailId: 'john.doe@company.com'
  });
  const [guestTravelers, setGuestTravelers] = useState<GuestTraveler[]>([]);

  // Services state
  const [services, setServices] = useState<Service[]>([
    {
      id: 'flights',
      name: 'Flights',
      icon: <Plane size={20} />,
      description: 'Book domestic and international flights',
      selected: false,
      color: 'blue'
    },
    {
      id: 'hotels',
      name: 'Hotels',
      icon: <Building size={20} />,
      description: 'Reserve accommodation for your stay',
      selected: false,
      color: 'green'
    },
    {
      id: 'cabs',
      name: 'Cabs',
      icon: <Car size={20} />,
      description: 'Ground transportation and transfers',
      selected: false,
      color: 'yellow'
    },
    {
      id: 'meals',
      name: 'Meals',
      icon: <Utensils size={20} />,
      description: 'Meal vouchers and dining arrangements',
      selected: false,
      color: 'red'
    },
    {
      id: 'visa',
      name: 'Visa',
      icon: <Coffee size={20} />,
      description: 'Visa processing and documentation',
      selected: false,
      color: 'purple'
    },
    {
      id: 'insurance',
      name: 'Insurance',
      icon: <Briefcase size={20} />,
      description: 'Travel insurance coverage',
      selected: false,
      color: 'indigo'
    }
  ]);

  // Modal states
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictingTripIds, setConflictingTripIds] = useState<string[]>([]);

  // Form validation and progression
  const [incompleteFields, setIncompleteFields] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Refs for auto-progression
  const startDateRef = useRef<DatePickerRef>(null);
  const endDateRef = useRef<DatePickerRef>(null);
  const fromLocationRef = useRef<SearchableDropdownRef>(null);
  const toLocationRef = useRef<SearchableDropdownRef>(null);

  // Generate trip name on component mount
  useEffect(() => {
    const generateTripName = () => {
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/ /g, '').toUpperCase();
      
      const randomId = Math.floor(1000 + Math.random() * 9000);
      return `TR - ${dateStr} - A${randomId}`;
    };

    if (!tripName) {
      setTripName(generateTripName());
    }
  }, [tripName]);

  // Auto-progression logic
  const handleFromLocationChange = useCallback((value: string) => {
    setFromLocation(value);
    if (value && toLocationRef.current) {
      setTimeout(() => {
        toLocationRef.current?.openDropdown();
      }, 300);
    }
  }, []);

  const handleToLocationChange = useCallback((value: string) => {
    setToLocation(value);
    if (value && startDateRef.current) {
      setTimeout(() => {
        startDateRef.current?.openCalendar();
      }, 300);
    }
  }, []);

  const handleStartDateChange = useCallback((value: string) => {
    setStartDate(value);
    if (value && endDateRef.current) {
      setTimeout(() => {
        endDateRef.current?.openCalendar();
      }, 300);
    }
  }, []);

  // Get airport options based on travel mode
  const airportOptions = React.useMemo(() => {
    const airports = getAirportsByTravelMode(travelMode);
    return airports.map(airport => formatAirportOption(airport).display);
  }, [travelMode]);

  // Validate required fields
  const validateForm = useCallback(() => {
    const required = [];
    if (!tripName.trim()) required.push('tripName');
    if (!startDate) required.push('startDate');
    if (!endDate) required.push('endDate');
    if (!fromLocation) required.push('fromLocation');
    if (!toLocation) required.push('toLocation');
    if (!entityName.trim()) required.push('entityName');
    if (!billingEntity.trim()) required.push('billingEntity');
    if (!purpose.trim()) required.push('purpose');

    setIncompleteFields(required);
    return required.length === 0;
  }, [tripName, startDate, endDate, fromLocation, toLocation, entityName, billingEntity, purpose]);

  // Handle service selection
  const toggleService = useCallback((serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, selected: !service.selected }
        : service
    ));
  }, []);

  // Handle flight search
  const handleFlightSearch = useCallback(() => {
    if (!startDate || !endDate || !fromLocation || !toLocation) {
      alert('Please fill in trip dates and locations first');
      return;
    }
    setShowFlightModal(true);
  }, [startDate, endDate, fromLocation, toLocation]);

  // Handle hotel search
  const handleHotelSearch = useCallback(() => {
    if (!startDate || !endDate || !toLocation) {
      alert('Please fill in trip dates and destination first');
      return;
    }
    setShowHotelModal(true);
  }, [startDate, endDate, toLocation]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    // Check for trip conflicts
    const hasConflicts = Math.random() < 0.3; // 30% chance of conflict for demo
    if (hasConflicts) {
      setConflictingTripIds(['TR-15JAN2025-A1234']);
      setShowConflictModal(true);
      return;
    }

    // Submit form
    console.log('Submitting trip:', {
      tripName,
      bookingType,
      travelMode,
      startDate,
      endDate,
      fromLocation,
      toLocation,
      entityName,
      billingEntity,
      costCenter,
      projectCode,
      purpose,
      urgency,
      primaryTravelerData,
      guestTravelers,
      selectedServices: services.filter(s => s.selected)
    });

    alert('Trip created successfully!');
  }, [validateForm, tripName, bookingType, travelMode, startDate, endDate, fromLocation, toLocation, entityName, billingEntity, costCenter, projectCode, purpose, urgency, primaryTravelerData, guestTravelers, services]);

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Trip Information Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-sf-bold text-gray-900">Trip Information</h3>
              <p className="text-sm font-sf-medium text-gray-600">Basic details about your trip</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Trip Name */}
            <FormField
              label="Trip Name"
              value={tripName}
              onChange={setTripName}
              placeholder="Enter trip name"
              required
              icon={<Sparkles size={16} />}
            />

            {/* Booking Type */}
            <div>
              <label className="block text-sm font-sf-semibold text-gray-800 mb-3">
                Booking Type
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'business', label: 'Business', icon: <Briefcase size={16} />, desc: 'Official company travel' },
                  { value: 'guest', label: 'Guest', icon: <UserPlus size={16} />, desc: 'External visitor travel' },
                  { value: 'personal', label: 'Personal', icon: <Users size={16} />, desc: 'Personal travel booking' }
                ].map((type) => (
                  <label key={type.value} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="bookingType"
                      value={type.value}
                      checked={bookingType === type.value}
                      onChange={(e) => setBookingType(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                      bookingType === type.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded ${bookingType === type.value ? 'text-blue-600' : 'text-gray-500'}`}>
                          {type.icon}
                        </div>
                        <span className={`font-sf-semibold text-sm ${bookingType === type.value ? 'text-blue-800' : 'text-gray-700'}`}>
                          {type.label}
                        </span>
                      </div>
                      <p className={`text-xs ${bookingType === type.value ? 'text-blue-600' : 'text-gray-500'}`}>
                        {type.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Travel Mode */}
            <div>
              <label className="block text-sm font-sf-semibold text-gray-800 mb-3">
                Travel Mode
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'domestic', label: 'Domestic', desc: 'Within India' },
                  { value: 'international', label: 'International', desc: 'Outside India' }
                ].map((mode) => (
                  <label key={mode.value} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="travelMode"
                      value={mode.value}
                      checked={travelMode === mode.value}
                      onChange={(e) => setTravelMode(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                      travelMode === mode.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                      <div className="text-center">
                        <span className={`font-sf-semibold text-sm block mb-1 ${travelMode === mode.value ? 'text-blue-800' : 'text-gray-700'}`}>
                          {mode.label}
                        </span>
                        <p className={`text-xs ${travelMode === mode.value ? 'text-blue-600' : 'text-gray-500'}`}>
                          {mode.desc}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SearchableDropdown
                ref={fromLocationRef}
                label="From Location"
                value={fromLocation}
                onChange={handleFromLocationChange}
                options={airportOptions}
                placeholder="Select departure city"
                required
                searchPlaceholder="Search airports..."
                isAirport
                tabIndex={1}
              />
              <SearchableDropdown
                ref={toLocationRef}
                label="To Location"
                value={toLocation}
                onChange={handleToLocationChange}
                options={airportOptions}
                placeholder="Select destination city"
                required
                searchPlaceholder="Search airports..."
                isAirport
                tabIndex={2}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DatePicker
                ref={startDateRef}
                label="Start Date"
                value={startDate}
                onChange={handleStartDateChange}
                required
                placeholder="Select start date"
                tabIndex={3}
              />
              <DatePicker
                ref={endDateRef}
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                required
                placeholder="Select end date"
                minDate={startDate}
                tabIndex={4}
              />
            </div>
          </div>
        </div>

        {/* Entity Information Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-sf-bold text-gray-900">Entity Information</h3>
              <p className="text-sm font-sf-medium text-gray-600">Billing and organizational details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormField
              label="Entity Name"
              value={entityName}
              onChange={setEntityName}
              placeholder="Enter entity name"
              required
            />
            <FormField
              label="Billing Entity"
              value={billingEntity}
              onChange={setBillingEntity}
              placeholder="Enter billing entity"
              required
            />
            <FormField
              label="Cost Center"
              value={costCenter}
              onChange={setCostCenter}
              placeholder="Enter cost center"
            />
            <FormField
              label="Project Code"
              value={projectCode}
              onChange={setProjectCode}
              placeholder="Enter project code"
            />
          </div>

          <div className="mt-4">
            <FormField
              label="Purpose of Travel"
              value={purpose}
              onChange={setPurpose}
              placeholder="Describe the purpose of your trip"
              required
            />
          </div>

          {/* Urgency */}
          <div className="mt-4">
            <label className="block text-sm font-sf-semibold text-gray-800 mb-3">
              Urgency Level
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'normal', label: 'Normal', icon: <Clock size={16} />, desc: 'Standard processing time' },
                { value: 'urgent', label: 'Urgent', icon: <AlertCircle size={16} />, desc: 'Expedited processing' }
              ].map((level) => (
                <label key={level.value} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="urgency"
                    value={level.value}
                    checked={urgency === level.value}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                    urgency === level.value
                      ? level.value === 'urgent' 
                        ? 'border-red-500 bg-red-50 shadow-lg'
                        : 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1 rounded ${
                        urgency === level.value 
                          ? level.value === 'urgent' ? 'text-red-600' : 'text-green-600'
                          : 'text-gray-500'
                      }`}>
                        {level.icon}
                      </div>
                      <span className={`font-sf-semibold text-sm ${
                        urgency === level.value 
                          ? level.value === 'urgent' ? 'text-red-800' : 'text-green-800'
                          : 'text-gray-700'
                      }`}>
                        {level.label}
                      </span>
                    </div>
                    <p className={`text-xs ${
                      urgency === level.value 
                        ? level.value === 'urgent' ? 'text-red-600' : 'text-green-600'
                        : 'text-gray-500'
                    }`}>
                      {level.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Traveler Details Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-sf-bold text-gray-900">Traveler Details</h3>
              <p className="text-sm font-sf-medium text-gray-600">Primary traveler and guest information</p>
            </div>
          </div>

          {/* Primary Traveler */}
          <div className="mb-8">
            <h4 className="text-base font-sf-semibold text-gray-800 mb-4">Primary Traveler</h4>
            <TravelerDetails
              isInternational={travelMode === 'international'}
              onDataChange={setPrimaryTravelerData}
              initialData={primaryTravelerData}
            />
          </div>

          {/* Guest Travelers */}
          {bookingType === 'guest' && (
            <div>
              <h4 className="text-base font-sf-semibold text-gray-800 mb-4">Guest Travelers</h4>
              <GuestTravelerManager
                isInternational={travelMode === 'international'}
                onDataChange={setGuestTravelers}
              />
            </div>
          )}
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Briefcase className="text-orange-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-sf-bold text-gray-900">Travel Services</h3>
              <p className="text-sm font-sf-medium text-gray-600">Select the services you need for your trip</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                data-service-button
                onClick={() => {
                  toggleService(service.id);
                  if (service.id === 'flights' && !service.selected) {
                    setTimeout(() => handleFlightSearch(), 500);
                  } else if (service.id === 'hotels' && !service.selected) {
                    setTimeout(() => handleHotelSearch(), 500);
                  }
                }}
                className={`p-4 border-2 rounded-xl transition-all duration-300 text-left group ${
                  service.selected
                    ? `border-${service.color}-500 bg-${service.color}-50 shadow-lg ring-2 ring-${service.color}-200`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={{
                  boxShadow: service.selected 
                    ? `0 0 20px rgba(251, 146, 60, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)` 
                    : undefined
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg transition-colors ${
                    service.selected 
                      ? `bg-${service.color}-100 text-${service.color}-600` 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }`}>
                    {service.icon}
                  </div>
                  <span className={`font-sf-semibold text-sm ${
                    service.selected ? `text-${service.color}-800` : 'text-gray-700'
                  }`}>
                    {service.name}
                  </span>
                  {service.selected && (
                    <CheckCircle size={16} className={`text-${service.color}-600 ml-auto`} />
                  )}
                </div>
                <p className={`text-xs leading-relaxed ${
                  service.selected ? `text-${service.color}-600` : 'text-gray-500'
                }`}>
                  {service.description}
                </p>
              </button>
            ))}
          </div>

          {/* Flight Search Component */}
          {services.find(s => s.id === 'flights')?.selected && (
            <div className="mt-6">
              <FlightSearch
                tripStartDate={startDate}
                tripEndDate={endDate}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-sf-semibold transition-all duration-200 text-sm border border-gray-300 hover:border-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-sf-semibold transition-all duration-200 text-sm shadow-lg hover:shadow-xl ring-2 ring-green-400 ring-opacity-50 shadow-green-400/30 hover:ring-green-500 hover:ring-opacity-70 hover:shadow-green-500/40"
          >
            Create Trip
          </button>
        </div>
      </form>

      {/* Modals */}
      {showFlightModal && (
        <FlightSearchModal
          isOpen={showFlightModal}
          onClose={() => setShowFlightModal(false)}
          onFlightSelect={(flight, direction) => {
            console.log('Selected flight:', flight, direction);
          }}
          searchData={{
            from: fromLocation,
            to: toLocation,
            departureDate: startDate,
            returnDate: endDate,
            tripType: 'round-trip',
            passengers: { adults: 1, children: 0, infants: 0 },
            travelClass: 'economy'
          }}
        />
      )}

      {showHotelModal && (
        <HotelSearchModal
          isOpen={showHotelModal}
          onClose={() => setShowHotelModal(false)}
          onHotelSelect={(hotel) => {
            console.log('Selected hotel:', hotel);
            setShowHotelModal(false);
          }}
          searchData={{
            destination: toLocation,
            checkIn: startDate,
            checkOut: endDate,
            rooms: 1,
            guests: { adults: 1, children: 0 }
          }}
        />
      )}

      {showConflictModal && (
        <TripConflictModal
          isOpen={showConflictModal}
          onClose={() => setShowConflictModal(false)}
          onProceed={() => {
            console.log('Proceeding with conflicting trip');
            alert('Trip created successfully despite conflicts!');
          }}
          travelerName={`${primaryTravelerData.firstName} ${primaryTravelerData.lastName}`}
          conflictingTripIds={conflictingTripIds}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
};

export default CreateTripForm;
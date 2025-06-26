import React, { useState, useEffect, useRef } from 'react';
import { Plus, ArrowLeft, Plane, Building, Car, FileText, Shield, DollarSign } from 'lucide-react';
import TravelerDetails from './TravelerDetails';
import GuestTravelerManager from './GuestTravelerManager';
import FormField from './FormField';
import DatePicker from './DatePicker';
import SearchableDropdown, { SearchableDropdownRef } from './SearchableDropdown';
import TripConflictModal from './TripConflictModal';
import FlightSearchModal from './FlightSearchModal';
import HotelSearchModal from './HotelSearchModal';
import { getAirportsByTravelMode, formatAirportOption, type Airport } from '@shared/airports';

interface CreateTripFormProps {
  onClose: () => void;
}

interface TripFormData {
  tripName: string;
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  travelMode: 'domestic' | 'international';
  startDate: string;
  endDate: string;
  bookingType: 'business' | 'guest' | 'personal';
  legalEntity: string;
  billingEntity: string;
  costCenter: string;
  department: string;
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

// Service types
type ServiceType = 'flight' | 'hotel' | 'cab' | 'visa' | 'insurance' | 'forex';

interface ServiceOption {
  id: ServiceType;
  name: string;
  icon: React.ReactNode;
  description: string;
  availableFor: ('domestic' | 'international')[];
}

// Mock existing trips data - in real app, this would come from API
const mockExistingTrips = [
  {
    tripId: '1850531',
    travelerName: 'Rajesh Kumar',
    startDate: '2024-02-15',
    endDate: '2024-02-20'
  },
  {
    tripId: '1850762',
    travelerName: 'Rajesh Kumar',
    startDate: '2024-03-10',
    endDate: '2024-03-15'
  },
  {
    tripId: '1851235',
    travelerName: 'Rajesh Kumar',
    startDate: '2024-04-05',
    endDate: '2024-04-10'
  },
  {
    tripId: '1851801',
    travelerName: 'Rajesh Kumar',
    startDate: '2024-05-20',
    endDate: '2024-05-25'
  }
];

// Mock employee data - in real app, this would come from authentication/API
const employeeData = {
  legalEntity: 'TechCorp Solutions Inc.',
  billingEntity: 'TechCorp Billing Division',
  costCenter: 'Engineering Cost Center',
  department: 'Software Development',
  // Employee profile data for traveler details
  profile: {
    title: 'Mr.',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    mobileNumber: '+91-9876543210', // Pre-populated from employee profile
    emailId: 'rajesh.kumar@techcorp.com', // Pre-populated from employee profile
    dateOfBirth: '' // Will be filled only for international travel
  }
};

// Service options configuration
const serviceOptions: ServiceOption[] = [
  {
    id: 'flight',
    name: 'Flight',
    icon: <Plane size={20} className="text-blue-600" />,
    description: 'Book domestic and international flights',
    availableFor: ['domestic', 'international']
  },
  {
    id: 'hotel',
    name: 'Hotel',
    icon: <Building size={20} className="text-emerald-600" />,
    description: 'Reserve accommodations',
    availableFor: ['domestic', 'international']
  },
  {
    id: 'cab',
    name: 'Cab',
    icon: <Car size={20} className="text-purple-600" />,
    description: 'Ground transportation services',
    availableFor: ['domestic', 'international']
  },
  {
    id: 'visa',
    name: 'Visa',
    icon: <FileText size={20} className="text-red-600" />,
    description: 'Visa processing assistance',
    availableFor: ['international']
  },
  {
    id: 'insurance',
    name: 'Insurance',
    icon: <Shield size={20} className="text-amber-600" />,
    description: 'Travel insurance coverage',
    availableFor: ['domestic', 'international']
  },
  {
    id: 'forex',
    name: 'Forex',
    icon: <DollarSign size={20} className="text-green-600" />,
    description: 'Foreign exchange services',
    availableFor: ['international']
  }
];

// Mock cities data
const domesticCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
  'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
  'Varanasi', 'Srinagar', 'Dhanbad', 'Jodhpur', 'Amritsar', 'Raipur', 'Allahabad',
  'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Madurai', 'Guwahati', 'Chandigarh',
  'Hubli-Dharwad', 'Amroha', 'Moradabad', 'Gurgaon', 'Aligarh', 'Solapur', 'Ranchi'
];

const internationalCities = [
  'New York', 'London', 'Paris', 'Tokyo', 'Dubai', 'Singapore', 'Hong Kong', 'Sydney',
  'Toronto', 'Los Angeles', 'Frankfurt', 'Amsterdam', 'Bangkok', 'Kuala Lumpur',
  'Seoul', 'Beijing', 'Shanghai', 'Rome', 'Barcelona', 'Berlin', 'Vienna', 'Zurich',
  'Stockholm', 'Copenhagen', 'Oslo', 'Helsinki', 'Brussels', 'Prague', 'Budapest',
  'Warsaw', 'Istanbul', 'Cairo', 'Johannesburg', 'Cape Town', 'São Paulo', 'Rio de Janeiro',
  'Buenos Aires', 'Mexico City', 'Vancouver', 'Montreal', 'Melbourne', 'Perth', 'Auckland',
  'Wellington', 'Manila', 'Jakarta', 'Ho Chi Minh City', 'Hanoi', 'Colombo', 'Dhaka'
];

// Mock dropdown options - in real app, these would come from API
const dropdownOptions = {
  legalEntities: [
    'TechCorp Solutions Inc.',
    'TechCorp International Ltd.',
    'TechCorp Services LLC',
    'TechCorp Consulting Group',
    'TechCorp Innovation Labs',
    'TechCorp Digital Solutions',
    'TechCorp Global Services',
    'TechCorp Enterprise Systems',
    'TechCorp Cloud Technologies',
    'TechCorp Data Analytics',
    'TechCorp Security Solutions',
    'TechCorp Mobile Development',
    'TechCorp AI Research',
    'TechCorp Blockchain Division',
    'TechCorp IoT Solutions',
    'TechCorp Cybersecurity',
    'TechCorp Machine Learning',
    'TechCorp Quantum Computing',
    'TechCorp Robotics Division',
    'TechCorp Virtual Reality'
  ],
  billingEntities: [
    'TechCorp Billing Division',
    'TechCorp Finance Center',
    'TechCorp Accounting Services',
    'TechCorp Revenue Management',
    'TechCorp Cost Control Unit',
    'TechCorp Financial Operations',
    'TechCorp Budget Management',
    'TechCorp Expense Control',
    'TechCorp Payment Processing',
    'TechCorp Invoice Management',
    'TechCorp Tax Services',
    'TechCorp Audit Division',
    'TechCorp Treasury Services',
    'TechCorp Risk Management',
    'TechCorp Compliance Unit',
    'TechCorp Financial Planning',
    'TechCorp Investment Management',
    'TechCorp Credit Control',
    'TechCorp Collections Department',
    'TechCorp Financial Reporting'
  ],
  costCenters: [
    'Engineering Cost Center',
    'Marketing Cost Center',
    'Sales Cost Center',
    'Operations Cost Center',
    'HR Cost Center',
    'Finance Cost Center',
    'Research & Development',
    'Customer Support',
    'Business Development',
    'Product Management',
    'Quality Assurance',
    'Information Technology',
    'Legal & Compliance',
    'Facilities Management',
    'Training & Development',
    'Strategic Planning',
    'Corporate Communications',
    'Supply Chain Management',
    'Procurement Services',
    'Risk Management',
    'Internal Audit',
    'Business Intelligence',
    'Digital Transformation',
    'Innovation Lab',
    'Cybersecurity Operations'
  ],
  departments: [
    'Software Development',
    'Quality Assurance',
    'DevOps Engineering',
    'Product Management',
    'UI/UX Design',
    'Data Analytics',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance & Accounting',
    'Customer Success',
    'Business Development',
    'Operations Management',
    'Information Technology',
    'Legal & Compliance',
    'Research & Development',
    'Corporate Strategy',
    'Digital Marketing',
    'Content Creation',
    'Social Media Management',
    'Public Relations',
    'Brand Management',
    'Market Research',
    'Business Intelligence',
    'Data Science',
    'Machine Learning',
    'Artificial Intelligence',
    'Cloud Architecture',
    'Mobile Development',
    'Web Development',
    'Database Administration',
    'Network Security',
    'System Administration',
    'Technical Writing',
    'Project Management'
  ]
};

const CreateTripForm: React.FC<CreateTripFormProps> = ({ onClose }) => {
  // Generate default trip name
  const generateDefaultTripName = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = today.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = today.getFullYear();
    const sequence = 'A1001'; // Starting sequence
    return `TR - ${day}${month}${year} - ${sequence}`;
  };

  const [formData, setFormData] = useState<TripFormData>({
    tripName: generateDefaultTripName(),
    tripType: 'round-trip',
    travelMode: 'domestic',
    startDate: '',
    endDate: '',
    bookingType: 'business',
    legalEntity: employeeData.legalEntity,
    billingEntity: employeeData.billingEntity,
    costCenter: employeeData.costCenter,
    department: employeeData.department,
  });

  // Initialize traveler data with employee profile information
  const [travelerData, setTravelerData] = useState<TravelerData>({
    title: employeeData.profile.title,
    firstName: employeeData.profile.firstName,
    lastName: employeeData.profile.lastName,
    dateOfBirth: employeeData.profile.dateOfBirth,
    mobileNumber: employeeData.profile.mobileNumber, // Pre-populated from employee profile
    emailId: employeeData.profile.emailId, // Pre-populated from employee profile
  });

  const [guestTravelers, setGuestTravelers] = useState<GuestTraveler[]>([]);
  const [showVisaModal, setShowVisaModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictingTripIds, setConflictingTripIds] = useState<string[]>([]);
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<any>(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<any>(null);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  // Removed showFareDropdown as fare types are now per-flight

  // Service selection state
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);

  // Flight search state - gets tripType from formData
  const [flightSearch, setFlightSearch] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    travelClass: 'economy' as 'economy' | 'premium' | 'business' | 'first',
    segments: [
      { id: '1', from: '', to: '', departureDate: '' }
    ] as Array<{ id: string; from: string; to: string; departureDate: string }>,
  });

  // Hotel search state
  const [hotelSearch, setHotelSearch] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    rooms: 1,
    guests: {
      adults: 1,
      children: 0
    }
  });

  // Refs for field progression
  const tripNameRef = useRef<HTMLInputElement>(null);
  const travelModeRef = useRef<HTMLSelectElement>(null);
  const bookingTypeRef = useRef<HTMLSelectElement>(null);
  const startDateRef = useRef<any>(null);
  const endDateRef = useRef<any>(null);
  const legalEntityRef = useRef<any>(null);
  const billingEntityRef = useRef<any>(null);
  const costCenterRef = useRef<any>(null);
  const departmentRef = useRef<any>(null);

  // Refs for flight search date pickers and dropdowns
  const fromDropdownRef = useRef<SearchableDropdownRef>(null);
  const toDropdownRef = useRef<SearchableDropdownRef>(null);
  const departureDateRef = useRef<any>(null);
  const returnDateRef = useRef<any>(null);

  // Handle Escape key press to close visa modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showVisaModal) {
        setShowVisaModal(false);
      }
    };

    // Add event listener when modal is open
    if (showVisaModal) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showVisaModal]);

  // Function to check for trip conflicts
  const checkTripConflicts = (startDate: string, endDate: string, travelerName: string): string[] => {
    if (!startDate || !endDate || !travelerName) return [];

    const tripStart = new Date(startDate);
    const tripEnd = new Date(endDate);
    
    const conflictingTrips = mockExistingTrips.filter(existingTrip => {
      if (existingTrip.travelerName !== travelerName) return false;
      
      const existingStart = new Date(existingTrip.startDate);
      const existingEnd = new Date(existingTrip.endDate);
      
      // Check for date overlap
      return (tripStart <= existingEnd && tripEnd >= existingStart);
    });

    return conflictingTrips.map(trip => trip.tripId);
  };

  // Get traveler name based on booking type
  const getTravelerName = (): string => {
    if (formData.bookingType === 'business') {
      return `${travelerData.firstName} ${travelerData.lastName}`.trim();
    } else if (formData.bookingType === 'guest' && guestTravelers.length > 0) {
      // For guest bookings, use the first adult traveler's name
      const firstAdult = guestTravelers.find(t => t.type === 'adult');
      if (firstAdult) {
        return `${firstAdult.firstName} ${firstAdult.lastName}`.trim();
      }
    }
    return '';
  };

  // Auto-progression logic
  const moveToNextField = (currentField: string) => {
    setTimeout(() => {
      switch (currentField) {
        case 'tripName':
          if (travelModeRef.current) {
            travelModeRef.current.focus();
          }
          break;
        case 'travelMode':
          // Focus on trip type dropdown next
          setTimeout(() => {
            const tripTypeSelect = document.querySelector('select[tabindex="3"]') as HTMLSelectElement;
            if (tripTypeSelect) {
              tripTypeSelect.focus();
            }
          }, 100);
          break;
        case 'tripType':
          if (bookingTypeRef.current) {
            bookingTypeRef.current.focus();
          }
          break;
        case 'bookingType':
          if (formData.bookingType !== 'personal' && startDateRef.current) {
            startDateRef.current.openCalendar();
          }
          break;
        case 'startDate':
          if (endDateRef.current) {
            endDateRef.current.openCalendar();
          }
          break;
        case 'endDate':
          // FIXED: Focus on Services section instead of Entity Information
          const firstServiceButton = document.querySelector('[data-service-button]') as HTMLElement;
          if (firstServiceButton && isTripInfoComplete()) {
            firstServiceButton.focus();
          }
          break;
        case 'legalEntity':
          if (billingEntityRef.current) {
            billingEntityRef.current.openDropdown();
          }
          break;
        case 'billingEntity':
          if (costCenterRef.current) {
            costCenterRef.current.openDropdown();
          }
          break;
        case 'costCenter':
          if (departmentRef.current) {
            departmentRef.current.openDropdown();
          }
          break;
      }
    }, 150); // Small delay for smooth transition
  };

  // Auto-progression logic for flight search (removed auto-opening passengers dropdown)
  const moveToNextFlightField = (currentField: string) => {
    setTimeout(() => {
      switch (currentField) {
        case 'departureDate':
          if (formData.tripType === 'round-trip' && returnDateRef.current) {
            returnDateRef.current.openCalendar();
          }
          // Note: Passengers dropdown does not auto-open per user request
          break;
      }
    }, 150);
  };

  // Format date for display (DD MMM, YYYY)
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const handleInputChange = (field: keyof TripFormData, value: string) => {
    // Show visa modal when switching to international travel
    if (field === 'travelMode' && value === 'international' && formData.travelMode === 'domestic') {
      setShowVisaModal(true);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-progress to next field
    moveToNextField(field);
  };

  const handleTravelerChange = (data: TravelerData) => {
    setTravelerData(data);
  };

  const handleGuestTravelersChange = (travelers: GuestTraveler[]) => {
    setGuestTravelers(travelers);
  };

  // Trip Name Generation with format TR - 22JUN2025 - A1001
  const generateTripName = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();
    
    // Generate incremental sequence (A1001, A1002, etc.)
    // In a real app, this would come from the backend/database
    const sequence = 'A' + (1001 + Math.floor(Math.random() * 999)).toString();
    
    // Generate random trip ID (A + 4 digits)
    const tripId = 'A' + Math.floor(1000 + Math.random() * 9000);
    
    // Format: TR - 22JUN2025 - A1001
    const newTripName = `TR - ${day}${month}${year} - ${tripId}`;
    setFormData(prev => ({ ...prev, tripName: newTripName }));
    
    // Auto-progress after generating trip name
    moveToNextField('tripName');
  };

  // Service selection handlers
  const handleServiceToggle = (serviceId: ServiceType) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    const availableServices = serviceOptions
      .filter(service => service.availableFor.includes(formData.travelMode))
      .map(service => service.id);
    setSelectedServices(availableServices);
  };

  const handleClearAll = () => {
    setSelectedServices([]);
  };

  // FIXED: Flight search handlers with proper auto-progression and date validation
  const handleFlightSearchChange = (field: keyof typeof flightSearch, value: string) => {
    console.log(`🔧 Flight Search Change: ${field} = ${value}`); // Debug log
    
    // Special handling for trip type changes
    if (field === 'tripType') {
      if (value === 'one-way') {
        // Clear return date when switching to one-way
        setFlightSearch(prev => ({ ...prev, [field]: value, returnDate: '' }));
        console.log('🔄 Switched to one-way, cleared return date');
        return;
      } else if (value === 'round-trip') {
        // Keep existing return date or set empty for user to fill
        setFlightSearch(prev => ({ ...prev, [field]: value }));
        console.log('🔄 Switched to round-trip, keeping return date:', flightSearch.returnDate);
        return;
      }
    }
    
    // Validate flight dates against trip dates
    if (field === 'departureDate' || field === 'returnDate') {
      const isValidDate = validateFlightDate(value, field);
      if (!isValidDate) {
        // Show validation error but still allow the change for user feedback
        console.warn(`⚠️ Flight ${field} is outside trip date range`);
      }
    }
    
    setFlightSearch(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-progression logic
      if (field === 'from' && value) {
        console.log('🚀 Auto-progressing from From to To');
        setTimeout(() => {
          if (toDropdownRef.current) {
            toDropdownRef.current.openDropdown();
          }
        }, 300);
      } else if (field === 'to' && value && updated.from) {
        console.log('🚀 Auto-progressing from To to Departure Date');
        setTimeout(() => {
          if (departureDateRef.current) {
            departureDateRef.current.openCalendar();
          }
        }, 300);
      } else if (field === 'departureDate' && value && updated.tripType === 'round-trip' && !updated.returnDate) {
        console.log('🚀 Auto-progressing from departure date to return date');
        setTimeout(() => {
          if (returnDateRef.current) {
            returnDateRef.current.openCalendar();
          }
        }, 300);
      } else if (field === 'returnDate' && value && updated.tripType === 'round-trip') {
        console.log('🚀 Auto-progressing to passengers dropdown');
        setTimeout(() => {
          const passengersButton = document.querySelector('[data-passengers-dropdown]') as HTMLElement;
          if (passengersButton) {
            passengersButton.focus();
          }
        }, 300);
      } else if (field === 'departureDate' && value && updated.tripType === 'one-way') {
        console.log('🚀 Auto-progressing to passengers dropdown (one-way)');
        setTimeout(() => {
          const passengersButton = document.querySelector('[data-passengers-dropdown]') as HTMLElement;
          if (passengersButton) {
            passengersButton.focus();
          }
        }, 300);
      }
      
      return updated;
    });
  };

  // Create date from string without timezone conversion issues
  const createDateFromString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // NEW: Validate flight dates against trip dates (inclusive)
  const validateFlightDate = (date: string, type: 'departureDate' | 'returnDate'): boolean => {
    if (!date) return true; // Allow empty dates
    if (!formData.startDate || !formData.endDate) return false; // Require trip dates first
    
    const flightDate = createDateFromString(date);
    const tripStart = createDateFromString(formData.startDate);
    const tripEnd = createDateFromString(formData.endDate);
    
    // Flight dates must be within trip date range (inclusive of both start and end dates)
    return flightDate >= tripStart && flightDate <= tripEnd;
  };

  // NEW: Get flight date constraints
  const getFlightDateConstraints = () => {
    return {
      minDate: formData.startDate || undefined,
      maxDate: formData.endDate || undefined,
      departureDateValid: validateFlightDate(flightSearch.departureDate, 'departureDate'),
      returnDateValid: validateFlightDate(flightSearch.returnDate, 'returnDate')
    };
  };

  const handleFlightSearch = () => {
    // Debug logs for flight search
    console.log('🔍 Pre-search validation:');
    console.log('  - Trip Type:', flightSearch.tripType);
    console.log('  - Departure Date:', flightSearch.departureDate);
    console.log('  - Return Date:', flightSearch.returnDate);
    console.log('  - Return Date Length:', flightSearch.returnDate?.length);
    
    // Validate flight dates before search
    const constraints = getFlightDateConstraints();
    
    if (!constraints.departureDateValid) {
      alert(`Departure date must be between ${formData.startDate} and ${formData.endDate} (inclusive)`);
      return;
    }
    
    if (formData.tripType === 'round-trip' && (!flightSearch.returnDate || flightSearch.returnDate.trim() === '')) {
      alert('Return date is required for round-trip flights');
      return;
    }
    
    if (formData.tripType === 'round-trip' && !constraints.returnDateValid) {
      alert(`Return date must be between ${formData.startDate} and ${formData.endDate} (inclusive)`);
      return;
    }
    
    console.log('✅ Validation passed, opening flight search modal');
    // Open flight search modal
    setShowFlightModal(true);
  };

  const handleFlightSelect = (flight: any, direction: 'outbound' | 'return') => {
    console.log('Flight selected:', flight, direction);
    if (direction === 'outbound') {
      setSelectedOutboundFlight(flight);
    } else {
      setSelectedReturnFlight(flight);
    }
  };

  const handleHotelSelect = (hotel: any) => {
    console.log('Hotel selected:', hotel);
    // Handle hotel selection logic here
  };

  const handleHotelSearchChange = (field: keyof typeof hotelSearch, value: any) => {
    setHotelSearch(prev => ({ ...prev, [field]: value }));
  };

  const handleHotelSearch = () => {
    // Validate hotel search data
    if (!hotelSearch.destination || !hotelSearch.checkIn || !hotelSearch.checkOut) {
      alert('Please fill in all required hotel search fields');
      return;
    }
    
    // Check dates are valid
    const checkIn = new Date(hotelSearch.checkIn);
    const checkOut = new Date(hotelSearch.checkOut);
    if (checkOut <= checkIn) {
      alert('Check-out date must be after check-in date');
      return;
    }
    
    setShowHotelModal(true);
  };

  // Validate flight search based on trip type
  const isFlightSearchValid = () => {
    if (flightSearch.tripType === 'multi-city') {
      // For multi-city, check all segments
      const allSegmentsValid = flightSearch.segments.every(segment => 
        segment.from && segment.to && segment.departureDate
      );
      return allSegmentsValid && flightSearch.segments.length >= 2;
    } else {
      // For round-trip and one-way
      const basicValid = flightSearch.from && flightSearch.to && flightSearch.departureDate && 
                        flightDateConstraints.departureDateValid;
      
      if (flightSearch.tripType === 'round-trip') {
        return basicValid && flightSearch.returnDate && flightDateConstraints.returnDateValid;
      }
      
      return basicValid;
    }
  };

  // Get available airports based on travel mode
  const getAvailableAirports = () => {
    return getAirportsByTravelMode(formData.travelMode);
  };

  // Get airport options for dropdown
  const getAirportOptions = () => {
    return getAvailableAirports().map(airport => formatAirportOption(airport));
  };

  // Get airport display options (just the display strings)
  const getAirportDisplayOptions = () => {
    return getAirportOptions().map(airport => airport.display);
  };

  // Check if all mandatory fields are filled
  const isFormValid = () => {
    // Basic mandatory fields for all booking types
    const basicRequiredFields = [
      formData.tripName.trim(),
      formData.travelMode,
      formData.bookingType,
    ];

    // For personal bookings, only basic fields are required
    if (formData.bookingType === 'personal') {
      return basicRequiredFields.every(field => field !== '');
    }

    // For business and guest bookings, include dates and other fields
    const dateRequiredFields = [
      formData.startDate,
      formData.endDate,
    ];

    // Entity fields are required for business and guest bookings
    const entityRequiredFields = [
      formData.legalEntity,
      formData.billingEntity,
    ];

    const allBasicFieldsFilled = basicRequiredFields.every(field => field !== '');
    const allDateFieldsFilled = dateRequiredFields.every(field => field.trim() !== '');
    const allEntityFieldsFilled = entityRequiredFields.every(field => field.trim() !== '');

    // For business bookings, check employee traveler details
    if (formData.bookingType === 'business') {
      const requiredTravelerFields = [
        travelerData.firstName.trim(),
        travelerData.lastName.trim(),
        travelerData.mobileNumber.trim(),
        travelerData.emailId.trim(),
      ];

      // For international travel, date of birth is also required
      if (formData.travelMode === 'international') {
        requiredTravelerFields.push(travelerData.dateOfBirth.trim());
      }

      const allTravelerFieldsFilled = requiredTravelerFields.every(field => field !== '');
      return allBasicFieldsFilled && allDateFieldsFilled && allEntityFieldsFilled && allTravelerFieldsFilled;
    }

    // For guest bookings, check guest travelers
    if (formData.bookingType === 'guest') {
      if (guestTravelers.length === 0) return false;

      const allGuestTravelersValid = guestTravelers.every(traveler => {
        // Basic fields required for all travelers
        const basicFields = [
          traveler.firstName.trim(),
          traveler.lastName.trim(),
        ];

        // Date of birth required for international travel or children/infants
        if (formData.travelMode === 'international' || traveler.type === 'child' || traveler.type === 'infant') {
          basicFields.push(traveler.dateOfBirth.trim());
        }

        // Contact details required only for adults
        if (traveler.type === 'adult') {
          basicFields.push(traveler.mobileOnly.trim());
          basicFields.push(traveler.emailId.trim());
          // Ensure mobile number is exactly 10 digits
          if (traveler.mobileOnly.length !== 10) return false;
        }

        return basicFields.every(field => field !== '');
      });

      return allBasicFieldsFilled && allDateFieldsFilled && allEntityFieldsFilled && allGuestTravelersValid;
    }

    return allBasicFieldsFilled && allDateFieldsFilled && allEntityFieldsFilled;
  };

  // Check if Trip Information section is complete (for enabling Services)
  const isTripInfoComplete = () => {
    const basicFields = [
      formData.tripName.trim(),
      formData.tripType.trim(),
      formData.travelMode,
      formData.bookingType
    ];

    if (formData.bookingType === 'personal') {
      return basicFields.every(field => field !== '');
    }

    const businessFields = [
      formData.startDate,
      formData.endDate,
      formData.legalEntity.trim(),
      formData.billingEntity.trim(),
      formData.costCenter.trim(),
      formData.department.trim()
    ];

    return basicFields.every(field => field !== '') && 
           businessFields.every(field => field !== '');
  };

  // Field validation helpers for styling
  const isFieldIncomplete = (fieldValue: string | undefined, isRequired: boolean = true) => {
    if (!isRequired) return false;
    return !fieldValue || fieldValue.trim() === '';
  };

  const getFieldClassName = (fieldValue: string | undefined, isRequired: boolean = true, baseClasses: string = '') => {
    const incomplete = isFieldIncomplete(fieldValue, isRequired);
    const baseClass = baseClasses || "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-sf-medium bg-white transition-all duration-200";
    
    if (incomplete && isRequired) {
      return `${baseClass} border-red-200 bg-red-50 focus:border-red-400 placeholder-red-300`;
    }
    return `${baseClass} border-gray-300 hover:border-gray-400 focus:border-blue-500`;
  };

  const getLabelClassName = (fieldValue: string | undefined, isRequired: boolean = true) => {
    const incomplete = isFieldIncomplete(fieldValue, isRequired);
    const baseClass = "block text-sm font-sf-semibold mb-2";
    
    if (incomplete && isRequired) {
      return `${baseClass} text-red-600`;
    }
    return `${baseClass} text-gray-800`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) return;

    // For personal bookings, proceed directly without conflict check
    if (formData.bookingType === 'personal') {
      proceedWithBooking();
      return;
    }

    // Check for trip conflicts only for business and guest bookings
    const travelerName = getTravelerName();
    if (travelerName && formData.startDate && formData.endDate) {
      const conflicts = checkTripConflicts(formData.startDate, formData.endDate, travelerName);
      
      if (conflicts.length > 0) {
        setConflictingTripIds(conflicts);
        setShowConflictModal(true);
        return;
      }
    }

    // No conflicts found, proceed directly
    proceedWithBooking();
  };

  const proceedWithBooking = () => {
    // Handle form submission logic here
    console.log('Trip data:', formData);
    if (formData.bookingType === 'business') {
      console.log('Traveler data:', travelerData);
    } else if (formData.bookingType === 'guest') {
      console.log('Guest travelers:', guestTravelers);
    }
    
    // In a real app, this would navigate to the next step or show success message
    alert('Trip created successfully! Proceeding to add services...');
  };

  const closeVisaModal = () => {
    setShowVisaModal(false);
  };

  const closeConflictModal = () => {
    setShowConflictModal(false);
    setConflictingTripIds([]);
  };

  // Get available services based on travel mode
  const getAvailableServices = () => {
    return serviceOptions.filter(service => 
      service.availableFor.includes(formData.travelMode)
    );
  };

  // Get flight date constraints for display
  const flightDateConstraints = getFlightDateConstraints();

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg w-full border border-gray-200">
        {/* Compact Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
          <h1 className="text-xl font-sf-bold leading-tight tracking-sf-tight">Create New Trip</h1>
          <p className="text-blue-100 mt-1 text-sm font-sf-medium">
            Fill in the details below to create your {formData.bookingType} trip
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trip Basic Information */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="text-blue-600" size={16} />
              </div>
              <h2 className="text-base font-sf-semibold text-gray-900">Trip Information</h2>
            </div>
            
            {/* Row 1: Trip Name, Travel Mode, Trip Type */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                <div>
                  <label className={getLabelClassName(formData.tripName, true)}>
                    Trip Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={tripNameRef}
                      type="text"
                      value={formData.tripName}
                      onChange={(e) => handleInputChange('tripName', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          moveToNextField('tripName');
                        }
                      }}
                      placeholder="Enter trip name"
                      className={getFieldClassName(formData.tripName, true, "w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 text-sm font-sf-medium bg-white transition-all duration-200 min-h-[48px]")}
                      required
                      tabIndex={1}
                    />
                    <button
                      type="button"
                      onClick={generateTripName}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-orange-600 hover:text-orange-700 transition-colors rounded-lg bg-orange-100 hover:bg-orange-200"
                      title="Auto-generate trip name"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className={getLabelClassName(formData.travelMode, true)}>
                    Travel Mode
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      ref={travelModeRef}
                      value={formData.travelMode}
                      onChange={(e) => handleInputChange('travelMode', e.target.value as 'domestic' | 'international')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          moveToNextField('travelMode');
                        }
                      }}
                      className={getFieldClassName(formData.travelMode, true, "w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 text-sm font-sf-medium bg-white transition-all duration-200 text-gray-900 appearance-none cursor-pointer min-h-[48px]")}
                      required
                      tabIndex={2}
                    >
                      <option value="domestic">Domestic Travel</option>
                      <option value="international">International Travel</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={getLabelClassName(formData.tripType, true)}>
                    Trip Type
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.tripType}
                      onChange={(e) => {
                        const newTripType = e.target.value as 'one-way' | 'round-trip' | 'multi-city';
                        handleInputChange('tripType', newTripType);
                        // Update flight search tripType to match
                        setFlightSearch(prev => ({
                          ...prev,
                          tripType: newTripType,
                          returnDate: newTripType === 'one-way' ? '' : prev.returnDate,
                          segments: newTripType === 'multi-city' 
                            ? (prev.segments.length === 1 ? [
                                { id: '1', from: prev.from, to: prev.to, departureDate: prev.departureDate },
                                { id: '2', from: '', to: '', departureDate: '' }
                              ] : prev.segments)
                            : [{ id: '1', from: prev.from, to: prev.to, departureDate: prev.departureDate }]
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          moveToNextField('tripType');
                        }
                      }}
                      className={getFieldClassName(formData.tripType, true, "w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 text-sm font-sf-medium bg-white transition-all duration-200 text-gray-900 appearance-none cursor-pointer min-h-[48px]")}
                      required
                      tabIndex={3}
                    >
                      <option value="round-trip">Round Trip</option>
                      <option value="one-way">One Way</option>
                      <option value="multi-city">Multi-City</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
            </div>

            {/* Row 2: Booking Type, Start Date, End Date */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div>
                <label className={getLabelClassName(formData.bookingType, true)}>
                  Booking Type
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    ref={bookingTypeRef}
                    value={formData.bookingType}
                    onChange={(e) => handleInputChange('bookingType', e.target.value as 'business' | 'guest' | 'personal')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        moveToNextField('bookingType');
                      }
                    }}
                    className={getFieldClassName(formData.bookingType, true, "w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 text-sm font-sf-medium bg-white transition-all duration-200 text-gray-900 appearance-none cursor-pointer min-h-[48px]")}
                    required
                    tabIndex={4}
                  >
                    <option value="business">Business Booking</option>
                    <option value="guest">Guest Booking</option>
                    <option value="personal">Personal Booking</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Start Date - Only show for business and guest bookings */}
              {formData.bookingType !== 'personal' ? (
                <div>
                  <DatePicker
                    ref={startDateRef}
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(value) => handleInputChange('startDate', value)}
                    required={formData.bookingType !== 'personal'}
                    placeholder="Select start date"
                    tabIndex={5}
                    isIncomplete={formData.bookingType !== 'personal' && isFieldIncomplete(formData.startDate)}
                  />
                </div>
              ) : (
                <div></div>
              )}

              {/* End Date - Only show for business and guest bookings */}
              {formData.bookingType !== 'personal' ? (
                <div>
                  <DatePicker
                    ref={endDateRef}
                    label="End Date"
                    value={formData.endDate}
                    onChange={(value) => handleInputChange('endDate', value)}
                    required={formData.bookingType !== 'personal'}
                    placeholder="Select end date"
                    minDate={formData.startDate}
                    tabIndex={6}
                    isIncomplete={formData.bookingType !== 'personal' && isFieldIncomplete(formData.endDate)}
                  />
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </div>

          {/* Travel Services Section */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Plus className="text-purple-600" size={16} />
                </div>
                <h2 className={`text-base font-sf-semibold ${!isTripInfoComplete() ? 'text-gray-400' : 'text-gray-900'}`}>
                  Travel Services
                </h2>
              </div>
              
              {!isTripInfoComplete() && (
                <span className="text-sm text-gray-500 font-sf-medium bg-gray-100 px-3 py-1 rounded-full">
                  Complete Trip Information first
                </span>
              )}
              
              {/* Select All / Clear All Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={isTripInfoComplete() ? handleSelectAll : undefined}
                  disabled={!isTripInfoComplete()}
                  className={`px-3 py-1.5 text-xs font-sf-semibold rounded-lg transition-all duration-200 border ${
                    isTripInfoComplete()
                      ? 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] cursor-pointer'
                      : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={isTripInfoComplete() ? handleClearAll : undefined}
                  disabled={!isTripInfoComplete()}
                  className={`px-3 py-1.5 text-xs font-sf-semibold rounded-lg transition-colors duration-200 border ${
                    isTripInfoComplete()
                      ? 'text-gray-600 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer'
                      : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Service Selection Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
              {getAvailableServices().map((service) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    data-service-button
                    tabIndex={isTripInfoComplete() ? 6 + (service.id === 'flight' ? 0 : service.id === 'hotel' ? 1 : service.id === 'cab' ? 2 : service.id === 'visa' ? 3 : service.id === 'insurance' ? 4 : 5) : -1}
                    onClick={() => isTripInfoComplete() && handleServiceToggle(service.id)}
                    onKeyDown={(e) => {
                      if (isTripInfoComplete() && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleServiceToggle(service.id);
                      }
                    }}
                    disabled={!isTripInfoComplete()}
                    aria-label={`Select ${service.name} service${isSelected ? ' (selected)' : ''}`}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      !isTripInfoComplete()
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                        : isSelected
                        ? 'border-orange-300 bg-gradient-to-br from-orange-25 to-amber-25 text-orange-600 shadow-md shadow-orange-100/25 ring-1 ring-orange-200/20 hover:scale-105'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700 hover:shadow-md hover:scale-105'
                    }`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-200 ${
                      !isTripInfoComplete()
                        ? 'bg-gray-100 opacity-50'
                        : isSelected 
                        ? 'bg-gradient-to-br from-orange-300 to-amber-400 text-white shadow-md' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                      {service.icon}
                    </div>
                    <div className={`text-sm font-sf-semibold ${!isTripInfoComplete() ? 'text-gray-400' : ''}`}>
                      {service.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Flight Search Card */}
            {selectedServices.includes('flight') && (
              <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plane className="text-blue-600" size={16} />
                  </div>
                  <h3 className="text-base font-sf-semibold text-gray-900">Flight Search</h3>
                </div>

                {/* Trip Date Constraint Notice */}
                {formData.startDate && formData.endDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-sf-semibold text-blue-800">Flight Date Constraints</span>
                    </div>
                    <p className="text-sm font-sf-medium text-blue-700 leading-relaxed">
                      Flight dates must be within your trip period: <strong>{formatDateDisplay(formData.startDate)}</strong> to <strong>{formatDateDisplay(formData.endDate)}</strong>
                    </p>
                  </div>
                )}

                <div className="space-y-4">

                  {/* Flight Search Fields */}
                  {formData.tripType === 'multi-city' ? (
                    <div className="space-y-4">
                      {flightSearch.segments.map((segment, index) => (
                        <div key={segment.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-sf-semibold text-gray-700">
                              Flight {index + 1}
                            </h4>
                            {flightSearch.segments.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFlightSearch(prev => ({
                                    ...prev,
                                    segments: prev.segments.filter(s => s.id !== segment.id)
                                  }));
                                }}
                                className="text-red-600 hover:text-red-700 text-sm font-sf-medium"
                              >
                                Remove Segment
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SearchableDropdown
                              label="From"
                              value={segment.from}
                              onChange={(value) => {
                                setFlightSearch(prev => ({
                                  ...prev,
                                  segments: prev.segments.map(s => 
                                    s.id === segment.id ? { ...s, from: value } : s
                                  )
                                }));
                              }}
                              options={getAirportDisplayOptions()}
                              placeholder="Select departure city"
                              searchPlaceholder="Search airports..."
                              required
                              isAirport={true}
                            />
                            <SearchableDropdown
                              label="To"
                              value={segment.to}
                              onChange={(value) => {
                                setFlightSearch(prev => ({
                                  ...prev,
                                  segments: prev.segments.map(s => 
                                    s.id === segment.id ? { ...s, to: value } : s
                                  )
                                }));
                              }}
                              options={getAirportDisplayOptions()}
                              placeholder="Select destination"
                              searchPlaceholder="Search airports..."
                              required
                              isAirport={true}
                            />
                            <DatePicker
                              label="Departure Date"
                              value={segment.departureDate}
                              onChange={(value) => {
                                setFlightSearch(prev => ({
                                  ...prev,
                                  segments: prev.segments.map(s => 
                                    s.id === segment.id ? { ...s, departureDate: value } : s
                                  )
                                }));
                              }}
                              required
                              placeholder="Select departure date"
                              minDate={formData.startDate}
                              maxDate={formData.endDate}
                              disabled={!formData.startDate || !formData.endDate}
                            />
                          </div>
                        </div>
                      ))}
                      
                      {/* Add Segment Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const newSegmentId = (flightSearch.segments.length + 1).toString();
                          setFlightSearch(prev => ({
                            ...prev,
                            segments: [...prev.segments, { id: newSegmentId, from: '', to: '', departureDate: '' }]
                          }));
                        }}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-800 hover:border-gray-400 font-sf-medium transition-colors"
                      >
                        + Add Segment
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Row 1: From, To, Departure, Return */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* From */}
                      <SearchableDropdown
                        ref={fromDropdownRef}
                        label="From"
                        value={flightSearch.from}
                        onChange={(value) => {
                          setFlightSearch(prev => ({ 
                            ...prev, 
                            from: value,
                            segments: [{ ...prev.segments[0], from: value }]
                          }));
                          // Auto-progress to "To" field
                          setTimeout(() => {
                            toDropdownRef.current?.openDropdown();
                          }, 100);
                        }}
                        options={getAirportDisplayOptions()}
                        placeholder="Select departure airport"
                        searchPlaceholder="Search airports..."
                        required
                        isAirport={true}
                        tabIndex={15}
                      />

                      {/* To */}
                      <SearchableDropdown
                        ref={toDropdownRef}
                        label="To"
                        value={flightSearch.to}
                        onChange={(value) => {
                          setFlightSearch(prev => ({ 
                            ...prev, 
                            to: value,
                            segments: [{ ...prev.segments[0], to: value }]
                          }));
                          // Auto-progress to departure date
                          setTimeout(() => {
                            departureDateRef.current?.openCalendar();
                          }, 100);
                        }}
                        options={getAirportDisplayOptions().filter(airport => airport !== flightSearch.from)}
                        placeholder="Select destination airport"
                        searchPlaceholder="Search airports..."
                        required
                        isAirport={true}
                        tabIndex={16}
                      />

                      {/* FIXED: Departure Date - Constrained by trip dates */}
                      <div>
                        <DatePicker
                          ref={departureDateRef}
                          label="Departure Date"
                          value={flightSearch.departureDate}
                          onChange={(value) => {
                            setFlightSearch(prev => ({ 
                              ...prev, 
                              departureDate: value,
                              segments: [{ ...prev.segments[0], departureDate: value }]
                            }));
                            // Auto-progress to return date if round-trip
                            if (formData.tripType === 'round-trip') {
                              setTimeout(() => {
                                returnDateRef.current?.openCalendar();
                              }, 100);
                            }
                            // Note: Passengers dropdown does not auto-open per user request
                          }}
                          required
                          placeholder="Select departure date"
                          minDate={formData.startDate}
                          maxDate={formData.endDate}
                          disabled={!formData.startDate || !formData.endDate}
                          tabIndex={17}
                          isIncomplete={!flightDateConstraints.departureDateValid && flightSearch.departureDate !== ''}
                        />
                        {/* Validation feedback */}
                        {flightSearch.departureDate && !flightDateConstraints.departureDateValid && (
                          <p className="text-xs text-red-500 mt-1 font-sf-medium">
                            Must be between {formatDateDisplay(formData.startDate)} and {formatDateDisplay(formData.endDate)} (inclusive)
                          </p>
                        )}
                      </div>

                      {/* Return Date - Constrained by trip dates - Only for round trip */}
                      {formData.tripType === 'round-trip' && (
                        <div>
                          <DatePicker
                            ref={returnDateRef}
                            label="Return Date"
                            value={flightSearch.returnDate}
                            onChange={(value) => {
                              setFlightSearch(prev => ({ ...prev, returnDate: value }));
                              // Note: Passengers dropdown does not auto-open per user request
                            }}
                            required
                            placeholder="Select return date"
                            minDate={flightSearch.departureDate || formData.startDate}
                            maxDate={formData.endDate}
                            disabled={!formData.startDate || !formData.endDate || !flightSearch.departureDate}
                            tabIndex={18}
                            isIncomplete={!flightDateConstraints.returnDateValid && flightSearch.returnDate !== ''}
                          />
                          {/* Validation feedback */}
                          {flightSearch.returnDate && !flightDateConstraints.returnDateValid && (
                            <p className="text-xs text-red-500 mt-1 font-sf-medium">
                              Must be between {formatDateDisplay(formData.startDate)} and {formatDateDisplay(formData.endDate)} (inclusive)
                            </p>
                          )}
                        </div>
                      )}
                      </div>

                      {/* Row 2: Passengers and Class */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Passengers Dropdown */}
                      <div className="relative">
                        <label className="block text-sm font-sf-semibold text-gray-700 mb-2">
                          Passengers
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <button
                          type="button"
                          data-passengers-dropdown
                          onClick={() => {
                            setShowPassengerDropdown(!showPassengerDropdown);
                            setShowClassDropdown(false);
                            setShowFareDropdown(false);
                          }}
                          tabIndex={19}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-sf-medium text-gray-800">
                              {flightSearch.passengers.adults + flightSearch.passengers.children + flightSearch.passengers.infants} Passenger{flightSearch.passengers.adults + flightSearch.passengers.children + flightSearch.passengers.infants > 1 ? 's' : ''}
                              {flightSearch.passengers.children > 0 || flightSearch.passengers.infants > 0 ? (
                                <span className="text-gray-600 ml-1">
                                  ({flightSearch.passengers.adults} Adult{flightSearch.passengers.adults > 1 ? 's' : ''}
                                  {flightSearch.passengers.children > 0 && `, ${flightSearch.passengers.children} Child${flightSearch.passengers.children > 1 ? 'ren' : ''}`}
                                  {flightSearch.passengers.infants > 0 && `, ${flightSearch.passengers.infants} Infant${flightSearch.passengers.infants > 1 ? 's' : ''}`})
                                </span>
                              ) : null}
                            </span>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showPassengerDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Passengers Dropdown Content */}
                        {showPassengerDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                            <div className="p-4 space-y-4">
                              {/* Adults */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-sf-semibold text-gray-800">ADULTS (12y +)</div>
                                  <div className="text-xs text-gray-500">on the day of travel</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newCount = Math.max(1, flightSearch.passengers.adults - 1);
                                      setFlightSearch(prev => ({
                                        ...prev,
                                        passengers: { ...prev.passengers, adults: newCount }
                                      }));
                                    }}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-sf-semibold text-gray-800">
                                    {flightSearch.passengers.adults}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newCount = Math.min(9, flightSearch.passengers.adults + 1);
                                      setFlightSearch(prev => ({
                                        ...prev,
                                        passengers: { ...prev.passengers, adults: newCount }
                                      }));
                                    }}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Children */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-sf-semibold text-gray-800">CHILDREN (2y - 12y)</div>
                                  <div className="text-xs text-gray-500">on the day of travel</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newCount = Math.max(0, flightSearch.passengers.children - 1);
                                      setFlightSearch(prev => ({
                                        ...prev,
                                        passengers: { ...prev.passengers, children: newCount }
                                      }));
                                    }}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-sf-semibold text-gray-800">
                                    {flightSearch.passengers.children}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newCount = Math.min(6, flightSearch.passengers.children + 1);
                                      setFlightSearch(prev => ({
                                        ...prev,
                                        passengers: { ...prev.passengers, children: newCount }
                                      }));
                                    }}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Infants */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-sf-semibold text-gray-800">INFANTS (below 2y)</div>
                                  <div className="text-xs text-gray-500">on the day of travel</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newCount = Math.max(0, flightSearch.passengers.infants - 1);
                                      setFlightSearch(prev => ({
                                        ...prev,
                                        passengers: { ...prev.passengers, infants: newCount }
                                      }));
                                    }}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-sf-semibold text-gray-800">
                                    {flightSearch.passengers.infants}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newCount = Math.min(6, flightSearch.passengers.infants + 1);
                                      setFlightSearch(prev => ({
                                        ...prev,
                                        passengers: { ...prev.passengers, infants: newCount }
                                      }));
                                    }}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="flex justify-end pt-2 border-t border-gray-200">
                                <button
                                  type="button"
                                  onClick={() => setShowPassengerDropdown(false)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-sf-semibold hover:bg-blue-700 transition-colors"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Travel Class Dropdown */}
                      <div className="relative">
                        <label className="block text-sm font-sf-semibold text-gray-700 mb-2">
                          Travel Class
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowClassDropdown(!showClassDropdown);
                            setShowPassengerDropdown(false);
                            setShowFareDropdown(false);
                          }}
                          tabIndex={20}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-sf-medium text-gray-800">
                              {flightSearch.travelClass.charAt(0).toUpperCase() + flightSearch.travelClass.slice(1)}
                              {flightSearch.travelClass === 'economy' && ' / Premium Economy'}
                            </span>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showClassDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Travel Class Dropdown Content */}
                        {showClassDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                            <div className="p-2">
                              {[
                                { value: 'economy', label: 'Economy/Premium Economy' },
                                { value: 'premium', label: 'Premium Economy', new: true },
                                { value: 'business', label: 'Business' },
                                { value: 'first', label: 'First Class' }
                              ].map((classOption) => (
                                <button
                                  key={classOption.value}
                                  type="button"
                                  onClick={() => {
                                    setFlightSearch(prev => ({
                                      ...prev,
                                      travelClass: classOption.value as any
                                    }));
                                    setShowClassDropdown(false);
                                  }}
                                  className={`w-full px-3 py-2 text-left rounded-lg transition-all duration-200 flex items-center justify-between ${
                                    flightSearch.travelClass === classOption.value
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <span className="text-sm font-sf-medium">{classOption.label}</span>
                                  <div className="flex items-center gap-2">
                                    {classOption.new && (
                                      <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                                        new
                                      </span>
                                    )}
                                    {flightSearch.travelClass === classOption.value && (
                                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                  )}

                  {/* Search Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleFlightSearch}
                      tabIndex={21}
                      disabled={!isFlightSearchValid()}
                      className={`px-6 py-3 rounded-xl font-sf-semibold transition-all duration-200 text-sm ${
                        isFlightSearchValid()
                          ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 border border-blue-500/20 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      Search Flights
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hotel Search Section */}
            {selectedServices.includes('hotel') && (
              <div className="bg-orange-50 rounded-xl p-5 border border-orange-200 mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Building className="text-orange-600" size={16} />
                  </div>
                  <h3 className="text-base font-sf-semibold text-gray-900">Hotel Booking</h3>
                </div>
                
                {/* Hotel Search Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Destination */}
                    <SearchableDropdown
                      label="Destination"
                      value={hotelSearch.destination}
                      onChange={(value) => handleHotelSearchChange('destination', value)}
                      options={getAirportDisplayOptions()}
                      placeholder="Select destination"
                      searchPlaceholder="Search destinations..."
                      required
                      isAirport={false}
                    />

                    {/* Check-in Date */}
                    <DatePicker
                      label="Check-in Date"
                      value={hotelSearch.checkIn}
                      onChange={(value) => handleHotelSearchChange('checkIn', value)}
                      required
                      placeholder="Select check-in date"
                      minDate={formData.startDate}
                    />

                    {/* Check-out Date */}
                    <DatePicker
                      label="Check-out Date"
                      value={hotelSearch.checkOut}
                      onChange={(value) => handleHotelSearchChange('checkOut', value)}
                      required
                      placeholder="Select check-out date"
                      minDate={hotelSearch.checkIn || formData.startDate}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Rooms */}
                    <div>
                      <label className="block text-sm font-sf-semibold text-gray-700 mb-2">
                        Rooms
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        value={hotelSearch.rooms}
                        onChange={(e) => handleHotelSearchChange('rooms', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    {/* Adults */}
                    <div>
                      <label className="block text-sm font-sf-semibold text-gray-700 mb-2">
                        Adults
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        value={hotelSearch.guests.adults}
                        onChange={(e) => handleHotelSearchChange('guests', { ...hotelSearch.guests, adults: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    {/* Children */}
                    <div>
                      <label className="block text-sm font-sf-semibold text-gray-700 mb-2">
                        Children
                      </label>
                      <select
                        value={hotelSearch.guests.children}
                        onChange={(e) => handleHotelSearchChange('guests', { ...hotelSearch.guests, children: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      >
                        {[0, 1, 2, 3, 4].map(num => (
                          <option key={num} value={num}>{num} Child{num > 1 ? 'ren' : num === 1 ? '' : 'ren'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleHotelSearch}
                      disabled={!hotelSearch.destination || !hotelSearch.checkIn || !hotelSearch.checkOut}
                      className={`px-6 py-3 rounded-xl font-sf-semibold transition-all duration-200 text-sm ${
                        hotelSearch.destination && hotelSearch.checkIn && hotelSearch.checkOut
                          ? 'bg-orange-600 hover:bg-orange-700 text-white hover:scale-105 border border-orange-500/20 shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_25px_rgba(234,88,12,0.5)]'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      Search Hotels
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Entity Information - Only show for Business and Guest bookings */}
          {formData.bookingType !== 'personal' && (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="text-green-600" size={16} />
                </div>
                <h2 className="text-base font-sf-semibold text-gray-900">Entity Information</h2>
              </div>
              
              {/* First Row - 3 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                <SearchableDropdown
                  ref={legalEntityRef}
                  label="Legal Entity Name"
                  value={formData.legalEntity}
                  onChange={(value) => handleInputChange('legalEntity', value)}
                  options={dropdownOptions.legalEntities}
                  placeholder="Select legal entity"
                  searchPlaceholder="Search legal entities..."
                  required
                />

                <SearchableDropdown
                  ref={billingEntityRef}
                  label="Billing Entity"
                  value={formData.billingEntity}
                  onChange={(value) => handleInputChange('billingEntity', value)}
                  options={dropdownOptions.billingEntities}
                  placeholder="Select billing entity"
                  searchPlaceholder="Search billing entities..."
                  required
                />

                <SearchableDropdown
                  ref={costCenterRef}
                  label="Cost Center"
                  value={formData.costCenter}
                  onChange={(value) => handleInputChange('costCenter', value)}
                  options={dropdownOptions.costCenters}
                  placeholder="Select cost center"
                  searchPlaceholder="Search cost centers..."
                />
              </div>

              {/* Second Row - Department */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <SearchableDropdown
                  ref={departmentRef}
                  label="Department"
                  value={formData.department}
                  onChange={(value) => handleInputChange('department', value)}
                  options={dropdownOptions.departments}
                  placeholder="Select department"
                  searchPlaceholder="Search departments..."
                />
              </div>

              {/* Employee Default Notice */}
              <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-sf-semibold text-blue-800">Employee Profile Defaults</span>
                </div>
                <p className="text-sm font-sf-medium text-blue-700 leading-relaxed">
                  Entity information has been pre-populated from your employee profile. You can modify these selections if needed for this specific trip.
                </p>
              </div>
            </div>
          )}

          {/* Personal Booking Notice */}
          {formData.bookingType === 'personal' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <h3 className="text-sm font-sf-semibold text-emerald-800">Personal Trip Selected</h3>
              </div>
              <p className="text-emerald-700 text-sm font-sf-medium leading-relaxed">
                For personal trips, dates, entity information, and traveler details will be collected in later stages. You can proceed directly to add services to your booking.
              </p>
            </div>
          )}

          {/* Traveler Details - Business Booking */}
          {formData.bookingType === 'business' && (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Plus className="text-purple-600" size={16} />
                </div>
                <h2 className="text-base font-sf-semibold text-gray-900">Traveler Details</h2>
              </div>
              <TravelerDetails 
                isInternational={formData.travelMode === 'international'} 
                onDataChange={handleTravelerChange}
                initialData={travelerData}
              />
            </div>
          )}

          {/* Guest Traveler Details - Guest Booking */}
          {formData.bookingType === 'guest' && (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Plus className="text-orange-600" size={16} />
                </div>
                <h2 className="text-base font-sf-semibold text-gray-900">Guest Traveler Details</h2>
              </div>
              <GuestTravelerManager 
                isInternational={formData.travelMode === 'international'} 
                onDataChange={handleGuestTravelersChange}
              />
            </div>
          )}

          {/* Validation Message */}
          {!isFormValid() && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <p className="text-sm font-sf-semibold text-amber-800">
                  Please complete all required fields to proceed with adding services
                </p>
              </div>
            </div>
          )}

          {/* Action Button - Right aligned */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={!isFormValid()}
              tabIndex={isFormValid() ? 20 : -1}
              aria-label="Proceed to add services to your trip"
              className={`px-8 py-3 rounded-xl font-sf-semibold transition-all duration-200 text-sm min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                isFormValid()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 border border-blue-500/20 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-200'
              }`}
            >
              Proceed to Add Services
            </button>
          </div>
        </form>
      </div>

      {/* Visa Requirements Modal */}
      {showVisaModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Plus size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-sf-bold">International Travel Notice</h2>
                  <p className="text-orange-100 text-sm font-sf-medium">Important visa requirements</p>
                </div>
              </div>
              <button
                onClick={closeVisaModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Plus size={20} className="text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-5">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <h3 className="text-base font-sf-semibold text-orange-800 mb-3">
                    Visa & Documentation Requirements
                  </h3>
                  <div className="text-sm font-sf-medium text-orange-700 space-y-2 leading-relaxed">
                    <p>
                      <strong>Please ensure you have:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Valid passport with minimum 6 months validity</li>
                      <li>Appropriate visa or entry permits for your destination</li>
                      <li>All required travel documentation</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="text-base font-sf-semibold text-red-800 mb-2">
                    Traveler Responsibility
                  </h3>
                  <p className="text-sm font-sf-medium text-red-700 leading-relaxed">
                    <strong>This responsibility lies solely with the traveler.</strong> Please verify visa regulations for your destination country and ensure all documentation is valid before travel.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="text-base font-sf-semibold text-blue-800 mb-2">
                    Need Assistance?
                  </h3>
                  <p className="text-sm font-sf-medium text-blue-700 leading-relaxed">
                    Contact our travel desk or immigration team for guidance on visa requirements and documentation.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={closeVisaModal}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-sf-semibold transition-all duration-200 text-sm"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trip Conflict Modal */}
      {showConflictModal && (
        <TripConflictModal
          isOpen={showConflictModal}
          onClose={closeConflictModal}
          onProceed={proceedWithBooking}
          travelerName={getTravelerName()}
          conflictingTripIds={conflictingTripIds}
          startDate={formData.startDate}
          endDate={formData.endDate}
        />
      )}

      {/* Flight Search Modal */}
      {showFlightModal && (
        <FlightSearchModal
          isOpen={showFlightModal}
          onClose={() => setShowFlightModal(false)}
          onFlightSelect={(flight, direction) => {
            if (direction === 'outbound') {
              setSelectedOutboundFlight(flight);
            } else {
              setSelectedReturnFlight(flight);
            }
            // Modal stays open - user closes manually or via Done button
          }}
          searchData={{
            from: flightSearch.from,
            to: flightSearch.to,
            departureDate: flightSearch.departureDate,
            returnDate: flightSearch.returnDate,
            tripType: formData.tripType,
            passengers: flightSearch.passengers,
            travelClass: flightSearch.travelClass,
            segments: flightSearch.segments
          }}
        />
      )}

      {/* Hotel Search Modal */}
      {showHotelModal && (
        <HotelSearchModal
          isOpen={showHotelModal}
          onClose={() => setShowHotelModal(false)}
          onHotelSelect={handleHotelSelect}
          searchData={hotelSearch}
        />
      )}
    </>
  );
};

export default CreateTripForm;
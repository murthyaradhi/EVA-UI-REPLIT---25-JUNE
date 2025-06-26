import React, { useState, useEffect } from 'react';
import {
  X, Plane, Clock, MapPin, Filter, ChevronDown, ChevronUp, Wifi, Coffee, Utensils, Star, Info
} from 'lucide-react';

// Date formatting function
const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

interface FlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlightSelect: (flight: any, direction: 'outbound' | 'return') => void;
  onContinue?: (selections: { outbound: any; return: any | null }) => void;
  searchData?: {
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string;
    tripType: 'one-way' | 'round-trip' | 'multi-city';
    passengers?: {
      adults: number;
      children: number;
      infants: number;
    };
    travelClass?: 'economy' | 'premium' | 'business' | 'first';
    segments?: Array<{ id: string; from: string; to: string; departureDate: string }>;
  };
}

interface Flight {
  id: string;
  airline: {
    code: string;
    name: string;
    logo: string;
  };
  flightNumber: string;
  aircraft: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    terminal?: string;
  };
  duration: string;
  stops: number;
  stopDetails?: {
    airport: string;
    duration: string;
  }[];
  price: {
    economy: number;
    premium: number;
    business: number;
  };
  availableFareTypes: {
    corporate?: { price: number; features: string[] };
    flexi?: { price: number; features: string[] };
    retail?: { price: number; features: string[] };
  };
  amenities: string[];
  baggage: {
    checkedBag: string;
    handBag: string;
  };
  refundable: boolean;
  seatsLeft: number;
}

// NOTE: Using the more detailed flight generator from your other file.
const generateFlights = (from: string, to: string, prefix: string): Flight[] => {
    const airlines = [
      { code: '6E', name: 'IndiGo', logo: '🔵' },
      { code: 'SG', name: 'SpiceJet', logo: '🌶️' },
      { code: 'AI', name: 'Air India', logo: '🇮🇳' },
      { code: 'UK', name: 'Vistara', logo: '✈️' }
    ];
    const aircraftTypes = ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A380'];
    const amenities = ['WiFi', 'Meal', 'Entertainment', 'Power', 'Extra Legroom'];
    const mockFlights: Flight[] = [];

    for (let i = 0; i < 20; i++) {
      const airline = i < 8 ? airlines[0] : i < 14 ? airlines[1] : airlines[Math.floor(Math.random() * airlines.length)];
      const basePrice = 3000 + Math.random() * 15000;
      const departureHour = Math.floor(Math.random() * 24);
      const durationHours = 1 + Math.random() * 4;
      const arrivalHour = (departureHour + durationHours) % 24;
      const stops = Math.random() < 0.4 ? 0 : Math.random() < 0.7 ? 1 : 2;
      const fareTypes: any = {};
        switch (airline.name) {
          case 'IndiGo': fareTypes.corporate = { price: Math.floor(basePrice * 0.85), features: ['Corporate Discount', 'Free Changes'] }; break;
          case 'Vistara': fareTypes.flexi = { price: Math.floor(basePrice * 0.98), features: ['Flexible Dates', 'Lounge Access'] }; break;
        }
        fareTypes.retail = { price: basePrice, features: ['Standard Fare'] };


      mockFlights.push({
        id: `${prefix}-flight-${i}`,
        airline,
        flightNumber: `${airline.code}${Math.floor(100 + Math.random() * 900)}`,
        aircraft: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
        departure: { airport: from.split(' - ')[0], city: from.split(' - ')[1] || 'City', time: `${departureHour.toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
        arrival: { airport: to.split(' - ')[0], city: to.split(' - ')[1] || 'City', time: `${Math.floor(arrivalHour).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` },
        duration: `${Math.floor(durationHours)}h ${Math.floor((durationHours % 1) * 60)}m`,
        stops,
        price: { economy: Math.floor(basePrice), premium: Math.floor(basePrice * 1.5), business: Math.floor(basePrice * 2.5) },
        amenities: amenities.filter(() => Math.random() < 0.6),
        baggage: { checkedBag: '15 kg', handBag: '7 kg' },
        refundable: Math.random() < 0.3,
        seatsLeft: Math.floor(1 + Math.random() * 20),
        availableFareTypes: fareTypes
      });
    }

    return mockFlights;
  };


const FlightSearchModal: React.FC<FlightSearchModalProps> = ({
  isOpen,
  onClose,
  onFlightSelect,
  onContinue,
  searchData
}) => {
  // Early return if searchData is not provided
  if (!searchData) {
    return null;
  }
  // ===== FIX STEP 1: ADD STATE FOR ACTIVE TAB =====
  const [activeTab, setActiveTab] = useState<'outbound' | 'return'>('outbound');

  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [selectedFare, setSelectedFare] = useState<'economy' | 'premium' | 'business'>('economy');
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('departure');
  const [filters, setFilters] = useState({
    maxPrice: 50000,
    airlines: [] as string[],
    stops: 'all' as 'all' | 'non-stop' | '1-stop' | '2+stops',
    departureTime: 'all' as 'all' | 'morning' | 'afternoon' | 'evening' | 'night',
    refundable: false
  });
  const [showFilters, setShowFilters] = useState(true); // Default to showing filters
  const [loading, setLoading] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  const [selectedOutbound, setSelectedOutbound] = useState<any | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null);

  // Initial data generation
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Reset selections and tab
      setSelectedOutbound(null);
      setSelectedReturn(null);
      setActiveTab('outbound'); 

      setTimeout(() => {
        const generatedOutbound = generateFlights(searchData?.from || '', searchData?.to || '', 'out');
        const generatedReturn = searchData?.tripType === 'round-trip'
          ? generateFlights(searchData?.to || '', searchData?.from || '', 'ret')
          : [];
        setOutboundFlights(generatedOutbound);
        setReturnFlights(generatedReturn);
        setLoading(false);
      }, 1000);
    }
  }, [isOpen, searchData]);

  // ===== FIX STEP 3: UPDATE FILTERING LOGIC =====
  // This effect now reacts to the active tab changing
  useEffect(() => {
    // Determine which list of flights to use
    const sourceFlights = activeTab === 'outbound' ? outboundFlights : returnFlights;

    let filtered = [...sourceFlights];

    // Apply all filters...
    filtered = filtered.filter(flight => (flight.price[selectedFare] || flight.price.economy) <= filters.maxPrice);
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(flight => filters.airlines.includes(flight.airline.code));
    }
    if (filters.stops !== 'all') {
      filtered = filtered.filter(flight => {
        switch (filters.stops) {
          case 'non-stop': return flight.stops === 0;
          case '1-stop': return flight.stops === 1;
          case '2+stops': return flight.stops >= 2;
          default: return true;
        }
      });
    }
    if (filters.refundable) {
      filtered = filtered.filter(flight => flight.refundable);
    }
    // ... and sorting
    switch (sortBy) {
      case 'price':
        filtered.sort((a, b) => (a.price[selectedFare] || a.price.economy) - (b.price[selectedFare] || b.price.economy));
        break;
      case 'duration':
        filtered.sort((a, b) => {
          const aDuration = parseInt(a.duration.split('h')[0]) * 60 + parseInt(a.duration.split('m')[0].split('h')[1] || '0');
          const bDuration = parseInt(b.duration.split('h')[0]) * 60 + parseInt(b.duration.split('m')[0].split('h')[1] || '0');
          return aDuration - bDuration;
        });
        break;
      case 'departure':
        filtered.sort((a, b) => a.departure.time.localeCompare(b.departure.time));
        break;
    }

    setFilteredFlights(filtered);
  }, [outboundFlights, returnFlights, filters, selectedFare, sortBy, activeTab]);


  const handleFlightSelection = (flight: Flight, direction: 'outbound' | 'return') => {
    if (direction === 'outbound') {
        setSelectedOutbound(flight);
        // If it's a round trip, automatically switch to the return tab
        if (searchData?.tripType === 'round-trip') {
            setActiveTab('return');
        }
    } else {
        setSelectedReturn(flight);
    }
    onFlightSelect(flight, direction);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderFlightCard = (flight: Flight, direction: 'outbound' | 'return') => {
    const isSelected = direction === 'outbound' 
        ? selectedOutbound?.id === flight.id
        : selectedReturn?.id === flight.id;

    return (
      <div 
        key={flight.id} 
        className={`bg-white border-2 rounded-lg p-4 hover:shadow-md transition-all duration-200 ${isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}
        onClick={() => handleFlightSelection(flight, direction)}
      >
        {/* ... flight card details from your more complex modal ... */}
         <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2 items-center">
            <span className="text-xl">{flight.airline.logo}</span>
            <span className="font-semibold">{flight.airline.name}</span>
            <span className="text-sm text-gray-500">{flight.flightNumber}</span>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <div>
            <div className="font-medium">{flight.departure.time}</div>
            <div>{flight.departure.city}</div>
          </div>
          <div className="text-center">
            <div>{flight.duration}</div>
            <div>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}</div>
          </div>
          <div className='text-right'>
            <div className="font-medium">{flight.arrival.time}</div>
            <div className='text-right'>{flight.arrival.city}</div>
          </div>
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between items-center">
            <div className='text-xs text-gray-500'>
                {flight.refundable && <span className="text-green-600 font-semibold">Refundable</span>}
            </div>
            <div className="text-lg font-bold text-gray-800">
                {formatPrice(flight.price.economy)}
            </div>
        </div>
      </div>
    );
  };

  const readyToContinue = selectedOutbound && (searchData?.tripType === 'one-way' || selectedReturn);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
          {/* Header content... */}
          <h2 className="text-xl font-bold">Flight Search Results</h2>
          <button onClick={onClose}><X/></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Filters Sidebar */}
          <div className="w-1/4 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Filters</h3>
             {/* Price Range */}
             <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>₹1,000</span>
                    <span>{formatPrice(filters.maxPrice)}</span>
                  </div>
                </div>
                 {/* Stops */}
                 <div className='mt-4'>
                  <h3 className="font-semibold text-gray-800 mb-3">Stops</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'non-stop', label: 'Non-stop' },
                      { value: '1-stop', label: '1 Stop' },
                      { value: '2+stops', label: '2+ Stops' }
                    ].map((stop) => (
                      <label key={stop.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="stops"
                          value={stop.value}
                          checked={filters.stops === stop.value}
                          onChange={(e) => setFilters(prev => ({ ...prev, stops: e.target.value as any }))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{stop.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* ===== FIX STEP 2: ADD TAB BUTTONS ===== */}
            <div className="p-4 border-b border-gray-200 bg-white">
                {searchData?.tripType === 'round-trip' && (
                    <div className="flex border-b mb-4">
                        <button 
                            onClick={() => setActiveTab('outbound')}
                            className={`px-4 py-2 font-semibold ${activeTab === 'outbound' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                        >
                            Outbound <span className="text-xs">({outboundFlights.length})</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('return')}
                            className={`px-4 py-2 font-semibold ${activeTab === 'return' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                        >
                           Return <span className="text-xs">({returnFlights.length})</span>
                        </button>
                    </div>
                )}
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-600">
                  {loading ? 'Searching...' : `${filteredFlights.length} flights found for ${activeTab} journey`}
                </div>
                {/* Sorting dropdown etc. */}
              </div>
            </div>

            {/* Flight Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
              {loading ? (
                <div className="text-center p-10">Loading...</div>
              ) : (
                filteredFlights.map(flight => renderFlightCard(flight, activeTab))
              )}
            </div>

            {/* Footer with selections and continue button */}
            <div className="p-4 border-t bg-white flex justify-between items-center">
                <div>
                    {selectedOutbound && <p className="text-sm">Outbound: {selectedOutbound.airline.name} {selectedOutbound.flightNumber}</p>}
                    {selectedReturn && <p className="text-sm">Return: {selectedReturn.airline.name} {selectedReturn.flightNumber}</p>}
                </div>
                <button
                    onClick={() => onContinue && onContinue({ outbound: selectedOutbound, return: selectedReturn })}
                    disabled={!readyToContinue}
                    className={`px-6 py-3 rounded-lg font-semibold text-white ${readyToContinue ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    Continue
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSearchModal;
import React, { useState, useEffect } from 'react';
import {
  X, Building, MapPin, Star, Wifi, Car, Utensils, Dumbbell, 
  Coffee, Shield, Users, Bed, Filter, ChevronDown, ChevronUp
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

interface HotelSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHotelSelect: (hotel: any) => void;
  searchData: {
    destination: string;
    checkIn: string;
    checkOut: string;
    rooms: number;
    guests: {
      adults: number;
      children: number;
    };
  };
}

interface Hotel {
  id: string;
  name: string;
  chain: string;
  category: 'business' | 'luxury' | 'budget' | 'boutique';
  starRating: number;
  location: {
    area: string;
    distance: string;
    landmark: string;
  };
  images: string[];
  amenities: string[];
  rooms: {
    type: string;
    price: number;
    originalPrice?: number;
    available: number;
    size: string;
    bedType: string;
    maxOccupancy: number;
    amenities: string[];
  }[];
  reviews: {
    rating: number;
    count: number;
    breakdown: {
      cleanliness: number;
      service: number;
      location: number;
      value: number;
    };
  };
  policies: {
    cancellation: string;
    checkIn: string;
    checkOut: string;
    pets: boolean;
    smoking: boolean;
  };
  features: {
    freeWifi: boolean;
    parking: boolean;
    breakfast: boolean;
    gym: boolean;
    spa: boolean;
    pool: boolean;
    restaurant: boolean;
    businessCenter: boolean;
  };
}

const HotelSearchModal: React.FC<HotelSearchModalProps> = ({
  isOpen,
  onClose,
  onHotelSelect,
  searchData
}) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<{hotel: Hotel; room: any} | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'distance'>('price');
  const [filters, setFilters] = useState({
    priceRange: [0, 25000],
    starRating: [] as number[],
    categories: [] as string[],
    amenities: [] as string[],
    features: [] as string[]
  });

  // Calculate number of nights
  const calculateNights = () => {
    if (!searchData.checkIn || !searchData.checkOut) return 1;
    const checkIn = new Date(searchData.checkIn);
    const checkOut = new Date(searchData.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setSelectedHotel(null);
      setTimeout(() => {
        const generatedHotels = generateHotels();
        setHotels(generatedHotels);
        setFilteredHotels(generatedHotels);
        setLoading(false);
      }, 1200);
    }
  }, [isOpen, searchData]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...hotels];

    // Price filter
    filtered = filtered.filter(hotel => {
      const minPrice = Math.min(...hotel.rooms.map(room => room.price));
      return minPrice >= filters.priceRange[0] && minPrice <= filters.priceRange[1];
    });

    // Star rating filter
    if (filters.starRating.length > 0) {
      filtered = filtered.filter(hotel => filters.starRating.includes(hotel.starRating));
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(hotel => filters.categories.includes(hotel.category));
    }

    // Features filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(hotel => 
        filters.features.every(feature => hotel.features[feature as keyof typeof hotel.features])
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price':
        filtered.sort((a, b) => {
          const aPrice = Math.min(...a.rooms.map(room => room.price));
          const bPrice = Math.min(...b.rooms.map(room => room.price));
          return aPrice - bPrice;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => b.reviews.rating - a.reviews.rating);
        break;
      case 'distance':
        filtered.sort((a, b) => parseFloat(a.location.distance) - parseFloat(b.location.distance));
        break;
    }

    setFilteredHotels(filtered);
  }, [hotels, filters, sortBy]);

  // Generate hotel data
  const generateHotels = (): Hotel[] => {
    const hotelChains = [
      'Taj Hotels', 'Oberoi Group', 'ITC Hotels', 'Marriott', 'Hyatt',
      'Hilton', 'Radisson', 'Lemon Tree', 'OYO', 'Treebo'
    ];

    const categories = ['business', 'luxury', 'budget', 'boutique'] as const;
    const amenitiesList = ['WiFi', 'Parking', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Room Service'];
    const roomAmenities = ['AC', 'TV', 'Mini Bar', 'Safe', 'Balcony', 'City View', 'Sea View'];

    return Array.from({ length: 15 }, (_, i) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const starRating = category === 'luxury' ? 5 : category === 'business' ? 4 : category === 'boutique' ? 3 : Math.floor(2 + Math.random() * 2);
      const chain = hotelChains[Math.floor(Math.random() * hotelChains.length)];
      
      const basePrice = category === 'luxury' ? 8000 + Math.random() * 12000 :
                       category === 'business' ? 4000 + Math.random() * 6000 :
                       category === 'boutique' ? 3000 + Math.random() * 4000 :
                       1500 + Math.random() * 2500;

      return {
        id: `hotel-${i}`,
        name: `${chain} ${searchData.destination.split(' - ')[1] || 'City'}`,
        chain,
        category,
        starRating,
        location: {
          area: ['City Center', 'Airport', 'Business District', 'Beach Area', 'Old Town'][Math.floor(Math.random() * 5)],
          distance: `${(Math.random() * 15).toFixed(1)} km`,
          landmark: ['Railway Station', 'Airport', 'City Mall', 'Business Center', 'Tourist Area'][Math.floor(Math.random() * 5)]
        },
        images: [`/hotel-${i}-1.jpg`, `/hotel-${i}-2.jpg`],
        amenities: amenitiesList.filter(() => Math.random() < 0.7),
        rooms: [
          {
            type: 'Deluxe Room',
            price: Math.floor(basePrice),
            originalPrice: Math.random() < 0.3 ? Math.floor(basePrice * 1.2) : undefined,
            available: Math.floor(1 + Math.random() * 8),
            size: '25-30 sqm',
            bedType: Math.random() < 0.5 ? 'King Bed' : 'Twin Beds',
            maxOccupancy: 2,
            amenities: roomAmenities.filter(() => Math.random() < 0.6)
          },
          {
            type: 'Executive Room',
            price: Math.floor(basePrice * 1.4),
            originalPrice: Math.random() < 0.3 ? Math.floor(basePrice * 1.6) : undefined,
            available: Math.floor(1 + Math.random() * 5),
            size: '35-40 sqm',
            bedType: 'King Bed',
            maxOccupancy: 3,
            amenities: roomAmenities.filter(() => Math.random() < 0.8)
          }
        ],
        reviews: {
          rating: 3.5 + Math.random() * 1.5,
          count: Math.floor(50 + Math.random() * 500),
          breakdown: {
            cleanliness: 3.5 + Math.random() * 1.5,
            service: 3.5 + Math.random() * 1.5,
            location: 3.5 + Math.random() * 1.5,
            value: 3.5 + Math.random() * 1.5
          }
        },
        policies: {
          cancellation: Math.random() < 0.5 ? 'Free cancellation until 24 hours' : 'Non-refundable',
          checkIn: '3:00 PM',
          checkOut: '11:00 AM',
          pets: Math.random() < 0.3,
          smoking: Math.random() < 0.2
        },
        features: {
          freeWifi: Math.random() < 0.9,
          parking: Math.random() < 0.8,
          breakfast: Math.random() < 0.7,
          gym: Math.random() < 0.6,
          spa: Math.random() < 0.4,
          pool: Math.random() < 0.5,
          restaurant: Math.random() < 0.8,
          businessCenter: Math.random() < 0.6
        }
      };
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi size={16} />;
      case 'parking': return <Car size={16} />;
      case 'restaurant': return <Utensils size={16} />;
      case 'gym': return <Dumbbell size={16} />;
      case 'pool': return '🏊';
      case 'spa': return '💆';
      case 'bar': return <Coffee size={16} />;
      case 'room service': return <Shield size={16} />;
      default: return null;
    }
  };

  const handleRoomSelection = (hotel: Hotel, room: any) => {
    setSelectedHotel({ hotel, room });
  };

  const handleAddToTrip = () => {
    if (selectedHotel) {
      onHotelSelect({
        ...selectedHotel.hotel,
        selectedRoom: selectedHotel.room,
        totalPrice: selectedHotel.room.price * nights,
        nights
      });
      onClose();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Building size={24} />
            </div>
            <div>
              <h2 className="text-xl font-sf-bold">Hotel Search</h2>
              <p className="text-sm text-green-100">
                {searchData.destination} • {formatDateDisplay(searchData.checkIn)} - {formatDateDisplay(searchData.checkOut)} • {nights} night{nights > 1 ? 's' : ''} • {searchData.rooms} room{searchData.rooms > 1 ? 's' : ''} • {searchData.guests.adults + searchData.guests.children} guest{searchData.guests.adults + searchData.guests.children > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Filters Sidebar - 20% */}
          <div className={`${showFilters ? 'w-80' : 'w-16'} transition-all duration-300 border-r border-gray-200 bg-gray-50 flex flex-col`}>
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-sf-medium"
              >
                <Filter size={20} />
                {showFilters && <span>Filters</span>}
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {showFilters && (
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Price Range */}
                <div>
                  <h3 className="font-sf-semibold text-gray-800 mb-3">Price per night</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="25000"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [0, parseInt(e.target.value)] }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹0</span>
                      <span>₹{filters.priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Star Rating */}
                <div>
                  <h3 className="font-sf-semibold text-gray-800 mb-3">Star Rating</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <label key={rating} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.starRating.includes(rating)}
                          onChange={(e) => {
                            setFilters(prev => ({
                              ...prev,
                              starRating: e.target.checked
                                ? [...prev.starRating, rating]
                                : prev.starRating.filter(r => r !== rating)
                            }));
                          }}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center gap-1">
                          {renderStars(rating)}
                          <span className="text-sm text-gray-600">({rating} Star)</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Hotel Category */}
                <div>
                  <h3 className="font-sf-semibold text-gray-800 mb-3">Category</h3>
                  <div className="space-y-2">
                    {['luxury', 'business', 'boutique', 'budget'].map(category => (
                      <label key={category} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={(e) => {
                            setFilters(prev => ({
                              ...prev,
                              categories: e.target.checked
                                ? [...prev.categories, category]
                                : prev.categories.filter(c => c !== category)
                            }));
                          }}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-sf-semibold text-gray-800 mb-3">Features</h3>
                  <div className="space-y-2">
                    {['freeWifi', 'parking', 'breakfast', 'gym', 'pool', 'spa'].map(feature => (
                      <label key={feature} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.features.includes(feature)}
                          onChange={(e) => {
                            setFilters(prev => ({
                              ...prev,
                              features: e.target.checked
                                ? [...prev.features, feature]
                                : prev.features.filter(f => f !== feature)
                            }));
                          }}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content - 80% */}
          <div className="flex-1 flex flex-col">
            {/* Sort and Results Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="text-sm font-sf-medium text-gray-600">
                  {loading ? 'Searching hotels...' : `${filteredHotels.length} hotels found`}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-sf-medium text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-sf-medium focus:ring-2 focus:ring-green-500"
                  >
                    <option value="price">Price</option>
                    <option value="rating">Rating</option>
                    <option value="distance">Distance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hotel Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-sf-medium">Searching for the best hotels...</p>
                  </div>
                </div>
              ) : filteredHotels.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Building size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-sf-medium">No hotels found matching your criteria</p>
                    <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                  </div>
                </div>
              ) : (
                filteredHotels.map((hotel) => (
                  <div key={hotel.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    {/* Hotel Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-sf-bold text-gray-900">{hotel.name}</h3>
                          <div className="flex items-center">
                            {renderStars(hotel.starRating)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {hotel.location.area} • {hotel.location.distance} from {hotel.location.landmark}
                          </span>
                          <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs font-sf-medium">
                            {hotel.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          <div className="flex items-center">
                            {renderStars(Math.floor(hotel.reviews.rating))}
                          </div>
                          <span className="text-sm font-sf-semibold text-gray-700">
                            {hotel.reviews.rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({hotel.reviews.count} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-sf-medium text-gray-500">Features:</span>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(hotel.features)
                          .filter(([_, enabled]) => enabled)
                          .slice(0, 6)
                          .map(([feature, _], idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-sf-medium"
                            >
                              {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          ))}
                      </div>
                    </div>

                    {/* Room Options */}
                    <div className="space-y-3">
                      {hotel.rooms.map((room, roomIdx) => (
                        <div key={roomIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-sf-semibold text-gray-800">{room.type}</h4>
                                <span className="text-xs text-gray-500">
                                  {room.size} • {room.bedType} • Max {room.maxOccupancy} guests
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                {room.amenities.slice(0, 4).map((amenity, idx) => (
                                  <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {amenity}
                                  </span>
                                ))}
                                {room.amenities.length > 4 && (
                                  <span className="text-xs text-gray-500">+{room.amenities.length - 4} more</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600">
                                {room.available} rooms available • {hotel.policies.cancellation}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-1">
                                {room.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(room.originalPrice)}
                                  </span>
                                )}
                                <span className="text-lg font-sf-bold text-gray-900">
                                  {formatPrice(room.price)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mb-2">per night</div>
                              <button
                                onClick={() => handleRoomSelection(hotel, room)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-sf-semibold rounded-lg transition-colors"
                              >
                                Select Room
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selected Hotel Summary */}
            {selectedHotel && (
              <div className="border-t border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building size={24} className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-sf-bold text-gray-900 text-sm">
                        {selectedHotel.hotel.name} - {selectedHotel.room.type}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDateDisplay(searchData.checkIn)} - {formatDateDisplay(searchData.checkOut)} • {nights} night{nights > 1 ? 's' : ''} • {searchData.guests.adults + searchData.guests.children} guest{searchData.guests.adults + searchData.guests.children > 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedHotel.room.size} • {selectedHotel.room.bedType} • {selectedHotel.hotel.policies.cancellation}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-sf-bold text-gray-900">
                        {formatPrice(selectedHotel.room.price * nights)}
                      </div>
                      <div className="text-xs text-gray-500">total for {nights} night{nights > 1 ? 's' : ''}</div>
                    </div>
                    <button
                      onClick={handleAddToTrip}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-sf-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Add to Trip
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSearchModal;
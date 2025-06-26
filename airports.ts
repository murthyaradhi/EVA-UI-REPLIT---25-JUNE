// IATA Airport Codes Database

export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
  type: 'domestic' | 'international';
}

export const domesticAirports: Airport[] = [
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport', country: 'India', type: 'domestic' },
  { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International Airport', country: 'India', type: 'domestic' },
  { code: 'BLR', city: 'Bangalore', name: 'Kempegowda International Airport', country: 'India', type: 'domestic' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport', country: 'India', type: 'domestic' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose International Airport', country: 'India', type: 'domestic' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', country: 'India', type: 'domestic' },
  { code: 'PNQ', city: 'Pune', name: 'Pune Airport', country: 'India', type: 'domestic' },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel International Airport', country: 'India', type: 'domestic' },
  { code: 'JAI', city: 'Jaipur', name: 'Jaipur International Airport', country: 'India', type: 'domestic' },
  { code: 'STV', city: 'Surat', name: 'Surat Airport', country: 'India', type: 'domestic' },
  { code: 'LKO', city: 'Lucknow', name: 'Chaudhary Charan Singh International Airport', country: 'India', type: 'domestic' },
  { code: 'KNU', city: 'Kanpur', name: 'Kanpur Airport', country: 'India', type: 'domestic' },
  { code: 'NAG', city: 'Nagpur', name: 'Dr. Babasaheb Ambedkar International Airport', country: 'India', type: 'domestic' },
  { code: 'IDR', city: 'Indore', name: 'Devi Ahilya Bai Holkar Airport', country: 'India', type: 'domestic' },
  { code: 'BHO', city: 'Bhopal', name: 'Raja Bhoj Airport', country: 'India', type: 'domestic' },
  { code: 'VTZ', city: 'Visakhapatnam', name: 'Visakhapatnam Airport', country: 'India', type: 'domestic' },
  { code: 'PAT', city: 'Patna', name: 'Jay Prakash Narayan International Airport', country: 'India', type: 'domestic' },
  { code: 'BDQ', city: 'Vadodara', name: 'Vadodara Airport', country: 'India', type: 'domestic' },
  { code: 'LUH', city: 'Ludhiana', name: 'Ludhiana Airport', country: 'India', type: 'domestic' },
  { code: 'AGR', city: 'Agra', name: 'Agra Airport', country: 'India', type: 'domestic' },
  { code: 'ISK', city: 'Nashik', name: 'Nashik Airport', country: 'India', type: 'domestic' },
  { code: 'IXA', city: 'Agartala', name: 'Maharaja Bir Bikram Airport', country: 'India', type: 'domestic' },
  { code: 'RAJ', city: 'Rajkot', name: 'Rajkot Airport', country: 'India', type: 'domestic' },
  { code: 'VNS', city: 'Varanasi', name: 'Lal Bahadur Shastri Airport', country: 'India', type: 'domestic' },
  { code: 'SXR', city: 'Srinagar', name: 'Sheikh ul-Alam International Airport', country: 'India', type: 'domestic' },
  { code: 'JDH', city: 'Jodhpur', name: 'Jodhpur Airport', country: 'India', type: 'domestic' },
  { code: 'ATQ', city: 'Amritsar', name: 'Sri Guru Ram Dass Jee International Airport', country: 'India', type: 'domestic' },
  { code: 'RPR', city: 'Raipur', name: 'Swami Vivekananda Airport', country: 'India', type: 'domestic' },
  { code: 'IXD', city: 'Allahabad', name: 'Bamrauli Airport', country: 'India', type: 'domestic' },
  { code: 'CJB', city: 'Coimbatore', name: 'Coimbatore International Airport', country: 'India', type: 'domestic' },
  { code: 'JBP', city: 'Jabalpur', name: 'Jabalpur Airport', country: 'India', type: 'domestic' },
  { code: 'GWL', city: 'Gwalior', name: 'Gwalior Airport', country: 'India', type: 'domestic' },
  { code: 'VGA', city: 'Vijayawada', name: 'Vijayawada Airport', country: 'India', type: 'domestic' },
  { code: 'IXM', city: 'Madurai', name: 'Madurai Airport', country: 'India', type: 'domestic' },
  { code: 'GAU', city: 'Guwahati', name: 'Lokpriya Gopinath Bordoloi International Airport', country: 'India', type: 'domestic' },
  { code: 'IXC', city: 'Chandigarh', name: 'Chandigarh Airport', country: 'India', type: 'domestic' },
  { code: 'HBX', city: 'Hubli', name: 'Hubli Airport', country: 'India', type: 'domestic' },
  { code: 'RNC', city: 'Ranchi', name: 'Birsa Munda Airport', country: 'India', type: 'domestic' }
];

export const internationalAirports: Airport[] = [
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'USA', type: 'international' },
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'UK', type: 'international' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France', type: 'international' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport', country: 'Japan', type: 'international' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE', type: 'international' },
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore', type: 'international' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'Hong Kong', type: 'international' },
  { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith Airport', country: 'Australia', type: 'international' },
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International Airport', country: 'Canada', type: 'international' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'USA', type: 'international' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany', type: 'international' },
  { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Airport Schiphol', country: 'Netherlands', type: 'international' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand', type: 'international' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport', country: 'Malaysia', type: 'international' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'South Korea', type: 'international' },
  { code: 'PEK', city: 'Beijing', name: 'Beijing Capital International Airport', country: 'China', type: 'international' },
  { code: 'PVG', city: 'Shanghai', name: 'Shanghai Pudong International Airport', country: 'China', type: 'international' },
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci International Airport', country: 'Italy', type: 'international' },
  { code: 'BCN', city: 'Barcelona', name: 'Barcelona Airport', country: 'Spain', type: 'international' },
  { code: 'TXL', city: 'Berlin', name: 'Berlin Tegel Airport', country: 'Germany', type: 'international' },
  { code: 'VIE', city: 'Vienna', name: 'Vienna International Airport', country: 'Austria', type: 'international' },
  { code: 'ZUR', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland', type: 'international' },
  { code: 'ARN', city: 'Stockholm', name: 'Stockholm Arlanda Airport', country: 'Sweden', type: 'international' },
  { code: 'CPH', city: 'Copenhagen', name: 'Copenhagen Airport', country: 'Denmark', type: 'international' },
  { code: 'OSL', city: 'Oslo', name: 'Oslo Airport', country: 'Norway', type: 'international' },
  { code: 'HEL', city: 'Helsinki', name: 'Helsinki Airport', country: 'Finland', type: 'international' },
  { code: 'BRU', city: 'Brussels', name: 'Brussels Airport', country: 'Belgium', type: 'international' },
  { code: 'PRG', city: 'Prague', name: 'Václav Havel Airport Prague', country: 'Czech Republic', type: 'international' },
  { code: 'BUD', city: 'Budapest', name: 'Budapest Ferenc Liszt International Airport', country: 'Hungary', type: 'international' },
  { code: 'WAW', city: 'Warsaw', name: 'Warsaw Chopin Airport', country: 'Poland', type: 'international' },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey', type: 'international' },
  { code: 'CAI', city: 'Cairo', name: 'Cairo International Airport', country: 'Egypt', type: 'international' },
  { code: 'JNB', city: 'Johannesburg', name: 'O.R. Tambo International Airport', country: 'South Africa', type: 'international' },
  { code: 'CPT', city: 'Cape Town', name: 'Cape Town International Airport', country: 'South Africa', type: 'international' },
  { code: 'GRU', city: 'São Paulo', name: 'São Paulo–Guarulhos International Airport', country: 'Brazil', type: 'international' },
  { code: 'GIG', city: 'Rio de Janeiro', name: 'Rio de Janeiro–Galeão International Airport', country: 'Brazil', type: 'international' },
  { code: 'EZE', city: 'Buenos Aires', name: 'Ezeiza International Airport', country: 'Argentina', type: 'international' },
  { code: 'MEX', city: 'Mexico City', name: 'Mexico City International Airport', country: 'Mexico', type: 'international' },
  { code: 'YVR', city: 'Vancouver', name: 'Vancouver International Airport', country: 'Canada', type: 'international' },
  { code: 'YUL', city: 'Montreal', name: 'Montréal–Trudeau International Airport', country: 'Canada', type: 'international' },
  { code: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'Australia', type: 'international' },
  { code: 'PER', city: 'Perth', name: 'Perth Airport', country: 'Australia', type: 'international' },
  { code: 'AKL', city: 'Auckland', name: 'Auckland Airport', country: 'New Zealand', type: 'international' },
  { code: 'WLG', city: 'Wellington', name: 'Wellington Airport', country: 'New Zealand', type: 'international' },
  { code: 'MNL', city: 'Manila', name: 'Ninoy Aquino International Airport', country: 'Philippines', type: 'international' },
  { code: 'CGK', city: 'Jakarta', name: 'Soekarno–Hatta International Airport', country: 'Indonesia', type: 'international' },
  { code: 'SGN', city: 'Ho Chi Minh City', name: 'Tan Son Nhat International Airport', country: 'Vietnam', type: 'international' },
  { code: 'HAN', city: 'Hanoi', name: 'Noi Bai International Airport', country: 'Vietnam', type: 'international' },
  { code: 'CMB', city: 'Colombo', name: 'Bandaranaike International Airport', country: 'Sri Lanka', type: 'international' },
  { code: 'DAC', city: 'Dhaka', name: 'Hazrat Shahjalal International Airport', country: 'Bangladesh', type: 'international' }
];

export const getAllAirports = (): Airport[] => {
  return [...domesticAirports, ...internationalAirports];
};

export const getAirportsByTravelMode = (travelMode: 'domestic' | 'international'): Airport[] => {
  if (travelMode === 'domestic') {
    return domesticAirports;
  }
  return internationalAirports;
};

export const formatAirportDisplay = (airport: Airport): string => {
  return `${airport.code} - ${airport.city}`;
};

export const formatAirportOption = (airport: Airport): { code: string; display: string; city: string } => {
  return {
    code: airport.code,
    display: formatAirportDisplay(airport),
    city: airport.city
  };
};
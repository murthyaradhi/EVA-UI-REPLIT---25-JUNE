import { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar, Users, Plane, X, RotateCcw } from 'lucide-react';

interface FlightSearchHistoryItem {
  id: number;
  searchData: {
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string;
    tripType: 'one-way' | 'round-trip';
    passengers?: {
      adults: number;
      children: number;
      infants: number;
    };
    travelClass?: 'economy' | 'premium' | 'business' | 'first';
  };
  frequency: number;
  lastUsed: string;
}

interface FlightSearchHistoryProps {
  userId: number;
  onSearchSelect: (searchData: any) => void;
  className?: string;
}

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

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDateDisplay(dateString);
};

export default function FlightSearchHistory({ userId, onSearchSelect, className = '' }: FlightSearchHistoryProps) {
  const [history, setHistory] = useState<FlightSearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/flight-search-history/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSelect = async (item: FlightSearchHistoryItem) => {
    try {
      // Update frequency in backend
      await fetch(`/api/flight-search-history/${item.id}/use`, {
        method: 'PUT',
      });
      
      // Call parent callback
      onSearchSelect(item.searchData);
      
      // Refresh history to update frequency
      fetchHistory();
    } catch (error) {
      console.error('Failed to update search frequency:', error);
      // Still proceed with search
      onSearchSelect(item.searchData);
    }
  };

  const handleDeleteSearch = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const response = await fetch(`/api/flight-search-history/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete search:', error);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-gray-600" />
          <span className="text-sm font-sf-semibold text-gray-800">Recent Searches</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-gray-600" />
          <span className="text-sm font-sf-semibold text-gray-800">Recent Searches</span>
        </div>
        <div className="text-center py-8">
          <Plane size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No recent searches</p>
          <p className="text-xs text-gray-400">Your search history will appear here</p>
        </div>
      </div>
    );
  }

  const displayedHistory = expanded ? history : history.slice(0, 3);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-600" />
          <span className="text-sm font-sf-semibold text-gray-800">Recent Searches</span>
        </div>
        {history.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:text-blue-700 font-sf-medium"
          >
            {expanded ? 'Show Less' : `Show All (${history.length})`}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {displayedHistory.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSearchSelect(item)}
            className="group p-3 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1 text-sm font-sf-semibold text-gray-800">
                    <span>{item.searchData.from.split(' - ')[1]}</span>
                    <span className="text-gray-400">→</span>
                    <span>{item.searchData.to.split(' - ')[1]}</span>
                  </div>
                  {item.searchData.tripType === 'round-trip' && (
                    <RotateCcw size={12} className="text-gray-400" />
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formatDateDisplay(item.searchData.departureDate)}</span>
                    {item.searchData.returnDate && (
                      <span> - {formatDateDisplay(item.searchData.returnDate)}</span>
                    )}
                  </div>

                  {item.searchData.passengers && (
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>
                        {item.searchData.passengers.adults} Adult{item.searchData.passengers.adults > 1 ? 's' : ''}
                        {item.searchData.passengers.children > 0 && `, ${item.searchData.passengers.children} Child${item.searchData.passengers.children > 1 ? 'ren' : ''}`}
                        {item.searchData.passengers.infants > 0 && `, ${item.searchData.passengers.infants} Infant${item.searchData.passengers.infants > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  )}

                  {item.searchData.travelClass && (
                    <span className="capitalize">{item.searchData.travelClass}</span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-gray-500">
                    {formatTimeAgo(item.lastUsed)}
                    {item.frequency > 1 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {item.frequency}x
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => handleDeleteSearch(item.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Click any search to quickly repeat it
          </p>
        </div>
      )}
    </div>
  );
}
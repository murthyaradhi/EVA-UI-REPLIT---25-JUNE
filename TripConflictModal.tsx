import React, { useEffect, useCallback } from 'react';
import { AlertTriangle, X, Calendar, User } from 'lucide-react';

interface TripConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  travelerName: string;
  conflictingTripIds: string[];
  startDate: string;
  endDate: string;
}

const TripConflictModal: React.FC<TripConflictModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  travelerName,
  conflictingTripIds,
  startDate,
  endDate
}) => {
  // Handle escape key press
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }, [onClose]);

  // Add/remove escape key listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleEscapeKey]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle proceed and close
  const handleProceed = useCallback(() => {
    onProceed();
    onClose();
  }, [onProceed, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-modal-title"
      aria-describedby="conflict-modal-description"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl max-w-lg w-full border border-white/30 animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-sm">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <h2 id="conflict-modal-title" className="text-lg font-sf-bold">
                Trip Conflict Detected
              </h2>
              <p className="text-orange-100 text-sm font-sf-medium">
                Overlapping travel dates found
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors shadow-sm"
            aria-label="Close modal"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="space-y-5">
            {/* Traveler Information */}
            <div className="bg-orange-50/80 backdrop-blur-sm border border-orange-200/60 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100/80 backdrop-blur-sm rounded-lg shadow-sm">
                  <User size={16} className="text-orange-600" />
                </div>
                <h3 className="text-base font-sf-semibold text-orange-800">
                  Conflicting Traveler
                </h3>
              </div>
              <p className="text-sm font-sf-medium text-orange-700 leading-relaxed">
                <strong>{travelerName}</strong> already has existing trip request(s) for overlapping travel dates.
              </p>
            </div>

            {/* Trip Details */}
            <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/60 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100/80 backdrop-blur-sm rounded-lg shadow-sm">
                  <Calendar size={16} className="text-blue-600" />
                </div>
                <h3 className="text-base font-sf-semibold text-blue-800">
                  Current Trip Dates
                </h3>
              </div>
              <div className="text-sm font-sf-medium text-blue-700">
                <p><strong>Start Date:</strong> {formatDate(startDate)}</p>
                <p><strong>End Date:</strong> {formatDate(endDate)}</p>
              </div>
            </div>

            {/* Conflicting Trip IDs */}
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl p-4 shadow-sm">
              <h3 className="text-base font-sf-semibold text-red-800 mb-3">
                Conflicting Trip ID{conflictingTripIds.length > 1 ? 's' : ''}
              </h3>
              <div className="flex flex-wrap gap-2">
                {conflictingTripIds.map((tripId) => (
                  <span
                    key={tripId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-sf-semibold bg-red-100/80 text-red-800 border border-red-200/60 shadow-sm"
                  >
                    #{tripId}
                  </span>
                ))}
              </div>
            </div>

            {/* Warning Message */}
            <div id="conflict-modal-description" className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200/60 rounded-xl p-4 shadow-sm">
              <h3 className="text-base font-sf-semibold text-yellow-800 mb-2">
                Confirmation Required
              </h3>
              <p className="text-sm font-sf-medium text-yellow-700 leading-relaxed">
                <strong>{travelerName}</strong> already has an existing trip request with Trip ID: <strong>{conflictingTripIds.join(', ')}</strong> for the same travel date. Do you still want to proceed with this booking?
              </p>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4 shadow-sm">
              <h3 className="text-base font-sf-semibold text-gray-800 mb-2">
                Important Notes
              </h3>
              <ul className="text-sm font-sf-medium text-gray-700 space-y-1 leading-relaxed">
                <li>• Proceeding will create a duplicate trip request</li>
                <li>• Review existing trips before confirming</li>
                <li>• Contact travel desk if you need to modify existing bookings</li>
              </ul>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200/50">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100/80 backdrop-blur-sm hover:bg-gray-200/80 text-gray-700 rounded-xl font-sf-semibold transition-all duration-200 text-sm border border-gray-300/60 hover:border-gray-400 shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-sf-semibold transition-all duration-200 text-sm shadow-md hover:shadow-lg"
            >
              Yes, Proceed Anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripConflictModal;
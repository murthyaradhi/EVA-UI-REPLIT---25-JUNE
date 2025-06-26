import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  isIncomplete?: boolean;
  tabIndex?: number;
}

export interface DatePickerRef {
  openCalendar: () => void;
  focus: () => void;
}

const DatePicker = forwardRef<DatePickerRef, DatePickerProps>(({
  label,
  value,
  onChange,
  required = false,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  isIncomplete = false,
  tabIndex
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState<'below' | 'above'>('below');
  
  // Create date from string without timezone issues
  const createDateFromString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const [currentMonth, setCurrentMonth] = useState(() => {
    // Start with the selected date's month if available, otherwise current month
    if (value) {
      const selectedDate = createDateFromString(value);
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    return new Date();
  });

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openCalendar: () => {
      if (!disabled) {
        setIsCalendarOpen(true);
      }
    },
    focus: () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }), [disabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    }

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Handle scroll events to reposition calendar
  useEffect(() => {
    const handleScroll = () => {
      if (isCalendarOpen) {
        const position = calculateCalendarPosition();
        setCalendarPosition(position);
      }
    };

    if (isCalendarOpen) {
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isCalendarOpen]);

  const handleDateSelect = (date: Date) => {
    // Format date to YYYY-MM-DD without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    onChange(formattedDate);
    setIsCalendarOpen(false);
  };

  const calculateCalendarPosition = () => {
    if (!inputRef.current) return 'below';
    
    const inputRect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const calendarHeight = 400; // Approximate calendar height
    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
    
    // If there's not enough space below but there's space above, position above
    if (spaceBelow < calendarHeight && spaceAbove > calendarHeight) {
      return 'above';
    }
    
    return 'below';
  };

  const handleInputClick = () => {
    if (!disabled) {
      const position = calculateCalendarPosition();
      setCalendarPosition(position);
      setIsCalendarOpen(true);
    }
  };

  // Calculate minimum date - use minDate prop or today, whichever is later
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create minDate from string without timezone conversion
  const propMinDate = minDate ? createDateFromString(minDate) : today;
  const minimumDate = propMinDate > today ? propMinDate : today;
  const selectedDate = value ? createDateFromString(value) : null;

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = createDateFromString(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateDisabled = (date: Date) => {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    // Check minimum date constraint (inclusive)
    const minDateToCheck = new Date(minimumDate);
    minDateToCheck.setHours(0, 0, 0, 0);
    if (dateToCheck < minDateToCheck) return true;
    
    // Check maximum date constraint (inclusive)
    if (maxDate) {
      const maximumDate = createDateFromString(maxDate);
      if (dateToCheck > maximumDate) return true;
    }
    
    return false;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const getNextMonth = (date: Date) => {
    const nextMonth = new Date(date);
    nextMonth.setMonth(date.getMonth() + 1);
    return nextMonth;
  };

  const CalendarMonth = ({ monthDate }: { monthDate: Date }) => {
    const days = getDaysInMonth(monthDate);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="p-4">
        <div className="text-center font-sf-semibold text-gray-900 mb-4">{monthName}</div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-sf-medium text-gray-500 py-2 w-8">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <div key={index} className="w-8 h-8">
              {date && (
                <button
                  type="button"
                  onClick={() => !isDateDisabled(date) && handleDateSelect(date)}
                  disabled={disabled || isDateDisabled(date)}
                  className={`w-full h-full rounded-lg text-sm font-sf-medium transition-all duration-200 flex items-center justify-center ${
                    isSelected(date)
                      ? 'bg-blue-600 text-white shadow-lg'
                      : isToday(date)
                      ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-200'
                      : isDateDisabled(date)
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {date.getDate()}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <label className="block text-sm font-sf-semibold text-gray-800 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
          <Calendar size={16} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={formatDateForDisplay(value)}
          onClick={handleInputClick}
          tabIndex={tabIndex}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleInputClick();
            } else if (e.key === 'Tab' && value && label === 'End Date') {
              // After Tab from End Date, focus should go to services
              setTimeout(() => {
                const firstServiceButton = document.querySelector('[data-service-button]') as HTMLElement;
                if (firstServiceButton) {
                  firstServiceButton.focus();
                }
              }, 0);
            }
          }}
          readOnly
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={`w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm font-sf-medium bg-white hover:border-gray-400 cursor-pointer text-gray-900 min-h-[48px] ${
            disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
          }`}
          aria-label={`${label}${required ? ' (required)' : ''}`}
        />
        
        {/* Calendar Dropdown - Positioned relative to input */}
        {isCalendarOpen && (
          <div 
            ref={calendarRef}
            className={`absolute left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 backdrop-blur-sm bg-white/95 w-[560px] max-w-[90vw] ${
              calendarPosition === 'above' 
                ? 'bottom-full mb-2' 
                : 'top-full mt-2'
            }`}
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <button
                type="button"
                onClick={() => {
                  const prevMonth = new Date(currentMonth);
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setCurrentMonth(prevMonth);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-sm font-sf-semibold text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextMonth = new Date(currentMonth);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    setCurrentMonth(nextMonth);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-0">
              <div className="min-w-[280px]">
                <CalendarMonth monthDate={currentMonth} />
              </div>
              <div className="border-l border-gray-200 min-w-[280px]">
                <CalendarMonth monthDate={getNextMonth(currentMonth)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
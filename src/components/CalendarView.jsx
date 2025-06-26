import React, { useState, useEffect } from 'react';

const CalendarView = ({ events = [] }) => {
  // State for current year and month (0-indexed)
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [weeks, setWeeks] = useState([]);
  // State for modal popup to show event details on a particular day
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState("");

  // Utility function to format a date as "YYYY-MM-DD"
  const formatDate = (year, month, day) => {
    const m = month + 1;
    const monthStr = m < 10 ? '0' + m : m;
    const dayStr = day < 10 ? '0' + day : day;
    return `${year}-${monthStr}-${dayStr}`;
  };

  // Generate calendar weeks for the current month
  const generateCalendar = () => {
    const firstDay = new Date(year, month, 1);
    // Adjust start day so Monday is the first column:
    let startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendar = [];
    let week = [];

    // Fill empty cells before the first day of the month
    for (let i = 0; i < startDay; i++) {
      week.push(null);
    }
    // Fill in the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }
    // Pad the last week if not complete
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      calendar.push(week);
    }
    setWeeks(calendar);
  };

  useEffect(() => {
    generateCalendar();
  }, [year, month]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  // When clicking a date cell, if there are events, open the modal with event details
  const handleDateClick = (day) => {
    if (!day) return; // Ignore empty cells
    const dateStr = formatDate(year, month, day);
    const eventsForDay = events.filter(event => event.date === dateStr);
    if (eventsForDay.length > 0) {
      setSelectedDateEvents(eventsForDay);
      setSelectedDateStr(dateStr);
      setModalVisible(true);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="p-4 relative">
      {/* Header with navigation arrows */}
      <div className="flex items-center justify-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 hover:text-blue-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"
               viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="mx-4 font-bold text-xl">{monthNames[month]} {year}</h2>
        <button onClick={handleNextMonth} className="p-2 hover:text-blue-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"
               viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {/* Calendar Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            {dayNames.map(day => (
              <th key={day} className="p-2 text-center border font-medium">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wIndex) => (
            <tr key={wIndex}>
              {week.map((day, dIndex) => {
                const dateStr = day ? formatDate(year, month, day) : "";
                const eventsForDay = day ? events.filter(event => event.date === dateStr) : [];
                // Determine if the cell's date is in the past
                let isPast = false;
                if (day) {
                  const cellDate = new Date(year, month, day);
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  isPast = cellDate.getTime() < today.getTime();
                }
                return (
                  <td
                    key={dIndex}
                    className="p-4 text-center border h-24 align-top cursor-pointer"
                    onClick={() => handleDateClick(day)}
                  >
                    {day ? (
                      <div>
                        {/* Day number with dark text color for visibility */}
                        <div className="mx-auto mb-2 w-8 h-8 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center font-semibold">
                          {day}
                        </div>
                        {/* Display up to two icons: tick (✅) if not past, cross (❌) if date is in the past */}
                        <div className="flex justify-center space-x-1">
                          {eventsForDay.slice(0, 2).map((_, idx) => (
                            <span
                              key={idx}
                              className={isPast ? "text-red-500 text-lg" : "text-green-500 text-lg"}
                              title={isPast ? "Past event" : "Approved event"}
                            >
                              {isPast ? "❌" : "✅"}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mx-auto mb-2 w-8 h-8"></div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Modal Popup for Event Details with gray background */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-200 p-4 rounded-md max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Events on {selectedDateStr}</h3>
            {selectedDateEvents.map((event, index) => (
              <div key={index} className="mb-2 border-b pb-2">
                <p className="font-semibold">{event.title || "Event"}</p>
                <p><strong>Faculty:</strong> {event.facultyName}</p>
                <p><strong>Department:</strong> {event.department}</p>
                <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
                {event.description && <p>{event.description}</p>}
              </div>
            ))}
            <button
              onClick={() => setModalVisible(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;

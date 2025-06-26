// FacultyDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore, auth } from '../firebase/firebase';

import FacultySidebar from '../components/FacultySidebar';
import BookingForm from '../components/BookingForm';
import EventDetailsForm from '../components/EventDetailsForm';
import CalendarView from '../components/CalendarView';
import Notifications from '../components/Notification'; // Your Notifications component

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('booking');
  const [selectedHall, setSelectedHall] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // For Calendar view: add dropdown to select which hall's calendar to view
  const [calendarHall, setCalendarHall] = useState('');
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  
  const navigate = useNavigate();

  // List of available halls
  const halls = [
    { id: 'hall1', name: 'Seminar Hall', location: 'Building 9, Floor 4' },
    { id: 'hall2', name: 'LRDC Hall', location: 'Building 9, Floor 5' },
    { id: 'hall3', name: 'Architecture Hall', location: 'Building 3, Floor 5' }
  ];

  // Set default hall for calendar if not already selected
  useEffect(() => {
    if (halls.length > 0 && !calendarHall) {
      setCalendarHall(halls[0].name);
    }
  }, [halls, calendarHall]);

  // Fetch the booking history for the logged-in faculty (assuming history is saved in bookingRequestsHistory collection)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    
    const q = query(
      collection(firestore, 'bookingRequestsHistory'),
      where('facultyUid', '==', user.uid)
    );
    
    const unsub = onSnapshot(q, snapshot => {
      setBookingHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingHistory(false);
    }, error => {
      console.error('Error fetching booking history:', error);
      setLoadingHistory(false);
    });
    
    return () => unsub();
  }, []);

  // Fetch approved events for the selected calendar hall
  useEffect(() => {
    if (!calendarHall) return;
    setLoadingCalendar(true);
    
    const q = query(
      collection(firestore, 'bookingRequestsHistory'),
      where('hallName', '==', calendarHall),
      where('approvalRequest', '==', 'approved_by_hallmanager')
    );
    
    const unsub = onSnapshot(q, snapshot => {
      setCalendarEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingCalendar(false);
    }, error => {
      console.error('Error fetching calendar events:', error);
      setLoadingCalendar(false);
    });
    
    return () => unsub();
  }, [calendarHall]);

  return (
    <div className="flex">
      <FacultySidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={() => navigate('/login')}
      />

      <div className="flex flex-col flex-1 ml-64">
        <header className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 shadow">
          <h1 className="text-xl font-bold tracking-wide">Faculty Dashboard</h1>
        </header>

        <main className="p-4">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'booking' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Book a Hall</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {halls.map((hall, index) => (
                    <button
                      key={hall.id}
                      onClick={() => setSelectedHall(hall)}
                      className={`rounded-lg shadow p-4 transition-colors duration-200 bg-blue-500 text-white hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${index === 2 ? 'col-span-2 text-center' : ''}`}
                    >
                      <h3 className="text-lg font-semibold">{hall.name}</h3>
                      <p className="text-sm text-white/90">{hall.location}</p>
                    </button>
                  ))}
                </div>
                {selectedHall ? (
                  <BookingForm hall={selectedHall} />
                ) : (
                  <p className="text-gray-700">Please select a hall to book.</p>
                )}
              </div>
            )}

            {activeTab === 'event' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Event Details</h2>
                <EventDetailsForm />
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Notifications</h2>
                <Notifications />
              </div>
            )}

            {activeTab === 'calendar' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Calendar</h2>
                {/* Centered dropdown for hall selection */}
                <div className="mb-4 flex justify-center">
                  <select
                    value={calendarHall}
                    onChange={(e) => setCalendarHall(e.target.value)}
                    className="p-2 border rounded"
                  >
                    {halls.map(hall => (
                      <option key={hall.id} value={hall.name}>
                        {hall.name} - {hall.location}
                      </option>
                    ))}
                  </select>
                </div>
                {loadingCalendar ? (
                  <p>Loading events...</p>
                ) : (
                  <CalendarView events={calendarEvents} />
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Booking History</h2>
                {loadingHistory ? (
                  <p>Loading history...</p>
                ) : bookingHistory.length === 0 ? (
                  <p className="text-gray-700">No booking history available.</p>
                ) : (
                  <div className="space-y-4">
                    {bookingHistory.map((record) => (
                      <div key={record.id} className="bg-white p-4 rounded shadow">
                        <p><strong>Hall:</strong> {record.hallName}</p>
                        <p><strong>Date:</strong> {record.date}</p>
                        <p><strong>Time:</strong> {record.startTime} - {record.endTime}</p>
                        <p><strong>Status:</strong> {record.approvalRequest}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;

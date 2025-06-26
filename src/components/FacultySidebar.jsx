// FacultySidebar.js
import React from 'react';

const FacultySidebar = ({ activeTab, setActiveTab, handleLogout, notifications }) => {
  // Function to determine the styling of a tab button
  const tabClass = (tabName) =>
    activeTab === tabName
      ? "block w-full text-left px-4 py-2 my-1 rounded-md bg-white text-blue-600 shadow"
      : "block w-full text-left px-4 py-2 my-1 rounded-md text-white hover:bg-blue-500 transition-colors duration-200";

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-blue-600 shadow-lg flex flex-col justify-between">
      {/* Top portion of the sidebar */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-blue-600 mb-6">Dashboard</h2>

        <button className={tabClass('booking')} onClick={() => setActiveTab('booking')}>
          My Bookings
        </button>

        <button className={tabClass('calendar')} onClick={() => setActiveTab('calendar')}>
          Calendar
        </button>

        <button className={tabClass('event')} onClick={() => setActiveTab('event')}>
          Event Details
        </button>

        <button className={tabClass('notifications')} onClick={() => setActiveTab('notifications')}>
          Notifications
          {notifications && notifications.unreadCount > 0 && (
            <span className="ml-2 text-xs bg-red-600 text-blue-600 rounded-full px-2">
              {notifications.unreadCount}
            </span>
          )}
        </button>
        
        <button className={tabClass('history')} onClick={() => setActiveTab('history')}>
          Booking History
        </button>
      </div>

      {/* Bottom portion with the logout button */}
      <div className="p-4">
        <button 
          onClick={handleLogout} 
          className="w-full bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default FacultySidebar;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

const HODSidebar = ({ activeTab, setActiveTab, handleLogout }) => {
  const navigate = useNavigate();

  // Use provided logout handler or default one
  const onLogout = handleLogout || (async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  });

  // Styling for tab buttons
  const tabClass = (tabName) =>
    activeTab === tabName 
      ? "block w-full text-left px-4 py-2 my-1 rounded-md bg-white text-blue-600 shadow"
      : "block w-full text-left px-4 py-2 my-1 rounded-md text-white hover:bg-blue-500 transition-colors duration-200";

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-blue-600 shadow-lg flex flex-col justify-between">
      {/* Top Navigation */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-white mb-6">HOD Dashboard</h2>
        <button className={tabClass('requests')} onClick={() => setActiveTab('requests')}>
          Requests
        </button>
        <button className={tabClass('booking')} onClick={() => setActiveTab('booking')}>
          Book a Hall
        </button>
        <button className={tabClass('event')} onClick={() => setActiveTab('event')}>
          Event Details
        </button>
        <button className={tabClass('calendar')} onClick={() => setActiveTab('calendar')}>
          Calendar
        </button>
        <button className={tabClass('notifications')} onClick={() => setActiveTab('notifications')}>
          Notifications
        </button>
      </div>
      {/* Logout Button at the Bottom */}
      <div className="p-4 flex justify-end">
        <button 
          onClick={onLogout} 
          className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default HODSidebar;

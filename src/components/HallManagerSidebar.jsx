import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

const HallManagerSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const tabClass = (tabName) =>
    activeTab === tabName
      ? "block w-full text-left px-4 py-2 my-1 rounded-md bg-white text-blue-600 shadow"
      : "block w-full text-left px-4 py-2 my-1 rounded-md text-white hover:bg-blue-500 transition-colors duration-200";

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-blue-600 shadow-lg flex flex-col justify-between">
      <div className="p-4">
        <h2 className="text-xl font-bold text-white mb-6">Hall Manager</h2>
        <button className={tabClass('requests')} onClick={() => setActiveTab('requests')}>
          Requests
        </button>
        <button className={tabClass('history')} onClick={() => setActiveTab('history')}>
          Booking History
        </button>
        <button className={tabClass('calendar')} onClick={() => setActiveTab('calendar')}>
          Calendar
        </button>
        <button className={tabClass('event')} onClick={() => setActiveTab('event')}>
          Event Details
        </button>
        <button className={tabClass('notifications')} onClick={() => setActiveTab('notifications')}>
          Notifications
        </button>
      </div>
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

export default HallManagerSidebar;

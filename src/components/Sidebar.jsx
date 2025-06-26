import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ userRole }) => {
  let menuItems = [];

  if (userRole === 'faculty') {
    menuItems = [
      { name: 'My Bookings', path: '/faculty-dashboard' },
      { name: 'My Event Details', path: '/faculty-dashboard' },
      { name: 'Notifications', path: '/faculty-dashboard' }
    ];
  } else if (userRole === 'hod') {
    menuItems = [
      { name: 'Booking Requests', path: '/hod-dashboard' },
      { name: 'Book a Hall', path: '/hod-dashboard' },
      { name: 'Calendar View', path: '/hod-dashboard' },
      { name: 'Notifications', path: '/hod-dashboard' }
    ];
  } else if (userRole === 'hallmanager') {
    menuItems = [
      { name: 'Calendar', path: '/hallmanager-dashboard' },
      { name: 'Event Details', path: '/hallmanager-dashboard' },
      { name: 'Notifications', path: '/hallmanager-dashboard' }
    ];
  }

  return (
    <div className="w-64 bg-gray-800 text-white h-full p-4">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      <ul>
        {menuItems.map((item, index) => (
          <li key={index} className="mb-4">
            <Link to={item.path} className="hover:text-gray-300">{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;

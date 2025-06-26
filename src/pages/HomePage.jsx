import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Seminar Hall Booking</h1>
      <div className="flex space-x-4">
        <Link to="/login" className="px-6 py-3 bg-blue-500 text-white rounded-lg">Login</Link>
        <Link to="/signup" className="px-6 py-3 bg-green-500 text-white rounded-lg">Sign Up</Link>
      </div>
    </div>
  );
};

export default HomePage;

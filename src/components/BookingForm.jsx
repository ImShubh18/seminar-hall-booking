import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebase/firebase';

const BookingForm = ({ hall }) => {
  const [bookingData, setBookingData] = useState({
    hallName: hall.name,
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
    approvalRequest: 'pending',
    department: '',
    facultyName: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the faculty’s department and name from their user document
  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setBookingData(prev => ({
          ...prev,
          department: data.department || '',
          facultyName: data.name || ''
        }));
      }
    };
    fetchUserInfo();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { department, facultyName } = bookingData;
    if (!department || !facultyName) {
      setError('Missing department or faculty name.');
      return;
    }
    try {
      await addDoc(collection(firestore, 'bookingRequests'), {
        ...bookingData,
        facultyUid: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Submission failed.');
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 12l-4 4-2-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-xl font-bold">Form Submitted!</h2>
          <p>Your request is pending approval.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-4 rounded shadow">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="mb-4">
        <label className="block font-semibold">Hall</label>
        <input value={bookingData.hallName} readOnly className="w-full p-2 border rounded bg-gray-200" />
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Department</label>
        <input value={bookingData.department} readOnly className="w-full p-2 border rounded bg-gray-200" />
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Faculty</label>
        <input value={bookingData.facultyName} readOnly className="w-full p-2 border rounded bg-gray-200" />
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Date</label>
        <input type="date" name="date" onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold">Start Time</label>
          <input type="time" name="startTime" onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <div className="flex-1">
          <label className="block font-semibold">End Time</label>
          <input type="time" name="endTime" onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Reason</label>
        <textarea name="reason" onChange={handleChange} required className="w-full p-2 border rounded" />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Submit Booking</button>
    </form>
  );
};

export default BookingForm;

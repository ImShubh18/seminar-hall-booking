// src/components/EventDetailsForm.jsx
import React, { useState } from 'react';

const EventDetailsForm = () => {
  const [detailsData, setDetailsData] = useState({
    script: '',
    poster: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setDetailsData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement your event details submission logic (e.g., file upload, saving script)
    console.log("Event details submitted:", detailsData);
    // Optionally reset the form after submission
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <div className="mb-4">
        <label className="block font-semibold">Event Script</label>
        <textarea
          name="script"
          value={detailsData.script}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Upload Event Poster</label>
        <input
          type="file"
          name="poster"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Submit Event Details
      </button>
    </form>
  );
};

export default EventDetailsForm;

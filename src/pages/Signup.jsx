import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Loader from '../components/Loader';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    email: "",
    role: "",
    department: "",
    hall: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const halls = [
    "LRDC Hall",
    "Seminar Hall",
    "Architecture Hall"
  ];

  const departments = [
    "Computer Engineering",
    "Information Technology",
    "Electronics and Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Computer Science (AIML)"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Build user object with either department or hall
      const extra = formData.role === "hallmanager"
        ? { hall: formData.hall }
        : { department: formData.department };

      await setDoc(doc(firestore, "users", user.uid), {
        name: formData.name,
        college: formData.college,
        email: formData.email,
        role: formData.role,
        ...extra,
        uid: user.uid
      });

      navigate('/login');
    } catch (error) {
      console.error("Error signing up:", error);
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already in use. Please use a different email or log in instead.");
        navigate('/login');
      } else {
        alert("Error signing up. Please try again.");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          required
        >
          <option value="">Select Role</option>
          <option value="faculty">Faculty</option>
          <option value="hod">HOD</option>
          <option value="student">Student</option>
          <option value="hallmanager">Hall Manager</option>
        </select>

        {/* Conditional field: Department or Hall */}
        {formData.role === "hallmanager" ? (
          <select
            name="hall"
            value={formData.hall}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            required
          >
            <option value="">Select Hall</option>
            {halls.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        ) : (
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            required
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 text-white py-2 rounded flex items-center justify-center"
        >
          {isLoading ? <Loader /> : "Sign Up"}
        </button>

        <p className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;

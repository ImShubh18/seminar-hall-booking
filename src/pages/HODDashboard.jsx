import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  setDoc
} from "firebase/firestore";
import { firestore, auth } from "../firebase/firebase";

import HODSidebar from "../components/HODSidebar";
import BookingForm from "../components/BookingForm";
import EventDetailsForm from "../components/EventDetailsForm";
import CalendarView from "../components/CalendarView";
import Notifications from "../components/Notification"; // Import Notifications component

const HODDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const [hodDept, setHodDept] = useState("");
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loadingDept, setLoadingDept] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const navigate = useNavigate();

  // For Calendar view: dropdown state for hall selection
  const [calendarHall, setCalendarHall] = useState("");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);

  // For Booking window: state for selected booking hall
  const [selectedBookingHall, setSelectedBookingHall] = useState(null);

  // List of halls (can be updated/modified as needed)
  const halls = [
    { id: "hall1", name: "Seminar Hall", location: "Building 9, Floor 4" },
    { id: "hall2", name: "LRDC Hall", location: "Building 9, Floor 5" },
    { id: "hall3", name: "Architecture Hall", location: "Building 3, Floor 5" },
  ];

  // 1. Fetch HOD's department
  useEffect(() => {
    const fetchDept = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user");
        setLoadingDept(false);
        return;
      }
      try {
        const snap = await getDoc(doc(firestore, "users", user.uid));
        if (snap.exists()) {
          const dept = snap.data().department || "";
          console.log("Fetched HOD dept:", dept);
          setHodDept(dept);
        } else {
          console.error("HOD user document not found");
        }
      } catch (err) {
        console.error("Error fetching HOD department:", err);
      } finally {
        setLoadingDept(false);
      }
    };
    fetchDept();
  }, []);

  // 2. Listen for booking requests once dept is known
  useEffect(() => {
    if (loadingDept) return;
    if (!hodDept) {
      console.warn("No department found; skipping requests fetch");
      setLoadingRequests(false);
      return;
    }
    console.log("Listening for requests in department:", hodDept);
    const q = query(
      collection(firestore, "bookingRequests"),
      where("approvalRequest", "==", "pending"),
      where("department", "==", hodDept)
    );
    const unsubscribe = onSnapshot(
      q,
      async (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.log("Raw bookingRequests:", docs);
        // Enrich with facultyName
        const enriched = await Promise.all(
          docs.map(async (req) => {
            if (req.facultyUid) {
              const facSnap = await getDoc(doc(firestore, "users", req.facultyUid));
              return {
                ...req,
                facultyName: facSnap.exists() ? facSnap.data().name : "Unknown",
              };
            }
            return { ...req, facultyName: "Unknown" };
          })
        );
        console.log("Enriched bookingRequests:", enriched);
        setBookingRequests(enriched);
        setLoadingRequests(false);
      },
      (err) => {
        console.error("Error listening for bookingRequests:", err);
        setLoadingRequests(false);
      }
    );
    return () => unsubscribe();
  }, [loadingDept, hodDept]);

  const handleBookHall = async (hallName, date, startTime, endTime) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      // Create a new booking request
      const requestData = {
        hallName,
        department: hodDept,
        date,
        startTime,
        endTime,
        facultyUid: user.uid,
        approvalRequest: "pending", // Hall Manager will approve
        facultyName: user.displayName || "Unknown",
      };
      const docRef = await addDoc(collection(firestore, "bookingRequests"), requestData);
      console.log("New booking request created with ID:", docRef.id);
    } catch (err) {
      console.error("Error creating booking request:", err);
    }
  };

  // Fetch approved events for the selected calendar hall (only approved_by_hallmanager)
  useEffect(() => {
    if (!calendarHall) return;
    setLoadingCalendar(true);
    const q = query(
      collection(firestore, "bookingRequestsHistory"),
      where("hallName", "==", calendarHall),
      where("approvalRequest", "==", "approved_by_hallmanager")
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setCalendarEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoadingCalendar(false);
      },
      (error) => {
        console.error("Error fetching calendar events:", error);
        setLoadingCalendar(false);
      }
    );
    return () => unsub();
  }, [calendarHall]);

  // Set default calendar hall if not already set
  useEffect(() => {
    if (halls.length > 0 && !calendarHall) {
      setCalendarHall(halls[0].name);
    }
  }, [halls, calendarHall]);

  if (loadingDept) {
    return <div className="p-4">Loading department...</div>;
  }

  return (
    <div className="flex">
      <HODSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex flex-col flex-1 ml-64">
        <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 shadow">
          <h1 className="text-xl font-bold">HOD Dashboard</h1>
        </header>

        <main className="p-4">
          <div className="max-w-7xl mx-auto">
            {activeTab === "requests" && (
              <>
                <h2 className="text-2xl font-bold mb-4">Booking Requests</h2>
                {loadingRequests ? (
                  <p>Loading requests...</p>
                ) : bookingRequests.length === 0 ? (
                  <p className="text-gray-700">No booking requests for your department.</p>
                ) : (
                  <div className="space-y-4">
                    {bookingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 bg-white rounded-md shadow flex justify-between"
                      >
                        <div>
                          <p><strong>Faculty:</strong> {req.facultyName}</p>
                          <p><strong>Department:</strong> {req.department}</p>
                          <p><strong>Hall:</strong> {req.hallName}</p>
                          <p><strong>Date:</strong> {req.date}</p>
                          <p>
                            <strong>Time:</strong> {req.startTime} - {req.endTime}
                          </p>
                          <p>
                            <strong>Status:</strong> {req.approvalRequest}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "booking" && (
              <>
                <h2 className="text-2xl font-bold mb-4">Book a Hall</h2>
                {/* Centered buttons for hall selection */}
                <div className="mb-4 flex justify-center space-x-4">
                  {halls.map((hall) => (
                    <button
                      key={hall.id}
                      onClick={() => setSelectedBookingHall(hall)}
                      className={`px-4 py-2 rounded ${
                        selectedBookingHall?.name === hall.name
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {hall.name} <br /> {hall.location}
                    </button>
                  ))}
                </div>
                {selectedBookingHall ? (
                  <BookingForm
                    hall={selectedBookingHall}
                    department={hodDept}
                    onBook={handleBookHall}
                  />
                ) : (
                  <p className="text-gray-700">Please select a hall to book.</p>
                )}
              </>
            )}

            {activeTab === "event" && (
              <>
                <h2 className="text-2xl font-bold mb-4">Event Details</h2>
                <EventDetailsForm />
              </>
            )}

            {activeTab === "calendar" && (
              <>
                <h2 className="text-2xl font-bold mb-4">Calendar</h2>
                {/* Centered dropdown for hall selection */}
                <div className="mb-4 flex justify-center">
                  <select
                    value={calendarHall}
                    onChange={(e) => setCalendarHall(e.target.value)}
                    className="p-2 border rounded"
                  >
                    {halls.map((hall) => (
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
              </>
            )}

            {activeTab === "notifications" && (
              <>
                <h2 className="text-2xl font-bold mb-4">Notifications</h2>
                <Notifications />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HODDashboard;

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { firestore, auth } from "../firebase/firebase";

import HallManagerSidebar from "../components/HallManagerSidebar";
import CalendarView from "../components/CalendarView";

const HallManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests"); // main tabs
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]); // To store only approved events for calendar
  const [hallName, setHallName] = useState("");
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const navigate = useNavigate();

  // Fetch assigned hall for Hall Manager
  useEffect(() => {
    const fetchHall = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(firestore, "users", user.uid));
      if (snap.exists()) {
        const userData = snap.data();
        setHallName(userData.hall || "");
      }
    };
    fetchHall();
  }, []);

  // Listen for pending booking requests for this hall
  useEffect(() => {
    if (!hallName) return;
    setLoadingRequests(true);
    const q = query(
      collection(firestore, "bookingRequests"),
      where("hallName", "==", hallName),
      where("approvalRequest", "==", "pending")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingRequests(false);
      },
      (err) => {
        console.error(err);
        setLoadingRequests(false);
      }
    );
    return () => unsub();
  }, [hallName]);

  // Listen for booking history of this hall (both approved and cancelled)
  useEffect(() => {
    if (!hallName) return;
    setLoadingHistory(true);
    const q = query(
      collection(firestore, "bookingRequestsHistory"),
      where("hallName", "==", hallName),
      where("approvalRequest", "in", ["approved_by_hallmanager", "cancelled"])
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingHistory(false);
      },
      (err) => {
        console.error(err);
        setLoadingHistory(false);
      }
    );
    return () => unsub();
  }, [hallName]);

  // Listen specifically for approved events for the calendar
  useEffect(() => {
    if (!hallName) return;
    setLoadingEvents(true);
    const q = query(
      collection(firestore, "bookingRequestsHistory"),
      where("hallName", "==", hallName),
      where("approvalRequest", "==", "approved_by_hallmanager")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setApprovedEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingEvents(false);
      },
      (err) => {
        console.error(err);
        setLoadingEvents(false);
      }
    );
    return () => unsub();
  }, [hallName]);

  // Update request status and save it to history
  const handleUpdate = async (id, newStatus, facultyUid, department) => {
    try {
      const requestRef = doc(firestore, "bookingRequests", id);
      const requestSnapshot = await getDoc(requestRef);
      const requestData = requestSnapshot.data();

      // Move the request to history collection with the updated status
      const historyRef = doc(firestore, "bookingRequestsHistory", id);
      await setDoc(historyRef, { ...requestData, approvalRequest: newStatus });

      // Update the request status in the original collection
      await updateDoc(requestRef, { approvalRequest: newStatus });

      // Send notifications to Faculty and HOD
      await sendNotification(
        facultyUid,
        "Your booking request has been " +
          (newStatus === "approved_by_hallmanager" ? "approved" : "rejected"),
        id
      );
      await sendNotification(
        department,
        "A booking request for your department has been " +
          (newStatus === "approved_by_hallmanager" ? "approved" : "rejected"),
        id
      );

      console.log(`Request ${id} updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating request:", err);
    }
  };

  // Send notification to a recipient
  const sendNotification = async (recipientUid, message, requestId) => {
    const notificationRef = collection(firestore, "notifications");
    const notificationDoc = {
      recipientUid: recipientUid,
      message: message,
      timestamp: new Date(),
      requestId: requestId,
    };
    await setDoc(doc(notificationRef), notificationDoc);
  };

  return (
    <div className="flex h-screen">
      <HallManagerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 ml-64 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Hall Manager Dashboard</h1>

        {activeTab === "requests" && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Pending Booking Requests</h2>
            {loadingRequests ? (
              <p>Loading requests...</p>
            ) : requests.length === 0 ? (
              <p>No pending requests for your hall.</p>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white p-4 rounded shadow flex justify-between"
                  >
                    <div>
                      <p>
                        <strong>Faculty:</strong> {req.facultyName}
                      </p>
                      <p>
                        <strong>Hall:</strong> {req.hallName}
                      </p>
                      <p>
                        <strong>Date:</strong> {req.date}
                      </p>
                      <p>
                        <strong>Time:</strong> {req.startTime} - {req.endTime}
                      </p>
                      <p>
                        <strong>Status:</strong> {req.approvalRequest}
                      </p>
                    </div>
                    <div className="flex justify-center items-center space-x-4">
                      <button
                        onClick={() =>
                          handleUpdate(
                            req.id,
                            "approved_by_hallmanager",
                            req.facultyUid,
                            req.department
                          )
                        }
                        className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-400 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleUpdate(
                            req.id,
                            "cancelled",
                            req.facultyUid,
                            req.department
                          )
                        }
                        className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-400 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Booking History</h2>
            {loadingHistory ? (
              <p>Loading history...</p>
            ) : history.length === 0 ? (
              <p>No request history for your hall.</p>
            ) : (
              <div className="space-y-4">
                {history.map((req) => (
                  <div key={req.id} className="bg-white p-4 rounded shadow">
                    <p>
                      <strong>Faculty:</strong> {req.facultyName}
                    </p>
                    <p>
                      <strong>Hall:</strong> {req.hallName}
                    </p>
                    <p>
                      <strong>Date:</strong> {req.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {req.startTime} - {req.endTime}
                    </p>
                    <p>
                      <strong>Status:</strong> {req.approvalRequest}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Calendar</h2>
            <CalendarView events={approvedEvents} />
          </div>
        )}

        {activeTab === "event" && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Event Details</h2>
            <div className="p-4 bg-white rounded shadow">
              Event details here.
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h2 className="text-xl font-bold mb-2">Notifications</h2>
            <p>No notifications available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HallManagerDashboard;

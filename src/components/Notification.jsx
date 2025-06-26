import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore, auth } from '../firebase/firebase';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return; // Ensure the user is logged in
    
    // Query the notifications collection for notifications intended for the current user.
    // Adjust the field or use a different filter if you need department-level notifications.
    const q = query(
      collection(firestore, 'notifications'),
      where('recipientUid', '==', currentUser.uid)
    );
    
    const unsub = onSnapshot(q, snapshot => {
      // Log retrieved notifications for debugging
      console.log("Fetched notifications:", snapshot.docs.map(doc => doc.data()));
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, error => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });
    
    return () => unsub();
  }, []);
  
  if (loading) return <p>Loading notifications...</p>;
  if (notifications.length === 0) return <p>No notifications available.</p>;
  
  return (
    <div className="notifications">
      <h2 className="text-xl font-bold">Notifications</h2>
      <ul>
        {notifications.map(note => (
          <li key={note.id} className="p-3 bg-gray-100 rounded-md shadow mb-2">
            {note.message} <br />
            <small>{new Date(note.timestamp.seconds * 1000).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAdPuQGHTSRDvipjS83ftQLjVaQCBA2jbI",
    authDomain: "seminar-hall-booking-1892c.firebaseapp.com",
    projectId: "seminar-hall-booking-1892c",
    storageBucket: "seminar-hall-booking-1892c.firebasestorage.app",
    messagingSenderId: "346170529410",
    appId: "1:346170529410:web:e462108acdadab7111869b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };

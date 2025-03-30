// app/page.tsx
"use client"; // needed since we use client-side Firebase SDK

import { useState, useEffect } from "react";
import { signInWithGoogle, logout } from "../lib/auth";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, firestore } from "../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [newItem, setNewItem] = useState("");

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Function to handle sign in
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    }
  };

  // Function to handle sign out
  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  // Function to add an item to Firestore
  const addItem = async () => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(firestore, "items"), {
        uid: user.uid,
        text: newItem,
        createdAt: new Date(),
      });
      console.log("Document written with ID: ", docRef.id);
      setNewItem("");
      fetchItems();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Function to fetch items from Firestore
  const fetchItems = async () => {
    if (!user) return;
    try {
      const querySnapshot = await getDocs(collection(firestore, "items"));
      const items: any[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setData(items);
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  };

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.displayName}</p>
          <button onClick={handleSignOut}>Sign Out</button>
          <hr />
          <h2>Add a new item</h2>
          <input
            type="text"
            placeholder="Type something..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button onClick={addItem}>Add Item</button>
          <hr />
          <h2>Items from Firestore</h2>
          <button onClick={fetchItems}>Fetch Items</button>
          <ul>
            {data.map((item) => (
              <li key={item.id}>
                {item.text} - {item.uid}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p>Please sign in to get started.</p>
          <button onClick={handleSignIn}>Sign In with Google</button>
        </>
      )}
    </div>
  );
}

// app/page.tsx
"use client"; // required for client-side Firebase SDK usage

import { useState, useEffect } from "react";
import { signInWithGoogle, logout } from "../lib/auth";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, firestore } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (usr) {
        fetchItems(usr.uid);
      } else {
        setItems([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Helper: get reference to the user's items subcollection
  const userItemsCollection = (uid: string) =>
    collection(firestore, "users", uid, "items");

  // Create: Add an item for the current user
  const addItem = async () => {
    if (!user) return;
    try {
      await addDoc(userItemsCollection(user.uid), {
        text: newItem,
        createdAt: new Date(),
      });
      setNewItem("");
      fetchItems(user.uid);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Read: Fetch items for the current user
  const fetchItems = async (uid: string) => {
    try {
      const querySnapshot = await getDocs(userItemsCollection(uid));
      const fetchedItems: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() });
      });
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  };

  // Update: Update an existing item
  const updateItem = async (id: string) => {
    if (!user) return;
    try {
      const docRef = doc(firestore, "users", user.uid, "items", id);
      await updateDoc(docRef, { text: editText });
      setEditId(null);
      setEditText("");
      fetchItems(user.uid);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Delete: Remove an item
  const deleteItem = async (id: string) => {
    if (!user) return;
    try {
      const docRef = doc(firestore, "users", user.uid, "items", id);
      await deleteDoc(docRef);
      fetchItems(user.uid);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
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
          <h2>Your Items</h2>
          <ul>
            {items.map((item) => (
              <li key={item.id} style={{ marginBottom: "1rem" }}>
                {editId === item.id ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <button onClick={() => updateItem(item.id)}>Save</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span>{item.text}</span>{" "}
                    <button onClick={() => {
                      setEditId(item.id);
                      setEditText(item.text);
                    }}>Edit</button>
                    <button onClick={() => deleteItem(item.id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p>Please sign in to access your data.</p>
          <button onClick={handleSignIn}>Sign In with Google</button>
        </>
      )}
    </div>
  );
}

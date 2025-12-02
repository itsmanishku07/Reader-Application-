import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Book, BookUpdate } from "../types";

const booksCollection = collection(db, "books");

// Create a new book
export const addBook = async (
  title: string,
  content: string,
  userId: string
): Promise<string | null> => {
  try {
    const docRef = await addDoc(booksCollection, {
      userId,
      title,
      content,
      createdAt: serverTimestamp(),
      lastAccessed: serverTimestamp(),
      currentPage: 0,
      settings: {
        fontSize: 16,
        theme: "indigo",
        animation: "slide",
      },
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
};

// Get all books for a user
export const getBooks = async (userId: string): Promise<Book[]> => {
  const q = query(booksCollection, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      lastAccessed: (data.lastAccessed as Timestamp)?.toDate(),
    } as Book;
  });
};

// Get a single book
export const getBook = async (id: string): Promise<Book | null> => {
  const docRef = doc(db, "books", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Ensure settings are not undefined
    const settings = data.settings || {};
    return {
      id: docSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      lastAccessed: (data.lastAccessed as Timestamp)?.toDate(),
      settings: {
        fontSize: settings.fontSize || 16,
        theme: settings.theme || "indigo",
        animation: settings.animation || "slide",
      },
    } as Book;
  } else {
    return null;
  }
};

// Update a book
export const updateBook = async (id: string, data: BookUpdate): Promise<void> => {
  const docRef = doc(db, "books", id);
  await updateDoc(docRef, {
    ...data,
    lastAccessed: serverTimestamp()
  });
};

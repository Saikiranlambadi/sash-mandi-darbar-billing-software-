import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

const CONFIG_KEY = "rb_firebase_config";

export function getFirebaseConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse firebase config", e);
  }

  if (import.meta.env?.VITE_FIREBASE_API_KEY && import.meta.env?.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
    };
  }
  return null;
}

export function saveFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem(CONFIG_KEY);
    dbInstance = null;
    return;
  }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  dbInstance = null;
}

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;
  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) return null;
  try {
    const app = getApps().length ? getApp() : initializeApp(config);
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (err) {
    console.error("Firebase initialization failed:", err);
    return null;
  }
}

export function isCloudSyncEnabled() {
  return !!getDb();
}

/**
 * Real-time listener for any collection (bills, items, categories).
 * Automatically notifies callback whenever any mobile or desktop device updates data.
 */
export function subscribeCollection(colName, callback, orderField = null, orderDir = "desc") {
  const db = getDb();
  if (!db) return () => {};

  try {
    const colRef = collection(db, colName);
    const q = orderField ? query(colRef, orderBy(orderField, orderDir)) : colRef;
    
    return onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(docSnap => {
        data.push({ ...docSnap.data(), _id: docSnap.id });
      });
      callback(data);
    }, (err) => {
      console.warn(`Firestore subscription error on ${colName}:`, err);
    });
  } catch (err) {
    console.warn(`Failed to subscribe to ${colName}:`, err);
    return () => {};
  }
}

export async function uploadDoc(colName, docId, data) {
  const db = getDb();
  if (!db) return false;
  try {
    await setDoc(doc(db, colName, String(docId)), data, { merge: true });
    return true;
  } catch (err) {
    console.error(`Failed to upload ${colName}/${docId}:`, err);
    return false;
  }
}

export async function removeDoc(colName, docId) {
  const db = getDb();
  if (!db) return false;
  try {
    await deleteDoc(doc(db, colName, String(docId)));
    return true;
  } catch (err) {
    console.error(`Failed to delete ${colName}/${docId}:`, err);
    return false;
  }
}

export async function fetchCollection(colName) {
  const db = getDb();
  if (!db) return null;
  try {
    const snapshot = await getDocs(collection(db, colName));
    const items = [];
    snapshot.forEach(docSnap => {
      items.push({ ...docSnap.data(), _id: docSnap.id });
    });
    return items;
  } catch (err) {
    console.error(`Failed to fetch ${colName}:`, err);
    return null;
  }
}

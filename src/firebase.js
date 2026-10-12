import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { DEFAULT_FIREBASE_CONFIG } from "./firebase-config";

const CONFIG_KEY = "rb_firebase_config";
const DEVICE_KEY = "rb_device_name";

// Check if a Firebase config was passed via URL parameters (?fb_config=...)
(() => {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const fbParam = params.get("fb_config");
    if (fbParam) {
      const decoded = JSON.parse(decodeURIComponent(fbParam));
      if (decoded && decoded.apiKey && decoded.projectId) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(decoded));
        // Remove param from address bar cleanly without refreshing
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  } catch (e) {
    console.warn("Failed to parse fb_config from URL parameter:", e);
  }
})();

export function getDeviceName() {
  try {
    return localStorage.getItem(DEVICE_KEY) || "Staff Phone";
  } catch {
    return "Staff Phone";
  }
}

export function setDeviceName(name) {
  try {
    if (name && name.trim()) {
      localStorage.setItem(DEVICE_KEY, name.trim());
      window.dispatchEvent(new CustomEvent("rb_device_name_changed", { detail: name.trim() }));
    }
  } catch (e) {
    console.error("Failed to save device name:", e);
  }
}

export function getFirebaseConfig() {
  // 1. Check local storage
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.apiKey && parsed?.projectId) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse firebase config from localStorage", e);
  }

  // 2. Check bundled default config from firebase-config.js
  if (DEFAULT_FIREBASE_CONFIG?.apiKey && DEFAULT_FIREBASE_CONFIG?.projectId) {
    return DEFAULT_FIREBASE_CONFIG;
  }

  // 3. Check Vite environment variables
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

export function generateShareableConfigUrl() {
  const config = getFirebaseConfig();
  if (!config) return null;
  const encoded = encodeURIComponent(JSON.stringify(config));
  const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
  return `${base}?fb_config=${encoded}`;
}

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;
  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) return null;
  try {
    const app = getApps().length ? getApp() : initializeApp(config);
    try {
      dbInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch {
      // Fallback if multi-tab or persistent cache is already active or unsupported
      dbInstance = getFirestore(app);
    }
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

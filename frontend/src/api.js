// Client-side & Cloud Sync API wrapper for Restaurant Billing POS
import {
  getDb,
  isCloudSyncEnabled,
  subscribeCollection,
  uploadDoc,
  removeDoc,
  fetchCollection,
  getFirebaseConfig,
  saveFirebaseConfig,
  generateShareableConfigUrl,
  getDeviceName,
  setDeviceName
} from "./firebase";

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Chicken Fry Mandi" },
  { id: 2, name: "Chicken Broasted Mandi" },
  { id: 3, name: "Mutton Juicy Mandi" },
  { id: 4, name: "Fish Fry Mandi" }
];

const CATEGORY_IMAGE_MAP = {
  1: "/images/Chicken Fry Mandi (1 Piece).png",
  2: "/images/Chicken Broasted Mandi.png",
  3: "/images/Mutton Juicy Mandi.png",
  4: "/images/Fish Fry Mandi Full.png"
};

const LOCAL_IMAGES = {
  "Chicken Fry Mandi (1 Piece)": "/images/Chicken Fry Mandi (1 Piece).png",
  "Chicken Fry Mandi (2 Piece)": "/images/Chicken Fry Mandi (2 Piece).png",
  "Chicken Fry Mandi (3 Piece)": "/images/Chicken Fry Mandi (3 Piece).png",
  "Chicken Fry Mandi (4 Piece)": "/images/Chicken Fry Mandi (4 Piece).png",
  "Chicken Broasted Mandi (1 Piece)": "/images/Chicken Broasted Mandi.png",
  "Chicken Broasted Mandi (2 Piece)": "/images/Chicken Broasted Mandi.png",
  "Chicken Broasted Mandi (3 Piece)": "/images/Chicken Broasted Mandi.png",
  "Chicken Broasted Mandi (4 Piece)": "/images/Chicken Broasted Mandi.png",
  "Mutton Juicy Mandi (1 Piece)": "/images/Mutton Juicy Mandi.png",
  "Mutton Juicy Mandi (2 Piece)": "/images/Mutton Juicy Mandi.png",
  "Mutton Juicy Mandi (3 Piece)": "/images/Mutton Juicy Mandi.png",
  "Mutton Juicy Mandi (4 Piece)": "/images/Mutton Juicy Mandi.png",
  "Fish Fry Mandi Full (2 Person)": "/images/Fish Fry Mandi Full.png",
  "Fish Fry Mandi Full (3 Person)": "/images/Fish Fry Mandi Full.png",
  "Fish Fry Mandi Full (4 Person)": "/images/Fish Fry Mandi Full.png",
  "Chicken Fry Extra Piece": "/images/Chicken Fry Extra Piece.png",
  "Chicken Broasted Extra Piece": "/images/Chicken Broasted Extra Piece.png",
  "Extra Mandi Rice": "/images/extra_mandi_rice.jpg",
  "Mayonnaise": "/images/mayoness.png",
  "Thumsup": "/images/thumsup.png",
  "Water Bottle": "/images/water_bottle.jpg",
  "Sweet Basundi": "/images/basundi.png",
  // New images
  "Chicken Biryani": "/images/chicken_biryani.jpg",
  "Shawarma": "/images/shawarma.jpg",
  "Sweets": "/images/sweets.jpg",
  "Drinks": "/images/drinks.jpg"
};

export function getItemImage(item) {
  const name = (item?.name || "");
  
  if (LOCAL_IMAGES[name]) {
    return LOCAL_IMAGES[name];
  }

  const lowerName = name.toLowerCase();
  if (lowerName.includes("chicken fry mandi") || lowerName.includes("chicken fry")) return LOCAL_IMAGES["Chicken Fry Mandi (1 Piece)"];
  if (lowerName.includes("broast")) return LOCAL_IMAGES["Chicken Broasted Mandi (1 Piece)"];
  if (lowerName.includes("mutton")) return LOCAL_IMAGES["Mutton Juicy Mandi (1 Piece)"];
  if (lowerName.includes("fish")) return LOCAL_IMAGES["Fish Fry Mandi Full (2 Person)"];
  if (lowerName.includes("mayo")) return LOCAL_IMAGES["Mayonnaise"];
  if (lowerName.includes("rice")) return LOCAL_IMAGES["Extra Mandi Rice"];
  if (lowerName.includes("thums")) return LOCAL_IMAGES["Thumsup"];
  if (lowerName.includes("water")) return LOCAL_IMAGES["Water Bottle"];
  if (lowerName.includes("basundi")) return LOCAL_IMAGES["Sweet Basundi"];
  if (lowerName.includes("biryani")) return LOCAL_IMAGES["Chicken Biryani"];
  if (lowerName.includes("shawarma")) return LOCAL_IMAGES["Shawarma"];
  if (lowerName.includes("sweet") || lowerName.includes("dessert") || lowerName.includes("gulab") || lowerName.includes("ladoo") || lowerName.includes("barfi") || lowerName.includes("jalebi")) return LOCAL_IMAGES["Sweets"];
  if (lowerName.includes("drink") || lowerName.includes("pepsi") || lowerName.includes("juice") || lowerName.includes("soda") || lowerName.includes("cola") || lowerName.includes("beverage")) return LOCAL_IMAGES["Drinks"];
  
  if (item && item.image && item.image.trim() !== "" && !item.image.includes("unsplash.com")) {
    return item.image;
  }
  
  return LOCAL_IMAGES["Chicken Fry Mandi (1 Piece)"];
}

const DEFAULT_ITEMS = [
  { id: 1, name: "Chicken Fry Mandi (1 Piece)", category_id: 1, price: 260, available: 1, image: CATEGORY_IMAGE_MAP[1] },
  { id: 2, name: "Chicken Fry Mandi (2 Piece)", category_id: 1, price: 470, available: 1, image: CATEGORY_IMAGE_MAP[1] },
  { id: 3, name: "Chicken Fry Mandi (3 Piece)", category_id: 1, price: 630, available: 1, image: CATEGORY_IMAGE_MAP[1] },
  { id: 4, name: "Chicken Fry Mandi (4 Piece)", category_id: 1, price: 840, available: 1, image: CATEGORY_IMAGE_MAP[1] },
  { id: 5, name: "Chicken Broasted Mandi (1 Piece)", category_id: 2, price: 290, available: 1, image: CATEGORY_IMAGE_MAP[2] },
  { id: 6, name: "Chicken Broasted Mandi (2 Piece)", category_id: 2, price: 530, available: 1, image: CATEGORY_IMAGE_MAP[2] },
  { id: 7, name: "Chicken Broasted Mandi (3 Piece)", category_id: 2, price: 720, available: 1, image: CATEGORY_IMAGE_MAP[2] },
  { id: 8, name: "Chicken Broasted Mandi (4 Piece)", category_id: 2, price: 960, available: 1, image: CATEGORY_IMAGE_MAP[2] },
  { id: 9, name: "Mutton Juicy Mandi (1 Piece)", category_id: 3, price: 320, available: 1, image: CATEGORY_IMAGE_MAP[3] },
  { id: 10, name: "Mutton Juicy Mandi (2 Piece)", category_id: 3, price: 600, available: 1, image: CATEGORY_IMAGE_MAP[3] },
  { id: 11, name: "Mutton Juicy Mandi (3 Piece)", category_id: 3, price: 870, available: 1, image: CATEGORY_IMAGE_MAP[3] },
  { id: 12, name: "Mutton Juicy Mandi (4 Piece)", category_id: 3, price: 1140, available: 1, image: CATEGORY_IMAGE_MAP[3] },
  { id: 13, name: "Fish Fry Mandi Full (2 Person)", category_id: 4, price: 500, available: 1, image: CATEGORY_IMAGE_MAP[4] },
  { id: 14, name: "Fish Fry Mandi Full (3 Person)", category_id: 4, price: 680, available: 1, image: CATEGORY_IMAGE_MAP[4] },
  { id: 15, name: "Fish Fry Mandi Full (4 Person)", category_id: 4, price: 900, available: 1, image: CATEGORY_IMAGE_MAP[4] }
];

const DEFAULT_SETTINGS = {
  restaurant_name: "SASH MANDI DARBAR",
  address: "Main Road, above Exide Battery showroom, Near Govt. Hospital, Yellandu, Khammam, Telangana",
  phone: "9652718363",
  paper_size: "58mm"
};

function getStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

// Seed initial local data
(() => {
  const CATS_VER = 2;
  const currentCatsVer = getStorage("rb_categories_ver", 0);
  if (currentCatsVer < CATS_VER) {
    setStorage("rb_categories", DEFAULT_CATEGORIES);
    setStorage("rb_categories_ver", CATS_VER);
  }

  const ITEMS_VER = 2;
  const currentItems = getStorage("rb_items", []);
  const currentItemsVer = getStorage("rb_items_ver", 0);
  
  if (!currentItems.length || currentItemsVer < ITEMS_VER) {
    const mergedItems = [...DEFAULT_ITEMS];
    let maxId = mergedItems.length ? Math.max(...mergedItems.map(x => x.id)) : 0;
    
    currentItems.forEach(item => {
      if (!mergedItems.some(mi => mi.name.toLowerCase() === item.name.toLowerCase())) {
        maxId += 1;
        mergedItems.push({ ...item, id: maxId });
      }
    });
    setStorage("rb_items", mergedItems);
    setStorage("rb_items_ver", ITEMS_VER);
  }

  const SETTINGS_VER = 2;
  const existingSettings = getStorage("rb_settings", {});
  if ((existingSettings._ver || 0) < SETTINGS_VER) {
    const updated = {
      ...existingSettings,
      restaurant_name: DEFAULT_SETTINGS.restaurant_name,
      address:         DEFAULT_SETTINGS.address,
      phone:           DEFAULT_SETTINGS.phone,
      paper_size:      existingSettings.paper_size || DEFAULT_SETTINGS.paper_size,
      _ver:            SETTINGS_VER,
    };
    setStorage("rb_settings", updated);
  }
  if (!localStorage.getItem("rb_bills")) {
    setStorage("rb_bills", []);
  }
})();

// Real-Time Multi-Device Sync Subscriptions
let unsubs = [];
let initialSyncDone = false;

export function setupRealtimeSync() {
  unsubs.forEach(unsub => unsub && unsub());
  unsubs = [];

  if (!isCloudSyncEnabled()) return;

  // Real-time listener for bills
  const billsUnsub = subscribeCollection("bills", (remoteBills) => {
    if (!remoteBills) return;
    const localBills = getStorage("rb_bills", []);
    const localMap = new Map();
    localBills.forEach(b => { if (b.bill_no) localMap.set(b.bill_no, b); });

    // Detect new bills generated from other staff phones for real-time notification
    if (initialSyncDone) {
      remoteBills.forEach(rb => {
        if (rb.bill_no && !localMap.has(rb.bill_no)) {
          // Bill was created on another device!
          window.dispatchEvent(new CustomEvent("rb_new_bill_notification", { detail: rb }));
        }
      });
    }

    // Remote Firestore is the authoritative source of truth for the shared shop
    const map = new Map();
    remoteBills.forEach(b => { if (b.bill_no) map.set(b.bill_no, b); });

    // Also preserve any un-uploaded local pending bills
    localBills.forEach(b => {
      if (b.bill_no && !map.has(b.bill_no) && b._pendingSync) {
        map.set(b.bill_no, b);
      }
    });

    const merged = Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setStorage("rb_bills", merged);
    initialSyncDone = true;
    window.dispatchEvent(new CustomEvent("rb_bills_synced", { detail: merged }));
  }, "created_at", "desc");
  unsubs.push(billsUnsub);

  // Real-time listener for items
  const itemsUnsub = subscribeCollection("items", (remoteItems) => {
    if (!remoteItems || !remoteItems.length) return;
    setStorage("rb_items", remoteItems);
    window.dispatchEvent(new CustomEvent("rb_items_synced", { detail: remoteItems }));
  });
  unsubs.push(itemsUnsub);

  // Real-time listener for categories
  const catsUnsub = subscribeCollection("categories", (remoteCats) => {
    if (!remoteCats || !remoteCats.length) return;
    setStorage("rb_categories", remoteCats);
    window.dispatchEvent(new CustomEvent("rb_categories_synced", { detail: remoteCats }));
  });
  unsubs.push(catsUnsub);

  // Real-time listener for settings
  const settingsUnsub = subscribeCollection("settings", (remoteSettingsList) => {
    if (!remoteSettingsList || !remoteSettingsList.length) return;
    const general = remoteSettingsList.find(s => s._id === "general" || s.restaurant_name);
    if (general) {
      setStorage("rb_settings", general);
      window.dispatchEvent(new CustomEvent("rb_settings_synced", { detail: general }));
    }
  });
  unsubs.push(settingsUnsub);

  // Auto-seed cloud database if completely empty
  autoSeedCloudIfEmpty();
}

async function autoSeedCloudIfEmpty() {
  if (!isCloudSyncEnabled()) return;
  try {
    const existing = await fetchCollection("items");
    if (!existing || existing.length === 0) {
      const items = getStorage("rb_items", DEFAULT_ITEMS);
      const categories = getStorage("rb_categories", DEFAULT_CATEGORIES);
      const settings = getStorage("rb_settings", DEFAULT_SETTINGS);

      await uploadDoc("settings", "general", settings);
      for (const c of categories) {
        await uploadDoc("categories", c.id, c);
      }
      for (const i of items) {
        await uploadDoc("items", i.id, i);
      }
    }
  } catch (err) {
    console.warn("Auto-seed cloud check note:", err);
  }
}

// Start listener immediately on load
setupRealtimeSync();

// Categories
export async function getCategories() {
  const local = getStorage("rb_categories", DEFAULT_CATEGORIES);
  if (isCloudSyncEnabled() && (!local || local.length === 0)) {
    try {
      const remote = await fetchCollection("categories");
      if (remote && remote.length) {
        setStorage("rb_categories", remote);
        return remote;
      }
    } catch (e) {
      console.warn("Failed to fetch categories from cloud", e);
    }
  }
  return local;
}

export async function addCategory(name) {
  const categories = await getCategories();
  const nextId = categories.length ? Math.max(...categories.map(c => Number(c.id) || 0)) + 1 : 1;
  const newCat = { id: nextId, name: name.trim() };
  categories.push(newCat);
  setStorage("rb_categories", categories);

  if (isCloudSyncEnabled()) {
    await uploadDoc("categories", newCat.id, newCat);
  }
  return newCat;
}

export async function editCategory(id, name) {
  const categories = await getCategories();
  const idx = categories.findIndex(c => String(c.id) === String(id));
  if (idx !== -1) {
    categories[idx].name = name.trim();
    setStorage("rb_categories", categories);
    if (isCloudSyncEnabled()) {
      await uploadDoc("categories", categories[idx].id, categories[idx]);
    }
    return categories[idx];
  }
  return null;
}

export async function deleteCategory(id) {
  let categories = await getCategories();
  categories = categories.filter(c => String(c.id) !== String(id));
  setStorage("rb_categories", categories);

  if (isCloudSyncEnabled()) {
    await removeDoc("categories", id);
  }
  return { ok: true };
}

// Menu items
export async function getItems() {
  let items = getStorage("rb_items", DEFAULT_ITEMS);
  if (isCloudSyncEnabled() && (!items || items.length === 0)) {
    try {
      const remote = await fetchCollection("items");
      if (remote && remote.length) {
        setStorage("rb_items", remote);
        items = remote;
      }
    } catch (e) {
      console.warn("Failed to fetch items from cloud", e);
    }
  }

  const categories = await getCategories();
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  return items.map(item => {
    const fullItem = {
      ...item,
      category_name: catMap[item.category_id] || ""
    };
    return {
      ...fullItem,
      image: getItemImage(fullItem)
    };
  });
}

export async function addItem(data) {
  const items = getStorage("rb_items", DEFAULT_ITEMS);
  const nextId = items.length ? Math.max(...items.map(i => Number(i.id) || 0)) + 1 : 1;
  const newItem = {
    id: nextId,
    name: data.name.trim(),
    category_id: data.category_id ? Number(data.category_id) : null,
    price: Number(data.price) || 0,
    available: data.available ? 1 : 0,
    image: data.image || ""
  };
  items.push(newItem);
  setStorage("rb_items", items);

  if (isCloudSyncEnabled()) {
    await uploadDoc("items", newItem.id, newItem);
  }
  return newItem;
}

export async function editItem(id, data) {
  const items = getStorage("rb_items", DEFAULT_ITEMS);
  const idx = items.findIndex(i => String(i.id) === String(id));
  if (idx !== -1) {
    items[idx] = {
      ...items[idx],
      name: data.name.trim(),
      category_id: data.category_id ? Number(data.category_id) : null,
      price: Number(data.price) || 0,
      available: data.available ? 1 : 0,
      image: data.image !== undefined ? data.image : items[idx].image
    };
    setStorage("rb_items", items);

    if (isCloudSyncEnabled()) {
      await uploadDoc("items", items[idx].id, items[idx]);
    }
    return items[idx];
  }
  return null;
}

export async function deleteItem(id) {
  let items = getStorage("rb_items", DEFAULT_ITEMS);
  items = items.filter(i => String(i.id) !== String(id));
  setStorage("rb_items", items);

  if (isCloudSyncEnabled()) {
    await removeDoc("items", id);
  }
  return { ok: true };
}

// Restaurant settings
export async function getSettings() {
  const saved = getStorage("rb_settings", DEFAULT_SETTINGS);
  return {
    ...saved,
    restaurant_name: DEFAULT_SETTINGS.restaurant_name,
    address:         DEFAULT_SETTINGS.address,
    phone:           DEFAULT_SETTINGS.phone,
  };
}

export async function saveSettings(data) {
  const current = await getSettings();
  const updated = { ...current, ...data };
  setStorage("rb_settings", updated);

  if (isCloudSyncEnabled()) {
    await uploadDoc("settings", "general", updated);
  }
  return updated;
}

// Create bill (Saved permanently to shared cloud database)
export async function createBill(data) {
  const stamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const bill_no = `B${stamp}-${randomSuffix}`;
  const device = getDeviceName();

  const total = (data.items || []).reduce((acc, item) => acc + (Number(item.price || 0) * (item.quantity || 1)), 0);
  
  const billItems = (data.items || []).map(item => ({
    item_id: item.id,
    item_name: item.name || item.item_name || "Food Item",
    quantity: Number(item.quantity || 1),
    price: Number(item.price || 0),
    amount: Number(item.price || 0) * Number(item.quantity || 1)
  }));

  const newBill = {
    id: Date.now(),
    bill_no,
    total,
    payment_method: typeof data.payment_method === "object" ? "Split" : (data.payment_method || "Cash"),
    cash_amount: Number(data.cash_amount) || 0,
    upi_amount: Number(data.upi_amount) || 0,
    card_amount: Number(data.card_amount) || 0,
    created_at: new Date().toISOString(),
    items: billItems,
    device_name: device
  };

  // Optimistic local update
  const bills = getStorage("rb_bills", []);
  bills.unshift(newBill);
  setStorage("rb_bills", bills);

  // Permanently save to shared cloud database
  if (isCloudSyncEnabled()) {
    try {
      await uploadDoc("bills", newBill.bill_no, newBill);
    } catch (err) {
      console.error("Failed to upload bill immediately:", err);
      // Mark as pending sync
      newBill._pendingSync = true;
      setStorage("rb_bills", bills);
    }
  }

  return newBill;
}

// Get bills
export async function getBills() {
  const local = getStorage("rb_bills", []);
  if (isCloudSyncEnabled() && local.length === 0) {
    try {
      const remote = await fetchCollection("bills");
      if (remote && remote.length) {
        remote.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setStorage("rb_bills", remote);
        return remote;
      }
    } catch (err) {
      console.warn("Failed to fetch initial cloud bills:", err);
    }
  }
  return local;
}

// Get single bill
export async function getBill(id) {
  const bills = await getBills();
  const bill = bills.find(b => String(b.id) === String(id) || String(b.bill_no) === String(id));
  if (!bill) throw new Error("Bill not found");
  return bill;
}

// Delete bill
export async function deleteBill(id) {
  let bills = await getBills();
  const target = bills.find(b => String(b.id) === String(id) || String(b.bill_no) === String(id));
  bills = bills.filter(b => String(b.id) !== String(id) && String(b.bill_no) !== String(id));
  setStorage("rb_bills", bills);

  if (isCloudSyncEnabled() && target?.bill_no) {
    await removeDoc("bills", target.bill_no);
  }
  return { ok: true };
}

// Sales report
export async function getSalesReport() {
  const bills = await getBills();
  const todayStr = new Date().toISOString().slice(0, 10);
  
  const todayBills = bills.filter(b => b.created_at && b.created_at.slice(0, 10) === todayStr);

  const summary = {
    total: 0,
    bills: todayBills.length,
    cash: 0,
    upi: 0,
    card: 0
  };

  const topMap = {};

  todayBills.forEach(b => {
    summary.total += Number(b.total) || 0;
    summary.cash += Number(b.cash_amount) || 0;
    summary.upi += Number(b.upi_amount) || 0;
    summary.card += Number(b.card_amount) || 0;

    (b.items || []).forEach(item => {
      const name = item.item_name || item.name || "Item";
      if (!topMap[name]) {
        topMap[name] = { name, quantity: 0, amount: 0 };
      }
      topMap[name].quantity += Number(item.quantity) || 1;
      topMap[name].amount += Number(item.amount) || (Number(item.price || 0) * (item.quantity || 1));
    });
  });

  const top = Object.values(topMap).sort((a, b) => b.quantity - a.quantity);

  return { summary, top };
}

// Clear Data
export async function clearData(password) {
  const bills = getStorage("rb_bills", []);
  setStorage("rb_bills", []);

  if (isCloudSyncEnabled()) {
    for (const b of bills) {
      if (b.bill_no) await removeDoc("bills", b.bill_no);
    }
  }
  return { ok: true, message: "All data cleared successfully" };
}

// Push all current local data up to Cloud
export async function syncAllToCloud() {
  if (!isCloudSyncEnabled()) {
    throw new Error("Cloud Sync is not configured yet. Please configure Firebase credentials first.");
  }

  const bills = getStorage("rb_bills", []);
  const items = getStorage("rb_items", DEFAULT_ITEMS);
  const categories = getStorage("rb_categories", DEFAULT_CATEGORIES);
  const settings = await getSettings();

  await uploadDoc("settings", "general", settings);

  for (const b of bills) {
    if (b.bill_no) await uploadDoc("bills", b.bill_no, b);
  }
  for (const i of items) {
    await uploadDoc("items", i.id, i);
  }
  for (const c of categories) {
    await uploadDoc("categories", c.id, c);
  }

  return { ok: true, billsSynced: bills.length, itemsSynced: items.length };
}

export const api = {
  categories: getCategories,
  addCategory,
  editCategory,
  deleteCategory,
  items: getItems,
  addItem,
  editItem,
  deleteItem,
  settings: getSettings,
  saveSettings,
  createBill,
  bills: getBills,
  bill: getBill,
  deleteBill,
  daily: getSalesReport,
  clearData,
  syncAllToCloud,
  isCloudSyncEnabled,
  getFirebaseConfig,
  saveFirebaseConfig,
  generateShareableConfigUrl,
  getDeviceName,
  setDeviceName,
  setupRealtimeSync
};

export default api;
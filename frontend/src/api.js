// Client-side LocalStorage API wrapper for Restaurant Billing POS

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Chicken Fry Mandi" },
  { id: 2, name: "Chicken Broasted Mandi" },
  { id: 3, name: "Mutton Juicy Mandi" },
  { id: 4, name: "Fish Fry Mandi" },
  { id: 5, name: "Extra Items" },
  { id: 6, name: "Chicken Biryani" },
  { id: 7, name: "Sweets" },
  { id: 8, name: "Drinks" },
  { id: 9, name: "Shawarma" }
];

const CATEGORY_IMAGE_MAP = {
  1: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80", // Chicken Fry Mandi
  2: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80", // Chicken Broasted Mandi
  3: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", // Mutton Juicy Mandi
  4: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80", // Fish Fry Mandi
  5: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80", // Extra Items
  6: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80", // Chicken Biryani
  7: "https://images.unsplash.com/photo-1559622214-f8a9850965bb?auto=format&fit=crop&w=600&q=80", // Sweets
  8: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80", // Drinks
  9: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80"  // Shawarma
};

export function getItemImage(item) {
  if (item && item.image && item.image.trim() !== "") {
    return item.image;
  }
  const name = (item?.name || "").toLowerCase();
  const cat = (item?.category_name || "").toLowerCase();
  const catId = Number(item?.category_id);

  // Mandi items
  if (catId === 2 || name.includes("broast") || cat.includes("broast")) {
    return CATEGORY_IMAGE_MAP[2];
  }
  if (catId === 3 || name.includes("mutton") || name.includes("lamb") || cat.includes("mutton")) {
    return CATEGORY_IMAGE_MAP[3];
  }
  if (catId === 4 || name.includes("fish") || cat.includes("fish")) {
    return CATEGORY_IMAGE_MAP[4];
  }
  if (catId === 1 || name.includes("chicken fry mandi") || cat.includes("chicken fry mandi") || (name.includes("mandi") && name.includes("fry"))) {
    return CATEGORY_IMAGE_MAP[1];
  }

  // General dish fallbacks
  if (name.includes("biryani") || cat.includes("biryani")) {
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80";
  }
  if (name.includes("tikka") || name.includes("manchurian") || name.includes("tandoori") || cat.includes("starter")) {
    return "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80";
  }
  if (name.includes("curry") || name.includes("paneer") || cat.includes("curry")) {
    return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80";
  }
  if (name.includes("naan") || name.includes("roti") || cat.includes("naan")) {
    return "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80";
  }

  return CATEGORY_IMAGE_MAP[1];
}

const MENU_VERSION = "v2";

const DEFAULT_ITEMS = [
  // CHICKEN FRY MANDI
  { id: 1,  name: "Chicken Fry Mandi (1 Piece)",       category_id: 1, price: 280,  available: 1, image: CATEGORY_IMAGE_MAP[1] },
  { id: 2,  name: "Chicken Fry Mandi (2 Piece)",       category_id: 1, price: 510,  available: 1, image: CATEGORY_IMAGE_MAP[1] },
  { id: 3,  name: "Chicken Fry Mandi (3 Piece)",       category_id: 1, price: 690,  available: 1, image: CATEGORY_IMAGE_MAP[1] },
  { id: 4,  name: "Chicken Fry Mandi (4 Piece)",       category_id: 1, price: 920,  available: 1, image: CATEGORY_IMAGE_MAP[1] },
  // CHICKEN BROASTED MANDI
  { id: 5,  name: "Chicken Broasted Mandi (1 Piece)",  category_id: 2, price: 300,  available: 1, image: CATEGORY_IMAGE_MAP[2] },
  { id: 6,  name: "Chicken Broasted Mandi (2 Piece)",  category_id: 2, price: 550,  available: 1, image: CATEGORY_IMAGE_MAP[2] },
  { id: 7,  name: "Chicken Broasted Mandi (3 Piece)",  category_id: 2, price: 780,  available: 1, image: CATEGORY_IMAGE_MAP[2] },
  { id: 8,  name: "Chicken Broasted Mandi (4 Piece)",  category_id: 2, price: 1080, available: 1, image: CATEGORY_IMAGE_MAP[2] },
  // MUTTON JUICY MANDI
  { id: 9,  name: "Mutton Juicy Mandi (1 Piece)",      category_id: 3, price: 320,  available: 1, image: CATEGORY_IMAGE_MAP[3] },
  { id: 10, name: "Mutton Juicy Mandi (2 Piece)",      category_id: 3, price: 600,  available: 1, image: CATEGORY_IMAGE_MAP[3] },
  { id: 11, name: "Mutton Juicy Mandi (3 Piece)",      category_id: 3, price: 870,  available: 1, image: CATEGORY_IMAGE_MAP[3] },
  { id: 12, name: "Mutton Juicy Mandi (4 Piece)",      category_id: 3, price: 1140, available: 1, image: CATEGORY_IMAGE_MAP[3] },
  // FISH FRY MANDI
  { id: 13, name: "Fish Fry Mandi Full (2 Person)",    category_id: 4, price: 500,  available: 1, image: CATEGORY_IMAGE_MAP[4] },
  { id: 14, name: "Fish Fry Mandi Full (3 Person)",    category_id: 4, price: 680,  available: 1, image: CATEGORY_IMAGE_MAP[4] },
  { id: 15, name: "Fish Fry Mandi Full (4 Person)",    category_id: 4, price: 900,  available: 1, image: CATEGORY_IMAGE_MAP[4] },
  // EXTRA ITEMS
  { id: 16, name: "Chicken Fry Extra Piece",           category_id: 5, price: 160,  available: 1, image: CATEGORY_IMAGE_MAP[5] },
  { id: 17, name: "Chicken Broasted Extra Piece",      category_id: 5, price: 200,  available: 1, image: CATEGORY_IMAGE_MAP[5] },
  { id: 18, name: "Extra Mandi Rice",                  category_id: 5, price: 140,  available: 1, image: CATEGORY_IMAGE_MAP[5] },
  { id: 19, name: "Extra Mayonnaise",                  category_id: 5, price: 40,   available: 1, image: CATEGORY_IMAGE_MAP[5] },
  // CHICKEN BIRYANI
  { id: 20, name: "Chicken Biryani Single",            category_id: 6, price: 140,  available: 1, image: CATEGORY_IMAGE_MAP[6] },
  { id: 21, name: "Chicken Biryani Full",              category_id: 6, price: 260,  available: 1, image: CATEGORY_IMAGE_MAP[6] },
  { id: 22, name: "Chicken Family Biryani",            category_id: 6, price: 500,  available: 1, image: CATEGORY_IMAGE_MAP[6] },
  // SWEETS
  { id: 23, name: "Basanti Sweets",                    category_id: 7, price: 100,  available: 1, image: CATEGORY_IMAGE_MAP[7] },
  // DRINKS
  { id: 24, name: "Any Cool Drinks",                   category_id: 8, price: 20,   available: 1, image: CATEGORY_IMAGE_MAP[8] },
  { id: 25, name: "Water Bottle",                      category_id: 8, price: 20,   available: 1, image: CATEGORY_IMAGE_MAP[8] },
  // SHAWARMA
  { id: 26, name: "Chicken Shawarma Regular",          category_id: 9, price: 120,  available: 1, image: CATEGORY_IMAGE_MAP[9] },
  { id: 27, name: "Chicken Shawarma SPL",              category_id: 9, price: 140,  available: 1, image: CATEGORY_IMAGE_MAP[9] }
];

const DEFAULT_SETTINGS = {
  restaurant_name: "My Restaurant",
  address: "",
  phone: "",
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

// Seed / Reset menu data based on version key
(() => {
  const savedVersion = localStorage.getItem("rb_menu_version");
  if (savedVersion !== MENU_VERSION) {
    // New menu version detected — reset categories and items to defaults
    setStorage("rb_categories", DEFAULT_CATEGORIES);
    setStorage("rb_items", DEFAULT_ITEMS);
    localStorage.setItem("rb_menu_version", MENU_VERSION);
  }

  if (!localStorage.getItem("rb_settings")) {
    setStorage("rb_settings", DEFAULT_SETTINGS);
  }
  if (!localStorage.getItem("rb_bills")) {
    setStorage("rb_bills", []);
  }
})();

// Categories
export async function getCategories() {
  return getStorage("rb_categories", DEFAULT_CATEGORIES);
}

export async function addCategory(name) {
  const categories = await getCategories();
  const nextId = categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1;
  const newCat = { id: nextId, name: name.trim() };
  categories.push(newCat);
  setStorage("rb_categories", categories);
  return newCat;
}

export async function editCategory(id, name) {
  const categories = await getCategories();
  const idx = categories.findIndex(c => String(c.id) === String(id));
  if (idx !== -1) {
    categories[idx].name = name.trim();
    setStorage("rb_categories", categories);
  }
  return categories[idx];
}

export async function deleteCategory(id) {
  let categories = await getCategories();
  categories = categories.filter(c => String(c.id) !== String(id));
  setStorage("rb_categories", categories);
  return { ok: true };
}

// Menu items
export async function getItems() {
  const items = getStorage("rb_items", DEFAULT_ITEMS);
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
  const nextId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
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
  }
  return items[idx];
}

export async function deleteItem(id) {
  let items = getStorage("rb_items", DEFAULT_ITEMS);
  items = items.filter(i => String(i.id) !== String(id));
  setStorage("rb_items", items);
  return { ok: true };
}

// Restaurant settings
export async function getSettings() {
  return getStorage("rb_settings", DEFAULT_SETTINGS);
}

export async function saveSettings(data) {
  const current = await getSettings();
  const updated = { ...current, ...data };
  setStorage("rb_settings", updated);
  return updated;
}

// Create bill
export async function createBill(data) {
  const bills = getStorage("rb_bills", []);
  const stamp = Date.now().toString(36).toUpperCase();
  const bill_no = `B${stamp}`;
  
  const total = (data.items || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const billItems = (data.items || []).map(item => ({
    item_id: item.id,
    item_name: item.name,
    quantity: item.quantity,
    price: item.price,
    amount: item.price * item.quantity
  }));

  const newBill = {
    id: bills.length ? Math.max(...bills.map(b => b.id)) + 1 : 1,
    bill_no,
    total,
    payment_method: data.payment_method || "Cash",
    cash_amount: Number(data.cash_amount) || 0,
    upi_amount: Number(data.upi_amount) || 0,
    card_amount: Number(data.card_amount) || 0,
    created_at: new Date().toISOString(),
    items: billItems
  };

  bills.unshift(newBill);
  setStorage("rb_bills", bills);
  return newBill;
}

// Get bills
export async function getBills() {
  return getStorage("rb_bills", []);
}

// Get single bill
export async function getBill(id) {
  const bills = await getBills();
  const bill = bills.find(b => String(b.id) === String(id));
  if (!bill) throw new Error("Bill not found");
  return bill;
}

// Delete bill
export async function deleteBill(id) {
  let bills = await getBills();
  bills = bills.filter(b => String(b.id) !== String(id));
  setStorage("rb_bills", bills);
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
      if (!topMap[item.item_name]) {
        topMap[item.item_name] = { name: item.item_name, quantity: 0, amount: 0 };
      }
      topMap[item.item_name].quantity += item.quantity;
      topMap[item.item_name].amount += item.amount;
    });
  });

  const top = Object.values(topMap).sort((a, b) => b.quantity - a.quantity);

  return { summary, top };
}

// Clear Data
export async function clearData(password) {
  setStorage("rb_bills", []);
  return { ok: true, message: "All data cleared successfully" };
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
  clearData
};

export default api;
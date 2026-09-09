// Client-side LocalStorage API wrapper for Restaurant Billing POS

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Chicken Fry Mandi" },
  { id: 2, name: "Chicken Broasted Mandi" },
  { id: 3, name: "Mutton Juicy Mandi" },
  { id: 4, name: "Fish Fry Mandi" }
];

const CATEGORY_IMAGE_MAP = {
  1: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80", // Chicken Fry Mandi
  2: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80", // Chicken Broasted Mandi
  3: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", // Mutton Juicy Mandi
  4: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80"  // Fish Fry Mandi
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
  restaurant_name: "My Restaurant",
  address: "",
  phone: "",
  paper_size: "80mm"
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

// Seed / Migrate initial data to ensure Mandi categories and items are present
(() => {
  const currentCats = getStorage("rb_categories", []);
  const hasMandiCats = currentCats.some(c => c.name && c.name.toLowerCase().includes("mandi"));
  if (!currentCats.length || !hasMandiCats) {
    const mergedCats = [...DEFAULT_CATEGORIES];
    currentCats.forEach(c => {
      if (!mergedCats.some(mc => mc.name.toLowerCase() === c.name.toLowerCase())) {
        mergedCats.push(c);
      }
    });
    setStorage("rb_categories", mergedCats);
  }

  const currentItems = getStorage("rb_items", []);
  const hasMandiItems = currentItems.some(i => i.name && i.name.toLowerCase().includes("mandi"));
  if (!currentItems.length || !hasMandiItems) {
    const mergedItems = [...DEFAULT_ITEMS];
    let maxId = mergedItems.length ? Math.max(...mergedItems.map(x => x.id)) : 0;
    currentItems.forEach(item => {
      if (!mergedItems.some(mi => mi.name.toLowerCase() === item.name.toLowerCase())) {
        maxId += 1;
        mergedItems.push({ ...item, id: maxId });
      }
    });
    setStorage("rb_items", mergedItems);
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
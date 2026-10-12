import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Receipt, Utensils, Tags, History, BarChart3,
  Settings, Plus, Minus, Trash2, Printer, Search,
  Pencil, Save, X, Menu, CreditCard, Moon, Sun, Cloud, RefreshCw, CheckCircle2
} from "lucide-react";
import { api, getItemImage } from "./api";

const money = n => `₹${Number(n || 0).toFixed(2)}`;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Good night";
};

function App() {
  const [page, setPage] = useState("billing");
  const [mobile, setMobile] = useState(false);
  const [theme, setTheme] = useState(() => "dark");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [theme]);
  const nav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["billing", "New Bill", Receipt],
    ["items", "Food Items", Utensils],
    ["categories", "Categories", Tags],
    ["history", "Bill History", History],
    ["reports", "Reports", BarChart3],
    ["settings", "Settings", Settings],
  ];
  return <div className="app-shell">
    <aside className={"sidebar " + (mobile ? "open" : "")}>
      <div className="brand"><span>🍽️</span><div><b>QuickBill</b><small>Restaurant POS</small></div></div>
      <nav>{nav.map(([id, label, Icon]) => <button key={id} className={page === id ? "active" : ""} onClick={() => { setPage(id); setMobile(false) }}><Icon size={19} />{label}</button>)}</nav>
    </aside>
    {mobile && <div className="overlay" onClick={() => setMobile(false)} />}
    <main className="main">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={() => setMobile(true)}><Menu /></button>
        <div><h2>{nav.find(x => x[0] === page)?.[1]}</h2><span>{new Date().toLocaleDateString()}</span></div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="theme-toggle-pill">
            <button
              type="button"
              className={`theme-toggle-btn light-btn ${theme === "light" ? "active" : ""}`}
              onClick={() => setTheme("light")}
            >
              <Sun size={15} />
              <span>Light</span>
            </button>
            <button
              type="button"
              className={`theme-toggle-btn dark-btn ${theme === "dark" ? "active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              <Moon size={15} />
              <span>Dark</span>
            </button>
          </div>
          <button className="avatar">N</button>
        </div>
      </header>
      <div className="content">
        {page === "dashboard" && <Dashboard go={setPage} />}
        {page === "billing" && <Billing />}
        {page === "items" && <Items />}
        {page === "categories" && <Categories />}
        {page === "history" && <HistoryPage />}
        {page === "reports" && <Reports />}
        {page === "settings" && <SettingsPage />}
      </div>
    </main>
  </div>
}

function Dashboard({ go }) {
  const [data, setData] = useState(null);
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [greeting, setGreeting] = useState(getGreeting);

  const load = () => {
    api.daily().then(setData);
    api.bills().then(setBills);
  };

  useEffect(() => {
    load();
    window.addEventListener("rb_bills_synced", load);
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => {
      window.removeEventListener("rb_bills_synced", load);
      clearInterval(interval);
    };
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const filteredBills = bills.filter(b => {
    if (filter === "today" && (!b.created_at || !b.created_at.startsWith(todayStr))) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNo = (b.bill_no || "").toLowerCase().includes(q);
      const matchItems = (b.items || []).some(it => (it.item_name || it.name || "").toLowerCase().includes(q));
      const matchPay = (b.payment_method || "").toLowerCase().includes(q);
      return matchNo || matchItems || matchPay;
    }
    return true;
  });

  return <div>
    <div className="welcome"><div><h1>{greeting} 👋</h1><p>Manage today's restaurant sales quickly.</p></div><button className="primary" onClick={() => go("billing")}><Plus size={18} /> New Bill</button></div>
    <div className="stats">
      <Stat title="Today's Sales" value={money(data?.summary.total)} icon="₹" />
      <Stat title="Total Bills" value={data?.summary.bills || 0} icon="🧾" />
      <Stat title="Cash Sales" value={money(data?.summary.cash)} icon="💵" />
      <Stat title="UPI Sales" value={money(data?.summary.upi)} icon="📱" />
    </div>
    <div className="panel">
      <div className="panel-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div>
          <h3 style={{ margin: 0 }}>Every Bill ({filteredBills.length})</h3>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#7c8799" }}>Recent customer orders and detailed billing history</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div className="filter-tabs">
            <button
              type="button"
              className={`filter-tab-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Bills
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${filter === "today" ? "active" : ""}`}
              onClick={() => setFilter("today")}
            >
              Today's Bills
            </button>
          </div>
          <div className="search" style={{ minWidth: "180px", padding: "6px 10px" }}>
            <Search size={16} />
            <input
              placeholder="Search bill or item..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bill No.</th>
              <th>Date & Time</th>
              <th>Items Ordered</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "26px", color: "#8a94a4" }}>
                  No bills found.
                </td>
              </tr>
            ) : (
              filteredBills.map(b => (
                <tr key={b.id || b.bill_no}>
                  <td><b>{b.bill_no}</b></td>
                  <td>{new Date(b.created_at || Date.now()).toLocaleString()}</td>
                  <td>
                    <div style={{ maxWidth: "340px", whiteSpace: "normal", fontSize: "13px", lineHeight: "1.4" }}>
                      {(b.items || []).map((it, idx) => (
                        <span
                          key={idx}
                          className="item-pill"
                        >
                          {it.item_name || it.name || "Item"} ×{it.quantity}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="badge">{b.payment_method || "Cash"}</span>
                  </td>
                  <td><strong className="amount-highlight" style={{ fontSize: "15px" }}>{money(b.total)}</strong></td>
                  <td>
                    <button className="view-btn" onClick={async () => setSelectedBill(await api.bill(b.id || b.bill_no))}>
                      View / Reprint
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    {selectedBill && <BillModal bill={selectedBill} onClose={() => setSelectedBill(null)} />}
  </div>
}
function Stat({ title, value, icon }) { return <div className="stat"><div className="stat-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong></div></div> }

const billingMenuStyles = `
  .billing-menu-shell { background: #eef2f5; border: 1px solid #dfe5ec; border-radius: 22px; padding: 18px 18px 12px; }
  .billing-menu-shell .menu-search { position: relative; margin-bottom: 18px; }
  .billing-menu-shell .menu-search input { width: 100%; border: 1px solid #d5dbe4; background: rgba(255,255,255,0.4); border-radius: 18px; height: 56px; padding: 0 18px 0 52px; font-size: 20px; color: #1d2430; outline: none; }
  .billing-menu-shell .menu-search svg { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #5d6979; }
  .billing-menu-shell .menu-chips { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 20px; }
  .billing-menu-shell .chip { border-radius: 16px; background: #dde3ea; color: #2d3748; padding: 12px 18px; font-size: 18px; font-weight: 600; }
  .billing-menu-shell .chip.active { background: #1e83ff; color: white; }
  .billing-menu-shell .product-grid { display: grid; grid-template-columns: repeat(3, minmax(220px, 1fr)); gap: 18px; }
  .billing-menu-shell .product-card { background: #f2f3f5; border: 1px solid #dfe4ea; border-radius: 18px; min-height: 180px; padding: 18px 12px 16px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 0.15s ease; }
  .billing-menu-shell .product-card:hover { transform: translateY(-2px); }
  .billing-menu-shell .product-image { width: 86px; height: 86px; border-radius: 50%; object-fit: cover; border: 3px solid #f1b64a; box-shadow: 0 8px 18px rgba(0,0,0,0.1); margin-bottom: 14px; }
  .billing-menu-shell .product-name { font-size: 22px; font-weight: 800; color: #1b2330; margin-bottom: 4px; }
  .billing-menu-shell .product-price { font-size: 18px; font-weight: 800; color: #1d7ded; }
  @media (max-width: 980px) { .billing-menu-shell .product-grid { grid-template-columns: repeat(2, minmax(180px, 1fr)); } }
  @media (max-width: 600px) { .billing-menu-shell .product-grid { grid-template-columns: 1fr; } }
`;

function Billing() {
  const [items, setItems] = useState([]), [cats, setCats] = useState([]), [cat, setCat] = useState("All"), [search, setSearch] = useState("");
  const [cart, setCart] = useState([]), [payment, setPayment] = useState("Cash"), [settings, setSettings] = useState(null), [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true), [error, setError] = useState(null);
  const [showSplitModal, setShowSplitModal] = useState(false), [upiAmount, setUpiAmount] = useState(""), [cashAmount, setCashAmount] = useState("");

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([api.items(), api.categories(), api.settings()]).then(([i, c, s]) => {
      setItems(i || []);
      setCats(c || []);
      setSettings(s);
    }).catch(err => {
      console.error("Failed to load billing data:", err);
      setError(err.message || "Failed to load data from server");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener("rb_items_synced", loadData);
    window.addEventListener("rb_categories_synced", loadData);
    return () => {
      window.removeEventListener("rb_items_synced", loadData);
      window.removeEventListener("rb_categories_synced", loadData);
    };
  }, []);

  const filtered = useMemo(() => items.filter(x => {
    const matchCat = !cat || cat === "All" || x.category_name === cat || String(x.category_id) === String(cat);
    const matchSearch = !search || x.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && Boolean(x.available);
  }), [items, cat, search]);

  const total = cart.reduce((s, x) => s + x.price * x.quantity, 0);

  function add(item) { setCart(c => { const found = c.find(x => x.id === item.id); return found ? c.map(x => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x) : [...c, { ...item, quantity: 1 }] }) }
  function change(id, d) { setCart(c => c.map(x => x.id === id ? { ...x, quantity: x.quantity + d } : x).filter(x => x.quantity > 0)) }

  const handleSplitPayment = () => {
    const upi = Number(upiAmount) || 0;
    const cash = Number(cashAmount) || 0;
    if (upi + cash !== total) { return alert(`Total must equal ₹${total.toFixed(2)}`); }
    setPayment({ type: "Split", upi, cash });
    setShowSplitModal(false);
    setUpiAmount("");
    setCashAmount("");
  };

  function printKitchenOrder() {
    if (!cart.length) return alert("Add items first");
    const ticket = {
      bill_no: `K${Date.now().toString().slice(-6)}`,
      created_at: new Date().toISOString(),
      items: cart.map(item => ({
        item_name: item.name,
        quantity: item.quantity,
      })),
    };
    printKitchenTicket(ticket, settings);
  }

  async function savePrint() {
    if (!cart.length) return alert("Add items first");
    setSaving(true);
    try {
      const isSplit = typeof payment === "object";
      const paymentMethod = isSplit ? `Split: ₹${payment.upi.toFixed(2)} UPI + ₹${payment.cash.toFixed(2)} Cash` : payment;
      const billData = {
        items: cart,
        payment_method: paymentMethod,
        cash_amount: isSplit ? payment.cash : (payment === "Cash" ? total : 0),
        upi_amount: isSplit ? payment.upi : (payment === "UPI" ? total : 0),
        card_amount: !isSplit && payment === "Card" ? total : 0
      };
      const bill = await api.createBill(billData);
      const full = await api.bill(bill.id);
      setCart([]);
      setPayment("Cash");
      printReceipt(full, settings);
    } catch (e) { alert(e.message) } finally { setSaving(false) }
  }

  return <>
    <style>{billingMenuStyles}</style>
    <div className="billing-grid">
      <section className="menu-panel billing-menu-shell">
        <div className="menu-search"><Search size={22} /><input placeholder="Search food..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="menu-chips">
          <button className={!cat || cat === "All" ? "chip active" : "chip"} onClick={() => setCat("All")}>All Items</button>
          {cats.map(c => <button className={cat === c.name || String(cat) === String(c.id) ? "chip active" : "chip"} key={c.id} onClick={() => setCat(c.name)}>{c.name}</button>)}
        </div>
        <div className="product-grid">
          {loading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
              <p>Loading menu items...</p>
            </div>
          ) : error ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "16px", color: "#991b1b" }}>
              <p style={{ fontWeight: 600, marginBottom: "8px" }}>⚠️ Unable to load menu items</p>
              <p style={{ fontSize: "14px", marginBottom: "16px" }}>{error}</p>
              <button className="primary" onClick={loadData}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px", background: "white", borderRadius: "16px", color: "#64748b", border: "1px dashed #cbd5e1" }}>
              <Utensils size={40} style={{ marginBottom: "12px", opacity: 0.5, margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "18px", color: "#334155", marginBottom: "6px" }}>No food items found</h3>
              <p style={{ fontSize: "14px", margin: 0 }}>
                {search ? `No items match "${search}"` : cat && cat !== "All" ? `No items available under "${cat}"` : "No available food items in the database."}
              </p>
              {(search || (cat && cat !== "All")) && (
                <button className="secondary" style={{ marginTop: "16px" }} onClick={() => { setSearch(""); setCat("All"); }}>
                  Clear Filter & Show All
                </button>
              )}
            </div>
          ) : (
            filtered.map(x => <button className="product-card" key={x.id} onClick={() => add(x)}><img className="product-image" src={getItemImage(x)} alt={x.name} onError={e => { e.target.onerror = null; e.target.src = getItemImage({ name: x.name }); }} /><div className="product-name">{x.name}</div><div className="product-price">₹{Number(x.price).toFixed(2)}</div></button>)
          )}
        </div>
      </section>
      <section className="cart-panel">
        <div className="cart-head"><h3>Current Bill</h3><span>{cart.reduce((s, x) => s + x.quantity, 0)} items</span></div>
        <div className="cart-items">{cart.length === 0 ? <div className="empty"><Receipt size={40} /><p>No items added</p><small>Select food items to start a bill.</small></div> : cart.map(x => <div className="cart-item" key={x.id}><div><b>{x.name}</b><small>{money(x.price)} each</small></div><div className="qty"><button onClick={() => change(x.id, -1)}><Minus size={14} /></button><b>{x.quantity}</b><button onClick={() => change(x.id, 1)}><Plus size={14} /></button></div><strong>{money(x.price * x.quantity)}</strong></div>)}</div>
        <div className="bill-bottom">
          <div className="total-line"><span>Subtotal</span><b>{money(total)}</b></div>
          <div className="total-line grand"><span>Total</span><b>{money(total)}</b></div>
          <div className="payment"><span>Payment</span><div><button className={payment === "Cash" ? "pay selected" : "pay"} onClick={() => setPayment("Cash")}>💵 Cash</button><button className={payment === "UPI" ? "pay selected" : "pay"} onClick={() => setPayment("UPI")}>📱 UPI</button><button className={typeof payment === "object" ? "pay selected" : "pay"} onClick={() => setShowSplitModal(true)}>🔄 Half</button></div></div>
          <div className="action-row"><button className="secondary" onClick={() => setCart([])}>Reset Orders</button><button disabled={!cart.length} className="secondary" onClick={printKitchenOrder}><Utensils size={18} /> Kitchen Print</button><button disabled={saving || !cart.length} className="primary print" onClick={savePrint}><Printer size={18} />{saving ? "Saving..." : "Save & Print"}</button></div>
        </div>
      </section>
    </div>
    {showSplitModal && <Modal title="Split Payment" onClose={() => { setShowSplitModal(false); setUpiAmount(""); setCashAmount("") }}><form onSubmit={e => { e.preventDefault(); handleSplitPayment() }} className="form"><label>UPI Amount<input type="number" step="0.01" min="0" value={upiAmount} onChange={e => setUpiAmount(e.target.value)} required placeholder="Enter UPI amount" /></label><label>Cash Amount<input type="number" step="0.01" min="0" value={cashAmount} onChange={e => setCashAmount(e.target.value)} required placeholder="Enter Cash amount" /></label><div style={{ background: "#f0f4f8", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}><div>Total Amount: ₹{total.toFixed(2)}</div><div>UPI: ₹{(Number(upiAmount) || 0).toFixed(2)}</div><div>Cash: ₹{(Number(cashAmount) || 0).toFixed(2)}</div><div style={{ fontWeight: "bold", marginTop: "8px" }}>Sum: ₹{(Number(upiAmount || 0) + Number(cashAmount || 0)).toFixed(2)}</div></div><div className="action-row"><button type="button" className="secondary" onClick={() => { setShowSplitModal(false); setUpiAmount(""); setCashAmount("") }}>Cancel</button><button type="submit" className="primary">Confirm Split Payment</button></div></form></Modal>}
  </>
}

function Items() {
  const [items, setItems] = useState([]), [cats, setCats] = useState([]), [editing, setEditing] = useState(null), [show, setShow] = useState(false), [search, setSearch] = useState("");
  const load = () => Promise.all([api.items(), api.categories()]).then(([i, c]) => { setItems(i); setCats(c) });
  useEffect(() => {
    load();
    window.addEventListener("rb_items_synced", load);
    return () => window.removeEventListener("rb_items_synced", load);
  }, []);
  const save = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = {
      name: f.get("name"),
      category_id: f.get("category_id") || null,
      price: Number(f.get("price")),
      available: f.get("available") === "on",
      image: f.get("image") || ""
    };
    editing ? await api.editItem(editing.id, body) : await api.addItem(body);
    setShow(false);
    setEditing(null);
    load();
  };
  const list = items.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));
  return <div><Toolbar title="Food Items" search={search} setSearch={setSearch} action={() => { setEditing(null); setShow(true) }} label="Add Item" />
    <div className="panel table-wrap"><table><thead><tr><th>Image</th><th>Item</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>{list.map(x => <tr key={x.id}><td><img src={getItemImage(x)} alt={x.name} onError={e => { e.target.onerror = null; e.target.src = getItemImage({ name: x.name }); }} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid #f1b64a", display: "block" }} /></td><td><b>{x.name}</b></td><td>{x.category_name || "Uncategorized"}</td><td>{money(x.price)}</td><td><span className={x.available ? "badge success" : "badge"}>{x.available ? "Available" : "Unavailable"}</span></td><td className="actions"><button onClick={() => { setEditing(x); setShow(true) }}><Pencil size={16} /></button><button onClick={async () => { if (confirm("Delete item?")) { await api.deleteItem(x.id); load() } }}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div>
    {show && <Modal title={editing ? "Edit Item" : "Add Food Item"} onClose={() => { setShow(false); setEditing(null) }}><form onSubmit={save} className="form"><label>Item Name<input name="name" defaultValue={editing?.name || ""} required /></label><label>Category<select name="category_id" defaultValue={editing?.category_id || ""}><option value="">Select category</option>{cats.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label>Price<input name="price" type="number" step="0.01" min="0" defaultValue={editing?.price || ""} required /></label><label>Image URL (optional)<input name="image" defaultValue={editing?.image || ""} placeholder="https://images.unsplash.com/..." /></label><label className="check"><input name="available" type="checkbox" defaultChecked={editing ? !!editing.available : true} /> Available</label><button className="primary"><Save size={17} /> Save Item</button></form></Modal>}</div>
}

function Categories() {
  const [cats, setCats] = useState([]), [name, setName] = useState(""), [editing, setEditing] = useState(null);
  const load = () => api.categories().then(setCats);
  useEffect(() => {
    load();
    window.addEventListener("rb_categories_synced", load);
    return () => window.removeEventListener("rb_categories_synced", load);
  }, []);
  async function save() { if (!name.trim()) return; if (editing) await api.editCategory(editing.id, name); else await api.addCategory(name); setName(""); setEditing(null); load() }
  return <div><div className="panel category-add"><div><h3>{editing ? "Edit Category" : "Add Category"}</h3><p>Create menu categories.</p></div><div className="inline-form"><input placeholder="Category name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && save()} /><button className="primary" onClick={save}><Plus size={17} />{editing ? "Update" : "Add"}</button>{editing && <button className="secondary" onClick={() => { setEditing(null); setName("") }}><X size={17} /></button>}</div></div>
    <div className="category-grid">{cats.map(c => <div className="category-card" key={c.id}><span>🏷️</span><div><b>{c.name}</b><small>Menu category</small></div><div className="actions"><button onClick={() => { setEditing(c); setName(c.name) }}><Pencil size={16} /></button><button onClick={async () => { if (confirm("Delete category?")) { await api.deleteCategory(c.id); load() } }}><Trash2 size={16} /></button></div></div>)}</div></div>
}

function HistoryPage() {
  const [bills, setBills] = useState([]), [search, setSearch] = useState(""), [selected, setSelected] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const load = () => api.bills().then(setBills);
  useEffect(() => {
    load();
    window.addEventListener("rb_bills_synced", load);
    return () => window.removeEventListener("rb_bills_synced", load);
  }, []);
  
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const monthlyBills = bills.filter(x => x.created_at && x.created_at.startsWith(currentMonthStr));
  const monthlySales = monthlyBills.reduce((sum, b) => sum + (Number(b.total) || 0), 0);

  const list = bills.filter(x => x.created_at && x.created_at.startsWith(filterDate) && x.bill_no.toLowerCase().includes(search.toLowerCase()));
  
  const uniqueDates = [...new Set(bills.map(b => b.created_at ? b.created_at.slice(0, 10) : ""))].filter(Boolean).sort((a,b) => b.localeCompare(a));
  if (!uniqueDates.includes(new Date().toISOString().slice(0, 10))) uniqueDates.unshift(new Date().toISOString().slice(0, 10));

  return <div><Toolbar title="Bill History" search={search} setSearch={setSearch} />
    <div className="stats">
      <Stat title={`Monthly Sales (${new Date().toLocaleString('default', { month: 'long' })})`} value={money(monthlySales)} icon="📅" />
      <Stat title="Monthly Bills" value={monthlyBills.length} icon="🧾" />
    </div>
    <div className="panel" style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
      <label style={{ fontWeight: "bold" }}>Filter by Date: </label>
      <select value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d5dbe4", outline: "none", fontSize: "15px", background: "white" }}>
        {uniqueDates.map(d => <option key={d} value={d}>{d === new Date().toISOString().slice(0, 10) ? "Today (" + d + ")" : d}</option>)}
      </select>
    </div>
    <div className="panel table-wrap"><table><thead><tr><th>Bill No.</th><th>Date & Time</th><th>Payment</th><th>Amount</th><th>Action</th></tr></thead><tbody>{list.length === 0 ? <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No bills found for this date.</td></tr> : list.map(x => <tr key={x.id}><td><b>{x.bill_no}</b></td><td>{new Date(x.created_at).toLocaleString()}</td><td>{x.payment_method}</td><td>{money(x.total)}</td><td><button className="view-btn" onClick={async () => setSelected(await api.bill(x.id))}>View / Reprint</button></td></tr>)}</tbody></table></div>
    {selected && <BillModal bill={selected} onClose={() => setSelected(null)} />}</div>
}

function BillModal({ bill, onClose }) { const [s, setS] = useState(null); useEffect(() => api.settings().then(setS), []); return <Modal title={`Bill ${bill.bill_no}`} onClose={onClose}><div className="receipt-preview"><ReceiptContent bill={bill} settings={s} /></div><button className="primary full" onClick={() => printReceipt(bill, s)}><Printer size={17} /> Reprint Bill</button></Modal> }

function Reports() {
  const [bills, setBills] = useState([]);
  const [filterDate, setFilterDate] = useState("all");
  const load = () => api.bills().then(setBills);

  useEffect(() => {
    load();
    window.addEventListener("rb_bills_synced", load);
    return () => window.removeEventListener("rb_bills_synced", load);
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const uniqueDates = [...new Set(bills.map(b => b.created_at ? b.created_at.slice(0, 10) : ""))].filter(Boolean).sort((a, b) => b.localeCompare(a));
  if (!uniqueDates.includes(todayStr)) uniqueDates.unshift(todayStr);

  const selectedBills = filterDate === "all"
    ? bills
    : bills.filter(b => b.created_at && b.created_at.startsWith(filterDate));

  const summary = {
    total: selectedBills.reduce((s, b) => s + (Number(b.total) || 0), 0),
    bills: selectedBills.length,
    cash: selectedBills.reduce((s, b) => s + (Number(b.cash_amount) || 0), 0),
    upi: selectedBills.reduce((s, b) => s + (Number(b.upi_amount) || 0), 0),
  };

  const topMap = {};
  selectedBills.forEach(b => {
    (b.items || []).forEach(item => {
      const name = item.item_name || item.name || "Item";
      if (!topMap[name]) topMap[name] = { name, quantity: 0, amount: 0 };
      topMap[name].quantity += Number(item.quantity) || 0;
      topMap[name].amount += Number(item.amount) || (Number(item.price || 0) * (Number(item.quantity) || 1));
    });
  });

  const topItems = Object.values(topMap).sort((a, b) => b.quantity - a.quantity);

  return <div>
    <div className="report-header">
      <div>
        <h1>Sales & Top Selling Items Report</h1>
        <p>Comprehensive item-wise sales and performance analytics.</p>
      </div>
      <button className="secondary" onClick={() => window.print()}><Printer size={16} /> Print Report</button>
    </div>

    <div className="panel" style={{ marginBottom: "18px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
      <label style={{ fontWeight: "bold" }}>Filter Period:</label>
      <select
        value={filterDate}
        onChange={e => setFilterDate(e.target.value)}
        style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #d5dbe4", outline: "none", fontSize: "15px", background: "white" }}
      >
        <option value="all">All Time</option>
        <option value={todayStr}>Today ({todayStr})</option>
        {uniqueDates.filter(d => d !== todayStr).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>

    <div className="stats">
      <Stat title="Total Sales" value={money(summary.total)} icon="₹" />
      <Stat title="Bills" value={summary.bills} icon="🧾" />
      <Stat title="Cash Sales" value={money(summary.cash)} icon="💵" />
      <Stat title="UPI Sales" value={money(summary.upi)} icon="📱" />
    </div>

    <div className="panel">
      <div className="panel-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div>
          <h3 style={{ margin: 0 }}>Top Selling Items</h3>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#7c8799" }}>
            Ranked by quantity sold {filterDate === "all" ? "(All Time)" : filterDate === todayStr ? "(Today)" : `(${filterDate})`}
          </p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: "70px" }}>Rank</th>
              <th>Item</th>
              <th>Qty Sold</th>
              <th>Sales</th>
            </tr>
          </thead>
          <tbody>
            {topItems.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "24px", color: "#8a94a4" }}>No sales recorded for this period.</td></tr>
            ) : (
              topItems.map((x, idx) => (
                <tr key={x.name}>
                  <td><b>#{idx + 1}</b></td>
                  <td><b>{x.name}</b></td>
                  <td>{x.quantity}</td>
                  <td><strong style={{ color: "#1d60df" }}>{money(x.amount)}</strong></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
}

function SettingsPage() {
  const [form, setForm] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearPassword, setClearPassword] = useState("");
  const [firebaseInput, setFirebaseInput] = useState(() => {
    const cfg = api.getFirebaseConfig();
    return cfg ? JSON.stringify(cfg, null, 2) : "";
  });
  const [syncing, setSyncing] = useState(false);
  const [isCloud, setIsCloud] = useState(() => api.isCloudSyncEnabled());

  useEffect(() => api.settings().then(setForm), []);
  if (!form) return <div className="loading">Loading...</div>;

  const save = async e => { e.preventDefault(); await api.saveSettings(form); alert("Settings saved") };

  const handleSaveFirebase = async () => {
    try {
      if (!firebaseInput.trim()) {
        api.saveFirebaseConfig(null);
        setIsCloud(false);
        alert("Cloud sync disabled. Operating in local storage mode.");
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(firebaseInput);
      } catch {
        throw new Error("Invalid JSON format. Please paste the Firebase config object.");
      }
      if (!parsed.apiKey || !parsed.projectId) {
        throw new Error("Missing apiKey or projectId in Firebase configuration.");
      }
      api.saveFirebaseConfig(parsed);
      api.setupRealtimeSync();
      setIsCloud(true);
      alert("✅ Connected to Firebase Cloud! Multi-device real-time sync is now ACTIVE.");
    } catch (err) {
      alert("Configuration Error: " + err.message);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const res = await api.syncAllToCloud();
      alert(`✅ Cloud Sync Complete!\n${res.billsSynced} bills and ${res.itemsSynced} menu items synced to the Cloud.\nAll mobile phones can now see this data without missing anything!`);
    } catch (err) {
      alert("Sync failed: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleClearData = async () => {
    if (!clearPassword) { return alert("Please enter password"); }
    try {
      await api.clearData(clearPassword);
      alert("All data cleared successfully!");
      setShowClearModal(false);
      setClearPassword("");
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  return <div className="settings-grid">
    <div className="panel" style={{ gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <Cloud size={22} color="#2563eb" /> Multi-Phone Real-Time Cloud Sync
          </h3>
          <p style={{ margin: "4px 0 0", color: "#64748b" }}>
            Allows every phone in your restaurant to create and view bills live without missing any data.
          </p>
        </div>
        <span className={`badge ${isCloud ? "success" : ""}`} style={{ fontSize: "14px", padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          {isCloud ? "🟢 Cloud Sync Active" : "🟡 Local Mode (Single Phone)"}
        </span>
      </div>

      <div style={{ background: isCloud ? "#f0fdf4" : "#f8fafc", border: `1px solid ${isCloud ? "#bbf7d0" : "#e2e8f0"}`, borderRadius: "10px", padding: "16px" }}>
        <div style={{ fontWeight: 600, color: isCloud ? "#166534" : "#334155", marginBottom: "8px" }}>
          {isCloud ? "✅ All connected mobile devices sync bills automatically in real time." : "ℹ️ How to sync across multiple phones:"}
        </div>
        {!isCloud && (
          <ol style={{ margin: "0 0 12px 20px", padding: 0, fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
            <li>Open <b><a href="https://console.firebase.google.com" target="_blank" rel="noreferrer">console.firebase.google.com</a></b> (Free Spark plan).</li>
            <li>Create a Project &gt; Click <b>Web (&lt;/&gt;)</b> to get your Firebase Config.</li>
            <li>Go to <b>Firestore Database</b> &gt; Create Database (Start in test mode).</li>
            <li>Paste your Firebase Web Config JSON below and click <b>Save &amp; Connect Cloud</b>.</li>
          </ol>
        )}
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
          Firebase Web Config JSON:
        </label>
        <textarea
          value={firebaseInput}
          onChange={e => setFirebaseInput(e.target.value)}
          placeholder={`{\n  "apiKey": "AIzaSy...",\n  "projectId": "mandi-pos-...",\n  "authDomain": "...",\n  "storageBucket": "...",\n  "appId": "..."\n}`}
          rows={5}
          style={{ width: "100%", fontFamily: "monospace", fontSize: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "10px", background: "#fff", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
          <button type="button" className="primary" onClick={handleSaveFirebase}>
            <Save size={16} /> Save &amp; Connect Cloud
          </button>
          {isCloud && (
            <>
              <button type="button" className="secondary" onClick={handleSyncAll} disabled={syncing}>
                <RefreshCw size={16} /> {syncing ? "Syncing..." : "Sync All Local Data to Cloud"}
              </button>
              <button
                type="button"
                className="primary"
                style={{ background: "#059669" }}
                onClick={() => {
                  const url = api.generateShareableConfigUrl();
                  if (!url) return alert("Configuration not found.");
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => {
                      alert("✅ Sync Link Copied!\n\nSend this link to your second phone (via WhatsApp, message, etc.) and open it there. It will automatically connect and sync all bills in real-time!");
                    }).catch(() => {
                      prompt("Copy this link and open it on your second phone:", url);
                    });
                  } else {
                    prompt("Copy this link and open it on your second phone:", url);
                  }
                }}
              >
                📱 Copy Auto-Connect Link for Phone 2
              </button>
            </>
          )}
        </div>
      </div>
    </div>

    <form className="panel form" onSubmit={save}>
      <div><h3>Restaurant Information</h3><p>These details appear on printed receipts.</p></div>
      <label>Restaurant Name<input value={form.restaurant_name} onChange={e => setForm({ ...form, restaurant_name: e.target.value })} /></label>
      <label>Address<textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label>
      <label>Phone<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
      <label>Paper Size<select value={form.paper_size} onChange={e => setForm({ ...form, paper_size: e.target.value })}><option>80mm</option><option>58mm</option></select></label>
      <button className="primary"><Save size={17} /> Save Settings</button>
    </form>
    <div className="panel">
      <h3>Printer Setup</h3><p>For Android Bluetooth printing, pair your 58mm ESC/POS printer first, then configure it in RawBT.</p>
      <div className="printer-box"><Printer size={38} /><b>Bluetooth Thermal Printer</b><span>Works with POS58UB / compatible ESC/POS printers on Android.</span><button className="secondary" onClick={() => printTest(form)}>Print Test Receipt</button></div>
    </div>
    <div className="panel">
      <h3>Danger Zone</h3><p>Clear all orders and bills data.</p>
      <button className="secondary danger" onClick={() => setShowClearModal(true)}>Clear All Data</button>
    </div>
    {showClearModal && <Modal title="Clear All Data" onClose={() => { setShowClearModal(false); setClearPassword("") }}>
      <form onSubmit={e => { e.preventDefault(); handleClearData() }} className="form">
        <p style={{ color: "#d32f2f", fontWeight: "bold" }}>⚠️ This will permanently delete all orders and bills. This cannot be undone!</p>
        <label>Enter Password to Confirm<input type="password" placeholder="Enter password" value={clearPassword} onChange={e => setClearPassword(e.target.value)} required autoFocus /></label>
        <div className="action-row"><button type="button" className="secondary" onClick={() => { setShowClearModal(false); setClearPassword("") }}>Cancel</button><button type="submit" className="secondary danger">Clear All Data</button></div>
      </form>
    </Modal>}
  </div>;
}

function Toolbar({ title, search, setSearch, action, label }) { return <div className="toolbar"><div><h1>{title}</h1><p>Manage your restaurant data.</p></div><div className="toolbar-actions">{search !== undefined && <div className="search"><Search size={18} /><input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>}{action && <button className="primary" onClick={action}><Plus size={18} />{label}</button>}</div></div> }

function Modal({ title, onClose, children }) { return <div className="modal-bg" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal"><div className="modal-head"><h3>{title}</h3><button onClick={onClose}><X /></button></div>{children}</div></div> }

function ReceiptContent({ bill, settings }) {
  return <div className="receipt"><h2>{settings?.restaurant_name || "My Restaurant"}</h2><p>{settings?.address}</p><p>{settings?.phone}</p><hr /><div>Bill: {bill.bill_no}</div><div>{new Date(bill.created_at).toLocaleString()}</div><hr />{bill.items?.map((x, i) => <div className="rline" key={i}><span>{x.item_name} x{x.quantity}</span><span>{money(x.amount)}</span></div>)}<hr /><div className="rline bold"><span>TOTAL</span><span>{money(bill.total)}</span></div><div className="center">Payment: {bill.payment_method}</div><hr /><div className="center">Thank You! Visit Again</div></div>
}
function escPosBytes(text) {
  return new TextEncoder().encode(text);
}
function concatBytes(...arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  arrays.forEach(a => { out.set(a, offset); offset += a.length; });
  return out;
}
function toBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}
function padRight(value, length) {
  const s = String(value ?? "");
  return s.length >= length ? s.slice(0, length) : s + " ".repeat(length - s.length);
}
function padLeft(value, length) {
  const s = String(value ?? "");
  return s.length >= length ? s.slice(-length) : " ".repeat(length - s.length) + s;
}
function buildEscPosReceipt(bill, settings) {
  // 58mm printers normally use about 32 columns. Keep the receipt compact.
  const width = settings?.paper_size === "80mm" ? 48 : 32;
  const lines = [];
  const add = (text = "") => lines.push(String(text));
  const rule = () => add("-".repeat(width));
  const center = text => {
    const t = String(text || "");
    add(t.length >= width ? t.slice(0, width) : " ".repeat(Math.floor((width - t.length) / 2)) + t);
  };

  const restaurant = settings?.restaurant_name || "My Restaurant";
  center(restaurant);
  if (settings?.address) String(settings.address).split(/\\n|,/).forEach(x => center(x.trim()));
  if (settings?.phone) center(settings.phone);
  rule();
  add(`Bill: ${bill.bill_no}`);
  add(new Date(bill.created_at).toLocaleString());
  rule();

  (bill.items || []).forEach(x => {
    const name = String(x.item_name || x.name || "Item");
    const qty = Number(x.quantity || 0);
    const amount = Number(x.amount || (Number(x.price || 0) * qty) || 0).toFixed(2);
    const qtyText = `x${qty}`;
    const right = `${qtyText} ${amount}`;
    const available = Math.max(1, width - right.length - 1);
    if (name.length <= available) {
      add(padRight(name, available) + " " + right);
    } else {
      let remaining = name;
      while (remaining.length > available) {
        add(remaining.slice(0, available));
        remaining = remaining.slice(available);
      }
      add(padRight(remaining, available) + " " + right);
    }
  });
  rule();
  const total = Number(bill.total || 0).toFixed(2);
  add(padRight("TOTAL", width - total.length - 1) + " " + total);
  add(`Payment: ${bill.payment_method || "Cash"}`);
  rule();
  center("Thank You! Visit Again");
  add("");
  add("");
  add("");

  const ESC = 0x1b, GS = 0x1d;
  const init = new Uint8Array([ESC, 0x40]);
  const centerCmd = new Uint8Array([ESC, 0x61, 0x01]);
  const leftCmd = new Uint8Array([ESC, 0x61, 0x00]);
  const boldOn = new Uint8Array([ESC, 0x45, 0x01]);
  const boldOff = new Uint8Array([ESC, 0x45, 0x00]);
  const cut = new Uint8Array([GS, 0x56, 0x41, 0x03]);
  const lf = new Uint8Array([0x0a]);
  const text = escPosBytes(lines.join("\n") + "\n");
  return concatBytes(init, leftCmd, text, cut);
}

function printKitchenTicket(ticket, settings) {
  const width = settings?.paper_size === "80mm" ? 48 : 32;
  const lines = [];
  const add = value => lines.push(String(value ?? ""));
  const center = value => {
    const text = String(value ?? "");
    add(text.length >= width ? text.slice(0, width) : " ".repeat(Math.floor((width - text.length) / 2)) + text);
  };
  const rule = () => add("-".repeat(width));

  center("KITCHEN ORDER");
  rule();
  add(`Order: ${ticket.bill_no}`);
  add(new Date(ticket.created_at).toLocaleString());
  rule();
  (ticket.items || []).forEach(item => {
    const text = `${Number(item.quantity || 0)} x ${item.item_name || item.name || "Item"}`;
    for (let i = 0; i < text.length; i += width) add(text.slice(i, i + width));
  });
  rule();
  center("PLEASE PREPARE");
  add(""); add(""); add("");

  const ESC = 0x1b, GS = 0x1d;
  const init = new Uint8Array([ESC, 0x40]);
  const bytes = concatBytes(init, escPosBytes(lines.join("\n") + "\n"), new Uint8Array([GS, 0x56, 0x41, 0x03]));
  const rawbtUrl = `rawbt:base64,${toBase64(bytes)}`;

  if (/Android/i.test(navigator.userAgent)) {
    window.location.href = rawbtUrl;
    return;
  }

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  const html = `<!doctype html><html><head><title>Kitchen ${escapeHtml(ticket.bill_no)}</title><style>@page{size:${settings?.paper_size || "58mm"} auto;margin:0}body{font-family:monospace;width:${settings?.paper_size === "80mm" ? "80mm" : "58mm"};margin:0 auto;padding:3mm;box-sizing:border-box;font-size:12px;white-space:pre-wrap}h3{text-align:center}</style></head><body><h3>KITCHEN ORDER</h3>${escapeHtml([`Order: ${ticket.bill_no}`, new Date(ticket.created_at).toLocaleString(), "------------------------------", ...(ticket.items || []).map(item => `${item.quantity} x ${item.item_name || item.name || "Item"}`), "------------------------------", "PLEASE PREPARE"].join("\n"))}<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script></body></html>`;
  const win = window.open("", "_blank", "width=420,height=700");
  if (!win) return alert("Please allow popups for printing.");
  win.document.write(html);
  win.document.close();
}

function printReceipt(bill, settings) {
  // Android Bluetooth thermal printers using Bluetooth Classic/SPP cannot be
  // reached directly by Chrome. RawBT acts as the local ESC/POS print bridge.
  const bytes = buildEscPosReceipt(bill, settings);
  const base64 = toBase64(bytes);
  const rawbtUrl = `rawbt:base64,${base64}`;

  const isAndroid = /Android/i.test(navigator.userAgent);
  if (isAndroid) {
    window.location.href = rawbtUrl;
    return;
  }

  // Desktop fallback: retain normal browser printing.
  const html = `<!doctype html><html><head><title>${bill.bill_no}</title><style>@page{size:${settings?.paper_size || "80mm"} auto;margin:0}body{font-family:Arial,sans-serif;width:${settings?.paper_size === "58mm" ? "58mm" : "80mm"};margin:0 auto;padding:5mm;box-sizing:border-box;font-size:12px}.receipt{text-align:left}.center{text-align:center}.receipt h2{text-align:center;margin:0 0 4px;font-size:18px}.receipt p{text-align:center;margin:2px 0}.rline{display:flex;justify-content:space-between;gap:10px;margin:5px 0}.bold{font-weight:bold;font-size:15px}hr{border:0;border-top:1px dashed #000;margin:7px 0}</style></head><body>${document.querySelector(".receipt-preview")?.innerHTML || buildReceiptHTML(bill, settings)}<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\\/script></body></html>`;
  const w = window.open("", "_blank", "width=420,height=700");
  if (!w) return alert("Please allow popups for printing.");
  w.document.write(html);
  w.document.close();
}
function printTest(s) { const fake = { bill_no: "TEST", created_at: new Date().toISOString(), total: 0, payment_method: "TEST", items: [{ item_name: "Printer Test", quantity: 1, amount: 0 }] }; printReceipt(fake, s) }

function buildReceiptHTML(bill, settings) {
  const itemRows = (bill.items || []).map(x =>
    `<tr><td class="name">${x.item_name || x.name || "Item"} x${x.quantity}</td><td class="amt" style="text-align:right">${money(x.amount || (Number(x.price || 0) * (x.quantity || 1)))}</td></tr>`
  ).join("");
  return [
    `<div class="receipt">`,
    `<div class="rh2" style="text-align:center;font-weight:bold;font-size:16px">${settings?.restaurant_name || "SASH MANDI DARBAR"}</div>`,
    settings?.address ? `<div class="rp" style="text-align:center">${settings.address}</div>` : "",
    settings?.phone ? `<div class="rp" style="text-align:center">Ph: ${settings.phone}</div>` : "",
    `<hr style="border:0;border-top:1px dashed #000;margin:7px 0"/>`,
    `<div>Bill: ${bill.bill_no}</div>`,
    `<div>${new Date(bill.created_at || Date.now()).toLocaleString()}</div>`,
    `<hr style="border:0;border-top:1px dashed #000;margin:7px 0"/>`,
    `<table style="width:100%;border-collapse:collapse"><thead><tr><td style="text-align:left"><b>ITEM</b></td><td style="text-align:right"><b>AMT</b></td></tr></thead>`,
    `<tbody>${itemRows}</tbody></table>`,
    `<hr style="border:0;border-top:1px dashed #000;margin:7px 0"/>`,
    `<table style="width:100%;border-collapse:collapse"><tr><td style="font-weight:bold">TOTAL</td><td style="font-weight:bold;text-align:right">${money(bill.total)}</td></tr></table>`,
    `<div style="margin-top:4px">Payment: ${bill.payment_method || "Cash"}</div>`,
    `<hr style="border:0;border-top:1px dashed #000;margin:7px 0"/>`,
    `<div style="text-align:center;font-weight:bold;margin-top:4px">Thank You! Visit Again</div>`,
    `</div>`,
  ].join("");
}

export default App;


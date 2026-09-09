const CLEANER_BASE = "http://localhost:9100";

function withTimeout(promise, ms = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Printer bridge timeout")), ms))
  ]);
}

export async function getPrinterStatus() {
  try {
    const res = await withTimeout(fetch(`${CLEANER_BASE}/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store"
    }), 2500);

    let data = {};
    try { data = await res.json(); } catch { /* empty response */ }
    if (!res.ok) return { available: false, connected: false, data };

    return {
      available: true,
      connected: data?.printer?.connected !== false,
      data
    };
  } catch (error) {
    return { available: false, connected: false, error };
  }
}

function safeText(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .trim();
}

export function billToCleanterPayload(bill, settings = {}) {
  const content = [];
  const restaurant = safeText(settings.restaurant_name || "AJ Restaurant");
  const address = safeText(settings.address);
  const phone = safeText(settings.phone);

  content.push({ type: "text", text: restaurant, align: "center", bold: true, size: "large" });
  if (address) content.push({ type: "text", text: address, align: "center" });
  if (phone) content.push({ type: "text", text: phone, align: "center" });
  content.push({ type: "divider" });
  content.push({ type: "row", left: "Bill No", right: safeText(bill.bill_no) });
  content.push({ type: "row", left: "Date", right: new Date(bill.created_at).toLocaleString() });
  content.push({ type: "divider" });

  for (const item of bill.items || []) {
    const name = safeText(item.item_name || item.name || "Item");
    const qty = Number(item.quantity) || 0;
    const amount = Number(item.amount) || (Number(item.price) || 0) * qty;
    content.push({
      type: "row",
      left: `${name} x${qty}`,
      right: `₹${amount.toFixed(2)}`
    });
  }

  content.push({ type: "divider" });
  content.push({ type: "row", left: "TOTAL", right: `₹${Number(bill.total || 0).toFixed(2)}`, bold: true, size: "large" });
  content.push({ type: "text", text: `Payment: ${safeText(bill.payment_method || "Cash")}`, align: "center" });
  content.push({ type: "divider" });
  content.push({ type: "text", text: "Thank You! Visit Again", align: "center", bold: true });
  content.push({ type: "feed", lines: 3 });

  return {
    cut: true,
    paperWidth: settings.paper_size === "58mm" ? 58 : 80,
    content
  };
}

export async function printWithCleanter(bill, settings = {}) {
  const payload = billToCleanterPayload(bill, settings);
  const res = await withTimeout(fetch(`${CLEANER_BASE}/print`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }), 10000);

  let data = {};
  try { data = await res.json(); } catch { /* empty response */ }

  if (!res.ok) {
    const message = data?.fix || data?.error || `Cleanter returned HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export function cleanterHelpMessage(error) {
  const text = String(error?.message || "");
  if (/Failed to fetch|NetworkError|timeout/i.test(text)) {
    return "Cleanter was not reached. Open Cleanter on this Android device, select POS58UB as the default printer, and make sure its printer server is running. If this is the first HTTPS print, allow the browser's local-device permission.";
  }
  return text || "Unable to print through Cleanter.";
}

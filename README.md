# Restaurant Billing Software (Standalone Frontend Demo)

A simple, fast, client-side restaurant billing application demo.

## Features
- **Standalone Client App**: All data (menu items, categories, bills, settings) is managed locally in your browser (`localStorage`). No backend server or database setup required!
- **No Login Required**: Instant access to POS billing.
- **POS Billing & Cart**: Easily select items, search, filter categories, handle Cash/UPI/Split payments.
- **Thermal Receipt Printing**: Printable 80mm/58mm thermal receipt preview.
- **Bill History & Reports**: View today's sales summary and top-selling dishes.

## Running the Application Demo
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## Production Build
```bash
npm run build
```


## Bluetooth thermal printing (Cleanter + POS58UB)

This version is wired for the Cleanter Android thermal-printer bridge. Cleanter listens on `http://localhost:9100` and accepts `POST /print` JSON receipts. The billing app now sends **Save & Print**, **Reprint Bill**, and **Test Print** jobs to Cleanter instead of opening the browser print dialog.

### Android setup
1. Pair `POS58UB` in Android Bluetooth settings.
2. Open Cleanter and select `POS58UB` as the default printer.
3. In Cleanter settings select **58 mm** paper.
4. Open this billing website on the **same Android device**.
5. Go to **Settings → Printer Setup → Check Connection**.
6. Press **Test Print**.
7. Create a bill and press **Save & Print**.

For an HTTPS deployment, use Cleanter 1.1.0 or newer. On newer Chrome versions, the first request may ask for permission to access apps/services on the device; allow it.

### Deployment
The project is a Vite React app. Deploy the repository/project root to Vercel or Netlify using the existing configuration. The build command is `npm run build`; the frontend publish directory is `frontend/dist`. Do not deploy the old `frontend/dist` folder as a static-only site if you want the new Bluetooth integration—let the host run the build from the updated source.

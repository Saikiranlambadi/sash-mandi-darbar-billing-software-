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

## Android Bluetooth Thermal Printer

The billing page now supports Android Bluetooth ESC/POS printing through RawBT.

1. Install RawBT on the Android phone.
2. Pair the POS58UB/58mm thermal printer in Android Bluetooth settings.
3. Open RawBT and select the paired POS58UB printer.
4. In this billing website, set **Paper Size** to **58mm** in Settings.
5. Use **Save & Print**. On Android, the website sends an ESC/POS receipt to RawBT using its `rawbt:base64,` URL scheme.
6. Use **Kitchen Print** to print a separate kitchen ticket with the order reference and item quantities (without prices). Use **Save & Print** for the customer receipt.

Desktop browsers keep the normal browser print fallback.

RawBT reference: https://rawbt.ru/

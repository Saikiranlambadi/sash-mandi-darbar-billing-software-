AJ RESTAURANT BILLING - POS58UB / CLEANTER SETUP

1. Install Cleanter on the SAME Android phone/tablet where the billing website is opened.
2. Pair POS58UB in Android Bluetooth settings.
3. Open Cleanter and select POS58UB as the default printer.
4. Set Cleanter paper width to 58 mm.
5. Deploy/open this billing website on the same Android device.
6. Open Settings -> Printer Setup.
7. Press Check Connection.
8. Press Test Print.
9. Create a bill and press Save & Print.

The website sends receipt JSON to:
http://localhost:9100/print

If the connection fails:
- Keep Cleanter open/running.
- Confirm POS58UB is paired and powered on.
- Confirm POS58UB is selected as Cleanter's default printer.
- Use Cleanter 1.1.0 or newer for HTTPS sites.
- On recent Chrome, allow the first local-device permission prompt.

The source project is intended to be built by Vercel/Netlify. Run npm install and npm run build before local production use.

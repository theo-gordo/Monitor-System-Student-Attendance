# Monitoring-System

## Attendance dashboard

This project now persists campus data in an SQLite database through a lightweight Express API. The web page still behaves like the original browser-only prototype, but writes are saved to SQLite so the data can be retained outside the browser session.

### Run it locally

1. Install dependencies: `npm install`
2. Start the app: `npm start`
3. Open `http://localhost:3000`

### Notes

- The database file is created in `data/monitoring.sqlite`.
- The app still reads and writes through the `localStorage` interface to minimize changes to the existing dashboard logic.
- The persistence layer mirrors storage keys into the SQLite table `app_data`.

- The web dashboard is responsive for phones, tablets, laptops, and desktop browsers. On mobile, use the horizontally scrollable sidebar to navigate; on iPhone/iPad, open it in Safari. This is a website, not a native iOS or Android app.
- Students can time in as Present and time out once per day. Only admins can mark students Absent or Late using Quick actions → Mark attendance.
- Admins can monitor daily status totals and download attendance reports that include time-in and time-out values.
- Admins can register students individually or mass register them by pasting CSV data. The Students roster shows the registered-student count and lists accounts alphabetically with grade and strand filters; bulk imports skip duplicate IDs and provide a credentials CSV download.
- Admins can publish and edit campus announcements from Notifications. Updated announcements appear for students using this browser; announcement changes do not sync to another device.
- Students and admins can open the AI assistant for role-aware help with announcements, attendance, student concerns, and portal features. This prototype uses built-in guidance and data saved in the current browser; it is not connected to a live AI service.
- Click an event or notification to open its focused detail view. Click the profile chip to view account details.
- Open Messages to view conversations, write a message, and reply. Messages are saved locally in this browser and are not delivered to other devices.
- Students can submit concerns by category and follow their status and administrator replies. Admins can review all concerns, update a report to Received, In review, or Resolved, and send a written update to the reporting student.
- Students can find registered classmates, send and accept friend requests, chat with accepted friends, and attach images or common documents up to 2 MB. Student profiles have editable photos, About text, campus, and program / section details.

Student accounts, attendance records, messages, concerns, friendships, chats, attachments, and profiles are stored in the current browser's local storage and remain available after a page reload in that browser. Bulk registration accepts CSV columns `Student ID`, `Name`, `Grade`, `Strand`, and optional `Password`; blank passwords are generated and included in a credentials CSV that should be stored and shared securely. This is a local prototype: it does not deliver friend requests, messages, or files to another device or browser. Other users of the same browser can access its local data, so do not use this prototype for confidential conversations, sensitive files, or private student information. A shared backend with authenticated accounts and private file storage is required before deployment to students.
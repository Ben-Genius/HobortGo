# HobortGo 👋

**HobortGo** is a professional, high-performance delivery and shipment management mobile application built with Expo and React Native. It features a modern, flat brand aesthetic and robust role-based navigation for both administrators and delivery personnel.

---

## 🚀 Key Features

### 📦 For Delivery Personnel
- **My Deliveries**: A real-time queue of assigned shipments with status tracking.
- **Scan & Go**: Integrated QR and barcode scanner for quick pickup and delivery confirmation.
- **Proof of Delivery**: Seamlessly capture customer signatures and delivery photos.
- **Map Integration**: One-tap navigation to delivery addresses using native maps.
- **Notifications**: Instant alerts for new assignments and delivery updates.

### 🛡️ For Administrators
- **Shipment Overview**: Monitor all active, pending, and completed shipments.
- **Delivery Management**: Oversee delivery personnel and their current queues.
- **System Monitoring**: Comprehensive dashboard for logistics operations.

---

## 🛠️ Technology Stack

- **Core**: [Expo](https://expo.dev) & [React Native](https://reactnative.dev)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction) (File-based routing)
- **Styling**: [NativeWind](https://www.nativewind.dev) (Tailwind CSS for React Native)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com) & [Zod](https://zod.dev)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
- **Typography**: Manrope & Poppins (via Expo Google Fonts)
- **Icons**: Lucide & Ionicons (via Expo Symbols)

---

## 📂 Project Structure

- `app/`: Expo Router application routes (Logic & UI)
  - `(auth)/`: Authentication flow (Login, etc.)
  - `(tabs)/`: Administrator tab navigation
  - `(tabs-delivery)/`: Delivery personnel tab navigation
- `components/`: Shared UI components and themed views
- `src/`: Core business logic
  - `data/`: Mock data and shipment repositories
  - `store/`: Zustand state management (Auth, etc.)
  - `hooks/`: Custom React hooks (Theming, Auth, etc.)
- `assets/`: Images, illustrations, and local fonts

---

## 🏁 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application
```bash
npx expo start
```

Use the Expo Go app or a simulator to view the project. For a fresh start, use:
```bash
npx expo start --clear
```

---

## 📝 License

This project is private and intended for use by authorized personnel.

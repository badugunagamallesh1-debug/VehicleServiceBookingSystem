# Vehicle Service Booking System with Google Maps API

Welcome to the production-ready **Vehicle Service Booking System with Google Maps Platform**. This application is engineered as an industry-level, multi-role full-stack platform catering to **Customers**, **Mechanics**, and **System Administrators** with real-time location metrics and transactional integrity.

---

## 🛠️ System Architecture Diagram

```
       +---------------------------------------------+
       |             Client Tier (React)             |
       |  - Customer Module   - Mechanic Terminal   |
       |  - Admin Dashboard   - Google Maps JS SDK   |
       +----------------------+----------------------+
                              | (HTTPS / REST)
                              v
       +---------------------------------------------+
       |             Application Tier                |
       |  - Spring MVC REST   - JWT Secure Filters   |
       |  - Spring Data JPA   - Razorpay Order APIs  |
       +----------------------+----------------------+
                              |
                     +--------+--------+
                     |                 |
                     v                 v
       +-------------------+     +-------------------+
       |     MySQL 8.0     |     |   Redis Cache     |
       | (Transactional)   |     |  (Session/State)  |
       +-------------------+     +-------------------+
```

---

## 📂 Project Directory Structure

```
├── /                    # Project Workspace Root
├── /server.ts           # Full-Stack Node/Express + Vite Integration Server
├── /metadata.json       # Applet Metadata & Geolocation Permissions
├── /vite.config.ts      # Vite + Google Maps API Token Definer
├── /package.json        # Main Dependencies & Build Pipeline scripts
├── /src/
│   ├── main.tsx         # React Client App Bootstrapper
│   ├── App.tsx          # Master State Router & Navigation Header
│   ├── index.css        # Tailwind Typography Styles
│   ├── types.ts         # Shared Data Contract Types (Users, Bookings, Invoices)
│   ├── data.ts          # Seed Records, Services list & Spare Parts
│   └── components/
│       ├── MapContainer.tsx     # Google Maps React SDK (Real & Simulated Canvas)
│       ├── AuthPage.tsx         # JWT Auth Form + Quick Presets Panel
│       ├── CustomerDashboard.tsx# Vehicle Registry, Wizard Booking, Live Tracker, Payments
│       ├── MechanicDashboard.tsx# Active Jobs Board, Diagnostics Notes, Billable Spares
│       ├── AdminDashboard.tsx   # Analytics (Recharts), Dispatcher, Branch Maps
│       └── DeveloperPortal.tsx  # Interactive Architecture Viewer, SQL, Docker, Java Source Code
```

---

## 🔑 Environment Secrets Setup

The application automatically exposes active environment secrets inside the browser context without leaking keys to code files.

To configure your live **Google Maps JavaScript API key**:
1. Get an API key from the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/start).
2. Open **Settings** (⚙️ gear icon in the top-right corner of the AI Studio UI).
3. Select **Secrets** from the menu.
4. Type `GOOGLE_MAPS_PLATFORM_KEY` as the secret name.
5. Paste your Google Cloud API key as the value.
6. Press **Enter**. The application automatically recompiles and upgrades the vector map to live Google Maps satellite tiles!

---

## 🗄️ Database Schema & Tables (14 Entities)

The schema is built under strict 3rd Normal Form (3NF) relational rules:
1. `roles`: Authorizations (Customer, Mechanic, Admin).
2. `users`: Credentials (salted via BCrypt) and contacts.
3. `vehicles`: Customer car/bike profile mapping.
4. `service_centers`: Branch geo-coordinates.
5. `mechanics`: Live availability flags.
6. `services`: Upfront periodic price packages.
7. `bookings`: Master tracking ledger.
8. `payments`: Razorpay transaction logs.
9. `invoices`: Serial billing identifiers and downloadable PDF anchors.
10. `reviews`: Rating stars and comment feedback.
11. `notifications`: Alert feeds.
12. `service_history`: Complete archival logs.
13. `spare_parts`: Itemized warehouse hardware.
14. `pickup_requests`: Valet navigation vectors.

---

## 💻 Tech Stack Specifications

### Frontend Client
* **React 19 & TypeScript 5** (Strict Types)
* **Tailwind CSS** (Blue & White display theme)
* **@vis.gl/react-google-maps** (Google's official web mapping wrapper)
* **Recharts** (High-fidelity responsive SVG dashboards charts)
* **Lucide React** (Vector UI icons library)

### Enterprise Backend (Java Spring Boot 3 Template)
* **Java 21 & Spring Boot 3** MVC architecture
* **Spring Security** with role-based access control (`@PreAuthorize`)
* **BCrypt** Password Encryption
* **Stateless JWT Tokens** validation
* **Spring Data JPA** & Hibernate ORM mapping
* **Docker & Compose** containerization layouts

---

## 🚀 Step-by-Step Deployment Guide

To deploy the production-ready Java backend on your server:

### 1. Launch Docker Infrastructure
Move to the directory containing `docker-compose.yml` and execute:
```bash
docker-compose up -d --build
```
This boots three linked containers:
* **MySQL 8.0 Container** (Port 3306)
* **Redis Cache Container** (Port 6379)
* **Spring Boot JRE Container** (Port 8080)

### 2. Verify REST APIs
Endpoints are protected via bearer tokens:
* `POST /api/auth/register` (Public)
* `POST /api/auth/login` (Public)
* `GET /api/bookings` (Requires Customer/Mechanic/Admin token)
* `POST /api/bookings/{id}/assign` (Requires Admin token)
* `POST /api/bookings/{id}/status` (Requires Mechanic token)

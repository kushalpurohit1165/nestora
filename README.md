# Nestora - Hostel Management System

Nestora is a full-stack MERN web application for managing a boys' hostel with 4 blocks (A, B, C, D). Students can register securely, log in, see their room, pay fees and raise complaints. A warden manages rooms, fees, notices, pricing, the mess menu and the rules, with live statistics.

Built for the course MERNSTACK (ITUL503), Semester V, Assignment-II.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), react-router-dom, axios, plain CSS |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB (local) |
| Security | JWT, bcryptjs, CORS, dotenv |

## Features

- Student registration and login with JWT; the warden account is created by a seed script
- Role-based views: student pages and warden pages, protected routes
- 4 blocks, 3 floors each, 144 rooms, 288 beds (single, double, triple; AC in blocks A and B)
- Warden Room Grid with status colours, allot and vacate students, maintenance switch
- Fees: monthly rent and mess fee generation, manual payment recording, computed Overdue tag, refundable security deposit
- Complaints, notices, editable pricing, weekly mess menu, rules and facilities
- Dashboard statistics using Mongoose `aggregate()`
- "Real-time" updates by polling every 5 seconds
- Loading, empty and error states, toast alerts, responsive layout

## Folder structure

```
Nestora
├── client                 React app (Vite)
│   ├── public             logo and icons
│   └── src
│       ├── components     Navbar, Sidebar, Modal, Loader, StatusTag ...
│       ├── context        AuthContext, ToastContext
│       ├── hooks          useFetch (loading, error, polling)
│       ├── layouts        PublicLayout, DashboardLayout
│       ├── pages          public pages, student/, warden/
│       └── api.js         axios instance with JWT interceptor
└── server                 Express API
    ├── config             database connection
    ├── controllers        request logic (async/await CRUD)
    ├── middleware         logger, auth, role, validate, errorHandler
    ├── models             8 Mongoose schemas
    ├── routes             express.Router() files
    ├── utils              room helper functions
    ├── seed.js            creates rooms, pricing, menu, rules, warden
    └── server.js          app entry point
```

## Prerequisites

- Node.js and npm
- MongoDB Community Server running locally on `mongodb://127.0.0.1:27017`
- (Optional) MongoDB Compass to view the data

## Setup

### 1. Clone

```bash
git clone https://github.com/kushalpurohit1165/nestora.git
cd nestora
```

### 2. Server

```bash
cd server
npm install
```

Create `server/.env` (copy from `server/.env.example`):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/nestora
JWT_SECRET=change_this_to_a_long_random_text
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Load the starting data (144 rooms, pricing, mess menu, rules, facilities, warden):

```bash
node seed.js
```

Start the server:

```bash
npm run dev
```

The API runs at http://localhost:5000. Check http://localhost:5000/api/health.

### 3. Client

Open a second terminal:

```bash
cd client
npm install
```

Create `client/.env` (copy from `client/.env.example`):

```
VITE_API_URL=http://localhost:5000/api
```

Start the client:

```bash
npm run dev
```

Open http://localhost:5173.

## Default warden login

| Email | Password |
|---|---|
| warden@nestora.com | warden123 |

Students register themselves on the Register page. Running `node seed.js` again resets rooms, fees, pricing, menu and rules, and recreates the warden.

## Scripts

| Folder | Command | Purpose |
|---|---|---|
| server | `npm run dev` | start API with nodemon |
| server | `node seed.js` | load starting data |
| client | `npm run dev` | start React dev server |
| client | `npm run build` | production build |

## Future scope

Socket.io for true real-time updates, online payment gateway, email notifications, girls' hostel blocks.
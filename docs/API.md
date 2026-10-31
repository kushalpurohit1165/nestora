# Nestora API Documentation

Base URL: `http://localhost:5000/api`

## Common rules

**Headers**

| Header | Value | When |
|---|---|---|
| `Content-Type` | `application/json` | every request with a body |
| `Authorization` | `Bearer <token>` | every route marked Student, Warden or Logged in |

The token is returned by `POST /auth/login` and `POST /auth/register`.

**Access levels**

| Level | Meaning |
|---|---|
| Public | no token needed |
| Logged in | any valid token (student or warden) |
| Student | valid token; used by students (own data only) |
| Warden | valid token with role `warden` (students get 403) |

**Error format (all errors)**

```json
{ "success": false, "message": "Readable error text" }
```

**Status codes used**

| Code | Meaning |
|---|---|
| 200 | OK (read, update, delete) |
| 201 | Created |
| 400 | Bad request (validation failed, duplicate, business rule broken) |
| 401 | Not logged in, or token invalid or expired |
| 403 | Logged in but not allowed (wrong role or not your record) |
| 404 | Record or route not found |
| 500 | Server error |

---

## 1. Auth

| Method | Endpoint | Access | Body | Success |
|---|---|---|---|---|
| POST | `/auth/register` | Public | `name, email, password, phone, course?` | 201 |
| POST | `/auth/login` | Public | `email, password` | 200 |
| GET | `/auth/profile` | Logged in | none | 200 |
| PUT | `/auth/profile` | Logged in | `name?, phone?, course?` | 200 |

**Errors:** 400 (missing field, bad email, password under 6 characters, phone not 10 digits, email already exists), 401 (wrong email or password).

**POST /auth/register** request:

```json
{
  "name": "Test Student",
  "email": "test@example.com",
  "password": "123456",
  "phone": "9876543210",
  "course": "BCA"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "student",
  "user": { "_id": "6ae42bed...", "name": "Test Student", "email": "test@example.com", "role": "student" }
}
```

The role is always `student`. A warden cannot be created through this route.

**POST /auth/login** request: `{ "email": "warden@nestora.com", "password": "warden123" }`

Response `200`:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "warden",
  "user": { "_id": "6af1...", "name": "Hostel Warden", "email": "warden@nestora.com", "role": "warden" }
}
```

**GET /auth/profile** response `200`:

```json
{ "success": true, "user": { "_id": "6ae4...", "name": "Test Student", "email": "test@example.com", "phone": "9876543210", "course": "BCA", "role": "student" } }
```

---

## 2. Pricing

| Method | Endpoint | Access | Body | Success |
|---|---|---|---|---|
| GET | `/pricing` | Public | none | 200 |
| PUT | `/pricing` | Warden | `rents{6 values}, messCharge, securityDeposit` | 200 |

**Errors:** 404 (pricing not seeded), 403 (student).

GET response `200`:

```json
{
  "success": true,
  "pricing": {
    "rents": { "single_ac": 6000, "single_nonac": 4500, "double_ac": 4500, "double_nonac": 3200, "triple_ac": 3500, "triple_nonac": 2500 },
    "messCharge": 3000,
    "securityDeposit": 10000
  }
}
```

---

## 3. Mess menu

| Method | Endpoint | Access | Body | Success |
|---|---|---|---|---|
| GET | `/menu` | Public | none | 200 |
| PUT | `/menu/:day` | Warden | `breakfast, lunch, snacks, dinner` | 200 |

`:day` is `Monday` to `Sunday`. **Errors:** 404 (unknown day), 403.

GET response `200`:

```json
{
  "success": true,
  "menu": [
    { "_id": "6b01...", "day": "Monday", "breakfast": "Poha, Tea", "lunch": "Dal, Rice, Roti, Mixed Veg", "snacks": "Samosa, Tea", "dinner": "Paneer Curry, Roti, Rice" }
  ]
}
```

---

## 4. Rules and facilities (info)

| Method | Endpoint | Access | Body | Success |
|---|---|---|---|---|
| GET | `/info` | Public | none | 200 |
| POST | `/info` | Warden | `kind, category, text, order?` | 201 |
| PUT | `/info/:id` | Warden | `kind, category, text, order` | 200 |
| DELETE | `/info/:id` | Warden | none | 200 |

`kind` is `rule` or `facility`. **Errors:** 400 (missing field or invalid kind), 404 (id not found), 403.

GET response `200`:

```json
{ "success": true, "items": [ { "_id": "6c02...", "kind": "rule", "category": "Timings", "text": "The gate closes at 10:00 PM.", "order": 5 } ] }
```

---

## 5. Notices

| Method | Endpoint | Access | Body | Success |
|---|---|---|---|---|
| GET | `/notices` | Logged in | none | 200 |
| POST | `/notices` | Warden | `title, message` | 201 |
| PUT | `/notices/:id` | Warden | `title, message` | 200 |
| DELETE | `/notices/:id` | Warden | none | 200 |

**Errors:** 400 (missing field), 401 (no token), 404, 403.

GET response `200` (uses `populate`, so `postedBy` shows the name):

```json
{
  "success": true,
  "notices": [
    { "_id": "6d03...", "title": "Water cut", "message": "No water 2-4 PM on Sunday.", "postedBy": { "_id": "6af1...", "name": "Hostel Warden" }, "createdAt": "2026-11-01T08:30:00.000Z" }
  ]
}
```

---

## 6. Complaints

| Method | Endpoint | Access | Body | Success |
|---|---|---|---|---|
| GET | `/complaints/mine` | Student | none | 200 |
| POST | `/complaints` | Student | `title, description` | 201 |
| PUT | `/complaints/:id` | Student (own only) | `title?, description?` | 200 |
| DELETE | `/complaints/:id` | Student (own only) | none | 200 |
| GET | `/complaints` | Warden | none | 200 |
| PUT | `/complaints/:id/status` | Warden | `status` (`Pending` or `Resolved`) | 200 |

**Errors:** 400 (missing field, invalid status, editing a resolved complaint), 403 (someone else's complaint, or student calling a warden route), 404.

POST response `201`:

```json
{
  "success": true,
  "message": "Complaint raised",
  "complaint": { "_id": "6e04...", "user": "6ae4...", "title": "Fan not working", "description": "Ceiling fan makes noise", "status": "Pending", "createdAt": "2026-11-01T09:00:00.000Z" }
}
```

GET `/complaints` (warden) response `200` shows `user` as `{ "_id", "name", "email", "phone" }` using `populate`.

---

## 7. Students

| Method | Endpoint | Access | Body | Success |
|---|---|---|---|---|
| GET | `/students` | Warden | none | 200 |

Returns all users with role `student`, without passwords. Used for the Allot dropdown.

```json
{ "success": true, "students": [ { "_id": "6ae4...", "name": "Test Student", "email": "test@example.com", "phone": "9876543210", "course": "BCA", "role": "student" } ] }
```

---

## 8. Rooms

| Method | Endpoint | Access | Body | Success |
|---|---|---|---|---|
| GET | `/rooms/mine` | Logged in | none | 200 |
| GET | `/rooms/stats` | Warden | none | 200 (aggregation) |
| GET | `/rooms` | Warden | none | 200 |
| GET | `/rooms/:id` | Warden | none | 200 |
| POST | `/rooms` | Warden | `roomNo` | 201 |
| PUT | `/rooms/:id` | Warden | `maintenance` (true or false) | 200 |
| DELETE | `/rooms/:id` | Warden | none | 200 |
| POST | `/rooms/:id/allot` | Warden | `studentId` | 200 |
| POST | `/rooms/:id/vacate` | Warden | `studentId` | 200 |

**Errors**
- Allot: 400 (room full, under maintenance, student already in a room), 404 (room or student not found)
- Vacate: 400 (student is not in this room)
- Create: 400 (room number outside A101 to D312, or already exists)
- Delete: 400 (room still has students)
- Any: 403 (student), 404 (invalid room id)

Room status (`Vacant`, `Partially filled`, `Full`, `Maintenance`) is computed and returned as `status`.

**GET /rooms/:id** response `200`:

```json
{
  "success": true,
  "room": {
    "_id": "6e46...", "roomNo": "A105", "block": "A", "floor": 1, "type": "double", "ac": true,
    "capacity": 2, "maintenance": false,
    "occupants": [ { "_id": "6ae4...", "name": "Test Student", "email": "test@example.com", "phone": "9876543210", "course": "BCA" } ],
    "status": "Partially filled"
  }
}
```

**POST /rooms/:id/allot** request: `{ "studentId": "6ae4..." }`. Response `200`: `{ "success": true, "message": "Student allotted", "room": { ... } }`. A Pending security deposit fee is created if the student has none.

**POST /rooms/:id/vacate** request: `{ "studentId": "6ae4..." }`. Response `200`: `{ "success": true, "message": "Student vacated", "room": { ... } }`. A Paid deposit becomes `Refunded`; an unpaid one is removed.

**GET /rooms/mine** returns `{ "success": true, "room": { ... } }`, or `"room": null` if the student has no room.

**GET /rooms/stats** (Mongoose `aggregate()`) response `200`:

```json
{
  "success": true,
  "stats": {
    "byFloor": [ { "_id": { "block": "A", "floor": 1 }, "vacantRooms": 12, "partialRooms": 0, "fullRooms": 0, "maintenanceRooms": 0, "vacantBeds": 24 } ],
    "byType": [ { "_id": { "type": "double", "ac": true }, "rooms": 24, "totalBeds": 48, "occupiedBeds": 0 } ],
    "totals": { "totalRooms": 144, "totalBeds": 288, "occupiedBeds": 0, "vacantRooms": 144, "partialRooms": 0, "fullRooms": 0, "maintenanceRooms": 0 }
  }
}
```

---

## 9. Fees

| Method | Endpoint | Access | Body | Success |
|---|---|---|---|---|
| GET | `/fees/mine` | Logged in (own fees) | none | 200 |
| GET | `/fees/stats` | Warden | none | 200 (aggregation) |
| POST | `/fees/generate` | Warden | `month?` like `2026-11` | 201 |
| GET | `/fees` | Warden | none | 200 |
| PUT | `/fees/:id/pay` | Warden | none | 200 |

**Errors:** 400 (bad month format, fee already paid or refunded, pricing missing), 404 (fee not found), 403.

**GET /fees/mine** response `200` (`overdue` is computed from the date):

```json
{
  "success": true,
  "fees": [
    { "_id": "6f05...", "user": "6ae4...", "type": "mess", "month": "2026-10", "amount": 3000, "status": "Pending", "overdue": true },
    { "_id": "6f06...", "user": "6ae4...", "type": "deposit", "month": "", "amount": 10000, "status": "Paid", "paidOn": "2026-10-30T14:10:00.000Z", "overdue": false }
  ]
}
```

**POST /fees/generate** request `{}` or `{ "month": "2026-11" }`. Response `201`:

```json
{ "success": true, "message": "Fees generated for 2026-11: 2 created, 0 already existed", "created": 2, "skipped": 0 }
```

Running it again for the same month creates nothing new (duplicates are skipped).

**PUT /fees/:id/pay** response `200`: `{ "success": true, "message": "Fee marked as paid", "fee": { ... "status": "Paid", "paidOn": "..." } }`

**GET /fees/stats** (Mongoose `aggregate()`) response `200`:

```json
{
  "success": true,
  "stats": {
    "collected": 14500, "pending": 3000, "refunded": 0,
    "counts": { "paid": 2, "pending": 1, "refunded": 0 }
  }
}
```

---

## 10. Health check

| Method | Endpoint | Access | Success |
|---|---|---|---|
| GET | `/health` | Public | 200 `{ "success": true, "message": "Nestora API is running" }` |
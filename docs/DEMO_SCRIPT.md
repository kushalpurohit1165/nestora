# Nestora: Live Demo Script (about 8 minutes)

## Before the demo (2 minutes, do this first)

1. Start MongoDB (Windows Services, "MongoDB Server" must be Running).
2. Reset the data so the demo starts clean. In the server terminal:
   ```
   node seed.js
   ```
3. Start the server (`npm run dev` in `server`) and the client (`npm run dev` in `client`).
4. Open two browser windows side by side:
   - Window 1: the warden (normal window)
   - Window 2: the student (incognito window, so the logins do not clash)
5. Open MongoDB Compass, connect to `mongodb://127.0.0.1:27017`, open the `nestora` database.

Note: seed.js does not delete students. If an old test student exists, either use it or register a fresh one in step 2.

---

## Part 1: User authentication

1. **Home page** (`/`): show the logo, the rate card and the navbar. Say: "Public pages need no login."
2. **Register** (Window 2): click Register.
   - Click the Register button with empty fields: red validation messages appear (client-side validation).
   - Fill: name `Rahul Sharma`, email `rahul@example.com`, phone `9876543210`, course `BCA`, password `123456`, same confirm.
   - Submit: green toast, you land on the Student Dashboard. Say: "The server hashed the password with bcrypt and returned a JWT."
3. **Duplicate check:** log out, try registering the same email again. Red toast: "email already exists".
4. **Compass proof #1:** open `users`, refresh. Show Rahul's document. Point at the `password` field: a hash starting with `$2a$`, not the real password.
5. **Role protection:** while logged in as the student, type `/warden` in the address bar. You are redirected back to `/student`.
6. **Warden login** (Window 1): `warden@nestora.com` / `warden123`. Say: "The warden is created by the seed script, so nobody can self-register as a warden."

## Part 2: Dashboard navigation

7. **Warden dashboard** (Window 1): show the number cards, the block and floor table and the room type table. Say: "These come from Mongoose aggregate() pipelines." Open `/api/rooms/stats` if asked.
8. **Student dashboard** (Window 2): show "No room allotted yet". Keep it visible.
9. Click through the warden sidebar quickly (Room Grid, Manage Fees, Complaints, Notices, Pricing, Mess Menu, Rules) and the student sidebar (Dashboard, My Complaints, My Fees). Say: "Role-based sidebars, react-router with no page reloads."

## Part 3: CRUD operations

### Rooms (allot and vacate)

10. **Room Grid** (Window 1): Block A tab. Say the colours: green vacant, yellow partial, red full, blue maintenance.
11. Click tile **A105** (double, AC). In the side panel choose Rahul and click **Allot**.
    - Toast appears, tile turns yellow (1/2).
    - **Window 2 updates by itself within 5 seconds**: the student dashboard now shows room A105, Hall 1, block A. Say: "This is polling every 5 seconds with setInterval inside useEffect, with cleanup."
12. **Rule check:** try allotting Rahul to another room: error "Student is already in room A105".
13. Click **Open room details**: shows `/rooms/:id` (useParams). Go back.
14. Switch **Maintenance ON** for another room (for example A101): tile turns blue and allotting is blocked. Switch it back OFF.

### Fees

15. **Manage Fees**: click **Generate fees for this month**. Toast: "2 created". Click again: "0 created, 2 already existed" (no duplicates).
16. Click **Mark paid** on the deposit and on the rent. Window 2 > My Fees updates; the unpaid mess fee shows an **OVERDUE** tag (computed from the date, after the 5th).
17. Show the dashboard cards: collected vs pending.

### Complaints (full CRUD)

18. **Create** (Window 2): My Complaints, raise "Fan not working". Appears as PENDING.
19. **Update:** click Edit, change the description, save.
20. **Warden** (Window 1): Manage Complaints, click **Resolve**. Window 2 shows RESOLVED within 5 seconds.
21. **Delete** (Window 2): delete the complaint with the confirm box.

### Warden-managed content

22. **Notices:** post a notice in Manage Notices. It appears on the student dashboard.
23. **Pricing:** change Single AC to 6500, save. Open the public Home page: the rate card shows ₹6,500.
24. **Mess menu / Rules:** edit one meal, add one rule. Show the public pages update.

### Vacate and refund

25. Room Grid: click A105, click **Vacate** for Rahul. The tile turns green. In Manage Fees, the paid deposit now shows **REFUNDED**.

## Part 4: Database persistence (Compass)

26. In Compass, refresh and show each collection:
    - `rooms`: open A105, show the `occupants` array of ids (the relation).
    - `fees`: show rent, mess and deposit documents and their status values.
    - `complaints`, `notices`, `pricings` (rents changed to 6500).
    - Click the **Indexes** tab of `rooms`: show the `block_1_floor_1` index. Same for `fees` and `complaints` (status index).
27. **Persistence proof:** stop the server (`Ctrl + C`), start it again, refresh the browser. Everything is still there because it is stored in MongoDB.

## Closing line

"Nestora covers React with Context and routing, a REST API with middleware and JWT, Mongoose relations, indexes and aggregation, and polling for live updates. Socket.io is our future scope."

---

## If something goes wrong during the demo

| Problem                    | Fix                                                         |
| -------------------------- | ----------------------------------------------------------- |
| Page shows "Network Error" | The server is not running. Start `npm run dev` in `server`. |
| Login fails for the warden | Run `node seed.js` again.                                   |
| Student shows old data     | Press `Ctrl + F5`.                                          |
| Server will not start      | Start the MongoDB service in Windows Services.              |

# Notes Taking Application - Backend API 📝

A Node.js and Express RESTful API backend for a Notes Taking web application powered by **Neon PostgreSQL (Serverless)** and configured for seamless integration with a **React.js** frontend.

---

## 📁 Project Structure

```text
notes applicaiton/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Neon PostgreSQL connection pool & auto table creator
│   │   ├── controllers/
│   │   │   ├── authController.js   # User registration, login, and profile logic
│   │   │   └── noteController.js   # Complete Notes CRUD operations
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT authentication verification
│   │   │   └── errorHandler.js     # Centralized error & 404 handlers
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # /api/auth endpoints
│   │   │   └── noteRoutes.js       # /api/notes endpoints
│   │   ├── scripts/
│   │   │   └── initDb.js           # Database manual migration script
│   │   └── server.js               # Main Express application entrypoint
│   ├── .env                        # Local environment variables
│   ├── .env.example                # Template for environment configuration
│   ├── package.json                # Dependencies and scripts
│   └── schema.sql                  # PostgreSQL database schema definitions
└── frontend/                       # Reserved for your React.js frontend
```

---

## ⚡ Quick Start

### 1. Configure Neon DB Connection String
1. Sign in or sign up at [Neon.tech](https://console.neon.tech).
2. Create a new project (e.g. `notes-app`).
3. Copy your **PostgreSQL Connection String** (select *Pooled* or *Direct* connection).
4. Open [backend/.env](file:///c:/Users/kensb/OneDrive/Desktop/notes%20applicaiton/backend/.env) and paste it into `DATABASE_URL`:

```env
PORT=5000
NODE_ENV=development

# Paste your actual Neon DB connection string here:
DATABASE_URL=postgresql://neondb_owner:npg_xxxxxx@ep-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Secret for signing JWT authentication tokens
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# React Frontend URL (allows CORS between frontend & backend)
CLIENT_URL=http://localhost:5173
```

### 2. Start the Backend Server

```bash
# In the backend directory:
npm run dev
```

The server will automatically:
- Connect to Neon PostgreSQL with SSL enabled.
- Automatically create the `users` and `notes` tables if they don't already exist.
- Start listening on `http://localhost:5000`.

---

## 🔌 Connecting to Frontend (React.js)

The `.env` file contains:
```env
CLIENT_URL=http://localhost:5173
```
- When your React app runs on `http://localhost:5173` (Vite) or `http://localhost:3000` (Create React App), CORS is already configured to accept requests, send headers, and allow credentials.
- When you build the frontend later, you will simply configure the React app's API base URL to `http://localhost:5000/api`.

---

## 📚 API Endpoints

### 🩺 Health & Diagnostic
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and overview |
| `GET` | `/api/health` | Neon DB connection status and server health |

---

### 🔐 Authentication (`/api/auth`)

#### 1. Register User
- **URL**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "Alex Smith",
    "email": "alex@example.com",
    "password": "Password123"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "User registered successfully!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "user": {
      "id": 1,
      "name": "Alex Smith",
      "email": "alex@example.com",
      "createdAt": "2026-10-18T10:00:00.000Z"
    }
  }
  ```

#### 2. User Login
- **URL**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "Password123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Login successful!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "user": {
      "id": 1,
      "name": "Alex Smith",
      "email": "alex@example.com"
    }
  }
  ```

#### 3. Current User Profile
- **URL**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "name": "Alex Smith",
      "email": "alex@example.com"
    }
  }
  ```

---

### 📝 Notes CRUD (`/api/notes`)

> [!NOTE]
> All note routes automatically adapt: if you pass `Authorization: Bearer <token>`, notes are securely isolated to the logged-in user. If you make requests without a token, it operates in public/guest mode for quick testing!

#### 1. Get All Notes (with Search & Filters)
- **URL**: `GET /api/notes`
- **Optional Query Parameters**:
  - `?search=meeting` (searches title & content)
  - `?category=Work` (filters by category)
  - `?pinned=true` (filters pinned notes)
  - `?archived=false` (filters active or archived notes)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "count": 1,
    "notes": [
      {
        "id": 1,
        "title": "Project Roadmap",
        "content": "Discuss sprint goals and milestones",
        "category": "Work",
        "tags": ["roadmap", "planning"],
        "color": "#fef08a",
        "is_pinned": true,
        "is_archived": false,
        "created_at": "2026-10-18T10:00:00.000Z",
        "updated_at": "2026-10-18T10:00:00.000Z"
      }
    ]
  }
  ```

#### 2. Get Single Note by ID
- **URL**: `GET /api/notes/:id`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "note": { ... }
  }
  ```

#### 3. Create Note
- **URL**: `POST /api/notes`
- **Request Body**:
  ```json
  {
    "title": "Grocery List",
    "content": "- Apples\n- Almond milk\n- Oats",
    "category": "Personal",
    "tags": ["shopping", "weekly"],
    "color": "#bbf7d0",
    "is_pinned": false
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Note created successfully!",
    "note": { ... }
  }
  ```

#### 4. Update Note
- **URL**: `PUT /api/notes/:id`
- **Request Body**:
  ```json
  {
    "title": "Updated Grocery List",
    "content": "- Apples\n- Almond milk\n- Oats\n- Honey",
    "category": "Personal",
    "tags": ["shopping"],
    "color": "#fed7aa",
    "is_pinned": true,
    "is_archived": false
  }
  ```

#### 5. Toggle Pin Status
- **URL**: `PATCH /api/notes/:id/pin`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Note pinned successfully!",
    "note": { ... }
  }
  ```

#### 6. Delete Note
- **URL**: `DELETE /api/notes/:id`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Note deleted successfully!",
    "deletedId": 1
  }
  ```

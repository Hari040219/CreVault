## Backend (Node.js + Express + MongoDB)

This folder contains a simple backend API for handling video uploads for the Watch Wave Vibe app.

### Tech stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express
- **Database**: MongoDB (via Mongoose)
- **Uploads**: Multer (files stored on disk)

### Environment variables

Create a `.env` file in the project root (same level as `package.json`) with at least:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/watchwave
PORT=5000
```

### Scripts

From the project root:

- `npm run server` – start the backend only
- `npm run dev` – start the Vite frontend only
- `npm run dev:full` – start **both** backend and frontend together (uses `concurrently`)

### API overview

- `POST /api/videos`
  - `multipart/form-data`
  - Fields:
    - `title` (string, required)
    - `description` (string, optional)
    - `category` (string, optional)
    - `video` (file, required)
    - `thumbnail` (file, optional)
    - `authorId`, `authorName`, `authorAvatar` (optional, from frontend auth)
  - Response: created video document.

- `GET /api/videos`
  - Returns a list of all uploaded videos.

- `GET /api/videos/:id`
  - Returns a single video by its MongoDB `_id`.

### Static file URLs

Uploaded files are served statically:

- Videos: `/uploads/videos/<filename>`
- Thumbnails: `/uploads/thumbnails/<filename>`

Use `VITE_API_URL` in the frontend (e.g. `http://localhost:5000`) to build full URLs if needed.


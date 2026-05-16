# Notes API (Fi Money Intern Assignment)

A multi-user **notes backend** built with **NestJS**, **TypeScript**, and **PostgreSQL**. It exposes REST APIs for registration, JWT login, CRUD on personal notes, sharing notes with other users, OpenAPI documentation, and an about endpoint.

**Live base URL (after deploy):** `https://YOUR-SERVICE.onrender.com`

---

## Tech stack

| Layer | Choice |
|--------|--------|
| Runtime | Node.js 20+ |
| Framework | NestJS 10 |
| Language | TypeScript |
| Database | PostgreSQL |
| Auth | JWT (Bearer) + bcrypt |
| Hosting | [Render](https://render.com) (web + managed Postgres) |

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | No | Register with `email`, `password` → `201` |
| `POST` | `/login` | No | Login → `{ "access_token": "..." }` or `401` |
| `GET` | `/notes` | Bearer | List notes you created |
| `GET` | `/notes/:id` | Bearer | Get own note or a note shared with you |
| `POST` | `/notes` | Bearer | Create note → `201` |
| `PUT` | `/notes/:id` | Bearer | Update your note |
| `DELETE` | `/notes/:id` | Bearer | Delete your note → `204` |
| `POST` | `/notes/:id/share` | Bearer | Share with `share_with_email` |
| `GET` | `/openapi.json` | No | OpenAPI 3.0 spec |
| `GET` | `/about` | No | Candidate info + custom features |

### Custom feature

- **`PATCH /notes/:id/pin`** — Pin or unpin a note (`{ "pinned": true }`). Pinned notes appear first on `GET /notes`.

### Stretch goals included

- **`GET /notes?page=1&limit=10`** — Optional pagination
- **`GET /search?q=keyword`** — Search title/content of your notes
- **`Dockerfile`** — Container build support

### Response shape (notes)

```json
{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "created_at": "2026-05-16T12:00:00.000Z",
  "updated_at": "2026-05-16T12:00:00.000Z"
}
```

---

## Local development

### Prerequisites

- Node.js 20+
- PostgreSQL (local or Docker)

### Setup

```bash
cd notes-api
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, ABOUT_NAME, ABOUT_EMAIL
npm install
npm run start:dev
```

Server runs at `http://localhost:3000`.

### Example flow

```bash
# Register
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret12"}'

# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret12"}'

# Create note (replace TOKEN)
curl -X POST http://localhost:3000/notes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","content":"My first note"}'
```

---

## Deploy on Render

### Option A — Blueprint (`render.yaml`)

1. Push this repo to GitHub.
2. In Render: **New → Blueprint** → connect the repo (root: `notes-api` or repo root if you moved files).
3. Render creates the **web service** and **PostgreSQL** database.
4. Set environment variables in the dashboard:
   - `ABOUT_NAME` — your full name
   - `ABOUT_EMAIL` — your email
5. Wait for deploy; copy the web service URL for submission.

### Option B — Manual

1. **New PostgreSQL** on Render (free tier). Copy the **Internal Database URL** or **External** as needed.
2. **New Web Service** → connect GitHub repo.
   - **Root directory:** `notes-api` (if the app lives in that folder)
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm run start:prod`
3. Environment variables:

   | Key | Value |
   |-----|--------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Postgres connection string from Render |
   | `JWT_SECRET` | Long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `ABOUT_NAME` | Your name |
   | `ABOUT_EMAIL` | Your email |

4. Deploy and test: `https://YOUR-SERVICE.onrender.com/about`

> **Note:** Free Render services spin down after inactivity; the first request may take ~30–60 seconds.

---

## Project structure

```
src/
  auth/          # register, login, JWT strategy
  users/         # user entity & service
  notes/         # notes CRUD, share, pin
  search/        # GET /search (stretch)
  about/         # GET /about
  common/        # serializers
  main.ts        # bootstrap + /openapi.json
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Dev server with hot reload |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run production build |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2E tests (needs DB) |


# CRM - HubSpot-like App

A full-stack CRM application with React frontend, Express backend, and Heroku Postgres. Users must create an account to access the app.

## Tech Stack

- **Frontend**: React, React Router
- **Backend**: Express.js, PostgreSQL
- **Auth**: JWT (signup, login)
- **Hosting**: Heroku (with Heroku Postgres)

## Project Structure

```
cms/
├── client/          # React frontend
│   ├── public/
│   └── src/
├── server/          # Express backend
│   └── src/
├── Procfile         # Heroku process definition
└── package.json     # Root scripts
```

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL (local or use Heroku Postgres)

### 1. Install dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Set up the database

Create a PostgreSQL database and set the connection string. Copy the example env file:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/cms_dev
JWT_SECRET=your-secret-key-at-least-32-chars
CLIENT_URL=http://localhost:3000
```

### 3. Run the app

**Option A – Run both (recommended):**

```bash
npm run dev
```

This starts the backend on http://localhost:5000 and the frontend on http://localhost:3000.

**Option B – Run separately:**

```bash
# Terminal 1 – backend
npm run server

# Terminal 2 – frontend
npm run client
```

The React app proxies API requests to the backend during development.

### 4. Use the app

1. Open http://localhost:3000
2. Click **Sign up** and create an account
3. Sign in and access the dashboard

## Deploying to Heroku

### 1. Create a Heroku app

```bash
heroku create your-app-name
```

### 2. Add Heroku Postgres

```bash
heroku addons:create heroku-postgresql:essential-0
```

This sets `DATABASE_URL` automatically.

### 3. Set config vars

```bash
heroku config:set JWT_SECRET=your-production-secret-key-at-least-32-chars
heroku config:set NODE_ENV=production
```

### 4. Deploy

```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

Heroku will:

1. Run `heroku-postbuild` (install client deps, build React)
2. Start the web process (Express serves API + static React build)

### 5. Open the app

```bash
heroku open
```

## API Endpoints

| Method | Endpoint        | Auth | Description              |
|--------|-----------------|------|--------------------------|
| POST   | /api/auth/signup| No   | Create account           |
| POST   | /api/auth/login | No   | Sign in                  |
| GET    | /api/users/me   | Yes  | Get current user         |
| GET    | /api/health     | No   | Health check             |

Protected routes require the header: `Authorization: Bearer <token>`.

## Next Steps

- Add Contacts, Companies, and Deals
- Build pipelines and deal stages
- Add email campaigns and forms
- Implement workflow automation

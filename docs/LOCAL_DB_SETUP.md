# Local PostgreSQL Setup

## Step 1: Install PostgreSQL

### Option A: Homebrew (macOS)

```bash
brew install postgresql@15
brew services start postgresql@15
```

Add PostgreSQL to your PATH (add to `~/.zshrc`):

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Option B: Postgres.app (macOS – easiest)

1. Download from [postgresapp.com](https://postgresapp.com)
2. Drag to Applications and open it
3. Click "Initialize" to start the server
4. Add to PATH: `sudo mkdir -p /etc/paths.d && echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp`

### Option B: Official installer

Download from [postgresql.org/download/macos](https://www.postgresql.org/download/macos/)

---

## Step 2: Create the database

Open a terminal and run:

```bash
# Connect to PostgreSQL (default user is often your Mac username)
psql postgres

# Or if that fails, try:
psql -U postgres
```

Then in the `psql` prompt:

```sql
CREATE DATABASE cms_dev;
\q
```

---

## Step 3: Get your connection string

**If you're the only user on your Mac** (typical setup):

```
postgresql://petroscharitopoulos@localhost:5432/cms_dev
```

Replace `petroscharitopoulos` with your Mac username if different. Find it with:

```bash
whoami
```

**If you created a dedicated user:**

```
postgresql://cms_user:yourpassword@localhost:5432/cms_dev
```

---

## Step 4: Configure server/.env

Copy the example and add your `DATABASE_URL`:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set:

```
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/cms_dev
```

---

## Step 5: Verify

```bash
cd server
npm start
```

You should see "Database initialized" and "Server running on port 5000".

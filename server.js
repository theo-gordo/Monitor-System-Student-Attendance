const express = require("express");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATABASE_DIR = path.join(ROOT_DIR, "data");
const DATABASE_PATH = path.join(DATABASE_DIR, "monitoring.sqlite");

fs.mkdirSync(DATABASE_DIR, { recursive: true });

const db = new sqlite3.Database(DATABASE_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

async function initializeDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS app_data (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, status: "ready" });
});

app.get("/api/storage", async (req, res) => {
  const key = req.query.key;

  if (!key) {
    return res.status(400).json({ error: "Missing storage key" });
  }

  try {
    const row = await get("SELECT value FROM app_data WHERE key = ?", [String(key)]);
    res.json({ key, value: row ? row.value : null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/storage/all", async (_req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all("SELECT key, value FROM app_data ORDER BY key", (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });

    const values = {};
    rows.forEach((row) => {
      values[row.key] = row.value;
    });

    res.json({ values });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/storage", async (req, res) => {
  const { key, value } = req.body || {};

  if (!key) {
    return res.status(400).json({ error: "Missing storage key" });
  }

  try {
    const normalizedValue = typeof value === "string" ? value : JSON.stringify(value);
    await run(
      `INSERT INTO app_data (key, value) VALUES (?, ?) 
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
      [String(key), normalizedValue]
    );
    res.json({ ok: true, key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/storage", async (req, res) => {
  const key = req.query.key;

  if (!key) {
    return res.status(400).json({ error: "Missing storage key" });
  }

  try {
    await run("DELETE FROM app_data WHERE key = ?", [String(key)]);
    res.json({ ok: true, key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/storage/clear", async (_req, res) => {
  try {
    await run("DELETE FROM app_data");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(ROOT_DIR));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    next();
    return;
  }

  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SQLite monitoring system running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize SQLite database:", error);
    process.exit(1);
  });

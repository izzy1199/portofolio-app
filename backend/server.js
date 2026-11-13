const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function initDb() {
  // Database kadang belum siap pas backend baru nyala, jadi coba ulang
  for (let i = 0; i < 20; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pesan (
          id SERIAL PRIMARY KEY,
          nama TEXT NOT NULL,
          isi TEXT NOT NULL,
          dibuat TIMESTAMPTZ DEFAULT now()
        )`);
      console.log("Database siap");
      return;
    } catch (err) {
      console.log("Nunggu database...", err.code);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  process.exit(1);
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/pesan", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, nama, isi, dibuat FROM pesan ORDER BY id DESC LIMIT 20"
  );
  res.json(rows);
});

app.post("/api/pesan", async (req, res) => {
  const nama = String(req.body.nama || "").trim().slice(0, 100);
  const isi = String(req.body.isi || "").trim().slice(0, 1000);
  if (!nama || !isi) return res.status(400).json({ error: "Nama dan isi wajib diisi" });
  // Query berparameter ($1, $2) mencegah SQL injection
  const { rows } = await pool.query(
    "INSERT INTO pesan (nama, isi) VALUES ($1, $2) RETURNING id",
    [nama, isi]
  );
  res.status(201).json({ id: rows[0].id });
});

initDb().then(() => app.listen(4000, () => console.log("Backend jalan di :4000")));
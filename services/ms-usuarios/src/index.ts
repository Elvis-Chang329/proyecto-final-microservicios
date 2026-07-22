import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD
});

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const DEFAULT_USER_EMAIL = process.env.DEFAULT_USER_EMAIL || "admin@demo.local";
const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || "Admin123!";
const DEFAULT_USER_ROLE = process.env.DEFAULT_USER_ROLE || "admin";

async function ensureDefaultUser() {
  const existing = await pool.query("SELECT id FROM usuarios WHERE email=$1", [DEFAULT_USER_EMAIL]);

  if (existing.rows.length) {
    return;
  }

  const hash = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10);
  await pool.query(
    `
      INSERT INTO usuarios(email, password_hash, role)
      VALUES($1,$2,$3)
    `,
    [DEFAULT_USER_EMAIL, hash, DEFAULT_USER_ROLE]
  );
}

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, service: "ms-usuarios", db: "postgres" });
  } catch {
    res.status(500).json({ ok: false, error: "db_down" });
  }
});

app.post("/auth/register", async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email_password_required" });
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    const query = `
      INSERT INTO usuarios(email, password_hash, role)
      VALUES($1,$2,$3)
      RETURNING id, email, role
    `;
    const result = await pool.query(query, [email, hash, role || "lector"]);
    return res.status(201).json(result.rows[0]);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return res.status(409).json({ error: "email_exists" });
    }

    return res.status(500).json({ error: "register_failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM usuarios WHERE email=$1", [email]);

  if (!result.rows.length) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const user = result.rows[0] as {
    id: number | string;
    email: string;
    password_hash: string;
    role: string;
  };

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );

  return res.json({ token });
});

const PORT = Number(process.env.PORT) || 3001;

async function start() {
  try {
    await ensureDefaultUser();
  } catch (error) {
    console.error("failed_to_seed_default_user", error);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ms-usuarios on ${PORT}`);
    console.log(`default login: ${DEFAULT_USER_EMAIL}`);
  });
}

void start();

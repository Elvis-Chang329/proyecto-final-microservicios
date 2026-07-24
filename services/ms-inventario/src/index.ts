import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10
});

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, service: "ms-inventario", db: "mysql" });
  } catch {
    res.status(500).json({ ok: false, error: "db_down" });
  }
});

app.get("/productos", async (_req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT id, nombre, stock FROM productos ORDER BY id DESC");
  res.json(rows);
});

app.post("/productos", async (req, res) => {
  const { nombre, stock } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "nombre_required" });
  }

  const normalizedStock = Number(stock || 0);
  const [result] = await pool.query<ResultSetHeader>("INSERT INTO productos(nombre, stock) VALUES(?, ?)", [nombre, normalizedStock]);

  res.status(201).json({ id: result.insertId, nombre, stock: normalizedStock });
});

app.put("/productos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, stock } = req.body;

  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ error: "id_invalid" });
  }

  if (!nombre) {
    return res.status(400).json({ error: "nombre_required" });
  }

  const normalizedStock = Number(stock || 0);
  const [result] = await pool.query<ResultSetHeader>("UPDATE productos SET nombre = ?, stock = ? WHERE id = ?", [nombre, normalizedStock, id]);

  if (!result.affectedRows) {
    return res.status(404).json({ error: "producto_not_found" });
  }

  res.json({ id, nombre, stock: normalizedStock });
});

app.delete("/productos/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ error: "id_invalid" });
  }

  const [result] = await pool.query<ResultSetHeader>("DELETE FROM productos WHERE id = ?", [id]);

  if (!result.affectedRows) {
    return res.status(404).json({ error: "producto_not_found" });
  }

  res.status(204).send();
});

const PORT = Number(process.env.PORT) || 3002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`ms-inventario on ${PORT}`);
});

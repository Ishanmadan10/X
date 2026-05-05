const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "secretkey";

app.get('/', (req, res) => res.send("API Running"));

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING *",
    [email, hash]
  );
  res.json(result.rows[0]);
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  if (!user.rows.length) return res.status(401).send("User not found");

  const valid = await bcrypt.compare(password, user.rows[0].password_hash);
  if (!valid) return res.status(401).send("Invalid password");

  const token = jwt.sign({ id: user.rows[0].id }, SECRET);
  res.json({ token });
});

app.get('/products', async (req, res) => {
  const result = await pool.query("SELECT * FROM products");
  res.json(result.rows);
});

app.post('/orders', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  const result = await pool.query(
    "INSERT INTO orders (user_id, product_id, quantity) VALUES ($1,$2,$3) RETURNING *",
    [user_id, product_id, quantity]
  );
  res.json(result.rows[0]);
});

app.listen(3000, () => console.log("Server running"));

const express = require("express");
const cors = require("cors");
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

const app = express();
app.use(cors());
app.use(express.json());

/* ======================
   MENU STORE (SOURCE)
====================== */
let MENU = {
  Chaat: [
    { name: "Pani Puri", price: 10 },
    { name: "Masala Puri", price: 20 }
  ],
  Sandwich: [],
  Milkshakes: [],
  Desserts: [],
  Beverages: []
};

/* ======================
   ORDERS STORE
====================== */
let orders = [];

/* ======================
   MENU APIs
====================== */
app.get("/menu", (req, res) => {
  res.json(MENU);
});

app.post("/menu", (req, res) => {
  MENU = req.body;
  res.json({ success: true });
});

/* ======================
   ORDER APIs
====================== */
app.post("/order", (req, res) => {
  orders.push({
    id: Date.now(),
    ...req.body,
    time: new Date().toLocaleString()
  });
  res.json({ success: true });
});

app.get("/orders", (req, res) => {
  res.json(orders);
});

/* ✅ FIX: CLEAR ORDERS API */
app.delete("/orders", (req, res) => {
  orders = [];
  res.json({ cleared: true });
});

/* ======================
   SERVER
====================== */
app.listen(5000, () => {
  console.log("✅ Backend running at http://localhost:5000");
});

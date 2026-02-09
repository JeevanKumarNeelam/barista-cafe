const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express(); // ✅ CREATE APP FIRST

app.use(cors());
app.use(express.json());

// ✅ Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

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

/* CLEAR ORDERS */
app.delete("/orders", (req, res) => {
  orders = [];
  res.json({ cleared: true });
});

/* ======================
   SERVER
====================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});

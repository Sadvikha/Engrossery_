import express from "express";
import Order from "../models/Order.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items missing" });
    }

    const order = await Order.create({
      userId: req.user.id,
      items,
      deliveryAddress,
      paymentMethod,
      totalAmount,
      paymentStatus: "Pending",
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 🧑‍💻 User: Get only THEIR orders => GET /api/orders/user
router.get("/user", protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🧑‍💼 Admin: Fetch ALL Orders => GET /api/orders/admin
router.get("/admin", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🧑‍💼 Admin: Update Order Status => PATCH /api/orders/admin/:id
router.patch("/admin/:id", protect, adminOnly, async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;



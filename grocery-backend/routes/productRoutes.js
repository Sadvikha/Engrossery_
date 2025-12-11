// grocery-backend/routes/productRoutes.js
import express from "express";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/products
 * → Return ONLY DB products.
 *   (Default/demo products will be handled on the frontend)
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

router.post("/admin", protect, adminOnly, async (req, res) => {
  try {
    const normalize = (name) =>
      name.toLowerCase()
        .replace(/[0-9]/g, "")
        .replace(/\b(kg|g|gm|ml|ltr|liter|litre|pack|pcs|piece|pieces)\b/g, "")
        .replace(/[^a-z]/g, "")
        .replace(/s\b/, "")
        .trim();

    const incoming = normalize(req.body.name);

    const existing = await Product.find();

    const isDuplicate = existing.some(p => normalize(p.name) === incoming);

    if (isDuplicate) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const product = await Product.create(req.body);
    res.status(201).json(product);

  } catch (error) {
    console.error("Product creation failed:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
});



/**
 * PATCH /api/products/admin/:id
 * → Admin updates product / toggles inStock etc.
 */
router.patch("/admin/:id", protect, adminOnly, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ message: "Update failed" });
  }
});

/**
 * DELETE /api/products/admin/:id
 * → Admin deletes product from DB.
 */
router.delete("/admin/:id", protect, adminOnly, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;

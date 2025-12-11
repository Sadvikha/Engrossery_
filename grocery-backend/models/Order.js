import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: String,
        name: String,
        quantity: Number,
        price: Number,
      }
    ],
    deliveryAddress: String,
    paymentMethod: String,
    totalAmount: Number,
    paymentStatus: { type: String, default: "Pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);


import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    addresses: [
      {
        label: String,
        fullName: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        phone: String,
        isDefault: Boolean
      }
    ],
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);


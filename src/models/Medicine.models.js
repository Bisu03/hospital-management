import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    hsn: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "medicine_category",
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "supplier",
      required: true,
    },
    mrp: {
      type: Number,
    },
    rate: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
    },
    dis: {
      type: Number,
    },
    total: {
      type: Number,
      required: true,
    },
    bonus_qty: {
      type: Number,
    },
    packing_qty: {
      type: String,
    },
    stock: {
      type: Number,
      required: true,
    },
    stored: {
      type: String,
    },
    expiryDate: {
      type: String,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Medicine =
  mongoose.models.medicine || mongoose.model("medicine", medicineSchema);
export default Medicine;

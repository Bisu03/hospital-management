import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mrp: {
      type: Number,
    },
    unit_type: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Medicine =
  mongoose.models.medicine || mongoose.model("medicine", medicineSchema);
export default Medicine;

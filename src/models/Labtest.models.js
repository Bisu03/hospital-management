import mongoose from "mongoose";
const { Schema } = mongoose;

const labtestSchema = new Schema(
  {
    mrd_id: {
      type: String,
      required: true,
    },
    reg_id: {
      type: String,
    },
    bill_no: {
      type: String,
    },
    reporting_time: {
      type: String,
    },
    reporting_date: {
      type: String,
    },
    admited_in: {
      type: String,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient_registration",
    },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctors",
    },
    pathology_test_cart: {
      type: Object,
    },
    radiology_test_cart: {
      type: Object,
    },
    radiology_reading: {
      type: String,
    },
    amount: {
      type: Object,
    },
    paidby: {
      type: String,
    },
    admited_by: {
      type: String,
    },
    referr_by: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.lab_test ||
  mongoose.model("lab_test", labtestSchema);

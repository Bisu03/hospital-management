import mongoose from "mongoose";
const { Schema } = mongoose;

const ipdSchema = new Schema(
  {
    reg_id: {
      type: Number,
      required: true,
    },
    mrd_id: {
      type: Number,
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient_registration",
    },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctors",
    },
    admit_date: {
      type: String,
      required: true,
    },
    hight: {
      type: String,
    },
    weight: {
      type: String,
    },
    bp: {
      type: String,
    },
    discharge_date: {
      type: String,
    },
    admit_time: {
      type: String,
    },
    discharge_time: {
      type: String,
    },
    present_complain: {
      type: String,
    },
    medical_case: {
      type: String,
    },
    provisional_diagnosis: {
      type: String,
    },
    admission_charge: {
      type: String,
    },
    admit_type: {
      type: String,
    },
    paidby: {
      type: String,
    },
    referr_by: {
      type: String,
    },
    admited_by: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ipd || mongoose.model("ipd", ipdSchema);

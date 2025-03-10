// File: /models/HospitalConfig.js
import mongoose from "mongoose";

const hospitalConfigSchema = new mongoose.Schema({
  hid: { type: String, default: "hospitalinfo" },
  hospital_name: { type: String },
  address: { type: String },
  dist: { type: String },
  pin: { type: String },
  phone: { type: String },
  email: { type: String },
  hospital_code: { type: String },
  gst_number: { type: String },
  reg_number: { type: String },
  licence_number: { type: String },
  pan: { type: String },
  bank: { type: String },
  branch: { type: String },
  account: { type: String },
  logo: { type: String },
  banner: { type: String },
  language: { type: String, default: "English" },
  timezone: { type: String },
  currency: { type: String },
  currency_symbol: { type: String },
});

// Check if the model is already defined in mongoose.models
const HospitalConfig =
  mongoose.models.hospital_config ||
  mongoose.model("hospital_config", hospitalConfigSchema);

export default HospitalConfig;

import mongoose from "mongoose";
const { Schema } = mongoose;

const dischargeSchema = new Schema({
    reg_id: {
        type: String,
    },
    mrd_id: {
        type: String,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "patient_registration",
    },
    bill_no: {
        type: String,
    },
    ipd: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ipd",
    },
    consultant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctors",
    },
    final_diagnosis: {
        type: String,
    },
    discharge_summary: {
        type: String,
    },
    condition: {
        type: String,
    },
    advice: {
        type: String,
    },
    surgery: {
        type: String,
    },
    discharge_date: {
        type: String,
    },
    discharge_time: {
        type: String,
    },

}, {
    timestamps: true
});

export default mongoose.models.discharge || mongoose.model("discharge", dischargeSchema)
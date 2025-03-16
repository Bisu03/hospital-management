import mongoose from "mongoose";
const { Schema } = mongoose;

const patientSchema = new Schema({

    reg_id: {
        type: Number,
        required: true,
        unique: true
    },
    mrd_id: {
        type: Number,
        required: true,
    },
    admited_in: {
        type: String
    },
    billing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "billing",
    },
    ipd_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ipd",
    },
    opd_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "opd",
    },
    discharge_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "discharge",
    },
    fullname: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
        required: true,
    },
    age: {
        type: String,
    },
    dob: {
        type: String,
    },
    gender: {
        type: String,
    },
    blood_group: {
        type: String,
    },
    occupation: {
        type: String,
    },
    address: {
        type: String,
    },
    aadhar: {
        type: Number,
    },
    guardian_name: {
        type: String
    },
    religion: {
        type: String
    },
    guardian_phone: {
        type: String
    },
    referr_by: {
        type: String,
    },
    is_locked: {
        type: Boolean,
        default: false
    },
    admited_by: {
        type: String,
    },
}, {
    timestamps: true
});

export default mongoose.models.patient_registration || mongoose.model("patient_registration", patientSchema)
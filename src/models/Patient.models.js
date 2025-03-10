import mongoose from "mongoose";
const { Schema } = mongoose;

const patientSchema = new Schema({

    uh_id: {
        type: String,
        required: true,
    },
    reg_id: {
        type: String,
        required: true,
        unique: true
    },
    mrd_id: {
        type: String,
        required: true,
    },
    ipd_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ipd",
    },
    opd_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "opd",
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
    state: {
        type: String,
    },
    dist: {
        type: String,
    },
    city_vill: {
        type: String,
    },
    ps: {
        type: String,
    },
    po: {
        type: String,
    },
    pincode: {
        type: Number,
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
}, {
    timestamps: true
});

export default mongoose.models.patient_registration || mongoose.model("patient_registration", patientSchema)
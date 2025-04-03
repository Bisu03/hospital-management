import mongoose from "mongoose";
const { Schema } = mongoose;

const patientSchema = new Schema({

    reg_id: {
        type: Number,
    },
    mrd_id: {
        type: Number,
        required: true,
    },
    admited_in: {
        type: String
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
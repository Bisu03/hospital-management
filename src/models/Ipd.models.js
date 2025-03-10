import mongoose from "mongoose";
const { Schema } = mongoose;

const ipdSchema = new Schema({

    uh_id: {
        type: String,
        required: true,
    },
    reg_id: {
        type: String,
        required: true,
    },
    mrd_id: {
        type: String,
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
    paidby: {
        type: String,
    },
    bed_allotment: {
        type: Array,
    },
}, {
    timestamps: true
});

export default mongoose.models.ipd || mongoose.model("ipd", ipdSchema)
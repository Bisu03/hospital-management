import mongoose from "mongoose";
const { Schema } = mongoose;

const labtestSchema = new Schema({
    mrd_id: {
        type: String,
        required: true,
    },
    bill_no: {
        type: String
    },
    reporting_time: {
        type: String,
    },
    reporting_date: {
        type: String,
    },
    admited_in: {
        type: String
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
        type: Object
    },
    radiology_test_cart: {
        type: Object
    },
    amount: {
        type: Object
    },
    paydby: {      // New field (you might want to rename to 'paid_by' for proper spelling)
        type: String
    },
    admited_by: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.models.lab_test || mongoose.model("lab_test", labtestSchema);
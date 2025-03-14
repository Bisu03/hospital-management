import mongoose from "mongoose";
const { Schema } = mongoose;

const billingSchema = new Schema({

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
    bill_no: {
        type: String,
    },
    billing_date: {
        type: String,
    },
    billing_time: {
        type: String,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "patient_registration",
    },
    radiology_cart: {
        type: Object
    },
    pathology_cart: {
        type: Object
    },
    service_cart: {
        type: Object
    },
    discount: {
        type: Number,
    },
    gst: {
        type: Number,
    },
    due: {
        type: Number,
        default: 0
    },
    paidby: {
        type: String,
    },
}, {
    timestamps: true
});

export default mongoose.models.billing || mongoose.model("billing", billingSchema)
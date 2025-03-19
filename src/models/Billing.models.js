import mongoose from "mongoose";
const { Schema } = mongoose;

const billingSchema = new Schema({
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
    ipd: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ipd",
    },
    consultant_cart: {
        type: Object
    },
    acomodation_cart: {
        type: Object
    },
   
    service_cart: {
        type: Object
    },
    amount: {
        type: Object
    },
    paidby: {
        type: String,
    },
    isDone: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.models.billing || mongoose.model("billing", billingSchema)
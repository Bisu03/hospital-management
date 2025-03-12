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
        required: true,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "patient_registration",
    },
    service_cart: {
        type: Object
    },
    paidby: {
        type: String,
    },
}, {
    timestamps: true
});

export default mongoose.models.billing || mongoose.model("billing", billingSchema)
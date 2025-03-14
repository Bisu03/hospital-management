import mongoose from "mongoose";
const { Schema } = mongoose;

const pathologySchema = new Schema({
    reg_id: {
        type: String,
        required: true,
    },
    mrd_id: {
        type: String,
        required: true,
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
    test_cart: {
        type: Object
    }
}, {
    timestamps: true
});

export default mongoose.models.pathology || mongoose.model("pathology", pathologySchema)
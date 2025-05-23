import mongoose from "mongoose";
const { Schema } = mongoose;

const serviceSchema = new Schema({
    categoryid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "service_category",
    },
    servicename: {
        type: String,
        required: true,
    },
    unittype: {
        type: String,
    },
    unitcharge: {
        type: String,
    },
}, {
    timestamps: true
});

export default mongoose.models.service || mongoose.model("service", serviceSchema);
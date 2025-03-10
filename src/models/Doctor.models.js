import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        drname: {
            type: String,
            require: true,
        },
        drinfo: {
            type: String,
        },
        contact: {
            type: String,
        },
        category: {
            type: String,
        },
    },
    { timestamps: true }
);

let Dataset =
    mongoose.models.doctors || mongoose.model("doctors", doctorSchema);
export default Dataset;
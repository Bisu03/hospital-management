import mongoose from "mongoose";

const incrementSchema = new mongoose.Schema({
    id: {
        type: String
    },
    seq: {
        type: Number
    }
})
export default mongoose.models.counter || mongoose.model("counter", incrementSchema);
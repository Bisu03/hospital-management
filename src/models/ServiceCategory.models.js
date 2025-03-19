import mongoose, { Schema } from "mongoose"

const serviceCatSchema = new Schema({
    category_name: {
        type: String,
    },
})

export default mongoose.models.service_category || mongoose.model("service_category", serviceCatSchema)
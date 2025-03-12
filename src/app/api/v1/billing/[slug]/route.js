import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Billing from "@/models//Billing.models"; // Mongoose  model
import Patient from "@/models/Patient.models"
import "@/models/Doctor.models"

export async function GET(req, context) {
    // Connect to the database
    await connectDB();

    // Get the session
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }
    try {
        const { slug } = await context.params;
        const data = await Billing.findOne({ bill_no: slug }).populate("patient");
        console.log(slug);
        
        // Return the message
        return NextResponse.json(
            { success: true, data },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}
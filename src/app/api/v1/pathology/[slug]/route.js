import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Pathology from "@/models/Pathology.models"; // Mongoose  model
import "@/models/Patient.models"
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
        const data = await Pathology.findOne({
            reg_id: slug
        }).populate("patient").populate("consultant").sort({ createdAt: -1 });
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

export async function PUT(req, context) {
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
        const body = await req.json();

        const data = await Pathology.findOneAndUpdate({
            reg_id: slug
        }, body)
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
export async function DELETE(req, context) {
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
        const body = await req.json();
        console.log(body);

        const data = await Pathology.findByIdAndDelete(slug)
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



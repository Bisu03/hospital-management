import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Discharge from "@/models/Discharge.models"
import "@/models/Patient.models"
import "@/models/Doctor.models"


export async function GET(req, context) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.unauthorized();

    try {
        const { slug } = await context.params;
        const data = await Discharge.findOne({ reg_id: slug }).populate("patient").populate("consultant");
        return NextResponse.json({
            
            success: true,
            data
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}
export async function PUT(req, context) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.unauthorized();

    try {
        const { slug } = await context.params;
        const body = await req.json();
        const data = await Discharge.findOneAndUpdate({ reg_id: slug }, { ...body }).populate("patient").populate("consultant");
        return NextResponse.json({
            message: "Discharge Done",
            success: true,
            data
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}


export async function DELETE(req, context) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.unauthorized();

    try {
        const { slug } = context.params;

        await Discharge.findByIdAndDelete(slug)

        return NextResponse.json({
            success: true,
            message: "Discharge Deleted Successfully",
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

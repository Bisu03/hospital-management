import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Discharge from "@/models/Discharge.models"


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
        return NextResponse.serverError(error);
    }
}

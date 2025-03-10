import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoConnection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import BedCategory from '@/models/BedCategory.models'; // Mongoose model

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
        const body = await req.json()
        await BedCategory.findByIdAndUpdate(slug, body);
        // Return the message
        return NextResponse.json(
            { success: true, message: "Category Update Successfully" },
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
        await BedCategory.findByIdAndDelete(slug);
        // Return the message
        return NextResponse.json(
            { success: true, message: "Category Deleted Successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}
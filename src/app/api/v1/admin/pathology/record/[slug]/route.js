import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoConnection";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import PathologyService from "@/models/Pathologyservice.models";
import "@/models/Pathologycategory.models"

export async function GET(req, context) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }
        const { slug } = await context.params;
        const result = await PathologyService.findOne({ reg_id: slug });
        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}
export async function DELETE(req, context) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }
        const { slug } = await context.params;
        const result = await PathologyService.findByIdAndDelete(slug);
        return NextResponse.json({
            success: true,
            message: "Item Deleted"
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

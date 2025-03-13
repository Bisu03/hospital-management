// app/api/pathology-service/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoConnection";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import PathologyService from "@/models/Pathologyservice.models";
import "@/models/Pathologycategory.models"

export async function GET(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }
        const result = await PathologyService.find({}).populate("pathology_category");
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

export async function POST(req) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { pathology_category, pathology_testname, unit, ref_value } = body;

        // Validation
        if (!pathology_testname) {
            return NextResponse.json(
                { success: false, message: "Test name is required" },
                { status: 400 }
            );
        }

        const newService = await PathologyService.create({
            pathology_category,
            pathology_testname,
            unit,
            ref_value
        });

        return NextResponse.json({
            success: true,
            message: "Test created successfully",
            data: newService
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(req.url);
        const serviceId = searchParams.get("id");
        const body = await req.json();

        const updatedService = await PathologyService.findByIdAndUpdate(
            serviceId,
            body,
            { new: true }
        ).populate("pathology_category");

        if (!updatedService) {
            return NextResponse.json(
                { success: false, message: "Service not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Service updated successfully",
            data: updatedService
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(req.url);
        const serviceId = searchParams.get("id");

        const deletedService = await PathologyService.findByIdAndDelete(serviceId);

        if (!deletedService) {
            return NextResponse.json(
                { success: false, message: "Service not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Service deleted successfully"
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}
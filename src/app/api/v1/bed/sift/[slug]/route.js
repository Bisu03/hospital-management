import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoConnection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Billing from "@/models/Billing.models"
import Bed from '@/models/Bed.models'; // Mongoose model
import "@/models/BedCategory.models"

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
        const body = await req.json();
        const { slug } = await context.params;

        const bdata = await Bed.findByIdAndUpdate(
            slug,
            { isAllocated: true, patitentID: body?.ipdid },
            { new: true }
        ).populate("bed_category");

        if (bdata) {
            await Billing.updateOne({ patient: body?.ipdid }, {
                $push: {
                    acomodation_cart: { items: [{ ...bdata, dateofadd: body?.siftdate }] },
                },
            })
            return NextResponse.json(
                { success: true, message: "Bed Alloted Successfully" },
                { status: 200 }
            );
        }
        // Return the message

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

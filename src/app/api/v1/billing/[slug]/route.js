import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Billing from "@/models//Billing.models"; // Mongoose  model
import Counter from "@/models/Counter.models";
import "@/models/Patient.models"

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
        const data = await Billing.findOne({
            reg_id: slug,
        }).populate("patient");
        // Return the message
        return NextResponse.json({ success: true, data }, { status: 200 });
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
        const { slug } = context.params;
        const body = await req.json();

        const updateData = {
            uh_id: body.uh_id,
            reg_id: body.reg_id,
            mrd_id: body.mrd_id,
            service_cart: body.service_cart,
            billing_date: body.billing_date,
            billing_time: body.billing_time,
            discount: body.discount,
            gst: body.gst,
            due: body.due,
            paidby: body.paidby,
            patient: body.patient?._id // Ensure patient reference is maintained
        };

        // Handle bill number generation
        if (!body.bill_no) {
            const counter = await Counter.findOneAndUpdate(
                { id: "billno" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            updateData.bill_no = counter.seq;
        }

        const updatedBill = await Billing.findByIdAndUpdate(
            slug,
            updateData,
            { new: true, runValidators: true }
        ).populate('patient');

        return NextResponse.json({
            success: true,
            message: "Billing Updated Successfully",
            data: updatedBill
        });

    } catch (error) {
        return NextResponse.serverError(error);
    }
}
export async function DELETE(req, context) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.unauthorized();

    try {
        const { slug } = context.params;

        const updatedBill = await Billing.findByIdAndDelete(slug)

        return NextResponse.json({
            success: true,
            message: "Billing Deleted Successfully",
        });

    } catch (error) {
        return NextResponse.serverError(error);
    }
}

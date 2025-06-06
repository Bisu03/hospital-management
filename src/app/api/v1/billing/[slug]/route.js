import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Billing from "@/models//Billing.models"; // Mongoose  model
import Counter from "@/models/Counter.models";
import Discharge from "@/models/Discharge.models";
import Bed from "@/models/Bed.models";
import "@/models/Patient.models";
import "@/models/Ipd.models";

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
        })
            .populate("patient")
            .populate("ipd");
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
        const { slug } = await context.params;
        const body = await req.json();
        let updatedBill;
        if (body.isDone === true) {
            if (body.bill_no) {
                await Bed.findOneAndUpdate(
                    { patitentID: body?.ipd?._id },
                    { isAllocated: false, patitentID: "" }, { new: true }
                )

                updatedBill = await Billing.findOneAndUpdate(
                    { reg_id: slug },
                    { ...body }
                );
            } else {
                let billno = null;
                billno = await Counter.findOneAndUpdate(
                    { id: "billno" },
                    { $inc: { seq: 1 } },
                    { new: true, upsert: true, setDefaultsOnInsert: true }
                );

                await Bed.findOneAndUpdate(
                    { patitentID: body?.ipd?._id },
                    { isAllocated: false, patitentID: "" }
                )
                updatedBill = await Billing.findOneAndUpdate(
                    { reg_id: slug },
                    { ...body, bill_no: billno.seq }
                );
                if (updatedBill) {
                    await Discharge.findOneAndUpdate({
                        reg_id: slug
                    }, {
                        bill_no: billno.seq,
                        discharge_date: body?.billing_date || null,
                        discharge_time: body?.billing_time || null,
                    }
                    );
                }

            }
        } else {
            updatedBill = await Billing.findOneAndUpdate({ reg_id: slug }, body);
        }

        return NextResponse.json({
            success: true,
            message: "Billing Updated Successfully",
            data: updatedBill,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        )
    }
}

export async function DELETE(req, context) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.unauthorized();

    try {
        const { slug } = context.params;

        const updatedBill = await Billing.findByIdAndDelete(slug);

        return NextResponse.json({
            success: true,
            message: "Billing Deleted Successfully",
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        )
    }
}

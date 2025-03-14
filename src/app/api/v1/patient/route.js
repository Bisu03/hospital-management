import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Patient from "@/models/Patient.models"; // Mongoose  model
import Billing from "@/models/Billing.models"; // Mongoose  model
import Counter from "@/models/Counter.models";

export async function GET(req) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const url = new URL(req.url);
        const searchTerm = url.searchParams.get("fullname");
        const idsearch = url.searchParams.get("id");

        if (idsearch) {
            const data = await Patient.findById(idsearch)
            return NextResponse.json({ success: true, data: data });
        } else {
            let data;
            if (searchTerm) {
                data = await Patient.find({
                    fullname: { $regex: searchTerm, $options: "i" }, // Case-insensitive search
                }).sort({ createdAt: -1 });
            } else {
                data = await Patient.find({}).sort({ createdAt: -1 });
            }

            return NextResponse.json({ success: true, data: data });
        }

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
        if (!body) {
            return NextResponse.json(
                { success: false, message: "Invalid request body" },
                { status: 400 }
            );
        }

        let uhid = null;
        let regid = null;
        let mrdid = null;

        if (!body.uh_id) {
            uhid = await Counter.findOneAndUpdate(
                { id: "uhid" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
        }

        regid = await Counter.findOneAndUpdate(
            { id: "regid" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!body.mrd_id) {
            mrdid = await Counter.findOneAndUpdate(
                { id: "mrdid" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
        }

        const { _id, ipd_id, opd_id, billing, ...newData } = body;

        let patientData;
        if (body.mrd_id) {
            patientData = await Patient.create({
                ...newData,
                reg_id: regid.seq,
            });
        } else {
            patientData = await Patient.create({
                ...newData,
                uh_id: uhid?.seq,
                reg_id: regid.seq,
                mrd_id: mrdid?.seq,
            });
        }

        if (patientData) {
            const billData = await Billing.create({
                uh_id: patientData.uh_id || newData?.uh_id,
                reg_id: regid.seq,
                mrd_id: patientData.mrd_id || newData?.mrd_id,
                patient: patientData._id,
            });

            if (billData) {
                await Patient.findByIdAndUpdate(patientData._id, { billing: billData._id });
            }
        }


        return NextResponse.json({
            success: true,
            message: "Patient Registered Successfully",
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
        const patientid = searchParams.get("id");

        const body = await req.json();
        await Patient.findByIdAndUpdate(patientid, body);
        return NextResponse.json({
            success: true,
            message: "Patient Updated Successfully",
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
        const patientid = searchParams.get("id");

        await Patient.findByIdAndDelete(patientid);

        return NextResponse.json({
            success: true,
            message: "Patient Deleted Successfully",
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

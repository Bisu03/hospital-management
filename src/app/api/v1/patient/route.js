import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Patient from "@/models/Patient.models"; // Mongoose Patient model
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

        let uhid;
        if (!body.uh_id) {
            uhid = await Counter.findOneAndUpdate(
                {
                    id: "uhid",
                },
                {
                    $inc: { seq: 1 },
                },
                { new: true }
            );

            if (uhid == null) {
                uhid = await Counter.create({
                    id: "uhid",
                    seq: 100,
                });
            }
        }

        let regid;
        regid = await Counter.findOneAndUpdate(
            {
                id: "regid",
            },
            {
                $inc: { seq: 1 },
            },
            { new: true }
        );

        if (regid == null) {
            regid = await Counter.create({
                id: "regid",
                seq: 10000,
            });
        }


        let mrdid;

        if (!body.mrd_id) {
            mrdid = await Counter.findOneAndUpdate(
                {
                    id: "mrdid",
                },
                {
                    $inc: { seq: 1 },
                },
                { new: true }
            );

            if (mrdid == null) {
                mrdid = await Counter.create({
                    id: "mrdid",
                    seq: 1000,
                });
            }
        }

        const { _id, ...newData } = body
        if (body.mrd_id) {
            await Patient.create({ ...newData, reg_id: regid.seq });
        } else {
            if (mrdid && uhid && regid) {
                await Patient.create({ ...newData, uh_id: uhid.seq, reg_id: regid.seq, mrd_id: mrdid.seq });
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
            message: "Patient Updated Successfully",
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

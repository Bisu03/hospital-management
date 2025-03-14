import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Opd from "@/models/Opd.models"; // Mongoose  model
import Counter from "@/models/Counter.models";
import Patient from "@/models/Patient.models"
import "@/models/Doctor.models"


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

        const url = new URL(req.url);
        const searchTerm = url.searchParams.get("search");
        const idsearch = url.searchParams.get("id");
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");

        if (idsearch) {
            const data = await Opd.findById(idsearch).populate("patient").populate("consultant");
            return NextResponse.json({ success: true, data });
        }

        const pipeline = [
            {
                $lookup: {
                    from: "patient_registrations",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patient"
                }
            },
            { $unwind: "$patient" },
            {
                $lookup: {
                    from: "doctors",
                    localField: "consultant",
                    foreignField: "_id",
                    as: "consultant"
                }
            },
            { $unwind: { path: "$consultant", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    ...(searchTerm && {
                        "patient.fullname": { $regex: searchTerm, $options: "i" }
                    }),
                    ...(startDate && endDate && {
                        consultant_date: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    })
                }
            },
            { $sort: { consultant_date: -1 } }
        ];

        const data = await Opd.aggregate(pipeline);
        return NextResponse.json({
            success: true,
            data,
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


        const {
            uh_id,
            reg_id,
            mrd_id,
            patient,
            consultant,
            on_examin,
            pulse,
            spo2,
            jaundice,
            pallor,
            cvs,
            resp_system,
            gi_system,
            nervious_system,
            consultant_date,
            consultant_time,
            present_complain,
            medical_case,
            opd_fees,
            paidby,
            provisional_diagnosis,
        } = body;

        const data = await Opd.create({
            ...body,
            patient,
            consultant,
        });
        if (data) {
            await Patient.findByIdAndUpdate(patient, { opd_id: data._id, admited_in: "OPD" });
        }
        return NextResponse.json({
            success: true,
            message: "Patient Admited Successfully",
            data
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
        await Opd.findByIdAndUpdate(patientid, body);
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

        await Opd.findByIdAndDelete(patientid);
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

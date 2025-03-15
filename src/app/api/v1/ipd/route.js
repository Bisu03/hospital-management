import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Ipd from "@/models/Ipd.models"; // Mongoose  model
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
        const searchTerm = url.searchParams.get("fullname");
        const idsearch = url.searchParams.get("id");
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");

        if (idsearch) {
            const data = await Ipd.findById(idsearch)
                .populate("patient")
                .populate("consultant");
            return NextResponse.json({ success: true, data });
        } else {
            const matchConditions = {};

            if (searchTerm) {
                matchConditions["patient.fullname"] = { $regex: searchTerm, $options: "i" };
            }

            if (startDate && endDate) {
                matchConditions["admit_date"] = {
                    $gte: startDate,
                    $lte: endDate
                };
            } else if (startDate) {
                matchConditions["admit_date"] = { $gte: startDate };
            } else if (endDate) {
                matchConditions["admit_date"] = { $lte: endDate };
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
                { $match: matchConditions },
                { $sort: { admit_date: -1 } }
            ];

            const data = await Ipd.aggregate(pipeline);

            return NextResponse.json({
                success: true,
                data
            });
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

        const {
            uh_id,
            reg_id,
            mrd_id,
            patient,
            hight,
            weight,
            bp,
            admission_charge,
            paidby,
            consultant,
            admit_date,
            admit_time,
            present_complain,
            medical_case,
            provisional_diagnosis,
        } = body;

        const data = await Ipd.create({
            // Use spread operator to simplify
            ...body,
            patient,
            consultant
        });

        if (data) {
            await Patient.findByIdAndUpdate(patient, {
                ipd_id: data._id,
                admited_in: "IPD"
            });
        }

        return NextResponse.json({
            success: true,
            message: "Patient Admitted Successfully",
            data,
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
        await Ipd.findByIdAndUpdate(patientid, body);
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

        await Ipd.findByIdAndDelete(patientid);
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

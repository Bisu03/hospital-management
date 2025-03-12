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
        const page = parseInt(url.searchParams.get("page")) || 1;
        const limit = parseInt(url.searchParams.get("limit")) || 10;

        if (idsearch) {
            const data = await Ipd.findById(idsearch).populate("patient").populate("consultant");
            return NextResponse.json({ success: true, data });
        } else {
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
                ...(searchTerm
                    ? [
                        {
                            $match: {
                                "patient.fullname": { $regex: searchTerm, $options: "i" }
                            }
                        }
                    ]
                    : []),
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
                {
                    $facet: {
                        data: [{ $match: {} }],
                        totalCount: [{ $count: "total" }]
                    }
                }
            ];

            const result = await Ipd.aggregate(pipeline);
            const data = result[0]?.data || [];
            const total = result[0]?.totalCount?.[0]?.total || 0;

            return NextResponse.json({
                success: true,
                data,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total
                }
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

        // let uhid;
        // uhid = await Counter.findOneAndUpdate(
        //     {
        //         id: "uhid",
        //     },
        //     {
        //         $inc: { seq: 1 },
        //     },
        //     { new: true }
        // );

        // if (uhid == null) {
        //     uhid = await Counter.create({
        //         id: "uhid",
        //         seq: 100,
        //     });
        // }

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
            uh_id,
            reg_id,
            mrd_id,
            hight,
            weight,
            bp,
            admission_charge,
            paidby,
            patient,
            consultant,
            admit_date,
            admit_time,
            present_complain,
            medical_case,
            provisional_diagnosis,
        });
        if (data) {
            await Patient.findByIdAndUpdate(patient, { ipd_id: data._id });
        }
        return NextResponse.json({
            success: true,
            message: "Patient Admited Successfully",
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

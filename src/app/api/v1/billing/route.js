import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Billing from "@/models//Billing.models"; // Mongoose  model
import "@/models/Patient.models"


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
        const searchParams = {
            search: url.searchParams.get('search') || '',
            billNo: url.searchParams.get('billNo') || '',
            startDate: url.searchParams.get('startDate'),
            endDate: url.searchParams.get('endDate')
        };

        // Build match conditions
        const matchConditions = {
            ...(searchParams.billNo && { bill_no: searchParams.billNo }),
            ...(searchParams.startDate || searchParams.endDate) && {
                billing_date: {
                    ...(searchParams.startDate && { $gte: searchParams.startDate }),
                    ...(searchParams.endDate && { $lte: searchParams.endDate })
                }
            }
        };

        const data = await Billing.aggregate([
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
                $match: {
                    $and: [
                        matchConditions,
                        {
                            $or: [
                                { "patient.fullname": { $regex: searchParams.search, $options: "i" } }
                            ]
                        }
                    ]
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return NextResponse.json({ success: true, data });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

// export async function POST(req) {
//     await connectDB();
//     const session = await getServerSession(authOptions);
//     if (!session) {
//         return NextResponse.json(
//             { success: false, message: "Unauthorized" },
//             { status: 401 }
//         );
//     }
//     try {
//         const body = await req.json();

//         // let uhid;
//         // uhid = await Counter.findOneAndUpdate(
//         //     {
//         //         id: "uhid",
//         //     },
//         //     {
//         //         $inc: { seq: 1 },
//         //     },
//         //     { new: true }
//         // );

//         // if (uhid == null) {
//         //     uhid = await Counter.create({
//         //         id: "uhid",
//         //         seq: 100,
//         //     });
//         // }

//         const {
//             uh_id,
//             reg_id,
//             mrd_id,
//             patient,
//             hight,
//             weight,
//             bp,
//             admission_charge,
//             paidby,
//             consultant,
//             admit_date,
//             admit_time,
//             present_complain,
//             medical_case,
//             provisional_diagnosis,
//         } = body;

//         const data = await Ipd.create({
//             uh_id,
//             reg_id,
//             mrd_id,
//             hight,
//             weight,
//             bp,
//             admission_charge,
//             paidby,
//             patient,
//             consultant,
//             admit_date,
//             admit_time,
//             present_complain,
//             medical_case,
//             provisional_diagnosis,
//         });
//         if (data) {
//             await Patient.findByIdAndUpdate(patient, { ipd_id: data._id });
//         }
//         return NextResponse.json({
//             success: true,
//             message: "Patient Admited Successfully",
//             data,
//         });
//     } catch (error) {
//         return NextResponse.json(
//             { success: false, message: "Server error", error: error.message },
//             { status: 500 }
//         );
//     }
// }

// export async function PUT(req) {
//     await connectDB();
//     const session = await getServerSession(authOptions);
//     if (!session) {
//         return NextResponse.json(
//             { success: false, message: "Unauthorized" },
//             { status: 401 }
//         );
//     }
//     try {
//         const { searchParams } = new URL(req.url);
//         const patientid = searchParams.get("id");

//         const body = await req.json();
//         await Ipd.findByIdAndUpdate(patientid, body);
//         return NextResponse.json({
//             success: true,
//             message: "Patient Updated Successfully",
//         });
//     } catch (error) {
//         return NextResponse.json(
//             { success: false, message: "Server error", error: error.message },
//             { status: 500 }
//         );
//     }
// }

// export async function DELETE(req) {
//     await connectDB();
//     const session = await getServerSession(authOptions);
//     if (!session) {
//         return NextResponse.json(
//             { success: false, message: "Unauthorized" },
//             { status: 401 }
//         );
//     }
//     try {
//         const { searchParams } = new URL(req.url);
//         const patientid = searchParams.get("id");

//         await Ipd.findByIdAndDelete(patientid);
//         return NextResponse.json({
//             success: true,
//             message: "Patient Updated Successfully",
//         });
//     } catch (error) {
//         return NextResponse.json(
//             { success: false, message: "Server error", error: error.message },
//             { status: 500 }
//         );
//     }
// }

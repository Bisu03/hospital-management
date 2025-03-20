import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Ipd from "@/models/Ipd.models"; // Mongoose  model
import Counter from "@/models/Counter.models";
import Patient from "@/models/Patient.models";
import Billing from "@/models/Billing.models";
import Bed from "@/models/Bed.models"; 
import Discharge from "@/models/Discharge.models"; 

import "@/models/BedCategory.models";

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
            const data = await Ipd.findOne({ reg_id: idsearch })
                .populate("patient")
                .populate("consultant");
            return NextResponse.json({ success: true, data });
        } else {
            const matchConditions = {};

            if (searchTerm) {
                matchConditions["patient.fullname"] = {
                    $regex: searchTerm,
                    $options: "i",
                };
            }

            if (startDate && endDate) {
                matchConditions["admit_date"] = {
                    $gte: startDate,
                    $lte: endDate,
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
                        as: "patient",
                    },
                },
                { $unwind: "$patient" },
                {
                    $lookup: {
                        from: "doctors",
                        localField: "consultant",
                        foreignField: "_id",
                        as: "consultant",
                    },
                },
                { $unwind: { path: "$consultant", preserveNullAndEmptyArrays: true } },
                { $match: matchConditions },
            ];

            const data = await Ipd.aggregate(pipeline).sort("-createdAt");

            return NextResponse.json({
                success: true,
                data,
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
        const url = new URL(req.url);
        const searchTerm = url.searchParams.get("bedid");

        let regid = null;
        let mrdid = null;

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

        const {
            fullname,
            phone_number,
            age,
            dob,
            gender,
            marital_status,
            occupation,
            blood_group,
            address,
            aadhar,
            guardian_name,
            religion,
            guardian_phone,
            referr_by,
            hight,
            weight,
            bp,
            admited_in,
            consultant,
            admission_charge,
            paidby,
            admit_date,
            admit_time,
            present_complain,
            medical_case,
            provisional_diagnosis,
            admited_by,
        } = body;

        const data = await Patient.create({
            fullname,
            phone_number,
            age,
            dob,
            gender,
            marital_status,
            occupation,
            blood_group,
            address,
            aadhar,
            guardian_name,
            religion,
            admited_by,
            guardian_phone,
            referr_by,
            reg_id: regid.seq,
            mrd_id: mrdid.seq,
        });

        if (data) {
            const ipddata = await Ipd.create({
                mrd_id: mrdid.seq,
                reg_id: regid.seq,
                hight,
                weight,
                bp,
                admission_charge,
                paidby,
                admit_date,
                admit_time,
                present_complain,
                medical_case,
                provisional_diagnosis,
                admited_by,
                admited_in,
                patient: data._id,
                consultant: consultant._id,
            });

            if (ipddata) {
                let beddata;
                if (searchTerm) {
                    beddata = await Bed.findByIdAndUpdate(searchTerm, {
                        patitentID: ipddata._id,
                        isAllocated: true,
                    }).populate("bed_category");
                }
                if (beddata) {
                    const bdata = {
                        bed_category: beddata.bed_category.bed_category,
                        bed_number: beddata.bed_number,
                        bed_charge: beddata.bed_charge,
                        dateofadd: admit_date,
                    };
                    await Billing.create({
                        reg_id: regid.seq,
                        mrd_id: mrdid.seq,
                        consultant_cart: {
                            items: [{ ...consultant }],
                            total: consultant.charge,
                        },
                        patient: data._id,
                        ipd: ipddata._id,
                        acomodation_cart: {
                            items: [bdata],
                        },
                    });

                    await Discharge.create({
                        reg_id: regid.seq,
                        mrd_id: mrdid.seq,
                        patient: data._id,
                        ipd: ipddata._id,
                    })

                    return NextResponse.json({
                        success: true,
                        message: "Patient Admitted Successfully",
                        data: ipddata,
                    });
                } else {
                    await Billing.create({
                        reg_id: regid.seq,
                        mrd_id: mrdid.seq,
                        consultant_cart: {
                            items: [{ ...consultant }],
                            total: consultant.charge,
                        },
                        patient: data._id,
                        ipd: ipddata._id,
                        acomodation_cart: { items: [], total: 0 },
                    });

                    await Discharge.create({
                        reg_id: regid.seq,
                        mrd_id: mrdid.seq,
                        patient: data._id,
                        ipd: ipddata._id,
                    })
                    return NextResponse.json({
                        success: true,
                        message: "Patient Admitted Successfully",
                        data: ipddata,
                    });
                }
            }
        }
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

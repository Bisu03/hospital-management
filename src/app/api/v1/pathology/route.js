// app/api/pathology/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoConnection";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Pathology from "@/models/Pathology.models";
import Patient from "@/models/Patient.models";
import Counter from "@/models/Counter.models";

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
            id: url.searchParams.get("id"),
            search: url.searchParams.get("search"),
            page: parseInt(url.searchParams.get("page")) || 1,
            limit: parseInt(url.searchParams.get("limit")) || 10,
        };

        if (searchParams.id) {
            const data = await Pathology.findById(searchParams.id).populate(
                "patient"
            );
            return NextResponse.json({ success: true, data });
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
            ...(searchParams.search
                ? [
                    {
                        $match: {
                            $or: [
                                {
                                    "patient.fullname": {
                                        $regex: searchParams.search,
                                        $options: "i",
                                    },
                                },
                                { reg_id: { $regex: searchParams.search, $options: "i" } },
                                { mrd_id: { $regex: searchParams.search, $options: "i" } },
                            ],
                        },
                    },
                ]
                : []),
            { $sort: { createdAt: -1 } },
            { $skip: (searchParams.page - 1) * searchParams.limit },
            { $limit: searchParams.limit },
            {
                $facet: {
                    data: [],
                    totalCount: [{ $count: "total" }],
                },
            },
        ];

        const result = await Pathology.aggregate(pipeline);
        const data = result[0]?.data || [];
        const total = result[0]?.totalCount?.[0]?.total || 0;

        return NextResponse.json({
            success: true,
            data,
            pagination: {
                currentPage: searchParams.page,
                totalPages: Math.ceil(total / searchParams.limit),
                totalItems: total,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const {
            fullname,
            phone_number,
            referr_by,
            gender,
            patient,
            dob,
            age,
            address,
            paydby,
            paid_amount,
            due_amount,
            reporting_time,
            reporting_date,
            test_cart,
        } = body;

        let newPathology;
        if (body?.patient) {
            newPathology = await Pathology.findOneAndUpdate({
                reg_id: body.reg_id
            }, {
                fullname,
                phone_number,
                referr_by,
                gender,
                patient,
                dob,
                age,
                address,
                paydby,
                paid_amount,
                due_amount,
                reporting_time,
                reporting_date,
                test_cart,
            }, { new: true });
        } else {
            let regid = null;
            let mrdid = null;
            let billno = null



            regid = await Counter.findOneAndUpdate(
                { id: "regid" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );

            mrdid = await Counter.findOneAndUpdate(
                { id: "mrdid" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
            billno = await Counter.findOneAndUpdate(
                { id: "billno" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );


            const data = await Patient.create({
                fullname,
                phone_number,
                referr_by,
                gender,
                patient,
                dob,
                age,
                address,
                uh_id: uhid?.seq,
                reg_id: regid?.seq,
                mrd_id: mrdid?.seq,
            });
            body.patient = data._id;
            if (data._id) {
                newPathology = await Pathology.create({
                    reg_id: regid?.seq,
                    mrd_id: mrdid?.seq,
                    bill_no: billno?.seq,
                    paydby,
                    paid_amount,
                    patient: data._id,
                    due_amount,
                    reporting_time,
                    reporting_date,
                    test_cart,
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Pathology record created",
            data: newPathology,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const recordId = searchParams.get("id");
        const body = await req.json();

        const updatedRecord = await Pathology.findByIdAndUpdate(recordId, body, {
            new: true,
        }).populate("patient");

        if (!updatedRecord) {
            return NextResponse.json(
                { success: false, message: "Record not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Record updated",
            data: updatedRecord,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const recordId = searchParams.get("id");

        const deletedRecord = await Pathology.findByIdAndDelete(recordId);

        if (!deletedRecord) {
            return NextResponse.json(
                { success: false, message: "Record not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Record deleted",
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

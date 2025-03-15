import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Ipd from "@/models/Ipd.models"; // Mongoose  model
import Counter from "@/models/Counter.models";
import Discharge from "@/models/Discharge.models"
import Patient from "@/models/Patient.models"


export async function POST(req) {
    connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();

        console.log(body);

        // Create new discharge record
        const newDischarge = new Discharge({
            reg_id: body.reg_id,
            mrd_id: body.mrd_id,
            patient: body.patient,
            final_diagnosis: body.final_diagnosis,
            discharge_summary: body.discharge_summary,
            condition: body.condition,
            advice: body.advice,
            surgery: body.surgery,
            discharge_date: body.discharge_date,
            discharge_time: body.discharge_time
        });

        const savedRecord = await newDischarge.save();

        return NextResponse.json({
            success: true,
            message: "Discharge record created successfully",
            data: savedRecord
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error",
                error: error.message
            },
            { status: 500 }
        );
    }
}

// GET endpoint to search by reg_id
export async function GET(req) {
    connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(req.url);
        const reg_id = searchParams.get('reg_id');
        const search = searchParams.get('search');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let query = {};

        // Handle search query
        if (search) {
            query.$or = [
                { mrd_id: { $regex: search, $options: 'i' } },
                { 'patient.fullname': { $regex: search, $options: 'i' } }
            ];
        }

        // Handle date range
        if (startDate && endDate) {
            query.discharge_date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        let records;
        if (reg_id) {
            records = await Discharge.findOne({ reg_id })
                .populate('patient');
        } else {
            records = await Discharge.find(query)
                .populate('patient')
                .sort({ discharge_date: -1 });
        }

        return NextResponse.json({
            success: true,
            data: records
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error",
                error: error.message
            },
            { status: 500 }
        );
    }
}
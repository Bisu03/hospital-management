import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoConnection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Ipd from "@/models/Ipd.models"; // Mongoose  model
import Patient from "@/models/Patient.models";

export async function PUT(req, context) {
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
        const body = await req.json();

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
            admit_type,
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

        await Patient.findByIdAndUpdate(body.pid, {
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
        });
        const data = await Ipd.findByIdAndUpdate(
            slug,
            {
                hight,
                weight,
                bp,
                admission_charge,
                admit_type,
                paidby,
                admit_date,
                admit_time,
                present_complain,
                medical_case,
                provisional_diagnosis,
                admited_by,
                admited_in,
                consultant,
            },
            { new: true }
        );
        // Return the message
        return NextResponse.json(
            { success: true, message: "Update Successfully", data },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req, context) {
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
        await Ipd.findByIdAndDelete(slug);
        // Return the message
        return NextResponse.json(
            { success: true, message: " Deleted Successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoConnection'; // MongoDB connection utility
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Doctor from '@/models/Doctor.models';

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
        const data = await Doctor.find({})
        return NextResponse.json({ success: true, data: data });
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
        await Doctor.create(body);
        return NextResponse.json(
            { success: true, message: "Doctor Add Successfully" },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoConnection'; // MongoDB connection utility
import User from '@/models/User.models'; // Mongoose User model
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET(req, context) {
    // Connect to the database
    await connectDB();

    // Get the current session from next-auth
    const session = await getServerSession(authOptions);

    if (session) {
        try {
            const { slug } = await context.params;

            // insert data into data base
            const userdata = await User.findById(slug);
            // Return the message
            const { password, ...dataToSend } = userdata._doc;

            return NextResponse.json({ success: true, data: dataToSend }, { status: 200 });
        } catch (error) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Internal Server Error",
                    error: error.message,
                },
                { status: 500 }
            );
        }
    } else {
        // Unauthorized response if no session is found
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }
}

export async function PUT(req, context) {
    // Connect to the database
    await connectDB();

    // Get the current session from next-auth
    const session = await getServerSession(authOptions);

    if (session) {
        try {
            const { slug } = await context.params;
            const body = await req.json()
            // insert data into data base
            const userdata = await User.findByIdAndUpdate(slug, body);
            // Return the message

            return NextResponse.json({ success: true, message: 'User Updated successfully' }, { status: 200 });
        } catch (error) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Internal Server Error",
                    error: error.message,
                },
                { status: 500 }
            );
        }
    } else {
        // Unauthorized response if no session is found
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }
}
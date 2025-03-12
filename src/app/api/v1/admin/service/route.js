
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoConnection'; // MongoDB connection utility
import Service from '@/models/Service.models';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

// Get all users (admin only) or single user
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
        // Admin can get all users
        if (session) {
            const users = await Service.find({});
            return NextResponse.json({ success: true, data: users });
        }

        // Regular users get their own profile
        const user = await User.findById(session.user.id, { password: 0 });
        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

// Create new user (admin only)
export async function POST(req) {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Admin") {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();

        await Service.create(body);
        return NextResponse.json(
            { success: true, message: "Service Added Successfully" },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error",
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
// Update user
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
        const body = await req.json();
        const userId = body._id || session.user.id;

        // Authorization check
        if (session.user.role !== "Admin" && userId !== session.user.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        // Prevent email duplication
        if (body.email) {
            const existingUser = await User.findOne({ email: body.email });
            if (existingUser && existingUser._id.toString() !== userId) {
                return NextResponse.json(
                    { success: false, message: "Email already in use" },
                    { status: 400 }
                );
            }
        }

        // Hash password if updating
        if (body.password) {
            body.password = await bcrypt.hash(body.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: body },
            { new: true, select: "-password" }
        );

        return NextResponse.json({ success: true, data: updatedUser });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

// Delete user
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
        const userId = searchParams.get("id");

        // Authorization check
        if (session.user.role !== "Admin" && userId !== session.user.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        const userToDelete = await User.findByIdAndDelete(userId);

        if (!userToDelete) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "User deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoConnection'; // MongoDB connection utility
import User from '@/models/User.models'; // Mongoose User model
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { generateUnique } from '@/lib/uniqueNumber';
import Mailjet from 'node-mailjet';

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
    if (session.user.role === "Admin") {
      const users = await User.find({}, { password: 0 });
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

    // Validation (keep your existing validation logic)
    if (!body.username || !body.email) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for existing user (keep your existing check)
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    // Generate temporary password (keep your existing logic)
    const tempPassword = body.username + generateUnique();
    const hashedPassword = await bcrypt.hash(tempPassword.replace(/\s+/g, ""), 10);

    // Create user (keep your existing user creation)
    await User.create({
      username: body.username,
      email: body.email,
      password: hashedPassword,
      role: body.role || "Staff"
    });

    if (body.email) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_APP_EMAIL_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.NEXT_APP_USER_MAIL,
          to: [body.email],
          subject: 'TIUNH LOGIN CREDIENTIAL',
          html: ` 
        <p>*** please keep this information secret ***</p> <br/>
        Login & Employee ID - ${body.email}<br/>
        Password - ${tempPassword.replace(/\s+/g, "")}
        `,
        }),
      });
    }



    return NextResponse.json(
      { success: true, message: "User Registered Successfully" },
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
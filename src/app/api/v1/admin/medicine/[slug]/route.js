import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoConnection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Medicine from "@/models/Medicine.models";


export async function PUT(req, context) {
  // Connect to the database
  await connectDB();

  // Get the current session from next-auth
  const session = await getServerSession(authOptions);

  if (session) {
    try {
      const { slug } = await context.params;
      const body = await req.json();
      const data = await Medicine.findByIdAndUpdate(slug, {
        ...body,
      });
      // Return the message
      return NextResponse.json({ success: true, message: "Medicine Updated" }, { status: 200 });
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

export async function DELETE(req, context) {
  // Connect to the database
  await connectDB();

  // Get the current session from next-auth
  const session = await getServerSession(authOptions);

  if (session) {
    try {
      const { slug } = await context.params
      const data = await Medicine.findByIdAndDelete(slug);
      // Return the message
      return NextResponse.json({ success: true, message: "Medicine Deleted" }, { status: 200 });
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

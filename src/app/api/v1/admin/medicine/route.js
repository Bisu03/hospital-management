import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoConnection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

import Medicine from "@/models/Medicine.models";

export async function GET(req) {
  // Connect to the database
  await connectDB();

  // Get the current session from next-auth
  const session = await getServerSession(authOptions);

  if (session) {
    try {
      const url = new URL(req.url);

      // Query the database
      const data = await Medicine.find({})

      // Return the response
      return NextResponse.json({ success: true, data: data }, { status: 200 });
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

export async function POST(req) {
  // Connect to the database
  await connectDB();

  // Get the current session from next-auth
  const session = await getServerSession(authOptions);

  if (session) {
    try {
      const body = await req.json();

      // insert data into data base
      const data = await Medicine.create(body);

      // Return the message
      return NextResponse.json(
        { success: true, message: "Medicine Added" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error handling pharmacy config API:", error);
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


import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import HospitalConfig from "@/models/Hospitalinformation.models"; // Import the model
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET() {
  // Connect to the database
  await connectDB();

  try {
    // Check if a document with hid: "hospitalinfo" exists
    let hospitalConfig = await HospitalConfig.findOne({ hid: "hospitalinfo" });

    // If not found, create a new document
    if (!hospitalConfig) {
      hospitalConfig = await HospitalConfig.create({
        hid: "hospitalinfo",
        hospital_name: "Default Hospital",
        address: "Default Address",
        phone: "1234567890",
        email: "default@hospital.com",
        hospitalCode: "HOSP123",
        gst_number: "GST123456",
        reg_number: "REG123456",
        licence_number: "LIC123456",
        logo: "default-logo.png",
        language: "English",
        timezone: "UTC",
        currency: "USD",
        currency_symbol: "$",
      });
    }

    // Return the hospital configuration data
    return NextResponse.json(
      { success: true, data: hospitalConfig },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling hospital config API:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }


}

export async function PUT(req) {
  // Connect to the database
  await connectDB();

  // Get the current session from next-auth
  const session = await getServerSession(authOptions);

  if (session) {
    try {
      // Parse the request body for updates
      const body = await req.json();


      // Update or create the document with pid: "pharmacyinfo"
      await HospitalConfig.findOneAndUpdate(
        { hid: "hospitalinfo" }, // Query: searching for the specific pharmacy document
        { $set: body }, // Update operation: setting the new values
        { new: true, upsert: true } // Options: return the updated document or create a new one if not found
      );

      // Return the updated pharmacy configuration data
      return NextResponse.json(
        { success: true, message: "Details Updated Successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error handling pharmacy config PUT API:", error);
      return NextResponse.json(
        { success: false, message: "Internal Server Error", error: error.message },
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

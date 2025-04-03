import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoConnection";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Labtest from "@/models/Labtest.models";

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
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Validate date parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Both startDate and endDate are required" },
        { status: 400 }
      );
    }

    const pipeline = [
      {
        $match: {
          reporting_date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $lookup: {
          from: "patient_registrations",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: "$patient" },
      {
        $project: {
          _id: 0,
          mrd_id: 1,
          bill_no: 1,
          fullname: "$patient.fullname",
          reporting_date: 1,
          paidby: 1,
          due: { $ifNull: ["$amount.due", 0] },
          nettotal: { $ifNull: ["$amount.netTotal", 0] }
        }
      }
    ];

    const result = await Labtest.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoConnection";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Billing from "@/models/Billing.models";
import Labtest from "@/models/Labtest.models";
import Opd from "@/models/Opd.models";
import Ipd from "@/models/Ipd.models";

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

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Both startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Parallel database queries
    const [billingSummary, labSummary, opdSummary, ipdSummary] = await Promise.all([
      // Billing Summary
      Billing.aggregate([
        {
          $match: {
            billing_date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalNet: { $sum: { $ifNull: ["$amount.netTotal", 0] } },
            totalDue: { $sum: { $ifNull: ["$amount.due", 0] } }
          }
        }
      ]),

      // Lab Summary (updated with due amount)
      Labtest.aggregate([
        {
          $match: {
            reporting_date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalNet: { $sum: { $ifNull: ["$amount.netTotal", 0] } },
            totalDue: { $sum: { $ifNull: ["$amount.due", 0] } }
          }
        }
      ]),

      // OPD Summary
      Opd.aggregate([
        {
          $match: {
            consultant_date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalFees: { $sum: { $ifNull: ["$opd_fees", 0] } }
          }
        }
      ]),

      // IPD Summary (corrected admission charge handling)
      Ipd.aggregate([
        {
          $match: {
            admit_date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAdmissionFees: { 
              $sum: { 
                $convert: { 
                  input: "$admission_charge", 
                  to: "double", 
                  onError: 0 
                } 
              } 
            }
          }
        }
      ])
    ]);

    const response = {
      billing: {
        count: billingSummary[0]?.count || 0,
        totalNet: billingSummary[0]?.totalNet || 0,
        totalDue: billingSummary[0]?.totalDue || 0
      },
      lab: {
        count: labSummary[0]?.count || 0,
        totalNet: labSummary[0]?.totalNet || 0,
        totalDue: labSummary[0]?.totalDue || 0
      },
      opd: {
        count: opdSummary[0]?.count || 0,
        totalFees: opdSummary[0]?.totalFees || 0
      },
      ipd: {
        count: ipdSummary[0]?.count || 0,
        totalAdmissionFees: ipdSummary[0]?.totalAdmissionFees || 0
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
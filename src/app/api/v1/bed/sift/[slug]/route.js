import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoConnection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Billing from "@/models/Billing.models";
import Bed from "@/models/Bed.models"; // Mongoose model
import "@/models/BedCategory.models";

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
    const body = await req.json();
    const { slug } = context.params;

    // Find and update the bed allocation
    const bdata = await Bed.findByIdAndUpdate(
      slug,
      { isAllocated: true, patitentID: body?.ipdid },
      { new: true }
    ).populate("bed_category");

    if (!bdata) {
      return NextResponse.json(
        { success: false, message: "Bed not found" },
        { status: 404 }
      );
    }

    // Prepare bed data for pushing into billing record
    let u_b_data = {
      bed_category: bdata.bed_category?.bed_category,
      bed_number: bdata?.bed_number,
      bed_charge: bdata?.bed_charge,
      dateofadd: body?.siftdate,
    };

    // Push the updated bed data into acomodation_cart.items
    const updatedBilling = await Billing.findOneAndUpdate(
      { ipd: body?.ipdid },
      { $push: { "acomodation_cart.items": u_b_data } }, // Correct path
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Bed Allotted Successfully",
        data: updatedBilling,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

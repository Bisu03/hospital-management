import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoConnection";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Labtest from "@/models/Labtest.models";
import Patient from "@/models/Patient.models";
import Counter from "@/models/Counter.models";
import { formattedTime } from "@/lib/timeGenerate";

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
    const searchParams = {
      id: url.searchParams.get("id"),
      search: url.searchParams.get("search"),
      startDate: url.searchParams.get("startDate"),
      endDate: url.searchParams.get("endDate"),
    };

    if (searchParams.id) {
      const data = await Labtest.findById(searchParams.id)
        .populate("patient")
        .populate("consultant")
        .sort({ createdAt: -1 })
        .exec();
      return NextResponse.json({ success: true, data });
    }

    const matchConditions = {};
    if (searchParams.search) {
      matchConditions.$or = [
        { "patient.fullname": { $regex: searchParams.search, $options: "i" } },
        { bill_no: { $regex: searchParams.search, $options: "i" } },
        { mrd_id: { $regex: searchParams.search, $options: "i" } },
      ];
    }
    if (searchParams.startDate && searchParams.endDate) {
      matchConditions.reporting_date = {
        $gte: searchParams.startDate,
        $lte: searchParams.endDate,
      };
    }

    const pipeline = [
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
        $lookup: {
          from: "doctors",
          localField: "consultant",
          foreignField: "_id",
          as: "consultant",
        },
      },
      { $unwind: "$consultant" },
      { $match: matchConditions },
      { $sort: { createdAt: -1 } },
    ];

    const data = await Labtest.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      mrd_id,
      reg_id,
      fullname,
      phone_number,
      referr_by,
      gender,
      patient,
      dob,
      age,
      consultant,
      address,
      paidby,
      amount,
      reporting_date,
      pathology_test_cart,
      radiology_test_cart,
      admited_by,
    } = body;

    let newLabtest;

    let billno = null;
    let mrdid = null;

    billno = await Counter.findOneAndUpdate(
      { id: "labtestbill" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!body.mrd_id) {
      mrdid = await Counter.findOneAndUpdate(
        { id: "mrdid" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }

    if (body?.mrd_id) {
      const data = await Patient.create({
        fullname,
        phone_number,
        gender,
        patient,
        dob,
        age,
        address,
        reg_id,
        mrd_id,
      });
      if (data) {
        newLabtest = await Labtest.create({
          mrd_id,
          reg_id,
          bill_no: billno?.seq,
          patient: data._id,
          paidby,
          amount,
          consultant,
          reporting_time: formattedTime(),
          reporting_date,
          referr_by,
          pathology_test_cart,
          radiology_test_cart,
          admited_by,
        });
      }
    } else {
      const data = await Patient.create({
        fullname,
        phone_number,
        referr_by,
        gender,
        patient,
        dob,
        age,
        address,
        reg_id,
        mrd_id: mrdid?.seq,
      });
      newLabtest = await Labtest.create({
        bill_no: billno?.seq,
        mrd_id: mrdid?.seq,
        reg_id,
        paidby,
        patient: data._id,
        amount,
        consultant,
        reporting_time: formattedTime(),
        reporting_date,
        pathology_test_cart,
        referr_by,
        radiology_test_cart,
        admited_by,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Labtest record created",
      data: newLabtest,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

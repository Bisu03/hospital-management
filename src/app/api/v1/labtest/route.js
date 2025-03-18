
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoConnection";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Labtest from "@/models/Labtest.models";
import Patient from "@/models/Patient.models";
import Counter from "@/models/Counter.models";

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
      page: parseInt(url.searchParams.get("page")) || 1,
      limit: parseInt(url.searchParams.get("limit")) || 10,
    };

    if (searchParams.id) {
      const data = await Labtest.findById(searchParams.id)
        .populate("patient")
        .populate("consultant")
        .sort({ createdAt: -1 })
        .exec();
      return NextResponse.json({ success: true, data });
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
      ...(searchParams.search
        ? [
          {
            $match: {
              $or: [
                {
                  "patient.fullname": {
                    $regex: searchParams.search,
                    $options: "i",
                  },
                },
                { bill_no: { $regex: searchParams.search, $options: "i" } },
                { mrd_id: { $regex: searchParams.search, $options: "i" } },
              ],
            },
          },
        ]
        : []),
      { $sort: { createdAt: -1 } },
      { $skip: (searchParams.page - 1) * searchParams.limit },
      { $limit: searchParams.limit },
      {
        $facet: {
          data: [],
          totalCount: [{ $count: "total" }],
        },
      },
    ];

    const result = await Labtest.aggregate(pipeline);
    const data = result[0]?.data || [];
    const total = result[0]?.totalCount?.[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        currentPage: searchParams.page,
        totalPages: Math.ceil(total / searchParams.limit),
        totalItems: total,
      },
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
      fullname,
      phone_number,
      referr_by,
      gender,
      patient,
      dob,
      age,
      consultant,
      address,
      paydby,
      amount,
      reporting_time,
      reporting_date,
      pathology_test_cart,
      radiology_test_cart,
      admited_by
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
      newLabtest = await Labtest.create({
        bill_no: billno?.seq,
        mrd_id,
        paydby,
        amount,
        patient,
        consultant,
        reporting_time,
        reporting_date,
        pathology_test_cart,
        radiology_test_cart,
        admited_by
      });
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
        mrd_id: mrdid?.seq,
      });

      data._id;
      newLabtest = await Labtest.create({
        bill_no: billno?.seq,
        mrd_id: mrdid?.seq,
        paydby,
        patient: data._id,
        amount,
        consultant,
        reporting_time,
        reporting_date,
        pathology_test_cart,
        radiology_test_cart,
        admited_by
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


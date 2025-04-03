import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoConnection"; // MongoDB connection utility
import User from "@/models/User.models"; // Mongoose User model
import jwt from "jsonwebtoken";
import { generateUnique } from "@/lib/uniqueNumber";

export async function POST(req) {
    connectDB()
    try {
        const body = await req.json();

        const user = await User.findOne({ email: body.email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User Not Available" },
                { status: 500 }
            );
        }

        const otp = generateUnique();
        const token = jwt.sign({ email: body.email, otp }, process.env.NEXT_APP_JWT_SECRET, {
            expiresIn: "10m",
        });

        if (body.email) {
            await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.NEXT_APP_EMAIL_KEY}`,
                },
                body: JSON.stringify({
                    from: process.env.NEXT_APP_USER_MAIL,
                    to: [body.email],
                    subject: "TIUNH ADMIN OTP",
                    html: ` 
        <p>*** please keep this information secret ***</p> <br/>
        email ID - ${body.email}<br/>
        OTP - ${otp}
        `,
                }),
            });
        }
        return NextResponse.json(
            { success: true, message: "Email Was Sent", token },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

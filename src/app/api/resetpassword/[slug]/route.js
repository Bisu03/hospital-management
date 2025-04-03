import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoConnection';
import User from '@/models/User.models';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

export async function PUT(req, context) {
    await connectDB();
    try {
        const { slug } =await context.params; // No need to await here
        const body = await req.json();

        // Verify JWT token
        const decoded = jwt.verify(slug, process.env.NEXT_APP_JWT_SECRET);
        
        // Convert both values to string for comparison
        const receivedOTP = String(body.otp).trim();
        const expectedOTP = String(decoded.otp).trim();

        console.log('Received OTP:', receivedOTP);
        console.log('Expected OTP:', expectedOTP);

        if (receivedOTP !== expectedOTP) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid OTP",
                },
                { status: 400 } // Use 400 for client errors
            );
        }

        // Hash password and update
        const hashedPassword = await bcrypt.hash(body.password, 10);
        await User.findOneAndUpdate(
            { email: decoded.email },
            { password: hashedPassword }
        );

        return NextResponse.json(
            { success: true, message: 'Password Updated Successfully' }, 
            { status: 200 }
        );

    } catch (error) {
        console.error('Password reset error:', error);
        
        // Handle JWT specific errors
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or expired token",
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
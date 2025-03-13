"use client";

import Loading from '@/components/Loading'
import PrintUi from '@/components/ui/PrintUi';
import { useHospital } from '@/context/setting/HospitalInformation';
import { withAuth } from '@/services/withAuth'
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import axios from 'axios';

const BillPrint = () => {
    const { data: session } = useSession();
    const { hospitalInfo } = useHospital();
    const { slug } = useParams();
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const handleGetBillingInfo = async () => {
        try {
            const { data } = await axios.get(`/api/v1/billing/${slug}`);
            setFormData(data?.data);
        } catch (error) {
            console.error("Error fetching billing data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleGetBillingInfo();
    }, [slug]);

    if (isLoading) return <Loading />;

    return (
        <PrintUi path="/billing">
            <div className="w-full flex justify-between items-center px-6 py-2 border-b-2 border-black">
                <div className="flex items-center space-x-4">
                    <Image
                        width={120}
                        height={120}
                        src={hospitalInfo?.logo}
                        alt="Hospital Logo"
                        className="h-auto"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-blue-900">{hospitalInfo?.hospital_name}</h1>
                        <p className="bg-blue-900 text-white px-2 py-1 text-sm font-semibold rounded-md w-fit">
                            GST: {hospitalInfo?.gst_number}
                        </p>
                    </div>
                </div>

                <div className="text-right text-sm text-gray-700 leading-tight">
                    <p>{hospitalInfo?.address}</p>
                    <p>Phone: {hospitalInfo?.phone}</p>
                    <p>Email: {hospitalInfo?.email}</p>
                </div>
            </div>
            <div className="mx-auto bg-white p-6 rounded-lg font-bold">
                {/* Invoice Header */}
                <div className="flex justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Money Receipt</h2>
                        <p className="text-sm">BIll No. #: {formData?.bill_no}</p>
                    </div>
                    <div className="text-right">
                        <p>Date: {new Date(formData?.createdAt).toLocaleDateString()}</p>
                        <p>Time: {new Date(formData?.createdAt).toLocaleTimeString()}</p>
                    </div>
                </div>

                {/* Patient Info */}
                <div className="mb-6">
                    <h3 className="font-bold">Patient Details</h3>
                    <p>Name: {formData?.patient?.fullname}</p>
                    <p>UHID: {formData?.uh_id}</p>
                    <p>MRD: {formData?.mrd_id}</p>
                    <p>REG ID: {formData?.reg_id}</p>
                </div>

                {/* Services Table */}
                <table className="w-full mb-6 border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 text-left border">Service</th>
                            <th className="p-2 text-left border">Unit</th>
                            <th className="p-2 text-left border">Rate</th>
                            <th className="p-2 text-left border">Qty</th>
                            <th className="p-2 text-left border">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData?.service_cart?.services?.map((service, index) => (
                            <tr key={index} className="border">
                                <td className="p-2 border">{service.servicename}</td>
                                <td className="p-2 border">{service.unittype}</td>
                                <td className="p-2 border">₹{Number(service.unitcharge).toFixed(2)}</td>
                                <td className="p-2 border">{service.quantity}</td>
                                <td className="p-2 border">₹{(Number(service.unitcharge) * service.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                    <div className="w-64">
                        <div className="flex justify-between font-bold">
                            <span>Grand Total:</span>
                            <span>₹{formData?.service_cart?.totalAmount?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-xs text-center">
                    <p>Thank you for choosing {hospitalInfo?.hospital_name}</p>
                    <p>Printed by: {session?.user?.username} on {new Date().toLocaleString()}</p>
                </div>
            </div>
        </PrintUi>
    )
}

export default withAuth(BillPrint)
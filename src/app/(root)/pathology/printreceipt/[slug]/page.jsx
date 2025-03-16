"use client";
import Loading from '@/components/Loading';
import PrintUi from '@/components/ui/PrintUi';
import { useHospital } from '@/context/setting/HospitalInformation';
import { withAuth } from '@/services/withAuth';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '@/services/apiService';
import { formatDate } from '@/lib/formateDate';

const PathologyReceipt = () => {
    const { data: session } = useSession();
    const { hospitalInfo } = useHospital();
    const { slug } = useParams();

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["pathologyrecord", slug],
        queryFn: () => fetchData(`/pathology/${slug}`),
    });

    useEffect(() => {
        refetch();
    }, [slug]);

    if (isLoading) return <Loading />;

    const paidAmount = data?.data?.test_cart?.totalAmount - data?.data?.due_amount;
    const pathologyData = data?.data;

    return (
        <PrintUi path="/pathology/record">
            <div className="w-full flex justify-between items-start mb-2 border-b-2 border-black pb-4">
                <div className="flex items-center gap-4">
                    <Image
                        width={120}
                        height={120}
                        src={hospitalInfo?.logo}
                        alt="Hospital Logo"
                        className="h-24 w-24 object-contain"
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-black">
                            {hospitalInfo?.hospital_name}
                        </h1>
                        <p className="text-sm text-black py-1 rounded-md mt-2">
                            Lic No: {hospitalInfo?.licence_number}
                        </p>
                    </div>
                </div>

                <div className="text-right text-sm text-gray-700 leading-tight">
                    <p>{hospitalInfo?.address}</p>
                    <p>
                        <span className="font-semibold">Helpline:</span> {hospitalInfo?.phone}
                    </p>
                    <p>
                        <span className="font-semibold">GST:</span> {hospitalInfo?.gst_number}
                    </p>
                    <p className="text-black">{hospitalInfo?.email}</p>
                    <p className="text-black font-semibold">For Appoinment:9002296279</p>
                    <p className="text-black ">Call 09:00 AM To 03:00 PM (Except Saturday)</p>
                </div>
            </div>

            <div className="mx-auto bg-white p-4 rounded-lg">
                {/* Receipt Header */}
                <div className="flex flex-col sm:flex-row justify-between mb-4 print:mb-2">
                    <div className="mb-2 sm:mb-0">
                        <h2 className="text-lg font-bold print:text-md">Pathology Receipt</h2>
                        <p className="text-xs print:text-2xs">Report No: {pathologyData?.reg_id}</p>
                    </div>
                    <div className="text-right text-xs print:text-2xs">
                        <p>Date: {formatDate(pathologyData?.reporting_date)}</p>
                        <p>Time: {pathologyData?.reporting_time}</p>
                    </div>
                </div>

                {/* Patient Information */}
                {/* Patient Information */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-4 print:gap-1">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-sm border-b pb-1 print:text-xs">Patient Details</h3>
                        <div className="text-xs space-y-0.5 print:text-2xs">
                            <p><span className="font-semibold">Full Name:</span> {pathologyData?.patient?.fullname}</p>
                            <p><span className="font-semibold">Phone No.:</span> {pathologyData?.patient?.phone_number}</p>
                            <p><span className="font-semibold">Gender:</span> {pathologyData?.patient?.gender}</p>
                            <p><span className="font-semibold">Age:</span> {pathologyData?.patient?.age}</p>
                            <p><span className="font-semibold">Address:</span> {pathologyData?.patient?.address}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="font-semibold text-sm border-b pb-1 print:text-xs">Registration Details</h3>
                        <div className="text-xs space-y-0.5 print:text-2xs">
                            <p><span className="font-semibold">Registration ID:</span> {pathologyData?.reg_id}</p>
                            <p><span className="font-semibold">MRD Number:</span> {pathologyData?.mrd_id}</p>
                            <p><span className="font-semibold">Reporting Date:</span> {formatDate(pathologyData?.reporting_date)}</p>
                            <p><span className="font-semibold">Reporting Time:</span> {pathologyData?.reporting_time}</p>
                        </div>
                    </div>
                </div>

                {/* Tests Table */}
                <table className="w-full mb-4 text-xs print:text-2xs">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-1 text-left border">Test Name</th>
                            <th className="p-1 text-left border">Category</th>
                            <th className="p-1 text-left border">Charge</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pathologyData?.test_cart?.services?.map((test, index) => (
                            <tr key={index} className="border">
                                <td className="p-1 border">{test.pathology_category}</td>
                                <td className="p-1 border">-</td>
                                <td className="p-1 border">₹{Number(test.pathology_charge).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Payment Summary */}
                <div className="flex justify-end">
                    <div className="w-72 space-y-1 text-xs print:text-2xs">
                        <div className="flex justify-between font-semibold">
                            <span>Total Charges:</span>
                            <span>₹{parseFloat(pathologyData?.amount?.total)?.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Discount Amount:</span>
                            <span>₹{parseFloat(pathologyData?.amount?.discount)?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Paid Amount:</span>
                            <span>₹{parseFloat(pathologyData?.amount?.paid)?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Net Total:</span>
                            <span>₹{parseFloat(pathologyData?.amount?.netTotal)?.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Payment Method:</span>
                            <span className="capitalize">{pathologyData?.paydby}</span>
                        </div>

                        <div className="flex justify-between font-semibold border-t pt-1">
                            <span>Due Amount:</span>
                            <span className="text-red-600">₹{parseFloat(pathologyData?.amount?.due)?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 text-center text-2xs print:mt-2">
                    <p>Thank you for choosing {hospitalInfo?.hospital_name}</p>
                    <p>Report generated on: {formatDate(pathologyData?.reporting_date)} at {pathologyData?.reporting_time}</p>
                </div>
            </div>
        </PrintUi>
    );
};

export default withAuth(PathologyReceipt);
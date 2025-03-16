"use client";

import Loading from "@/components/Loading";
import PrintUi from "@/components/ui/PrintUi";
import { useHospital } from "@/context/setting/HospitalInformation";
import { formatDate } from "@/lib/formateDate";
import { fetchData } from "@/services/apiService";
import { withAuth } from "@/services/withAuth";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";

const PathologyPrint = () => {
    const { data: session } = useSession();
    const { hospitalInfo } = useHospital();
    const { slug } = useParams();

    const { data, error, isLoading } = useQuery({
        queryKey: ["pathologyrecord", slug],
        queryFn: () => fetchData(`/pathology/${slug}`),
    });

    if (isLoading) return <Loading />;

    return (
        <PrintUi path="/opd/record">
            <div className="min-h-[100vh] p-6 flex flex-col justify-between">
                {/* Hospital Header */}
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
                            <h1 className="text-2xl font-bold text-black">
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
                    </div>
                </div>

                {/* Patient Details */}
                <div className="my-4 border-b-2 border-black pb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p><span className="font-semibold">Full Name:</span> {data?.data?.patient?.fullname}</p>
                            <p><span className="font-semibold">Phone No.:</span> {data?.data?.patient?.phone_number}</p>
                            <p><span className="font-semibold">Gender:</span> {data?.data?.patient?.gender}</p>
                            <p><span className="font-semibold">Age:</span> {data?.data?.patient?.age}</p>
                            <p><span className="font-semibold">Address:</span> {data?.data?.patient?.address}</p>

                        </div>
                        <div>
                            <p><span className="font-semibold">Registration ID:</span> {data?.data?.reg_id}</p>
                            <p><span className="font-semibold">MRD Number:</span> {data?.data?.mrd_id}</p>
                            <p><span className="font-semibold">Reporting Date:</span> {formatDate(data?.data?.reporting_date)}</p>
                            <p><span className="font-semibold">Reporting Time:</span> {data?.data?.reporting_time}</p>
                        </div>
                    </div>
                </div>

                {/* Test Results */}
                <div className="flex-1">
                    {data?.data?.test_cart?.services?.map((service, index) => (
                        <div key={service._id} className="mb-6">
                            <div className="bg-gray-100 p-2 rounded-t">
                                <h3 className="font-bold text-lg">
                                    {service.pathology_category}
                                    <span className="ml-2 text-sm font-normal">
                                        (Charge: ₹{service.pathology_charge})
                                    </span>
                                </h3>
                            </div>

                            <div className="border p-4">
                                <div className="overflow-x-auto">
                                    <table className="table ">
                                        <thead>
                                            <tr>
                                                <th>Test Name</th>
                                                <th>Reading Value</th>
                                                <th>Unit</th>
                                                <th>Reference Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {service.related_tests.flat().map((test) => (
                                                test.reading_unit && <tr key={test._id}>
                                                    <td className="font-medium">{test.pathology_testname}</td>
                                                    <td>{test.reading_unit}</td>
                                                    <td>{test.unit}</td>
                                                    <td>{test.ref_value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total and Signature */}
                <div className="mt-8 border-t-2 border-black pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        </div>
                        <div className="text-right">
                            <div className="mt-8">
                                <p className="border-t-2 border-black pt-2 inline-block">
                                    Authorized Signature
                                </p>
                                <p className="text-sm">Date: {formatDate(data?.data?.reporting_date)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Declaration */}
                <div className="mt-8 text-xs text-center">
                    <p>This is a computer generated report and does not require physical signature</p>
                    <p className="mt-2">** Results should be correlated with clinical findings **</p>
                </div>
            </div>
        </PrintUi>
    );
};

export default withAuth(PathologyPrint);
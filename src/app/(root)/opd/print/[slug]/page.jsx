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
import React, { useEffect, useState } from "react";

const OpdPrint = () => {
    const { data: session } = useSession();
    const { hospitalInfo } = useHospital();
    const { slug } = useParams();
    const [formData, setFormData] = useState({});

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["opddetails"], // Unique query key
        queryFn: () => fetchData(`/opd?id=${slug}`), // Function to fetch data
    });

    useEffect(() => {
        refetch(); // Fetch data when slug changes
    }, [slug]);

    useEffect(() => {
        if (data?.data) {
            setFormData(data.data); // Update form data when data is available
        }
    }, [data]);

    return (
        <>
            {isLoading && <Loading />}

            {/* Declaration */}
            <PrintUi path="/opd/record">
                {/* Main Container */}
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

                    <div className="flex justify-between">

                        <div className=" text-sm space-y-1">
                            <p className=" font-semibold">{formData?.patient?.fullname} -  {formData?.reg_id}</p>
                            <div>
                                <span className="font-semibold">Age:</span>{" "}
                                {formData?.patient?.age}
                            </div>
                            <div>
                                <span className="font-semibold">Sex:</span>{" "}
                                {formData?.patient?.gender}
                            </div>
                            <div>
                                <span className="font-semibold">Date:</span>{" "}
                                {formatDate(formData?.consultant_date)}
                            </div>
                            <div>
                                <span className="font-semibold">Time:</span>{" "}
                                {formatDate(formData?.consultant_time)}
                            </div>
                        </div>


                        <div className="space-y-1">
                            <p className="text-xl font-bold">{formData?.consultant?.drname}</p>
                            <p className="text-sm">{formData?.consultant?.drinfo}</p>
                            <p className="text-sm">
                                Department of {formData?.consultant?.category}
                            </p>
                            <p className="text-sm">
                                Reg No. {formData?.consultant?.regno}
                            </p>
                            <p className="text-sm">
                                Contact: {formData?.consultant?.contact}
                            </p>
                            <p className="text-sm">
                                Email: {formData?.consultant?.email}
                            </p>
                        </div>
                    </div>

                    {/* Patient Details Header */}
                    {/* <div className="bg-gray-100 p-4 rounded-lg mb-6">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div className="text-lg">
                                <span className="font-bold">Name:</span>{" "}
                                {formData?.patient?.fullname}
                            </div>
                            <div className="flex gap-6">
                                <div>
                                    <span className="font-bold">Age:</span>{" "}
                                    {formData?.patient?.age}
                                </div>
                                <div>
                                    <span className="font-bold">Sex:</span>{" "}
                                    {formData?.patient?.gender}
                                </div>
                                <div>
                                    <span className="font-bold">Date:</span>{" "}
                                    {formatDate(formData?.consultant_date)}
                                </div>
                                <div>
                                    <span className="font-bold">Time:</span>{" "}
                                    {formatDate(formData?.consultant_time)}
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* Main Content */}
                    <div className="flex flex-1 gap-8 mt-2">
                        {/* Left Column - Clinical Findings */}
                        <div className="w-1/3 pr-4 border-r-2 border-gray-300">
                            <h2 className="text-xl font-bold text-black mb-4">
                                Findings
                            </h2>
                            {/* <div className="space-y-3">
                                <DetailItem label="Weight" value={formData.weight} />
                                <DetailItem
                                    label="Present Complain"
                                    value={formData.present_complain}
                                />
                                <DetailItem label="On Examination" value={formData.on_examin} />

                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Pulse" value={formData.pulse} />
                                    <DetailItem label="SPO2" value={formData.spo} />
                                    <DetailItem label="BP" value={formData.bp} />
                                </div>

                                <DetailItem label="Jaundice" value={formData.jaundice} />
                                <DetailItem label="Pallor" value={formData?.pallor} />
                                <DetailItem label="CVS" value={formData?.cvs} />
                                <DetailItem label="RESP System" value={formData?.resp_system} />
                                <DetailItem label="GI System" value={formData?.gi_system} />
                                <DetailItem
                                    label="Nervous System"
                                    value={formData?.nervious_system}
                                />
                                <DetailItem
                                    label="Provisional Diagnosis"
                                    value={formData?.provisional_diagnosis}
                                />
                                <DetailItem label="Notes" value={formData?.note} />
                            </div> */}
                        </div>

                        {/* Right Column - Prescription */}
                        <div className="w-2/3">
                            <h2 className="text-2xl font-bold text-black mb-6">Advice</h2>
                            <div className="space-y-4">
                                {/* Add prescription items here */}
                            </div>
                        </div>
                    </div>

                    {/* Doctor Footer */}
                    <div className="mt-8 border-t-2 border-black pt-10">
                        <div className="flex justify-between items-end">
                            <div>
                            </div>

                            <div className="text-center">
                                <div className="mb-2 h-1 w-48 border-b-2 border-black"></div>
                                <p className="text-sm">Doctor's Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            </PrintUi>
        </>
    );
};

export default withAuth(OpdPrint);

const DetailItem = ({ label, value }) =>
    value && (
        <div className="flex gap-2">
            <span className="font-semibold min-w-[140px]">{label}:</span>
            <span className="flex-1">{value}</span>
        </div>
    );

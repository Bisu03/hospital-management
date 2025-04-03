"use client";  // Ensure it's a client component

import Loading from "@/components/Loading";
import PrintUi from "@/components/ui/PrintUi";
import { useHospital } from "@/context/setting/HospitalInformation";
import { formatDate } from "@/lib/formateDate";
import Image from "next/image";
import "suneditor/dist/css/suneditor.min.css"; // Import SunEditor styles
import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

const LabPrint = () => {
    const { hospitalInfo } = useHospital();
    const { slug } = useParams()
    const [data, setData] = useState([]);
    const [ToggleTest, setToggleTest] = useState(true);
    const [isLoading, setIsLoading] = useState(false);



    // useEffect(() => {
    //     const paramId = searchParams.get("id");
    //     if (paramId) {
    //         setSearch(paramId);
    //     }
    // }, [searchParams]);

    const handleGetData = async () => {
        if (!slug) return;  // Prevent API call if search param is missing
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/v1/labtest/${slug}`);
            setData(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (slug) handleGetData();
    }, [slug]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.altKey && e.key === "1") {
                e.preventDefault();
                setToggleTest(true);
            } else if (e.altKey && e.key === "2") {
                e.preventDefault();
                setToggleTest(false);
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [ToggleTest]);

    if (isLoading) return <Loading />;



    return (
        <Suspense fallback={<Loading />}>
            <PrintUi>
                <div className="p-6 flex flex-col justify-between w-full">
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
                                    Pathology Licence No:
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
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-sm border-b pb-1 print:text-xs">
                                Patient Details
                            </h3>
                            <div className="text-xs space-y-0.5 print:text-xs">
                                <p><span className="font-semibold">Full Name:</span> {data?.data?.patient?.fullname}</p>
                                <div className="flex space-x-2">
                                    <p><span className="font-semibold">Gender:</span> {data?.data?.patient?.gender}</p>
                                    <p><span className="font-semibold">Age:</span> {data?.data?.patient?.age}</p>
                                </div>
                                <p><span className="font-semibold">Phone No.:</span> {data?.data?.patient?.phone_number}</p>
                                <p><span className="font-semibold">Address:</span> {data?.data?.patient?.address}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-sm border-b pb-1 print:text-xs">
                                Report Details
                            </h3>
                            <div className="text-xs space-y-0.5 print:text-xs">
                                <p>
                                    <span className="font-semibold">Date/Time:</span> {formatDate(data?.data?.reporting_date)}/{data?.data?.reporting_time}
                                </p>
                                <p><span className="font-semibold">Mrd No.:</span> {data?.data?.mrd_id}</p>
                                <p><span className="font-semibold">Bill No.:</span> {data?.data?.bill_no}</p>
                                <p><span className="font-semibold">Referred By:</span> {data?.data?.consultant?.drname}</p>
                            </div>
                        </div>
                    </div>
                    
                    {data?.data?.amount?.due == 0 ? <>
                        {/* Test Results */}
                        {ToggleTest ? (
                            <div className="flex-1">
                                {data?.data?.pathology_test_cart?.services?.map((service) => (
                                    <div key={service._id} className="mb-6">
                                        <div className="bg-gray-100 p-2 rounded-t">
                                            <h3 className="font-bold text-lg">
                                                {service.pathology_category}
                                                <span className="ml-2 text-sm font-normal">
                                                    (Charge: ₹{service.pathology_charge})
                                                </span>
                                            </h3>
                                        </div>
                                        <div className="border">
                                            <table className="table table-xs">
                                                <thead>
                                                    <tr>
                                                        <th>Test Name</th>
                                                        <th>Reading Value</th>
                                                        <th>Unit</th>
                                                        <th>Reference Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {service?.related_tests?.flat().map((test) => (
                                                        test.reading_unit && (
                                                            <tr key={test._id}>
                                                                <td className="font-medium">{test.pathology_testname}</td>
                                                                <td>{test.reading_unit}</td>
                                                                <td>{test.unit}</td>
                                                                <td>{test.ref_value}</td>
                                                            </tr>
                                                        )
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-2 border rounded w-full">
                                <div className="sun-editor-editable p-2 rounded"
                                    dangerouslySetInnerHTML={{ __html: data?.data?.radiology_reading }} />
                            </div>
                        )}
                    </> : <>
                        <div className="p-2 text-center w-full">
                            <h2 className="text-2xl font-semibold">Payment Pending</h2>
                            <p className="text-sm text-gray-600">Payment is pending for this report, please pay the amount to get the report.</p>
                        </div>
                    </>}

                </div>
            </PrintUi>
        </Suspense>
    );
};

export default LabPrint;

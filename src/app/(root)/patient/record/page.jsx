"use client";

import React, { lazy, Suspense } from "react";

import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import { withAuth } from "@/services/withAuth";
import PatientRegistration from "@/components/component/PatientRegistration";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/services/apiService";
import { FaEdit, FaPrint } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Link from "next/link";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const PatientRecord = () => {


    const { data, error, isLoading } = useQuery({
        queryKey: ["patientrecord"], // Unique query key
        queryFn: () => fetchData("/patient"), // Function to fetch data
    });

    

    return (
        <>
            <Suspense fallback={<Loading />}>
                <div className="flex flex-wrap w-full justify-between">
                    <MiddleSection>
                        <div className="w-full">
                            <Heading heading="Patient Record">
                                <PatientRegistration />
                            </Heading>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-secondary text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <th className="px-4 py-3">MRD ID</th>
                                            <th className="px-4 py-3">REG ID</th>
                                            <th className="px-4 py-3">Full Name</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3">Age</th>
                                            <th className="px-4 py-3">Gender</th>
                                            <th className="px-4 py-3">Referr By</th>
                                            <th className="px-4 py-3 ">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data?.data?.map((patient) => <tr key={patient._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{patient?.mrd_id}</td>
                                            <td className="px-4 py-3">{patient?.reg_id}</td>
                                            <td className="px-4 py-3">{patient?.fullname}</td>
                                            <td className="px-4 py-3">{patient?.phone_number}</td>
                                            <td className="px-4 py-3">{patient?.age}</td>
                                            <td className="px-4 py-3">{patient?.gender}</td>
                                            <td className="px-4 py-3">{patient?.referr_by}</td>
                                            <td className="px-4 py-3 space-x-2 flex">
                                                {/* <button className="btn btn-success "> <FaPrint /> </button> */}
                                                <Link href={`/patient/${patient._id}`} className="btn btn-secondary "> <FaEdit /> </Link>
                                                {/* <button className="btn btn-error "> <MdDelete /> </button> */}
                                            </td>
                                        </tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </MiddleSection>
                </div>
            </Suspense>
        </>
    );
};

export default withAuth(PatientRecord);

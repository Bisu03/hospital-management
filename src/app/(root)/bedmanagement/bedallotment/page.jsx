"use client";

import Heading from '@/components/Heading';
import Loading from '@/components/Loading';
import FixedLayout from '@/components/ui/FixedLayout';
import { fetchData } from '@/services/apiService';
import { withAuth } from '@/services/withAuth'
import { ErrorHandeling } from '@/utils/errorHandling';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React, { lazy, Suspense, useState } from 'react'

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const BedAllotment = () => {

    const [isModalOpen, setModalOpen] = useState(false);
    const [patientData, setPatientData] = useState({});

    const {
        data: bedrecord,
        error,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["bedrecord"],
        queryFn: () => fetchData("/bed/bed"),
    });

    const handleBedSelect = async (bedId) => {
        setModalOpen(true);
        try {
            const { data } = await fetchData(`/ipd/ipdbyid/${bedId}`);
            setPatientData(data)
        } catch (error) {
            ErrorHandeling(error)
        }
    }

    // Group beds by category
    const groupedBeds = bedrecord?.data?.reduce((acc, bed) => {
        const category = bed?.bed_category?.bed_category || 'General';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(bed);
        return acc;
    }, {});

    return (
        <>
            <Suspense fallback={<Loading />}>
                <div className="flex flex-wrap w-full justify-between">
                    <MiddleSection>
                        <div className="w-full">
                            <Heading heading="Bed Allotment" />
                        </div>

                        <FixedLayout
                            isOpen={isModalOpen}
                            onOpen={() => setModalOpen(true)}
                            onClose={() => setModalOpen(false)}>
                            <div className="p-6  rounded-lg w-full mx-auto">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Patient Details</h2>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="font-medium text-gray-900">{patientData?.patient?.fullname}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Age</p>
                                        <p className="font-medium text-gray-900">{patientData?.patient?.age || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Gender</p>
                                        <p className="font-medium text-gray-900">{patientData?.patient?.gender || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Reg ID</p>
                                        <p className="font-medium text-gray-900">{patientData?.reg_id}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">MRD ID</p>
                                        <p className="font-medium text-gray-900">{patientData?.mrd_id}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                        onClick={() => {/* Add service logic */ }}
                                    >
                                        Add Service
                                    </button>

                                    <button
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                        onClick={() => {/* Create bill logic */ }}
                                    >
                                        Create Bill
                                    </button>
                                    <Link
                                        className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                                        href={`/bedmanagement/bedallotment/${patientData._id}?reg_id=${patientData.reg_id}`}
                                    >
                                        Sift Bed
                                    </Link>
                                </div>
                            </div>
                        </FixedLayout>

                        {Object?.entries(groupedBeds || {}).map(([category, beds]) => (
                            <div key={category} className="w-full mb-6">
                                <h3 className="text-lg font-semibold mb-3 p-2 bg-secondary text-center rounded-t">
                                    {category}
                                </h3>
                                <div className="flex flex-wrap gap-3 p-2 bg-gray-50 rounded-b">
                                    {beds?.map((bed) => (
                                        bed?.isAllocated ?
                                            <button
                                                key={bed._id}
                                                className="px-4 py-2 bg-red-300 hover:bg-red-200 border border-blue-200 rounded-md 
                                                text-sm font-medium transition-all
                                                min-w-[80px] sm:min-w-[100px] 
                                                hover:shadow-sm hover:border-blue-300"
                                                onClick={() => handleBedSelect(bed.patitentID)}
                                            >
                                                {bed?.bed_number}
                                            </button> :
                                            <Link
                                                key={bed._id}
                                                className="px-4 py-2 bg-white hover:bg-blue-50 border border-blue-200 rounded-md 
                                                  text-sm font-medium transition-all
                                                  min-w-[80px] sm:min-w-[100px] 
                                                  hover:shadow-sm hover:border-blue-300"
                                                href={`/ipd/admit?bedid=${bed._id}`}
                                            >
                                                {bed?.bed_number}
                                            </Link>

                                    ))}
                                </div>
                            </div>
                        ))}

                        {isLoading && <Loading />}
                    </MiddleSection>
                </div>
            </Suspense>
        </>
    )
}

export default withAuth(BedAllotment);
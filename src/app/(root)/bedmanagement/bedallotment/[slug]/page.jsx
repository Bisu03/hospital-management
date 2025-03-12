"use client";

import Heading from '@/components/Heading';
import Loading from '@/components/Loading';
import { fetchData } from '@/services/apiService';
import { withAuth } from '@/services/withAuth'
import { useQuery } from '@tanstack/react-query';
import React, { lazy, Suspense } from 'react'

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const BedAllotment = () => {
    const {
        data: bedrecord,
        error,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["bedrecord"],
        queryFn: () => fetchData("/bed/bed"),
    });

    const handleBedSelect = (bedId) => {
        // Handle bed selection logic
        console.log("Selected bed ID:", bedId);
    };

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

                        {Object.entries(groupedBeds || {}).map(([category, beds]) => (
                            <div key={category} className="w-full mb-6">
                                <h3 className="text-lg font-semibold mb-3 p-2 bg-secondary text-center rounded-t">
                                    {category}
                                </h3>
                                <div className="flex flex-wrap gap-3 p-2 bg-gray-50 rounded-b">
                                    {beds.map((bed) => (
                                        <button
                                            key={bed._id}
                                            className="px-4 py-2 bg-white hover:bg-blue-50 border border-blue-200 rounded-md 
                                                text-sm font-medium transition-all
                                                min-w-[80px] sm:min-w-[100px] 
                                                hover:shadow-sm hover:border-blue-300"
                                            onClick={() => handleBedSelect(bed._id)}
                                        >
                                            {bed.bed_number}
                                        </button>
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
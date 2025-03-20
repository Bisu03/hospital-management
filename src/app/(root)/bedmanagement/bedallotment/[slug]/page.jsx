"use client";

import Heading from '@/components/Heading';
import Loading from '@/components/Loading';
import Spinner from '@/components/ui/Spinner';
import { getDate } from '@/lib/currentDate';
import { fetchData, updateData } from '@/services/apiService';
import { withAuth } from '@/services/withAuth'
import { ErrorHandeling } from '@/utils/errorHandling';
import { SuccessHandling } from '@/utils/successHandling';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import React, { lazy, Suspense, useState } from 'react'

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const BedAllotment = () => {

    const searchParams = useSearchParams()
    const search = searchParams.get('reg_id')
    const { slug } = useParams();
    const router = useRouter()
    const [loading, setLoading] = useState();

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
        setLoading(bedId)
        try {
            const data = await updateData(`/bed/sift`, bedId, { ipdid: slug, siftdate: getDate() });
            SuccessHandling(data.message);
            router.push(`/ipd/print/${search}`);
            setLoading("")
        } catch (error) {
            setLoading("")
            ErrorHandeling(error)
        }
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
                            <Heading heading="Bed Allotment" >
                                <Link className='btn btn-warning' href={`/ipd/print/${search}`}>
                                    Skip
                                </Link>
                            </Heading>
                        </div>

                        {Object?.entries(groupedBeds || {}).map(([category, beds]) => (
                            <div key={category} className="w-full mb-6">
                                <h3 className="text-lg font-semibold mb-3 p-2 bg-secondary text-center rounded-t">
                                    {category}
                                </h3>
                                <div className="flex flex-wrap gap-3 p-2 bg-gray-50 rounded-b">
                                    {beds?.map((bed) => (
                                        bed?.isAllocated ? <button
                                            key={bed._id}
                                            disabled
                                            className="px-4 py-2 bg-red-300 hover:bg-red-200 border border-blue-200 rounded-md 
                                            text-sm font-medium transition-all
                                            min-w-[80px] sm:min-w-[100px] 
                                            hover:shadow-sm hover:border-blue-300"
                                        >
                                            {bed?.bed_number}
                                        </button> : <button
                                            key={bed._id}
                                            className="px-4 py-2 bg-white hover:bg-blue-50 border border-blue-200 rounded-md 
                                                text-sm font-medium transition-all
                                                min-w-[80px] sm:min-w-[100px] 
                                                hover:shadow-sm hover:border-blue-300"
                                            onClick={() => handleBedSelect(bed._id)}
                                        >
                                            {bed?.bed_number} {loading === bed._id ? <Spinner /> : ""}
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
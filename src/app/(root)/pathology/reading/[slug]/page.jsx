"use client";

import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import Spinner from "@/components/ui/Spinner";
import { fetchData, updateData } from "@/services/apiService";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import { SuccessHandling } from "@/utils/successHandling";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
const MiddleSection = lazy(() => import("@/components/Middlesection"));

const PathologyReading = () => {
    const { slug } = useParams();
    const [modifiedData, setModifiedData] = useState(null);
    const queryClient = useQueryClient();
    const router = useRouter()

    const { data, error, isLoading } = useQuery({
        queryKey: ["pathologyrecord", slug],
        queryFn: () => fetchData(`/pathology/${slug}`),
    });

    useEffect(() => {
        if (data?.data?.test_cart) {
            // Deep clone the data to maintain immutability
            const initialData = JSON.parse(JSON.stringify(data?.data?.test_cart));
            setModifiedData(initialData);
        }
    }, [data?.data]);

    const handleReadingChange = (
        serviceIndex,
        testGroupIndex,
        testIndex,
        value
    ) => {
        setModifiedData((prev) => {
            const newData = JSON.parse(JSON.stringify(prev));
            newData.services[serviceIndex].related_tests[testGroupIndex][
                testIndex
            ].reading_unit = value;
            return newData;
        });
    };

    const mutation = useMutation({
        mutationFn: (newItem) => updateData(`/pathology`, slug, newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["pathologyreading"] }); // Refetch data after adding;
            SuccessHandling(data.message);
            router.push("/pathology/print/" + slug)
        },
        onError: (error) => {
            ErrorHandeling(error);
            console.error("Error adding data:", error);
        },
    });


    const handleSubmit = () => {
        mutation.mutate({ test_cart: modifiedData });
    };

    if (isLoading) return <Loading />;

    return (
        <Suspense fallback={<Loading />}>
            <div className="flex flex-wrap w-full justify-between">
                <MiddleSection>
                    <div className="w-full">
                        <Heading heading="Pathology Reading" />

                        <div className="w-full bg-gray-100 p-2 md:p-4 rounded-lg shadow-sm mb-4">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 truncate">
                                {data?.data?.patient?.fullname || "No Patient Selected"}
                            </h1>
                            <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-4 gap-2 md:gap-4 ">
                                {data?.data?.mrd_id && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            MRD ID
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                            {data?.data?.mrd_id}
                                        </p>
                                    </div>
                                )}

                                {data?.data?.reg_id && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            REG ID
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                            {data?.data?.reg_id}
                                        </p>
                                    </div>
                                )}
                                {data?.data?.referr_by && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            Referred By
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base truncate">
                                            {data?.data?.patient?.referr_by}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 mt-6">
                            {modifiedData?.services.map((service, serviceIndex) => (
                                <div
                                    key={service._id}
                                    className="collapse collapse-arrow bg-base-200"
                                >
                                    <input type="checkbox" />
                                    <div className="collapse-title text-xl font-medium">
                                        {service.pathology_category}
                                        <span className="ml-2 text-sm text-gray-500">
                                            (Charge: ₹{service.pathology_charge})
                                        </span>
                                    </div>
                                    <div className="collapse-content">
                                        <div className="overflow-x-auto">
                                            {service.related_tests.map(
                                                (testGroup, testGroupIndex) => (
                                                    <table
                                                        key={`${serviceIndex}-${testGroupIndex}`}
                                                        className="table table-zebra my-4"
                                                    >
                                                        <thead>
                                                            <tr>
                                                                <th>Test Name</th>
                                                                <th>Reading Value</th>
                                                                <th>Unit</th>
                                                                <th>Reference Value</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {testGroup.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="4" className="text-center py-4">
                                                                        No tests available in this category
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                testGroup.map((test, testIndex) => (
                                                                    <tr key={test._id}>
                                                                        <td className="font-medium">
                                                                            {test.pathology_testname}
                                                                        </td>
                                                                        <td>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Enter reading"
                                                                                className="input input-bordered border border-black input-sm w-full max-w-xs"
                                                                                value={test.reading_unit || ""}
                                                                                onChange={(e) =>
                                                                                    handleReadingChange(
                                                                                        serviceIndex,
                                                                                        testGroupIndex,
                                                                                        testIndex,
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td>{test.unit}</td>
                                                                        <td>{test.ref_value}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn btn-primary w-full my-2"
                            onClick={handleSubmit}
                        >
                            Save Reading <FaSave className="ml-2" />{" "}
                            {mutation.isPending && <Spinner />}{" "}
                        </button>
                    </div>
                </MiddleSection>
            </div>
        </Suspense>
    );
};

export default withAuth(PathologyReading);

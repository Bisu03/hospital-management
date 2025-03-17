"use client";
import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import Tab from "@/components/Tab";
import Spinner from "@/components/ui/Spinner";
import { formatDate } from "@/lib/formateDate";
import { fetchData, updateData } from "@/services/apiService";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import { SuccessHandling } from "@/utils/successHandling";
import { TabLinks } from "@/utils/tablinks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
const MiddleSection = lazy(() => import("@/components/Middlesection"));

const PathologyReading = () => {
    const [modifiedData, setModifiedData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["pathologyrecord", searchTerm],
        queryFn: () => fetchData(`/pathology/${searchTerm}`),
    });


    const handleBillSearch = async () => {
        refetch();
    }


    useEffect(() => {
        if (data?.data?.test_cart) {
            const initialData = JSON.parse(JSON.stringify(data.data.test_cart));
            setModifiedData(initialData);
        }
    }, [data?.data]);

    const handleReadingChange = (serviceIndex, testIndex, value) => {
        setModifiedData((prev) => {
            const newData = JSON.parse(JSON.stringify(prev));
            newData.services[serviceIndex].related_tests[testIndex].reading_unit = value;
            return newData;
        });
    };

    const mutation = useMutation({
        mutationFn: (newItem) => updateData(`/pathology`, searchTerm, newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["pathologyreading"] });
            SuccessHandling(data.message);
            router.push("/pathology/print/" + searchTerm);
        },
        onError: (error) => {
            ErrorHandeling(error);
            console.error("Error updating data:", error);
        },
    });

    const handleSubmit = () => {
        mutation.mutate({ test_cart: modifiedData });
    };


    return (
        <Suspense fallback={<Loading />}>
            <div className="flex flex-wrap w-full justify-between">
                <Tab tabs={TabLinks} category="Pathology Patient" />
                <MiddleSection>
                    <div className="w-full">
                        <Heading heading="Pathology Reading" >
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Bill No."
                                    className="p-2 border rounded"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button
                                    onClick={handleBillSearch}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Search
                                </button>
                            </div>
                        </Heading>

                        {isLoading && <Loading />}

                        <div className="w-full bg-gray-100 p-2 md:p-4 rounded-lg shadow-sm mb-4">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 truncate">
                                {data?.data?.patient?.fullname || "Enter Reg ID"}
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

                                {data?.data?.bill_no && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            Bill No.
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                            {data?.data?.bill_no}
                                        </p>
                                    </div>
                                )}
                                {data?.data?.patient?.age && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            Age
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                            {data?.data?.patient?.age}
                                        </p>
                                    </div>
                                )}
                                {data?.data?.reporting_date && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            Reporting Date
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                            {formatDate(data?.data?.reporting_date)}
                                        </p>
                                    </div>
                                )}
                                {data?.data?.reporting_time && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            Reporting Time
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                            {data?.data?.reporting_time}
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
                            {modifiedData?.services?.map((service, serviceIndex) => (
                                <div
                                    key={service._id}
                                    className="collapse collapse-arrow bg-base-200"
                                >
                                    <input type="checkbox" />
                                    <div className="collapse-title text-xl font-medium">
                                        {service?.pathology_category}
                                        <span className="ml-2 text-sm text-gray-500">
                                            (Charge: ₹{service?.pathology_charge})
                                        </span>
                                    </div>
                                    <div className="collapse-content">
                                        <div className="overflow-x-auto">
                                            <table className="table table-zebra my-4">
                                                <thead>
                                                    <tr>
                                                        <th>Test Name</th>
                                                        <th>Reading Value</th>
                                                        <th>Unit</th>
                                                        <th>Reference Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {service?.related_tests?.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="4" className="text-center py-4">
                                                                No tests available in this category
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        service?.related_tests?.map((test, testIndex) => (
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
                                                                                testIndex,
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                                <td>{test?.unit}</td>
                                                                <td>{test?.ref_value}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn btn-primary w-full my-2"
                            onClick={handleSubmit}
                            disabled={mutation.isPending}
                        >
                            Save Reading <FaSave className="ml-2" />{" "}
                            {mutation.isPending && <Spinner />}
                        </button>
                    </div>
                </MiddleSection>
            </div>
        </Suspense>
    );
};

export default withAuth(PathologyReading);
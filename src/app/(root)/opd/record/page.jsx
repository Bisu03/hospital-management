"use client";

import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import Tab from "@/components/Tab";
import Spinner from "@/components/ui/Spinner";
import { getDate } from "@/lib/currentDate";
import { deleteData, fetchData } from "@/services/apiService";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import { SuccessHandling } from "@/utils/successHandling";
import { TabLinks } from "@/utils/tablinks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { FaEdit, FaPrint } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const MiddleSection = lazy(() => import("@/components/Middlesection"));

const OpdRecord = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState(getDate());
    const [endDate, setEndDate] = useState(getDate());
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["opdarecord", debouncedSearchTerm, startDate, endDate],
        queryFn: () => {
            const params = new URLSearchParams({
                search: debouncedSearchTerm,
            });

            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);

            return fetchData(`/opd?${params.toString()}`);
        },
    });

    const handleClearFilters = () => {
        setSearchTerm("");
        setStartDate(getDate());
        setEndDate(getDate());
    };

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteData("/opd", id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["opdarecord"] }); // Refetch data after adding
            SuccessHandling(data.message);
            refetch();
        },
        onError: (error) => {
            ErrorHandeling(error);
        },
    });

    const handleDelete = (id) => {
        deleteMutation.mutate(id);
    };

    return (
        <>
            <Suspense fallback={<Loading />}>
                <div className="flex flex-wrap w-full justify-between">
                    <Tab tabs={TabLinks} category="OPD" />
                    <MiddleSection>
                        <div className="w-full">
                            <Heading heading="OPD Record">
                                <div className="flex w-full  justify-end items-center">
                                    <input
                                        className="w-full max-w-xs py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by name"
                                    />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="border p-2 rounded"
                                        max={endDate || new Date().toISOString().split('T')[0]}
                                    />
                                    <span>to</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="border p-2 rounded"
                                        min={startDate}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    <button
                                        onClick={handleClearFilters}
                                        className="bg-secondary px-4 py-2 rounded hover:bg-gray-300"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </Heading>


                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-secondary text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <th className="px-4 py-3">MRD ID</th>
                                            <th className="px-4 py-3">Full Name</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3">Age</th>
                                            <th className="px-4 py-3">Admit Date & Time </th>
                                            <th className="px-4 py-3">Consultant</th>
                                            <th className="px-4 py-3">Fees Paid</th>
                                            <th className="px-4 py-3 ">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data?.data?.map((patient) => (
                                            <tr key={patient._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{patient?.mrd_id}</td>
                                                <td className="px-4 py-3">
                                                    {patient?.patient?.fullname}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {patient?.patient?.phone_number}
                                                </td>
                                                <td className="px-4 py-3">{patient?.patient?.age}</td>
                                                <td className="px-4 py-3">
                                                    {patient?.consultant_date}/{patient?.consultant_time}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {patient?.consultant?.drname}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {patient?.opd_fees} paid by {patient?.paidby}
                                                </td>
                                                <td className="px-4 py-3 space-x-2 flex">
                                                    <Link
                                                        href={`/opd/print/${patient._id}`}
                                                        className="btn btn-primary "
                                                    >
                                                        {" "}
                                                        <FaPrint />
                                                    </Link>
                                                    <Link
                                                        href={`/opd/update/${patient._id}`}
                                                        className="btn btn-secondary "
                                                    >
                                                        {" "}
                                                        <FaEdit />{" "}
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(patient._id)}
                                                        className="btn btn-error "
                                                    >
                                                        {" "}
                                                        <MdDelete />{" "}
                                                        {deleteMutation?.isPending && <Spinner />}{" "}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                            </div>
                        </div>
                        {isLoading && <Loading />}
                    </MiddleSection>
                </div>
            </Suspense>
        </>
    );
};

export default withAuth(OpdRecord);

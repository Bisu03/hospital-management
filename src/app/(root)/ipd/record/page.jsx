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
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { FaPrint } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const MiddleSection = lazy(() => import("@/components/Middlesection"));

const IpdRecord = () => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [startDate, setStartDate] = useState(getDate());
    const [endDate, setEndDate] = useState(getDate());
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["ipdarecord", debouncedSearchTerm, startDate, endDate],
        queryFn: () => {
            const params = new URLSearchParams();
            if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            return fetchData(`/ipd?${params.toString()}`);
        }
    });

    const handleClearFilters = () => {
        setStartDate(getDate());
        setEndDate(getDate());
        setSearchTerm("");
    };

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteData("/ipd", id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["ipdarecord"] });
            SuccessHandling(data.message);
            refetch();
        },
        onError: (error) => {
            ErrorHandeling(error);
            console.error("Error deleting data:", error);
        },
    });

    const handleDelete = (id) => {
        deleteMutation.mutate(id);
    };

    return (
        <>
            <Suspense fallback={<Loading />}>
                <div className="flex flex-wrap w-full justify-between">
                    <Tab tabs={TabLinks} category="IPD" />
                    <MiddleSection>
                        <div className="w-full">
                            <Heading heading="IPD Record">
                                <div className="flex flex-wrap w-full justify-end my-4 items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border p-2 rounded w-64"
                                    />
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="border p-2 rounded"
                                        />
                                        <span>to</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="border p-2 rounded"
                                        />
                                    </div>
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
                                            <th className="px-4 py-3">REG ID</th>
                                            <th className="px-4 py-3">Full Name</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3">Age</th>
                                            <th className="px-4 py-3">Admit Date & Time</th>
                                            <th className="px-4 py-3">Consultant</th>
                                            <th className="px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data?.data?.map((patient) => (
                                            <tr key={patient._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{patient?.mrd_id}</td>
                                                <td className="px-4 py-3">{patient?.reg_id}</td>
                                                <td className="px-4 py-3">{patient?.patient?.fullname}</td>
                                                <td className="px-4 py-3">{patient?.patient?.phone_number}</td>
                                                <td className="px-4 py-3">{patient?.patient?.age}</td>
                                                <td className="px-4 py-3">{patient?.admit_date}/{patient?.admit_time}</td>
                                                <td className="px-4 py-3">{patient?.consultant?.drname}</td>
                                                <td className="px-4 py-3 space-x-2 flex">
                                                    <Link href={`/ipd/print/${patient.reg_id}`} className="btn btn-primary">
                                                        <FaPrint />
                                                    </Link>
                                                    {session?.user?.role === "Admin" && <button onClick={() => handleDelete(patient._id)} className="btn btn-error">
                                                        <MdDelete /> {deleteMutation?.isPending && <Spinner />}
                                                    </button>}
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

export default withAuth(IpdRecord);

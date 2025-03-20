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
import { FaPrint } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const MiddleSection = lazy(() => import("@/components/Middlesection"));

const DischargeRecord = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState(getDate());
    const [endDate, setEndDate] = useState(getDate());
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(handler);
    }, [search]);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["dischargerecord", debouncedSearch, startDate, endDate],
        queryFn: () => fetchData(
            `/discharge?search=${debouncedSearch}&startDate=${startDate}&endDate=${endDate}`
        )
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteData(`/discharge`, id),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["dischargerecord"]);
            SuccessHandling(data.message);
        },
        onError: (error) => {
            ErrorHandeling(error);
        }
    });

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this discharge record?")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <Suspense fallback={<Loading />}>
            <Tab tabs={TabLinks} category="IPD" />
            <div className="flex flex-wrap w-full justify-between">
                <MiddleSection>
                    <div className="w-full">
                        <Heading heading="Discharge Records">
                            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                                <input
                                    type="text"
                                    placeholder="Search by Patient Name or MRD"
                                    className="border rounded-lg px-4 py-2"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <div className="flex space-x-2">
                                    <input
                                        type="date"
                                        className="border rounded-lg px-4 py-2"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <input
                                        type="date"
                                        className="border rounded-lg px-4 py-2"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </Heading>

                        {isLoading ? <Loading /> : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-secondary text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRD</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">REG ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discharge Date/Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data?.data?.map((record) => (
                                            <tr key={record._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{record.patient?.fullname}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{record.mrd_id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{record.reg_id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{record.bill_no}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{record.discharge_date}/{record.discharge_time}</td>
                                                <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                                                    <Link
                                                        href={`/discharge/print/${record.reg_id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <FaPrint size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(record._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <MdDelete size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </MiddleSection>
            </div>
        </Suspense>
    );
};

export default withAuth(DischargeRecord);
"use client";

import React, { lazy, Suspense } from "react";

import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import { withAuth } from "@/services/withAuth";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { deleteData, fetchData } from "@/services/apiService";
import { FaEdit, FaPlus, FaPrint } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import DoctorForm from "@/components/component/Doctor";
import { SuccessHandling } from "@/utils/successHandling";
import { ErrorHandeling } from "@/utils/errorHandling";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const Doctor = () => {
    const queryClient = new QueryClient();

    const {
        data: doctorrecord,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["doctorrecord"], // Unique query key
        queryFn: () => fetchData("/doctor"), // Function to fetch data
    });

    const mutationDelete = useMutation({
        mutationFn: (id) => deleteData("/doctor", id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["doctorrecord"] }); // Refetch data after adding
            refetch();
            SuccessHandling(data.message);
        },
        onError: (error) => {
            ErrorHandeling(error);
        },
    });

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this Bed Category?")) {
            mutationDelete.mutate(id);
        }
    };
    return (
        <>
            <Suspense fallback={<Loading />}>
                <div className="flex flex-wrap w-full justify-between">
                    <MiddleSection>
                        <div className="w-full">
                            <Heading heading="Doctor Record">
                                <DoctorForm btn="Add Doctor" />
                            </Heading>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-secondary text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <th className="px-4 py-3">Doctor Department</th>
                                            <th className="px-4 py-3">Doctor Name</th>
                                            <th className="px-4 py-3">Doctor Details</th>
                                            <th className="px-4 py-3">Doctor Contact</th>
                                            <th className="px-4 py-3 ">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {doctorrecord?.data?.map((dr) => (
                                            <tr key={dr._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{dr?.category}</td>
                                                <td className="px-4 py-3">{dr?.drname}</td>
                                                <td className="px-4 py-3">{dr?.drinfo}</td>
                                                <td className="px-4 py-3">{dr?.contact}</td>
                                                <td className="px-4 py-3 space-x-2 flex">
                                                    {/* <button className="btn btn-secondary ">
                                                        {" "}
                                                        <FaEdit />{" "}
                                                    </button> */}
                                                    <button
                                                        onClick={() => handleDelete(dr?._id)}
                                                        className="btn btn-error "
                                                    >
                                                        {" "}
                                                        <MdDelete />{" "}
                                                        {mutationDelete.isPending && <Spinner />}{" "}
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

export default withAuth(Doctor);

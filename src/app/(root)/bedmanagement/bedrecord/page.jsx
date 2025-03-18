"use client";

import React, { lazy, Suspense, useState } from "react";

import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import FixedLayout from "@/components/ui/FixedLayout";
import { withAuth } from "@/services/withAuth";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { SuccessHandling } from "@/utils/successHandling";
import { ErrorHandeling } from "@/utils/errorHandling";
import { createData, deleteData, fetchData, updateData } from "@/services/apiService";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Spinner from "@/components/ui/Spinner";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const BedRecord = () => {
    const queryClient = new QueryClient();

    const [formData, setFormData] = useState({});
    const [isModalOpen, setModalOpen] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const { data: bedcategory } = useQuery({
        queryKey: ["bedcategory"], // Unique query key
        queryFn: () => fetchData("/bed/category"), // Function to fetch data
    });

    const {
        data: bedrecord,
        error,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["bedrecord"], // Unique query key
        queryFn: () => fetchData("/bed/bed"), // Function to fetch data
    });

    const mutationCreate = useMutation({
        mutationFn: (newItem) => createData("/bed/bed", newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["bedrecord"] }); // Refetch data after adding
            setFormData({});
            refetch()
            SuccessHandling(data.message);
            setModalOpen(false);
        },
        onError: (error) => {
            ErrorHandeling(error);
            setModalOpen(false);
        },
    });

    const mutationUpdate = useMutation({
        mutationFn: (newItem) => updateData("/bed/bed", newItem?._id, newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["bedrecord"] }); // Refetch data after adding
            setFormData({});
            refetch()
            SuccessHandling(data.message);
            setModalOpen(false);
        },
        onError: (error) => {
            ErrorHandeling(error);
            setModalOpen(false);
        },
    });


    const mutationDelete = useMutation({
        mutationFn: (id) => deleteData("/bed/bed", id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["bedrecord"] }); // Refetch data after adding
            refetch()
            SuccessHandling(data.message);
        },
        onError: (error) => {
            ErrorHandeling(error);
        },
    });


    const handleEdit = (item) => {
        setFormData({ ...item, bed_category: item.bed_category._id, isEditing: true });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents default form submission
        if (formData?.isEditing) {
            mutationUpdate.mutate(formData);
        } else {
            mutationCreate.mutate(formData);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this Bed Category?")) {
            mutationDelete.mutate(id)
        }
    };


    return (
        <>
            <Suspense fallback={<Loading />}>
                <div className="flex flex-wrap w-full justify-between">
                    <MiddleSection>
                        <div className="w-full">
                            <Heading heading="Bed Record">
                                <FixedLayout
                                    btnname="Add Bed"
                                    isOpen={isModalOpen}
                                    onOpen={() => setModalOpen(true)}
                                    onClose={() => setModalOpen(false)}
                                >
                                    <div className="w-full  p-6">
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Input Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Bed Category
                                                        <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        name="bed_category"
                                                        value={formData.bed_category}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-all duration-200 shadow-sm"
                                                    >
                                                        <option>Select</option>
                                                        {bedcategory?.data?.map((item, index) => (
                                                            <option key={index} value={item._id}>
                                                                {item.bed_category}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Bed Number
                                                        <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="bed_number"
                                                        value={formData.bed_number}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-all duration-200 shadow-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Bed Charge
                                                        <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="bed_charge"
                                                        value={formData.bed_charge}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-all duration-200 shadow-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 bg-primary text-white rounded-lg
                 hover:bg-secondary "
                                                >
                                                    Submit {mutationUpdate.isPending && <Spinner />} {mutationCreate.isPending && <Spinner />}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </FixedLayout>
                            </Heading>
                        </div>

                        <div className=" overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-secondary text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">Bed Category</th>
                                        <th className="px-4 py-3">Bed Number</th>
                                        <th className="px-4 py-3">Bed Charge</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bedrecord?.data?.map((bed, index) => (
                                        <tr key={bed._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                {bed?.bed_category?.bed_category}
                                            </td>
                                            <td className="px-4 py-3">{bed?.bed_number}</td>
                                            <td className="px-4 py-3">{bed?.bed_charge}</td>
                                            <td className="px-4 py-3 space-x-2 flex">
                                                <button
                                                    onClick={() => handleEdit(bed)}
                                                    className="btn btn-secondary "
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bed?._id)}
                                                    className="btn btn-error "
                                                >
                                                    <MdDelete /> {mutationDelete.isPending && <Spinner />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {isLoading && <Loading />}
                    </MiddleSection>
                </div>
            </Suspense>
        </>
    );
};

export default withAuth(BedRecord);

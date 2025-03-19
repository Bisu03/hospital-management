"use client";

import React, { lazy, Suspense, useReducer, useState } from "react";

import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import FixedLayout from "@/components/ui/FixedLayout";
import { withAuth } from "@/services/withAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SuccessHandling } from "@/utils/successHandling";
import { ErrorHandeling } from "@/utils/errorHandling";
import { createData, deleteData, fetchData, updateData } from "@/services/apiService";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Spinner from "@/components/ui/Spinner";
import { TabLinks } from "@/utils/tablinks";
import Tab from "@/components/Tab";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const ServiceCategoryRecord = () => {
    const queryClient = useQueryClient();

    const [isModalOpen, setModalOpen] = useState(false);

    const [formData, setFormData] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["servicecategory"], // Unique query key
        queryFn: () => fetchData("/admin/service/category"), // Function to fetch data
    });


    const mutation = useMutation({
        mutationFn: (newItem) => createData("/admin/service/category", newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["servicecategory"] }); // Refetch data after adding
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
        mutationFn: (newItem) => updateData("/admin/service/category", newItem?._id, newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["servicecategory"] }); // Refetch data after adding
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
        mutationFn: (id) => deleteData("/admin/service/category", id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["servicecategory"] }); // Refetch data after adding
            refetch()
            SuccessHandling(data.message);
        },
        onError: (error) => {
            ErrorHandeling(error);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents default form submission
        if (formData?.isEditing) {
            mutationUpdate.mutate(formData);
        } else {
            mutation.mutate(formData);
        }
    };

    const handleEdit = (item) => {
        setFormData({ ...item, isEditing: true });
        setModalOpen(true);
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
                    <Tab tabs={TabLinks} category="Services" />
                    <MiddleSection>
                        <div className="w-full">
                            <Heading heading="Service Category">
                                <FixedLayout
                                    btnname="Add Service Category"
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
                                                        Service Category
                                                        <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="category_name"
                                                        value={formData.category_name}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-all duration-200 shadow-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <div className="flex justify-end">
                                                {formData.isEditing ? <button
                                                    type="submit"
                                                    className="px-6 py-2 bg-primary text-white rounded-lg
                 hover:bg-secondary "
                                                >
                                                    Update {mutationUpdate.isPending && <Spinner />}
                                                </button> : <button
                                                    type="submit"
                                                    className="px-6 py-2 bg-primary text-white rounded-lg
                 hover:bg-secondary "
                                                >
                                                    Submit {mutation.isPending && <Spinner />}
                                                </button>}
                                            </div>
                                        </form>
                                    </div>
                                </FixedLayout>
                            </Heading>

                            <div className=" overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-secondary text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <th className="px-4 py-3">#</th>
                                            <th className="px-4 py-3">Service Category</th>
                                            <th className="px-4 py-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data?.data?.map((service, index) => (
                                            <tr key={service._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{index + 1}</td>
                                                <td className="px-4 py-3">{service?.category_name}</td>
                                                <td className="px-4 py-3 space-x-2 flex">
                                                    <button
                                                        onClick={() => handleEdit(service)}
                                                        className="btn btn-secondary "
                                                    >
                                                        {" "}
                                                        <FaEdit />{" "}
                                                    </button>
                                                    <button onClick={() => handleDelete(service?._id)} className="btn btn-error ">
                                                        {" "}
                                                        <MdDelete />{" "} {mutationDelete.isPending && <Spinner />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {isLoading && <Loading />}
                        </div>
                    </MiddleSection>
                </div>
            </Suspense>
        </>
    );
};

export default withAuth(ServiceCategoryRecord);

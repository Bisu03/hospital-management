"use client";

import React, { lazy, Suspense, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createData, deleteData, fetchData } from "@/services/apiService";
import { SuccessHandling } from "@/utils/successHandling";
import { ErrorHandeling } from "@/utils/errorHandling";
import Loading from "@/components/Loading";
import Heading from "@/components/Heading";
import { withAuth } from "@/services/withAuth";
import FixedLayout from "@/components/ui/FixedLayout";
import Tab from "@/components/Tab";
import { TabLinks } from "@/utils/tablinks";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const PathologyCategory = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        pathology_category: "",
        pathology_charge: ""
    });

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["pathologycategories"],
        queryFn: () => fetchData("/admin/pathology/category"),
    });

    const createMutation = useMutation({
        mutationFn: (newCategory) => createData("/admin/pathology/category", newCategory),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["pathologycategories"] });
            SuccessHandling(data.message);
            setModalOpen(false);
            refetch()
            setFormData({ pathology_category: "", pathology_charge: "" });
        },
        onError: (error) => ErrorHandeling(error)
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteData("/admin/pathology/category", id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pathologycategories"] });
            SuccessHandling("Category deleted successfully");
        },
        onError: (error) => ErrorHandeling(error)
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.pathology_category) {
            ErrorHandeling({ message: "Category name is required" });
            return;
        }
        createMutation.mutate(formData);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <>
            <Suspense fallback={<Loading />}>
                <div className="flex flex-wrap w-full justify-between">
                    <Tab tabs={TabLinks} category="Pathology" />
                    <MiddleSection>
                        <div className="w-full">
                            <Heading heading="Pathology Categories">
                                <FixedLayout
                                    btnname="Add Category"
                                    isOpen={isModalOpen}
                                    onOpen={() => setModalOpen(true)}
                                    onClose={() => setModalOpen(false)}
                                >
                                    <div className="w-full p-6">
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Category Name<span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="pathology_category"
                                                        value={formData.pathology_category}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Charge
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="pathology_charge"
                                                        value={formData.pathology_charge}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={handleSubmit}
                                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </FixedLayout>
                            </Heading>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-secondary text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            <th className="px-4 py-3">Category Name</th>
                                            <th className="px-4 py-3">Charge</th>
                                            <th className="px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {isLoading && (
                                            <tr>
                                                <td colSpan="3" className="text-center py-4">
                                                    <Loading />
                                                </td>
                                            </tr>
                                        )}
                                        {data?.data?.map((category) => (
                                            <tr key={category._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{category.pathology_category}</td>
                                                <td className="px-4 py-3">₹{category.pathology_charge}</td>
                                                <td className="px-4 py-3 flex space-x-3">
                                                    <button className="text-neutral hover:text-black focus:outline-none p-1">
                                                        <FaEdit className="h-6 w-6" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category._id)}
                                                        className="text-error hover:text-black focus:outline-none p-1"
                                                    >
                                                        <FaTrash className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </MiddleSection>
                </div>
            </Suspense>
        </>
    );
};

export default withAuth(PathologyCategory);
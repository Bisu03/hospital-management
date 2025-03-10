
import { createData } from "@/services/apiService";
import { ErrorHandeling } from "@/utils/errorHandling";
import { SuccessHandling } from "@/utils/successHandling";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

const DoctorForm = ({ btn }) => {
    const queryClient = useQueryClient();
    const [isModalOpen, setModalOpen] = useState(false);
    const initialState = {
        drname: "",
        drinfo: "",
        contact: "",
        category: "",
    }
    const [formData, setFormData] = useState(initialState);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isModalOpen]);

    const handleOpen = () => setModalOpen(true);
    const handleClose = () => setModalOpen(false);

    // 🔹 POST Request: Add New Data
    const mutation = useMutation({
        mutationFn: (newItem) => createData("/doctor", newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["doctorrecord"] }); // Refetch data after adding
            setFormData(initialState);
            SuccessHandling(data.message);
            handleClose();
        },
        onError: (error) => {
            ErrorHandeling(error);
            console.error("Error adding data:", error);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents default form submission
        mutation.mutate(formData);
    };
    return (
        <>
            <button className="btn btn-secondary" onClick={handleOpen}>
                {btn}
            </button>

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4"
                    onClick={handleClose}
                >
                    <div
                        className="bg-slate-100 rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 z-10 p-2 bg-slate-700  rounded-full "
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        {/* Content */}
                        <div className="p-6 pt-0">
                            {" "}
                            <div className="w-full  p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700 ">
                                                Doctor Name
                                                <span className="text-red-500 text-lg">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="drname"
                                                value={formData.drname}
                                                onChange={handleChange}
                                                className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg  focus:ring-2 focus:ring-blue-500 focus:border-blue-500   transition-all duration-200 shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700 ">
                                                Doctor Info
                                                <span className="text-red-500 text-lg">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="drinfo"
                                                value={formData.drinfo}
                                                onChange={handleChange}
                                                className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg  focus:ring-2 focus:ring-blue-500 focus:border-blue-500   transition-all duration-200 shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700 ">
                                                Doctor Contact Details
                                                <span className="text-red-500 text-lg">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="contact"
                                                value={formData.contact}
                                                onChange={handleChange}
                                                className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg  focus:ring-2 focus:ring-blue-500 focus:border-blue-500   transition-all duration-200 shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700 ">
                                                Doctor Department
                                                <span className="text-red-500 text-lg">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg  focus:ring-2 focus:ring-blue-500 focus:border-blue-500   transition-all duration-200 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-primary text-white rounded-lg  hover:bg-secondary "
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div >
            )}
        </>
    );
};

export default DoctorForm;

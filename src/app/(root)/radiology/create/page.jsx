"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createData, fetchData } from "@/services/apiService";
import PatientDropdown from "@/components/component/PatientDropdown";
import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import React, { lazy, Suspense, useState } from "react";
import { FaTrash } from "react-icons/fa";
import PatientRegistration from "@/components/component/PatientRegistration";
import { getDate } from "@/lib/currentDate";
import { formattedTime } from "@/lib/timeGenerate";
import { SuccessHandling } from "@/utils/successHandling";
import Spinner from "@/components/ui/Spinner";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const CreateRadiology = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [PatientSearch, setPatientSearch] = useState({ fullname: "" });
    const [ServiceData, setServiceData] = useState({
        reg_id: "",
        mrd_id: "",
        fullname: "",
        patient: "",
        reporting_date: getDate(),
        test_cart: {
            services: [],
            totalAmount: 0,
        },
    });
    const [Times, setTimes] = useState(formattedTime())
    const [RegNo, setRegNo] = useState("");

    const handleChange = (e) => {
        setServiceData({ ...ServiceData, [e.target.name]: e.target.value });
    };

    // Fetch radiology services
    const { data: testlist, isLoading, error, refetch } = useQuery({
        queryKey: ["radiologytests"],
        queryFn: () => fetchData("/admin/radiology"),
    });

    const handlePatientSelection = (patient) => {
        setServiceData({
            ...ServiceData,
            fullname: patient.fullname,
            patient: patient._id,
            reg_id: patient.reg_id,
            mrd_id: patient.mrd_id,
        });
    };

    const mutation = useMutation({
        mutationFn: (newRecord) => createData("/radiology", {
            ...newRecord,
            reporting_time: Times,
        }),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["radiologyrecords"]);
            SuccessHandling(data.message);
            setServiceData({
                reg_id: "",
                mrd_id: "",
                fullname: "",
                patient: "",
                reporting_date: getDate(),
                test_cart: { services: [], totalAmount: 0 },
            });
        },
        onError: (error) => ErrorHandeling(error),
    });

    const handleSubmit = () => {
        if (!ServiceData.patient) {
            ErrorHandeling({ message: "Please select a patient" });
            return;
        }
        if (ServiceData.test_cart.services.length === 0) {
            ErrorHandeling({ message: "Please add at least one test" });
            return;
        }
        mutation.mutate(ServiceData);
    };

    const addToCart = (test) => {
        // Check if test is already in cart
        const isAlreadyAdded = ServiceData.test_cart.services.some(item => item._id === test._id);

        if (!isAlreadyAdded) {
            setServiceData((prev) => ({
                ...prev,
                test_cart: {
                    services: [...prev.test_cart.services, test],
                    totalAmount: prev.test_cart.totalAmount + Number(test.test_charge)
                }
            }));
        }
    };

    const removeFromCart = (test) => {
        setServiceData((prev) => {
            const updatedServices = prev.test_cart.services.filter(
                (service) => service._id !== test._id
            );
            return {
                ...prev,
                test_cart: {
                    services: updatedServices,
                    totalAmount: prev.test_cart.totalAmount - Number(test.test_charge)
                }
            };
        });
    };

    return (
        <Suspense fallback={<Loading />}>
            <div className="flex flex-wrap w-full justify-between">
                <MiddleSection>
                    <div className="w-full">
                        <Heading heading="Radiology Admission">
                            <div className="flex items-center space-x-2">
                                <PatientDropdown
                                    PatientSearch={PatientSearch}
                                    setPatientSearch={setPatientSearch}
                                    onSelectPatient={handlePatientSelection}
                                />
                                <PatientRegistration />
                            </div>
                        </Heading>
                        <div className="w-full bg-gray-100 p-2 md:p-4 rounded-lg shadow-sm mb-4">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 truncate">
                                {ServiceData?.fullname || "No Patient Selected"}
                            </h1>
                            <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-4 gap-2 md:gap-4 ">
                                {ServiceData?.mrd_id && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            MRD ID
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                            {ServiceData.mrd_id}
                                        </p>
                                    </div>
                                )}

                                {ServiceData?.reg_id && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            REG ID
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                            {ServiceData.reg_id}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex w-full justify-end">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Reporting Date & Time{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="date"
                                            name="reporting_date"
                                            value={ServiceData?.reporting_date}
                                            onChange={handleChange}
                                            className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="Times"
                                            value={Times}
                                            onChange={(e) => setTimes(e.target.value)}
                                            className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Radiology Tests</h2>
                            <input
                                type="text"
                                placeholder="Search tests..."
                                className="w-full p-2 border rounded"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {testlist?.data.map((test) => (
                                <div
                                    key={test._id}
                                    className="flex justify-between items-center p-3 border rounded"
                                >
                                    <div>
                                        <p className="font-semibold">{test.test_name}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm font-bold text-gray-500">
                                            ₹{Number(test.test_charge).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={() => addToCart(test)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Test Cart</h2>
                            <div className="space-y-2">
                                <div className="space-y-2">
                                    {ServiceData.test_cart.services.map((test, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 border rounded"
                                        >
                                            <div>
                                                <p className="font-semibold">{test.test_name}</p>
                                                <p className="text-sm text-gray-500">{test.test_code}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-sm font-bold text-gray-500">
                                                    ₹{Number(test.test_charge).toFixed(2)}
                                                </p>
                                                <button
                                                    onClick={() => removeFromCart(test)}
                                                    className="p-2 text-red-500 hover:text-red-700"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-lg">Total Amount:</span>
                                    <span className="font-bold text-lg">
                                        ₹{ServiceData.test_cart.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    className="w-full btn btn-primary"
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? (
                                        <><Spinner /> Submitting...</>
                                    ) : (
                                        "Submit Radiology Report"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </MiddleSection>
            </div>
        </Suspense>
    );
};

export default withAuth(CreateRadiology);
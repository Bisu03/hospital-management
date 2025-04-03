"use client";

import { useRef, useEffect } from 'react';
import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import Tab from "@/components/Tab";
import Spinner from "@/components/ui/Spinner";
import { getDate } from "@/lib/currentDate";
import { formatDate } from "@/lib/formateDate";
import { formattedTime } from "@/lib/timeGenerate";
import { createData, fetchData, updateData } from "@/services/apiService";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import { SuccessHandling } from "@/utils/successHandling";
import { TabLinks } from "@/utils/tablinks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { lazy, Suspense, useState } from "react";
import Select from "react-select";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const CreateDischarge = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = searchParams.get("regid");
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [loading, setLoading] = useState(false);

    // Refs for F5 key handling
    const formDataRef = useRef(null);
    const consultantRef = useRef(null);

    const initialState = {
        reg_id: "",
        mrd_id: "",
        patient: "",
        final_diagnosis: "",
        discharge_summary: "",
        condition: "",
        advice: "",
        surgery: "",
        discharge_date: getDate(),
        discharge_time: formattedTime(),
        consultant: "",
    };

    const [consultant, setConsultant] = useState({});
    const [formData, setFormData] = useState(initialState);

    // Update refs when state changes
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    useEffect(() => {
        consultantRef.current = consultant;
    }, [consultant]);

    const { data: doctorrecord } = useQuery({
        queryKey: ["doctorrecord"],
        queryFn: () => fetchData("/doctor"),
    });

    const doctorOptions = doctorrecord?.data?.map((doctor) => ({
        value: doctor,
        label: doctor.drname,
    }));

    const handleGetPatient = async () => {
        setLoading(true);
        try {
            const { data } = await fetchData(`/discharge/${searchTerm}`);
            setFormData(data);
            setConsultant({ value: data?.consultant, label: data?.consultant?.drname });
        } catch (error) {
            ErrorHandeling(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const mutation = useMutation({
        mutationFn: (newItem) => updateData("/discharge", searchTerm, newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["dischargerecord"]);
            SuccessHandling(data.message);
            router.push(`/discharge/print/${searchTerm}`);
        },
        onError: ErrorHandeling,
    });

    const handleSubmit = () => {
        mutation.mutate({
            ...formDataRef.current,
            consultant: consultantRef.current?.value?._id
        });
    };

    // F5 Key Handler
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'F5') {
                event.preventDefault();
                if (!mutation.isPending) {
                    handleSubmit();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [mutation.isPending]);

    return (
        <Suspense fallback={<Loading />}>
            <Tab tabs={TabLinks} category="IPD" />
            <div className="flex flex-wrap w-full justify-between">
                <MiddleSection>
                    <div className="w-full">
                        <Heading heading="Service">
                            <div className="flex gap-2">

                                <input
                                    type="text"
                                    placeholder="Enter REG ID"
                                    className="p-2 border rounded"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button
                                    onClick={handleGetPatient}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    disabled={loading}
                                >
                                    {loading ? <Spinner /> : 'Search'}
                                </button>
                            </div>
                        </Heading>

                        {/* Patient Summary Section */}
                        <div className="w-full bg-gray-100 p-2 md:p-4 rounded-lg shadow-sm mb-4">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 truncate">
                                {formData?.patient?.fullname || "Enter Reg ID"}
                            </h1>
                            <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-4 gap-2 md:gap-4">
                                {formData?.mrd_id && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            MRD ID
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                            {formData?.mrd_id}
                                        </p>
                                    </div>
                                )}
                                {formData?.reg_id && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            Reg ID
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                            {formData?.reg_id}
                                        </p>
                                    </div>
                                )}
                                {formData?.patient?.age && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            Age
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                            {formData?.patient?.age}
                                        </p>
                                    </div>
                                )}
                                {formData?.ipd?.admit_date && (
                                    <div className="space-y-0.5 min-w-[200px]">
                                        <p className="text-xs md:text-sm font-medium text-gray-500">
                                            Admit Date
                                        </p>
                                        <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                            {formatDate(formData?.ipd.admit_date)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Discharge Form Section */}
                        <div className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 shadow-sm">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Consultant <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            options={doctorOptions}
                                            value={consultant}
                                            onChange={setConsultant}
                                            isClearable
                                            placeholder="Select Doctor"
                                            className="w-full text-lg"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Surgery Performed
                                        </label>
                                        <input
                                            type="text"
                                            name="surgery"
                                            value={formData?.surgery}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-lg"
                                            placeholder="Enter surgery details"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Final Diagnosis
                                        </label>
                                        <textarea
                                            name="final_diagnosis"
                                            value={formData?.final_diagnosis}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-lg"
                                            rows="3"
                                            placeholder="Enter final diagnosis"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Discharge Summary
                                        </label>
                                        <textarea
                                            name="discharge_summary"
                                            value={formData?.discharge_summary}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-lg"
                                            rows="3"
                                            placeholder="Enter discharge summary"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Condition at Discharge
                                        </label>
                                        <input
                                            type="text"
                                            name="condition"
                                            value={formData?.condition}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-lg"
                                            placeholder="Patient's condition"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Post-Discharge Advice
                                        </label>
                                        <textarea
                                            name="advice"
                                            value={formData?.advice}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-lg"
                                            rows="2"
                                            placeholder="Enter instructions"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Discharge Date
                                        </label>
                                        <input
                                            type="date"
                                            name="discharge_date"
                                            value={formData?.discharge_date}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-lg"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Discharge Time
                                        </label>
                                        <input
                                            type="text"
                                            name="discharge_time"
                                            value={formData?.discharge_time}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div className="flex w-full  justify-end">
                                    <button
                                        onClick={handleSubmit}
                                        className="bg-secondary text-black px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
                                        disabled={mutation.isPending}
                                    >
                                        {mutation.isPending ? (
                                            <Spinner className="text-black" />
                                        ) : (
                                            "Submit Discharge (F5)"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </MiddleSection>
            </div>
        </Suspense>
    );
};

export default withAuth(CreateDischarge);
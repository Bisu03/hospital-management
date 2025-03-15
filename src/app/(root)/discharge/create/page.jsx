"use client";

import PatientDropdown from "@/components/component/PatientDropdown";
import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import Spinner from "@/components/ui/Spinner";
import { getDate } from "@/lib/currentDate";
import { formattedTime } from "@/lib/timeGenerate";
import { createData, fetchData, updateData } from "@/services/apiService";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import { SuccessHandling } from "@/utils/successHandling";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { lazy, Suspense, useState } from "react";
import Select from "react-select";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const CreateDischarge = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [PatientSearch, setPatientSearch] = useState({ fullname: "" });

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

    const [formData, setFormData] = useState(initialState);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePatientSelection = (patient) => {
        if (patient?.discharge_id) {
            fetchData(`/discharge?reg_id=${patient.reg_id}`)
                .then((data) => {
                    setFormData({
                        ...data.data,
                        ...patient,
                        discharge_date: getDate(),
                        discharge_time: formattedTime()
                    });
                })
                .catch((error) => {
                    ErrorHandeling(error);
                });
        } else {
            setFormData({
                ...initialState,
                ...patient,
                patient: patient._id,
                reg_id: patient.reg_id,
                mrd_id: patient.mrd_id
            });
        }
    };

    const mutation = useMutation({
        mutationFn: (newItem) => createData("/discharge", newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["dischargerecord"] });
            SuccessHandling(data.message);
            router.push(`/discharge/print/${data.data.reg_id}`);
        },
        onError: (error) => {
            ErrorHandeling(error);
        },
    });

    const handleSubmit = () => {

        mutation.mutate(formData);
    };

    return (
        <Suspense fallback={<Loading />}>
            <div className="flex flex-wrap w-full justify-between">
                <MiddleSection>
                    <div className="w-full">
                        <Heading heading="Discharge Form">
                            <div className="flex items-center space-x-2">
                                <PatientDropdown
                                    onSelectPatient={handlePatientSelection}
                                    PatientSearch={PatientSearch}
                                    setPatientSearch={setPatientSearch}
                                />
                            </div>
                        </Heading>

                        <div className="w-full bg-gray-100 p-4 rounded-lg shadow-sm mb-4">
                            <h1 className="text-xl font-bold text-gray-800 mb-4">
                                {formData?.fullname || "No Patient Selected"}
                            </h1>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {formData?.mrd_id && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">MRD ID</p>
                                        <p className="text-gray-700 font-mono">{formData.mrd_id}</p>
                                    </div>
                                )}
                                {formData?.reg_id && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-500">REG ID</p>
                                        <p className="text-gray-700 font-mono">{formData.reg_id}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 shadow-sm">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Surgery Performed
                                        </label>
                                        <input
                                            type="text"
                                            name="surgery"
                                            value={formData.surgery}
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
                                            value={formData.final_diagnosis}
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
                                            value={formData.discharge_summary}
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
                                            value={formData.condition}
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
                                            value={formData.advice}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-lg"
                                            rows="2"

                                            placeholder="Enter post-discharge instructions"
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
                                            value={formData.discharge_date}
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
                                            value={formData.discharge_time}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded-lg"

                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={mutation.isPending}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
                                >
                                    {mutation.isPending ? <Spinner /> : "Submit Discharge"}
                                </button>
                            </div>
                        </div>
                    </div>
                </MiddleSection>
            </div>
        </Suspense>
    );
};

export default withAuth(CreateDischarge);
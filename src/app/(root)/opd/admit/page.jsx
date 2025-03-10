"use client";

import DoctorForm from '@/components/component/Doctor';
import PatientDropdown from '@/components/component/PatientDropdown';
import PatientRegistration from '@/components/component/PatientRegistration'
import Heading from '@/components/Heading'
import Loading from '@/components/Loading'
import Tab from '@/components/Tab';
import Spinner from '@/components/ui/Spinner';
import { getDate } from '@/lib/currentDate';
import { formattedTime } from '@/lib/timeGenerate';
import { createData, fetchData } from '@/services/apiService';
import { withAuth } from '@/services/withAuth'
import { ErrorHandeling } from '@/utils/errorHandling';
import { SuccessHandling } from '@/utils/successHandling';
import { TabLinks } from '@/utils/tablinks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { lazy, Suspense, useState } from 'react'
import { FaPlus } from 'react-icons/fa';
import Select from "react-select";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const OpdAdmission = () => {
    const queryClient = useQueryClient();
    const [PatientSearch, setPatientSearch] = useState({ fullname: "" });
    const initialState = {
        uh_id: "",
        reg_id: "",
        mrd_id: "",
        patient: "",
        consultant: "",
        on_examin: "",
        pulse: "",
        spo2: "",
        jaundice: "",
        pallor: "",
        cvs: "",
        resp_system: "",
        gi_system: "",
        nervious_system: "",
        consultant_date: getDate(),
        consultant_time: formattedTime(),
        present_complain: "",
        medical_case: "",
        opd_fees: "",
        paidby: "",
        provisional_diagnosis: "",
    }
    const [formData, setFormData] = useState(initialState);
    const [consultant, setConsultant] = useState({});
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePatientSelection = (patient) => {
        setFormData({
            ...patient, patient: patient._id,
            consultant_date: getDate(),
            consultant_time: formattedTime(),
        });
    };

    const {
        data: doctorrecord,
    } = useQuery({
        queryKey: ["doctorrecord"], // Unique query key
        queryFn: () => fetchData("/doctor"), // Function to fetch data
    });

    const doctorOptions = doctorrecord?.data?.map((doctor) => ({
        value: doctor._id,
        label: doctor.drname,
    }));

    const mutation = useMutation({
        mutationFn: (newItem) => createData("/opd", newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["opdarecord"] }); // Refetch data after adding
            setFormData(initialState);
            SuccessHandling(data.message);
        },
        onError: (error) => {
            ErrorHandeling(error);
            console.error("Error adding data:", error);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents default form submission
        mutation.mutate({ ...formData, consultant: consultant.value });
    };


    return (
        <>
            <Suspense fallback={<Loading />}>
                <div className="flex flex-wrap w-full justify-between">
                    <Tab tabs={TabLinks} category="OPD" />
                    <MiddleSection>
                        <div className="w-full">
                            <Heading heading="OPD Admission">
                                <div className='flex items-center space-x-2'>
                                    <PatientDropdown onSelectPatient={handlePatientSelection}
                                        PatientSearch={PatientSearch}
                                        setPatientSearch={setPatientSearch} />
                                    <PatientRegistration />
                                </div>
                            </Heading>

                            <div className="w-full bg-gray-100 p-2 md:p-4 rounded-lg shadow-sm mb-4">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 truncate">
                                    {formData?.fullname || "No Patient Selected"}
                                </h1>
                                <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-4 gap-2 md:gap-4 ">
                                    {formData?.mrd_id && (
                                        <div className="space-y-0.5 min-w-[200px]">
                                            <p className="text-xs md:text-sm font-medium text-gray-500">MRD ID</p>
                                            <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                                {formData.mrd_id}
                                            </p>
                                        </div>
                                    )}

                                    {formData?.reg_id && (
                                        <div className="space-y-0.5 min-w-[200px]">
                                            <p className="text-xs md:text-sm font-medium text-gray-500">REG ID</p>
                                            <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                                {formData.reg_id}
                                            </p>
                                        </div>
                                    )}

                                    {formData?.phone_number && (
                                        <div className="space-y-0.5 min-w-[200px]">
                                            <p className="text-xs md:text-sm font-medium text-gray-500">Phone Number</p>
                                            <p className="text-gray-700 text-sm md:text-base truncate">
                                                {formData.phone_number}
                                            </p>
                                        </div>
                                    )}

                                    {formData?.referr_by && (
                                        <div className="space-y-0.5 min-w-[200px]">
                                            <p className="text-xs md:text-sm font-medium text-gray-500">Referred By</p>
                                            <p className="text-gray-700 text-sm md:text-base truncate">
                                                {formData.referr_by}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full p-4 bg-gray-100  rounded-xl border border-gray-200 shadow-sm">
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Height */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Height <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="hight"
                                                    value={formData?.hight}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    placeholder="Enter height"
                                                />
                                                <span className="absolute right-3 top-2.5 text-gray-500 text-sm">cm</span>
                                            </div>
                                        </div>

                                        {/* Weight */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Weight <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="weight"
                                                    value={formData?.weight}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    placeholder="Enter weight"
                                                />
                                                <span className="absolute right-3 top-2.5 text-gray-500 text-sm">kg</span>
                                            </div>
                                        </div>

                                        {/* BP */}

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Blood Pressure
                                            </label>
                                            <input
                                                type="text"
                                                name="bp"
                                                value={formData?.bp}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"

                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                On Examination
                                            </label>
                                            <select
                                                name="on_examin"
                                                value={formData?.on_examin}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                                            >
                                                <option value="">Select </option>
                                                <option value="Consus">Consus</option>
                                                <option value="UnConsus">UnConsus</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Pulse
                                            </label>
                                            <input
                                                type="text"
                                                name="pulse"
                                                value={formData?.pulse}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"

                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                SPO2
                                            </label>
                                            <input
                                                type="text"
                                                name="spo2"
                                                value={formData?.spo2}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"

                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Jaundice
                                            </label>
                                            <input
                                                type="text"
                                                name="jaundice"
                                                value={formData?.jaundice}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"

                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                CVS
                                            </label>
                                            <input
                                                type="text"
                                                name="cvs"
                                                value={formData?.cvs}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"

                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">

                                                Resp System
                                            </label>
                                            <input
                                                type="text"
                                                name="resp_system"
                                                value={formData?.resp_system}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"

                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Pallor
                                            </label>
                                            <input
                                                type="text"
                                                name="pallor"
                                                value={formData?.pallor}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"

                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                GI System
                                            </label>
                                            <input
                                                type="text"
                                                name="gi_system"
                                                value={formData?.gi_system}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"

                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Nervious System
                                            </label>
                                            <input
                                                type="text"
                                                name="nervious_system"
                                                value={formData?.nervious_system}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"

                                            />
                                        </div>

                                        {/* Admit Date & Time */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Admit Date & Time <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex gap-3">
                                                <input
                                                    type="date"
                                                    name="consultant_date"
                                                    value={formData?.consultant_date}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                                <input
                                                    type="text"
                                                    name="consultant_time"
                                                    value={formData?.consultant_time}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Consultant
                                            </label>
                                            <div className="flex items-center space-x-2">

                                                <Select
                                                    options={doctorOptions}
                                                    value={consultant}
                                                    name="consultant"
                                                    onChange={(selectedOption) =>
                                                        setConsultant(selectedOption)
                                                    }
                                                    isClearable
                                                    placeholder="Select Doctor"
                                                    className="w-full max-w-sm text-lg"
                                                />    <DoctorForm btn={<FaPlus />} />
                                            </div>
                                        </div>

                                        {/* Present Complaint */}
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Present Complaint
                                            </label>
                                            <textarea
                                                name="present_complain"
                                                value={formData?.present_complain}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="Describe the primary complaint"
                                            />
                                        </div>

                                        {/* Medical Case */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Medical Case
                                            </label>
                                            <input
                                                type="text"
                                                name="medical_case"
                                                value={formData?.medical_case}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="Enter medical case"
                                            />
                                        </div>

                                        {/* Provisional Diagnosis */}
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Provisional Diagnosis
                                            </label>
                                            <textarea
                                                name="provisional_diagnosis"
                                                value={formData?.provisional_diagnosis}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="Enter initial diagnosis"
                                            />
                                        </div>
                                        <div className="space-y-2 lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Note
                                            </label>
                                            <textarea
                                                name="note"
                                                value={formData?.note}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="Enter initial diagnosis"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Opd Fees
                                            </label>
                                            <input
                                                type="text"
                                                name="opd_fees"
                                                value={formData?.opd_fees}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Paid by
                                            </label>

                                            <select
                                                name="paidby"
                                                value={formData?.paidby}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                                            >
                                                <option value="">Select</option>
                                                <option value="Cash">Cash</option>
                                                <option value="Online">Online</option>
                                            </select>
                                        </div>

                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-6 flex justify-end space-x-2">
                                        <button

                                            onClick={() => setFormData(initialState)} // Ensure proper reset
                                            className="px-6 py-2 bg-gray-500 text-white rounded-lg transition-colors font-medium hover:bg-gray-600"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="px-6 py-2 bg-primary text-white rounded-lg transition-colors font-medium flex items-center justify-center disabled:bg-gray-400"
                                            disabled={mutation.isPending} // Disable if mutation is pending
                                        >
                                            {mutation.isPending ? (
                                                <>
                                                    <Spinner />

                                                </>
                                            ) : (
                                                "Admit Patient"
                                            )}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </MiddleSection>
                </div>
            </Suspense>
        </>
    )
}

export default withAuth(OpdAdmission)

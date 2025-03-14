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
import { createData, fetchData, updateData } from '@/services/apiService';
import { withAuth } from '@/services/withAuth'
import { ErrorHandeling } from '@/utils/errorHandling';
import { SuccessHandling } from '@/utils/successHandling';
import { TabLinks } from '@/utils/tablinks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { lazy, Suspense, useState } from 'react'
import { FaPlus } from 'react-icons/fa';
import Select from "react-select";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const IpdAdmission = () => {
    const queryClient = useQueryClient();

    const router = useRouter()
    const initialState = {
        uh_id: "",
        reg_id: "",
        mrd_id: "",
        patient: "",
        hight: "",
        weight: "",
        bp: "",
        admited_in: "IPD",
        consultant: "",
        admission_charge: "200",
        paidby: "",
        admit_date: getDate(),
        admit_time: formattedTime(),
        present_complain: "",
        medical_case: "",
        provisional_diagnosis: "",
    }

    const [formData, setFormData] = useState(initialState);
    const [consultant, setConsultant] = useState({});
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePatientSelection = (patient) => {
        if (patient?.ipd_id) {
            fetchData(`/ipd?id=${patient.ipd_id}`).then((data) => {
                setFormData({
                    ...data.data,
                    fullname: data?.data?.patient?.fullname,
                    phone_number: data?.data?.patient?.phone_number,
                    referr_by: data?.data?.patient?.referr_by,
                });
                setConsultant({
                    value: data?.data?.consultant?._id,
                    label: data?.data?.consultant?.drname,
                });
            }).catch((error) => {
                ErrorHandeling(error);
            });

        } else {

            setFormData({
                ...formData, ...patient, patient: patient._id,
            });

        }

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
        mutationFn: (newItem) => createData("/ipd", newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["ipdarecord"] }); // Refetch data after adding
            setFormData(initialState);
            SuccessHandling(data.message);
            router.push(`/ipd/print/${data?.data?._id}`);
        },
        onError: (error) => {
            ErrorHandeling(error);
        },
    });
    const mutationUpdate = useMutation({
        mutationFn: (newItem) => updateData("/ipd", newItem._id, newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["ipdarecord"] }); // Refetch data after adding
            setFormData(initialState);
            SuccessHandling(data.message);
        },
        onError: (error) => {
            ErrorHandeling(error);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents default form submission
        mutation.mutate({ ...formData, consultant: consultant.value });
    };

    const handleUpdate = () => {
        mutationUpdate.mutate({ ...formData, consultant: consultant.value });
    };


    return (
        <>
            <Suspense fallback={<Loading />}>
                <div className="flex flex-wrap w-full justify-between">
                    <Tab tabs={TabLinks} category="IPD" />
                    <MiddleSection>
                        <div className="w-full">
                            <Heading heading="IPD Admission">
                                <div className='flex items-center space-x-2'>
                                    <PatientDropdown onSelectPatient={handlePatientSelection} />
                                    <PatientRegistration admitedin="IPD" />
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
                                                placeholder="e.g., 120/80"
                                            />
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



                                        {/* Admit Date & Time */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Admit Date & Time <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex gap-3">
                                                <input
                                                    type="date"
                                                    name="admit_date"
                                                    value={formData?.admit_date}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                                <input
                                                    type="text"
                                                    name="admit_time"
                                                    value={formData?.admit_time}
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
                                                />
                                            </div>
                                        </div>


                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Admission Charge
                                            </label>
                                            <input
                                                type="text"
                                                name="admission_charge"
                                                value={formData?.admission_charge}
                                                onChange={handleChange}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="Enter medical case"
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
                                                <option value="Card">Card</option>
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
                                        {formData?.patient?.ipd_id ? <button
                                            onClick={handleUpdate}
                                            className="px-6 py-2 bg-primary text-white rounded-lg transition-colors font-medium flex items-center justify-center disabled:bg-gray-400"
                                            disabled={mutation.isPending} // Disable if mutation is pending
                                        >
                                            {mutationUpdate.isPending ? (
                                                <>
                                                    <Spinner />

                                                </>
                                            ) : (
                                                "Update Patient"
                                            )}
                                        </button> :
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
                                            </button>}
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

export default withAuth(IpdAdmission)

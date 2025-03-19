"use client";

import DoctorForm from '@/components/component/Doctor';
import PatientDropdown from '@/components/component/PatientDropdown';
import PatientRegistration from '@/components/component/PatientRegistration'
import Heading from '@/components/Heading'
import Loading from '@/components/Loading'
import Tab from '@/components/Tab';
import Spinner from '@/components/ui/Spinner';
import { getCompactAge } from '@/lib/ageCount';
import { getDate } from '@/lib/currentDate';
import { formattedTime } from '@/lib/timeGenerate';
import { createData, fetchData, updateData } from '@/services/apiService';
import { withAuth } from '@/services/withAuth'
import { ErrorHandeling } from '@/utils/errorHandling';
import { SuccessHandling } from '@/utils/successHandling';
import { TabLinks } from '@/utils/tablinks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { lazy, Suspense, useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa';
import Select from "react-select";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const IpdAdmission = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const router = useRouter()
    const searchParams = useSearchParams()
    const search = searchParams.get('bedid')

    const initialState = {
        reg_id: "",
        mrd_id: "",
        fullname: "",
        phone_number: "",
        age: "",
        dob: "",
        gender: "",
        marital_status: "",
        occupation: "",
        blood_group: "",
        address: "",
        aadhar: "",
        guardian_name: "",
        religion: "",
        guardian_phone: "",
        referr_by: "",
        patient: "",
        hight: "",
        weight: "",
        bp: "",
        admited_in: "IPD",
        consultant: {},
        admission_charge: "200",
        paidby: "",
        admit_date: getDate(),
        admit_time: formattedTime(),
        present_complain: "",
        medical_case: "",
        provisional_diagnosis: "",
        admited_by: session?.user?.username,
    }
    const [selectDob, setSelectDob] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState(initialState);
    const [consultant, setConsultant] = useState({});
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const handlemrdIdSearch = async () => {
    }

    const {
        data: doctorrecord,
    } = useQuery({
        queryKey: ["doctorrecord"], // Unique query key
        queryFn: () => fetchData("/doctor"), // Function to fetch data
    });

    const doctorOptions = doctorrecord?.data?.map((doctor) => ({
        value: doctor,
        label: doctor.drname,
    }));

    useEffect(() => {
        setFormData(prev => ({ ...prev, age: getCompactAge(selectDob || ""), dob: selectDob }));
    }, [selectDob]);

    useEffect(() => {
        if (consultant) {
            setFormData({ ...formData, consultant: consultant.value });
        }
    }, [consultant]);

    const mutation = useMutation({
        mutationFn: (newItem) => createData(`/ipd?bedid=${search || ""}`, newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["ipdarecord"] }); // Refetch data after adding
            setFormData(initialState);
            SuccessHandling(data.message);
            if (search) {
                router.push(`/ipd/print/${data?.data?.reg_id}`);
            } else {
                router.push(`/bedmanagement/bedallotment/${data?.data?._id}?reg_id=${data?.data?.reg_id}`);
            }
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
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter MRD ID"
                                        className="p-2 border rounded"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button
                                        onClick={handlemrdIdSearch}
                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Search
                                    </button>
                                </div>
                            </Heading>

                            <div className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 shadow-sm mb-4">
                                <div className="space-y-8">
                                    {/* Personal Information Section */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Personal Details */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="fullname"
                                                    value={formData.fullname}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="phone_number"
                                                    value={formData.phone_number}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Date of Birth
                                                </label>
                                                <input
                                                    type="date"
                                                    name="selectDob"
                                                    value={selectDob}
                                                    onChange={(e) => setSelectDob(e.target.value)}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Age
                                                </label>
                                                <input
                                                    type="text"
                                                    name="age"
                                                    value={formData.age}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Gender
                                                </label>
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Marital Status
                                                </label>
                                                <select
                                                    name="marital_status"
                                                    value={formData.marital_status}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select</option>
                                                    <option value="Single">Single</option>
                                                    <option value="Married">Married</option>
                                                    <option value="Divorced">Divorced</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Occupation
                                                </label>
                                                <input
                                                    type="text"
                                                    name="occupation"
                                                    value={formData.occupation}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Blood Group
                                                </label>
                                                <select
                                                    name="blood_group"
                                                    value={formData.blood_group}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select</option>
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Aadhar Number
                                                </label>
                                                <input
                                                    type="text"
                                                    name="aadhar"
                                                    value={formData.aadhar}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Guardian Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="guardian_name"
                                                    value={formData.guardian_name}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Religion
                                                </label>
                                                <input
                                                    type="text"
                                                    name="religion"
                                                    value={formData.religion}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Guardian Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    name="guardian_phone"
                                                    value={formData.guardian_phone}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Referred By
                                                </label>
                                                <input
                                                    type="text"
                                                    name="referr_by"
                                                    value={formData.referr_by}
                                                    onChange={handleChange}
                                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
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
                                                Consultant <span className="text-red-500">*</span>
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
                                                <option value="Upi">Upi</option>
                                                <option value="Cashless">Cashless</option>
                                                <option value="Sasthyasathi">Sasthyasathi</option>
                                                <option value="Cancel">Cancel</option>
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

"use client";

import Loading from '@/components/Loading'
import PrintUi from '@/components/ui/PrintUi';
import { useHospital } from '@/context/setting/HospitalInformation';
import { formatDate } from '@/lib/formateDate';
import { fetchData } from '@/services/apiService';
import { withAuth } from '@/services/withAuth'
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'


const IpdPrint = () => {
    const { data: session } = useSession();
    const { hospitalInfo } = useHospital();
    const { slug } = useParams();
    const [formData, setFormData] = useState({});

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["ipddetails"], // Unique query key
        queryFn: () => fetchData(`/ipd?id=${slug}`), // Function to fetch data
    });

    useEffect(() => {
        refetch(); // Fetch data when slug changes
    }, [slug]);

    useEffect(() => {
        if (data?.data) {
            setFormData(data.data); // Update form data when data is available
        }
    }, [data]);


    return (
        <>
            {isLoading && <Loading />}
            {/* Declaration */}
            <PrintUi path="/ipd/record">
                <div className="w-full flex justify-between items-center px-6 py-2 border-b-2 border-black ">
                    {/* Left Side - Logo and Name */}
                    <div className="flex items-center space-x-4">
                        <Image
                            width={120}
                            height={120}
                            src={hospitalInfo?.logo}
                            alt="Hospital Logo"
                            className="h-auto"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-blue-900">{hospitalInfo?.hospital_name}</h1>
                            <p className="bg-blue-900 text-white px-2 py-1 text-sm font-semibold rounded-md w-fit">
                                Lic No: {hospitalInfo?.licence_number}
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Contact Details */}
                    <div className="text-right text-sm text-gray-700 leading-tight">
                        <p>{hospitalInfo?.address}</p>
                        <p>
                            <span className="font-semibold">Helpline:</span> {hospitalInfo?.phone}
                        </p>
                        <p>
                            <span className="font-semibold">GST:</span> {hospitalInfo?.gst_number}
                        </p>
                        <p className="text-blue-900">{hospitalInfo?.email}</p>
                    </div>
                </div>

                <div className=" mx-auto bg-white p-6 rounded-lg font-bold">
                    <div className="flex justify-between text-sm font-semibold mb-4">
                        <div className="flex gap-2 items-center">
                            <span>DATE:</span>
                            <input type="text" value={formData?.admit_date} className="border-b border-black w-24 text-center" readOnly />
                        </div>
                        <div className="flex gap-2 items-center">
                            <span>TIME:</span>
                            <input type="text" value={formData?.admit_time} className="border-b border-black w-16 text-center" readOnly />
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div className="text-sm space-y-2 border-b pb-4">
                        <div className="flex justify-between">
                            <span>PATIENT NAME:</span>
                            <input type="text" value={formData?.patient?.fullname} className="border-b border-black flex-1 ml-2" readOnly />
                        </div>
                        <div className="flex justify-between">
                            <span>PHONE NO:</span>
                            <input type="text" value={formData?.patient?.phone_number} className="border-b border-black flex-1 ml-2" readOnly />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <span>AGE:</span>
                                <input type="text" value={formData?.patient?.age} className="border-b border-black w-12" readOnly />
                            </div>
                            <div className="flex items-center gap-2">
                                <span>GENDER:</span>
                                <input type="text" value={formData?.patient?.gender} className="border-b border-black w-16" readOnly />
                            </div>
                            <div className="flex items-center gap-2">
                                <span>RELIGION:</span>
                                <input type="text" value={formData?.patient?.religion} className="border-b border-black flex-1" readOnly />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <span>REG ID:</span>
                                <input type="text" value={formData?.reg_id} className="border-b border-black flex-1" readOnly />
                            </div>
                            <div className="flex items-center gap-2">
                                <span>MRD ID:</span>
                                <input type="text" value={formData?.mrd_id} className="border-b border-black flex-1" readOnly />
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="text-sm space-y-2 border-b pb-4 pt-4">
                        <div className="flex justify-between">
                            <span>GUARDIAN:</span>
                            <input type="text" value={formData?.patient?.guardian_name} className="border-b border-black flex-1" readOnly />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <span>VILL:</span>
                                <input type="text" value={formData?.patient?.city_vill} className="border-b border-black flex-1" readOnly />
                            </div>
                            <div className="flex items-center gap-2">
                                <span>P.O:</span>
                                <input type="text" value={formData?.patient?.po} className="border-b border-black flex-1" readOnly />
                            </div>
                            <div className="flex items-center gap-2">
                                <span>P.S:</span>
                                <input type="text" value={formData?.patient?.ps} className="border-b border-black flex-1" readOnly />
                            </div>
                            <div className="flex items-center gap-2">
                                <span>DIST:</span>
                                <input type="text" value={formData?.patient?.dist} className="border-b border-black flex-1" readOnly />
                            </div>
                        </div>
                    </div>

                    {/* Doctor Information */}
                    <div className="text-sm border-b pb-4 pt-4">
                        <div className="flex justify-between">
                            <span>CONSULTANT:</span>
                            <input type="text" value={formData?.consultant?.drname} className="border-b border-black flex-1" readOnly />
                        </div>
                    </div>

                    {/* Declaration */}
                    <div className="text-sm text-left text-red-600 font-semibold pt-4 border-b pb-4">
                        <p>WITH BEST OF MY KNOWLEDGE THE ABOVE STATEMENTS ARE TRUE. I MUST OBEY THE RULES & REGULATIONS OF THIS NURSING HOME AND PAY ALL EXPENSES BEFORE DISCHARGE.</p>
                        <p className="mt-2">1. I HEREBY CONSENT TO THE TREATMENT AND PROCEDURES ADVISED BY THE HOSPITAL AUTHORITIES.</p>
                        <p className="mt-1">2. I UNDERSTAND THAT THE HOSPITAL IS NOT RESPONSIBLE FOR THE LOSS OF PERSONAL BELONGINGS.</p>
                        <p className="mt-1">3. I AGREE TO FOLLOW ALL MEDICAL ADVICE AND MEDICATION SCHEDULES PRESCRIBED BY THE TREATING PHYSICIAN.</p>
                        <p className="mt-1">4. I ACKNOWLEDGE THAT THE HOSPITAL SHALL NOT BE LIABLE FOR ANY UNFORESEEN COMPLICATIONS DURING TREATMENT.</p>
                        <p className="mt-1">5. I UNDERSTAND THAT ALL MEDICAL RECORDS WILL BE MAINTAINED AS PER HOSPITAL POLICY.</p>
                        <p className="mt-1">6. I AGREE TO INFORM THE HOSPITAL STAFF IMMEDIATELY ABOUT ANY CHANGE IN PATIENT'S CONDITION.</p>
                    </div>


                    <div className="text-left uppercase">
                        <p>ADMISSION FEE OF ₹{formData?.admission_charge} HAS BEEN PAID IN {formData?.paidby}</p>

                    </div>

                    {/* Signature Section */}
                    <div className="flex justify-between text-sm pt-10">
                        <span>SIGNATURE OF GUARDIAN</span>
                        <input type="text" className="border-b border-black w-48" readOnly />
                    </div>

                    {/* Footer Section */}
                    <div className="flex justify-between text-xs pt-4">
                        {formData?.referr_by && <span>Referred by {formData?.referr_by}</span>}
                        <span>Admited by {session?.user?.username}</span>
                    </div>
                </div>
            </PrintUi>


        </>
    )
}

export default withAuth(IpdPrint)



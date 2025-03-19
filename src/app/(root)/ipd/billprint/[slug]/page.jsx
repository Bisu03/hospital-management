"use client";

import Loading from "@/components/Loading";
import PrintUi from "@/components/ui/PrintUi";
import { useHospital } from "@/context/setting/HospitalInformation";
import { withAuth } from "@/services/withAuth";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/services/apiService";
import { formatDate } from "@/lib/formateDate";
import QRCode from "react-qr-code";
import { amountToWords } from "@/lib/numberToWord";
import Image from "next/image";

const LabReceipt = () => {
    const { slug } = useParams();
    const { data: session } = useSession();
    const { hospitalInfo } = useHospital();

    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    const [Acomodation, setAcomodation] = useState({ items: [], total: 0 });
    const [DoctorCharge, setDoctorCharge] = useState({ items: [], total: 0 });
    const [ServiceCharges, setServiceCharges] = useState({ items: [], total: 0 });


    const handleGetPatient = async () => {

        try {
            setLoading(true);
            const { data } = await fetchData(`/billing/${slug}`);
            if (data) {
                setFormData(data);
                setAcomodation(data?.acomodation_cart || { items: [], total: 0 });
                setDoctorCharge(data?.consultant_cart || { items: [], total: 0 });
                setServiceCharges(data?.service_cart || { items: [], total: 0 });
            }
        } catch (error) {
            ErrorHandeling(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetPatient(); // Fetch data when slug changes
    }, [slug]);


    return (
        <PrintUi path="/labtest/record">

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
                        <h1 className="text-3xl font-bold text-blue-900">{hospitalInfo?.hospital_name}</h1>
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

            {loading && <Loading />}
            <div className="mx-auto bg-white rounded-lg p-4">
                {/* Patient & Report Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Patient Details */}
                    <div className="space-y-1">
                        <h3 className="font-semibold text-sm border-b border-black pb-1 print:text-xs">
                            Patient Details
                        </h3>
                        <div className="text-xs space-y-0.5 print:text-xs">
                            <p><span className="font-semibold">Full Name:</span> {formData?.patient?.fullname}</p>
                            <div className="flex space-x-2">
                                <p><span className="font-semibold">Gender:</span> {formData?.patient?.gender}</p>
                                <p><span className="font-semibold">Age:</span> {formData?.patient?.age}</p>
                            </div>
                            <p><span className="font-semibold">Phone No.:</span> {formData?.patient?.phone_number}</p>
                            <p><span className="font-semibold">Address:</span> {formData?.patient?.address}</p>
                        </div>
                    </div>

                    {/* Report Details */}
                    <div>
                        <h3 className="font-semibold text-sm border-b border-black pb-1 print:text-xs">
                            Admission Details
                        </h3>
                        <div className="text-xs space-y-0.5 print:text-xs">
                            <p><span className="font-semibold">Admit Date/Time:</span> {formatDate(formData?.ipd?.admit_date)}/{formData?.ipd?.admit_time}</p>
                            <p><span className="font-semibold">MRD No.:</span> {formData?.mrd_id}</p>
                            <p><span className="font-semibold">Reg No.:</span> {formData?.reg_id}</p>
                        </div>
                    </div>
                </div>

                {/* Tests Table */}
                <h1 className="boreder-b-2 text-lg">Doctor Charges</h1>
                <table className="w-full mb-4 text-xs print:text-[10px]">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-1 text-left border ">Service Name</th>
                            <th className="p-1 text-right border">Per Unit Charge</th>
                            <th className="p-1 text-right border">Unit</th>
                            <th className="p-1 text-right border">Charge (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DoctorCharge?.items?.map((item, index) => (
                            <tr key={index}>
                                <td className="p-1 border">{item.drname}</td>
                                <td className="p-1 text-right border">{(item.charge / item.visit)}/Visit</td>
                                <td className="p-1 text-right border">{item.visit}</td>
                                <td className="p-1 text-right border">₹{item.charge}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {Object.entries(
                    ServiceCharges?.items?.reduce((acc, item) => {
                        if (!acc[item.category_name]) {
                            acc[item.category_name] = [];
                        }
                        acc[item.category_name].push(item);
                        return acc;
                    }, {})
                ).map(([category, items], catIndex) => (
                    <div key={catIndex} className="mb-6">
                        <h1 className="text-lg font-semibold border-b-2 mb-2 print:text-[12px]">
                            {category}
                        </h1>
                        <table className="w-full mb-4 text-xs print:text-[10px]">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-1 text-left border">Service Name</th>
                                    <th className="p-1 text-right border">Per Unit Charge</th>
                                    <th className="p-1 text-right border">Unit</th>
                                    <th className="p-1 text-right border">Charge (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={`${catIndex}-${index}`}>
                                        <td className="p-1 border">{item.servicename}</td>
                                        <td className="p-1 text-right border">
                                            {item.unittype ?
                                                `${(+item.unitcharge / item.unit).toFixed(2)}/${item.unittype}` :
                                                "-"
                                            }
                                        </td>
                                        <td className="p-1 text-right border">
                                            {item.unittype ? item.unit : "-"}
                                        </td>
                                        <td className="p-1 text-right border">₹{item.unitcharge}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                {/* Billing Summary */}
                <div className="flex justify-between space-x-2">

                    <div className="flex-grow text-left px-4">
                        <h2 className="text-xs font-semibold text-gray-600">Amount in Words:</h2>
                        <h1 className="text-sm font-medium text-gray-700">
                            {amountToWords(formData?.amount?.total)}
                        </h1>
                    </div>

                    <div className="w-72 space-y-1 text-xs print:text-[10px]">
                        <div className="flex justify-between font-semibold">
                            <span>Total Charges:</span>
                            <span className="text-right">₹{formData?.amount?.total?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount Amount:</span>
                            <span className="text-right">₹{formData?.amount?.discount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Net Total:</span>
                            <span className="text-right">₹{formData?.amount?.netTotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Paid Amount:</span>
                            <span className="text-right">₹{formData?.amount?.paid?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Payment Method:</span>
                            <span className="text-right capitalize">{formData?.paydby}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1">
                            <span>Due Amount:</span>
                            <span className="text-red-600 text-right">₹{formData?.amount?.due?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Signature & Footer */}
                <div className="mt-2 border-t-2 border-black pt-10">
                    <div className="flex justify-between items-end">
                        <div className="text-xs">
                            Thank you for choosing Tamluk Institute Of Urology Pathology
                        </div>
                        <div className="text-center">
                            <div className="mb-2 h-1 w-48 border-b-2 border-black"></div>
                            <p className="text-sm">E.&O.E: {formData?.patient?.admited_by}</p>
                        </div>
                    </div>
                </div>
            </div>
        </PrintUi>
    );
};

export default withAuth(LabReceipt);

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

const IpsEstimate = () => {
    const { slug } = useParams();
    const { data: session } = useSession();
    const { hospitalInfo } = useHospital();

    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    console.log(formData);


    const [Acomodation, setAcomodation] = useState({ items: [], total: 0 });
    const [DoctorCharge, setDoctorCharge] = useState({ items: [], total: 0 });
    const [ServiceCharges, setServiceCharges] = useState({ items: [], total: 0 });
    const [MedicineCharge, setMedicineCharge] = useState({ items: [], total: 0 });

    const handleGetPatient = async () => {

        try {
            setLoading(true);
            const { data } = await fetchData(`/billing/${slug}`);
            if (data) {
                setFormData(data);
                setAcomodation(data?.acomodation_cart || { items: [], total: 0 });
                setDoctorCharge(data?.consultant_cart || { items: [], total: 0 });
                setServiceCharges(data?.service_cart || { items: [], total: 0 });
                setMedicineCharge(data?.medicine_cart || { items: [], total: 0 });
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
                        <h1 className="text-3xl font-bold text-blue-900">{hospitalInfo?.hospital_name}</h1>
                        <p className="bg-blue-900 text-white px-2 py-1 text-sm font-semibold rounded-md w-fit mt-1">
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
            <div className="mx-auto bg-white p-2 print:p-1">
                {/* Compact Patient Details */}
                <h2 className="text-lg font-bold text-center mb-2">Estimate Receipt</h2>
                <div className="grid grid-cols-3 gap-1 mb-2 print:grid-cols-3">
                    <div className="col-span-2">
                        <h3 className="text-xs font-semibold border-b border-black">Patient Details</h3>
                        <div className="text-[10px] space-y-0.5 print:text-[9px]">
                            <p>Name:- {formData?.patient?.fullname} ({formData?.patient?.gender}/{formData?.patient?.age})</p>
                            <p>Phone Number:- {formData?.patient?.phone_number}</p>
                            <p className="truncate">Address:- {formData?.patient?.address}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold border-b border-black">Admission</h3>
                        <div className="text-[10px] space-y-0.5 print:text-[9px]">
                            <p>{formatDate(formData?.ipd?.admit_date)} {formData?.ipd?.admit_time}</p>
                            <p>MRD: {formData?.mrd_id}</p>
                            <p>Reg: {formData?.reg_id}</p>
                        </div>
                    </div>
                </div>

                {/* Compact Tables */}
                <div className="space-y-1">
                    <h3 className="text-xs font-semibold border-b border-black">Bed Charges</h3>
                    <table className="w-full text-[10px] print:text-[8px]">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-0.5 text-left border">Bed Type</th>
                                <th className="p-0.5 text-right border">Charge Per Day</th>
                                <th className="p-0.5 text-right border">Days</th>
                                <th className="p-0.5 text-right border">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Acomodation?.items?.map((item, index) => (
                                <tr key={index}>
                                    <td className="p-0.5 border">{item.bed_category} - {item.bed_number}</td>
                                    <td className="p-0.5 text-right border">₹{(item.bed_charge / item.number_days).toFixed(2)}/Day</td>
                                    <td className="p-0.5 text-right border">{item.number_days}</td>
                                    <td className="p-0.5 text-right border">₹{item.bed_charge}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="space-y-1">
                    <h3 className="text-xs font-semibold border-b border-black">Doctor Charges</h3>
                    <table className="w-full text-[10px] print:text-[8px]">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-0.5 text-left border">Doctor</th>
                                <th className="p-0.5 text-right border">Rate</th>
                                <th className="p-0.5 text-right border">Visits</th>
                                <th className="p-0.5 text-right border">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DoctorCharge?.items?.map((item, index) => (
                                <tr key={index}>
                                    <td className="p-0.5 border">{item.drname}</td>
                                    <td className="p-0.5 text-right border">₹{(item.charge / item.visit).toFixed(2)}/visit</td>
                                    <td className="p-0.5 text-right border">{item.visit}</td>
                                    <td className="p-0.5 text-right border">₹{item.charge}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {Object.entries(
                    ServiceCharges?.items?.reduce((acc, item) => {
                        if (!acc[item.category_name]) acc[item.category_name] = [];
                        acc[item.category_name].push(item);
                        return acc;
                    }, {})
                ).map(([category, items], catIndex) => (
                    <div key={catIndex} className="mt-1">
                        <h3 className="text-xs font-semibold border-b border-black">{category}</h3>
                        <table className="w-full text-[10px] print:text-[8px]">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-0.5 text-left border">Service</th>
                                    <th className="p-0.5 text-right border">Rate</th>
                                    <th className="p-0.5 text-right border">Qty</th>
                                    <th className="p-0.5 text-right border">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={`${catIndex}-${index}`}>
                                        <td className="p-0.5 border">{item.servicename}</td>
                                        <td className="p-0.5 text-right border">
                                            {item.unittype ? `₹${(+item.unitcharge / item.unit).toFixed(2)}/${item.unittype}` : "-"}
                                        </td>
                                        <td className="p-0.5 text-right border">{item.unit || "-"}</td>
                                        <td className="p-0.5 text-right border">₹{item.unitcharge}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                <div className="mt-1">
                    <h3 className="text-xs font-semibold border-b border-black">Medicines</h3>
                    <table className="w-full text-[10px] print:text-[8px]">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-0.5 text-left border">Medicine</th>
                                <th className="p-0.5 text-right border">Rate</th>
                                <th className="p-0.5 text-right border">Unit</th>
                                <th className="p-0.5 text-right border">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MedicineCharge?.items?.map((item, index) => (
                                <tr key={index}>
                                    <td className="p-0.5 border">{item.name}</td>
                                    <td className="p-0.5 text-right border">₹{(item.mrp / item.quantity).toFixed(2)}{item.unit_type && `/${item.unit_type}`}</td>
                                    <td className="p-0.5 text-right border">{item.quantity}</td>
                                    <td className="p-0.5 text-right border">₹{item.mrp.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Compact Billing Summary */}
                <div className="mt-2 flex justify-between gap-2 text-[10px] print:text-[8px]">
                    <div className="flex-1">
                        <p className="font-semibold">Amount in Words:</p>
                        <p className="italic">{amountToWords(formData?.amount?.total)}</p>
                    </div>

                    <div className="w-48 space-y-0.5">
                        <div className="flex justify-between">
                            <span>Total:</span>
                            <span>₹{formData?.amount?.total?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>₹{formData?.amount?.discount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Net Total:</span>
                            <span>₹{formData?.amount?.netTotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Paid:</span>
                            <span>₹{formData?.amount?.paid?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Method:</span>
                            <span className="capitalize">{formData?.paydby}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-0.5">
                            <span>Due:</span>
                            <span className="text-red-600">₹{formData?.amount?.due?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Compact Footer */}
                <div className="mt-1 pt-1 border-t border-black">
                    <div className="flex justify-between items-center text-[10px] text-gray-600">
                        <p>Thank you for choosing {hospitalInfo?.hospital_name}</p>
                        <div className="text-center">
                            {/* <div className="mb-0.5 w-32 border-b border-black"></div>
                            <p>E.&O.E: {formData?.patient?.admited_by}</p> */}
                        </div>
                    </div>
                </div>
            </div>
        </PrintUi>
    );
};

export default withAuth(IpsEstimate);

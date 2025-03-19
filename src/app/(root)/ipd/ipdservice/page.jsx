"use client";

import BedChargeForm from '@/components/component/services/Bedcharge';
import DoctorForm from '@/components/component/services/Consultant';
import ServiceForm from '@/components/component/services/ServiceCharge/page';
import Heading from '@/components/Heading';
import Loading from '@/components/Loading';
import { formatDate } from '@/lib/formateDate';
import { fetchData, updateData } from '@/services/apiService';
import { withAuth } from '@/services/withAuth';
import { ErrorHandeling } from '@/utils/errorHandling';
import { SuccessHandling } from '@/utils/successHandling';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import React, { lazy, Suspense, useEffect, useState } from 'react';

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const IpdService = () => {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const search = searchParams.get('regid');

    const [searchTerm, setSearchTerm] = useState(search || "");
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    const [Acomodation, setAcomodation] = useState({ items: [], total: 0 });
    const [DoctorCharge, setDoctorCharge] = useState({ items: [], total: 0 });
    const [ServiceCharges, setServiceCharges] = useState({ items: [], total: 0 });

    const [TotalAmount, setTotalAmount] = useState({
        amount: {
            total: 0,
            discount: 0,
            netTotal: 0,
            paid: 0,
            due: 0,
        },
        paidby: "",
    });

    const calculateTotals = () => {
        const total = (Acomodation.total || 0) + (DoctorCharge.total || 0) + (ServiceCharges.total || 0);
        const netTotal = total - (TotalAmount.amount.discount || 0);
        const due = netTotal - (TotalAmount.amount.paid || 0);

        setTotalAmount(prev => ({
            ...prev,
            amount: {
                ...prev.amount,
                total,
                netTotal: netTotal >= 0 ? netTotal : 0,
                due: due >= 0 ? due : 0,
            },
        }));
    };

    useEffect(() => {
        calculateTotals();
    }, [Acomodation, DoctorCharge, ServiceCharges, TotalAmount.amount.discount, TotalAmount.amount.paid]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "paidby") {
            setTotalAmount(prev => ({ ...prev, paidby: value }));
        } else {
            setTotalAmount(prev => ({
                ...prev,
                amount: {
                    ...prev.amount,
                    [name]: parseFloat(value) || 0,
                },
            }));
        }
    };

    const handleGetPatient = async () => {
        if (!searchTerm) return;
        try {
            setLoading(true);
            const { data } = await fetchData(`/billing/${searchTerm}`);
            if (data) {
                setFormData(data);
                setAcomodation(data?.acomodation_cart || { items: [], total: 0 });
                setDoctorCharge(data?.consultant_cart || { items: [], total: 0 });
                setServiceCharges(data?.service_cart || { items: [], total: 0 });
                setTotalAmount({ amount: data?.amount, paidby: data?.paidby } || {
                    amount: {
                        total: 0,
                        discount: 0,
                        netTotal: 0,
                        paid: 0,
                        due: 0,
                    },
                    paidby: ""
                });
            }
        } catch (error) {
            ErrorHandeling(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (search) {
            handleGetPatient();
        }
    }, [search]);

    const handleSubmit = async () => {
        try {
            const { data } = await updateData(`/billing`, searchTerm, {
                acomodation_cart: Acomodation,
                consultant_cart: DoctorCharge,
                service_cart: ServiceCharges,
                amount: TotalAmount.amount,
                paidby: TotalAmount.paidby
            });
            SuccessHandling("Service Updated Successfully");
        } catch (error) {
            ErrorHandeling(error)
        }
    };

    console.log(DoctorCharge);
    

    return (
        <>
            <Suspense fallback={<Loading />}>
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
                                        {loading ? "Loading..." : "Search"}
                                    </button>
                                </div>
                            </Heading>

                            <div className="w-full bg-gray-100 p-2 md:p-4 rounded-lg shadow-sm mb-4">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 truncate">
                                    {formData?.patient?.fullname || "Enter Reg ID"}
                                </h1>
                                <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-4 gap-2 md:gap-4 ">
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
                                                {formatDate(formData?.ipd?.admit_date)}
                                            </p>
                                        </div>
                                    )}
                                    {formData?.ipd?.admit_time && (
                                        <div className="space-y-0.5 min-w-[200px]">
                                            <p className="text-xs md:text-sm font-medium text-gray-500">
                                                Admit Time
                                            </p>
                                            <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                                {formData?.ipd?.admit_time}
                                            </p>
                                        </div>
                                    )}
                                    {formData?.referr_by && (
                                        <div className="space-y-0.5 min-w-[200px]">
                                            <p className="text-xs md:text-sm font-medium text-gray-500">
                                                Referred By
                                            </p>
                                            <p className="text-gray-700 text-sm md:text-base truncate">
                                                {formData?.patient?.referr_by}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h1 className="border-b-2 border-black text-lg">Doctor Charge</h1>
                            <DoctorForm DoctorCharge={DoctorCharge} setDoctorCharge={setDoctorCharge} />
                            <h1 className="border-b-2 border-black text-lg">Service Charge</h1>
                            <ServiceForm ServiceCharges={ServiceCharges} setServiceCharges={setServiceCharges} />

                            <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-100">
                                <div className="max-w-md ml-auto space-y-6 ">
                                    {/* Total Amount */}
                                    <div className="flex justify-between items-center pb-4 border-b">
                                        <span className="text-gray-600 font-medium">Total:</span>
                                        <span className="text-lg font-semibold text-blue-600">
                                            ₹{TotalAmount.amount.total}
                                        </span>
                                    </div>

                                    {/* Discount and Paid Amount */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-600">Discount</label>
                                            <input
                                                type="number"
                                                name="discount"
                                                value={TotalAmount.amount.discount}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-600">Paid Amount</label>
                                            <input
                                                type="number"
                                                name="paid"
                                                value={TotalAmount.amount.paid}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Net Total */}
                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <span className="text-gray-600 font-medium">Net Total:</span>
                                        <span className="text-lg font-semibold text-green-600">
                                            ₹{TotalAmount.amount.netTotal}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <span className="text-gray-600 font-medium">Due:</span>
                                        <span className="text-lg font-semibold text-red-600">
                                            ₹{TotalAmount.amount.due}
                                        </span>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-600">Payment Method</label>
                                        <select
                                            name="paidby"
                                            value={TotalAmount.paidby}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                                        >
                                            <option value="">Select Payment Method</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Upi">UPI</option>
                                            <option value="Cashless">Cashless</option>
                                            <option value="Sasthyasathi">Sasthyasathi</option>
                                            <option value="Cancel">Cancel</option>
                                        </select>
                                    </div>
                                    <button onClick={handleSubmit} className='btn btn-primary w-full'>Submit</button>
                                </div>
                            </div>
                        </div>
                    </MiddleSection>
                </div>
            </Suspense>
        </>
    );
};

export default withAuth(IpdService);

"use client";

import AcomodationForm from "@/components/component/services/Bedcharge";
import BedChargeForm from "@/components/component/services/Bedcharge";
import DoctorForm from "@/components/component/services/Consultant";
import MedicineForm from "@/components/component/services/Medicine";
import ServiceForm from "@/components/component/services/ServiceCharge";
import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import Tab from "@/components/Tab";
import Spinner from "@/components/ui/Spinner";
import { getDate } from "@/lib/currentDate";
import { formatDate } from "@/lib/formateDate";
import { formattedTime } from "@/lib/timeGenerate";
import { fetchData, updateData } from "@/services/apiService";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import { SuccessHandling } from "@/utils/successHandling";
import { TabLinks } from "@/utils/tablinks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import React, { lazy, Suspense, useEffect, useState } from "react";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const IpdService = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = searchParams.get("regid");

    const [searchTerm, setSearchTerm] = useState(search || "");
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    const [BillDetails, setBillDetails] = useState({
        billing_time: formattedTime(),
        billing_date: getDate(),
    });

    const [Acomodation, setAcomodation] = useState({ items: [], total: 0 });
    const [DoctorCharge, setDoctorCharge] = useState({ items: [], total: 0 });
    const [ServiceCharges, setServiceCharges] = useState({ items: [], total: 0 });
    const [MedicineCharge, setMedicineCharge] = useState({ items: [], total: 0 });

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

    const handleChangeBillDetails = (e) => {
        const { name, value } = e.target;
        setBillDetails((prev) => ({ ...prev, [name]: value }));
    };

    const calculateTotals = () => {
        const total =
            parseFloat(Acomodation.total || 0) +
            parseFloat(DoctorCharge.total || 0) +
            parseFloat(ServiceCharges.total || 0) +
            parseFloat(MedicineCharge.total || 0);
        const netTotal = total - (TotalAmount.amount.discount || 0);
        const due = netTotal - (TotalAmount.amount.paid || 0);

        setTotalAmount((prev) => ({
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
    }, [
        Acomodation,
        DoctorCharge,
        ServiceCharges,
        MedicineCharge,
        TotalAmount?.amount?.discount,
        TotalAmount?.amount?.paid,
    ]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = parseFloat(value) || 0;

        if (name === "paidby") {
            setTotalAmount((prev) => ({
                ...prev,
                paidby: value || "",
            }));
        } else {
            setTotalAmount((prev) => ({
                ...prev,
                amount: {
                    ...prev.amount,
                    [name]: parsedValue,
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
                setMedicineCharge(data?.medicine_cart || { items: [], total: 0 });
                setBillDetails({
                    billing_date: data?.billing_date || getDate(),
                    billing_time: data?.billing_time || formattedTime(),
                });

                // Ensure all amount fields have valid numbers
                setTotalAmount({
                    amount: {
                        total: data?.amount?.total || 0,
                        discount: data?.amount?.discount || 0,
                        netTotal: data?.amount?.netTotal || 0,
                        paid: data?.amount?.paid || 0,
                        due: data?.amount?.due || 0,
                    },
                    paidby: data?.paidby || "",
                });
                calculateTotals();
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

    const mutationUpdateEstimate = useMutation({
        mutationFn: (newItem) => updateData("/billing", searchTerm, newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["ipdestimate", searchTerm] }); // Refetch data after adding
            router.push(`/ipd/estimateprint/${searchTerm}`);
            SuccessHandling(data.message);
        },
        onError: (error) => {
            ErrorHandeling(error);
        },
    });
    const mutationUpdateBilling = useMutation({
        mutationFn: (newItem) => updateData("/billing", searchTerm, newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["ipdbilling", searchTerm] }); // Refetch data after adding
            router.push(`/ipd/billprint/${searchTerm}`);
            SuccessHandling(data.message);
        },
        onError: (error) => {
            ErrorHandeling(error);
        },
    });

    const handleSubmitEstimate = async () => {
        mutationUpdateEstimate.mutate({
            acomodation_cart: Acomodation,
            consultant_cart: DoctorCharge,
            service_cart: ServiceCharges,
            medicine_cart: MedicineCharge,
            amount: TotalAmount.amount,
            paidby: TotalAmount.paidby,
        });
    };

    const handleSubmitBill = async () => {
        mutationUpdateBilling.mutate({
            ...BillDetails,
            ipd: formData?.ipd,
            patient: formData?.patient,
            bill_no: formData?.bill_no,
            acomodation_cart: Acomodation,
            consultant_cart: DoctorCharge,
            service_cart: ServiceCharges,
            medicine_cart: MedicineCharge,
            amount: TotalAmount.amount,
            paidby: TotalAmount.paidby,
            isDone: true,
        });
    };

    return (
        <>
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
                                        Search
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
                                    {formData?.bill_no && (
                                        <div className="space-y-0.5 min-w-[200px]">
                                            <p className="text-xs md:text-sm font-medium text-gray-500">
                                                Bill No.{" "}
                                            </p>
                                            <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                                                {formData?.bill_no}
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

                            {loading && <Loading />}

                            <h1 className="border-b-2 border-black text-lg">Bed Charge</h1>
                            <AcomodationForm
                                Acomodation={Acomodation}
                                setAcomodation={setAcomodation}
                            />
                            <h1 className="border-b-2 border-black text-lg">Doctor Charge</h1>
                            <DoctorForm
                                DoctorCharge={DoctorCharge}
                                setDoctorCharge={setDoctorCharge}
                            />
                            <h1 className="border-b-2 border-black text-lg">
                                Service Charge
                            </h1>
                            <ServiceForm
                                ServiceCharges={ServiceCharges}
                                setServiceCharges={setServiceCharges}
                            />
                            <h1 className="border-b-2 border-black text-lg">
                                Medicine Charge
                            </h1>
                            <MedicineForm
                                MedicineCharge={MedicineCharge}
                                setMedicineCharge={setMedicineCharge}
                            />

                            <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-100">
                                <div className="max-w-md ml-auto space-y-6 ">
                                    <div className="flex justify-between items-center pb-4 border-b">
                                        <span className="text-gray-600 font-medium">Total:</span>
                                        <span className="text-lg font-semibold text-blue-600">
                                            ₹{TotalAmount?.amount?.total}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-600">
                                                Discount
                                            </label>
                                            <input
                                                type="number"
                                                name="discount"
                                                value={TotalAmount.amount.discount}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-600">
                                                Paid Amount
                                            </label>
                                            <input
                                                type="number"
                                                name="paid"
                                                value={TotalAmount.amount.paid}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <span className="text-gray-600 font-medium">
                                            Net Total:
                                        </span>
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

                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-600">
                                            Payment Method
                                        </label>
                                        <select
                                            name="paidby"
                                            value={TotalAmount.paidby}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                                        >
                                            <option value="">Select Payment Method</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Upi">UPI</option>
                                            <option value="Cashless">Cashless</option>
                                            <option value="Sasthyasathi">Sasthyasathi</option>
                                            <option value="Cancel">Cancel</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-600">
                                                Billing Date
                                            </label>
                                            <input
                                                type="date"
                                                name="billing_date"
                                                value={BillDetails.billing_date}
                                                onChange={handleChangeBillDetails}
                                                className="w-full px-4 py-2 border border-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-600">
                                                Billing Time
                                            </label>
                                            <input
                                                type="text"
                                                name="billing_time"
                                                value={BillDetails.billing_time}
                                                onChange={handleChangeBillDetails}
                                                className="w-full px-4 py-2 border border-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex w-full justify-between flex-wrap lg:flex-nowrap ">
                                        <button
                                            onClick={handleSubmitBill}
                                            className="btn btn-warning "
                                        >
                                            Save & Generate Bill{" "}
                                            {mutationUpdateBilling.isPending && <Spinner />}
                                        </button>
                                        <button
                                            onClick={handleSubmitEstimate}
                                            className="btn btn-primary "
                                        >
                                            Submit & Get Estimate{" "}
                                            {mutationUpdateEstimate.isPending && <Spinner />}
                                        </button>
                                    </div>
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

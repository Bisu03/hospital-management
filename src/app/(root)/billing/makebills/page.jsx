"use client";

import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import { fetchData } from "@/services/apiService";
import { withAuth } from "@/services/withAuth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { lazy, Suspense, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const MakeBills = () => {
    const { data: services, error, isLoading } = useQuery({
        queryKey: ["servicerecord"],
        queryFn: () => fetchData("/admin/service"),
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [serviceCart, setServiceCart] = useState({
        services: [],
        totalAmount: 0
    });
    const [formData, setFormData] = useState({});
    const [quantities, setQuantities] = useState({});
    const [BillNo, setBillNo] = useState()

    const filteredServices = (services?.data || [])?.filter(service =>
        service?.servicename?.toLowerCase()?.includes(searchQuery.toLowerCase())
    );

    const handleQuantityChange = (serviceId, value) => {
        const numericValue = value === "" ? 1 : Math.max(1, parseInt(value) || 1);
        setQuantities(prev => ({
            ...prev,
            [serviceId]: value === "" ? "" : numericValue
        }));
    };

    const calculateTotal = (services) => {
        return services.reduce((sum, item) => sum + (item.unitcharge * item.quantity), 0);
    };

    const addToCart = (service) => {
        const inputValue = quantities[service._id] || "";
        const quantity = inputValue === "" ? 1 : Math.max(1, parseInt(inputValue) || 1);

        setServiceCart(prev => {
            const existingIndex = prev.services.findIndex(item => item._id === service._id);
            let newServices = [...prev.services];

            if (existingIndex !== -1) {
                newServices[existingIndex] = {
                    ...newServices[existingIndex],
                    quantity: newServices[existingIndex].quantity + quantity
                };
            } else {
                newServices.push({ ...service, quantity });
            }

            return {
                services: newServices,
                totalAmount: calculateTotal(newServices)
            };
        });
        setQuantities(prev => ({ ...prev, [service._id]: "" }));
    };

    const removeFromCart = (serviceId) => {
        setServiceCart(prev => {
            const newServices = prev.services.filter(item => item._id !== serviceId);
            return {
                services: newServices,
                totalAmount: calculateTotal(newServices)
            };
        });
    };

    const updateQuantity = (serviceId, newValue) => {
        const newQuantity = Math.max(1, parseInt(newValue) || 1);

        setServiceCart(prev => {
            const newServices = prev.services.map(item =>
                item._id === serviceId ? { ...item, quantity: newQuantity } : item
            );
            return {
                services: newServices,
                totalAmount: calculateTotal(newServices)
            };
        });
    };

    const handleGetpatientinfor = async () => {
        const { data } = await axios.get(`/api/v1/billing/${BillNo}`)
        setFormData(data?.data)
    }

    const handleGenerateBill = () => {
        toast.error("Working under process")
    }

    if (isLoading) return <Loading />;
    if (error) return <div>Error loading services</div>;

    return (
        <Suspense fallback={<Loading />}>
            <div className="flex flex-wrap w-full justify-between">
                <MiddleSection>
                    <div className="w-full">
                        <Heading heading="Billing" >
                            <div className="flex items-center space-x-2">
                                <input
                                    className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    type="text"
                                    name="BillNo"
                                    value={BillNo}
                                    onChange={(e) => setBillNo(e.target.value)}
                                    placeholder="Enter Bill No."
                                />
                                <button onClick={handleGetpatientinfor} className="btn btn-secondary"> Get </button>
                            </div>
                        </Heading>
                    </div>

                    <div className="w-full bg-gray-100 p-2 md:p-4 rounded-lg shadow-sm mb-4">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 truncate">
                            {formData?.patient?.fullname || "No Patient Selected"}
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

                            {formData?.bill_no && (
                                <div className="space-y-0.5 min-w-[200px]">
                                    <p className="text-xs md:text-sm font-medium text-gray-500">Bill No.</p>
                                    <p className="text-gray-700 text-sm md:text-base truncate">
                                        {formData.bill_no}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 flex flex-col lg:flex-row gap-6">
                        {/* Wider Service List Section */}
                        <div className="flex-[2]">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    className="w-full p-2 border rounded"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                {filteredServices.map(service => (
                                    <div key={service._id} className="flex items-center justify-between p-2 border rounded">
                                        <div className="flex-1 min-w-[60%]">
                                            <h3 className="font-semibold truncate">{service.servicename}</h3>
                                            <p className="text-sm text-gray-500">
                                                ₹{service.unitcharge}/{service.unittype}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-20 p-1 border rounded"
                                                placeholder="Qty"
                                                value={quantities[service._id] ?? ""}
                                                onChange={(e) =>
                                                    handleQuantityChange(service._id, e.target.value)
                                                }
                                            />
                                            <button
                                                onClick={() => addToCart(service)}
                                                className="px-4 py-1.5 bg-primary text-white rounded hover:bg-secondary"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cart Section */}
                        <div className="flex-1 max-w-[600px] bg-gray-50 p-2 rounded-lg">
                            <h2 className="text-xl font-semibold mb-4">Service Cart</h2>
                            {serviceCart.services.length === 0 ? (
                                <p className="text-gray-500">No services added</p>
                            ) : (
                                <>
                                    <div className="space-y-2 mb-4">
                                        {serviceCart.services.map(item => (
                                            <div key={item._id} className="flex justify-between items-center  bg-white rounded">
                                                <div className="flex-1">
                                                    <h3 className="font-medium truncate">{item.servicename}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        ₹{item.unitcharge} x {item.quantity} {item.unittype}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item._id, e.target.value)}
                                                        className="w-16 p-1 border rounded"
                                                    />
                                                    <button
                                                        onClick={() => removeFromCart(item._id)}
                                                        className="text-red-500 hover:text-red-700 text-xl"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total:</span>
                                            <span>₹{serviceCart.totalAmount.toFixed(2)}</span>
                                        </div>
                                        <button onClick={handleGenerateBill} className="w-full mt-4 bg-green-500 text-white py-2 rounded hover:bg-green-600">
                                            Generate Bill
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </MiddleSection>
            </div>
        </Suspense>
    );
};

export default withAuth(MakeBills);
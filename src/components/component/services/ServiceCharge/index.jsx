import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BiSolidPlusSquare } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import Select from "react-select";
import { fetchData } from "@/services/apiService";
import { generateUnique } from "@/lib/uniqueNumber";

const ServiceForm = ({ ServiceCharges, setServiceCharges }) => {
    const [Services, setServices] = useState({
        u_ID: generateUnique(),
        category_name: "",
        servicename: "",
        unitcharge: "0",
        unit: "1",
        unittype: "pcs",
    });

    const categoryRef = useRef(null);
    const serviceRef = useRef(null);
    const unitRef = useRef(null);

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && e.key === '3') {
                e.preventDefault();
                categoryRef.current.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const { data: servicerecord } = useQuery({
        queryKey: ["servicerecord"],
        queryFn: () => fetchData("/admin/service"),
    });

    // Category options
    const categoryOptions = [...new Set(servicerecord?.data?.map(s => s.categoryid?.category_name))]
        .filter(Boolean)
        .map(category => ({
            value: category,
            label: category
        }));

    // Service options
    const serviceOptions = servicerecord?.data
        ?.filter(s => s.categoryid?.category_name === Services.category_name)
        .map(service => ({
            value: service.servicename,
            label: service.servicename,
            data: service
        })) || [];

    const handleCategoryChange = (selectedOption) => {
        setServices({
            ...Services,
            category_name: selectedOption?.value || "",
            servicename: "",
            unitcharge: "0",
            unit: "1",
            unittype: "pcs",
        });
        serviceRef.current.focus();
    };

    const handleServiceChange = (selectedOption) => {
        if (selectedOption) {
            setServices({
                ...Services,
                servicename: selectedOption.value,
                unitcharge: String(selectedOption.data.unitcharge || "0"),
                unittype: selectedOption.data.unittype || "pcs"
            });
        }
        unitRef.current.focus();
    };

    const handleInputChange = (e) => {
        setServices({ ...Services, [e.target.name]: e.target.value });
    };


    const handleAddItem = () => {
        if (!Services.category_name || !Services.servicename || !Services.unitcharge || !Services.unit) return;

        const newService = {
            itemID: Services.u_ID,
            category_name: Services.category_name,
            servicename: Services.servicename,
            unitcharge: parseInt(Services.unitcharge) || 0,
            unit: parseInt(Services.unit) || 1,
            unittype: Services.unittype,
        };

        setServiceCharges((prev) => ({
            total: (prev?.total || 0) + newService.unitcharge * newService.unit,
            items: [...(prev?.items || []), newService],
        }));

        setServices({
            u_ID: generateUnique(),
            category_name: "",
            servicename: "",
            unitcharge: "0",
            unit: "1",
            unittype: "pcs",
        });
    };

    const handleEditItem = (index, field, value) => {
        setServiceCharges((prev) => {
            const updatedItems = prev.items.map((item, i) =>
                i === index ? { ...item, [field]: parseInt(value) || 0 } : item
            );
            const total = updatedItems.reduce((sum, item) => sum + item.unitcharge * item.unit, 0);
            return { total, items: updatedItems };
        });
    };

    const handleRemoveItem = (itemID) => {
        setServiceCharges((prev) => {
            const updatedItems = prev.items.filter((item) => item.itemID !== itemID);
            const total = updatedItems.reduce((sum, item) => sum + item.unitcharge * item.unit, 0);
            return { total, items: updatedItems };
        });
    };

    return (
        <div className="p-4">
            <div className="overflow-x-auto mt-4">
                <table className="table-auto w-full border-collapse border text-lg">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border p-2">Service Category</th>
                            <th className="border p-2">Service Name</th>
                            <th className="border p-2">Charge</th>
                            <th className="border p-2">Unit</th>
                            <th className="border p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ServiceCharges?.items?.map((data, index) => (
                            <tr key={index} className="bg-gray-100 text-center">
                                <td className="border p-2">{data.category_name}</td>
                                <td className="border p-2">{data.servicename}</td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        value={data.unitcharge}
                                        onChange={(e) => handleEditItem(index, "unitcharge", e.target.value)}
                                        className="w-16 p-1 border rounded"
                                    />
                                </td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        value={data.unit}
                                        onChange={(e) => handleEditItem(index, "unit", e.target.value)}
                                        className="w-16 p-1 border rounded"
                                    />
                                </td>
                                <td className="border p-2 text-center">
                                    <MdDelete
                                        onClick={() => handleRemoveItem(data.itemID)}
                                        className="text-red-500 text-xl cursor-pointer"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap gap-4 my-4">
                <div className="w-full max-w-sm">
                    <Select
                        ref={categoryRef}
                        options={categoryOptions}
                        value={categoryOptions.find(opt => opt.value === Services.category_name)}
                        onChange={handleCategoryChange}
                        placeholder="Search category..."
                        isSearchable
                        className="react-select-container"
                        classNamePrefix="react-select"
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                            control: (base) => ({
                                ...base,
                                minHeight: '44px',
                                borderRadius: '6px'
                            })
                        }}
                    />
                </div>

                <div className="w-full max-w-sm">
                    <Select
                        ref={serviceRef}
                        options={serviceOptions}
                        value={serviceOptions.find(opt => opt.value === Services.servicename)}
                        onChange={handleServiceChange}
                        placeholder="Search service..."
                        isSearchable
                        isDisabled={!Services.category_name}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                            control: (base) => ({
                                ...base,
                                minHeight: '44px',
                                borderRadius: '6px'
                            })
                        }}
                    />
                </div>

                <input
                    ref={unitRef}
                    type="number"
                    name="unit"
                    value={Services.unit}
                    onChange={handleInputChange}
                    placeholder="Units"
                    className="p-2 border rounded focus:ring-2 focus:ring-blue-500 w-full max-w-[200px]"
                    min="1"
                />
            </div>

            <div className="flex w-full justify-between">
                <button className="btn btn-primary flex items-center gap-2" onClick={handleAddItem}>
                    <BiSolidPlusSquare className="text-xl" /> Add
                </button>
                <div className="text-xl font-semibold mt-4">Total: ₹{ServiceCharges?.total || 0}</div>
            </div>
        </div>
    );
};

export default ServiceForm;

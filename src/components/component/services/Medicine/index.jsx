import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BiSolidPlusSquare } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { fetchData } from "@/services/apiService";
import { generateUnique } from "@/lib/uniqueNumber";

const MedicineForm = ({ MedicineCharge, setMedicineCharge }) => {
    const [medicineDetails, setMedicineDetails] = useState({
        u_ID: generateUnique(),
        name: "",
        mrp: "",
        unit_type: "",
        quantity: 1,
    });

    const { data: medicines, isLoading, error } = useQuery({
        queryKey: ["medicines"],
        queryFn: () => fetchData("/admin/medicine"),
    });

    const handleMedicineChange = (e) => {
        const selectedMedicine = medicines?.data?.find(
            med => med.name === e.target.value
        );

        if (selectedMedicine) {
            setMedicineDetails({
                ...medicineDetails,
                name: selectedMedicine.name || "",
                mrp: String(selectedMedicine.mrp || "0"),
                unit_type: selectedMedicine.unit_type || "",
                quantity: 1
            });
        }
    };

    const handleInputChange = (e) => {
        setMedicineDetails({ ...medicineDetails, [e.target.name]: e.target.value });
    };

    const handleAddItem = () => {
        if (!medicineDetails.name || !medicineDetails.mrp || !medicineDetails.quantity) return;

        const newMedicine = {
            itemID: medicineDetails.u_ID,
            name: medicineDetails.name,
            mrp: parseFloat(medicineDetails.mrp) || 0,
            quantity: parseInt(medicineDetails.quantity) || 1,
            unit_type: medicineDetails.unit_type,
        };

        setMedicineCharge((prev) => ({
            total: (prev?.total || 0) + (newMedicine.mrp * newMedicine.quantity),
            items: [...(prev?.items || []), newMedicine],
        }));

        setMedicineDetails({
            u_ID: generateUnique(),
            name: "",
            mrp: "",
            unit_type: "",
            quantity: 1,
        });
    };

    const handleEditItem = (index, field, value) => {
        setMedicineCharge((prev) => {
            const updatedItems = prev.items.map((item, i) =>
                i === index ? { ...item, [field]: parseFloat(value) || 0 } : item
            );
            const total = updatedItems.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
            return { total, items: updatedItems };
        });
    };

    const handleRemoveItem = (itemID) => {
        setMedicineCharge((prev) => {
            const updatedItems = prev.items.filter((item) => item.itemID !== itemID);
            const total = updatedItems.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
            return { total, items: updatedItems };
        });
    };

    return (
        <div className="p-4">
            <div className="overflow-x-auto mt-4">
                <table className="table-auto w-full border-collapse border text-lg">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border p-2">Medicine Name</th>
                            <th className="border p-2">MRP</th>
                            <th className="border p-2">Quantity</th>
                            <th className="border p-2">Total</th>
                            <th className="border p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MedicineCharge?.items?.map((data, index) => (
                            <tr key={index} className="bg-gray-100 text-center">
                                <td className="border p-2">{data.name}</td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        value={data.mrp}
                                        onChange={(e) => handleEditItem(index, "mrp", e.target.value)}
                                        className="w-24 p-1 border rounded"
                                    />
                                </td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        value={data.quantity}
                                        onChange={(e) => handleEditItem(index, "quantity", e.target.value)}
                                        className="w-16 p-1 border rounded"
                                    />
                                </td>
                                <td className="border p-2">₹{(data.mrp * data.quantity).toFixed(2)}</td>
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
                <select
                    name="name"
                    value={medicineDetails.name}
                    onChange={handleMedicineChange}
                    className="select select-bordered w-full max-w-sm"
                >
                    <option value="">Select Medicine</option>
                    {medicines?.data?.map((medicine, index) => (
                        <option key={index} value={medicine.name}>
                            {medicine.name} (₹{medicine.mrp}/{medicine.unit_type})
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    name="mrp"
                    placeholder="MRP"
                    value={medicineDetails.mrp}
                    onChange={handleInputChange}
                    className="input input-bordered w-full max-w-sm"
                    disabled
                />

                <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    value={medicineDetails.quantity}
                    onChange={handleInputChange}
                    className="input input-bordered w-full max-w-sm"
                    min="1"
                />

                <input
                    type="text"
                    name="unit_type"
                    placeholder="Unit Type"
                    value={medicineDetails.unit_type}
                    onChange={handleInputChange}
                    className="input input-bordered w-full max-w-sm"
                    disabled
                />
            </div>

            <div className="flex w-full justify-between">
                <button className="btn btn-primary flex items-center gap-2" onClick={handleAddItem}>
                    <BiSolidPlusSquare className="text-xl" /> Add
                </button>
                <div className="text-xl font-semibold mt-4">
                    Grand Total: ₹{MedicineCharge?.total?.toFixed(2) || 0}
                </div>
            </div>
        </div>
    );
};

export default MedicineForm;
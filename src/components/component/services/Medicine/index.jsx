import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BiSolidPlusSquare } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import Select from "react-select";
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

    const medicineSelectRef = useRef(null);

    // Keyboard shortcut handler (Alt+4)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && e.key === '4') {
                e.preventDefault();
                if (medicineSelectRef.current) {
                    medicineSelectRef.current.focus();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const { data: medicines, isLoading, error } = useQuery({
        queryKey: ["medicines"],
        queryFn: () => fetchData("/admin/medicine"),
    });

    // Format medicine options for react-select
    const medicineOptions = React.useMemo(() => {
        if (!medicines?.data) return [];
        return medicines.data.map(medicine => ({
            value: medicine.name,
            label: `${medicine.name} (₹${medicine.mrp})`,
            data: medicine
        }));
    }, [medicines]);

    const handleMedicineChange = (selectedOption) => {
        if (selectedOption) {
            const med = selectedOption.data;
            setMedicineDetails({
                ...medicineDetails,
                name: med.name,
                mrp: String(med.mrp || "0"),
                unit_type: med.unit_type || "",
                quantity: 1
            });
        }
    };

    const handleInputChange = (e) => {
        setMedicineDetails({
            ...medicineDetails,
            [e.target.name]: e.target.value
        });
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
                i === index ? { 
                    ...item, 
                    [field]: field === 'quantity' ? parseInt(value) || 1 : parseFloat(value) || 0 
                } : item
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
                                        step="0.01"
                                    />
                                </td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        value={data.quantity}
                                        onChange={(e) => handleEditItem(index, "quantity", e.target.value)}
                                        className="w-16 p-1 border rounded"
                                        min="1"
                                    />
                                </td>
                                <td className="border p-2">₹{(data.mrp * data.quantity).toFixed(2)}</td>
                                <td className="border p-2 text-center">
                                    <MdDelete
                                        onClick={() => handleRemoveItem(data.itemID)}
                                        className="text-red-500 text-xl cursor-pointer hover:text-red-700"
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
                        ref={medicineSelectRef}
                        options={medicineOptions}
                        value={medicineOptions.find(opt => opt.value === medicineDetails.name)}
                        onChange={handleMedicineChange}
                        placeholder="Search medicine..."
                        isSearchable
                        isClearable
                        isLoading={isLoading}
                        loadingMessage={() => "Loading medicines..."}
                        noOptionsMessage={() => "No medicines found"}
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
                    type="number"
                    name="mrp"
                    placeholder="MRP"
                    value={medicineDetails.mrp}
                    onChange={handleInputChange}
                    className="input input-bordered w-full max-w-sm bg-gray-100"
                    disabled
                    step="0.01"
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
                    className="input input-bordered w-full max-w-sm bg-gray-100"
                    disabled
                />
            </div>

            <div className="flex w-full justify-between">
                <button 
                    className="btn btn-primary flex items-center gap-2 hover:bg-blue-600 transition-colors"
                    onClick={handleAddItem}
                >
                    <BiSolidPlusSquare className="text-xl" />
                    Add Medicine
                </button>
                <div className="text-xl font-semibold mt-4">
                    Grand Total: ₹{MedicineCharge?.total?.toFixed(2) || 0.00}
                </div>
            </div>
        </div>
    );
};

export default MedicineForm;
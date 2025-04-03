import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BiSolidPlusSquare } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import Select from "react-select";
import { fetchData } from "@/services/apiService";
import { generateUnique } from "@/lib/uniqueNumber";

const MedicineForm = forwardRef(({ MedicineCharge, setMedicineCharge }, ref) => {
    const medicineSelectRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => {
            medicineSelectRef.current?.focus();
        }
    }));

    const [medicineDetails, setMedicineDetails] = useState({
        u_ID: generateUnique(),
        name: "",
        mrp: "",
        unit_type: "",
        quantity: 1,
    });

    const quantityRef = useRef(null);

    // Keyboard shortcuts (Alt+4 for select, Alt+5 for quantity)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey) {
                e.preventDefault();
                if (e.key === '4') medicineSelectRef.current?.focus();
                if (e.key === '5') quantityRef.current?.focus();
            }
           
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [medicineDetails]);

    const { data: medicines } = useQuery({
        queryKey: ["medicines"],
        queryFn: () => fetchData("/admin/medicine"),
    });

    const medicineOptions = medicines?.data?.map(medicine => ({
        value: medicine.name,
        label: `${medicine.name} (₹${medicine.mrp}) - ${medicine.unit_type}`,
        data: medicine
    })) || [];

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
            quantityRef.current?.focus();
        }
    };

    const handleInputChange = (e) => {
        setMedicineDetails({
            ...medicineDetails,
            [e.target.name]: e.target.value
        });
    };

    const handleAddItem = () => {
        if (!medicineDetails.name || medicineDetails.quantity < 1) return;

        const newMedicine = {
            itemID: medicineDetails.u_ID,
            name: medicineDetails.name,
            mrp: parseFloat(medicineDetails.mrp) || 0,
            quantity: parseInt(medicineDetails.quantity) || 1,
            unit_type: medicineDetails.unit_type,
        };

        setMedicineCharge(prev => ({
            total: (prev?.total || 0) + (newMedicine.mrp * newMedicine.quantity),
            items: [...(prev?.items || []), newMedicine],
        }));

        // Reset form and focus
        setMedicineDetails({
            u_ID: generateUnique(),
            name: "",
            mrp: "",
            unit_type: "",
            quantity: 1,
        });
        medicineSelectRef.current?.focus();
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
        <div >
            <div className="overflow-x-auto mt-4">
                <table className="table-auto w-full border-collapse">
                    <thead className="bg-gray-300">
                        <tr>
                            <th className="p-3 text-left">Medicine</th>
                            <th className="p-3 text-center">MRP</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3 text-center">Total</th>
                            <th className="p-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MedicineCharge?.items?.map((data, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="p-3 border-t">{data.name}</td>
                                <td className="p-3 border-t text-center">
                                    <input
                                        type="number"
                                        value={data.mrp}
                                        onChange={(e) => handleEditItem(index, "mrp", e.target.value)}
                                        className="w-24 px-2 py-1 border rounded text-center"
                                        step="0.01"
                                    />
                                </td>
                                <td className="p-3 border-t text-center">
                                    <input
                                        type="number"
                                        value={data.quantity}
                                        onChange={(e) => handleEditItem(index, "quantity", e.target.value)}
                                        className="w-16 px-2 py-1 border rounded text-center"
                                        min="1"
                                    />
                                </td>
                                <td className="p-3 border-t text-center">
                                    ₹{(data.mrp * data.quantity).toFixed(2)}
                                </td>
                                <td className="p-3 border-t text-center">
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

            <div className="mt-6 flex gap-4 items-start">
                <div className="flex-1">
                    <Select
                        ref={medicineSelectRef}
                        options={medicineOptions}
                        value={medicineOptions.find(opt => opt.value === medicineDetails.name)}
                        onChange={handleMedicineChange}
                        placeholder="Select Medicine (Alt+4)"
                        isSearchable
                        classNamePrefix="react-select"
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                            control: (base) => ({
                                ...base,
                                minHeight: '38px',
                                borderRadius: '6px'
                            })
                        }}
                    />
                </div>

                <input
                    type="number"
                    name="mrp"
                    value={medicineDetails.mrp}
                    className="p-2 border rounded bg-gray-100 w-32"
                    disabled
                    step="0.01"
                />

                <input
                    ref={quantityRef}
                    type="number"
                    name="quantity"
                    value={medicineDetails.quantity}
                    onChange={handleInputChange}
                    placeholder="Qty (Alt+5)"
                    className="p-2 border rounded focus:ring-2 focus:ring-blue-500 w-32"
                    min="1"
                />

                <input
                    type="text"
                    name="unit_type"
                    value={medicineDetails.unit_type}
                    className="p-2 border rounded bg-gray-100 w-32"
                    disabled
                />

                <button
                    onClick={handleAddItem}
                    className="btn btn-primary h-[38px]"
                >
                    <BiSolidPlusSquare className="text-xl" />
                    Add
                </button>
            </div>

            <div className="mt-4 text-right text-lg font-semibold">
                Grand Total: ₹{(MedicineCharge?.total || 0).toFixed(2)}
            </div>
        </div>
    );
});

export default MedicineForm;
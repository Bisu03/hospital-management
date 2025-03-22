import React, { useState, useEffect, useCallback, useRef } from "react";
import { BiSolidPlusSquare } from "react-icons/bi";
import { MdDeleteForever } from "react-icons/md";
import Select from 'react-select';
import { fetchData } from "@/services/apiService";
import { isEqual } from "lodash";
import { useQuery } from "@tanstack/react-query";

const AcomodationForm = ({ Acomodation, setAcomodation }) => {
    const [localAccommodation, setLocalAccommodation] = useState({
        items: [],
        total: 0
    });

    const selectRefs = useRef([]);

    // Sync state
    useEffect(() => {
        if (!isEqual(Acomodation, localAccommodation)) {
            setLocalAccommodation(Acomodation);
        }
    }, [Acomodation]);

    // Sync with parent
    useEffect(() => {
        if (!isEqual(Acomodation, localAccommodation)) {
            setAcomodation(localAccommodation);
        }
    }, [localAccommodation]);

    // Fetch bed data
    const { data: bedrecord = [] } = useQuery({
        queryKey: ["bedrecord"],
        queryFn: () =>
            fetchData("/bed/bed")
                .then((res) => res.data || [])
                .catch(() => []),
        initialData: [],
        retry: 1,
        retryOnMount: false
    });

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && e.key === '1' && selectRefs.current.length > 0) {
                e.preventDefault();
                const firstSelect = selectRefs.current[0];
                if (firstSelect) {
                    firstSelect.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const bedCategories = React.useMemo(
        () => [...new Set(bedrecord?.map((bed) => bed?.bed_category?.bed_category).filter(Boolean))],
        [bedrecord]
    );

    const handleChange = (e, index) => {
        const { name, value } = e.target;
        const items = [...localAccommodation.items];

        if (name === "bed_category") {
            items[index] = {
                ...items[index],
                bed_category: value,
                bed_number: "",
                bed_charge: ""
            };
        } else {
            items[index][name] = value;
        }

        updateTotals(items);
    };

    const handleBedChange = (selectedOption, index) => {
        const items = [...localAccommodation.items];
        if (selectedOption) {
            items[index] = {
                ...items[index],
                bed_number: selectedOption.value,
                bed_charge: selectedOption.data.bed_charge
            };
        } else {
            items[index] = {
                ...items[index],
                bed_number: "",
                bed_charge: ""
            };
        }
        updateTotals(items);
    };

    const updateTotals = (items) => {
        const updatedItems = items.map(item => {
            const bedCharge = parseFloat(item.bed_charge) || 0;
            const numDays = parseFloat(item.number_days) || 0;
            return { ...item, total: (bedCharge * numDays).toFixed(2) };
        });

        const grandTotal = updatedItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

        setLocalAccommodation({
            items: updatedItems,
            total: Number(grandTotal.toFixed(2))
        });
    };

    const handleAddItem = () => {
        setLocalAccommodation((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    bed_category: "",
                    bed_number: "",
                    bed_charge: "",
                    number_days: "",
                    total: 0
                }
            ]
        }));
    };

    const handleRemoveItem = (index) => {
        const newItems = localAccommodation.items.filter((_, i) => i !== index);
        updateTotals(newItems);
    };

    const getBedOptions = (index) => {
        return bedrecord
            .filter(bed => 
                bed.bed_category?.bed_category === localAccommodation.items[index].bed_category &&
                !bed.isAllocated
            )
            .map(bed => ({
                value: bed.bed_number,
                label: `${bed.bed_number} (₹${bed.bed_charge}/day)`,
                data: bed
            }));
    };

    return (
        <div className="space-y-4">
            <ol className="space-y-4">
                {localAccommodation.items.map((item, index) => {
                    const bedOptions = getBedOptions(index);
                    const selectedBed = bedOptions.find(opt => opt.value === item.bed_number);

                    return (
                        <li key={index} className="border-2 border-gray-200 p-4 rounded-lg">
                            <div className="flex flex-col md:flex-row flex-wrap gap-4 items-end mb-4">
                                {/* Bed Category */}
                                <div className="flex-1 w-full md:min-w-[200px]">
                                    <label className="block text-sm font-medium mb-2">Bed Category</label>
                                    <select
                                        className="select select-bordered w-full"
                                        name="bed_category"
                                        value={item.bed_category}
                                        onChange={(e) => handleChange(e, index)}
                                    >
                                        <option value="">Select Category</option>
                                        {bedCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Bed Number */}
                                <div className="flex-1 w-full md:min-w-[250px]">
                                    <label className="block text-sm font-medium mb-2">Bed Number</label>
                                    <Select
                                        ref={(el) => (selectRefs.current[index] = el)}
                                        options={bedOptions}
                                        value={selectedBed}
                                        onChange={(selected) => handleBedChange(selected, index)}
                                        isSearchable
                                        isClearable
                                        placeholder="Search or select bed..."
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    />
                                </div>

                                {/* Bed Charge */}
                                <div className="flex-1 w-full md:min-w-[150px]">
                                    <label className="block text-sm font-medium mb-2">Daily Charge</label>
                                    <input
                                        className="input input-bordered w-full bg-gray-100"
                                        type="number"
                                        value={item.bed_charge}
                                        readOnly
                                    />
                                </div>

                                {/* Number of Days */}
                                <div className="flex-1 w-full md:min-w-[150px]">
                                    <label className="block text-sm font-medium mb-2">Days</label>
                                    <input
                                        className="input input-bordered w-full"
                                        type="number"
                                        name="number_days"
                                        value={item.number_days}
                                        onChange={(e) => handleChange(e, index)}
                                        min="1"
                                    />
                                </div>

                                {/* Remove Button */}
                                <button 
                                    onClick={() => handleRemoveItem(index)} 
                                    className="btn btn-error w-full md:w-auto"
                                >
                                    <MdDeleteForever className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Item Total */}
                            <div className="mt-4 text-right font-semibold">Bed Total: ₹{item.total || 0}</div>
                        </li>
                    )}
                )}
            </ol>

            {/* Add Button and Grand Total */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <button 
                    onClick={handleAddItem} 
                    className="btn btn-primary w-full md:w-auto"
                >
                    <BiSolidPlusSquare className="w-5 h-5 mr-2" />
                    Add
                </button>

                <div className="w-full md:max-w-[300px]">
                    <label className="block text-sm font-medium mb-2">Grand Total</label>
                    <input
                        className="input input-bordered w-full font-bold text-lg"
                        type="number"
                        value={localAccommodation.total.toFixed(2)}
                        readOnly
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(AcomodationForm);
import React, { useState, useEffect } from 'react';
import { BiSolidPlusSquare } from 'react-icons/bi';
import { MdDeleteForever } from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '@/services/apiService';
import { isEqual } from 'lodash';

const AcomodationForm = ({ Acomodation, setAcomodation }) => {
    const [localAccommodation, setLocalAccommodation] = useState({
        items: [],
        total: 0
    });

    // Initialize with nested bed category data
    useEffect(() => {
        if (!isEqual(Acomodation.items, localAccommodation.items)) {
            setLocalAccommodation({
                items: Acomodation.items.map(item => ({
                    ...item,
                    bed_category: item.bed_category || "", // Extract category name
                    bed_charge: item.bed_charge || "",
                    number_days: item.number_days || ""
                })),
                total: Acomodation.total || 0
            });
        }
    }, [Acomodation]);

    // Sync with parent state
    useEffect(() => {
        if (!isEqual(localAccommodation, Acomodation)) {
            setAcomodation(localAccommodation);
        }
    }, [localAccommodation]);

    const { data: bedrecord } = useQuery({
        queryKey: ["bedrecord"],
        queryFn: () => fetchData("/bed/bed").then((res) => res.data),
        retry: 1,
        retryOnMount: false,
    });

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
        } else if (name === "bed_number") {
            const selectedBed = bedrecord?.find(bed => 
                bed.bed_number === value && 
                bed.bed_category?.bed_category === items[index].bed_category
            );
            
            items[index] = {
                ...items[index],
                bed_number: value,
                bed_charge: selectedBed?.bed_charge || ""
            };
        } else {
            items[index][name] = value;
        }

        // Calculate item total
        items[index].total = (
            parseFloat(items[index].bed_charge || 0) * 
            parseFloat(items[index].number_days || 0)
        ).toFixed(2);

        // Calculate grand total
        const grandTotal = items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
        
        setLocalAccommodation({
            items: items,
            total: grandTotal
        });
    };

    const handleAddItem = () => {
        setLocalAccommodation(prev => ({
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
        const grandTotal = newItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
        
        setLocalAccommodation({
            items: newItems,
            total: grandTotal
        });
    };

    // Get unique bed categories from nested structure
    const bedCategories = [...new Set(
        bedrecord?.map(bed => bed.bed_category?.bed_category).filter(Boolean)
    )];

    return (
        <div className="space-y-4">
            <ol className="space-y-4">
                {localAccommodation.items.map((item, index) => (
                    <li key={index} className='border-2 border-gray-200 p-4 rounded-lg'>
                        <div className="flex flex-wrap gap-4 items-end mb-4">
                            {/* Bed Category */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium mb-2">
                                    Bed Category
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    name="bed_category"
                                    value={item.bed_category}
                                    onChange={(e) => handleChange(e, index)}
                                >
                                    <option value="">Select Category</option>
                                    {bedCategories?.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Bed Number */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium mb-2">
                                    Bed Number
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    name="bed_number"
                                    value={item.bed_number}
                                    onChange={(e) => handleChange(e, index)}
                                    disabled={!item.bed_category}
                                >
                                    <option value="">Select Bed</option>
                                    {bedrecord
                                        ?.filter(bed => 
                                            bed.bed_category?.bed_category === item.bed_category &&
                                            !bed.isAllocated
                                        )
                                        .map((bed) => (
                                            <option key={bed._id} value={bed.bed_number}>
                                                {bed.bed_number} (₹{bed.bed_charge}/day)
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Bed Charge */}
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-sm font-medium mb-2">
                                    Daily Charge
                                </label>
                                <input
                                    className="input input-bordered w-full bg-gray-100"
                                    type="number"
                                    value={item.bed_charge}
                                    readOnly
                                />
                            </div>

                            {/* Number of Days */}
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-sm font-medium mb-2">
                                    Number of Days
                                </label>
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
                                className="btn btn-error min-w-[50px]"
                            >
                                <MdDeleteForever className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Item Total */}
                        <div className="mt-4 text-right font-semibold">
                            Bed Total: ₹{item.total || 0}
                        </div>
                    </li>
                ))}
            </ol>

            {/* Add Button and Grand Total */}
            <div className='flex flex-wrap gap-4 justify-between items-center'>
                <button 
                    onClick={handleAddItem} 
                    className="btn btn-primary"
                >
                    <BiSolidPlusSquare className="w-5 h-5 mr-2" />
                    Add Bed
                </button>
                
                <div className="flex-1 max-w-[300px]">
                    <label className="block text-sm font-medium mb-2">
                        Grand Total
                    </label>
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

export default AcomodationForm;
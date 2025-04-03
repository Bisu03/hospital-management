import React, { useState, useEffect, useRef, useMemo } from "react";
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

    const [formInput, setFormInput] = useState({
        bedCategory: '',
        bedNumber: '',
        bedCharge: '',
        days: 1
    });

    const categoryRef = useRef(null);
    const daysRef = useRef(null);

    // Sync state with parent
    useEffect(() => {
        if (!isEqual(Acomodation, localAccommodation)) {
            setLocalAccommodation(Acomodation);
        }
    }, [Acomodation]);

    useEffect(() => {
        if (!isEqual(Acomodation, localAccommodation)) {
            setAcomodation(localAccommodation);
        }
    }, [localAccommodation]);

    // Fetch bed data
    const { data: bedrecord = [] } = useQuery({
        queryKey: ["bedrecord"],
        queryFn: () => fetchData("/bed/bed").then((res) => res.data || []),
    });

    // Keyboard shortcut handler (Alt+1)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                categoryRef.current.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Get available bed categories
    const bedCategories = useMemo(() =>
        [...new Set(bedrecord.map(b => b.bed_category?.bed_category).filter(Boolean))],
        [bedrecord]
    );

    // Get available beds for selected category
    const availableBeds = useMemo(() =>
        bedrecord.filter(bed =>
            bed.bed_category?.bed_category === formInput.bedCategory &&
            !bed.isAllocated
        ),
        [bedrecord, formInput.bedCategory]
    );

    // Category options for react-select
    const categoryOptions = useMemo(() =>
        bedCategories.map(category => ({
            value: category,
            label: category
        })),
        [bedCategories]
    );

    // Bed number options for react-select
    const bedNumberOptions = useMemo(() =>
        availableBeds.map(bed => ({
            value: bed.bed_number,
            label: bed.bed_number,
            data: bed
        })),
        [availableBeds]
    );

    const handleCategoryChange = (selectedOption) => {
        const category = selectedOption?.value || '';
        setFormInput({
            bedCategory: category,
            bedNumber: '',
            bedCharge: '',
            days: 1
        });
    };

    const handleBedNumberChange = (selectedOption) => {
        const bedNumber = selectedOption?.value || '';
        const selectedBed = availableBeds.find(b => b.bed_number === bedNumber);

        setFormInput(prev => ({
            ...prev,
            bedNumber,
            bedCharge: selectedBed?.bed_charge || ''
        }));
    };

    const handleDaysChange = (e) => {
        setFormInput(prev => ({
            ...prev,
            days: Math.max(1, parseInt(e.target.value) || 1)
        }));
    };

    const handleAddItem = () => {
        if (!formInput.bedCategory || !formInput.bedNumber || !formInput.days) return;

        const newItem = {
            id: `${formInput.bedCategory}-${formInput.bedNumber}`,
            bed_category: formInput.bedCategory,
            bed_number: formInput.bedNumber,
            bed_charge: formInput.bedCharge,
            number_days: formInput.days,
            total: formInput.bedCharge * formInput.days
        };

        setLocalAccommodation(prev => ({
            items: [...prev.items, newItem],
            total: prev.total + newItem.total
        }));

        // Reset form
        setFormInput({
            bedCategory: '',
            bedNumber: '',
            bedCharge: '',
            days: 1
        });

        categoryRef.current.focus();
    };

    const updateDays = (index, days) => {
        const items = [...localAccommodation.items];
        days = Math.max(1, parseInt(days) || 1);

        items[index].number_days = days;
        items[index].total = days * items[index].bed_charge;

        setLocalAccommodation({
            items,
            total: items.reduce((sum, item) => sum + item.total, 0)
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = localAccommodation.items.filter((_, i) => i !== index);
        setLocalAccommodation({
            items: newItems,
            total: newItems.reduce((sum, item) => sum + item.total, 0)
        });
    };

    return (
        <div>
            {/* Existing Bed List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="table-auto w-full">
                    <thead className="bg-gray-300">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Bed Number</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Daily Charge</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Days</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {localAccommodation.items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">{item.bed_category}</td>
                                <td className="px-4 py-3">{item.bed_number}</td>
                                <td className="px-4 py-3">₹{item.bed_charge}</td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        className="input input-bordered w-20"
                                        value={item.number_days}
                                        onChange={(e) => updateDays(index, e.target.value)}
                                    />
                                </td>
                                <td className="px-4 py-3 font-medium">₹{item.total.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="btn btn-ghost btn-sm text-red-600 hover:text-red-800"
                                    >
                                        <MdDeleteForever className="text-xl" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {/* Add New Bed Form */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-2">Bed Category</label>
                    <Select
                        ref={categoryRef}
                        options={categoryOptions}
                        value={categoryOptions.find(opt => opt.value === formInput.bedCategory)}
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
                                minHeight: '38px',
                                borderRadius: '6px'
                            })
                        }}
                    />
                </div>

                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-2">Bed Number</label>
                    <Select
                        options={bedNumberOptions}
                        value={bedNumberOptions.find(opt => opt.value === formInput.bedNumber)}
                        onChange={handleBedNumberChange}
                        placeholder="Search bed number..."
                        isSearchable
                        isDisabled={!formInput.bedCategory}
                        className="react-select-container"
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

                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-2">Daily Charge</label>
                    <input
                        type="number"
                        className="input input-bordered w-full bg-gray-100"
                        value={formInput.bedCharge}
                        readOnly
                    />
                </div>

                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-2">Days</label>
                    <input
                        ref={daysRef}
                        type="number"
                        className="input input-bordered w-full"
                        value={formInput.days}
                        onChange={handleDaysChange}
                        min="1"
                    />
                </div>

                <button
                    onClick={handleAddItem}
                    className="btn btn-primary w-full md:w-auto"
                    disabled={!formInput.bedCategory || !formInput.bedNumber}
                >
                    <BiSolidPlusSquare className="w-5 h-5 mr-2" />
                    Add
                </button>
            </div>

            {/* Grand Total */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
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
/* eslint-disable react/prop-types */
import React from "react";
import dayjs from "dayjs";

const BedChargeForm = ({ Acomodation, setAcomodation }) => {
  const handleChange = (index, field, value) => {
    const updatedItems = [...Acomodation.items];
    
    if (field === 'dateofadd') {
      // Calculate days when date changes
      const days = Math.max(dayjs().diff(dayjs(value), 'day'), 1);
      updatedItems[index] = {
        ...updatedItems[index],
        dateofadd: value,
        number_days: days,
        total: (parseInt(updatedItems[index].bed_charge) || 0) * days
      };
    } else if (field === 'number_days') {
      // Update days directly
      const days = Math.max(parseInt(value) || 1, 1);
      updatedItems[index] = {
        ...updatedItems[index],
        number_days: days,
        total: (parseInt(updatedItems[index].bed_charge) || 0) * days
      };
    }

    setAcomodation({
      ...Acomodation,
      items: updatedItems,
      total: updatedItems.reduce((acc, item) => acc + (item.total || 0), 0)
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Bed Charge Details</h2>
      
      <div className="space-y-4">
        {Acomodation?.items?.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Read-only Fields */}
              <div>
                <label className="block text-sm font-medium mb-1">Bed Category</label>
                <input
                  value={item.bed_category}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bed Number</label>
                <input
                  value={item.bed_number}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Charge</label>
                <input
                  value={item.bed_charge}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>

              {/* Editable Fields */}
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={item.dateofadd}
                  onChange={(e) => handleChange(index, 'dateofadd', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Days</label>
                <input
                  type="number"
                  value={item.number_days}
                  onChange={(e) => handleChange(index, 'number_days', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Total</label>
                <input
                  value={`₹${item.total}`}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <div className="text-lg font-semibold">
          Grand Total: ₹{Acomodation?.total?.toLocaleString() || 0}
        </div>
      </div>
    </div>
  );
};

export default BedChargeForm;
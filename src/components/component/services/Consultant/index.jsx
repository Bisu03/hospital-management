import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BiSolidPlusSquare } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { fetchData } from "@/services/apiService";
import { generateUnique } from "@/lib/uniqueNumber";

const DoctorForm = ({ DoctorCharge, setDoctorCharge }) => {
  const [AddDoctor, setAddDoctor] = useState({
    u_ID: generateUnique(),
    doctor_id: "",
    doctor_name: "",
    doctor_charge: "",
    doctor_visit: "1", // Default to 1 visit
  });

  const { data: doctorrecord } = useQuery({
    queryKey: ["doctorrecord"],
    queryFn: () => fetchData("/doctor"),
  });

  const handleInputChange = (e) => {
    setAddDoctor({ ...AddDoctor, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    if (!AddDoctor.doctor_id || !AddDoctor.doctor_charge) return;

    const newDoctor = {
      itemID: AddDoctor.u_ID,
      drname: AddDoctor.doctor_name,
      charge: parseInt(AddDoctor.doctor_charge),
      visit: parseInt(AddDoctor.doctor_visit) || 1,
    };

    setDoctorCharge((prev) => ({
      total: (prev?.total || 0) + newDoctor.charge * newDoctor.visit,
      items: [...(prev?.items || []), newDoctor],
    }));

    setAddDoctor({
      u_ID: generateUnique(),
      doctor_id: "",
      doctor_name: "",
      doctor_charge: "",
      doctor_visit: "1",
    });
  };

  const handleRemoveItem = (itemID) => {
    setDoctorCharge((prev) => {
      const updatedItems = prev.items.filter((item) => item.itemID !== itemID);
      const total = updatedItems.reduce((sum, item) => sum + item.charge * item.visit, 0);
      return { total, items: updatedItems };
    });
  };

  const handleEditItem = (index, field, value) => {
    const numericValue = parseInt(value) || 0;
    
    setDoctorCharge((prev) => {
      const updatedItems = prev.items.map((item, i) =>
        i === index ? { ...item, [field]: numericValue } : item
      );
      
      const total = updatedItems.reduce((sum, item) => sum + item.charge * item.visit, 0);
      
      return { 
        total: total > 0 ? total : 0,
        items: updatedItems.map(item => ({
          ...item,
          total: item.charge * item.visit
        }))
      };
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="overflow-x-auto mt-4">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Doctor Name</th>
              <th className="p-3 text-center">Charge</th>
              <th className="p-3 text-center">Visits</th>
              <th className="p-3 text-center">Total</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {DoctorCharge?.items?.map((data, index) => (
              <tr key={data.itemID} className="hover:bg-gray-50">
                <td className="p-3 border-t">{data.drname}</td>
                <td className="p-3 border-t text-center">
                  <input
                    type="number"
                    value={data.charge}
                    onChange={(e) => handleEditItem(index, "charge", e.target.value)}
                    className="w-20 px-2 py-1 border rounded text-center"
                  />
                </td>
                <td className="p-3 border-t text-center">
                  <input
                    type="number"
                    value={data.visit}
                    onChange={(e) => handleEditItem(index, "visit", e.target.value)}
                    className="w-20 px-2 py-1 border rounded text-center"
                    min="1"
                  />
                </td>
                <td className="p-3 border-t text-center">
                  ₹{data.charge * data.visit}
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

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          name="doctor_id"
          value={AddDoctor.doctor_id}
          onChange={(e) => {
            const selectedDoctor = doctorrecord?.data?.find(
              (doc) => doc._id === e.target.value
            );
            setAddDoctor({
              ...AddDoctor,
              doctor_id: e.target.value,
              doctor_name: selectedDoctor?.drname || "",
              doctor_charge: selectedDoctor?.charge || "",
            });
          }}
          className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Doctor</option>
          {doctorrecord?.data?.map((data) => (
            <option key={data._id} value={data._id}>
              {data.drname}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="doctor_name"
          value={AddDoctor.doctor_name}
          placeholder="Doctor Name"
          className="p-2 border rounded bg-gray-100"
          readOnly
        />

        <input
          type="number"
          name="doctor_charge"
          value={AddDoctor.doctor_charge}
          onChange={handleInputChange}
          placeholder="Charge"
          className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="number"
          name="doctor_visit"
          value={AddDoctor.doctor_visit}
          onChange={handleInputChange}
          placeholder="Visits"
          min="1"
          className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <BiSolidPlusSquare className="text-xl" />
          Add 
        </button>
        
        <div className="text-xl font-semibold">
          Grand Total: ₹{DoctorCharge?.total?.toLocaleString() || 0}
        </div>
      </div>
    </div>
  );
};

export default DoctorForm;
import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { BiSolidPlusSquare } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import Select from "react-select";
import { fetchData } from "@/services/apiService";
import { generateUnique } from "@/lib/uniqueNumber";

const DoctorForm = ({ DoctorCharge, setDoctorCharge }) => {
  const [AddDoctor, setAddDoctor] = useState({
    u_ID: generateUnique(),
    doctor_id: "",
    doctor_name: "",
    doctor_charge: "",
    doctor_visit: "1",
  });

  const selectRef = useRef(null);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        if (selectRef.current) {
          selectRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { data: doctorrecord } = useQuery({
    queryKey: ["doctorrecord"],
    queryFn: () => fetchData("/doctor"),
  });

  const doctorOptions = doctorrecord?.data?.map(doctor => ({
    value: doctor._id,
    label: doctor.drname,
    data: doctor
  })) || [];

  const handleDoctorSelect = (selectedOption) => {
    if (selectedOption) {
      setAddDoctor({
        ...AddDoctor,
        doctor_id: selectedOption.value,
        doctor_name: selectedOption.data.drname,
        doctor_charge: selectedOption.data.charge?.toString() || ""
      });
    }
  };

  const handleInputChange = (e) => {
    setAddDoctor({ ...AddDoctor, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    if (!AddDoctor.doctor_id || !AddDoctor.doctor_charge) return;

    const charge = Number(AddDoctor.doctor_charge) || 0;
    const visit = Math.max(Number(AddDoctor.doctor_visit) || 1, 1);

    const newDoctor = {
      itemID: AddDoctor.u_ID,
      drname: AddDoctor.doctor_name,
      charge: charge,
      visit: visit,
    };

    setDoctorCharge((prev) => ({
      total: (prev?.total || 0) + charge * visit,
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
    const numericValue = Number(value);
    let safeValue = numericValue;

    if (field === "visit") {
      safeValue = Math.max(isNaN(numericValue) ? 1 : numericValue, 1);
    } else {
      safeValue = isNaN(numericValue) ? 0 : numericValue;
    }

    setDoctorCharge((prev) => {
      const updatedItems = prev.items.map((item, i) =>
        i === index ? { ...item, [field]: safeValue } : item
      );

      const total = updatedItems.reduce((sum, item) => sum + item.charge * item.visit, 0);

      return {
        total: total > 0 ? total : 0,
        items: updatedItems
      };
    });
  };

  return (
    <div className="p-4">
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
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-3 border-t">{data.drname}</td>
                <td className="p-3 border-t text-center">
                  <input
                    type="number"
                    value={data.charge || 0}
                    onChange={(e) => handleEditItem(index, "charge", e.target.value)}
                    className="w-20 px-2 py-1 border rounded text-center"
                  />
                </td>
                <td className="p-3 border-t text-center">
                  <input
                    type="number"
                    value={data.visit || 1}
                    onChange={(e) => handleEditItem(index, "visit", e.target.value)}
                    className="w-20 px-2 py-1 border rounded text-center"
                    min="1"
                  />
                </td>
                <td className="p-3 border-t text-center">
                  ₹{(data.charge || 0) * (data.visit || 1)}
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
        <div className="w-full">
          <Select
            ref={selectRef}
            options={doctorOptions}
            value={doctorOptions.find(opt => opt.value === AddDoctor.doctor_id)}
            onChange={handleDoctorSelect}
            placeholder="Search or select doctor..."
            isSearchable
            isClearable
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
            styles={{
              menuPortal: base => ({ ...base, zIndex: 9999 }),
              control: (base) => ({
                ...base,
                padding: '2px',
                borderRadius: '6px'
              })
            }}
          />
        </div>

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
          min="0"
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
          className="btn btn-primary"
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
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createData, fetchData } from "@/services/apiService";
import PatientDropdown from "@/components/component/PatientDropdown";
import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import React, { lazy, Suspense, useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import PatientRegistration from "@/components/component/PatientRegistration";
import { getDate } from "@/lib/currentDate";
import { formattedTime } from "@/lib/timeGenerate";
import { SuccessHandling } from "@/utils/successHandling";
import Spinner from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";
import Tab from "@/components/Tab";
import { TabLinks } from "@/utils/tablinks";
import { getCompactAge } from "@/lib/ageCount";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const CreatePathology = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [PatientSearch, setPatientSearch] = useState({ fullname: "" });
  const [ServiceData, setServiceData] = useState({
    reg_id: "",
    mrd_id: "",
    fullname: "",
    phone_number: "",
    referr_by: "",
    gender: "",
    patient: "",
    dob: "",
    age: "",
    address: "",
    paydby: "",
    paid_amount: 0,
    due_amount: 0,
    reporting_date: getDate(),
    test_cart: {
      services: [],
      totalAmount: 0,
    },
  });
  const [Times, setTimes] = useState(formattedTime());
  const [selectDob, setSelectDob] = useState("");

  

  useEffect(() => {
    setServiceData(prev => ({ ...prev, age: getCompactAge(selectDob || "") }));
  }, [selectDob]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServiceData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "paid_amount") {
        const paid = parseFloat(value) || 0;
        const due = updated.test_cart.totalAmount - paid;
        return { ...updated, due_amount: due > 0 ? due : 0 };
      }
      return updated;
    });
  };

  const { data: prevData, error, isLoading, refetch } = useQuery({
    queryKey: ["pathologyrecord"],
    queryFn: () => fetchData(`/pathology/${searchTerm}`),
  });

  const handleRegIdSearch = async () => {
    refetch();
  }

  useEffect(() => {
    setServiceData({
      fullname: prevData?.data?.patient?.fullname,
      patient: prevData?.data?.patient?._id,
      reg_id: prevData?.data?.patient?.reg_id,
      mrd_id: prevData?.data?.patient?.mrd_id,
      phone_number: prevData?.data?.patient?.phone_number,
      referr_by: prevData?.data?.patient?.referr_by,
      gender: prevData?.data?.patient?.gender,
      age: prevData?.data?.patient?.age,
      dob: prevData?.data?.patient?.dob,
      address: prevData?.data?.patient?.address,
      paydby: prevData?.data?.paydby,
      paid_amount: prevData?.data?.paid_amount,
      due_amount: prevData?.data?.due_amount,
      reporting_date: prevData?.data?.reporting_date,
      test_cart: prevData?.data?.test_cart,

    })
  }, [prevData]);


  // Fetch categories and tests
  const { data: categories } = useQuery({
    queryKey: ["pathologycategories"],
    queryFn: () => fetchData("/admin/pathology/category"),
  });

  const { data: pathologytests } = useQuery({
    queryKey: ["pathologyservices"],
    queryFn: () => fetchData("/admin/pathology/record"),
  });


  const mutation = useMutation({
    mutationFn: (newRecord) =>
      createData("/pathology", { ...newRecord, reporting_time: Times }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["pathologyrecords"]);
      SuccessHandling(data.message);
      setServiceData({
        reg_id: "",
        mrd_id: "",
        fullname: "",
        phone_number: "",
        referr_by: "",
        gender: "",
        patient: "",
        dob: "",
        age: "",
        address: "",
        paydby: "",
        paid_amount: 0,
        due_amount: 0,
        reporting_time: "",
        reporting_date: getDate(),
        test_cart: {
          services: [],
          totalAmount: 0,
        },
      });
      router.push(`/pathology/printreceipt/${data?.data?.reg_id}`);
    },
    onError: (error) => ErrorHandeling(error),
  });


  const handleSubmit = () => {
    if (!ServiceData.paydby) {
      return ErrorHandeling({ message: "Please select payment method" });
    }
    mutation.mutate(ServiceData);
  };

  const addToCart = (test) => {
    const relatedTests = pathologytests.data
      .filter((pt) => pt.pathology_category?._id === test._id)
      .map((pt) => ({ ...pt, reading_unit: "" }));

    setServiceData(prev => {
      const newTotal = prev.test_cart.totalAmount + Number(test.pathology_charge);
      const newDue = newTotal - prev.paid_amount;
      return {
        ...prev,
        test_cart: {
          services: [...prev.test_cart.services, { ...test, related_tests: relatedTests }], // Fixed syntax here
          totalAmount: newTotal
        },
        due_amount: newDue > 0 ? newDue : 0
      };
    });
  };

  const removeFromCart = (test) => {
    setServiceData(prev => {
      const updatedServices = prev.test_cart.services.filter(
        service => service._id !== test._id
      );
      const newTotal = prev.test_cart.totalAmount - Number(test.pathology_charge);
      const newDue = newTotal - prev.paid_amount;
      return {
        ...prev,
        test_cart: {
          services: updatedServices,
          totalAmount: newTotal
        },
        due_amount: newDue > 0 ? newDue : 0
      };
    });
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-wrap w-full justify-between">
        <Tab tabs={TabLinks} category="Pathology Patient" />
        <MiddleSection>
          <div className="w-full">
            <Heading heading="Pathology Admission">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter REG ID"
                  className="p-2 border rounded"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  onClick={handleRegIdSearch}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
            </Heading>
            <div className="w-full bg-gray-100 p-2 md:p-4 rounded-lg shadow-sm mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name<span className="text-red-500 text-lg">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={ServiceData.fullname}
                    onChange={handleChange}
                    className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number<span className="text-red-500 text-lg">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={ServiceData.phone_number}
                    onChange={handleChange}
                    className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Gender<span className="text-red-500 text-lg">*</span>
                  </label>
                  <select
                    name="gender"
                    value={ServiceData.gender}
                    onChange={handleChange}
                    className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Age<span className="text-red-500 text-lg">*</span>
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={ServiceData.age}
                    onChange={handleChange}
                    className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="selectDob"
                    value={selectDob}
                    onChange={(e) => setSelectDob(e.target.value)}
                    className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={ServiceData.address}
                    onChange={handleChange}
                    className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Reporting Date
                  </label>
                  <input
                    type="date"
                    name="reporting_date"
                    value={ServiceData.reporting_date}
                    onChange={handleChange}
                    className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Reporting Time
                  </label>
                  <input
                    type="text"
                    name="Times"
                    value={Times}
                    onChange={(e) => setTimes(e.target.value)}
                    className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Referred By
                  </label>
                  <input
                    type="text"
                    name="referr_by"
                    value={ServiceData.referr_by}
                    onChange={handleChange}
                    className="w-full max-w-sm py-1 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  />
                </div>

              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Available Tests</h2>
              <input
                type="text"
                placeholder="Search tests..."
                className="w-full p-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {categories?.data?.map((test) => (
                <div
                  key={test._id}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <p className="font-semibold">{test.pathology_category}</p>
                  <p className="text-sm font-bold text-gray-500">
                    ₹{Number(test.pathology_charge)}
                  </p>
                  <button
                    onClick={() => addToCart(test)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Test Cart</h2>
              {ServiceData?.test_cart?.services.map((test, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <p className="font-semibold">{test?.pathology_category}</p>
                  <p className="text-sm font-bold text-gray-500">
                    ₹{Number(test?.pathology_charge)}
                  </p>
                  <button
                    onClick={() => removeFromCart(test)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span>₹{ServiceData?.test_cart?.totalAmount}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Method<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paydby"
                      value={ServiceData.paydby}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Method</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="insurance">Insurance</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Paid Amount
                    </label>
                    <input
                      type="number"
                      name="paid_amount"
                      value={ServiceData?.paid_amount}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      min="0"
                      max={ServiceData?.test_cart?.totalAmount}
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Due Amount
                  </label>
                  <input
                    type="number"
                    name="due_amount"
                    value={ServiceData.due_amount}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="btn btn-primary w-full mt-4"
                  disabled={mutation.isPending || !ServiceData.paydby}
                >
                  {mutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner /> Submitting...
                    </span>
                  ) : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </MiddleSection>
      </div>
    </Suspense>
  );
};

export default withAuth(CreatePathology);
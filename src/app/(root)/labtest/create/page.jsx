"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createData, fetchData, updateData } from "@/services/apiService";
import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import React, { lazy, Suspense, useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import { getDate } from "@/lib/currentDate";
import { formattedTime } from "@/lib/timeGenerate";
import { SuccessHandling } from "@/utils/successHandling";
import Spinner from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";
import Tab from "@/components/Tab";
import { TabLinks } from "@/utils/tablinks";
import { getCompactAge } from "@/lib/ageCount";
import Select from "react-select";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const CreateLabtest = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session } = useSession();

  const [searchTerm, setSearchTerm] = useState("");
  const [ToggleTest, setToggleTest] = useState(true);
  const [consultant, setConsultant] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [AdmitType, setAdmitType] = useState("NEW");
  const [Billdata, setBilldata] = useState("");
  // Refs for keyboard navigation
  const discountRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [ServiceData, setServiceData] = useState({
    mrd_id: "",
    reg_id: "",
    fullname: "",
    phone_number: "",
    referr_by: "",
    gender: "",
    patient: "",
    dob: "",
    age: "",
    address: "",
    consultant: "",
    paidby: "Due",
    reporting_date: getDate(),
    reporting_time: formattedTime(),
    pathology_test_cart: { services: [] },
    radiology_test_cart: { services: [] },
    amount: {
      total: 0,
      discount: 0,
      paid: 0,
      due: 0,
      netTotal: 0,
    },
    admited_by: session?.user?.username,
  });

  const [loadingSearch, setLoadingSearch] = useState(false);

  const [Times, setTimes] = useState(formattedTime());
  const [selectDob, setSelectDob] = useState("");

  // Enhanced keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt+1 for Pathology
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        setToggleTest(true);
        setFocusedIndex(-1);
      }
      // Alt+2 for Radiology
      else if (e.altKey && e.key === "2") {
        e.preventDefault();
        setToggleTest(false);
        setFocusedIndex(-1);
      }
      // F5 for Submit
      else if (e.key === "F5") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "F6") {
        e.preventDefault();
        handleUpdate();
      }
      // Alt+D for Discount
      else if (e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        discountRef.current?.focus();
        discountRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [ServiceData, focusedIndex, ToggleTest]);

  // Existing useEffect for age calculation
  useEffect(() => {
    setServiceData((prev) => ({
      ...prev,
      age: getCompactAge(selectDob || ""),
      dob: selectDob,
    }));
  }, [selectDob]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("amount.")) {
      const field = name.split(".")[1];
      setServiceData((prev) => {
        const updatedAmount = {
          ...prev.amount,
          [field]: Math.max(parseFloat(value) || 0, 0),
        };

        // Recalculate values
        updatedAmount.netTotal = updatedAmount.total - updatedAmount.discount;
        updatedAmount.due = Math.max(
          updatedAmount.netTotal - updatedAmount.paid,
          0
        );

        // Ensure paid doesn't exceed netTotal
        if (field === "paid") {
          updatedAmount.paid = Math.min(
            updatedAmount.paid,
            updatedAmount.netTotal
          );
        }

        // Ensure discount doesn't exceed total
        if (field === "discount") {
          updatedAmount.discount = Math.min(
            updatedAmount.discount,
            updatedAmount.total
          );
        }

        return {
          ...prev,
          amount: updatedAmount,
        };
      });
    } else {
      setServiceData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlemrdIdSearch = async () => {
    try {
      const { data: prevData } = await fetchData(`/patient/${searchTerm}`);
      setServiceData({
        ...ServiceData,
        fullname: prevData?.fullname,
        mrd_id: prevData?.mrd_id,
        phone_number: prevData?.phone_number,
        referr_by: prevData?.referr_by,
        gender: prevData?.gender,
        age: prevData?.age,
        address: prevData?.address,
      });
      setSelectDob(prevData?.dob);
    } catch (error) {
      ErrorHandeling(error);
    }
  };

  const { data: doctorrecord } = useQuery({
    queryKey: ["doctorrecord"], // Unique query key
    queryFn: () => fetchData("/doctor"), // Function to fetch data
  });

  const doctorOptions = doctorrecord?.data?.map((doctor) => ({
    value: doctor,
    label: doctor.drname,
  }));

  // Fetch categories and tests
  const { data: categories } = useQuery({
    queryKey: ["pathologycategories"],
    queryFn: () => fetchData("/admin/pathology/category"),
  });

  const { data: pathologytests } = useQuery({
    queryKey: ["pathologyservices"],
    queryFn: () => fetchData("/admin/pathology/record"),
  });

  const { data: radiologytest } = useQuery({
    queryKey: ["radiologytest"],
    queryFn: () => fetchData("/admin/radiology"),
  });

  const handleDetailSearch = async () => {
    setLoadingSearch(true);
    try {
      const { data: prevData } = await fetchData(`/labtest/${Billdata}`);
      setServiceData({
        fullname: prevData?.patient?.fullname,
        patient: prevData?.patient?._id,
        reg_id: prevData?.patient?.reg_id,
        mrd_id: prevData?.patient?.mrd_id,
        phone_number: prevData?.patient?.phone_number,
        referr_by: prevData?.patient?.referr_by,
        gender: prevData?.patient?.gender,
        age: prevData?.patient?.age,
        dob: prevData?.patient?.dob,
        address: prevData?.patient?.address,
        paidby: prevData?.paidby,
        reporting_date: prevData?.reporting_date,
        pathology_test_cart: prevData?.pathology_test_cart,
        radiology_test_cart: prevData?.radiology_test_cart,
        amount: prevData?.amount,
        referr_by: prevData?.referr_by,
        isEditing: true,
      });
      setSelectDob(prevData?.patient?.dob);
      setConsultant({
        value: prevData?.consultant,
        label: prevData?.consultant?.drname,
      });
      setLoadingSearch(false);
    } catch (error) {
      setLoadingSearch(false);
      ErrorHandeling(error);
    }
  };

  const handleSubmit = async () => {
    if (!ServiceData.paidby) {
      return toast.error("Please select payment method");
    }
    if (!consultant?.value?._id) {
      return toast.error("Please select consultant");
    }
    setIsLoading(true);
    try {
      const { data } = await createData("/labtest", {
        ...ServiceData,
        consultant: consultant.value._id,
        amount: {
          ...ServiceData.amount,
          netTotal: ServiceData.amount.total - ServiceData.amount.discount,
        },
      });
      SuccessHandling("Patient Added Succesfully");
      router.push(`/labtest/printreceipt/${data?.bill_no}`);
    } catch (error) {
      ErrorHandeling(error);
    } finally {
      setIsLoading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (newRecord) =>
      updateData("/labtest", Billdata, { ...newRecord, reporting_time: Times }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["labtestrecord"]);
      SuccessHandling(data.message);
      router.push(`/labtest/printreceipt/${Billdata}`);
    },
    onError: (error) => ErrorHandeling(error),
  });

  const handleUpdate = () => {
    mutation.mutate({ ...ServiceData, consultant: consultant.value._id });
  };

  const addToCart = (test, test_type) => {
    setServiceData((prev) => {
      if (test_type === "pathology") {
        const newTotal = prev.amount.total + Number(test.pathology_charge);
        const newNetTotal = newTotal - prev.amount.discount;
        const newDue = Math.max(newNetTotal - prev.amount.paid, 0);

        const relatedTests = pathologytests.data
          .filter((pt) => pt.pathology_category?._id === test._id)
          .map((pt) => ({ ...pt, reading_unit: "" }));

        return {
          ...prev,
          pathology_test_cart: {
            services: [
              ...prev.pathology_test_cart.services,
              { ...test, related_tests: relatedTests },
            ],
          },
          amount: {
            ...prev.amount,
            total: newTotal,
            netTotal: newNetTotal,
            due: newDue,
          },
        };
      } else {
        const newTotal = prev.amount.total + Number(test.test_charge);
        const newNetTotal = newTotal - prev.amount.discount;
        const newDue = Math.max(newNetTotal - prev.amount.paid, 0);

        return {
          ...prev,
          radiology_test_cart: {
            services: [...prev.radiology_test_cart.services, test],
          },
          amount: {
            ...prev.amount,
            total: newTotal,
            netTotal: newNetTotal,
            due: newDue,
          },
        };
      }
    });
  };

  const removeFromCart = (test, test_type) => {
    if (test_type === "pathology") {
      setServiceData((prev) => {
        const updatedServices = prev.pathology_test_cart.services.filter(
          (service) => service._id !== test._id
        );
        const newTotal = prev.amount.total - Number(test.pathology_charge);
        const newNetTotal = newTotal - prev.amount.discount;
        const newDue = Math.max(newNetTotal - prev.amount.paid, 0);

        return {
          ...prev,
          pathology_test_cart: {
            services: updatedServices,
          },
          amount: {
            ...prev.amount,
            total: newTotal,
            netTotal: newNetTotal,
            due: newDue,
          },
        };
      });
    } else {
      setServiceData((prev) => {
        const updatedServices = prev.radiology_test_cart.services.filter(
          (service) => service._id !== test._id
        );
        const newTotal = prev.amount.total - Number(test.test_charge);
        const newNetTotal = newTotal - prev.amount.discount;
        const newDue = Math.max(newNetTotal - prev.amount.paid, 0);

        return {
          ...prev,
          radiology_test_cart: {
            services: updatedServices,
          },
          amount: {
            ...prev.amount,
            total: newTotal,
            netTotal: newNetTotal,
            due: newDue,
          },
        };
      });
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-wrap w-full justify-between">
        <Tab tabs={TabLinks} category="Labtest" />
        <MiddleSection>
          <div className="w-full">
            <Heading heading="Lab Admission">
              <div className="flex flex-col md:flex-row gap-2">
                <select
                  className="p-2 border rounded w-full md:w-auto"
                  value={AdmitType}
                  onChange={(e) => setAdmitType(e.target.value)}
                >
                  <option value="NEW">New</option>
                  <option value="UPDATE">Update</option>
                </select>

                {AdmitType === "NEW" ? (
                  <>
                    <input
                      type="text"
                      placeholder="Enter MRD ID"
                      className="p-2 border rounded w-full md:w-48"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                      onClick={handlemrdIdSearch}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 w-full md:w-auto"
                      disabled={loadingSearch}
                    >
                      {loadingSearch ? <Spinner /> : "Search"}
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Enter Bill No."
                      className="p-2 border rounded w-full md:w-48"
                      value={Billdata}
                      onChange={(e) => setBilldata(e.target.value)}
                    />
                    <button
                      onClick={handleDetailSearch}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 w-full md:w-auto"
                      disabled={loadingSearch}
                    >
                      {loadingSearch ? <Spinner /> : "Get"}
                    </button>
                  </>
                )}
              </div>
            </Heading>

            {/* Patient Information Section */}
            <div className="w-full bg-gray-100 p-4 rounded-lg shadow-sm mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Full Name */}

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={ServiceData?.fullname}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-black"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={ServiceData?.phone_number}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-black"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Gender<span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={ServiceData?.gender}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-black"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Age<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={ServiceData?.age}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-black"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="selectDob"
                    value={selectDob}
                    onChange={(e) => setSelectDob(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-black"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={ServiceData?.address}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Reg No.
                    <span className="text-red-500">
                      (leave blank for opd patient)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="reg_id"
                    value={ServiceData?.reg_id}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-black"
                  />
                </div>

                {/* Consultant */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Consultant
                  </label>
                  <Select
                    options={doctorOptions}
                    value={consultant}
                    onChange={(selectedOption) => setConsultant(selectedOption)}
                    isClearable
                    placeholder="Select Doctor"
                    className="basic-single border-black"
                    classNamePrefix="select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "42px",
                        fontSize: "14px",
                      }),
                    }}
                  />
                </div>

                {/* Referred By */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Referred By
                  </label>
                  <input
                    type="text"
                    name="referr_by"
                    value={ServiceData?.referr_by}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 border-black"
                  />
                </div>
              </div>
            </div>

            {/* Tests Section */}
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Tests */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <h2 className="text-xl font-semibold">Available Tests</h2>
                  <div className="flex flex-col md:flex-row gap-2">
                    <button
                      className={`${
                        ToggleTest ? "bg-red-500" : "bg-gray-400"
                      } text-white px-4 py-2 rounded`}
                      onClick={() => setToggleTest(true)}
                    >
                      Pathology (Alt+1)
                    </button>
                    <button
                      className={`${
                        !ToggleTest ? "bg-red-500" : "bg-gray-400"
                      } text-white px-4 py-2 rounded`}
                      onClick={() => setToggleTest(false)}
                    >
                      Radiology (Alt+2)
                    </button>
                  </div>
                </div>

                {ToggleTest ? (
                  <Select
                    options={categories?.data}
                    getOptionLabel={(option) =>
                      `${option.pathology_category || ""} - ₹${
                        option.pathology_charge
                      }`
                    }
                    getOptionValue={(option) => option._id}
                    onChange={(selectedOption) => {
                      if (selectedOption)
                        addToCart(selectedOption, "pathology");
                    }}
                    isSearchable
                    placeholder="Search pathology tests..."
                    className="basic-single border-black"
                    classNamePrefix="select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "42px",
                        fontSize: "14px",
                      }),
                    }}
                  />
                ) : (
                  <Select
                    options={radiologytest?.data}
                    getOptionLabel={(option) =>
                      `${option.test_name} - ₹${option.test_charge}`
                    }
                    getOptionValue={(option) => option._id}
                    onChange={(selectedOption) => {
                      if (selectedOption)
                        addToCart(selectedOption, "radiology");
                    }}
                    isSearchable
                    placeholder="Search radiology tests..."
                    className="basic-single border-black"
                    classNamePrefix="select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "42px",
                        fontSize: "14px",
                      }),
                    }}
                  />
                )}
              </div>

              {/* Test Cart */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Test Cart</h2>
                <div className="space-y-2">
                  {ServiceData?.pathology_test_cart?.services.map(
                    (test, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded gap-2"
                      >
                        <p className="font-semibold flex-1">
                          {test.pathology_category}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-500">
                            ₹{Number(test.pathology_charge)}
                          </p>
                          <button
                            onClick={() => removeFromCart(test, "pathology")}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  )}

                  {ServiceData?.radiology_test_cart?.services.map(
                    (test, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded gap-2"
                      >
                        <p className="font-semibold flex-1">{test.test_name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-500">
                            ₹{Number(test.test_charge)}
                          </p>
                          <button
                            onClick={() => removeFromCart(test, "radiology")}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Payment Section */}
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Discount Amount (Alt+D)
                      </label>
                      <input
                        ref={discountRef}
                        type="number"
                        name="amount.discount"
                        value={ServiceData.amount.discount}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        max={ServiceData.amount.total}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Paid Amount
                      </label>
                      <input
                        type="number"
                        name="amount.paid"
                        value={ServiceData.amount.paid}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Due Amount
                      </label>
                      <input
                        type="number"
                        value={ServiceData.amount.due}
                        readOnly
                        className="w-full p-2 border rounded bg-gray-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Payment Method<span className="text-red-500">*</span>
                      </label>
                      <select
                        name="paidby"
                        value={ServiceData.paidby}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Cash">Cash</option>
                        <option value="Upi">Upi</option>
                        <option value="Cashless">Cashless</option>
                        <option value="Sasthyasathi">Sasthyasathi</option>
                        <option value="Cancel">Cancel</option>
                        <option value="Due">Due</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex w-full justify-between">
                    <h1>Payable Amount:-</h1>
                    <h1>{ServiceData.amount.netTotal}</h1>
                  </div>
                  {/* Submit Button */}
                  {ServiceData?.isEditing ? (
                    <button
                      onClick={handleUpdate}
                      className="btn btn-primary w-full mt-4 py-2"
                      disabled={mutation.isPending || !ServiceData.paidby}
                    >
                      Update <kbd className="kbd kbd-sm">F6</kbd>{" "}
                      {mutation.isPending && <Spinner />}
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="btn btn-primary w-full mt-4 py-2"
                      disabled={isLoading || !ServiceData.paidby}
                    >
                      Submit <kbd className="kbd kbd-sm">F5</kbd>{" "}
                      {isLoading && <Spinner />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </MiddleSection>
      </div>
    </Suspense>
  );
};

export default withAuth(CreateLabtest);

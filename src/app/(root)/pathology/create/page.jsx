"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createData, fetchData } from "@/services/apiService";
import PatientDropdown from "@/components/component/PatientDropdown";
import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import React, { lazy, Suspense, useState } from "react";
import { FaTrash } from "react-icons/fa";
import PatientRegistration from "@/components/component/PatientRegistration";
import { getDate } from "@/lib/currentDate";
import { formattedTime } from "@/lib/timeGenerate";
import { SuccessHandling } from "@/utils/successHandling";
import Spinner from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";
import Tab from "@/components/Tab";
import { TabLinks } from "@/utils/tablinks";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const CreatePathology = () => {
  const queryClient = useQueryClient();
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("");
  const [PatientSearch, setPatientSearch] = useState({ fullname: "" });
  const [ServiceData, setServiceData] = useState({
    reg_id: "",
    mrd_id: "",
    fullname: "",
    referr_by: "",
    patient: "",
    reporting_date: getDate(),
    test_cart: {
      services: [],
      totalAmount: 0,
    },
  });
  const [Times, setTimes] = useState(formattedTime());

  const handleChange = (e) => {
    setServiceData({ ...ServiceData, [e.target.name]: e.target.value });
  };

  // Fetch categories and tests
  const { data: categories } = useQuery({
    queryKey: ["pathologycategories"],
    queryFn: () => fetchData("/admin/pathology/category"),
  });

  const { data: pathologytests, isLoading, error } = useQuery({
    queryKey: ["pathologyservices"],
    queryFn: () => fetchData("/admin/pathology/record"),
  });


  const handlePatientSelection = (patient) => {
    setServiceData({
      ...ServiceData,
      fullname: patient.fullname,
      patient: patient._id,
      referr_by: patient.referr_by,
      reg_id: patient.reg_id,
      mrd_id: patient.mrd_id,
    });
  };

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
        referr_by: "",
        patient: "",
        reporting_date: getDate(),
        test_cart: {
          services: [],
          totalAmount: 0,
        },
      })
      router.push(`/pathology/reading/${data?.data?.reg_id}`);
    },
    onError: (error) => ErrorHandeling(error),
  });

  const handleSubmit = () => {
    mutation.mutate(ServiceData);
  };
  const addToCart = (test) => {

    const relatedTests = pathologytests.data
      .filter((pt) => {
        const categoryId = pt.pathology_category?._id;
        return categoryId === test._id;
      })
      .map((pt) => ({
        ...pt,
        reading_unit: "", // Add new property with an empty string
      }));

    setServiceData({
      ...ServiceData,
      test_cart: {
        services: [...ServiceData.test_cart.services, { ...test, related_tests: [relatedTests] }],
        totalAmount: ServiceData.test_cart.totalAmount + Number(test.pathology_charge),
      },
    })
  };

  const removeFromCart = (test) => {
    setServiceData((prev) => {
      const updatedServices = prev.test_cart.services.filter(
        (service) => service._id !== test._id
      );
      const updatedTotal =
        prev.test_cart.totalAmount - Number(test.pathology_charge);
      return {
        ...prev,
        test_cart: { services: updatedServices, totalAmount: updatedTotal },
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
              <div className="flex items-center space-x-2">
                <PatientDropdown
                  PatientSearch={PatientSearch}
                  setPatientSearch={setPatientSearch}
                  onSelectPatient={handlePatientSelection}
                />
                <PatientRegistration admitedin="PATHOLOGY" />
              </div>
            </Heading>
            <div className="w-full bg-gray-100 p-2 md:p-4 rounded-lg shadow-sm mb-4">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 truncate">
                {ServiceData?.fullname || "No Patient Selected"}
              </h1>
              <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-4 gap-2 md:gap-4 ">
                {ServiceData?.mrd_id && (
                  <div className="space-y-0.5 min-w-[200px]">
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      MRD ID
                    </p>
                    <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                      {ServiceData.mrd_id}
                    </p>
                  </div>
                )}

                {ServiceData?.reg_id && (
                  <div className="space-y-0.5 min-w-[200px]">
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      REG ID
                    </p>
                    <p className="text-gray-700 text-sm md:text-base font-mono truncate">
                      {ServiceData.reg_id}
                    </p>
                  </div>
                )}
                {ServiceData?.referr_by && (
                  <div className="space-y-0.5 min-w-[200px]">
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Referred By
                    </p>
                    <p className="text-gray-700 text-sm md:text-base truncate">
                      {ServiceData.referr_by}
                    </p>
                  </div>
                )}
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
              {ServiceData.test_cart.services.map((test, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <p className="font-semibold">{test.pathology_category}</p>
                  <p className="text-sm font-bold text-gray-500">
                    ₹{Number(test.pathology_charge)}
                  </p>
                  <button
                    onClick={() => removeFromCart(test)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <p className="text-lg font-bold">
                Total: ₹{ServiceData.test_cart.totalAmount}
              </p>
              <button onClick={handleSubmit} className="btn btn-primary w-full">
                Submit {mutation.isPending && <Spinner />}
              </button>
            </div>
          </div>
        </MiddleSection>
      </div>
    </Suspense>
  );
};

export default withAuth(CreatePathology);

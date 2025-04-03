"use client";

import Loading from "@/components/Loading";
import PrintUi from "@/components/ui/PrintUi";
import { useHospital } from "@/context/setting/HospitalInformation";
import { formatDate } from "@/lib/formateDate";
import { fetchData } from "@/services/apiService";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import "suneditor/dist/css/suneditor.min.css"; // Import SunEditor styles
import React, { useEffect, useState } from "react";

const PathologyPrint = ({ data, hospitalInfo }) => (
  <div className="min-h-[90vh] flex flex-col">
    {data?.pathology_test_cart?.services?.map((service, index) => (
      <div
        key={service._id}
        style={{ pageBreakBefore: index !== 0 ? "always" : "auto" }}
        className="flex flex-col flex-1"
      >
        {/* Header */}
        <div className="w-full flex justify-between items-start mb-2 border-b-2 border-black pb-4">
          <div className="flex items-center gap-4">
            <Image
              width={120}
              height={120}
              src={hospitalInfo?.logo}
              alt="Hospital Logo"
              className="h-24 w-24 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-black">
                {hospitalInfo?.hospital_name}
              </h1>
              <p className="text-sm text-black py-1 rounded-md mt-2">
                Pathology Licence No:
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-700 leading-tight">
            <p>{hospitalInfo?.address}</p>
            <p>Helpline: {hospitalInfo?.phone}</p>
            <p>GST: {hospitalInfo?.gst_number}</p>
            <p className="text-black">{hospitalInfo?.email}</p>
          </div>
        </div>

        {/* Patient Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm border-b pb-1">
              Patient Details
            </h3>
            <div className="text-xs space-y-0.5">
              <p>Name: {data?.patient?.fullname}</p>
              <p>
                Gender/Age: {data?.patient?.gender}/{data?.patient?.age}
              </p>
              <p>Phone: {data?.patient?.phone_number}</p>
              <p>Address: {data?.patient?.address}</p>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-sm border-b pb-1">
              Report Details
            </h3>
            <div className="text-xs space-y-0.5">
              <p>
                Date/Time: {formatDate(data?.reporting_date)}{" "}
                {data?.reporting_time}
              </p>
              <p>MRD No.: {data?.mrd_id}</p>
              <p>Bill No.: {data?.bill_no}</p>
              <p>Referred By: {data?.consultant?.drname}</p>
            </div>
          </div>
        </div>

        {/* Test Category */}
        <div className="mb-8 text-sm">
          <div className="bg-gray-100 p-2 rounded-t">
            <h3 className="font-bold ">
              {service.pathology_category}
              <span className="ml-2 text-sm font-normal">
                (Charge: ₹{service.pathology_charge})
              </span>
            </h3>
          </div>

          <table className="w-full border">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-2 border">Test Name</th>
                <th className="text-left px-2 border">Reading Value</th>
                <th className="text-left px-2 border">Unit</th>
                <th className="text-left px-2 border">Reference Value</th>
              </tr>
            </thead>
            <tbody>
              {service?.related_tests?.map((test) => (
                <tr key={test._id}>
                  <td className="px-2 border">{test.pathology_testname}</td>
                  <td className="px-2 border">{test.reading_unit}</td>
                  <td className="px-2 border">{test.unit}</td>
                  <td className="px-2 border">{test.ref_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t-2 border-black pt-8">
          <div className="flex justify-between items-end">
            <div className="text-xs">
              Thank you for choosing {hospitalInfo?.hospital_name}
            </div>
            <div className="text-center">
              <div className="mb-2 h-1 w-48 border-b-2 border-black"></div>
              <p className="text-sm">E.&O.E: {data?.admited_by}</p>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const RadiologyPrint = ({ data, hospitalInfo }) => (
  <div className="min-h-[100vh] flex flex-col">
    <div className="w-full flex justify-between items-start mb-2 border-b-2 border-black pb-4">
      <div className="flex items-center gap-4">
        <Image
          width={120}
          height={120}
          src={hospitalInfo?.logo}
          alt="Hospital Logo"
          className="h-24 w-24 object-contain"
        />
        <div>
          <h1 className="text-2xl font-bold text-black">
            {hospitalInfo?.hospital_name}
          </h1>
          <p className="text-sm text-black py-1 rounded-md mt-2">
            Pathology Licence No: WBCE34539900
          </p>
        </div>
      </div>
      <div className="text-right text-sm text-gray-700 leading-tight">
        <p>{hospitalInfo?.address}</p>
        <p>Helpline: {hospitalInfo?.phone}</p>
        <p>GST: {hospitalInfo?.gst_number}</p>
        <p className="text-black">{hospitalInfo?.email}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-sm border-b pb-1">Patient Details</h3>
        <div className="text-xs space-y-0.5">
          <p>Name: {data?.patient?.fullname}</p>
          <p>
            Gender/Age: {data?.patient?.gender}/{data?.patient?.age}
          </p>
          <p>Phone: {data?.patient?.phone_number}</p>
          <p>Address: {data?.patient?.address}</p>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-sm border-b pb-1">Report Details</h3>
        <div className="text-xs space-y-0.5">
          <p>
            Date/Time: {formatDate(data?.reporting_date)} {data?.reporting_time}
          </p>
          <p>MRD No.: {data?.mrd_id}</p>
          <p>Bill No.: {data?.bill_no}</p>
          <p>Referred By: {data?.consultant?.drname}</p>
        </div>
      </div>
    </div>

    <div className="p-2 border rounded w-full">
      <div
        className="sun-editor-editable p-2 rounded"
        dangerouslySetInnerHTML={{ __html: data?.radiology_reading }}
      />
    </div>

    <div className="mt-auto border-t-2 border-black pt-8">
      <div className="flex justify-between items-end">
        <div className="text-xs">
          Thank you for choosing {hospitalInfo?.hospital_name}
        </div>
        <div className="text-center">
          <div className="mb-2 h-1 w-48 border-b-2 border-black"></div>
          <p className="text-sm"> Signature by Staff</p>
        </div>
      </div>
    </div>
  </div>
);

const LabPrint = () => {
  const { data: session } = useSession();
  const { hospitalInfo } = useHospital();
  const [ToggleTest, setToggleTest] = useState(true);
  const { slug } = useParams();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["labtestrecord", slug],
    queryFn: () => fetchData(`/labtest/${slug}`),
  });

  useEffect(() => {
    refetch();
  }, [slug]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt+1 for Pathology
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        setToggleTest(true);
      }
      // Alt+2 for Radiology
      else if (e.altKey && e.key === "2") {
        e.preventDefault();
        setToggleTest(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [ToggleTest]);

  if (isLoading) return <Loading />;

  return (
    <>
      <div className="flex justify-end space-x-2 p-4">
        <button
          className={`${ToggleTest ? "btn-error" : "btn-secondary"} btn`}
          onClick={() => setToggleTest(true)}
          title="Alt+1"
        >
          Pathology (Alt+1)
        </button>
        <button
          className={`${!ToggleTest ? "btn-error" : "btn-secondary"} btn`}
          onClick={() => setToggleTest(false)}
          title="Alt+2"
        >
          Radiology (Alt+2)
        </button>
      </div>

      <PrintUi path="/labtest/record">
        {ToggleTest ? (
          <PathologyPrint data={data?.data} hospitalInfo={hospitalInfo} />
        ) : (
          <RadiologyPrint data={data?.data} hospitalInfo={hospitalInfo} />
        )}
      </PrintUi>
    </>
  );
};

export default LabPrint;

"use client";

import Loading from "@/components/Loading";
import PrintUi from "@/components/ui/PrintUi";
import { useHospital } from "@/context/setting/HospitalInformation";
import { withAuth } from "@/services/withAuth";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/services/apiService";
import { formatDate } from "@/lib/formateDate";
import QRCode from "react-qr-code";
import { amountToWords } from "@/lib/numberToWord";

const LabReceipt = () => {
  const { slug } = useParams();
  const { data: session } = useSession();
  const { hospitalInfo } = useHospital();

  // Fetch pathology data only when `slug` is available
  const { data, isLoading } = useQuery({
    queryKey: ["labtestrecord", slug],
    queryFn: () => fetchData(`/labtest/${slug}`),
    enabled: !!slug, // Prevents query from running if `slug` is undefined
  });

  if (isLoading) return <Loading />;

  const pathologyData = data?.data;
  const patient = pathologyData?.patient;
  const consultant = pathologyData?.consultant;
  const amount = pathologyData?.amount;

  return (
    <PrintUi path="/labtest/record">
      <div className="mx-auto bg-white rounded-lg p-4 mt-20">
        {/* Patient & Report Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Patient Details */}
          <div className="space-y-1">
            <h3 className="font-semibold text-sm border-b border-black pb-1 print:text-xs">
              Patient Details
            </h3>
            <div className="text-xs space-y-0.5 print:text-xs">
              <p>
                <span className="font-semibold">Full Name:</span>{" "}
                {patient?.fullname}
              </p>
              <div className="flex space-x-2">
                <p>
                  <span className="font-semibold">Gender:</span>{" "}
                  {patient?.gender}
                </p>
                <p>
                  <span className="font-semibold">Age:</span> {patient?.age}
                </p>
              </div>
              <p>
                <span className="font-semibold">Phone No.:</span>{" "}
                {patient?.phone_number}
              </p>
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {patient?.address}
              </p>
            </div>
          </div>

          {/* Report Details */}
          <div>
            <h3 className="font-semibold text-sm border-b border-black pb-1 print:text-xs">
              Report Details
            </h3>
            <div className="text-xs space-y-0.5 print:text-xs">
              <p>
                <span className="font-semibold">Date/Time:</span>{" "}
                {formatDate(pathologyData?.reporting_date)}/
                {pathologyData?.reporting_time}
              </p>
              <p>
                <span className="font-semibold">MRD No.:</span>{" "}
                {pathologyData?.mrd_id}
              </p>
              {pathologyData?.reg_id && (
                <p>
                  <span className="font-semibold">REG No.:</span>{" "}
                  {pathologyData?.reg_id}
                </p>
              )}
              <p>
                <span className="font-semibold">Bill No.:</span>{" "}
                {pathologyData?.bill_no}
              </p>
              <p>
                <span className="font-semibold">Referred By:</span>{" "}
                {consultant?.drname}
              </p>
            </div>
          </div>
        </div>

        {/* Tests Table */}
        <table className="w-full mb-4 text-xs print:text-[10px]">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-1 text-left border ">Test Name</th>
              <th className="p-1 text-right border">Charge (₹)</th>
            </tr>
          </thead>
          <tbody>
            {pathologyData?.pathology_test_cart?.services?.map(
              (test, index) => (
                <tr key={index} className="border">
                  <td className="print:px-1 px-2 border  ">
                    {test?.pathology_category}
                  </td>
                  <td className="print:px-1 px-2 text-right border  ">
                    {Number(test?.pathology_charge).toFixed(2)}
                  </td>
                </tr>
              )
            )}
            {pathologyData?.radiology_test_cart?.services?.map(
              (test, index) => (
                <tr key={index} className="border">
                  <td className="print:px-1 px-2 border  ">
                    {test?.test_name}
                  </td>
                  <td className="print:px-1 px-2 text-right border  ">
                    {Number(test?.test_charge).toFixed(2)}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {/* Billing Summary */}
        <div className="flex justify-between space-x-2">
          <div>
            <QRCode
              size={100}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={`jahan-nh.logicro.xyz/labreport/${pathologyData?.bill_no}`}
              viewBox="0 0 100 100"
            />
          </div>
          <div className="flex-grow text-left px-4">
            <h2 className="text-xs font-semibold text-gray-600">
              Amount in Words:
            </h2>
            <h1 className="text-sm font-medium text-gray-700">
              {amountToWords(amount?.netTotal)}
            </h1>
          </div>

          <div className="w-72 space-y-1 text-xs print:text-[10px]">
            <div className="flex justify-between font-semibold">
              <span>Total Charges:</span>
              <span className="text-right">₹{amount?.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount Amount:</span>
              <span className="text-right">
                ₹{amount?.discount?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Net Total:</span>
              <span className="text-right">
                ₹{amount?.netTotal?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span className="text-right">₹{amount?.paid?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="text-right capitalize">
                {pathologyData?.paidby}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Due Amount:</span>
              <span className="text-red-600 text-right">
                ₹{amount?.due?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Signature & Footer */}
        <div className="mt-2 border-t-2 border-black pt-10">
          <div className="flex justify-between items-end">
            <div className="text-xs">
              Thank you for choosing {hospitalInfo?.hospital_name}
            </div>
            <div className="text-center">
              <div className="mb-2 h-1 w-48 border-b-2 border-black"></div>
              <p className="text-sm">E.&O.E: {pathologyData?.admited_by}</p>
            </div>
          </div>
        </div>
      </div>
    </PrintUi>
  );
};

export default withAuth(LabReceipt);

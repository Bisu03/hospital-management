"use client";

import { useParams } from "next/navigation";
import React, { lazy, Suspense, useEffect, useState } from "react";
import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import { fetchData } from "@/services/apiService";
import { useQuery } from "@tanstack/react-query";
import { FiFileText, FiDownload } from "react-icons/fi";
import { withAuth } from "@/services/withAuth";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const PatientDetails = () => {
  const { slug } = useParams();
  const [activeReport, setActiveReport] = useState("lab");

  const { data, isLoading } = useQuery({
    queryKey: ["patient", slug],
    queryFn: () => fetchData(`/patient/details/${slug}`),
  });

  const calculateIPDAmounts = (service) => {
    const consultantTotal = parseFloat(service.consultant_cart?.total) || 0;
    const medicineTotal = parseFloat(service.medicine_cart?.total) || 0;
    const serviceTotal = parseFloat(service.service_cart?.total) || 0;

    const total =
      consultantTotal + medicineTotal + serviceTotal + accommodationTotal;
    const discount = parseFloat(service.amount?.discount) || 0;
    const netTotal = total - discount;
    const paid = parseFloat(service.amount?.paid) || 0;
    const due = netTotal - paid;

    return { total, discount, netTotal, paid, due };
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-wrap w-full justify-between">
        <MiddleSection>
          <div className="w-full space-y-6">
            <Heading heading="Patient Details">
              <div className="join">
                <button
                  className={`join-item btn btn-border ${
                    activeReport === "lab" ? "btn-primary" : "btn-warning"
                  }`}
                  onClick={() => setActiveReport("lab")}
                >
                  <FiFileText className="mr-2" />
                  Lab Reports
                </button>
                <button
                  className={`join-item btn ${
                    activeReport === "ipd" ? "btn-primary" : "btn-warning"
                  }`}
                  onClick={() => setActiveReport("ipd")}
                >
                  <FiFileText className="mr-2" />
                  IPD Bills
                </button>
              </div>
            </Heading>

            {isLoading && <Loading />}``

            {/* Patient Information Card */}
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">
                      Patient Name
                    </div>
                    <div className="font-semibold">
                      {data?.data?.pData?.fullname || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">
                      MRD ID
                    </div>
                    <div className="font-mono">
                      {data?.data?.pData?.mrd_id || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">
                      REG ID
                    </div>
                    <div className="font-mono">
                      {data?.data?.pData?.reg_id || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">
                      Age/Gender
                    </div>
                    <div>
                      {data?.data?.pData?.age || "N/A"} /{" "}
                      {data?.data?.pData?.gender || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">
                      Contact
                    </div>
                    <div>{data?.data?.pData?.phone_number || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Section */}
            <div className="space-y-4">
              {activeReport === "lab" ? (
                data?.data?.labData?.map((service) => (
                  <div
                    key={service.bill_no}
                    className="card bg-base-100 shadow"
                  >
                    <div className="card-body">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold border-b border-black">
                            Lab Test Bills
                          </h3>
                          <h3 className="text-lg font-semibold">
                            Bill No: {service.bill_no}
                          </h3>
                          <div className="flex gap-2">
                            <span className="badge badge-primary">
                              {new Date(
                                service.reporting_date
                              ).toLocaleDateString()}
                            </span>
                            <span className="badge badge-secondary">
                              {service.paidby}
                            </span>
                            <span className="badge badge-error text-white">
                              ₹{service.amount.due?.toFixed(2)}
                            </span>
                            <span className="badge badge-warning">
                              ₹{service.amount.paid?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total Charges:</span>
                              <span>₹{service.amount.total?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Discount:</span>
                              <span>
                                ₹{service.amount.discount?.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Net Total:</span>
                              <span>
                                ₹{service.amount.netTotal?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Paid Amount:</span>
                              <span>₹{service.amount.paid?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-error font-bold">
                              <span>Due Amount:</span>
                              <span>₹{service.amount.due?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card bg-base-100 shadow">
                  <div className="card-body">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold border-b border-black">
                          IPD Bills
                        </h3>
                        <h3 className="text-lg font-semibold">
                          Bill No: {data?.data?.ipdData?.bill_no}
                        </h3>

                        <div className="flex gap-2">
                          <span className="badge badge-primary">
                            {new Date(
                              data?.data?.ipdData?.billing_date
                            ).toLocaleDateString()}
                          </span>
                          <span className="badge badge-secondary">
                            {data?.data?.ipdData?.paidby}
                          </span>
                          <span className="badge badge-error text-white">
                            ₹{data?.data?.ipdData?.amount?.due.toFixed(2)}
                          </span>
                          <span className="badge badge-warning">
                            ₹{data?.data?.ipdData?.amount?.paid.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Charges:</span>
                            <span>
                              ₹{data?.data?.ipdData?.amount?.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>
                              ₹
                              {data?.data?.ipdData?.amount?.discount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span>Net Total:</span>
                            <span>
                              ₹
                              {data?.data?.ipdData?.amount?.netTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Paid Amount:</span>
                            <span>
                              ₹{data?.data?.ipdData?.amount?.paid.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-error font-bold">
                            <span>Due Amount:</span>
                            <span>
                              ₹{data?.data?.ipdData?.amount?.due.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </MiddleSection>
      </div>
    </Suspense>
  );
};

export default withAuth(PatientDetails);

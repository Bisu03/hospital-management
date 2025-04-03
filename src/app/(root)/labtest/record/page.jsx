"use client";

import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import Tab from "@/components/Tab";
import Spinner from "@/components/ui/Spinner";
import { getDate } from "@/lib/currentDate";
import { deleteData, fetchData } from "@/services/apiService";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import { SuccessHandling } from "@/utils/successHandling";
import { TabLinks } from "@/utils/tablinks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { FaFileExcel, FaPrint } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const PathologyRecord = () => {
  const queryClient = useQueryClient();
  const contentRef = useRef(null);
  const { data: session } = useSession();
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchName, setSearchName] = useState("");
  const [fromDate, setFromDate] = useState(getDate());
  const [toDate, setToDate] = useState(getDate());

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchName);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchName]);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["labtestrecord"],
    queryFn: () =>
      fetchData(
        `/labtest?search=${debouncedSearch}&startDate=${fromDate}&endDate=${toDate}`
      ),
    onSuccess: (data) => {
      setTotalPages(data?.pagination?.totalPages || 1);
    },
  });

  useEffect(() => {
    refetch();
  }, [debouncedSearch, fromDate, toDate]);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteData("/labtest", id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["labtestrecord"] }); // Refetch data after adding
      SuccessHandling("Record Deleted");
      refetch();
    },
    onError: (error) => {
      ErrorHandeling(error);
      console.error("Error adding data:", error);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      deleteMutation.mutate(id);
    }
  };

  const handlePrint = useReactToPrint({ contentRef });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.data.map((patient) => ({
        "MRD ID": patient.mrd_id,
        "Bill No": patient.bill_no,
        "Patient Name": patient.patient.fullname,
        "Reporting Date": patient.reporting_date,
        "Reporting Time": patient.reporting_time,
        Consultant: patient?.consultant?.drname,
        "Referred By": patient?.referr_by,
        "Total Amount": patient.amount.total,
        Discount: patient.amount.discount,
        "Payable Amount": patient.amount.netTotal,
        "Due Amount": patient.amount.due,
        "Paid by": patient.paidby,
        "E&OE": patient.admited_by,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
    XLSX.writeFile(workbook, `${fromDate}-${toDate}-LabTest_Records.xlsx`);
  };

  const totalPatients = data?.data?.length || 0;
  const totalAmount =
    data?.data?.reduce(
      (acc, patient) => acc + (patient?.amount?.total || 0),
      0
    ) || 0;
  const totalDiscount =
    data?.data?.reduce(
      (acc, patient) => acc + (patient?.amount?.discount || 0),
      0
    ) || 0;
  const totalPayable =
    data?.data?.reduce(
      (acc, patient) => acc + (patient?.amount?.netTotal || 0),
      0
    ) || 0;
  const totalDue =
    data?.data?.reduce(
      (acc, patient) => acc + (patient?.amount?.due || 0),
      0
    ) || 0;

  return (
    <>
      <Suspense fallback={<Loading />}>
        <div className="flex flex-wrap w-full justify-between">
          <Tab tabs={TabLinks} category="Labtest" />
          <MiddleSection>
            <div className="w-full">
              <Heading heading="Lab Test Record">
                <div className="flex items-center space-x-2">
                  <input
                    className="py-2 px-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Search by name"
                  />

                  <input
                    className="border p-2 rounded w-full sm:w-auto"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <span className="hidden sm:inline">to</span>
                  <input
                    className="border p-2 rounded w-full sm:w-auto"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </Heading>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 print-hidden">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-semibold text-gray-600">
                    Total Patients
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {totalPatients}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-semibold text-gray-600">
                    Total Amount
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    ₹{totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-semibold text-gray-600">
                    Total Discount
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    ₹{totalDiscount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-semibold text-gray-600">
                    Total Payable
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    ₹{totalPayable.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-semibold text-gray-600">
                    Total Due
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    ₹{totalDue.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mb-4 print-hidden">
                <button
                  onClick={exportToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaFileExcel className="text-xl" />
                  Export Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaPrint className="text-xl" />
                  Print Report
                </button>
              </div>

              {isLoading && <Loading />}

              <div className="overflow-x-auto">
                <table ref={contentRef} className="w-full">
                  <thead>
                    <tr className="bg-secondary text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <th className="px-4 py-3">MRD ID</th>
                      <th className="px-4 py-3">Bill No</th>
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Reporting Date/Time</th>
                      <th className="px-4 py-3">Consultant</th>
                      <th className="px-4 py-3">Referred By</th>
                      <th className="px-4 py-3">Total Amount</th>
                      <th className="px-4 py-3">Discount</th>
                      <th className="px-4 py-3">Payable</th>
                      <th className="px-4 py-3">Due</th>
                      <th className="px-4 py-3">Paid By</th>
                      <th className="px-4 py-3">E&OE</th>
                      <th className="px-4 py-3 ">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.data?.map((patient) => (
                      <tr key={patient._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{patient?.mrd_id}</td>
                        <td className="px-4 py-3">{patient?.bill_no}</td>
                        <td className="px-4 py-3">
                          {patient?.patient?.fullname}
                        </td>
                        <td className="px-4 py-3">
                          {patient?.reporting_date}/ {patient?.reporting_time}
                        </td>
                        <td className="px-4 py-3">
                          {patient?.consultant?.drname}
                        </td>
                        <td className="px-4 py-3">{patient?.referr_by}</td>
                        <td className="px-4 py-3">
                          {patient?.amount?.total}/-
                        </td>
                        <td className="px-4 py-3">
                          {patient?.amount?.discount}/-
                        </td>
                        <td className="px-4 py-3">
                          {patient?.amount?.netTotal}/-
                        </td>
                        <td className="px-4 py-3">{patient?.amount?.due}/-</td>
                        <td className="px-4 py-3">{patient?.paidby}</td>
                        <td className="px-4 py-3">{patient?.admited_by}</td>
                        <td className="px-4 py-3 space-x-2 flex">
                          {/* <Link
                                                        href={`/labtest/update/${patient.bill_no}`}
                                                        className="btn btn-primary "
                                                    >
                                                        {" "}
                                                        <MdEdit />
                                                    </Link> */}
                          <Link
                            href={`/labtest/printreceipt/${patient.bill_no}`}
                            className="btn btn-primary "
                          >
                            {" "}
                            <FaPrint />
                          </Link>
                          {session?.user?.role === "Admin" && (
                            <button
                              onClick={() => handleDelete(patient._id)}
                              className="btn btn-error "
                            >
                              {" "}
                              <MdDelete />{" "}
                              {deleteMutation?.isPending && <Spinner />}{" "}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </MiddleSection>
        </div>
      </Suspense>
    </>
  );
};

export default withAuth(PathologyRecord);

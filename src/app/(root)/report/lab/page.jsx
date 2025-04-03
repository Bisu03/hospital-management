"use client";
import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import { getDate } from "@/lib/currentDate";
import { fetchData } from "@/services/apiService";
import { ErrorHandeling } from "@/utils/errorHandling";
import React, { lazy, Suspense, useState, useRef, useMemo } from "react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { formatDate } from "@/lib/formateDate";
import Spinner from "@/components/ui/Spinner";
import { withAuth } from "@/services/withAuth";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const LabReport = () => {
  const [startDate, setStartDate] = useState(getDate());
  const [endDate, setEndDate] = useState(getDate());
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);

  const exportPDF = () => {
    const input = tableRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Lab_Report_${startDate}_to_${endDate}.pdf`);
    });
  };

  const csvData = [
    ["MRD ID", "Bill No", "Patient Name", "Reporting Date", "Payment Method", "Due", "Net Total"],
    ...tableData.map(item => [
      item.mrd_id,
      item.bill_no,
      item.fullname,
      item.reporting_date,
      item.paidby || 'N/A',
      item.due,
      item.nettotal
    ])
  ];

  const handleGetdetails = async () => {
    try {
      setLoading(true);
      const { data } = await fetchData(
        `/report/lab?startDate=${startDate}&endDate=${endDate}`
      );
      setTableData(data);
    } catch (error) {
      ErrorHandeling(error);
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    return tableData.reduce(
      (acc, item) => ({
        totalTests: acc.totalTests + 1,
        totalDue: acc.totalDue + (item.due || 0),
        totalNet: acc.totalNet + (item.nettotal || 0)
      }),
      { totalTests: 0, totalDue: 0, totalNet: 0 }
    );
  }, [tableData]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-wrap w-full justify-between">
        <MiddleSection>
          <div className="w-full">
            <Heading heading="Lab Test Report"></Heading>

            {/* Date Filters and Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-auto">
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-start md:justify-end">
                <button
                  className="btn btn-primary w-full sm:w-auto"
                  onClick={handleGetdetails}
                  disabled={loading || !startDate || !endDate}
                >
                  {loading ? <Spinner /> : 'Search'}
                </button>

                <div className="flex flex-col sm:flex-row gap-2">
                  <CSVLink
                    data={csvData}
                    filename={`Lab_Report_${startDate}_to_${endDate}.csv`}
                    className="btn btn-success w-full sm:w-auto"
                    target="_blank"
                  >
                    Export Excel
                  </CSVLink>

                  <button
                    className="btn btn-error w-full sm:w-auto"
                    onClick={exportPDF}
                    disabled={tableData.length === 0}
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Totals Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="stats shadow bg-info text-info-content">
                <div className="stat">
                  <div className="stat-title">Total Tests</div>
                  <div className="stat-value text-2xl md:text-3xl">
                    {totals.totalTests}
                  </div>
                </div>
              </div>

              <div className="stats shadow bg-warning text-warning-content">
                <div className="stat">
                  <div className="stat-title">Total Due</div>
                  <div className="stat-value text-2xl md:text-3xl">
                    ₹{totals.totalDue.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="stats shadow bg-success text-success-content">
                <div className="stat">
                  <div className="stat-title">Net Total</div>
                  <div className="stat-value text-2xl md:text-3xl">
                    ₹{totals.totalNet.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            {tableData.length > 0 && (
              <div className="overflow-x-auto" ref={tableRef}>
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>MRD ID</th>
                      <th>Bill No</th>
                      <th>Patient Name</th>
                      <th>Reporting Date</th>
                      <th>Payment Method</th>
                      <th>Due</th>
                      <th>Net Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.mrd_id}</td>
                        <td>{item.bill_no}</td>
                        <td>{item.fullname}</td>
                        <td>{formatDate(item.reporting_date)}</td>
                        <td>{item.paidby || 'N/A'}</td>
                        <td>₹{item.due}</td>
                        <td>₹{item.nettotal}</td>
                        <td>
                          <span className={`badge ${item.due > 0 ? 'badge-error' : 'badge-success'}`}>
                            {item.due > 0 ? 'Pending' : 'Cleared'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tableData.length === 0 && !loading && (
              <div className="text-center p-8 text-gray-500">
                No lab records found for the selected date range
              </div>
            )}
          </div>
        </MiddleSection>
      </div>
    </Suspense>
  );
};

export default withAuth(LabReport);
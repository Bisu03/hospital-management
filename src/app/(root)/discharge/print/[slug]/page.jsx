"use client";

import Loading from "@/components/Loading";
import PrintUi from "@/components/ui/PrintUi";
import { useHospital } from "@/context/setting/HospitalInformation";
import { withAuth } from "@/services/withAuth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { formatDate } from "@/lib/formateDate";
import { fetchData } from "@/services/apiService";

const DischargePrint = () => {
  const { data: session } = useSession();
  const { hospitalInfo } = useHospital();
  const { slug } = useParams();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDischarge = async () => {
      try {
        const { data } = await fetchData(`/discharge/${slug}`);
        setFormData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching discharge:", err);
        setError("Failed to load discharge details");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchDischarge();
  }, [slug]);

  if (isLoading) return <Loading />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!formData) return null;
  return (
    <PrintUi path="/discharge/create">
      {/* Compact Hospital Header */}
      <div className="w-full flex justify-between items-center px-6 py-2 border-b-2 border-black ">
        {/* Left Side - Logo and Name */}
        <div className="flex items-center space-x-4">
          <Image
            width={120}
            height={120}
            src={hospitalInfo?.logo}
            alt="Hospital Logo"
            className="h-auto"
          />
          <div>
            <h1 className="text-3xl font-bold text-blue-900">
              {hospitalInfo?.hospital_name}
            </h1>
            <p className="bg-blue-900 text-white px-2 py-1 text-sm font-semibold rounded-md w-fit mt-1">
              Lic No: {hospitalInfo?.licence_number}
            </p>
          </div>
        </div>

        {/* Right Side - Contact Details */}
        <div className="text-right text-sm text-gray-700 leading-tight">
          <p>{hospitalInfo?.address}</p>
          <p>
            <span className="font-semibold">Helpline:</span>{" "}
            {hospitalInfo?.phone}
          </p>
          <p>
            <span className="font-semibold">GST:</span>{" "}
            {hospitalInfo?.gst_number}
          </p>
          <p className="text-blue-900">{hospitalInfo?.email}</p>
        </div>
      </div>

      {/* Compact Main Content */}
      <main className="p-2 space-y-3 text-xs">
        <section className="space-y-2">
          <h2 className="text-lg font-bold border-b border-black pb-1">
            Discharge Summary
          </h2>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-1 border rounded">
              <h3 className="font-semibold text-[11px] border-b pb-1">
                Patient Details
              </h3>
              <div className="text-[11px] space-y-0.5 mt-1">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {formData.patient?.fullname}
                </p>
                <p>
                  <span className="font-medium">Contact:</span>{" "}
                  {formData.patient?.phone_number}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  <p>
                    <span className="font-medium">MRD:</span> {formData?.mrd_id}
                  </p>
                  <p>
                    <span className="font-medium">REG ID:</span>{" "}
                    {formData?.reg_id}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-1 border rounded">
              <h3 className="font-semibold text-[11px] border-b pb-1">
                Address
              </h3>
              <p className="text-[11px] mt-1">{formData?.patient?.address}</p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">Consultant</h3>
            <p className="whitespace-pre-wrap border rounded p-1 text-[11px]">
              {formData?.consultant?.drname}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Final Diagnosis</h3>
              <p className="whitespace-pre-wrap border rounded p-1 text-[11px]">
                {formData?.final_diagnosis}
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Discharge Summary</h3>
              <p className="whitespace-pre-wrap border rounded p-1 text-[11px]">
                {formData?.discharge_summary}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-1 border rounded">
              <h4 className="font-medium text-[11px]">Condition</h4>
              <p className="text-[11px]">{formData?.condition || "N/A"}</p>
            </div>
            <div className="p-1 border rounded">
              <h4 className="font-medium text-[11px]">Surgery</h4>
              <p className="text-[11px]">{formData?.surgery || "N/A"}</p>
            </div>
            <div className="p-1 border rounded">
              <h4 className="font-medium text-[11px]">Discharge Date</h4>
              <p className="text-[11px]">
                {formatDate(formData?.discharge_date)} {formData?.discharge_time}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-sm">Advice</h3>
            <p className="whitespace-pre-wrap border rounded p-1 text-[11px]">
              {formData.advice}
            </p>
          </div>
        </section>

        {/* Compact Footer */}
        <div className="mt-1 pt-1 border-t border-black">
          <div className="flex justify-between items-center text-[10px] text-gray-600">
            <p>Thank you for choosing {hospitalInfo?.hospital_name}</p>
            <div className="text-center">
              <div className="mt-4 w-32 border-b border-black"></div>
              <p> Signature by Staff</p>
            </div>
          </div>
        </div>
      </main>
    </PrintUi>
  );
};

export default withAuth(DischargePrint);

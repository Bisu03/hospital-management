"use client"

import apiRequest from "@/services/apiRequest";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [hospitalInfo, setHospitalInfo] = useState({});

  const getHospitalInfo = async () => {
    try {
      const { data } = await apiRequest.get("/admin/hospital");
      setHospitalInfo(data?.data || {});
    } catch (error) {
      console.error("Error fetching hospital data:", error);
    }
  };

  useEffect(() => {
    getHospitalInfo();
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-4">
      <div className="max-w-4xl w-full p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl">
        {/* Hospital Header Section */}
        <div className="text-center mb-8">
          {hospitalInfo?.logo && (
            <img
              src={hospitalInfo?.logo}
              alt="Hospital Logo"
              className="h-20 w-20 mx-auto mb-4 rounded-full"
            />
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {hospitalInfo?.hospital_name}
          </h1>
          <p className="text-gray-600 mt-2">
            {hospitalInfo?.address} | {hospitalInfo?.dist}, PIN: {hospitalInfo?.pin}
          </p>
        </div>

        {/* Contact Information Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <InfoItem label="Phone" value={hospitalInfo?.phone} />
            <InfoItem label="Email" value={hospitalInfo?.email} />
            <InfoItem label="Hospital Code" value={hospitalInfo?.hospital_code} />
          </div>
          <div className="space-y-2">
            <InfoItem label="GST Number" value={hospitalInfo?.gst_number} />
            <InfoItem label="License Number" value={hospitalInfo?.licence_number} />
            <InfoItem label="PAN" value={hospitalInfo?.pan} />
          </div>
        </div>

        {/* System Configuration */}
        <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-600">
          <span>Language: {hospitalInfo?.language}</span>
          <span>Timezone: {hospitalInfo?.timezone}</span>
          <span>Currency: {hospitalInfo?.currency_symbol} ({hospitalInfo?.currency})</span>
        </div>

        {/* Dashboard CTA */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/patient/record"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md"
          >
            Access Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ label, value }) => (
  <div className="flex items-center">
    <span className="font-medium text-gray-700 w-32">{label}:</span>
    <span className="text-gray-600">{value || 'N/A'}</span>
  </div>
);

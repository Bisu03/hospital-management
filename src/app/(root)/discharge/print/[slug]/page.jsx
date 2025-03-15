"use client";

import Loading from '@/components/Loading';
import PrintUi from '@/components/ui/PrintUi';
import { useHospital } from '@/context/setting/HospitalInformation';
import { withAuth } from '@/services/withAuth';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { formatDate } from '@/lib/formateDate';
import { fetchData } from '@/services/apiService';

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
        const { data } = await fetchData(`/discharge?reg_id=${slug}`);
        setFormData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching discharge:', err);
        setError('Failed to load discharge details');
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
    <PrintUi path="/discharge">
      {/* Hospital Header */}
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
            <h1 className="text-3xl font-bold text-black">
              {hospitalInfo?.hospital_name}
            </h1>
            <p className="text-sm text-black py-1 rounded-md mt-2">
              Lic No: {hospitalInfo?.licence_number}
            </p>
          </div>
        </div>

        <div className="text-right text-sm text-gray-700 leading-tight">
          <p>{hospitalInfo?.address}</p>
          <p>
            <span className="font-semibold">Helpline:</span> {hospitalInfo?.phone}
          </p>
          <p>
            <span className="font-semibold">GST:</span> {hospitalInfo?.gst_number}
          </p>
          <p className="text-black">{hospitalInfo?.email}</p>
          <p className="text-black font-semibold">For Appoinment:9002296279</p>
          <p className="text-black ">Call 09:00 AM To 03:00 PM (Except Saturday)</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Patient Details Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold print:text-lg">Discharge Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
            {/* Patient Information */}
            <div className="space-y-2 p-3 border rounded-lg">
              <h3 className="font-semibold text-sm border-b pb-1">Patient Details</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Name:</span> {formData.patient?.fullname}</p>
                <p><span className="font-medium">Contact:</span> {formData.patient?.phone_number}</p>
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="font-medium">MRD:</span> {formData.mrd_id}</p>
                  <p><span className="font-medium">REG ID:</span> {formData.reg_id}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-2 p-3 border rounded-lg">
              <h3 className="font-semibold text-sm border-b pb-1">Address Details</h3>
              <div className="text-sm space-y-1">
                <p>{formData.patient?.city_vill}</p>
                <p>{formData.patient?.dist}, {formData.patient?.state}</p>
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="font-medium">P.S:</span> {formData.patient?.ps || 'N/A'}</p>
                  <p><span className="font-medium">P.O:</span> {formData.patient?.po || 'N/A'}</p>
                </div>
                <p><span className="font-medium">PIN:</span> {formData.patient?.pincode}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Medical Details Section */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-bold text-lg">Final Diagnosis</h3>
            <p className="whitespace-pre-wrap border rounded p-3">{formData.final_diagnosis}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-lg">Discharge Summary</h3>
            <p className="whitespace-pre-wrap border rounded p-3">{formData.discharge_summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1 p-3 border rounded">
              <h4 className="font-semibold">Condition at Discharge</h4>
              <p>{formData.condition || 'N/A'}</p>
            </div>
            <div className="space-y-1 p-3 border rounded">
              <h4 className="font-semibold">Surgery Performed</h4>
              <p>{formData.surgery || 'N/A'}</p>
            </div>
            <div className="space-y-1 p-3 border rounded">
              <h4 className="font-semibold">Discharge Date & Time</h4>
              <p>{formatDate(formData.discharge_date)} {formData.discharge_time}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-lg">Post-Discharge Advice</h3>
            <p className="whitespace-pre-wrap border rounded p-3">{formData.advice}</p>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="mt-8 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-semibold">Discharge Authorized By:</p>
              <p>{session?.user?.username}</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Hospital Contact:</p>
              <p>{hospitalInfo?.phone}</p>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Thank you for choosing {hospitalInfo?.hospital_name}</p>
            <p className="mt-1">{hospitalInfo?.address}</p>
          </div>
        </footer>
      </main>
    </PrintUi>
  );
};

export default withAuth(DischargePrint);
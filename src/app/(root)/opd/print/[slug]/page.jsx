"use client";

import Loading from "@/components/Loading";
import PrintUi from "@/components/ui/PrintUi";
import { useHospital } from "@/context/setting/HospitalInformation";
import { formatDate } from "@/lib/formateDate";
import { fetchData } from "@/services/apiService";
import { withAuth } from "@/services/withAuth";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const OpdPrint = () => {
  const { data: session } = useSession();
  const { hospitalInfo } = useHospital();
  const { slug } = useParams();
  const [formData, setFormData] = useState({});

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["opddetails", slug], // Unique query key
    queryFn: () => fetchData(`/opd/${slug}`), // Function to fetch data
  });

  useEffect(() => {
    refetch(); // Fetch data when slug changes
  }, [slug]);

  useEffect(() => {
    if (data?.data) {
      setFormData(data.data); // Update form data when data is available
    }
  }, [data]);

  return (
    <>
      {isLoading && <Loading />}

      {/* Declaration */}
      <PrintUi path="/opd/record">
        {/* Main Container */}
        <div className="min-h-[100vh] p-6 flex flex-col justify-between">
          {/* Hospital Header */}
          <div className="w-full flex justify-between items-start mb-2 border-b-2 border-black pb-4">
            <div className="flex items-center gap-4 max-w-96">
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
                  Lic No: {hospitalInfo?.licence_number}
                </p>
              </div>
            </div>

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
              <p className="text-black">{hospitalInfo?.email}</p>
             
            </div>
          </div>

          {/* <div className="flex items-center w-full justify-center mb-2 border-b-2 border-black pb-4">
                        <div className="flex items-center gap-4 w-full max-w-4xl">
              
                            <div className="flex-shrink-0">
                                <Image
                                    src={hospitalInfo?.logo}
                                    alt="Hospital Logo"
                                    width={120}
                                    height={120}
                                    className="h-24 w-24 object-contain"
                                />
                            </div>

                          
                            <div className="flex flex-col text-center flex-grow">
                                <h1 className="text-2xl font-bold text-black">
                                    {hospitalInfo?.hospital_name}
                                </h1>
                                <p className="text-sm text-gray-600">{hospitalInfo?.address}</p>
                                <p className="text-sm text-gray-600">
                                    Lic No: {hospitalInfo?.licence_number}
                                </p>
                                <p className="text-black">{hospitalInfo?.email}</p>
                                <p className="text-black font-semibold">For Appointment: 9002296279</p>
                                <p className="text-black">
                                    Call 09:00 AM To 03:00 PM (Except Saturday)
                                </p>
                            </div>
                        </div>
                    </div> */}

          <div className="flex justify-between border-b border-black">
            <div className=" text-sm space-y-1">
              <div>
                <span className="font-semibold">MRD ID:</span>{" "}
                {formData?.mrd_id}
              </div>
              <div>
                <span className="font-semibold">Full Name:</span>{" "}
                {formData?.patient?.fullname}
              </div>
              <div>
                <span className="font-semibold">Sex:</span>{" "}
                {formData?.patient?.gender}
              </div>
              <div>
                <span className="font-semibold">Address:</span>{" "}
                {formData?.patient?.address}
              </div>
            </div>

            <div className="text-sm space-y-1">
              <div>
                <span className="font-semibold">Date & Time:</span>{" "}
                {formatDate(formData?.consultant_date)}{" "}
                {formData?.consultant_time}
              </div>
              <div>
                <span className="font-semibold">Age:</span>{" "}
                {formData?.patient?.age}
              </div>
              <div>
                <span className="font-semibold">Contact No.:</span>{" "}
                {formData?.patient?.phone_number}
              </div>
            </div>
          </div>
          <div className="flex justify-between border-b border-black">
            <div className=" text-sm space-y-1">
              <div>
                <span className="font-semibold">Department:</span>{" "}
                {formData?.consultant?.category}
              </div>
            </div>

            <div className="text-sm space-y-1">
              <div>
                <span className="font-semibold">Consltant:</span>{" "}
                {formData?.consultant?.drname} <br />
                {formData?.consultant?.drinfo}
              </div>
              {formData?.consultant?.regno && (
                <div>
                  <span className="font-semibold"> Reg No.:</span>
                  {formData?.consultant?.regno}
                </div>
              )}
              {formData?.consultant?.contact && (
                <div>
                  <span className="font-semibold"> Contact No.:</span>
                  {formData?.consultant?.contact}
                </div>
              )}
              {formData?.consultant?.email && (
                <div>
                  <span className="font-semibold"> Email:</span>
                  {formData?.consultant?.email}
                </div>
              )}
            </div>
          </div>

          {/* Patient Details Header */}
          {/* <div className="bg-gray-100 p-4 rounded-lg mb-6">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div className="text-lg">
                                <span className="font-bold">Name:</span>{" "}
                                {formData?.patient?.fullname}
                            </div>
                            <div className="flex gap-6">
                                <div>
                                    <span className="font-bold">Age:</span>{" "}
                                    {formData?.patient?.age}
                                </div>
                                <div>
                                    <span className="font-bold">Sex:</span>{" "}
                                    {formData?.patient?.gender}
                                </div>
                                <div>
                                    <span className="font-bold">Date:</span>{" "}
                                    {formatDate(formData?.consultant_date)}
                                </div>
                                <div>
                                    <span className="font-bold">Time:</span>{" "}
                                    {formatDate(formData?.consultant_time)}
                                </div>
                            </div>
                        </div>
                    </div> */}

          {/* Main Content */}
          <div className="flex flex-1 gap-8 mt-2">
            {/* Left Column - Clinical Findings */}
            <div>
              <div className="flex w-full space-x-6 item-center ">
                
                <div className="w-72 text-lg">
                  <span className="font-semibold">Complain:</span>
                  <span >{formData.present_complain}</span>
                </div>
                <h1 className="text-lg font-semibold">Advice</h1>
              </div>
            </div>
          </div>

          {/* Doctor Footer */}
          <div className="mt-8 border-t-2 border-black pt-10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs">
                  In case of any emergency contact to youre nearest hospital .
                </p>
              </div>

              <div className="text-center">
                <div className="mb-2 h-1 w-48 border-b-2 border-black"></div>
                <p className="text-sm">Consultant Signature</p>
              </div>
            </div>
          </div>
        </div>
      </PrintUi>
    </>
  );
};

export default withAuth(OpdPrint);

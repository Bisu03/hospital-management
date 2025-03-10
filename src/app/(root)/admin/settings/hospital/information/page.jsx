"use client"

import { lazy, Suspense, useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";

import Tab from "@/components/Tab";
import { TabLinks } from "@/utils/tablinks";
import Loading from "@/components/Loading";
import Heading from "@/components/Heading";
import HospitalInfoCard from "@/components/component/HospitalInfo";
import { withAuth } from "@/services/withAuth";
import apiRequest from "@/services/apiRequest";
import { ErrorHandeling } from "@/utils/errorHandling";
import Link from "next/link";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const CreateInformation = () => {
  const [HospitalInfo, setHospitalInfo] = useState({})

  const getHospitalInfo = async () => {
    try {
      const { data } = await apiRequest.get('/admin/hospital')
      setHospitalInfo(data?.data)
    } catch (error) {
      ErrorHandeling(error)
    }
  }

  useEffect(() => {
    getHospitalInfo()
  }, [])


  return (
    <>
      <Suspense fallback={<Loading />}>
        <div className="flex flex-wrap w-full justify-between">
          <Tab tabs={TabLinks} category="Setting" />
          <MiddleSection>
            <div className="w-full">
              <Heading heading="Hospital Information">
                <Link href="/admin/settings/hospital/upadateinformation" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded flex items-center">
                  <MdEdit className="mr-2" />
                  Edit
                </Link >
              </Heading>
            </div>
            <HospitalInfoCard {...HospitalInfo} />
          </MiddleSection>
        </div>
      </Suspense>
    </>
  );
};

export default withAuth(CreateInformation);

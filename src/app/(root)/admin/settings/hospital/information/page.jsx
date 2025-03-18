"use client";

import { lazy, Suspense } from "react";
import { MdEdit } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

import Tab from "@/components/Tab";
import { TabLinks } from "@/utils/tablinks";
import Loading from "@/components/Loading";
import Heading from "@/components/Heading";
import HospitalInfoCard from "@/components/component/HospitalInfo";
import { withAuth } from "@/services/withAuth";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const fetchHospitalInfo = async () => {
  const { data } = await axios.get("/api/v1/admin/hospital");
  return data?.data;
};

const CreateInformation = () => {
  const { data: HospitalInfo, isLoading, error } = useQuery({
    queryKey: ["hospitalInfo"],
    queryFn: fetchHospitalInfo,
    staleTime: 60000, // Cache data for 1 minute
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading hospital information.</div>;

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-wrap w-full justify-between">
        <Tab tabs={TabLinks} category="Setting" />
        <MiddleSection>
          <div className="w-full">
            <Heading heading="Hospital Information">
              <Link 
                href="/admin/settings/hospital/upadateinformation" 
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded flex items-center"
              >
                <MdEdit className="mr-2" />
                Edit
              </Link>
            </Heading>
          </div>
          <HospitalInfoCard {...HospitalInfo} />
        </MiddleSection>
      </div>
    </Suspense>
  );
};

export default withAuth(CreateInformation);
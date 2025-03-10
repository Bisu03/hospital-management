"use client";

import Loading from "@/components/Loading";
import { withAuth } from "@/services/withAuth";
import Link from "next/link";
import React, { lazy, Suspense, useState } from "react";
import { FaRegistered } from "react-icons/fa";
import { MdBedroomParent, MdDashboard } from "react-icons/md";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const Menu = () => {

    const links = [
        { href: "   ", icon: <MdDashboard size={60} />, label: "Daily Report" },
        { href: "/patient/record", icon: <FaRegistered size={60} />, label: "Patient Record" },
        { href: "/ipd/admit", icon: <MdBedroomParent size={60} />, label: "IPD" },
        { href: "/opd/admit", icon: <MdBedroomParent size={60} />, label: "OPD" },
    ];

    return (
        <>
            <Suspense fallback={<Loading />}>
                <div className="flex flex-wrap w-full justify-between">
                    <MiddleSection>
                        <div className="flex w-full justify-center gap-6 md:gap-12 lg:gap-16">
                            {links.map(({ href, icon, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="flex flex-col items-center justify-center p-4  hover:scale-105 transition-transform duration-300"
                                >
                                    <div className="text-primary">{icon}</div>
                                    <p className="mt-2 text-lg font-semibold text-gray-700">{label}</p>
                                </Link>
                            ))}
                        </div>
                    </MiddleSection>
                </div>
            </Suspense>
        </>
    );
};

export default withAuth(Menu);

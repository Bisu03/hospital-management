"use client"

import { fetchData } from "@/services/apiService";
import { createContext, useContext, useEffect, useState } from "react";

const HospitalContext = createContext();

export const HospitalProvider = ({ children }) => {
    const [hospitalInfo, setHospitalInfo] = useState({});

    const getHospitalInfo = async () => {
        try {
            const response = await fetchData("/admin/hospital");
            setHospitalInfo(response?.data || {});
        } catch (error) {
            console.error("Error fetching hospital data:", error);
        }
    };

    useEffect(() => {
        getHospitalInfo();
    }, []);

    return (
        <HospitalContext.Provider value={{ hospitalInfo, setHospitalInfo }}>
            {children}
        </HospitalContext.Provider>
    );
};

export const useHospital = () => useContext(HospitalContext);

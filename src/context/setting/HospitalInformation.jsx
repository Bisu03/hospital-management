"use client"
import apiRequest from "@/services/apiRequest";
import { createContext, useContext, useEffect, useState } from "react";

const HospitalContext = createContext();

export const HospitalProvider = ({ children }) => {
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
        <HospitalContext.Provider value={{ hospitalInfo, setHospitalInfo }}>
            {children}
        </HospitalContext.Provider>
    );
};

export const useHospital = () => useContext(HospitalContext);

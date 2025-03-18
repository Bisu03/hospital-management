"use client";

import { fetchData } from "@/services/apiService";
import { createContext, useContext, useEffect, useState, useMemo } from "react";

const HospitalContext = createContext();

export const HospitalProvider = ({ children }) => {
    const [hospitalInfo, setHospitalInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const getHospitalInfo = async () => {
        try {
            setLoading(true);
            const response = await fetchData("/admin/hospital");
            if (response?.data && JSON.stringify(response.data) !== JSON.stringify(hospitalInfo)) {
                setHospitalInfo(response.data);
            }
        } catch (error) {
            console.error("Error fetching hospital data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getHospitalInfo();
    }, []);

    const value = useMemo(() => ({ hospitalInfo, setHospitalInfo, loading }), [hospitalInfo, loading]);

    return (
        <HospitalContext.Provider value={value}>
            {children}
        </HospitalContext.Provider>
    );
};

export const useHospital = () => useContext(HospitalContext);

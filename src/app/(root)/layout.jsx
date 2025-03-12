import ResponsiveSidebar from "@/components/Sidebar";
import { PatientProvider } from "@/context/patientdetails/PatientDetails";

export default function Layout({ children }) {
  return (
    <>
      <PatientProvider>
        <ResponsiveSidebar>{children}</ResponsiveSidebar>
      </PatientProvider>
    </>
  );
}

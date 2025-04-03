import { BiChart } from "react-icons/bi";
import { FaCartPlus, FaClinicMedical, FaMoneyBill, FaRegistered, FaXRay } from "react-icons/fa";
import { ImLab } from "react-icons/im";
import {
  MdAdminPanelSettings,
  MdBed,
  MdBedroomParent,
  MdDashboard,
  MdGraphicEq,
  MdMedicalServices,
  MdMedication,
  MdPostAdd,
  MdReport,
  MdRestore,
} from "react-icons/md";

export const NavLinks = [
  {
    icon: <MdDashboard />,
    category: "Dashboard",
    routes: [
      {
        name: "Summary",
        path: "/dashboard/menu",
      },
    ],
  },
  {
    icon: <MdBedroomParent />,
    category: "IPD",
    routes: [
      {
        name: "IPD Admission",
        path: "/ipd/admit",
      },
      {
        name: "IPD Record",
        path: "/ipd/record",
      },
      {
        name: "IPD Service & Billing",
        path: "/ipd/ipdservice",
      },
      {
        name: "Billing Record",
        path: "/ipd/billrecord",
      },
      {
        name: "Discharge",
        path: "/discharge/create",
      },
      {
        name: "Discharge Record",
        path: "/discharge/record",
      },
    ],
  },
  {
    icon: < FaClinicMedical />,
    category: "OPD",
    routes: [
      {
        name: "OPD Admission",
        path: "/opd/admit",
      },
      {
        name: "OPD Record",
        path: "/opd/record",
      },
    ],
  },
  {
    icon: < ImLab />,
    category: "Labtest",
    routes: [
      {
        name: "Labtest Test",
        path: "/labtest/create",
      },
      {
        name: "Labtest Record",
        path: "/labtest/record",
      },
      {
        name: "Lab Reading",
        path: "/labtest/reading",
      },
    ],
  },
  {
    icon: < MdMedication />,
    category: "Doctor Summary",
    routes: [
      {
        name: "OPD Summary",
        path: "/doctorsummary/opd",
      },
      {
        name: "IPD Summary",
        path: "/doctorsummary/ipd",
      },
    ],
  },

  {
    icon: <BiChart />,
    category: "Report",
    routes: [
      {
        name: "IPD Report",
        path: "/report/ipd",
      },
      {
        name: "OPD Report",
        path: "/report/opd",
      },
      {
        name: "LAB Report",
        path: "/report/lab",
      },
    ],
  },
  {
    icon: <MdBed />,
    category: "Bed",
    routes: [
      {
        name: "Bed Record",
        path: "/bedmanagement/bedrecord",
      },
      {
        name: "Category Record",
        path: "/bedmanagement/categoryrecord",
      },
    ],
  },
  {
    icon: <MdAdminPanelSettings />,
    category: "Admin",
    routes: [
      {
        name: "Hospital Information",
        path: "/admin/settings/hospital/information",
      },
      {
        name: "Medicine",
        path: "/admin/medicine",
      },
      {
        name: "Services",
        path: "/admin/services",
      },
      {
        name: "Pathology",
        path: "/admin/pathology/record",
      },
      {
        name: "Radiology",
        path: "/admin/radiology/record",
      },
    ],
  },
];

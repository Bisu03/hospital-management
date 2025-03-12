import { FaCartPlus, FaClinicMedical, FaMoneyBill, FaRegistered } from "react-icons/fa";
import {
  MdAdminPanelSettings,
  MdBed,
  MdBedroomParent,
  MdDashboard,
  MdGraphicEq,
  MdMedicalServices,
  MdPostAdd,
  MdRestore,
} from "react-icons/md";

export const NavLinks = [
  {
    icon: <MdDashboard />,
    category: "Dashboard",
    routes: [
      {
        name: "Menu",
        path: "/dashboard/menu",
      },
    ],
  },
  {
    icon: <FaRegistered />,
    category: "Patient",
    routes: [
      {
        name: "Patient Record",
        path: "/patient/record",
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
    icon: < FaMoneyBill />,
    category: "Billing",
    routes: [
      {
        name: "Billing",
        path: "/billing/makebills",
      },
      // {
      //   name: "Bill Record",
      //   path: "/opd/record",
      // },
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
        name: "Services",
        path: "/admin/services",
      },
    ],
  },
];

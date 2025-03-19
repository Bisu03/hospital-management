import { FaCartPlus, FaClinicMedical, FaMoneyBill, FaRegistered, FaXRay } from "react-icons/fa";
import { ImLab } from "react-icons/im";
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
  // {
  //   icon: <FaRegistered />,
  //   category: "Patient",
  //   routes: [
  //     {
  //       name: "Patient Record",
  //       path: "/patient/record",
  //     },
  //   ],
  // },
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
        name: "IPD Service",
        path: "/ipd/ipdservice",
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
        name: "Pathology Reading",
        path: "/labtest/reading",
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
      {
        name: "Bill Record",
        path: "/billing/record",
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

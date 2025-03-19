// utils/tablinks.ts
export const TabLinks = [
  {
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
    category: "Pathology",
    routes: [
      {
        name: "Category Record",
        path: "/admin/pathology/category",
      },
      {
        name: "Pathology Record",
        path: "/admin/pathology/record",
      },
    ],
  },
  {
    category: "Setting",
    routes: [
      {
        name: "Hospital Information",
        path: "/admin/settings/hospital/information",
      },
      {
        name: "User Permission",
        path: "/admin/settings/users",
      },
      {
        name: "Doctor",
        path: "/doctor",
      },
      // {
      //   name: "Department",
      //   path: "/admin/settings/department",
      // },
      // {
      //   name: "Modules",
      //   path: "/admin/settings/module",
      // },
    ],
  },
  {
    category: "Services",
    routes: [
      {
        name: "Service Category",
        path: "/admin/services/categoryrecord",
      },
      {
        name: "Service Record",
        path: "/admin/services",
      },
    ],
  },
  {
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
    category: "Reports",
    routes: [
      {
        name: "Daily Report",
        path: "/admin/reports/daily",
      },
      {
        name: "Monthly Report",
        path: "/admin/reports/monthly",
      },
      {
        name: "Yearly Report",
        path: "/admin/reports/yearly",
      },
    ],
  },
  // Add more categories and routes as needed
];

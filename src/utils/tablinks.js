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
    category: "Pathology Patient",
    routes: [
      {
        name: "Pathology Test",
        path: "/pathology/create",
      },
      {
        name: "Pathology Reading",
        path: "/pathology/reading",
      },
      {
        name: "Pathology Record",
        path: "/pathology/record",
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

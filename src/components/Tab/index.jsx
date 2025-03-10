"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Tab = ({ tabs, category }) => {
  const pathname = usePathname();

  // Check if `tabs` is an array
  if (!Array.isArray(tabs)) {
    console.error("Expected `tabs` to be an array, but got:", tabs);
    return null; // Or handle this case as needed
  }

  return (
    <div className="border w-auto h-auto lg:mx-4 md:mx-4 mx-2 my-5 bg-white flex flex-wrap justify-start">
      {tabs
        .filter((data) => data.category === category)
        .flatMap((data) =>
          data.routes.map((route, index) => (
            <Link
              href={route.path}
              key={index}
              className={`btn rounded-none  ${
                pathname === route.path ? "bg-black text-white hover:text-black " : ""
              }`}
            >
              {route.name}
            </Link>
          ))
        )}
    </div>
  );
};

export default Tab;

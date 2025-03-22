"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const Tab = ({ tabs, category }) => {
  const pathname = usePathname();
  const tabRefs = useRef([]);

  if (!Array.isArray(tabs)) {
    console.error("Expected `tabs` to be an array, but got:", tabs);
    return null;
  }

  // Get filtered tabs once
  const filteredTabs = tabs
    .filter((data) => data.category === category)
    .flatMap((data) => data.routes);

  useEffect(() => {
    // Set focus to the active tab on initial load
    const activeIndex = filteredTabs.findIndex((tab) => tab.path === pathname);
    if (activeIndex >= 0) {
      tabRefs.current[activeIndex]?.focus();
    }
  }, [pathname]);

  const handleKeyDown = (event, index) => {
    if (!event.altKey) return; // Only handle Alt+Arrow combinations

    const { key } = event;
    const lastIndex = filteredTabs.length - 1;

    if (key === "ArrowLeft" || key === "ArrowRight") {
      event.preventDefault();
      let newIndex = index;

      if (key === "ArrowLeft") {
        newIndex = index <= 0 ? lastIndex : index - 1;
      } else {
        newIndex = index >= lastIndex ? 0 : index + 1;
      }

      tabRefs.current[newIndex]?.focus();
    }
  };

  return (
    <div
      className="border w-auto h-auto lg:mx-4 md:mx-4 mx-2 my-5 bg-white flex flex-wrap justify-start"
      role="tablist"
      aria-label="Navigation tabs"
    >
      {filteredTabs.map((route, index) => {
        const isActive = pathname === route.path;
        return (
          <Link
            ref={(el) => (tabRefs.current[index] = el)}
            href={route.path}
            key={index}
            role="tab"
            aria-selected={isActive}
            className={`btn btn-sm rounded-none ${isActive ? "bg-black text-white hover:!text-white" : ""
              }`}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={isActive ? 0 : -1}
            aria-controls={`tabpanel-${index}`}
          >
            {route.name} <br /> or Alt + `&gt;`
          </Link>
        );
      })}
    </div>
  );
};

export default Tab;
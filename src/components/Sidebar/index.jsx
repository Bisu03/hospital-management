"use client";
import * as React from "react";
import {
  MdMenu,
  MdExpandMore,
  MdAccountCircle,
  MdLogout,
  MdDashboard,
} from "react-icons/md";
import { ImCross } from "react-icons/im";
import { useSession, signOut } from "next-auth/react";
import { NavLinks } from "@/utils/navlinks";
import Link from "next/link";
import { useHospital } from "@/context/setting/HospitalInformation";
import { FaBed } from "react-icons/fa";

export default function ResponsiveSidebar({ children }) {
  const { data: session } = useSession();

  const { hospitalInfo } = useHospital();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const sidebarRef = React.useRef();
  const menuButtonRef = React.useRef();
  const profileButtonRef = React.useRef();
  const profileDropdownRef = React.useRef();

  // Close sidebar and profile menu on outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // For sidebar
      if (isOpen &&
        !sidebarRef.current?.contains(event.target) &&
        !menuButtonRef.current?.contains(event.target)) {
        setIsOpen(false);
      }

      // For profile dropdown
      if (isProfileOpen &&
        !profileButtonRef.current?.contains(event.target) &&
        !profileDropdownRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isProfileOpen]);

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Top Navigation Bar */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                ref={menuButtonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-teal-500/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
                aria-expanded={isOpen}
              >
                <MdMenu className="h-6 w-6 text-white/90 hover:text-white transform transition-transform hover:scale-105" />
              </button>
              <h1 className="text-xl font-bold text-white tracking-tight">
                <span className="bg-white/10 px-3 py-1 rounded-lg">🏥 {hospitalInfo?.hospital_code}</span>
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-6">
              <Link  href="/bedmanagement/bedallotment"  className="flex items-center space-x-2 group focus:outline-none">
                <FaBed className="h-6 w-6 text-white" />
              </Link>
              <Link href="/dashboard/menu" className="flex items-center space-x-2 group focus:outline-none">
                <MdDashboard className="h-6 w-6 text-white" />
              </Link>
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 group focus:outline-none"
                >
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200">
                    <MdAccountCircle className="h-6 w-6 text-white/90" />
                  </div>
                </button>

                {isProfileOpen && (
                  <div
                    ref={profileDropdownRef}
                    className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-black/5"
                  >
                    {/* Profile Info */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {session?.user?.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{session?.user?.username}</p>
                          <p className="text-xs text-gray-500">{session?.user?.role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="p-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          signOut();
                          setIsProfileOpen(false);
                        }}
                        className="btn flex w-full items-center px-3 py-2.5 text-sm text-red-600 hover:bg-red-50/80 rounded-lg transition-colors"
                      >
                        <MdLogout className="mr-2 h-5 w-5" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 z-20 bg-teal-800 text-white transform transition-all duration-300 shadow-xl ${isOpen ? "translate-x-0 w-64" : "-translate-x-full md:w-16"
            }`}
        >
          <nav className="mt-6">
            <div className="flex justify-end px-4">
              <ImCross
                className="h-6 w-6 cursor-pointer hover:text-teal-200"
                onClick={() => setIsOpen(false)}
              />
            </div>
            <ul className="space-y-1">
              {NavLinks.map((item, index) => (
                <li key={index}>
                  <details className="group">
                    <summary className="flex cursor-pointer items-center px-4 py-3 hover:bg-teal-700 transition-colors">
                      <span className="text-xl">{item.icon}</span>
                      <span className={`ml-3 ${isOpen ? "" : "md:hidden"}`}>
                        {item.category}
                      </span>
                      <MdExpandMore className={`ml-auto transform transition-transform ${isOpen ? "" : "md:hidden"
                        } group-open:rotate-180`} />
                    </summary>
                    <ul className="mt-1 ml-4 border-l-2 border-teal-600">
                      {item.routes.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            href={subItem.path}
                            className="block px-4 py-2.5 text-sm hover:bg-teal-700 transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/30 md:hidden transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Main content */}
        <main className={`w-full h-full overflow-auto transition-all duration-300 ${isOpen ? "ml-0 md:ml-16" : ""
          }`}>
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
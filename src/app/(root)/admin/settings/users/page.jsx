"use client";

import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import Tab from "@/components/Tab";
import FixedLayout from "@/components/ui/FixedLayout";
import apiRequest from "@/services/apiRequest";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import { SuccessHandling } from "@/utils/successHandling";
import { TabLinks } from "@/utils/tablinks";
import axios from "axios";
import React, { lazy, Suspense, useEffect, useReducer, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { MdOutlineLockReset } from "react-icons/md";

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const Users = () => {
  const [UsersInfo, setUsersInfo] = useState({});
  const [UserList, setUserList] = useState([])

  const [isModalOpen, setModalOpen] = useState(false);

  const getUserList = async () => {
    try {
      const { data } = await axios.get('/api/v1/admin/user')
      setUserList(data?.data)
    } catch (error) {
      ErrorHandeling(error)
    }
  }

  useEffect(() => {
    getUserList()
  }, [])

  const handleChange = (e) => {
    setUsersInfo({ ...UsersInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const { data } = await axios.post('/api/v1/admin/user', UsersInfo)
      SuccessHandling(data?.message)
      getUserList()
    } catch (error) {
      ErrorHandeling(error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const { data } = await axios.delete(`/api/v1/admin/user?id=${id}`)
        SuccessHandling(data?.message)
        getUserList()
      } catch (error) {
        ErrorHandeling(error)
      }
    }
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-wrap w-full justify-between">
        <Tab tabs={TabLinks} category="Setting" />
        <MiddleSection>
          <div className="w-full">
            <Heading heading="Users List">
              <FixedLayout btnname="Add User"
                isOpen={isModalOpen}
                onOpen={() => setModalOpen(true)}
                onClose={() => setModalOpen(false)}>
                <div className="w-full  p-6">
                  <div className="space-y-6">
                    {/* Input Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Username Field */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          User Name
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={UsersInfo.username}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-all duration-200 shadow-sm"
                          required
                        />
                      </div>

                      {/* Email Field */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={UsersInfo.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-all duration-200 shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-primary text-white rounded-lg
                 hover:bg-secondary "
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </FixedLayout>
            </Heading>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 ">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {UserList?.map((users) => (
                    <tr key={users._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{users?.username}</td>
                      <td className="px-4 py-3">{users?.email}</td>
                      <td className="w-full flex space-x-3">
                        <button className="text-neutral hover:text-black focus:outline-none p-1" >
                          <MdOutlineLockReset className="h-6 w-6" />
                        </button>
                        <button
                          onClick={() => handleDelete(users?._id)}
                          className="text-error hover:text-black focus:outline-none p-1"
                          aria-label={`Delete ${users?.username}`}
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </MiddleSection>
      </div>
    </Suspense>
  );
};

export default withAuth(Users);

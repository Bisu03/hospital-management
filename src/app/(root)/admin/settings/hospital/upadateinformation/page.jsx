"use client"

import Heading from '@/components/Heading'
import Loading from '@/components/Loading'
import Tab from '@/components/Tab'
import apiRequest from '@/services/apiRequest'
import { withAuth } from '@/services/withAuth'
import { ErrorHandeling } from '@/utils/errorHandling'
import { SuccessHandling } from '@/utils/successHandling'
import { TabLinks } from '@/utils/tablinks'
import Image from 'next/image'
import React, { lazy, Suspense, useEffect, useState } from 'react'

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const UpdateInformation = () => {

  const [HospitalInfo, setHospitalInfo] = useState({})
  const [LogoUpload, setLogoUpload] = useState(null);
  const [BannerUpload, setBannerUpload] = useState(null)

  const handleChange = (e) => {
    setHospitalInfo({ ...HospitalInfo, [e.target.name]: e.target.value });
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleFileInputChangeLogo = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };



  const getHospitalInfo = async () => {
    try {
      const { data } = await apiRequest.get('/admin/hospital')
      setHospitalInfo(data?.data)
      setBannerUpload(data?.data?.banner)
      setLogoUpload(data?.data?.logo)
    } catch (error) {
      ErrorHandeling(error)
    }
  }

  useEffect(() => {
    getHospitalInfo()
  }, [])


  const handleSubmit = async () => {
    try {
      const { data } = await apiRequest.put('/admin/hospital', { ...HospitalInfo, banner: BannerUpload, logo: LogoUpload })
      SuccessHandling(data?.message)
      getHospitalInfo()
    } catch (error) {
      ErrorHandeling(error)
    }
  }

  return (
    <>
      <Suspense fallback={<Loading />}>
        <div className="flex flex-wrap w-full justify-between">
          <Tab tabs={TabLinks} category="Setting" />
          <MiddleSection>
            <div className="w-full">
              <Heading heading="Hospital Information">
              </Heading>
            </div>

            {
              BannerUpload && <div className="flex justify-center w-full bg-accent">
                <Image
                  height={200}
                  width={1000}
                  src={BannerUpload}
                  alt="image"
                  className="w-[1000px] h-[120px]   "
                />
              </div>
            }
            {
              LogoUpload && <div className="flex justify-center w-full bg-accent">
                <Image
                  height={200}
                  width={200}
                  src={LogoUpload}
                  alt="image"
                />
              </div>
            }

            <div className="p-8 space-y-6">
              {/* Hospital Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Banner</label>
                  <input
                    type="file"
                    className="file-input file-input-bordered w-full max-w-xs"
                    onChange={handleFileInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Logo</label>
                  <input
                    type="file"
                    className="file-input file-input-bordered w-full max-w-xs"
                    onChange={handleFileInputChangeLogo}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                  <input
                    type="text"
                    name="hospital_name"
                    value={HospitalInfo.hospital_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"

                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Code</label>
                  <input
                    type="text"
                    name="hospital_code"
                    value={HospitalInfo.hospital_code}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"

                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={HospitalInfo.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    rows="3"

                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={HospitalInfo.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"

                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={HospitalInfo.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"

                    />
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    name="gst_number"
                    value={HospitalInfo.gst_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"

                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                  <input
                    type="text"
                    name="reg_number"
                    value={HospitalInfo.reg_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"

                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Licence Number</label>
                  <input
                    type="text"
                    name="licence_number"
                    value={HospitalInfo.licence_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"

                  />
                </div>
              </div>

              {/* Regional Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    name="language"
                    value={HospitalInfo.language}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    name="timezone"
                    value={HospitalInfo.timezone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option>UTC</option>
                    <option>EST</option>
                    <option>PST</option>
                    <option>CST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <div className="flex gap-2">
                    <select
                      name="currency"
                      value={HospitalInfo.currency}
                      onChange={handleChange}
                      className="w-2/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                      <option>INR</option>
                    </select>
                    <input
                      type="text"
                      name="currency_symbol"
                      value={HospitalInfo.currency_symbol}
                      onChange={handleChange}
                      className="w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"

                    />
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Logo</label>
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0">
                        <img className="h-16 w-16 object-cover rounded-lg" src={HospitalInfo.logo} alt="Hospital logo" />
                      </div>
                      <label className="block">
                        <input
                          type="file"
                          name="logo"
                          onChange={handleChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </label>
                    </div>
                  </div> */}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  className=" bg-primary text-white py-3 px-6 rounded-lg  transition-colors font-semibold"
                >
                  Save Hospital Information
                </button>
              </div>
            </div>


          </MiddleSection>
        </div>
      </Suspense>
    </>
  )
}

export default withAuth(UpdateInformation)

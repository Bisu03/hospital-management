"use client";
import Heading from "@/components/Heading";
import Loading from "@/components/Loading";
import Tab from "@/components/Tab";
import Spinner from "@/components/ui/Spinner";
import { formatDate } from "@/lib/formateDate";
import { fetchData, updateData } from "@/services/apiService";
import { withAuth } from "@/services/withAuth";
import { ErrorHandeling } from "@/utils/errorHandling";
import { SuccessHandling } from "@/utils/successHandling";
import { TabLinks } from "@/utils/tablinks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { FaSave } from "react-icons/fa";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css"; // Import SunEditor styles

const MiddleSection = lazy(() => import("@/components/Middlesection"));

const PathologyReading = () => {
    const [modifiedData, setModifiedData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [ToggleTest, setToggleTest] = useState(true);
    const [content, setContent] = useState("");
    const editor = useRef();

    const queryClient = useQueryClient();
    const router = useRouter();

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["labtestrecord", searchTerm],
        queryFn: () => fetchData(`/labtest/${searchTerm}`),
    });

    const handleChange = (content) => {
        setContent(content);
    };

    const handleImageUploadBefore = (files, info, uploadHandler) => {
        const file = files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = () => {
                const base64 = reader.result;
                uploadHandler({ result: [{ url: base64, name: file.name }] }); // Fix: Ensure proper URL
            };

            reader.readAsDataURL(file); // Convert file to Base64
        }
    };

    const handleBillSearch = async () => {
        refetch();
    };


    useEffect(() => {
        if (data?.data?.pathology_test_cart) {
            const initialData = JSON.parse(
                JSON.stringify(data.data.pathology_test_cart)
            );
            setModifiedData(initialData);
            setContent(data.data.radiology_reading);
        }
    }, [data?.data]);

    const handleReadingChange = (serviceIndex, testIndex, value) => {
        setModifiedData((prev) => {
            const newData = JSON.parse(JSON.stringify(prev));
            newData.services[serviceIndex].related_tests[testIndex].reading_unit =
                value;
            return newData;
        });
    };

    const mutation = useMutation({
        mutationFn: (newItem) => updateData(`/labtest`, searchTerm, newItem),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["labtestrecord"] });
            SuccessHandling(data.message);
            router.push("/labtest/print/" + searchTerm);
        },
        onError: (error) => {
            ErrorHandeling(error);
            console.error("Error updating data:", error);
        },
    });

    const handleSubmit = () => {
        mutation.mutate({
            pathology_test_cart: modifiedData,
            radiology_reading: content,
        });
    };


    useEffect(() => {
        const handleKeyPress = (e) => {
            // Alt+1 for Pathology
            if (e.altKey && e.key === "1") {
                e.preventDefault();
                setToggleTest(true);
            }
            // Alt+2 for Radiology
            else if (e.altKey && e.key === "2") {
                e.preventDefault();
                setToggleTest(false);
            }
            else if (e.key === 'F5') {
                e.preventDefault();
                handleSubmit();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [ToggleTest, handleSubmit]);



    return (
        <Suspense fallback={<Loading />}>
            <div className="flex flex-wrap w-full justify-between">
                <Tab tabs={TabLinks} category="Labtest" />
                <MiddleSection>
                    <div className="w-full p-2 md:p-4">
                        {/* Search Section */}
                        <Heading heading="Pathology Reading">
                            <div className="flex flex-col md:flex-row gap-2 mt-2">
                                <input
                                    type="text"
                                    placeholder="Enter Bill No."
                                    className="p-2 border rounded w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button
                                    onClick={handleBillSearch}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </Heading>

                        {/* Patient Info Section */}
                        {isLoading ? (
                            <Loading />
                        ) : (
                            <div className="w-full bg-white shadow-sm rounded-lg p-4 mt-4">
                                <h1 className="text-xl font-bold text-gray-800 mb-4">
                                    {data?.data?.patient?.fullname || "Patient Details"}
                                </h1>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Patient Info Cards */}
                                    {[
                                        { label: "MRD ID", value: data?.data?.mrd_id },
                                        { label: "Bill No.", value: data?.data?.bill_no },
                                        { label: "Age", value: data?.data?.patient?.age },
                                        { label: "Reporting Date", value: formatDate(data?.data?.reporting_date) },
                                        { label: "Reporting Time", value: data?.data?.reporting_time },
                                        { label: "Referred By", value: data?.data?.patient?.referr_by },
                                    ].map((item, index) => (
                                        item.value && (
                                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                                                <p className="font-medium text-gray-700 truncate">
                                                    {item.value}
                                                </p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Toggle Buttons */}
                        <div className="flex flex-col md:flex-row gap-2 mt-6">
                            <button
                                className={`flex-1 p-2 rounded-lg transition-colors ${ToggleTest
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-200 hover:bg-gray-300"
                                    }`}
                                onClick={() => setToggleTest(true)}
                            >
                                Pathology (Alt+1)
                            </button>
                            <button
                                className={`flex-1 p-2 rounded-lg transition-colors ${!ToggleTest
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-200 hover:bg-gray-300"
                                    }`}
                                onClick={() => setToggleTest(false)}
                            >
                                Radiology (Alt+2)
                            </button>
                        </div>

                        {/* Pathology Section */}
                        {ToggleTest ? (
                            <div className="mt-6 space-y-4">
                                {modifiedData?.services?.map((service, serviceIndex) => (
                                    <div key={service._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                   
                                        <div className="p-4">
                                            {service?.related_tests?.length === 0 ? (
                                                <div className="text-center py-4 text-gray-500">
                                                    No tests available in this category
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {service?.related_tests?.map((test, testIndex) => (
                                                        <div key={test._id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                                            <div className="md:col-span-1">
                                                                <p className="font-medium text-gray-700">
                                                                    {test.pathology_testname}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter reading"
                                                                    className="w-full p-2 border border-gray-500 rounded focus:ring-2 focus:ring-blue-500"
                                                                    value={test.reading_unit || ""}
                                                                    onChange={(e) =>
                                                                        handleReadingChange(
                                                                            serviceIndex,
                                                                            testIndex,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600">{test?.unit}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600">{test?.ref_value}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Radiology Section */
                            <div className="mt-6">
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <SunEditor
                                        ref={editor}
                                        defaultValue={content}
                                        setOptions={{
                                            height: '400px',
                                            buttonList: [
                                                ["bold", "italic", "underline", "strike"],
                                                ["fontSize", "formatBlock"],
                                                ["fontColor", "hiliteColor"],
                                                ["indent", "outdent"],
                                                ["align", "list", "lineHeight"],
                                                ["table", "link", "image"],
                                                ["undo", "redo", "removeFormat"],
                                            ],
                                        }}
                                        onImageUploadBefore={handleImageUploadBefore}
                                        onChange={setContent}
                                        className="rounded-t-lg"
                                    />

                                    <div className="p-4 border-t">
                                        <h3 className="font-semibold mb-2">Preview</h3>
                                        <div
                                            className="sun-editor-editable max-w-none"
                                            dangerouslySetInnerHTML={{ __html: content }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <button
                            className="w-full mt-6 p-3 bg-primary hover:bg-secondary text-white rounded-lg
                            flex items-center justify-center gap-2 transition-colors"
                            onClick={handleSubmit}
                            disabled={mutation.isPending}
                        >
                            <FaSave className="text-lg" />
                            <span>Save Reading</span>
                            <kbd className="hidden md:inline-block px-2 py-1 bg-white/20 rounded">F5</kbd>
                            {mutation.isPending && <Spinner className="ml-2" />}
                        </button>
                    </div>
                </MiddleSection>
            </div>
        </Suspense>
    );
};

export default withAuth(PathologyReading);

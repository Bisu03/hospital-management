import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { set } from 'mongoose';

const PrintUi = ({ children, path }) => {
  const componentRef = useRef();

  const handlePrint = () => {
    if (componentRef.current) {
      const printContent = componentRef.current.outerHTML; // Get the outer HTML of the ref
      const originalContent = document.body.innerHTML; // Save original content
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  // useEffect(
  //   () => {
  //     setTimeout(() => {
  //       handlePrint();
  //     }, 5000)
  //   },
  //   []
  // )

  return (
    <div className="p-4">
      <div
        ref={componentRef}
        className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none"
      >
        {children}
      </div>

      {/* Control Buttons */}
      <div className="mt-6 flex justify-center gap-4 print:hidden">
        <button
          onClick={() => handlePrint('A4')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Print A4
        </button>
        <Link href={path} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
          Back
        </Link>
      </div>
    </div>
  );
};

export default PrintUi;
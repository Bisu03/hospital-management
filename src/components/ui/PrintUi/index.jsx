import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

const PrintUi = ({ children, path }) => {
  const componentRef = useRef();

  const handlePrint = (size) => {
    if (componentRef.current) {
      const printContent = componentRef.current.outerHTML;
      const originalContent = document.body.innerHTML;

      // Create size-specific styles
      const printStyle = `
        <style>
          @page {
            size: ${size};
            margin: 10mm;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .print-content {
              transform: scale(${size === 'A5' ? 0.85 : 1});
            }
          }
        </style>
      `;

      document.body.innerHTML = `
        <div class="print-content">
          ${printStyle}
          ${printContent}
        </div>
      `;

      window.print();
      document.body.innerHTML = originalContent;
    }
  };

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
        <Link
          href={path}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back
        </Link>
      </div>
    </div>
  );
};

export default PrintUi;
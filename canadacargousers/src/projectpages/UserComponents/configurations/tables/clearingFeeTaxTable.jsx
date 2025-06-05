import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-buttons/js/buttons.colVis";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import jszip from "jszip";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

export const ClearingFeeTaxTable = ({ alltaxrates }) => {
  const [taxData, setTaxData] = useState(alltaxrates);
  const [selectedTax, setSelectedTax] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    window.JSZip = jszip;
    if (!tableRef.current) {
      tableRef.current = $("#example").DataTable({
        dom: "Bfrtip",
        buttons: [
          { extend: "copy" },
          "csv",
          "excel",
          { extend: "pdf", orientation: "landscape", pageSize: "LEGAL" },
          "print",
          "colvis",
        ],
        drawCallback: function () {
          $(".dataTables_wrapper .dataTables_scrollBody").css(
            "border",
            "1px solid #ddd"
          );
        },
      });
    }
  }, [taxData]);

  useEffect(() => {
    if (tableRef.current) {
      const mappedData = alltaxrates.map((tax, index) => {
        return [
          index + 1,
          `${Number(tax.oldrate)?.toLocaleString()} %`,
          `${Number(tax.newrate)?.toLocaleString()} %`,
          tax.date,
        ];
      });
      tableRef.current.clear();
      tableRef.current.rows.add(mappedData).draw();
    }
  }, [alltaxrates]);
  const handleCloseModal = () => setShowModal(false);
  return (
    <>
      <div className="rounded-lg border border-slate-50 bg-white p-6 shadow-lg">
        {/* <ToastContainer /> */}
        <div className="overflow-x-auto">
          <table
            id="example"
            border={2}
            className="min-w-full border border-slate-50 divide-y divide-slate-300 pt-5"
          >
            <thead className="bg-slate-50 border-b border-slate-50 ">
              <tr>
                <th className="px-4 py-2 text-center text-sm font-medium text-slate-500">
                  ID
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-slate-500">
                  Old Rate
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-slate-500">
                  New Rate
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-slate-500">
                  Date & Time Changed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-300 ">
              {/* Data will be dynamically updated using DataTables API */}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed top-0 inset-0 bg-[#0000006c] overflow-y-scroll ">
            <div
              className={`bg-opacity-70 flex items-center mt-[140px] mb-[50px] justify-center ${
                showModal ? "block" : "hidden"
              }`}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg !w-screen lg:ml-[150px] max-w-md ">
                <h2 className="text-lg font-semibold mb-4 text-slate-800">
                  Tax Rate Details
                </h2>
                {selectedTax && (
                  <div>
                    <p className="text-sm mb-2">
                      <strong>Old Rate:</strong> {selectedTax.oldRate}
                    </p>
                    <p className="text-sm mb-2">
                      <strong>New Rate:</strong> {selectedTax.newRate}
                    </p>
                    <p className="text-sm mb-2">
                      <strong>Date Changed:</strong> {selectedTax.dateChanged}
                    </p>
                    <p className="text-sm mb-2">
                      <strong>Time Changed:</strong> {selectedTax.timeChanged}
                    </p>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="px-4 py-2 bg-slate-500 text-white rounded-md mr-2"
                        onClick={handleCloseModal}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

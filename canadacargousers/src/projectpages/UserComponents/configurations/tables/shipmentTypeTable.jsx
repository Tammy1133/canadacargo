import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-buttons/js/buttons.colVis";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import jszip from "jszip";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

export const ShipmentTypeTable = ({ alltaxrates, deleteCourier }) => {
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
        columnDefs: [
          {
            targets: -1,
            data: null,
            defaultContent: `
              <div class="flex items-center space-x-2 justify-center view-btn">
                <button class= "text-white px-2 py-1 bg-red-400 rounded-lg view-btn">Delete</button>
              </div>
            `,
          },
        ],
        drawCallback: function () {
          $(".dataTables_wrapper .dataTables_scrollBody").css(
            "border",
            "1px solid #ddd"
          );
        },
      });

      // Event listeners for view button
      $("#example tbody").on("click", ".view-btn", function () {
        const data = tableRef.current.row($(this).parents("tr")).data();

        deleteCourier(data[0]);
      });
    }
  }, [taxData]);

  useEffect(() => {
    if (tableRef.current) {
      const mappedData = alltaxrates.map((tax) => {
        return [tax.name];
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
                  Name
                </th>

                <th className="px-4 py-2 text-center text-sm font-medium text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-300 ">
              {/* Data will be dynamically updated using DataTables API */}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

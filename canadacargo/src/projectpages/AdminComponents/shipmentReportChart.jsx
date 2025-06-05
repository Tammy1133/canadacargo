import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import TitleCard from "../AdminComponents/titlecard";
import { useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

function ShipmentReportChart({ userId, getMonthlyShipments, graphData }) {
  const [userData, setUserData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getMonthlyShipments(selectedYear);
  }, [selectedYear]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  // Updated to use month numbers instead of names
  const labels = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, 3, ..., 12]

  // Generate years dynamically from 2025 to the current year + 1
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2024 + 2 },
    (_, i) => 2025 + i
  );

  // console.log(labels.map(() => Math.random() * 100 + 500));
  // console.log(graphData);

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: "Total Shipments",
        data: graphData,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <>
      <TitleCard title={"Shipment per month"}>
        <div className="flex gap-x-3 ">
          <select
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            value={selectedYear}
            className="block w-[130px] p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <Line data={data} options={options} />
      </TitleCard>
    </>
  );
}

export default ShipmentReportChart;

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  Filler,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import TitleCard from "../AdminComponents/titlecard";

ChartJS.register(ArcElement, Tooltip, Legend, Tooltip, Filler, Legend);

function MyDoughnutChart({ getChartData, chartData }) {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getChartData(Number(month) + 1, year);

    // console.log(month + 1, year);
  }, [month, year]);

  useEffect(() => {
    setLabels(
      chartData?.map((eachData) => {
        return eachData?.shipmentType;
      })
    );
    setUserData({
      shipments: chartData?.map((eachData) => {
        return eachData?.count;
      }),
    });
  }, [chartData]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: ` ${new Date(year, month).toLocaleString("default", {
          month: "long",
        })} ${year}`,
        font: {
          size: 15,
        },
      },
    },
  };

  const [labels, setLabels] = useState([]);

  const data = {
    labels,
    datasets: [
      {
        label: "# of Shipments",
        data: userData.shipments,
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <TitleCard title={"Shipment Types"}>
      <div className="flex gap-x-3 ">
        <select
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {Array.from(
            { length: new Date().getFullYear() + 2 - 2025 + 1 },
            (_, i) => (
              <option key={i} value={2025 + i}>
                {2025 + i}
              </option>
            )
          )}
        </select>
      </div>
      {<Doughnut options={options} data={data} />}
    </TitleCard>
  );
}

export default MyDoughnutChart;

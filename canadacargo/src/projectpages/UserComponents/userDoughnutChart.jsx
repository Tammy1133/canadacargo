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

function UserDoughnutChart({ userId }) {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const generateRandomData = () => {
      return Array.from({ length: 3 }, () => Math.floor(Math.random() * 20));
    };

    setLoading(true);
    const randomData = generateRandomData();
    setUserData({ shipments: randomData });
    setLoading(false);
  }, [month, year]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: ` ${new Date().toLocaleString("default", {
          month: "long",
        })} ${new Date().getFullYear()}`,
        font: {
          size: 15,
        },
      },
    },
  };

  const labels = ["Pending", "In Transit", "Delivered"];

  const data = {
    labels,
    datasets: [
      {
        label: "# of Shipments",
        data: userData.shipments || [0, 0, 0],
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
    <TitleCard title={"User Shipment Status"}>
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
          {Array.from({ length: 5 }, (_, i) => (
            <option key={i} value={2023 - i}>
              {2023 - i}
            </option>
          ))}
        </select>
      </div>
      {loading ? <p>Loading...</p> : <Doughnut options={options} data={data} />}
    </TitleCard>
  );
}

export default UserDoughnutChart;

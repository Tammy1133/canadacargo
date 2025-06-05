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

function UserLineChart({ userId }) {
  const [userData, setUserData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/user/${userId}/stats`);
      const result = await response.json();
      setUserData(result.data);
    };
    fetchData();
  }, [userId]);

  const generateRandomData = () => {
    return labels.map(() => Math.random() * 100 + 500);
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
  ];

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: "User Revenue",
        data: userData.length ? userData : generateRandomData(),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <>
      <TitleCard title={"User Revenue"}>
        <div className="flex gap-x-3 ">
          <select
            onChange={(e) => setSelectedMonth(e.target.value)}
            value={selectedMonth}
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {labels.map((label, index) => (
              <option key={index} value={index}>
                {label}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => setSelectedYear(e.target.value)}
            value={selectedYear}
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {[2020, 2021, 2022, 2023].map((year) => (
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

export default UserLineChart;

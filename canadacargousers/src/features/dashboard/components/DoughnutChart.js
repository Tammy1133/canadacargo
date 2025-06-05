import {
  Chart as ChartJS,
  Filler,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import TitleCard from "../../../components/Cards/TitleCard";
import Subtitle from "../../../components/Typography/Subtitle";

ChartJS.register(ArcElement, Tooltip, Legend, Tooltip, Filler, Legend);

function DoughnutChart() {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: `Shipments by Transport Mode - ${new Date().toLocaleString(
          "default",
          { month: "long" }
        )} ${new Date().getFullYear()}`,
      },
    },
  };

  const labels = [
    "Air Freight",
    "Road Transport",
    "Sea Freight",
    "Rail Transport",
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "# of Shipments",
        data: [145, 423, 267, 89],
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
    <TitleCard title={"Transport Mode Distribution"}>
      <Doughnut options={options} data={data} />
    </TitleCard>
  );
}

export default DoughnutChart;

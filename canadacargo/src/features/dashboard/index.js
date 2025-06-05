import DashboardStats from "./components/DashboardStats";
import AmountStats from "./components/AmountStats";
import PageStats from "./components/PageStats";

import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import CircleStackIcon from "@heroicons/react/24/outline/CircleStackIcon";
import CreditCardIcon from "@heroicons/react/24/outline/CreditCardIcon";
import UserChannels from "./components/UserChannels";

import { useDispatch } from "react-redux";
import { showNotification } from "../common/headerSlice";
import DoughnutChart from "./components/DoughnutChart";
import { useEffect, useState } from "react";
import LineChart from "../charts/components/LineChart";

const statsData = [
  {
    title: "Pending Weighments",
    value: "127",
    icon: <CircleStackIcon className="w-8 h-8" />,
    description: "23 urgent packages",
  },
  {
    title: "Weighments Today",
    value: "342",
    icon: <CreditCardIcon className="w-8 h-8" />,
    description: "↗︎ 45 vs yesterday",
  },
  {
    title: "New Users (Week)",
    value: "156",
    icon: <UserGroupIcon className="w-8 h-8" />,
    description: "↗︎ 32 (20%)",
  },
  {
    title: "Total Users (Month)",
    value: "2.4k",
    icon: <UsersIcon className="w-8 h-8" />,
    description: "↗︎ 412 (17%)",
  },
];

function Dashboard() {
  const dispatch = useDispatch();

  return (
    <>
      {/** ---------------------- Select Period Content ------------------------- */}

      {/** ---------------------- Different stats content 1 ------------------------- */}
      <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
        {statsData.map((d, k) => {
          return <DashboardStats key={k} {...d} colorIndex={k} />;
        })}
      </div>

      {/** ---------------------- Different charts ------------------------- */}
      <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
        <LineChart />
        <div className="h-[300px]">
          <DoughnutChart />
        </div>
      </div>

      {/** ---------------------- Different stats content 2 ------------------------- */}

      <div className="grid lg:grid-cols-2 mt-10 grid-cols-1 gap-6">
        <AmountStats />
        <PageStats />
      </div>
    </>
  );
}

export default Dashboard;

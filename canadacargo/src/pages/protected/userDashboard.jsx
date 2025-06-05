import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import Dashboard from "../../features/dashboard/index";

// import AmountStats from "./components/AmountStats";
// import PageStats from "./components/PageStats";

import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import CircleStackIcon from "@heroicons/react/24/outline/CircleStackIcon";
import CreditCardIcon from "@heroicons/react/24/outline/CreditCardIcon";
// // import UserChannels from "./components/UserChannels";
// // import LineChart from "./components/LineChart";
// import BarChart from "./components/BarChart";
// import DashboardTopBar from "./components/DashboardTopBar";
// import { showNotification } from "../common/headerSlice";
// import DoughnutChart from "./components/DoughnutChart";
import { useState } from "react";
import DashboardStats from "../../features/dashboard/components/DashboardStats";
import DoughnutChart from "../../features/dashboard/components/DoughnutChart";
import LineChart from "../../features/dashboard/components/LineChart";
import AmountStats from "../../features/dashboard/components/AmountStats";
import PageStats from "../../features/dashboard/components/PageStats";

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

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Dashboard" }));
  }, []);

  return (
    <>

      <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
        {statsData.map((d, k) => {
          return <DashboardStats key={k} {...d} colorIndex={k} />;
        })}
      </div>

      <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
        <LineChart />
        <div className="h-[300px]">
          <DoughnutChart />
        </div>
      </div>


      <div className="grid lg:grid-cols-2 mt-10 grid-cols-1 gap-6">
        <AmountStats />
        <PageStats />
      </div>
    </>
  );
}

export default InternalPage;

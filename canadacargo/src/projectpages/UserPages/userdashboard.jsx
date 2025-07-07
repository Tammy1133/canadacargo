import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import CircleStackIcon from "@heroicons/react/24/outline/CircleStackIcon";
import CreditCardIcon from "@heroicons/react/24/outline/CreditCardIcon";
import HeartIcon from "@heroicons/react/24/outline/HeartIcon";
import BoltIcon from "@heroicons/react/24/outline/BoltIcon";

import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";

import { setPageTitle } from "../../features/common/headerSlice";
import MyLineChart from "../AdminComponents/mylineChart";
import MyDoughnutChart from "../AdminComponents/myDonoughNutChart";
import { getUserDetails } from "../../projectcomponents/auth";
import axios from "axios";
import { IsCanada } from "../../utils/globalConstantUtil";

function UserDashboard() {
  const dispatch = useDispatch();

  const [userToken, setUserToken] = useState(() => getUserDetails()?.token);
  const [pageStats, setPageStats] = useState({
    arrivedItemsCount: 0,
    itemsInTransitCount: 0,
    monthlyRevenue: 0,
    outOfOfficeCount: 0,
    pendingPaymentsCount: 0,
    yearlyRevenue: 0,
    lastMonthRevenue: 0,
  });
  const [graphData, setGraphData] = useState([]);
  const [chartData, setChartData] = useState([]);

  const statsData = [
    {
      title: "Pending Payments",
      value: pageStats?.pendingPaymentsCount,
      icon: <UsersIcon className="w-8 h-8" />,
      description: "23 urgent packages",
    },
    {
      title: "Items Out Of Office",
      value: pageStats?.outOfOfficeCount,
      icon: <UsersIcon className="w-8 h-8" />,
      description: "23 urgent packages",
    },

    {
      title: "In Transit",
      value: pageStats?.itemsInTransitCount,
      icon: <CircleStackIcon className="w-8 h-8" />,
      description: "↗︎ 45 vs yesterday",
    },
    {
      title: "Items Not Yet Delivered",
      value: pageStats?.arrivedItemsCount,
      icon: <CircleStackIcon className="w-8 h-8" />,
      description: "↗︎ 45 vs yesterday",
    },

    {
      title: "Revenue this month",
      value: `${IsCanada ? "$" : "₦"} ${Number(
        pageStats?.monthlyRevenue
      )?.toLocaleString()}`,
      icon: <BoltIcon className="w-8 h-8" />,
      description: "↗︎ 45 vs yesterday",
    },
    {
      title: "Revenue this year",
      value: `${IsCanada ? "$" : "₦"} ${Number(
        pageStats?.yearlyRevenue
      )?.toLocaleString()}`,
      icon: <CreditCardIcon className="w-8 h-8" />,
      description: "↗︎ 42 (25%)",
    },
  ];
  const [sendloading, setsendloading] = useState(false);

  const getDashboardData = async () => {
    try {
      setsendloading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/getDashboardData`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPageStats(response.data.data);

      setsendloading(false);
    } catch (error) {
      setsendloading(false);
      console.error(
        "Error fetching completed payments:",
        error.response?.data || error.message
      );
    }
  };
  const getMonthlyRevenue = async (year) => {
    try {
      setsendloading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getMonthlyRevenue`,
        { year },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setGraphData(
        response.data.data.map((eachitem) => {
          return Number(eachitem.total_revenue);
        })
      );
      setsendloading(false);
    } catch (error) {
      setsendloading(false);
      console.error(
        "Error fetching completed payments:",
        error.response?.data || error.message
      );
    }
  };
  const getChartData = async (month, year) => {
    try {
      setsendloading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getShipmentTypeCounts`,
        { month, year },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setChartData(response.data.data);

      // setGraphData(
      //   response.data.data.map((eachitem) => {
      //     return Number(eachitem.total_revenue);
      //   })
      // );
      setsendloading(false);
    } catch (error) {
      setsendloading(false);
      console.error(
        "Error fetching completed payments:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Dashboard" }));
  }, []);

  return (
    userToken && (
      <>
        {/** ---------------------- Select Period Content ------------------------- */}

        {/** ---------------------- Different stats content 1 ------------------------- */}
        <div className="grid lg:grid-cols-3 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
          {statsData.map((d, k) => {
            const { icon, title, value } = d;
            return (
              <div className="stats shadow !text-black" key={k}>
                <div className="stat">
                  <div className={`stat-figure text-sm !text-black`}>
                    {icon}
                  </div>
                  <div className="!text-sm ">{title}</div>
                  <div className={`!font-semibold !text-xl  !text-black`}>
                    {value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
          <MyLineChart
            getMonthlyRevenue={getMonthlyRevenue}
            graphData={graphData}
          />
          <div className="h-[300px]">
            <MyDoughnutChart
              getChartData={getChartData}
              chartData={chartData}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 mt-10 grid-cols-1 gap-6">
          <div className="stats bg-base-100 shadow overflow-x-hidden">
            <div className="stat">
              <div className="stat-title !text-sm">
                Total Revenue Last Month
              </div>
              <div className="stat-value text-2xl">
                {IsCanada ? "$" : "₦"}{" "}
                {Number(pageStats?.lastMonthRevenue)?.toLocaleString()}
              </div>
              <div className="stat-actions mt-0">
                <button className="btn btn-xs">View Report</button>
              </div>
            </div>
            <div className="stat">
              <div className="stat-title !text-sm">
                Total Revenue This Month
              </div>
              <div className="stat-value text-2xl">
                {IsCanada ? "$" : "₦"}{" "}
                {Number(pageStats?.monthlyRevenue)?.toLocaleString()}
              </div>
              <div className="stat-actions mt-0">
                <button className="btn btn-xs">View Report</button>
              </div>
            </div>
          </div>
        </div>

        {sendloading && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        )}
      </>
    )
  );
}

export default UserDashboard;

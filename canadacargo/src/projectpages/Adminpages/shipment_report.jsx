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
import CompletedPayments from "../UserPages/completedPayments";
import CompletedPaymentsTable from "../UserPages/completedPaymentsTable";
import AllShipmentsTable from "../UserPages/allshipmentTable";
import ShipmentReportChart from "../AdminComponents/shipmentReportChart";

function ShipmentReport() {
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
      title: "Items Out Of Office",
      value: pageStats?.outOfOfficeCount,
      icon: <UsersIcon className="w-8 h-8" />,
      description: "23 urgent packages",
    },
    {
      title: "In Transit",
      value: pageStats?.itemsInTransitCount,
      icon: <BoltIcon className="w-8 h-8" />,
      description: "↗︎ 45 vs yesterday",
    },
    {
      title: "Items Not Yet Delivered",
      value: pageStats?.arrivedItemsCount,
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
          return Number(eachitem.total_shipments);
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

  const getMonthlyShipments = async (year) => {
    try {
      setsendloading(true);

      //   alert("running");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/getMonthlyShipments`,
        { year },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      //   console.log(response.data.data);

      setGraphData(
        response.data.data.map((eachitem) => {
          return Number(eachitem.total_shipments);
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
              <div className="stats shadow" key={k}>
                <div className="stat">
                  <div
                    className={`stat-figure dark:text-slate-300 text-sm text-[#2d8dc5]`}
                  >
                    {icon}
                  </div>
                  <div className="!text-sm dark:text-slate-300">{title}</div>
                  <div
                    className={`!font-semibold !text-xl dark:text-slate-300 text-[#2d8dc5]`}
                  >
                    {value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-1 mt-4 grid-cols-1 gap-6 ">
          <ShipmentReportChart
            getMonthlyShipments={getMonthlyShipments}
            graphData={graphData}
          />
        </div>

        {sendloading && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        )}

        <div className="mt-7 relative">
          <AllShipmentsTable></AllShipmentsTable>
        </div>
      </>
    )
  );
}

export default ShipmentReport;

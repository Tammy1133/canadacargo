// All components mapping with path for internal routes

import { lazy } from "react";
import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon";
import CurrencyDollarIcon from "@heroicons/react/24/outline/CurrencyDollarIcon";

const Dashboard = lazy(() => import("../pages/protected/Dashboard"));
const UserDashboard = lazy(() => import("../pages/protected/userDashboard"));
const Welcome = lazy(() => import("../pages/protected/Welcome"));
const Page404 = lazy(() => import("../pages/protected/404"));
const Blank = lazy(() => import("../pages/protected/Blank"));
const Charts = lazy(() => import("../pages/protected/Charts"));
const Leads = lazy(() => import("../pages/protected/Leads"));
const Integration = lazy(() => import("../pages/protected/Integration"));
const Calendar = lazy(() => import("../pages/protected/Calendar"));
const Team = lazy(() => import("../pages/protected/Team"));
const Transactions = lazy(() => import("../pages/protected/Transactions"));
const Bills = lazy(() => import("../pages/protected/Bills"));
const ProfileSettings = lazy(() =>
  import("../pages/protected/ProfileSettings")
);
const GettingStarted = lazy(() => import("../pages/GettingStarted"));
const DocFeatures = lazy(() => import("../pages/DocFeatures"));
const DocComponents = lazy(() => import("../pages/DocComponents"));
const iconClasses = `h-6 w-6`;

const routes = [
  {
    path: "/dashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/userdashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    name: "User Dashboard",
    component: UserDashboard,
  },
  // {
  //   path: '/app/leads', // url
  //   icon: <InboxArrowDownIcon className={iconClasses}/>, // icon component
  //   name: 'Leads', // name that appear in Sidebar
  // },
  {
    path: "/transactions", // url
    icon: <CurrencyDollarIcon className={iconClasses} />, // icon component
    name: "Transactions", // name that appear in Sidebar
    component: Transactions,
  },
  // {
  //   path: '/app/charts', // url
  //   icon: <ChartBarIcon className={iconClasses}/>, // icon component
  //   name: 'Analytics', // name that appear in Sidebar
  // },
  // {
  //   path: '/app/integration', // url
  //   icon: <BoltIcon className={iconClasses}/>, // icon component
  //   name: 'Integration', // name that appear in Sidebar
  // },
  // {
  //   path: '/app/calendar', // url
  //   icon: <CalendarDaysIcon className={iconClasses}/>, // icon component
  //   name: 'Calendar', // name that appear in Sidebar
  // },

  // {
  //   path: '', //no url needed as this has submenu
  //   icon: <DocumentDuplicateIcon className={`${iconClasses} inline` }/>, // icon component
  //   name: 'Pages', // name that appear in Sidebar
  //   submenu : [
  //     {
  //       path: '/login',
  //       icon: <ArrowRightOnRectangleIcon className={submenuIconClasses}/>,
  //       name: 'Login',
  //     },
  //     {
  //       path: '/register', //url
  //       icon: <UserIcon className={submenuIconClasses}/>, // icon component
  //       name: 'Register', // name that appear in Sidebar
  //     },
  //     {
  //       path: '/forgot-password',
  //       icon: <KeyIcon className={submenuIconClasses}/>,
  //       name: 'Forgot Password',
  //     },
  //     {
  //       path: '/app/blank',
  //       icon: <DocumentIcon className={submenuIconClasses}/>,
  //       name: 'Blank Page',
  //     },
  //     {
  //       path: '/app/404',
  //       icon: <ExclamationTriangleIcon className={submenuIconClasses}/>,
  //       name: '404',
  //     },
  //   ]
  // },
  // {
  //   path: '', //no url needed as this has submenu
  //   icon: <Cog6ToothIcon className={`${iconClasses} inline` }/>, // icon component
  //   name: 'Settings', // name that appear in Sidebar
  //   submenu : [
  //     {
  //       path: '/app/settings-profile', //url
  //       icon: <UserIcon className={submenuIconClasses}/>, // icon component
  //       name: 'Profile', // name that appear in Sidebar
  //     },
  //     {
  //       path: '/app/settings-billing',
  //       icon: <WalletIcon className={submenuIconClasses}/>,
  //       name: 'Billing',
  //     },
  //     {
  //       path: '/app/settings-team', // url
  //       icon: <UsersIcon className={submenuIconClasses}/>, // icon component
  //       name: 'Team Members', // name that appear in Sidebar
  //     },
  //   ]
  // },
  // {
  //   path: '', //no url needed as this has submenu
  //   icon: <DocumentTextIcon className={`${iconClasses} inline` }/>, // icon component
  //   name: 'Documentation', // name that appear in Sidebar
  //   submenu : [
  //     {
  //       path: '/app/getting-started', // url
  //       icon: <DocumentTextIcon className={submenuIconClasses}/>, // icon component
  //       name: 'Getting Started', // name that appear in Sidebar
  //     },
  //     {
  //       path: '/app/features',
  //       icon: <TableCellsIcon className={submenuIconClasses}/>,
  //       name: 'Features',
  //     },
  //     {
  //       path: '/app/components',
  //       icon: <CodeBracketSquareIcon className={submenuIconClasses}/>,
  //       name: 'Components',
  //     }
  //   ]
  // },
];

export default routes;

function DashboardStats({ title, icon, value, description, colorIndex }) {
  const COLORS = ["primary", "primary"];

  const getDescStyle = () => {
    if (description.includes("↗︎"))
      return "font-bold text-green-700 dark:text-green-300";
    else if (description.includes("↙"))
      return "font-bold text-rose-500 dark:text-red-400";
    else return "";
  };

  return (
    <div className="stats shadow">
      <div className="stat">
        <div className={`stat-figure text-sm !text-black`}>{icon}</div>
        <div className="!text-sm text-black">{title}</div>
        <div className={` !font-semibold !text-xl  !text-black`}>{value}</div>
      </div>
    </div>
  );
}

export default DashboardStats;

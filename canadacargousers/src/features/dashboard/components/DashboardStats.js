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
        <div
          className={`stat-figure dark:text-slate-300 text-sm text-[#2d8dc5]`}
        >
          {icon}
        </div>
        <div className="!text-sm dark:text-slate-300">{title}</div>
        <div
          className={` !font-semibold !text-xl dark:text-slate-300 text-[#2d8dc5]`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;

function TitleCard({ title, children, topMargin, TopSideButtons }) {
  return (
    <div
      className={
        "card w-full p-6 bg-base-100 shadow-xl " + (topMargin || "mt-6")
      }
    >
      <div
        className={`text-xl font-semibold ${
          TopSideButtons ? "inline-block" : ""
        }`}
      >
        {" "}
        {title}
        {TopSideButtons && (
          <div className="inline-block float-right">{TopSideButtons}</div>
        )}
      </div>

      <div className="divider mt-2"></div>

      {/** Card Body */}
      <div className="h-full w-full pb-6 bg-base-100">{children}</div>
    </div>
  );
}

export default TitleCard;

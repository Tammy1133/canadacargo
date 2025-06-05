function AmountStats({}) {
  return (
    <div className="stats bg-base-100 shadow">
      <div className="stat">
        <div className="stat-title !text-sm">Pending Shipment Value</div>
        <div className="stat-value text-2xl">$25,600</div>
        <div className="stat-actions">
          <button className="btn btn-xs">View Shipments</button>
        </div>
      </div>

      <div className="stat">
        <div className="stat-title !text-sm">Delivered Value Today</div>
        <div className="stat-value text-2xl">$5,600</div>
        <div className="stat-actions">
          <button className="btn btn-xs">View Deliveries</button>
        </div>
      </div>
    </div>
  );
}

export default AmountStats;

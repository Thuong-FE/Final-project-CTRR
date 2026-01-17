// components/LegendPanel.jsx
const LegendPanel = ({ algorithmResult, startNodeId, endNodeId }) => {
    if (!algorithmResult) return null;
  
    return (
      <div className="p-3 text-xs text-zinc-300">
        <div className="font-bold text-zinc-100 mb-2 border-b border-zinc-700 pb-1">
          CHÚ THÍCH (LEGEND)
        </div>
  
        {/* START NODE */}
        {startNodeId && (
          <LegendItem color="#22c55e" label="Nguồn (Start)" />
        )}
  
        {/* END NODE */}
        {endNodeId && (
          <LegendItem color="#ef4444" label="Đích (End)" />
        )}
  
        {/* CURRENT NODE */}
        <LegendItem color="#eab308" label="Đang xét (Processing)" />
  
        {algorithmResult.path && (
          <LegendLine color="#3b82f6" label="Đường đi (Path)" />
        )}
  
        {algorithmResult.mstLinks && (
          <LegendLine color="#10b981" label="Cây khung (MST)" />
        )}
  
        {algorithmResult.flowDetails && (
          <LegendLine color="#06b6d4" label="Luồng (Flow)" />
        )}
      </div>
    );
  };
  
  const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-2 mb-1">
      <div
        className="w-3 h-3 rounded-full border border-zinc-400"
        style={{ background: color }}
      />
      <span>{label}</span>
    </div>
  );
  
  const LegendLine = ({ color, label }) => (
    <div className="flex items-center gap-2 mb-1">
      <div
        className="w-6 h-1 rounded"
        style={{ background: color }}
      />
      <span>{label}</span>
    </div>
  );
  
  export default LegendPanel;
  
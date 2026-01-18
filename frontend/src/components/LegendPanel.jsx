// src/components/LegendPanel.jsx
import React from 'react';

const LegendPanel = ({ algorithmResult, startNodeId, endNodeId }) => {
  if (!algorithmResult && !startNodeId && !endNodeId) return null;

  return (
    <div className="text-xs">
      <h3 className="text-[#22d3ee] text-xs font-semibold mb-2 tracking-wide">CHÚ GIẢI</h3>
      <div className="space-y-1.5">
        {startNodeId && <LegendItem color="#22c55e" label="Nút Bắt Đầu" />}
        {endNodeId && <LegendItem color="#ef4444" label="Nút Kết Thúc" />}
        {algorithmResult?.path && <LegendLine color="#eab308" label="Đường Đi Ngắn Nhất" />}
        {algorithmResult?.mstLinks && <LegendLine color="#06b6d4" label="Cạnh Cây Khung" />}
        {algorithmResult?.flowDetails && <LegendLine color="#06b6d4" label="Luồng Cực Đại" />}
        {algorithmResult?.bipartiteSets && (
          <>
            <LegendItem color="#22c55e" label="Tập A (Bipartite)" />
            <LegendItem color="#ef4444" label="Tập B (Bipartite)" />
          </>
        )}
        {algorithmResult && <LegendItem color="#eab308" label="Đang Xử Lý" />}
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div
      className="w-3 h-3 rounded-full border border-[#3f3f46]"
      style={{ backgroundColor: color }}
    />
    <span className="text-[#a1a1aa]">{label}</span>
  </div>
);

const LegendLine = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div
      className="w-5 h-0.5 rounded-full"
      style={{ backgroundColor: color }}
    />
    <span className="text-[#a1a1aa]">{label}</span>
  </div>
);

export default LegendPanel;
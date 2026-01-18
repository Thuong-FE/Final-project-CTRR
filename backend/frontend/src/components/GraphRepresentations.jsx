// src/components/GraphRepresentations.jsx
import React from 'react';

export const GraphRepresentations = ({ graph, adjMatrix, adjList, edgeList, viewMode }) => {
  if (!viewMode) return <p className="text-xs text-[#71717a]">Chọn kiểu biểu diễn ở sidebar.</p>;

  switch (viewMode) {
    case 'matrix':
      return (
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr>
                <th className="border border-[#3f3f46] p-1.5 bg-[#27272a] text-[#a1a1aa] font-medium"></th>
                {graph.nodes.map(n => (
                  <th key={n.id} className="border border-[#3f3f46] p-1.5 bg-[#27272a] text-[#22d3ee] font-medium">
                    {n.label || n.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adjMatrix.map((row, i) => (
                <tr key={i}>
                  <td className="border border-[#3f3f46] p-1.5 bg-[#27272a] text-[#22d3ee] font-medium">
                    {graph.nodes[i]?.label || graph.nodes[i]?.id}
                  </td>
                  {row.map((val, j) => (
                    <td
                      key={j}
                      className={`border border-[#3f3f46] p-1.5 text-center ${val > 0 ? 'text-[#22d3ee] font-medium' : 'text-[#52525b]'}`}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'adj_list':
      return (
        <div className="space-y-1 bg-[#27272a] rounded-lg p-3 text-xs font-mono">
          {Object.entries(adjList).map(([node, neighbors]) => (
            <div key={node} className="flex gap-2">
              <span className="text-[#22d3ee] font-medium">{node}:</span>
              <span className="text-[#a1a1aa]">
                {neighbors.length > 0 ? neighbors.join(' → ') : '(không có kề)'}
              </span>
            </div>
          ))}
        </div>
      );
    case 'edge_list':
      return (
        <div className="space-y-1 bg-[#27272a] rounded-lg p-3 text-xs font-mono max-h-48 overflow-y-auto">
          {edgeList.length > 0 ? edgeList.map((edge, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-[#22d3ee]">{edge[0]}</span>
              <span className="text-[#52525b]">→</span>
              <span className="text-[#22d3ee]">{edge[1]}</span>
              <span className="text-[#eab308] ml-1">({edge[2]})</span>
            </div>
          )) : (
            <p className="text-[#71717a]">Chưa có cạnh.</p>
          )}
        </div>
      );
    default:
      return null;
  }
};
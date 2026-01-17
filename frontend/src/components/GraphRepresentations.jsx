// File: src/components/GraphRepresentations.jsx
import React, { useEffect, useState } from 'react';
import { toAdjacencyMatrix, toAdjacencyList, toEdgeList } from '../Api'; // Import từ Api.js

export const GraphRepresentations = ({ graph, viewMode }) => {
  const [matrix, setMatrix] = useState([]);
  const [adjList, setAdjList] = useState({});
  const [edgeList, setEdgeList] = useState([]);

  useEffect(() => {
    const fetchRepresentations = async () => {
      try {
        const fetchedMatrix = await toAdjacencyMatrix(graph);
        setMatrix(fetchedMatrix);

        const fetchedAdjList = await toAdjacencyList(graph);
        setAdjList(fetchedAdjList);

        const fetchedEdgeList = await toEdgeList(graph);
        setEdgeList(fetchedEdgeList);
      } catch (error) {
        console.error('Error fetching representations:', error);
        // Optional: Hiển thị thông báo lỗi cho user
      }
    };

    if (graph && Array.isArray(graph.nodes) && graph.nodes.length > 0) {
        fetchRepresentations();
      }
      
  }, [graph, viewMode]); // Refetch khi graph thay đổi hoặc viewMode

  const renderContent = () => {
    switch (viewMode) {
      case 'matrix':
        if (matrix.length === 0) return <div className="text-zinc-500">Đang tải ma trận kề...</div>;
        return (
          <div className="animate-in fade-in duration-300">
            <div className="overflow-auto max-w-full max-h-[70vh] border border-zinc-800 rounded bg-zinc-950 shadow-inner">
              <table className="table-auto w-full text-center border-collapse">
                <thead className="bg-zinc-900 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 border-b border-r border-zinc-800 bg-zinc-900 sticky left-0 z-20 text-zinc-500 font-mono text-xs">
                      Nút (Nodes)
                    </th>
                    {graph.nodes.map(n => (
                      <th
                        key={n.id}
                        className="p-3 border-b border-zinc-800 text-blue-400 font-bold text-sm min-w-[60px]"
                      >
                        {n.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="p-3 border-r border-b border-zinc-800 bg-zinc-900 sticky left-0 z-10 font-bold text-blue-400 text-sm">
                        {graph.nodes[i].label}
                      </td>
                      {row.map((val, j) => (
                        <td
                          key={j}
                          className={`p-3 border-b border-zinc-800 font-mono text-sm ${
                            val > 0
                              ? 'text-green-400 font-bold bg-green-900/10'
                              : 'text-zinc-700'
                          }`}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-zinc-500 text-xs italic">
              * Hàng đại diện cho Nút Nguồn, Cột đại diện cho Nút Đích. Giá trị
              trong ô là Trọng số.
            </div>
          </div>
        );

      case 'adj_list':
        if (Object.keys(adjList).length === 0) return <div className="text-zinc-500">Đang tải danh sách kề...</div>;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
            {Object.entries(adjList).map(([node, neighbors]) => (
              <div
                key={node}
                className="bg-zinc-950 border border-zinc-800 rounded p-4 flex flex-col gap-2 hover:border-zinc-700 transition-colors"
              >
                <div className="text-lg font-bold text-blue-400 border-b border-zinc-800 pb-2 mb-1 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {node}
                </div>
                {neighbors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {neighbors.map((n, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-zinc-900 rounded text-sm text-zinc-300 font-mono border border-zinc-800"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-zinc-600 italic text-sm">
                    Không có nút kề
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      case 'edge_list':
        if (edgeList.length === 0) return <div className="text-zinc-500">Đang tải danh sách cạnh...</div>;
        return (
          <div className="bg-zinc-950 border border-zinc-800 rounded p-0 overflow-hidden animate-in fade-in duration-300">
            <div className="bg-zinc-900 p-3 border-b border-zinc-800 text-sm font-bold text-zinc-400 grid grid-cols-12 gap-4">
              <div className="col-span-1">#</div>
              <div className="col-span-11 font-mono">
                Cấu trúc: Nguồn {graph.isDirected ? '->' : '--'} Đích
                [weight=Trọng số]
              </div>
            </div>
            <div className="divide-y divide-zinc-800 max-h-[70vh] overflow-auto">
              {edgeList.length > 0 ? (
                edgeList.map((line, i) => (
                  <div
                    key={i}
                    className="p-3 text-sm font-mono text-zinc-300 hover:bg-zinc-900/50 flex items-center gap-4"
                  >
                    <span className="text-zinc-600 w-6 text-right">
                      {i + 1}
                    </span>
                    <span>{line}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-zinc-600 italic">
                  Đồ thị chưa có cạnh nào.
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full p-6 bg-zinc-900/50 rounded-lg rounded-lg overflow-auto">
      {renderContent()}
    </div>
  );
};
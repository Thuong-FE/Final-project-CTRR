// src/components/ConversionModal.jsx
import React, { useState } from 'react';
import { fromAdjacencyMatrix, fromAdjacencyList, fromEdgeList } from '../Api';

export const ConversionModal = ({ graph, isOpen, onClose, onUpdateGraph }) => {
  const [inputType, setInputType] = useState('matrix');
  const [inputData, setInputData] = useState('');
  const [labels, setLabels] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleConvert = async () => {
    setError(null);
    try {
      let parsedData = JSON.parse(inputData);
      let newGraph;
      if (inputType === 'matrix') {
        const parsedLabels = labels ? labels.split(',').map(l => l.trim()) : null;
        newGraph = await fromAdjacencyMatrix(parsedData, graph.isDirected, parsedLabels);
      } else if (inputType === 'adj_list') {
        newGraph = await fromAdjacencyList(parsedData, graph.isDirected);
      } else if (inputType === 'edge_list') {
        newGraph = await fromEdgeList(parsedData, graph.isDirected);
      }
      onUpdateGraph(newGraph);
      onClose();
    } catch (err) {
      setError('Dữ liệu không hợp lệ: ' + err.message);
    }
  };

  const buttonClass = (type) =>
    `px-3 py-1.5 text-xs rounded-md transition-colors ${inputType === type ? 'bg-[#22d3ee] text-black font-medium' : 'bg-[#27272a] hover:bg-[#3f3f46]'}`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl w-[420px] p-6 shadow-2xl">
        <h2 className="text-base font-semibold text-[#22d3ee] mb-4">Chuyển Đổi Biểu Diễn</h2>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setInputType('matrix')} className={buttonClass('matrix')}>Ma Trận Kề</button>
          <button onClick={() => setInputType('adj_list')} className={buttonClass('adj_list')}>Danh Sách Kề</button>
          <button onClick={() => setInputType('edge_list')} className={buttonClass('edge_list')}>Danh Sách Cạnh</button>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-[#a1a1aa] mb-1">Dữ liệu JSON</label>
          <textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            className="w-full h-32 bg-[#27272a] border border-[#3f3f46] rounded-lg p-3 text-xs font-mono text-[#a1a1aa] focus:border-[#22d3ee] focus:outline-none resize-none"
            placeholder={inputType === 'matrix'
              ? '[[0,1,0],[1,0,1],[0,1,0]]'
              : inputType === 'adj_list'
                ? '{"A": ["B"], "B": ["A","C"]}'
                : '[["A","B",1],["B","C",2]]'
            }
          />
        </div>

        {inputType === 'matrix' && (
          <div className="mb-4">
            <label className="block text-xs text-[#a1a1aa] mb-1">Nhãn các nút (phân cách bởi dấu phẩy)</label>
            <input
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="w-full p-2 bg-[#27272a] border border-[#3f3f46] rounded-lg text-xs focus:border-[#22d3ee] focus:outline-none"
              placeholder="A, B, C, D..."
            />
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg">
            <p className="text-xs text-[#ef4444]">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-[#27272a] rounded-lg text-sm hover:bg-[#3f3f46]">Hủy</button>
          <button onClick={handleConvert} className="px-4 py-2 bg-[#22d3ee] text-black rounded-lg text-sm font-medium hover:bg-[#67e8f9]">Áp Dụng</button>
        </div>
      </div>
    </div>
  );
};
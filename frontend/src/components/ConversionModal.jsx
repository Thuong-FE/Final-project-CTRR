// File: src/components/ConversionModal.jsx
import React, { useState } from 'react';
import { fromAdjacencyMatrix, fromAdjacencyList, fromEdgeList } from '../Api'; // Import từ Api.js

export const ConversionModal = ({ graph, isOpen, onClose, onUpdateGraph }) => {
  const [inputType, setInputType] = useState('matrix'); // 'matrix', 'adj_list', 'edge_list'
  const [inputData, setInputData] = useState('');
  const [labels, setLabels] = useState(''); // Cho matrix
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleConvert = async () => {
    setError(null);
    try {
      let parsedData;
      if (inputType === 'matrix') {
        parsedData = JSON.parse(inputData); // Expect [[1,0],[0,1]] format
        const parsedLabels = labels ? labels.split(',').map(l => l.trim()) : null;
        const newGraph = await fromAdjacencyMatrix(parsedData, graph.isDirected, parsedLabels);
        onUpdateGraph(newGraph);
      } else if (inputType === 'adj_list') {
        parsedData = JSON.parse(inputData); // Expect {A: [["B",1]]} format
        const newGraph = await fromAdjacencyList(parsedData, graph.isDirected);
        onUpdateGraph(newGraph);
      } else if (inputType === 'edge_list') {
        parsedData = JSON.parse(inputData); // Expect [["A","B",1]] format
        const newGraph = await fromEdgeList(parsedData, graph.isDirected);
        onUpdateGraph(newGraph);
      }
      onClose();
    } catch (err) {
      setError('Dữ liệu không hợp lệ hoặc lỗi chuyển đổi: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Chuyển Đổi Biểu Diễn Đồ Thị
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 gap-6">

          {/* Select Input Type */}
          <div className="flex gap-4">
            <button
              onClick={() => setInputType('matrix')}
              className={`px-4 py-2 rounded ${inputType === 'matrix' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}
            >
              Ma Trận Kề
            </button>
            <button
              onClick={() => setInputType('adj_list')}
              className={`px-4 py-2 rounded ${inputType === 'adj_list' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}
            >
              Danh Sách Kề
            </button>
            <button
              onClick={() => setInputType('edge_list')}
              className={`px-4 py-2 rounded ${inputType === 'edge_list' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}
            >
              Danh Sách Cạnh
            </button>
          </div>

          {/* Input Area */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-zinc-300">Nhập Dữ Liệu ({inputType.toUpperCase()}):</label>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="w-full h-40 bg-zinc-950 border border-zinc-700 rounded p-2 text-white font-mono text-sm"
              placeholder={inputType === 'matrix' ? 'Ví dụ: [[0,1],[1,0]]' : inputType === 'adj_list' ? 'Ví dụ: {"A": [["B",1]]}' : 'Ví dụ: [["A","B",1]]'}
            />
            {inputType === 'matrix' && (
              <input
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white font-mono text-sm"
                placeholder="Nhãn node (tùy chọn, ví dụ: A,B,C)"
              />
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded">
              Hủy
            </button>
            <button onClick={handleConvert} className="px-4 py-2 bg-blue-600 text-white rounded">
              Áp Dụng & Cập Nhật Đồ Thị
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
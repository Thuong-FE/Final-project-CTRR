import React, { useState, useEffect } from 'react';
import './App.css';
import GraphCanvas from './components/GraphCanvas';
import { ConversionModal } from './components/ConversionModal';
import { GraphRepresentations } from './components/GraphRepresentations';
import LegendPanel from './components/LegendPanel';
import { ErrorModal } from './components/ErrorModal';
import { SAMPLE_GRAPH_DATA, DIRECTED_GRAPH_DATA } from './constants';
import { toAdjacencyMatrix, toAdjacencyList, toEdgeList, saveGraph, loadGraph } from './Api';
import { runBFS, runDFS, runDijkstra, runBellmanFord, runPrim, runKruskal, runFordFulkerson, runFleury, runHierholzer, checkBipartite } from './Api';

const ALGO_GROUPS = [
  {
    id: 'traversal',
    title: 'Duyệt Đồ Thị',
    options: [
      { label: 'BFS', type: 'BFS' },
      { label: 'DFS', type: 'DFS' }
    ]
  },
  {
    id: 'shortest_path',
    title: 'Đường Đi Ngắn Nhất',
    options: [
      { label: 'Dijkstra', type: 'DIJKSTRA' },
      { label: 'Bellman-Ford', type: 'BELLMAN_FORD' }
    ]
  },
  {
    id: 'mst',
    title: 'Cây Khung Nhỏ Nhất',
    options: [
      { label: 'Prim', type: 'PRIM' },
      { label: 'Kruskal', type: 'KRUSKAL' }
    ]
  },
  {
    id: 'flow',
    title: 'Luồng',
    options: [
      { label: 'Ford-Fulkerson', type: 'FORD_FULKERSON' }
    ]
  },
  {
    id: 'euler',
    title: 'Euler',
    options: [
      { label: 'Fleury', type: 'FLEURY' },
      { label: 'Hierholzer', type: 'HIERHOLZER' }
    ]
  },
  {
    id: 'check',
    title: 'Kiểm Tra',
    options: [
      { label: 'Bipartite', type: 'CHECK_BIPARTITE' }
    ]
  }
];

const REP_OPTIONS = [
  { label: 'Ma Trận Kề', type: 'matrix' },
  { label: 'Danh Sách Kề', type: 'adj_list' },
  { label: 'Danh Sách Cạnh', type: 'edge_list' }
];

const App = () => {
  // Always show welcome screen on page load
  const [showWelcome, setShowWelcome] = useState(true);
  const [graph, setGraph] = useState({ nodes: [], links: [], isDirected: false });
  const [mode, setMode] = useState('select');
  const [isDirected, setIsDirected] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [startNodeId, setStartNodeId] = useState(null);
  const [endNodeId, setEndNodeId] = useState(null);

  const [algorithmType, setAlgorithmType] = useState('NONE');
  const [algorithmResult, setAlgorithmResult] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const [adjMatrix, setAdjMatrix] = useState([]);
  const [adjList, setAdjList] = useState({});
  const [edgeList, setEdgeList] = useState([]);
  const [viewMode, setViewMode] = useState(null);

  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const updateRep = async () => {
      if (graph.nodes.length > 0) {
        setAdjMatrix(await toAdjacencyMatrix(graph));
        setAdjList(await toAdjacencyList(graph));
        setEdgeList(await toEdgeList(graph));
      }
    };
    updateRep();
  }, [graph]);

  useEffect(() => {
    let interval;
    if (isPlaying && algorithmResult?.steps) {
      interval = setInterval(() => {
        setStepIndex(prev => (prev < algorithmResult.steps.length - 1 ? prev + 1 : prev));
      }, 1000 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, algorithmResult]);

  const runAlgorithm = async () => {
    setAlgorithmResult(null);
    setStepIndex(0);
    setIsPlaying(false);

    const input = { graph: { ...graph, isDirected }, startId: startNodeId, endId: endNodeId };
    try {
      let result;
      switch (algorithmType) {
        case 'BFS':
          result = await runBFS(input.graph, input.startId);
          break;
        case 'DFS':
          result = await runDFS(input.graph, input.startId);
          break;
        case 'DIJKSTRA':
          result = await runDijkstra(input.graph, input.startId, input.endId);
          break;
        case 'BELLMAN_FORD':
          result = await runBellmanFord(input.graph, input.startId, input.endId);
          break;
        case 'PRIM':
          result = await runPrim(input.graph);
          break;
        case 'KRUSKAL':
          result = await runKruskal(input.graph);
          break;
        case 'FORD_FULKERSON':
          result = await runFordFulkerson(input.graph, input.startId, input.endId);
          break;
        case 'FLEURY':
          result = await runFleury(input.graph);
          break;
        case 'HIERHOLZER':
          result = await runHierholzer(input.graph);
          break;
        case 'CHECK_BIPARTITE':
          result = await checkBipartite(input.graph);
          break;
        default:
          return;
      }
      setAlgorithmResult(result);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleSave = async () => {
    await saveGraph({ ...graph, isDirected });
  };

  const handleClear = () => {
    setGraph({ nodes: [], links: [], isDirected: false });
    setAlgorithmResult(null);
    setViewMode(null);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const resetAnimation = () => {
    setStepIndex(0);
    setIsPlaying(false);
  };

  const stepBack = () => setStepIndex(prev => Math.max(0, prev - 1));
  const stepForward = () => setStepIndex(prev => Math.min(algorithmResult.steps.length - 1, prev + 1));

  const currentStep = algorithmResult?.steps[stepIndex] || null;

  const selectStartNode = (id) => {
    if (graph.nodes.some(n => n.id === id)) {
      setStartNodeId(id);
      setMode('select');
    } else {
      setErrorMessage('Nút không tồn tại');
    }
  };

  const selectEndNode = (id) => {
    if (graph.nodes.some(n => n.id === id)) {
      setEndNodeId(id);
      setMode('select');
    } else {
      setErrorMessage('Nút không tồn tại');
    }
  };

  return (
    <>
      {/* Error Modal */}
      <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />

      {/* Welcome Modal */}
      {showWelcome && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.98)'
          }}
        >
          <div style={{
            backgroundColor: '#1e293b',
            border: '6px solid #22d3ee',
            borderRadius: '24px',
            width: '1200px',
            padding: '80px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="18" r="3" />
                  <line x1="12" y1="15" x2="6" y2="18" />
                  <line x1="12" y1="15" x2="18" y2="18" />
                </svg>
                <h1 style={{ fontSize: '72px', fontWeight: 'bold', color: '#22d3ee', margin: 0 }}>Graph Visualizer</h1>
              </div>
              <p style={{ fontSize: '28px', color: '#94a3b8', margin: 0 }}>Công cụ trực quan hóa thuật toán đồ thị</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <button
                onClick={() => {
                  setGraph({ nodes: [], links: [], isDirected: false });
                  setIsDirected(false);
                  setShowWelcome(false);
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#22d3ee',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '32px',
                  padding: '40px 60px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#67e8f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22d3ee'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Tạo Đồ Thị Mới</span>
                </div>
                <span style={{ fontSize: '24px', opacity: 0.7 }}>Canvas trống</span>
              </button>

              <button
                onClick={() => {
                  setGraph(SAMPLE_GRAPH_DATA);
                  setIsDirected(SAMPLE_GRAPH_DATA.isDirected);
                  setShowWelcome(false);
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#a855f7',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '32px',
                  padding: '40px 60px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9333ea'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#a855f7'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="8" r="3" />
                    <circle cx="6" cy="16" r="3" />
                    <circle cx="18" cy="16" r="3" />
                    <line x1="10" y1="10" x2="8" y2="14" />
                    <line x1="14" y1="10" x2="16" y2="14" />
                  </svg>
                  <span>Đồ Thị Vô Hướng</span>
                </div>
                <span style={{ fontSize: '24px', opacity: 0.7 }}>10 nút, 14 cạnh</span>
              </button>

              <button
                onClick={() => {
                  setGraph(DIRECTED_GRAPH_DATA);
                  setIsDirected(DIRECTED_GRAPH_DATA.isDirected);
                  setShowWelcome(false);
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '32px',
                  padding: '40px 60px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="12" r="3" />
                    <line x1="9" y1="12" x2="15" y2="12" />
                    <polyline points="13,9 15,12 13,15" />
                  </svg>
                  <span>Đồ Thị Có Hướng</span>
                </div>
                <span style={{ fontSize: '24px', opacity: 0.7 }}>8 nút, 12 cạnh</span>
              </button>
            </div>

            <p style={{ fontSize: '20px', color: '#64748b', textAlign: 'center', marginTop: '60px', marginBottom: 0 }}>
              Bạn có thể tạo đồ thị mới bất cứ lúc nào bằng nút "Xóa Toàn Bộ"
            </p>
          </div>
        </div>
      )}

      <div className="app-container">
        {/* Left Sidebar */}
        <div className="sidebar" style={{ width: '320px', minWidth: '320px', maxWidth: '320px', flexShrink: 0 }}>
          {/* App Header */}
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid #3f3f46' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="18" r="3" />
                <line x1="12" y1="15" x2="6" y2="18" />
                <line x1="12" y1="15" x2="18" y2="18" />
              </svg>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#22d3ee', margin: 0 }}>
                Graph Visualizer
              </h1>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, paddingLeft: '52px' }}>
              Công cụ trực quan hóa thuật toán đồ thị
            </p>
          </div>

          <h2 className="text-[#22d3ee] tracking-wide">CÔNG CỤ</h2>

          {/* Mode Selection */}
          <div className="mb-4">
            <label className="block text-xs text-[#a1a1aa] mb-1.5">Chế độ</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="select">Chọn / Di chuyển</option>
              <option value="add_node">Thêm Nút</option>
              <option value="add_link">Nối Cạnh</option>
              <option value="delete_node">Xóa Nút</option>
              <option value="delete_edge">Xóa Cạnh</option>
              <option value="set_start">Chọn Nguồn</option>
              <option value="set_end">Chọn Đích</option>
            </select>
          </div>

          {/* Graph Config */}
          <div className="mb-4 pb-4 border-b border-[#3f3f46]">
            <h3>CẤU HÌNH</h3>
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors">
              <input type="checkbox" checked={isDirected} onChange={(e) => setIsDirected(e.target.checked)} />
              Đồ thị có hướng
            </label>
          </div>

          {/* Edit Selected Element */}
          {(selectedNodeId || selectedLink) && (
            <div className="mb-4 pb-4 border-b border-[#3f3f46]">
              <h3>CHỈNH SỬA</h3>
              <div className="text-xs text-[#a1a1aa] mb-2">
                {selectedNodeId && `Đã chọn: Nút ${graph.nodes.find(n => n.id === selectedNodeId)?.label || selectedNodeId}`}
                {selectedLink && `Đã chọn: Cạnh ${selectedLink.source} → ${selectedLink.target}`}
              </div>
              <button
                onClick={() => {
                  if (selectedNodeId) {
                    const node = graph.nodes.find(n => n.id === selectedNodeId);
                    if (node) {
                      const newLabel = prompt('Nhập nhãn mới:', node.label || node.id);
                      if (newLabel !== null) {
                        setGraph(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNodeId ? { ...n, label: newLabel } : n)
                        }));
                      }
                    }
                  } else if (selectedLink) {
                    const newWeight = prompt('Nhập trọng số mới:', selectedLink.weight);
                    if (newWeight !== null && !isNaN(newWeight)) {
                      setGraph(prev => ({
                        ...prev,
                        links: prev.links.map(l =>
                          l.source === selectedLink.source && l.target === selectedLink.target
                            ? { ...l, weight: parseFloat(newWeight) }
                            : l
                        )
                      }));
                    }
                  }
                }}
                className="w-full bg-[#a855f7] hover:bg-[#9333ea] font-medium px-4 py-2 rounded-lg"
              >
                ✏️ Chỉnh Sửa
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="mb-4 pb-4 border-b border-[#3f3f46]">
            <h3>THAO TÁC</h3>
            <div className="flex flex-col gap-2">
              <button onClick={handleSave} className="w-full bg-[#22d3ee] text-black font-medium hover:bg-[#67e8f9]">
                Lưu Đồ Thị
              </button>
              <button onClick={handleClear} className="w-full bg-[#ef4444] hover:bg-[#dc2626]">
                Xóa Toàn Bộ
              </button>
            </div>
          </div>

          {/* Algorithm Selection */}
          <div className="mb-4 pb-4 border-b border-[#3f3f46]">
            <h3>THUẬT TOÁN</h3>
            <select value={algorithmType} onChange={(e) => setAlgorithmType(e.target.value)} className="mb-2">
              <option value="NONE">-- Chọn thuật toán --</option>
              {ALGO_GROUPS.map(group => (
                <optgroup key={group.id} label={group.title}>
                  {group.options.map(opt => (
                    <option key={opt.type} value={opt.type}>{opt.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="flex flex-col gap-2">
              <button onClick={runAlgorithm} className="w-full bg-[#a855f7] hover:bg-[#9333ea] font-medium">
                Chạy Thuật Toán
              </button>
              <button onClick={() => setAlgorithmResult(null)} className="w-full bg-[#27272a] hover:bg-[#3f3f46]">
                Xóa Kết Quả
              </button>
            </div>
          </div>

          {/* Representation */}
          <div className="mb-4 pb-4 border-b border-[#3f3f46]">
            <h3>BIỂU DIỄN</h3>
            <div className="flex flex-col gap-1.5">
              {REP_OPTIONS.map(opt => (
                <button
                  key={opt.type}
                  onClick={() => setViewMode(opt.type)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${viewMode === opt.type ? 'bg-[#22d3ee] text-black font-medium' : 'bg-[#27272a] hover:bg-[#3f3f46]'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsConversionModalOpen(true)}
              className="w-full mt-2 bg-[#06b6d4] hover:bg-[#0891b2] font-medium"
            >
              Chuyển Đổi
            </button>
          </div>

          {/* Start/End Node Selection */}
          <div className="mb-4 pb-4 border-b border-[#3f3f46]">
            <h3>NÚT NGUỒN / ĐÍCH</h3>
            <div className="mb-3">
              <label className="block text-xs text-[#a1a1aa] mb-1">Nút bắt đầu</label>
              <select onChange={(e) => selectStartNode(e.target.value)} value={startNodeId || ''}>
                <option value="">-- Chọn nút --</option>
                {graph.nodes.map(n => <option key={n.id} value={n.id}>{n.label || n.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#a1a1aa] mb-1">Nút kết thúc</label>
              <select onChange={(e) => selectEndNode(e.target.value)} value={endNodeId || ''}>
                <option value="">-- Chọn nút --</option>
                {graph.nodes.map(n => <option key={n.id} value={n.id}>{n.label || n.id}</option>)}
              </select>
            </div>
          </div>

          <LegendPanel algorithmResult={algorithmResult} startNodeId={startNodeId} endNodeId={endNodeId} />

          {/* Mode Tips */}
          <div className="mt-4 pt-4 border-t border-[#3f3f46]">
            <div className="bg-[#27272a] rounded-lg px-3 py-2.5 text-xs text-[#a1a1aa]">
              {mode === 'select' && '💡 Click để chọn, kéo để di chuyển. Dùng nút Chỉnh Sửa để sửa.'}
              {mode === 'add_node' && '💡 Click vào canvas để thêm nút mới.'}
              {mode === 'add_link' && '💡 Click nút nguồn rồi nút đích để nối cạnh.'}
              {mode === 'delete_node' && '💡 Click vào nút để xóa.'}
              {mode === 'delete_edge' && '💡 Click vào cạnh để xóa.'}
              {mode === 'set_start' && '💡 Click để chọn nút nguồn (xanh lá).'}
              {mode === 'set_end' && '💡 Click để chọn nút đích (đỏ).'}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="canvas" style={{ flex: 1, minWidth: 0 }}>
          <GraphCanvas
            graph={{ ...graph, isDirected }}
            setGraph={setGraph}
            mode={mode}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            selectedLink={selectedLink}
            setSelectedLink={setSelectedLink}
            startNodeId={startNodeId}
            setStartNodeId={setStartNodeId}
            endNodeId={endNodeId}
            setEndNodeId={setEndNodeId}
            currentStep={currentStep}
            algorithmResult={algorithmResult}
            algorithmType={algorithmType}
          />
        </div>

        {/* Right Panel */}
        <div className="right-panel" style={{ width: '380px', minWidth: '380px', maxWidth: '380px', flexShrink: 0 }}>
          <h2 className="text-[#22d3ee] tracking-wide">THÔNG TIN</h2>

          {/* Stats */}
          <div className="mb-4 pb-4 border-b border-[#3f3f46]">
            <h3>Thống Kê</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#27272a] rounded-lg p-3">
                <p className="text-2xl font-semibold text-[#22d3ee]">{graph.nodes.length}</p>
                <p className="text-xs text-[#a1a1aa]">Số nút</p>
              </div>
              <div className="bg-[#27272a] rounded-lg p-3">
                <p className="text-2xl font-semibold text-[#22d3ee]">{graph.links.length}</p>
                <p className="text-xs text-[#a1a1aa]">Số cạnh</p>
              </div>
            </div>
          </div>

          {/* Representation View */}
          <div className="mb-4 pb-4 border-b border-[#3f3f46]">
            <h3>Biểu Diễn</h3>
            <GraphRepresentations graph={graph} adjMatrix={adjMatrix} adjList={adjList} edgeList={edgeList} viewMode={viewMode} />
          </div>

          {/* Algorithm Logs */}
          <div className="mb-4">
            <h3>Nhật Ký Thuật Toán</h3>
            {algorithmResult?.logs?.length > 0 ? (
              <div className="bg-[#27272a] rounded-lg p-3 max-h-40 overflow-y-auto">
                {algorithmResult.logs.map((log, i) => (
                  <p key={i} className="text-xs text-[#a1a1aa] mb-1 font-mono">{log}</p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#71717a]">Chưa có kết quả thuật toán.</p>
            )}
          </div>

          {/* Animation Controls */}
          {algorithmResult?.steps && (
            <div className="border-t border-[#3f3f46] pt-4">
              <h3>Điều Khiển Animation</h3>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={resetAnimation} className="p-2 bg-[#27272a] rounded-md hover:bg-[#3f3f46]" title="Đặt lại">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                </button>
                <button onClick={stepBack} className="p-2 bg-[#27272a] rounded-md hover:bg-[#3f3f46]" title="Bước trước">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="19 20 9 12 19 4 19 20"></polygon>
                    <line x1="5" y1="19" x2="5" y2="5"></line>
                  </svg>
                </button>
                <button onClick={togglePlay} className="p-2 bg-[#22d3ee] text-black rounded-md hover:bg-[#67e8f9]" title={isPlaying ? 'Tạm dừng' : 'Phát'}>
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  )}
                </button>
                <button onClick={stepForward} className="p-2 bg-[#27272a] rounded-md hover:bg-[#3f3f46]" title="Bước sau">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                    <line x1="19" y1="5" x2="19" y2="19"></line>
                  </svg>
                </button>
              </div>

              {/* Progress */}
              <div className="bg-[#27272a] rounded-lg p-3 mb-3">
                <div className="flex justify-between text-xs text-[#a1a1aa] mb-2">
                  <span>Bước {stepIndex + 1}</span>
                  <span>/ {algorithmResult.steps.length}</span>
                </div>
                <div className="w-full bg-[#3f3f46] rounded-full h-1.5">
                  <div
                    className="bg-[#22d3ee] h-1.5 rounded-full transition-all duration-200"
                    style={{ width: `${((stepIndex + 1) / algorithmResult.steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Speed Control */}
              <div>
                <label className="block text-xs text-[#a1a1aa] mb-1">Tốc độ</label>
                <select value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}>
                  <option value={0.5}>0.5x (Chậm)</option>
                  <option value={1}>1x (Bình thường)</option>
                  <option value={2}>2x (Nhanh)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <ConversionModal graph={graph} isOpen={isConversionModalOpen} onClose={() => setIsConversionModalOpen(false)} onUpdateGraph={setGraph} />
      </div>
    </>
  );
};

export default App;
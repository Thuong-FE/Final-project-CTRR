import React, { useState, useEffect } from 'react';
import GraphCanvas from './components/GraphCanvas';
import { ConversionModal } from './components/ConversionModal';
import { GraphRepresentations } from './components/GraphRepresentations';
import { SAMPLE_GRAPH_DATA, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import LegendPanel from './components/LegendPanel';

// ALGORITHM GROUPS
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
    id: 'advanced',
    title: 'Thuật Toán Nâng Cao',
    options: [
      { label: 'Prim', type: 'PRIM' },
      { label: 'Kruskal', type: 'KRUSKAL' }
    ]
  }
];

const App = () => {
  // ===== GRAPH STATE =====
  const [graph, setGraph] = useState(SAMPLE_GRAPH_DATA);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [startNodeId, setStartNodeId] = useState(null);
  const [endNodeId, setEndNodeId] = useState(null);
  const [mode, setMode] = useState('select');

  // ===== ALGORITHM STATE =====
  const [algorithmResult, setAlgorithmResult] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentStep = algorithmResult?.steps?.[stepIndex] || null;

  // ===== REPRESENTATIONS =====
  const [adjMatrix, setAdjMatrix] = useState([]);
  const [adjList, setAdjList] = useState({});
  const [edgeList, setEdgeList] = useState([]);

  // ===== MODAL =====
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);

  // ===== CALLBACKS FOR GRAPH CANVAS =====
  const handleAddNode = (node) => {
    setGraph(prev => ({ ...prev, nodes: [...prev.nodes, node] }));
  };

  const handleAddLink = (link) => {
    setGraph(prev => ({ ...prev, links: [...prev.links, link] }));
  };

  const handleSelectStart = (id) => setStartNodeId(id);
  const handleSelectEnd = (id) => setEndNodeId(id);

  const handleClearGraph = () => {
    setGraph({ nodes: [], links: [], isDirected: false });
    setAlgorithmResult(null);
    setStepIndex(0);
    setIsPlaying(false);
  };

  // ===== RUN ALGORITHM =====
  const runAlgorithm = async (type) => {
    setAlgorithmResult(null);
    setStepIndex(0);
    setIsPlaying(false);

    try {
      const response = await fetch(`/algo/${type.toLowerCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph,
          start_id: startNodeId,
          end_id: endNodeId
        })
      });

      const result = await response.json();
      setAlgorithmResult(result);

      if (result.steps?.length > 1) {
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error running algorithm:', err);
    }
  };

  // ===== STEP ANIMATION =====
  useEffect(() => {
    if (!isPlaying || !algorithmResult?.steps) return;

    const timer = setInterval(() => {
      setStepIndex(prev => {
        if (prev >= algorithmResult.steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [isPlaying, algorithmResult]);

  // ===== CONVERT REPRESENTATION =====
  const convertRepresentation = async (typeFrom, data) => {
    try {
      const res = await fetch(`/from_${typeFrom}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const newGraph = await res.json();
      setGraph(newGraph);
    } catch (err) {
      console.error('Convert failed:', err);
    }
  };

  // ===== FETCH REPRESENTATIONS =====
  const fetchRepresentations = async () => {
    try {
      const res1 = await fetch('/to_matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graph)
      });
      const { matrix } = await res1.json();
      setAdjMatrix(matrix);
  
      const res2 = await fetch('/to_adj_list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graph)
      });
      const { adj_list } = await res2.json();
      setAdjList(adj_list);
  
      const res3 = await fetch('/to_edge_list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graph)
      });
      const { edge_list } = await res3.json();
      setEdgeList(edge_list);
    } catch {
      console.error('Fetch representations failed');
    }
  };
  

  const handleOpenConversion = async () => {
    await fetchRepresentations();   // backend call
    setIsConversionModalOpen(true); // mở modal sau khi có data
  };
  

  // ===== UI =====
  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-white">
  
      {/* LEFT COLUMN – CỐ ĐỊNH 200px */}
      <div
        className="flex flex-col border-r border-gray-700 overflow-hidden shrink-0"
        style={{ width: '200px' }}
      >
        {/* CONTROL PANEL */}
        <div className="p-4 border-b border-gray-700 shrink-0">
          <select
            value={mode}
            onChange={e => setMode(e.target.value)}
            className="w-full mb-2 p-2 bg-gray-800 rounded"
          >
            <option value="select">Select</option>
            <option value="add_node">Add Node</option>
            <option value="add_link">Add Link</option>
            <option value="set_start">Set Start</option>
            <option value="set_end">Set End</option>
          </select>
  
          <button
            onClick={handleClearGraph}
            className="w-full mb-3 p-2 bg-red-600 rounded"
          >
            Clear Graph
          </button>
  
          <h3 className="font-bold mb-2">Algorithms</h3>
  
          {ALGO_GROUPS.map(group => (
            <div key={group.id} className="mb-3">
              <p className="text-sm text-gray-400">{group.title}</p>
              {group.options.map(opt => (
                <button
                  key={opt.type}
                  onClick={() => runAlgorithm(opt.type)}
                  className="w-full mt-1 p-1 bg-gray-800 rounded"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ))}
  
          <button
            onClick={handleOpenConversion}
            className="w-full p-2 bg-purple-600 rounded"
          >
            Convert Representation
          </button>
        </div>
  
        {/* LEGEND – KHÓA CHIỀU CAO */}
        <div className="shrink-0 border-b border-gray-700 max-h-[160px] overflow-y-auto">
          <LegendPanel
            algorithmResult={algorithmResult}
            startNodeId={startNodeId}
            endNodeId={endNodeId}
          />
        </div>
  
        {/* REPRESENTATIONS – CHỈ PHẦN NÀY SCROLL */}
        <div className="flex-1 overflow-y-auto p-3">
          <GraphRepresentations
            graphData={graph}
            adjList={adjList}
            adjMatrix={adjMatrix}
            edgeList={edgeList}
          />
        </div>
      </div>
  
      {/* RIGHT – CANVAS ĂN PHẦN CÒN LẠI */}
      <div className="flex-1 overflow-hidden">
        <GraphCanvas
          graph={graph}
          setGraph={setGraph}
          mode={mode}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
          selectedLink={selectedLink}
          setSelectedLink={setSelectedLink}
          startNodeId={startNodeId}
          endNodeId={endNodeId}
          currentStep={currentStep}
          onAddNode={handleAddNode}
          onAddLink={handleAddLink}
          onSelectStart={handleSelectStart}
          onSelectEnd={handleSelectEnd}
        />
      </div>
  
      {/* MODAL */}
      <ConversionModal
        graph={graph}
        isOpen={isConversionModalOpen}
        onClose={() => setIsConversionModalOpen(false)}
        onConvert={convertRepresentation}
      />
    </div>
  );
  

};

export default App;

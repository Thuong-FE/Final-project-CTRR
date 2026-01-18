// src/components/GraphCanvas.jsx
import React, { useRef, useState } from 'react';
import { DEFAULT_NODE_RADIUS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

const GraphCanvas = ({ graph, setGraph, mode, selectedNodeId, setSelectedNodeId, selectedLink, setSelectedLink, startNodeId, setStartNodeId, endNodeId, setEndNodeId, currentStep, algorithmResult, algorithmType }) => {
  const svgRef = useRef(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [tempLinkSource, setTempLinkSource] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [weightModal, setWeightModal] = useState(null);
  const [nodeModal, setNodeModal] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Allow empty graphs - don't fallback to sample data

  const getMousePos = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();

    // Convert client coordinates to SVG viewBox coordinates
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    setMousePos(pos);
    setIsDragging(false);

    // Detect double-click
    const now = Date.now();
    const isDoubleClick = now - lastClickTime < 300;
    setLastClickTime(now);

    const clickedNode = graph.nodes.find(n => Math.hypot(n.x - pos.x, n.y - pos.y) < DEFAULT_NODE_RADIUS);
    if (clickedNode) {
      if (mode === 'select') {
        if (!isDoubleClick) {
          setDraggingNodeId(clickedNode.id);
        }
        setSelectedNodeId(clickedNode.id);
        setSelectedLink(null);
      } else if (mode === 'add_link') {
        if (!tempLinkSource) {
          setTempLinkSource(clickedNode.id);
        } else if (tempLinkSource !== clickedNode.id) {
          setGraph(prev => ({
            ...prev,
            links: [...prev.links, {
              source: tempLinkSource,
              target: clickedNode.id,
              weight: 0,  // Empty weight
              capacity: 0
            }]
          }));
          setTempLinkSource(null);
        }
      } else if (mode === 'delete_node') {
        // Delete node and all connected links
        setGraph(prev => ({
          ...prev,
          nodes: prev.nodes.filter(n => n.id !== clickedNode.id),
          links: prev.links.filter(l => l.source !== clickedNode.id && l.target !== clickedNode.id)
        }));
        setSelectedNodeId(null);
      } else if (mode === 'set_start') {
        setStartNodeId(clickedNode.id);
      } else if (mode === 'set_end') {
        setEndNodeId(clickedNode.id);
      }
      return;
    }

    if (mode === 'add_node') {
      const label = prompt('Nhập nhãn cho nút mới:', '');
      if (label === null) return; // Cancelled

      const newId = `node_${Date.now()}`; // Use timestamp for unique ID
      setGraph(prev => ({
        ...prev,
        nodes: [...prev.nodes, {
          id: newId,
          x: pos.x,
          y: pos.y,
          label: label,
          type: 'pc'
        }]
      }));
    }

    // Click on link - improved detection with larger hit area
    const clickedLink = graph.links.find(l => {
      const s = graph.nodes.find(n => n.id === l.source);
      const t = graph.nodes.find(n => n.id === l.target);
      if (!s || !t) return false;

      // Calculate distance from point to line segment
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const lengthSquared = dx * dx + dy * dy;

      if (lengthSquared === 0) {
        // Source and target are the same point
        return Math.hypot(s.x - pos.x, s.y - pos.y) < 30;
      }

      // Parameter t represents position on line segment (0 to 1)
      const param = Math.max(0, Math.min(1, ((pos.x - s.x) * dx + (pos.y - s.y) * dy) / lengthSquared));

      // Find closest point on line segment
      const closestX = s.x + param * dx;
      const closestY = s.y + param * dy;

      // Check if click is within 30px of line
      return Math.hypot(closestX - pos.x, closestY - pos.y) < 30;
    });

    if (clickedLink) {
      if (mode === 'select') {
        setSelectedLink(clickedLink);
        setSelectedNodeId(null);
      } else if (mode === 'delete_edge') {
        // Delete edge
        setGraph(prev => ({
          ...prev,
          links: prev.links.filter(l => !(l.source === clickedLink.source && l.target === clickedLink.target))
        }));
        setSelectedLink(null);
      }
    }
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);
    setMousePos(pos);

    if (draggingNodeId && !isDragging) {
      // Start dragging only if mouse moved more than 5px
      const distance = Math.hypot(pos.x - mousePos.x, pos.y - mousePos.y);
      if (distance > 5) {
        setIsDragging(true);
      }
    }

    if (draggingNodeId && isDragging) {
      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === draggingNodeId ? { ...n, x: pos.x, y: pos.y } : n)
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleDoubleClick = (e) => {
    if (mode !== 'select') return; // Only allow edit in select mode

    e.preventDefault();
    e.stopPropagation();

    const pos = getMousePos(e);
    setDraggingNodeId(null); // Cancel any drag
    setIsDragging(false);

    // Node edit
    const dblNode = graph.nodes.find(n => Math.hypot(n.x - pos.x, n.y - pos.y) < DEFAULT_NODE_RADIUS);
    if (dblNode) {
      setNodeModal({ ...dblNode });
      return;
    }

    // Link edit - same improved detection as click
    const dblLink = graph.links.find(l => {
      const s = graph.nodes.find(n => n.id === l.source);
      const t = graph.nodes.find(n => n.id === l.target);
      if (!s || !t) return false;

      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const lengthSquared = dx * dx + dy * dy;

      if (lengthSquared === 0) {
        return Math.hypot(s.x - pos.x, s.y - pos.y) < 30;
      }

      const param = Math.max(0, Math.min(1, ((pos.x - s.x) * dx + (pos.y - s.y) * dy) / lengthSquared));
      const closestX = s.x + param * dx;
      const closestY = s.y + param * dy;

      return Math.hypot(closestX - pos.x, closestY - pos.y) < 30;
    });

    if (dblLink) {
      setWeightModal({ ...dblLink });
    }
  };

  const updateNode = (updated) => {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === updated.id ? updated : n)
    }));
    setNodeModal(null);
  };

  const updateLink = (updated) => {
    setGraph(prev => ({
      ...prev,
      links: prev.links.map(l => (l.source === updated.source && l.target === updated.target) ? updated : l)
    }));
    setWeightModal(null);
  };

  const deleteSelected = () => {
    if (selectedNodeId) {
      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.filter(n => n.id !== selectedNodeId),
        links: prev.links.filter(l => l.source !== selectedNodeId && l.target !== selectedNodeId)
      }));
      setSelectedNodeId(null);
    } else if (selectedLink) {
      setGraph(prev => ({
        ...prev,
        links: prev.links.filter(l => (l.source !== selectedLink.source || l.target !== selectedLink.target))
      }));
      setSelectedLink(null);
    }
  };

  const getLinkStyle = (l) => {
    const s = l.source;
    const t = l.target;
    let color = '#52525b';
    let width = 2;
    let markerId = 'arrow-gray';

    const matches = (u, v) => (s === u && t === v) || (!graph.isDirected && s === v && t === u);
    const isHovered = hoveredEdge && matches(hoveredEdge.source, hoveredEdge.target);

    // Check if edge is visited in Fleury/Hierholzer
    const isVisited = currentStep?.visitedLinks?.some(vl => matches(vl.source, vl.target));

    if (selectedLink && matches(selectedLink.source, selectedLink.target)) {
      color = '#ef4444';
      width = 3;
      markerId = 'arrow-red';
    } else if (currentStep?.currentLinkId && matches(currentStep.currentLinkId.source, currentStep.currentLinkId.target)) {
      color = '#fbbf24';
      width = 4;
      markerId = 'arrow-amber';
    } else if (isVisited) {
      // Visited edges in Euler algorithms - green color
      color = '#22c55e';
      width = 3;
      markerId = 'arrow-green';
    } else if (algorithmResult?.path) {
      const path = algorithmResult.path;
      for (let i = 0; i < path.length - 1; i++) {
        if (matches(path[i], path[i + 1])) {
          color = '#eab308';
          width = 3;
          markerId = 'arrow-yellow';
          break;
        }
      }
    } else if (algorithmResult?.mstLinks?.some(m => matches(m.source, m.target))) {
      color = '#06b6d4';
      width = 3;
      markerId = 'arrow-cyan';
    } else if (algorithmResult?.flowDetails && algorithmResult.flowDetails[`${s}-${t}`] > 0) {
      color = '#06b6d4';
      width = 3;
      markerId = 'arrow-cyan';
    } else if (isHovered) {
      color = '#60a5fa';
      width = 3;
      markerId = 'arrow-blue';
    }

    return { color, width, markerId };
  };

  const getNodeStyle = (n) => {
    let fill = '#18181b';
    let stroke = '#52525b';
    let strokeWidth = 2;
    let isProcessing = false;

    if (n.id === selectedNodeId) {
      stroke = '#22d3ee';
      strokeWidth = 3;
    }
    if (n.id === startNodeId) {
      stroke = '#22c55e';
      strokeWidth = 3;
    }
    if (n.id === endNodeId) {
      stroke = '#ef4444';
      strokeWidth = 3;
    }
    if (currentStep?.currentNodeId === n.id) {
      fill = '#eab308';
      isProcessing = true;
    }
    if (currentStep?.visited?.includes(n.id)) {
      fill = '#22c55e';
    }
    // Bipartite coloring
    if (algorithmResult?.bipartiteSets) {
      if (algorithmResult.bipartiteSets.setA?.includes(n.id)) {
        fill = '#22c55e';
      } else if (algorithmResult.bipartiteSets.setB?.includes(n.id)) {
        fill = '#ef4444';
      }
    }

    return { fill, stroke, strokeWidth, isProcessing };
  };

  return (
    <div className="relative h-full" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onDoubleClick={handleDoubleClick}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        style={{ background: '#0f172a' }}
      >
        <defs>
          {/* Arrow markers for different colors */}
          <marker id="arrow-gray" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#52525b" />
          </marker>
          <marker id="arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
          <marker id="arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
          </marker>
          <marker id="arrow-yellow" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#eab308" />
          </marker>
          <marker id="arrow-cyan" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
          </marker>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#60a5fa" />
          </marker>
        </defs>

        {/* Edges */}
        {graph.links.map((l, i) => {
          const source = graph.nodes.find(n => n.id === l.source);
          const target = graph.nodes.find(n => n.id === l.target);
          if (!source || !target) return null;

          const style = getLinkStyle(l);
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist === 0) return null;

          const normX = dx / dist;
          const normY = dy / dist;
          const sourceX = source.x + DEFAULT_NODE_RADIUS * normX;
          const sourceY = source.y + DEFAULT_NODE_RADIUS * normY;
          const targetX = target.x - (DEFAULT_NODE_RADIUS + 4) * normX;
          const targetY = target.y - (DEFAULT_NODE_RADIUS + 4) * normY;

          // Midpoint for label
          const midX = (sourceX + targetX) / 2;
          const midY = (sourceY + targetY) / 2;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredEdge(l)}
              onMouseLeave={() => setHoveredEdge(null)}
              style={{ cursor: 'pointer' }}
            >
              <line
                x1={sourceX}
                y1={sourceY}
                x2={targetX}
                y2={targetY}
                stroke={style.color}
                strokeWidth={style.width}
                markerEnd={graph.isDirected ? `url(#${style.markerId})` : ''}
                style={{ transition: 'stroke 200ms ease, stroke-width 200ms ease' }}
              />
              {/* Edge label background */}
              <rect
                x={midX - 12}
                y={midY - 9}
                width={24}
                height={16}
                rx={4}
                fill="#18181b"
                fillOpacity={0.9}
              />
              <text
                x={midX}
                y={midY + 3}
                fill="#a1a1aa"
                fontSize="11"
                fontFamily="Inter, system-ui, sans-serif"
                textAnchor="middle"
              >
                {algorithmType === 'FORD_FULKERSON' ? l.capacity : l.weight}
              </text>
            </g>
          );
        })}

        {/* Temp link for drawing */}
        {tempLinkSource && (() => {
          const srcNode = graph.nodes.find(n => n.id === tempLinkSource);
          return srcNode ? (
            <line
              x1={srcNode.x}
              y1={srcNode.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#60a5fa"
              strokeWidth="2"
              strokeDasharray="6,4"
              style={{ opacity: 0.8 }}
            />
          ) : null;
        })()}

        {/* Nodes */}
        {graph.nodes.map(n => {
          const nodeStyle = getNodeStyle(n);

          return (
            <g
              key={n.id}
              transform={`translate(${n.x}, ${n.y})`}
              style={{
                cursor: mode === 'select' ? 'grab' : 'pointer',
                transition: 'transform 75ms ease'
              }}
              className={nodeStyle.isProcessing ? 'node-processing' : ''}
            >
              {/* Node circle */}
              <circle
                r={DEFAULT_NODE_RADIUS}
                fill={nodeStyle.fill}
                stroke={nodeStyle.stroke}
                strokeWidth={nodeStyle.strokeWidth}
                style={{ transition: 'fill 200ms ease, stroke 200ms ease' }}
              />
              {/* Node label inside */}
              <text
                y={4}
                fill="#ffffff"
                fontSize="13"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="500"
                textAnchor="middle"
              >
                {n.label || n.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Node Edit Modal */}
      {nodeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#18181b] p-6 rounded-lg border border-[#3f3f46] w-80 shadow-2xl">
            <h3 className="text-[#22d3ee] text-base font-semibold mb-4">Sửa Nút</h3>
            <label className="block text-xs text-[#a1a1aa] mb-1">Nhãn</label>
            <input
              value={nodeModal.label}
              onChange={e => setNodeModal({ ...nodeModal, label: e.target.value })}
              className="w-full p-2 bg-[#27272a] border border-[#3f3f46] rounded-md mb-4 text-sm focus:border-[#22d3ee] focus:outline-none"
              placeholder="Nhãn"
            />
            <label className="block text-xs text-[#a1a1aa] mb-1">Loại nút</label>
            <select
              value={nodeModal.type}
              onChange={e => setNodeModal({ ...nodeModal, type: e.target.value })}
              className="w-full p-2 bg-[#27272a] border border-[#3f3f46] rounded-md mb-4 text-sm"
            >
              <option value="pc">Node</option>
              <option value="router">Router</option>
              <option value="switch">Switch</option>
              <option value="server">Server</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setNodeModal(null)} className="px-4 py-2 bg-[#27272a] rounded-md text-sm hover:bg-[#3f3f46]">Hủy</button>
              <button onClick={() => updateNode(nodeModal)} className="px-4 py-2 bg-[#22d3ee] text-black rounded-md text-sm font-medium">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Weight Edit Modal */}
      {weightModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#18181b] p-6 rounded-lg border border-[#3f3f46] w-80 shadow-2xl">
            <h3 className="text-[#22d3ee] text-base font-semibold mb-4">Sửa Cạnh</h3>
            <label className="block text-xs text-[#a1a1aa] mb-1">Trọng số</label>
            <input
              type="number"
              value={weightModal.weight}
              onChange={e => setWeightModal({ ...weightModal, weight: parseInt(e.target.value) || 1 })}
              className="w-full p-2 bg-[#27272a] border border-[#3f3f46] rounded-md mb-4 text-sm focus:border-[#22d3ee] focus:outline-none"
              placeholder="Trọng số"
            />
            <label className="block text-xs text-[#a1a1aa] mb-1">Dung lượng (cho thuật toán luồng)</label>
            <input
              type="number"
              value={weightModal.capacity}
              onChange={e => setWeightModal({ ...weightModal, capacity: parseInt(e.target.value) || 1 })}
              className="w-full p-2 bg-[#27272a] border border-[#3f3f46] rounded-md mb-4 text-sm focus:border-[#22d3ee] focus:outline-none"
              placeholder="Dung lượng"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setWeightModal(null)} className="px-4 py-2 bg-[#27272a] rounded-md text-sm hover:bg-[#3f3f46]">Hủy</button>
              <button onClick={() => updateLink(weightModal)} className="px-4 py-2 bg-[#22d3ee] text-black rounded-md text-sm font-medium">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Button if something selected */}
      {(selectedNodeId || selectedLink) && (
        <button
          onClick={deleteSelected}
          className="absolute top-4 right-4 bg-[#ef4444] hover:bg-[#dc2626] p-2.5 rounded-lg shadow-lg flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span className="text-sm font-medium">Xóa</span>
        </button>
      )}
    </div>
  );
};

export default GraphCanvas;

// File: src/Api.js
// API layer kết nối Frontend React ↔ Backend FastAPI

const BASE_URL = "http://localhost:8000"; 
// nếu deploy chung thì có thể để ""

/* =======================
   GRAPH SAVE / LOAD
======================= */

export async function saveGraph(graph) {
  const res = await fetch(`${BASE_URL}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(graph),
  });
  if (!res.ok) throw new Error("Save graph failed");
  return res.json();
}

export async function loadGraph() {
  const res = await fetch(`${BASE_URL}/load`);
  if (!res.ok) throw new Error("Load graph failed");
  return res.json();
}

/* =======================
   ALGORITHM RUNNERS
======================= */

export async function runBFS(graph, start_id) {
  return runAlgo("/bfs", { graph, start_id });
}

export async function runDFS(graph, start_id) {
  return runAlgo("/dfs", { graph, start_id });
}

export async function runDijkstra(graph, start_id, end_id = null) {
  return runAlgo("/dijkstra", { graph, start_id, end_id });
}

export async function runBellmanFord(graph, start_id, end_id = null) {
  return runAlgo("/bellman_ford", { graph, start_id, end_id });
}

export async function runPrim(graph) {
  return runAlgo("/prim", graph);
}

export async function runKruskal(graph) {
  return runAlgo("/kruskal", graph);
}

export async function runFordFulkerson(graph, start_id, end_id) {
  if (!start_id || !end_id)
    throw new Error("Ford-Fulkerson cần start_id và end_id");
  return runAlgo("/ford_fulkerson", { graph, start_id, end_id });
}

export async function runFleury(graph) {
  return runAlgo("/fleury", graph);
}

export async function runHierholzer(graph) {
  return runAlgo("/hierholzer", graph);
}

export async function checkBipartite(graph) {
  return runAlgo("/bipartite", graph);
}

/* =======================
   REPRESENTATION CONVERT
======================= */

export async function toAdjacencyMatrix(graph) {
  const res = await runAlgo("/to_matrix", graph);
  return res.matrix;
}

export async function toAdjacencyList(graph) {
  const res = await runAlgo("/to_adj_list", graph);
  return res.adj_list;
}

export async function toEdgeList(graph) {
  const res = await runAlgo("/to_edge_list", graph);
  return res.edge_list;
}

export async function fromAdjacencyMatrix(matrix, is_directed, labels = null) {
  return runAlgo("/from_matrix", {
    type_from: "matrix",
    data: matrix,
    is_directed,
    labels,
  });
}

export async function fromAdjacencyList(adjList, is_directed) {
  return runAlgo("/from_adj_list", {
    type_from: "adj_list",
    data: adjList,
    is_directed,
  });
}

export async function fromEdgeList(edgeList, is_directed) {
  return runAlgo("/from_edge_list", {
    type_from: "edge_list",
    data: edgeList,
    is_directed,
  });
}

/* =======================
   INTERNAL HELPER
======================= */

async function runAlgo(endpoint, payload) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API Error");
  }

  return res.json();
}

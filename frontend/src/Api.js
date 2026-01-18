// Corrected File: src/Api.js (Added missing imports if any, ensured all endpoints)
const BASE_URL = "http://localhost:8000";

export async function saveGraph(graph) {
  const res = await fetch(`${BASE_URL}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(graph),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function loadGraph() {
  const res = await fetch(`${BASE_URL}/load`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function post(endpoint, payload) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const runBFS = (graph, startId) => post("/bfs", { graph, startId });
export const runDFS = (graph, startId) => post("/dfs", { graph, startId });
export const runDijkstra = (graph, startId, endId) => post("/dijkstra", { graph, startId, endId });
export const runBellmanFord = (graph, startId, endId) => post("/bellmanFord", { graph, startId, endId });
export const runPrim = (graph) => post("/prim", graph);
export const runKruskal = (graph) => post("/kruskal", graph);
export const runFordFulkerson = (graph, startId, endId) => post("/fordFulkerson", { graph, startId, endId });
export const runFleury = (graph) => post("/fleury", graph);
export const runHierholzer = (graph) => post("/hierholzer", graph);
export const checkBipartite = (graph) => post("/bipartite", graph);

export const toAdjacencyMatrix = (graph) => post("/toMatrix", graph).then(r => r.matrix);
export const toAdjacencyList = (graph) => post("/toAdjList", graph).then(r => r.adjList);
export const toEdgeList = (graph) => post("/toEdgeList", graph).then(r => r.edgeList);

export const fromAdjacencyMatrix = (matrix, isDirected, labels) => post("/fromMatrix", { typeFrom: "matrix", data: matrix, isDirected, labels });
export const fromAdjacencyList = (adjList, isDirected) => post("/fromAdjList", { typeFrom: "adjList", data: adjList, isDirected });
export const fromEdgeList = (edgeList, isDirected) => post("/fromEdgeList", { typeFrom: "edgeList", data: edgeList, isDirected });
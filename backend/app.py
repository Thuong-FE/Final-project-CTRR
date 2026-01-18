# Corrected File: app.py (Completed endpoints, added missing ones if any, ensured CORS)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from graph_logic import *
from typing import List, Dict, Any, Optional

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def sanitize_for_json(obj):
    """Convert inf/nan values to None for JSON serialization"""
    if hasattr(obj, '__dict__'):
        # Handle custom objects like AlgorithmResult, AlgorithmStep
        return sanitize_for_json(obj.__dict__)
    elif isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_for_json(item) for item in obj]
    elif isinstance(obj, float):
        if obj == float('inf') or obj == float('-inf') or obj != obj:  # nan check
            return None
        return obj
    return obj


class GraphInput(BaseModel):
    nodes: List[Dict[str, Any]]
    links: List[Dict[str, Any]]
    isDirected: bool

class AlgoInput(BaseModel):
    graph: GraphInput
    startId: Optional[str] = None
    endId: Optional[str] = None

class ConvertInput(BaseModel):
    data: Any
    isDirected: bool
    typeFrom: str  # 'matrix', 'adjList', 'edgeList'
    labels: Optional[List[str]] = None

@app.post("/save")
async def save_graph(input: GraphInput):
    try:
        with open('graph.json', 'w') as f:
            json.dump(input.dict(), f, indent=4)
        return {"status": "Graph saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/load")
async def load_graph():
    try:
        with open('graph.json', 'r') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        return {"nodes": [], "links": [], "isDirected": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/bfs")
async def api_bfs(input: AlgoInput):
    graph = GraphData(input.graph.nodes, input.graph.links, input.graph.isDirected)
    if not input.startId:
        raise HTTPException(status_code=400, detail="Vui lòng chọn đỉnh bắt đầu")
    try:
        return run_bfs(graph, input.startId).__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/dfs")
async def api_dfs(input: AlgoInput):
    graph = GraphData(input.graph.nodes, input.graph.links, input.graph.isDirected)
    if not input.startId:
        raise HTTPException(status_code=400, detail="Vui lòng chọn đỉnh bắt đầu")
    try:
        return run_dfs(graph, input.startId).__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/dijkstra")
async def api_dijkstra(input: AlgoInput):
    if not input.startId:
        raise HTTPException(status_code=400, detail="Vui lòng chọn đỉnh bắt đầu")
    if not input.endId:
        raise HTTPException(status_code=400, detail="Vui lòng chọn đỉnh kết thúc")
    graph = GraphData(input.graph.nodes, input.graph.links, input.graph.isDirected)
    try:
        result = run_dijkstra(graph, input.startId, input.endId)
        return sanitize_for_json(result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/bellmanFord")
async def api_bellman_ford(input: AlgoInput):
    if not input.startId:
        raise HTTPException(status_code=400, detail="Vui lòng chọn đỉnh bắt đầu")
    if not input.endId:
        raise HTTPException(status_code=400, detail="Vui lòng chọn đỉnh kết thúc")
    graph = GraphData(input.graph.nodes, input.graph.links, input.graph.isDirected)
    try:
        result = run_bellman_ford(graph, input.startId, input.endId)
        return sanitize_for_json(result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/prim")
async def api_prim(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.isDirected)
    try:
        return run_prim(graph).__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/kruskal")
async def api_kruskal(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.isDirected)
    try:
        return run_kruskal(graph).__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/fordFulkerson")
async def api_ford_fulkerson(input: AlgoInput):
    graph = GraphData(input.graph.nodes, input.graph.links, input.graph.isDirected)
    if not input.startId or not input.endId:
        raise HTTPException(status_code=400, detail="startId and endId required")
    try:
        return run_ford_fulkerson(graph, input.startId, input.endId).__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/fleury")
async def api_fleury(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.isDirected)
    try:
        return run_fleury(graph).__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/hierholzer")
async def api_hierholzer(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.isDirected)
    try:
        return run_hierholzer(graph).__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/bipartite")
async def api_bipartite(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.isDirected)
    try:
        return check_bipartite(graph).__dict__
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Conversion endpoints
@app.post("/toMatrix")
async def api_to_matrix(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.isDirected)
    return {"matrix": to_adjacency_matrix(graph)}

@app.post("/fromMatrix")
async def api_from_matrix(input: ConvertInput):
    if input.typeFrom != 'matrix':
        raise HTTPException(400, "Invalid typeFrom")
    return from_adjacency_matrix(input.data, input.isDirected, input.labels).__dict__

@app.post("/toEdgeList")
async def api_to_edge_list(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.isDirected)
    return {"edgeList": to_edge_list(graph)}

@app.post("/fromEdgeList")
async def api_from_edge_list(input: ConvertInput):
    if input.typeFrom != 'edgeList':
        raise HTTPException(400, "Invalid typeFrom")
    return from_edge_list(input.data, input.isDirected).__dict__

@app.post("/toAdjList")
async def api_to_adj_list(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.isDirected)
    return {"adjList": to_adjacency_list(graph)}

@app.post("/fromAdjList")
async def api_from_adj_list(input: ConvertInput):
    if input.typeFrom != 'adjList':
        raise HTTPException(400, "Invalid typeFrom")
    return from_adjacency_list(input.data, input.isDirected).__dict__
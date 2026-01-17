# File: app.py
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
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GraphInput(BaseModel):
    nodes: List[Dict[str, Any]]
    links: List[Dict[str, Any]]
    is_directed: bool

class AlgoInput(BaseModel):
    graph: GraphInput
    start_id: Optional[str] = None
    end_id: Optional[str] = None

class ConvertInput(BaseModel):
    data: Any
    is_directed: bool
    type_from: str  # 'matrix', 'adj_list', 'edge_list'
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
        raise HTTPException(status_code=404, detail="No saved graph found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/dijkstra")
async def api_dijkstra(input: AlgoInput):
    graph = GraphData(input.graph.nodes, input.graph.links, input.graph.is_directed)
    return run_dijkstra(graph, input.start_id, input.end_id).__dict__

@app.post("/bellman_ford")
async def api_bellman_ford(input: AlgoInput):
    graph = GraphData(input.graph.nodes, input.graph.links, input.graph.is_directed)
    return run_bellman_ford(graph, input.start_id, input.end_id).__dict__

@app.post("/bfs")
async def api_bfs(input: AlgoInput):
    graph = GraphData(input.graph.nodes, input.graph.links, input.graph.is_directed)
    return run_bfs(graph, input.start_id).__dict__

@app.post("/dfs")
async def api_dfs(input: AlgoInput):
    graph = GraphData(input.graph.nodes, input.graph.links, input.graph.is_directed)
    return run_dfs(graph, input.start_id).__dict__

@app.post("/prim")
async def api_prim(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.is_directed)
    return run_prim(graph).__dict__

@app.post("/kruskal")
async def api_kruskal(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.is_directed)
    return run_kruskal(graph).__dict__

@app.post("/ford_fulkerson")
async def api_ford_fulkerson(input: AlgoInput):
    graph = GraphData(input.graph.nodes, input.graph.links, input.graph.is_directed)
    if not input.start_id or not input.end_id:
        raise HTTPException(status_code=400, detail="Cần start_id và end_id")
    return run_ford_fulkerson(graph, input.start_id, input.end_id).__dict__

@app.post("/fleury")
async def api_fleury(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.is_directed)
    return run_fleury(graph).__dict__

@app.post("/hierholzer")
async def api_hierholzer(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.is_directed)
    return run_hierholzer(graph).__dict__

@app.post("/bipartite")
async def api_bipartite(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.is_directed)
    return check_bipartite(graph).__dict__

# Conversion endpoints
@app.post("/to_matrix")
async def api_to_matrix(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.is_directed)
    return {"matrix": to_adjacency_matrix(graph)}

@app.post("/from_matrix")
async def api_from_matrix(input: ConvertInput):
    if input.type_from != 'matrix':
        raise HTTPException(400, "Type không hợp lệ")
    return from_adjacency_matrix(input.data, input.is_directed, input.labels).__dict__

@app.post("/to_edge_list")
async def api_to_edge_list(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.is_directed)
    return {"edge_list": to_edge_list(graph)}

@app.post("/from_edge_list")
async def api_from_edge_list(input: ConvertInput):
    if input.type_from != 'edge_list':
        raise HTTPException(400, "Type không hợp lệ")
    return from_edge_list(input.data, input.is_directed).__dict__

@app.post("/to_adj_list")
async def api_to_adj_list(input: GraphInput):
    graph = GraphData(input.nodes, input.links, input.is_directed)
    return {"adj_list": to_adjacency_list(graph)}

@app.post("/from_adj_list")
async def api_from_adj_list(input: ConvertInput):
    if input.type_from != 'adj_list':
        raise HTTPException(400, "Type không hợp lệ")
    return from_adjacency_list(input.data, input.is_directed).__dict__py
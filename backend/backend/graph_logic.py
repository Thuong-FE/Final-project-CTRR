# Corrected File: graph_logic.py (Completed truncated parts, implemented all algorithms with steps for visualization)
from typing import List, Dict, Any, Tuple, Optional
from collections import defaultdict, deque
import networkx as nx
from networkx.exception import NetworkXNoPath, NetworkXUnbounded
import heapq
import copy

class GraphData:
    def __init__(self, nodes: List[Dict], links: List[Dict], isDirected: bool):
        self.nodes = nodes
        self.links = links
        self.isDirected = isDirected

class AlgorithmStep:
    def __init__(self, log: str, **kwargs):
        self.log = log
        self.__dict__.update(kwargs)

class AlgorithmResult:
    def __init__(self, logs: List[str] = None, steps: List[AlgorithmStep] = None, **kwargs):
        self.logs = logs or []
        self.steps = steps or []
        self.__dict__.update(kwargs)

def get_adjacency_list(graph: GraphData) -> Dict[str, List[Dict[str, Any]]]:
    adj = defaultdict(list)
    for node in graph.nodes:
        adj[node['id']] = []
    for link in graph.links:
        adj[link['source']].append({'node': link['target'], 'weight': link['weight'], 'capacity': link.get('capacity', link['weight'])})
        if not graph.isDirected:
            adj[link['target']].append({'node': link['source'], 'weight': link['weight'], 'capacity': link.get('capacity', link['weight'])})
    return dict(adj)

def get_label(graph: GraphData, node_id: str) -> str:
    for node in graph.nodes:
        if node['id'] == node_id:
            return node.get('label', node_id)
    return node_id

def reconstruct_path(previous: Dict[str, Optional[str]], end_id: str) -> List[str]:
    path = []
    current = end_id
    visited = set()
    while current:
        if current in visited:
            break
        visited.add(current)
        path.insert(0, current)
        current = previous.get(current)
    return path

def get_edges_from_previous(graph: GraphData, previous: Dict[str, Optional[str]]) -> List[Dict[str, Any]]:
    edges = []
    for node in [n['id'] for n in graph.nodes]:
        p = previous.get(node)
        if p:
            link = next((l for l in graph.links if 
                         (l['source'] == p and l['target'] == node) or 
                         (not graph.isDirected and l['source'] == node and l['target'] == p)), None)
            weight = link['weight'] if link else 0
            edges.append({'source': p, 'target': node, 'weight': weight})
    return edges

def run_bfs(graph: GraphData, start_id: str) -> AlgorithmResult:
    adj = get_adjacency_list(graph)
    visited = set()
    queue = deque([start_id])
    steps = []
    logs = []
    order = []

    steps.append(AlgorithmStep(log=f"Bắt đầu BFS từ {get_label(graph, start_id)}", queue=list(queue)))

    while queue:
        current = queue.popleft()
        if current in visited:
            continue
        visited.add(current)
        order.append(current)
        steps.append(AlgorithmStep(log=f"Thăm {get_label(graph, current)}", currentNodeId=current, visited=list(visited), queue=list(queue)))
        logs.append(f"Thăm {get_label(graph, current)}")

        for neigh in adj[current]:
            if neigh['node'] not in visited:
                queue.append(neigh['node'])
                steps.append(AlgorithmStep(log=f"Thêm {get_label(graph, neigh['node'])} vào hàng đợi", queue=list(queue)))

    return AlgorithmResult(visited=order, steps=steps, logs=logs)

def run_dfs(graph: GraphData, start_id: str) -> AlgorithmResult:
    adj = get_adjacency_list(graph)
    visited = set()
    stack = [start_id]
    steps = []
    logs = []
    order = []

    steps.append(AlgorithmStep(log=f"Bắt đầu DFS từ {get_label(graph, start_id)}", stack=list(stack)))

    while stack:
        current = stack.pop()
        if current in visited:
            continue
        visited.add(current)
        order.append(current)
        steps.append(AlgorithmStep(log=f"Thăm {get_label(graph, current)}", currentNodeId=current, visited=list(visited), stack=list(stack)))
        logs.append(f"Thăm {get_label(graph, current)}")

        for neigh in reversed(adj[current]):  # Reversed for standard DFS order
            if neigh['node'] not in visited:
                stack.append(neigh['node'])
                steps.append(AlgorithmStep(log=f"Thêm {get_label(graph, neigh['node'])} vào stack", stack=list(stack)))

    return AlgorithmResult(visited=order, steps=steps, logs=logs)

def run_dijkstra(graph: GraphData, start_id: str, end_id: Optional[str] = None) -> AlgorithmResult:
    if any(l['weight'] < 0 for l in graph.links):
        raise ValueError("Dijkstra không hỗ trợ trọng số âm")

    adj = get_adjacency_list(graph)
    distances = {n['id']: float('inf') for n in graph.nodes}
    distances[start_id] = 0
    previous = {n['id']: None for n in graph.nodes}
    pq = [(0, start_id)]
    steps = []
    logs = []
    visited = set()

    steps.append(AlgorithmStep(log=f"Bắt đầu Dijkstra từ {get_label(graph, start_id)}", distances=distances.copy(), pq=pq.copy()))

    while pq:
        current_distance, current_node = heapq.heappop(pq)
        if current_node in visited:
            continue
        visited.add(current_node)
        steps.append(AlgorithmStep(log=f"Thăm {get_label(graph, current_node)} với khoảng cách {current_distance}", currentNodeId=current_node, visited=list(visited), distances=distances.copy()))
        logs.append(f"Thăm {get_label(graph, current_node)}: {current_distance}")

        if end_id and current_node == end_id:
            break

        for neigh in adj[current_node]:
            alt = current_distance + neigh['weight']
            if alt < distances[neigh['node']]:
                distances[neigh['node']] = alt
                previous[neigh['node']] = current_node
                heapq.heappush(pq, (alt, neigh['node']))
                steps.append(AlgorithmStep(log=f"Cập nhật khoảng cách đến {get_label(graph, neigh['node'])}: {alt}", distances=distances.copy(), currentLinkId={'source': current_node, 'target': neigh['node']}))

    path = reconstruct_path(previous, end_id) if end_id else None
    return AlgorithmResult(path=path, distances=distances, previous=previous, steps=steps, logs=logs)

def run_bellman_ford(graph: GraphData, start_id: str, end_id: Optional[str] = None) -> AlgorithmResult:
    adj = get_adjacency_list(graph)
    distances = {n['id']: float('inf') for n in graph.nodes}
    distances[start_id] = 0
    previous = {n['id']: None for n in graph.nodes}
    steps = []
    logs = []

    nodes = [n['id'] for n in graph.nodes]
    edges = [(l['source'], l['target'], l['weight']) for l in graph.links]
    if not graph.isDirected:
        edges += [(l['target'], l['source'], l['weight']) for l in graph.links]

    logs.append(f"Bắt đầu Bellman-Ford từ {get_label(graph, start_id)}")
    logs.append(f"Khởi tạo: d[{get_label(graph, start_id)}] = 0, các đỉnh khác = ∞")
    steps.append(AlgorithmStep(
        log=f"Bắt đầu Bellman-Ford từ {get_label(graph, start_id)}",
        distances=distances.copy()
    ))

    for i in range(len(nodes) - 1):
        updated = False
        iteration_updates = []
        
        logs.append(f"--- Vòng lặp {i+1} ---")
        
        # CRITICAL: Use snapshot of distances at START of iteration
        distances_snapshot = distances.copy()
        
        for u, v, w in edges:
            # Use snapshot distances for calculation
            if distances_snapshot[u] != float('inf') and distances_snapshot[u] + w < distances_snapshot[v]:
                new_dist = distances_snapshot[u] + w
                
                # Only record if this is actually an improvement over current distance
                if new_dist < distances[v]:
                    updated = True
                    
                    # Record this update (but don't apply yet within loop)
                    iteration_updates.append({
                        'u': u,
                        'v': v,
                        'new_dist': new_dist
                    })
        
        # Apply all updates AFTER checking all edges
        for update in iteration_updates:
            v = update['v']
            new_dist = update['new_dist']
            distances[v] = new_dist
            
            # Find which edge gave this distance
            for u, target, w in edges:
                if target == v and distances_snapshot[u] + w == new_dist:
                    previous[v] = u
                    break
        
        # Log all updates for this iteration
        if iteration_updates:
            for update in iteration_updates:
                u, v, new_dist = update['u'], update['v'], update['new_dist']
                log_msg = f"Relax {get_label(graph, u)} → {get_label(graph, v)}: {int(new_dist)}"
                logs.append(log_msg)
                
                steps.append(AlgorithmStep(
                    log=log_msg,
                    currentLinkId={'source': u, 'target': v},
                    distances=distances.copy()
                ))
        
        if not updated:
            logs.append("Không có cập nhật, thuật toán hội tụ")
            steps.append(AlgorithmStep(
                log="Không có cập nhật, thuật toán hội tụ",
                distances=distances.copy()
            ))
            break

    # Check negative cycle
    for u, v, w in edges:
        if distances[u] != float('inf') and distances[u] + w < distances[v]:
            raise ValueError("Đồ thị có chu trình âm")

    logs.append("Hoàn thành Bellman-Ford")
    path = reconstruct_path(previous, end_id) if end_id else None
    return AlgorithmResult(path=path, distances=distances, previous=previous, steps=steps, logs=logs)

def run_prim(graph: GraphData) -> AlgorithmResult:
    if graph.isDirected:
        raise ValueError("Prim chỉ hỗ trợ đồ thị vô hướng")

    adj = get_adjacency_list(graph)
    nodes = [n['id'] for n in graph.nodes]
    if not nodes:
        return AlgorithmResult(mstLinks=[])

    start = nodes[0]
    in_mst = set([start])
    mst_links = []
    steps = []
    logs = []
    pq = []

    for neigh in adj[start]:
        heapq.heappush(pq, (neigh['weight'], start, neigh['node']))

    steps.append(AlgorithmStep(log=f"Bắt đầu Prim từ {get_label(graph, start)}", in_mst=list(in_mst), pq=pq.copy()))

    while pq and len(in_mst) < len(nodes):
        w, u, v = heapq.heappop(pq)
        if v in in_mst:
            continue
        in_mst.add(v)
        mst_links.append({'source': u, 'target': v, 'weight': w})
        steps.append(AlgorithmStep(log=f"Thêm cạnh {get_label(graph, u)} - {get_label(graph, v)} ({w})", currentLinkId={'source': u, 'target': v}, mstLinks=mst_links.copy(), in_mst=list(in_mst)))
        logs.append(f"Thêm {get_label(graph, u)} - {get_label(graph, v)} ({w})")

        for neigh in adj[v]:
            if neigh['node'] not in in_mst:
                heapq.heappush(pq, (neigh['weight'], v, neigh['node']))

    return AlgorithmResult(mstLinks=mst_links, steps=steps, logs=logs)

def run_kruskal(graph: GraphData) -> AlgorithmResult:
    if graph.isDirected:
        raise ValueError("Kruskal chỉ hỗ trợ đồ thị vô hướng")

    edges = sorted(graph.links, key=lambda l: l['weight'])
    parent = {n['id']: n['id'] for n in graph.nodes}
    rank = {n['id']: 0 for n in graph.nodes}
    mst_links = []
    steps = []
    logs = []

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def union(x, y):
        px, py = find(x), find(y)
        if px == py:
            return False
        if rank[px] > rank[py]:
            parent[py] = px
        elif rank[px] < rank[py]:
            parent[px] = py
        else:
            parent[py] = px
            rank[px] += 1
        return True

    steps.append(AlgorithmStep(log="Bắt đầu Kruskal", edges=edges.copy()))

    for edge in edges:
        if union(edge['source'], edge['target']):
            mst_links.append(edge)
            steps.append(AlgorithmStep(log=f"Thêm cạnh {get_label(graph, edge['source'])} - {get_label(graph, edge['target'])} ({edge['weight']})", currentLinkId={'source': edge['source'], 'target': edge['target']}, mstLinks=mst_links.copy()))
            logs.append(f"Thêm {get_label(graph, edge['source'])} - {get_label(graph, edge['target'])} ({edge['weight']})")
        if len(mst_links) == len(graph.nodes) - 1:
            break

    return AlgorithmResult(mstLinks=mst_links, steps=steps, logs=logs)

def run_ford_fulkerson(graph: GraphData, source: str, sink: str) -> AlgorithmResult:
    if not graph.isDirected:
        raise ValueError("Ford-Fulkerson yêu cầu đồ thị có hướng")

    residual = copy.deepcopy(graph.links)
    for link in residual:
        link['flow'] = 0

    parent = {}
    max_flow = 0
    steps = []
    logs = []

    def bfs():
        visited = set()
        queue = deque([source])
        parent[source] = None
        visited.add(source)

        while queue:
            u = queue.popleft()
            for link in [l for l in residual if l['source'] == u and l['capacity'] - l['flow'] > 0]:
                v = link['target']
                if v not in visited:
                    queue.append(v)
                    visited.add(v)
                    parent[v] = u
                    if v == sink:
                        return True
        return False

    steps.append(AlgorithmStep(log=f"Bắt đầu Ford-Fulkerson từ {get_label(graph, source)} đến {get_label(graph, sink)}"))

    iteration = 0
    while bfs():
        iteration += 1
        path_flow = float('inf')
        s = sink
        path = []
        path_nodes = []
        
        # Build path from sink to source
        while s != source:
            p = parent[s]
            link = next(l for l in residual if l['source'] == p and l['target'] == s)
            path_flow = min(path_flow, link['capacity'] - link['flow'])
            path.insert(0, {'source': p, 'target': s})
            path_nodes.insert(0, p)
            s = p
        path_nodes.append(sink)

        # Update flows along the path
        max_flow += path_flow
        v = sink
        while v != source:
            u = parent[v]
            forward = next(l for l in residual if l['source'] == u and l['target'] == v)
            forward['flow'] += path_flow

            # Add reverse edge if not exist
            reverse_exists = any(l['source'] == v and l['target'] == u for l in residual)
            if not reverse_exists:
                residual.append({'source': v, 'target': u, 'capacity': 0, 'weight': forward['weight'], 'flow': 0})
            reverse = next(l for l in residual if l['source'] == v and l['target'] == u)
            reverse['flow'] -= path_flow
            v = u

        # Log once per augmenting path with formatted output
        path_str = " → ".join([get_label(graph, node) for node in path_nodes])
        log_msg = f"Lần {iteration}: {path_str}, luồng tăng = {int(path_flow)}, tổng = {int(max_flow)}"
        logs.append(log_msg)
        
        steps.append(AlgorithmStep(
            log=log_msg,
            path=path.copy(),
            flowDetails={f"{e['source']}-{e['target']}": path_flow for e in path}
        ))

    flow_details = {f"{l['source']}-{l['target']}": l['flow'] for l in residual if l['flow'] > 0}
    return AlgorithmResult(maxFlow=max_flow, flowDetails=flow_details, steps=steps, logs=logs)

def run_fleury(graph: GraphData) -> AlgorithmResult:
    if graph.isDirected:
        raise ValueError("Fleury cho đồ thị vô hướng")

    # Build adjacency list with edge tracking
    adj = defaultdict(list)
    for link in graph.links:
        adj[link['source']].append(link['target'])
        adj[link['target']].append(link['source'])
    
    # Check Euler conditions
    degrees = {n['id']: len(adj[n['id']]) for n in graph.nodes}
    odd_count = sum(1 for d in degrees.values() if d % 2 == 1)
    if odd_count not in (0, 2):
        raise ValueError("Đồ thị không Euler (số đỉnh bậc lẻ không là 0 hoặc 2)")

    # Helper function to check if edge is a bridge
    def is_bridge(u, v, adj_copy):
        # Remove edge u-v temporarily
        adj_copy[u].remove(v)
        adj_copy[v].remove(u)
        
        # BFS to check if v is still reachable from u
        if not adj_copy[u]:  # If u has no more edges, not a bridge
            adj_copy[u].append(v)
            adj_copy[v].append(u)
            return False
            
        visited = set()
        queue = deque([u])
        visited.add(u)
        
        while queue:
            node = queue.popleft()
            for neighbor in adj_copy[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        
        # Restore edge
        adj_copy[u].append(v)
        adj_copy[v].append(u)
        
        return v not in visited

    start = next((k for k, v in degrees.items() if v % 2 == 1), graph.nodes[0]['id'])
    current = start
    path = [current]
    visited_links = []
    steps = []
    logs = []

    steps.append(AlgorithmStep(log=f"Bắt đầu Fleury từ {get_label(graph, start)}", visitedLinks=[]))

    # Traverse edges
    while any(adj.values()):  # While there are still edges
        neighbors = list(adj[current])
        
        if not neighbors:
            break
            
        # Choose next edge: prefer non-bridge
        next_vertex = None
        for neighbor in neighbors:
            adj_copy = {k: v[:] for k, v in adj.items()}
            if not is_bridge(current, neighbor, adj_copy):
                next_vertex = neighbor
                break
        
        # If all edges are bridges, take any edge
        if next_vertex is None:
            next_vertex = neighbors[0]
        
        # Remove the edge
        adj[current].remove(next_vertex)
        adj[next_vertex].remove(current)
        
        # Record move
        visited_links.append({'source': current, 'target': next_vertex})
        path.append(next_vertex)
        
        steps.append(AlgorithmStep(
            log=f"Di chuyển từ {get_label(graph, current)} đến {get_label(graph, next_vertex)}", 
            currentLinkId={'source': current, 'target': next_vertex}, 
            visitedLinks=[e.copy() for e in visited_links],
            path=[get_label(graph, p) for p in path]
        ))
        
        current = next_vertex

    logs.append("Đường Euler: " + " → ".join(get_label(graph, p) for p in path))
    return AlgorithmResult(eulerPath=path, steps=steps, logs=logs)

def run_hierholzer(graph: GraphData) -> AlgorithmResult:
    if graph.isDirected:
        raise ValueError("Hierholzer cho đồ thị vô hướng")

    # Build adjacency list
    adj = defaultdict(list)
    for link in graph.links:
        adj[link['source']].append(link['target'])
        adj[link['target']].append(link['source'])
    
    # Sort adjacency lists for deterministic edge selection
    for k in adj:
        adj[k].sort()
    
    # Check Euler conditions
    degrees = {n['id']: len(adj[n['id']]) for n in graph.nodes}
    if any(d % 2 == 1 for d in degrees.values()):
        raise ValueError("Đồ thị không Euler (có đỉnh bậc lẻ)")

    # Helper to build a circuit from a starting vertex with step-by-step visualization
    def build_circuit_with_steps(start, adj_copy, circuit_name, steps, all_visited):
        circuit = [start]
        current = start
        edges_used = []
        
        while True:
            if not adj_copy[current]:
                break
            next_v = adj_copy[current].pop(0)  # Take first edge for smaller circuits
            adj_copy[next_v].remove(current)
            
            edge = {'source': current, 'target': next_v}
            edges_used.append(edge)
            all_visited.append(edge)
            circuit.append(next_v)
            
            # Add step for each edge traversal
            steps.append(AlgorithmStep(
                log=f"{circuit_name}: Đi từ {get_label(graph, current)} → {get_label(graph, next_v)}",
                currentLinkId=edge,
                visitedLinks=[e.copy() for e in all_visited],
                path=[get_label(graph, v) for v in circuit]
            ))
            
            current = next_v
            if current == start:
                break
        
        return circuit, edges_used

    start = graph.nodes[0]['id']
    adj_work = {k: v[:] for k, v in adj.items()}
    
    steps = []
    logs = []
    all_visited_links = []
    
    # B1: Build initial circuit R
    logs.append(f"B1: Xác định chu trình ban đầu R₁ từ đỉnh {get_label(graph, start)}")
    steps.append(AlgorithmStep(
        log=f"B1: Bắt đầu tạo R₁ từ {get_label(graph, start)}",
        currentNodeId=start,
        visitedLinks=[]
    ))
    
    R, edges_R = build_circuit_with_steps(start, adj_work, "R₁", steps, all_visited_links)
    
    R_label = " → ".join(get_label(graph, v) for v in R)
    logs.append(f"B1: Hoàn thành R₁ = {R_label}")
    
    steps.append(AlgorithmStep(
        log=f"B1: R₁ = {R_label}",
        visitedLinks=[e.copy() for e in all_visited_links],
        path=[get_label(graph, v) for v in R]
    ))
    
    iteration = 1
    
    # B2-B6: Merge sub-circuits until all edges are covered
    while any(adj_work.values()):
        # B2: Check if done
        logs.append(f"B2: Kiểm tra - R{iteration} chưa chứa toàn bộ đồ thị")
        
        # B3: Find vertex v in R that still has unused edges
        insert_vertex = None
        insert_index = None
        
        for i, v in enumerate(R):
            if adj_work[v]:
                insert_vertex = v
                insert_index = i
                break
        
        if insert_vertex is None:
            break
        
        logs.append(f"B3: Chọn v{iteration} = {get_label(graph, insert_vertex)} trong R{iteration} (còn cạnh chưa dùng)")
        steps.append(AlgorithmStep(
            log=f"B3: Chọn v{iteration} = {get_label(graph, insert_vertex)} (còn {len(adj_work[insert_vertex])} cạnh chưa dùng)",
            currentNodeId=insert_vertex,
            visitedLinks=[e.copy() for e in all_visited_links],
            path=[get_label(graph, v) for v in R]
        ))
        
        # B4: Build sub-circuit Q from insert_vertex
        logs.append(f"B4: Xác định chu trình Q{iteration} từ v{iteration}")
        steps.append(AlgorithmStep(
            log=f"B4: Bắt đầu tạo Q{iteration} từ {get_label(graph, insert_vertex)}",
            currentNodeId=insert_vertex,
            visitedLinks=[e.copy() for e in all_visited_links]
        ))
        
        Q, edges_Q = build_circuit_with_steps(insert_vertex, adj_work, f"Q{iteration}", steps, all_visited_links)
        
        Q_label = " → ".join(get_label(graph, v) for v in Q)
        logs.append(f"B4: Hoàn thành Q{iteration} = {Q_label}")
        
        steps.append(AlgorithmStep(
            log=f"B4: Q{iteration} = {Q_label}",
            visitedLinks=[e.copy() for e in all_visited_links],
            path=[get_label(graph, v) for v in Q]
        ))
        
        # B5: Merge Q into R at insert_index
        new_R = R[:insert_index] + Q + R[insert_index+1:]
        R = new_R
        
        iteration += 1
        R_label = " → ".join(get_label(graph, v) for v in R)
        logs.append(f"B5: Gộp Q vào R → R{iteration} = {R_label}")
        
        steps.append(AlgorithmStep(
            log=f"B5: Gộp Q{iteration-1} vào R{iteration-1} → R{iteration}",
            visitedLinks=[e.copy() for e in all_visited_links],
            path=[get_label(graph, v) for v in R]
        ))
        
        # B6: Increment i
        logs.append(f"B6: Tăng i = {iteration}, quay lại B2")
    
    final_label = " → ".join(get_label(graph, v) for v in R)
    logs.append(f"B2: Hoàn thành - Chu trình Euler: {final_label}")
    
    steps.append(AlgorithmStep(
        log=f"KẾT THÚC: Chu trình Euler = {final_label}",
        visitedLinks=[e.copy() for e in all_visited_links],
        path=[get_label(graph, v) for v in R]
    ))
    
    return AlgorithmResult(eulerPath=R, steps=steps, logs=logs)

def check_bipartite(graph: GraphData) -> AlgorithmResult:
    adj = get_adjacency_list(graph)
    color = {n['id']: -1 for n in graph.nodes}  # -1: uncolored, 0/1: colors
    setA, setB = [], []
    steps = []
    logs = []

    def bfs(start):
        queue = deque([start])
        color[start] = 0
        setA.append(start)
        while queue:
            u = queue.popleft()
            steps.append(AlgorithmStep(log=f"Thăm {get_label(graph, u)} với màu {color[u]}", currentNodeId=u, bipartiteSets={'setA': setA.copy(), 'setB': setB.copy()}))
            for neigh in adj[u]:
                v = neigh['node']
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    if color[v] == 0:
                        setA.append(v)
                    else:
                        setB.append(v)
                    queue.append(v)
                elif color[v] == color[u]:
                    return False
        return True

    is_bipartite = True
    for node in [n['id'] for n in graph.nodes]:
        if color[node] == -1:
            if not bfs(node):
                is_bipartite = False
                logs.append("Không phải đồ thị hai phía")
                break
    if is_bipartite:
        logs.append("Là đồ thị hai phía")

    return AlgorithmResult(isBipartite=is_bipartite, bipartiteSets={'setA': setA, 'setB': setB}, steps=steps, logs=logs)

def to_adjacency_matrix(graph: GraphData) -> List[List[int]]:
    # Sort nodes by numeric value if possible, otherwise by string
    nodes = sorted([n['id'] for n in graph.nodes], key=lambda x: (int(x) if x.isdigit() else float('inf'), x))
    node_index = {node: i for i, node in enumerate(nodes)}
    matrix = [[0] * len(nodes) for _ in nodes]
    for link in graph.links:
        i = node_index[link['source']]
        j = node_index[link['target']]
        matrix[i][j] = 1  # Use 1 for presence of edge, not weight
        if not graph.isDirected:
            matrix[j][i] = 1
    return matrix

def from_adjacency_matrix(matrix: List[List[int]], is_directed: bool, labels: Optional[List[str]] = None) -> GraphData:
    n = len(matrix)
    if labels is None:
        labels = [str(i+1) for i in range(n)]
    nodes = [{'id': str(i+1), 'label': labels[i], 'type': 'pc', 'x': (i % 5) * 150 + 100, 'y': (i // 5) * 150 + 100} for i in range(n)]
    links = []
    for i in range(n):
        for j in range(n if is_directed else i+1, n):
            if matrix[i][j] > 0:
                links.append({'source': nodes[i]['id'], 'target': nodes[j]['id'], 'weight': matrix[i][j], 'capacity': 100})
    return GraphData(nodes, links, is_directed)

def to_edge_list(graph: GraphData) -> List[Tuple[str, str, int]]:
    return [(get_label(graph, link['source']), get_label(graph, link['target']), link['weight']) for link in graph.links]

def from_edge_list(edge_list: List[Tuple[str, str, int]], is_directed: bool) -> GraphData:
    node_map = {}
    node_id = 1
    for u, v, _ in edge_list:
        if u not in node_map:
            node_map[u] = str(node_id)
            node_id += 1
        if v not in node_map:
            node_map[v] = str(node_id)
            node_id += 1
    nodes = [{'id': node_map[label], 'label': label, 'type': 'pc', 'x': (i % 5) * 150 + 100, 'y': (i // 5) * 150 + 100} for i, label in enumerate(node_map)]
    links = [{'source': node_map[u], 'target': node_map[v], 'weight': w, 'capacity': 100} for u, v, w in edge_list]
    return GraphData(nodes, links, is_directed)

def to_adjacency_list(graph: GraphData) -> Dict[str, List[str]]:
    adj = defaultdict(list)
    for link in graph.links:
        s_label = get_label(graph, link['source'])
        t_label = get_label(graph, link['target'])
        adj[s_label].append(t_label)
        if not graph.isDirected:
            adj[t_label].append(s_label)
    # Sort neighbors for each node and return sorted dict
    sorted_items = sorted(adj.items(), key=lambda x: (int(x[0]) if x[0].isdigit() else float('inf'), x[0]))
    return {k: sorted(v, key=lambda x: (int(x) if x.isdigit() else float('inf'), x)) for k, v in sorted_items}

def from_adjacency_list(adj_list: Dict[str, List[Tuple[str, int]]], is_directed: bool) -> GraphData:
    node_map = {}
    node_id = 1
    for label in adj_list:
        if label not in node_map:
            node_map[label] = str(node_id)
            node_id += 1
    for neighbors in adj_list.values():
        for v, _ in neighbors:
            if v not in node_map:
                node_map[v] = str(node_id)
                node_id += 1
    nodes = [{'id': node_map[label], 'label': label, 'type': 'pc', 'x': (i % 5) * 150 + 100, 'y': (i // 5) * 150 + 100} for i, label in enumerate(node_map)]
    links = []
    seen = set()
    for s_label in adj_list:
        for t_label, w in adj_list[s_label]:
            key = tuple(sorted([s_label, t_label])) if not is_directed else (s_label, t_label)
            if key not in seen:
                links.append({'source': node_map[s_label], 'target': node_map[t_label], 'weight': w, 'capacity': 100})
                seen.add(key)
    return GraphData(nodes, links, is_directed)
# File: graph_logic.py
from typing import List, Dict, Any, Tuple, Optional
from collections import defaultdict, deque
import copy
import networkx as nx
from networkx.exception import NetworkXNoPath, NetworkXUnbounded

class GraphData:
    def __init__(self, nodes: List[Dict], links: List[Dict], is_directed: bool):
        self.nodes = nodes
        self.links = links
        self.is_directed = is_directed

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
        if not graph.is_directed:
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
                         (not graph.is_directed and l['source'] == node and l['target'] == p)), None)
            weight = link['weight'] if link else 0
            edges.append({'source': p, 'target': node, 'weight': weight})
    return edges

def run_dijkstra(graph: GraphData, start_id: str, end_id: Optional[str] = None) -> AlgorithmResult:
    logs = []
    steps = []
    if any(l['weight'] < 0 for l in graph.links):
        error_log = "LỖI OSPF: Phát hiện Metric âm. OSPF không hỗ trợ trọng số âm."
        logs.append(error_log)
        steps.append(AlgorithmStep(error_log))
        return AlgorithmResult(logs=logs, steps=steps)
    
    G = nx.DiGraph() if graph.is_directed else nx.Graph()
    for node in graph.nodes:
        G.add_node(node['id'])
    for link in graph.links:
        G.add_edge(link['source'], link['target'], weight=link['weight'])
    
    try:
        if end_id:
            path = nx.shortest_path(G, start_id, end_id, weight='weight')
            length = nx.shortest_path_length(G, start_id, end_id, weight='weight')
            path_labels = ' -> '.join(get_label(graph, n) for n in path)
            success_log = f"Định tuyến thành công: {path_labels} (Tổng Metric: {length})"
            logs.append(success_log)
            steps.append(AlgorithmStep(success_log, path=path, visited=path))
            return AlgorithmResult(path=path, visited=path, logs=logs, steps=steps)
        else:
            paths = nx.single_source_shortest_path(G, start_id)
            mst_links = []
            visited = list(paths.keys())
            for target, path in paths.items():
                if target != start_id:
                    for i in range(len(path)-1):
                        weight = G[path[i]][path[i+1]]['weight']
                        mst_links.append({'source': path[i], 'target': path[i+1], 'weight': weight})
            logs.append("Cây đường đi ngắn nhất (SPT) tính xong.")
            steps.append(AlgorithmStep("Hoàn tất OSPF.", mstLinks=mst_links, visited=visited))
            return AlgorithmResult(mstLinks=mst_links, visited=visited, logs=logs, steps=steps)
    except NetworkXNoPath:
        fail_log = "LỖI: Host đích không phản hồi (Destination Unreachable)."
        logs.append(fail_log)
        steps.append(AlgorithmStep(fail_log))
        return AlgorithmResult(logs=logs, steps=steps)

def run_bellman_ford(graph: GraphData, start_id: str, end_id: Optional[str] = None) -> AlgorithmResult:
    logs = []
    steps = []
    G = nx.DiGraph() if graph.is_directed else nx.Graph()
    for node in graph.nodes:
        G.add_node(node['id'])
    for link in graph.links:
        G.add_edge(link['source'], link['target'], weight=link['weight'])
    
    try:
        paths = nx.single_source_bellman_ford_path(G, start_id)
        lengths = nx.single_source_bellman_ford_path_length(G, start_id)
        if end_id:
            path = paths[end_id]
            length = lengths[end_id]
            path_labels = ' -> '.join(get_label(graph, n) for n in path)
            success_log = f"Định tuyến RIP: {path_labels} (Metric: {length})"
            logs.append(success_log)
            steps.append(AlgorithmStep(success_log, path=path, visited=path))
            return AlgorithmResult(path=path, visited=path, logs=logs, steps=steps)
        else:
            mst_links = []
            visited = list(paths.keys())
            for target, path in paths.items():
                if target != start_id:
                    for i in range(len(path)-1):
                        weight = G[path[i]][path[i+1]]['weight']
                        mst_links.append({'source': path[i], 'target': path[i+1], 'weight': weight})
            logs.append("Hoàn tất RIP.")
            steps.append(AlgorithmStep("Hoàn tất RIP.", mstLinks=mst_links, visited=visited))
            return AlgorithmResult(mstLinks=mst_links, visited=visited, logs=logs, steps=steps)
    except NetworkXUnbounded:
        cycle_log = "CRITICAL ERROR: Phát hiện chu trình âm (Negative Cycle)."
        logs.append(cycle_log)
        steps.append(AlgorithmStep(cycle_log))
        return AlgorithmResult(logs=logs, steps=steps)
    except NetworkXNoPath:
        fail_log = "Destination Unreachable."
        logs.append(fail_log)
        steps.append(AlgorithmStep(fail_log))
        return AlgorithmResult(logs=logs, steps=steps)

def run_bfs(graph: GraphData, start_id: str) -> AlgorithmResult:
    visited = []
    queue = deque([start_id])
    visited_set = set([start_id])
    logs = []
    traversed_edges = []
    steps = []
    start_log = f"Broadcast Init: Bắt đầu quảng bá từ {get_label(graph, start_id)}"
    logs.append(start_log)
    steps.append(AlgorithmStep(start_log, visited=visited.copy(), currentNodeId=start_id))
    
    adj = get_adjacency_list(graph)
    while queue:
        u = queue.popleft()
        if u not in visited:
            visited.append(u)
        visit_log = f"Gói tin đến: {get_label(graph, u)}"
        logs.append(visit_log)
        steps.append(AlgorithmStep(visit_log, visited=visited.copy(), currentNodeId=u, traversedEdges=traversed_edges.copy()))
        
        for neighbor in adj[u]:
            v = neighbor['node']
            if v not in visited_set:
                visited_set.add(v)
                queue.append(v)
                traversed_edges.append({'source': u, 'target': v, 'weight': neighbor['weight']})
                discover_log = f" -> Forwarding đến: {get_label(graph, v)}"
                logs.append(discover_log)
                steps.append(AlgorithmStep(discover_log, visited=visited.copy(), currentNodeId=u, traversedEdges=traversed_edges.copy(), currentLinkId={'source': u, 'target': v}))
    
    return AlgorithmResult(visited=visited, traversedEdges=traversed_edges, logs=logs, steps=steps)

def run_dfs(graph: GraphData, start_id: str) -> AlgorithmResult:
    visited = []
    stack = [{'id': start_id, 'from': None}]
    visited_set = set()
    logs = []
    traversed_edges = []
    steps = []
    start_log = f"Deep Trace: Bắt đầu DFS từ {get_label(graph, start_id)}"
    logs.append(start_log)
    steps.append(AlgorithmStep(start_log, visited=[], currentNodeId=start_id))
    
    adj = get_adjacency_list(graph)
    while stack:
        current = stack.pop()
        u = current['id']
        from_node = current['from']
        if u not in visited_set:
            visited_set.add(u)
            visited.append(u)
            if from_node:
                traversed_edges.append({'source': from_node, 'target': u, 'weight': 0})
            visit_log = f"Dò quét Node: {get_label(graph, u)}"
            logs.append(visit_log)
            steps.append(AlgorithmStep(visit_log, visited=visited.copy(), currentNodeId=u, traversedEdges=traversed_edges.copy(), currentLinkId={'source': from_node, 'target': u} if from_node else None))
            
            neighbors = adj[u][::-1]  # reverse for stack
            for neighbor in neighbors:
                v = neighbor['node']
                if v not in visited_set:
                    stack.append({'id': v, 'from': u})
    
    return AlgorithmResult(visited=visited, traversedEdges=traversed_edges, logs=logs, steps=steps)

def run_prim(graph: GraphData) -> AlgorithmResult:
    if graph.is_directed:
        return AlgorithmResult(logs=["Prim Error: Chỉ áp dụng cho vô hướng."])
    
    G = nx.Graph()
    for node in graph.nodes:
        G.add_node(node['id'])
    for link in graph.links:
        G.add_edge(link['source'], link['target'], weight=link['weight'])
    
    mst = nx.minimum_spanning_tree(G, algorithm='prim')
    mst_links = [{'source': u, 'target': v, 'weight': d['weight']} for u, v, d in mst.edges(data=True)]
    visited = list(mst.nodes)
    logs = ["MST Prim hoàn tất."]
    steps = [AlgorithmStep("Hoàn tất", mstLinks=mst_links, visited=visited)]
    return AlgorithmResult(mstLinks=mst_links, visited=visited, logs=logs, steps=steps)

def run_kruskal(graph: GraphData) -> AlgorithmResult:
    if graph.is_directed:
        return AlgorithmResult(logs=["Kruskal Error: Chỉ áp dụng cho vô hướng."])
    
    G = nx.Graph()
    for node in graph.nodes:
        G.add_node(node['id'])
    for link in graph.links:
        G.add_edge(link['source'], link['target'], weight=link['weight'])
    
    mst = nx.minimum_spanning_tree(G, algorithm='kruskal')
    mst_links = [{'source': u, 'target': v, 'weight': d['weight']} for u, v, d in mst.edges(data=True)]
    visited = list(mst.nodes)
    logs = ["MST Kruskal hoàn tất."]
    steps = [AlgorithmStep("Hoàn tất", mstLinks=mst_links, visited=visited)]
    return AlgorithmResult(mstLinks=mst_links, visited=visited, logs=logs, steps=steps)

def run_ford_fulkerson(graph: GraphData, s: str, t: str) -> AlgorithmResult:
    G = nx.DiGraph() if graph.is_directed else nx.Graph()
    for node in graph.nodes:
        G.add_node(node['id'])
    for link in graph.links:
        capacity = link.get('capacity', link['weight'])
        G.add_edge(link['source'], link['target'], capacity=capacity)
        if not graph.is_directed:
            G.add_edge(link['target'], link['source'], capacity=capacity)
    
    flow_value, flow_dict = nx.maximum_flow(G, s, t)
    logs = [f"Max flow: {flow_value} Mbps"]
    steps = [AlgorithmStep(logs[0], flowDetails=flow_dict)]
    flow_details = {}
    for u in flow_dict:
        for v, flow in flow_dict[u].items():
            if flow > 0:
                flow_details[f"{u}->{v}"] = flow
    return AlgorithmResult(maxFlow=flow_value, flowDetails=flow_details, logs=logs, steps=steps)

def get_degrees(graph: GraphData) -> Dict[str, Dict[str, int]]:
    in_degree = defaultdict(int)
    out_degree = defaultdict(int)
    degree = defaultdict(int)
    for node in graph.nodes:
        in_degree[node['id']] = 0
        out_degree[node['id']] = 0
        degree[node['id']] = 0
    for link in graph.links:
        if graph.is_directed:
            out_degree[link['source']] += 1
            in_degree[link['target']] += 1
        else:
            degree[link['source']] += 1
            degree[link['target']] += 1
    return {'inDegree': dict(in_degree), 'outDegree': dict(out_degree), 'degree': dict(degree)}

def run_fleury(graph: GraphData) -> AlgorithmResult:
    degrees = get_degrees(graph)
    logs = []
    steps = []
    # Euler check
    if graph.is_directed:
        start_nodes = sum(1 for id_ in degrees['outDegree'] if degrees['outDegree'][id_] == degrees['inDegree'][id_] + 1)
        end_nodes = sum(1 for id_ in degrees['inDegree'] if degrees['inDegree'][id_] == degrees['outDegree'][id_] + 1)
        balanced = len(graph.nodes) - start_nodes - end_nodes
        if not ((start_nodes == 0 and end_nodes == 0) or (start_nodes == 1 and end_nodes == 1)):
            error = "Fleury Error: Đồ thị không thỏa mãn Euler."
            logs.append(error)
            return AlgorithmResult(logs=logs)
        start_id = next((id_ for id_ in degrees['outDegree'] if degrees['outDegree'][id_] == degrees['inDegree'][id_] + 1), graph.nodes[0]['id'])
    else:
        odd_count = sum(1 for d in degrees['degree'].values() if d % 2 != 0)
        if odd_count not in (0, 2):
            error = "Fleury Error: Số bậc lẻ không hợp lệ."
            logs.append(error)
            return AlgorithmResult(logs=logs)
        start_id = next((id_ for id_, d in degrees['degree'].items() if d % 2 != 0), graph.nodes[0]['id'])
    
    # Use networkx for Fleury-like (since networkx uses Hierholzer internally, but we can simulate)
    G = nx.MultiDiGraph() if graph.is_directed else nx.MultiGraph()
    for node in graph.nodes:
        G.add_node(node['id'])
    for link in graph.links:
        G.add_edge(link['source'], link['target'])
    
    try:
        path_edges = list(nx.eulerian_path(G, source=start_id))
        path = [u for u, v in path_edges] + [path_edges[-1][1]]
        path_labels = ' -> '.join(get_label(graph, n) for n in path)
        final_log = f"Kết quả Fleury: {path_labels}"
        logs.append(final_log)
        steps.append(AlgorithmStep(final_log, path=path, visited=path))
        return AlgorithmResult(path=path, visited=path, logs=logs, steps=steps)
    except nx.NetworkXError as e:
        logs.append(str(e))
        return AlgorithmResult(logs=logs)

def run_hierholzer(graph: GraphData) -> AlgorithmResult:
    degrees = get_degrees(graph)
    logs = []
    steps = []
    if graph.is_directed:
        start_nodes = sum(1 for id_ in degrees['outDegree'] if degrees['outDegree'][id_] == degrees['inDegree'][id_] + 1)
        if start_nodes > 1:
            error = "Hierholzer Error: Đồ thị không thỏa mãn Euler."
            logs.append(error)
            return AlgorithmResult(logs=logs)
        start_id = next((id_ for id_ in degrees['outDegree'] if degrees['outDegree'][id_] == degrees['inDegree'][id_] + 1), graph.nodes[0]['id'])
    else:
        odd_count = sum(1 for d in degrees['degree'].values() if d % 2 != 0)
        if odd_count != 0:
            error = "Hierholzer Error: Số bậc lẻ không hợp lệ."
            logs.append(error)
            return AlgorithmResult(logs=logs)
        start_id = graph.nodes[0]['id']
    
    G = nx.MultiDiGraph() if graph.is_directed else nx.MultiGraph()
    for node in graph.nodes:
        G.add_node(node['id'])
    for link in graph.links:
        G.add_edge(link['source'], link['target'])
    
    try:
        circuit_edges = list(nx.eulerian_circuit(G, source=start_id))
        path = [u for u, v in circuit_edges]
        path_labels = ' -> '.join(get_label(graph, n) for n in path)
        final_log = f"Kết quả Hierholzer: {path_labels}"
        logs.append(final_log)
        steps.append(AlgorithmStep(final_log, path=path, visited=path))
        return AlgorithmResult(path=path, visited=path, logs=logs, steps=steps)
    except nx.NetworkXError as e:
        logs.append(str(e))
        return AlgorithmResult(logs=logs)

def check_bipartite(graph: GraphData) -> AlgorithmResult:
    G = nx.Graph()  # Bipartite check is for undirected
    for node in graph.nodes:
        G.add_node(node['id'])
    for link in graph.links:
        G.add_edge(link['source'], link['target'])
        if graph.is_directed:
            G.add_edge(link['target'], link['source'])  # treat as undirected for check
    
    if nx.is_bipartite(G):
        set_a, set_b = nx.bipartite_sets(G)
        logs = ["Mạng là bipartite."]
        steps = [AlgorithmStep("Hoàn tất", bipartiteSets={'setA': list(set_a), 'setB': list(set_b)})]
        return AlgorithmResult(isBipartite=True, bipartiteSets={'setA': list(set_a), 'setB': list(set_b)}, logs=logs, steps=steps)
    else:
        logs = ["Mạng không phải bipartite."]
        steps = [AlgorithmStep("Hoàn tất")]
        return AlgorithmResult(isBipartite=False, logs=logs, steps=steps)

# Conversion functions
def to_adjacency_matrix(graph: GraphData) -> List[List[int]]:
    node_ids = sorted([n['id'] for n in graph.nodes])
    id_to_idx = {id_: idx for idx, id_ in enumerate(node_ids)}
    matrix = [[0] * len(node_ids) for _ in node_ids]
    for link in graph.links:
        i = id_to_idx[link['source']]
        j = id_to_idx[link['target']]
        matrix[i][j] = link['weight']
        if not graph.is_directed:
            matrix[j][i] = link['weight']
    return matrix

def from_adjacency_matrix(matrix: List[List[int]], is_directed: bool, labels: Optional[List[str]] = None) -> GraphData:
    n = len(matrix)
    nodes = []
    for i in range(n):
        label = labels[i] if labels else f"n{i+1}"
        nodes.append({'id': str(i+1), 'label': label, 'type': 'pc', 'x': 0, 'y': 0})
    links = []
    for i in range(n):
        for j in range(n if is_directed else i+1, n):
            if matrix[i][j] > 0:
                links.append({'source': nodes[i]['id'], 'target': nodes[j]['id'], 'weight': matrix[i][j]})
                if not is_directed:
                    continue
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
    nodes = [{'id': node_map[label], 'label': label, 'type': 'pc', 'x': 0, 'y': 0} for label in node_map]
    links = [{'source': node_map[u], 'target': node_map[v], 'weight': w} for u, v, w in edge_list]
    return GraphData(nodes, links, is_directed)

def to_adjacency_list(graph: GraphData) -> Dict[str, List[Tuple[str, int]]]:
    adj = defaultdict(list)
    for link in graph.links:
        s_label = get_label(graph, link['source'])
        t_label = get_label(graph, link['target'])
        adj[s_label].append((t_label, link['weight']))
        if not graph.is_directed:
            adj[t_label].append((s_label, link['weight']))
    return dict(adj)

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
    nodes = [{'id': node_map[label], 'label': label, 'type': 'pc', 'x': 0, 'y': 0} for label in node_map]
    links = []
    seen = set()
    for s_label in adj_list:
        for t_label, w in adj_list[s_label]:
            key = tuple(sorted([s_label, t_label])) if not is_directed else (s_label, t_label)
            if key not in seen:
                links.append({'source': node_map[s_label], 'target': node_map[t_label], 'weight': w})
                seen.add(key)
    return GraphData(nodes, links, is_directed)
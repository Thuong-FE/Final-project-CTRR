<<<<<<< HEAD
<<<<<<< HEAD
# CTRR_FINAL_BTLON
CTRR_FINAL_BTLON
=======
# Final-project-CTRR
Final project - CTRR
>>>>>>> c9cfe403528bb37725974cb3be3a94a3ea881e85
=======
# Graph Visualizer Backend

API backend cho ứng dụng Graph Visualizer

## Deploy lên Render.com

### Bước 1: Tạo tài khoản Render
1. Truy cập https://render.com
2. Sign up miễn phí (có thể dùng GitHub account)

### Bước 2: Tạo GitHub repository cho backend
```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/graph-visualizer-api.git
git push -u origin main
```

### Bước 3: Deploy trên Render
1. Vào Render Dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Chọn repository `graph-visualizer-api`
5. Render sẽ tự động detect `render.yaml` và configure
6. Click "Create Web Service"
7. Đợi build (3-5 phút)
8. Copy URL (ví dụ: `https://graph-visualizer-api.onrender.com`)

### Bước 4: Test API
```bash
curl https://YOUR_RENDER_URL/
```

### Bước 5: Update frontend
```bash
cd ../frontend
VITE_API_URL=https://YOUR_RENDER_URL npm run build
git add dist
git commit -m "Update with production API"
git push
```

## Local Development

```bash
# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux
# hoặc
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app:app --reload --port 8000
```

## API Endpoints

- `GET /` - Health check
- `POST /bfs` - BFS algorithm
- `POST /dfs` - DFS algorithm
- `POST /dijkstra` - Dijkstra algorithm
- `POST /bellmanFord` - Bellman-Ford algorithm
- `POST /prim` - Prim's algorithm
- `POST /kruskal` - Kruskal's algorithm
- `POST /fordFulkerson` - Ford-Fulkerson algorithm
- `POST /fleury` - Fleury's algorithm
- `POST /hierholzer` - Hierholzer's algorithm
- `POST /bipartite` - Bipartite check
- `POST /toMatrix` - Convert to adjacency matrix
- `POST /toAdjList` - Convert to adjacency list
- `POST /toEdgeList` - Convert to edge list
>>>>>>> 475d63f (Initial commit backend)

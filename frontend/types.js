/**
 * =========================================================
 * FILE: types.js
 * ---------------------------------------------------------
 * Chức năng:
 * - Định nghĩa cấu trúc dữ liệu chuẩn cho:
 *   + Đồ thị (Graph)
 *   + Đỉnh (Node)
 *   + Cạnh (Edge)
 *   + Thuật toán & Animation
 *
 * File này đóng vai trò "Data Contract"
 * dùng chung cho:
 *   - Graph Rendering
 *   - Graph Editing
 *   - Algorithm Visualization
 * =========================================================
 */

/* ========================================================
 * 1️⃣ NODE (ĐỈNH)
 * --------------------------------------------------------
 * - Dùng để vẽ node trên SVG
 * - Có vị trí cố định (KHÔNG random layout)
 * - Hỗ trợ tương tác: click, drag, edit, delete
 * ======================================================== */

/**
 * @typedef {Object} Node
 * @property {string} id            - ID duy nhất của node
 * @property {number} x             - Tọa độ X trên canvas
 * @property {number} y             - Tọa độ Y trên canvas
 * @property {string} label         - Tên hiển thị (PC1, Router A...)
 * @property {'router'|'switch'|'pc'|'server'} type - Loại thiết bị mạng
 */


/* ========================================================
 * 2️⃣ EDGE / LINK (CẠNH)
 * --------------------------------------------------------
 * - Kết nối 2 node
 * - Hỗ trợ đồ thị có hướng / vô hướng
 * - Dùng cho:
 *   + Shortest Path
 *   + MST
 *   + Max Flow
 * ======================================================== */

/**
 * @typedef {Object} Link
 * @property {string} source        - ID node nguồn
 * @property {string} target        - ID node đích
 * @property {number} weight        - Trọng số (cost / latency)
 * @property {number} [capacity]    - Dung lượng (Max Flow)
 * @property {number} [flow]        - Luồng hiện tại (sau khi chạy thuật toán)
 */


/* ========================================================
 * 3️⃣ GRAPH DATA (TOÀN BỘ ĐỒ THỊ)
 * --------------------------------------------------------
 * - Là dữ liệu trung tâm của hệ thống
 * - Dùng cho:
 *   + Vẽ đồ thị
 *   + Lưu / load
 *   + Gửi backend xử lý thuật toán
 * ======================================================== */

/**
 * @typedef {Object} GraphData
 * @property {Node[]} nodes
 * @property {Link[]} links
 * @property {boolean} isDirected   - true: đồ thị có hướng
 */


/* ========================================================
 * 4️⃣ ALGORITHM STEP (TỪNG BƯỚC THUẬT TOÁN)
 * --------------------------------------------------------
 * - Phục vụ animation & mô phỏng
 * - Mỗi step = 1 trạng thái xử lý
 * ======================================================== */

/**
 * @typedef {Object} AlgorithmStep
 * @property {string[]} [visited]        - Danh sách node đã thăm
 * @property {string[]} [path]           - Đường đi hiện tại
 * @property {string|null} [currentNodeId]
 * @property {{source:string,target:string}|null} [currentLinkId]
 * @property {Link[]} [mstLinks]          - Cạnh thuộc MST
 * @property {Link[]} [traversedEdges]    - Cạnh đã duyệt
 * @property {Object.<string,number>} [flowDetails]
 * @property {{setA:string[],setB:string[]}} [bipartiteSets]
 * @property {string} log                - Mô tả bước thuật toán
 */


/* ========================================================
 * 5️⃣ ALGORITHM RESULT (KẾT QUẢ CUỐI)
 * --------------------------------------------------------
 * - Dữ liệu trả về từ backend
 * - Bao gồm kết quả + animation
 * ======================================================== */

/**
 * @typedef {Object} AlgorithmResult
 * @property {string[]} [path]
 * @property {string[]} [visited]
 * @property {Link[]} [mstLinks]
 * @property {Link[]} [traversedEdges]
 * @property {number} [maxFlow]
 * @property {Object.<string,number>} [flowDetails]
 * @property {string[]} logs
 * @property {boolean} [isBipartite]
 * @property {{setA:string[],setB:string[]}} [bipartiteSets]
 * @property {string[]} [eulerPath]
 * @property {AlgorithmStep[]} [steps]
 */


/* ========================================================
 * 6️⃣ ALGORITHM TYPE (CÁC THUẬT TOÁN HỖ TRỢ)
 * --------------------------------------------------------
 * - Dùng để:
 *   + Chọn thuật toán từ UI
 *   + Switch logic backend
 * ======================================================== */

export const AlgorithmType = Object.freeze({
    NONE: 'NONE',
    BFS: 'BFS',
    DFS: 'DFS',
    DIJKSTRA: 'DIJKSTRA',
    BELLMAN_FORD: 'BELLMAN_FORD',
    PRIM: 'PRIM',
    KRUSKAL: 'KRUSKAL',
    FORD_FULKERSON: 'FORD_FULKERSON',
    FLEURY: 'FLEURY',
    HIERHOLZER: 'HIERHOLZER',
    CHECK_BIPARTITE: 'CHECK_BIPARTITE',
  });
  
  
  /* ========================================================
   * 7️⃣ GHI CHÚ THIẾT KẾ (RẤT QUAN TRỌNG)
   * --------------------------------------------------------
   * ✔ Node có tọa độ cố định → không random layout
   * ✔ Edge chỉ gồm source, target, weight, capacity
   * ✔ Phù hợp cho SVG / Canvas rendering
   * ✔ Dễ mở rộng thêm thuật toán mới
   * ======================================================== */
  
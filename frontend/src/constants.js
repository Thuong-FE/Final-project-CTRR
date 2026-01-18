export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 800;
export const DEFAULT_NODE_RADIUS = 20;

// Đồ thị vô hướng: 10 đỉnh, 17 cạnh - Euler circuit (Fleury, Hierholzer)
export const SAMPLE_GRAPH_DATA = {
  isDirected: false,
  nodes: [
    { id: "1", label: "1", x: 150, y: 100 },
    { id: "2", label: "2", x: 380, y: 80 },
    { id: "3", label: "3", x: 550, y: 180 },
    { id: "4", label: "4", x: 80, y: 320 },
    { id: "5", label: "5", x: 300, y: 250 },
    { id: "6", label: "6", x: 520, y: 380 },
    { id: "7", label: "7", x: 180, y: 520 },
    { id: "8", label: "8", x: 400, y: 480 },
    { id: "9", label: "9", x: 600, y: 550 },
    { id: "10", label: "10", x: 320, y: 650 }
  ],
  links: [
    // Cạnh ngang/chéo trên
    { source: "1", target: "2", weight: 3, capacity: 1 },
    { source: "2", target: "3", weight: 2, capacity: 1 },
    { source: "1", target: "5", weight: 4, capacity: 1 },
    // Cạnh chéo dài
    { source: "2", target: "6", weight: 5, capacity: 1 },
    { source: "3", target: "6", weight: 3, capacity: 1 },
    // Cạnh bên trái
    { source: "1", target: "4", weight: 4, capacity: 1 },
    { source: "4", target: "7", weight: 2, capacity: 1 },
    // Cạnh giữa
    { source: "4", target: "5", weight: 3, capacity: 1 },
    { source: "5", target: "8", weight: 2, capacity: 1 },
    { source: "6", target: "8", weight: 4, capacity: 1 },
    // Cạnh dưới
    { source: "7", target: "10", weight: 3, capacity: 1 },
    { source: "8", target: "10", weight: 2, capacity: 1 },
    { source: "8", target: "9", weight: 3, capacity: 1 },
    { source: "6", target: "9", weight: 2, capacity: 1 },
    // Cạnh bổ sung để tạo Euler circuit (tất cả đỉnh bậc chẵn)
    { source: "1", target: "3", weight: 3, capacity: 1 },
    { source: "3", target: "4", weight: 4, capacity: 1 },
    { source: "2", target: "5", weight: 2, capacity: 1 }
  ]
};

// Đồ thị có hướng: 8 đỉnh, 12 cạnh - layout tự nhiên
export const DIRECTED_GRAPH_DATA = {
  isDirected: true,
  nodes: [
    { id: "A", label: "A", x: 120, y: 120 },
    { id: "B", label: "B", x: 350, y: 80 },
    { id: "C", label: "C", x: 550, y: 200 },
    { id: "D", label: "D", x: 150, y: 350 },
    { id: "E", label: "E", x: 380, y: 300 },
    { id: "F", label: "F", x: 600, y: 420 },
    { id: "G", label: "G", x: 220, y: 550 },
    { id: "H", label: "H", x: 480, y: 520 }
  ],
  links: [
    // Nhánh trên: A → B → C → F
    { source: "A", target: "B", weight: 5, capacity: 10 },
    { source: "B", target: "C", weight: 2, capacity: 6 },
    { source: "C", target: "F", weight: 3, capacity: 5 },
    // Nhánh dưới: A → D → G → H
    { source: "A", target: "D", weight: 3, capacity: 8 },
    { source: "D", target: "G", weight: 4, capacity: 4 },
    { source: "G", target: "H", weight: 5, capacity: 7 },
    // Cạnh nối giữa
    { source: "B", target: "E", weight: 4, capacity: 7 },
    { source: "D", target: "E", weight: 1, capacity: 9 },
    { source: "E", target: "F", weight: 3, capacity: 6 },
    { source: "E", target: "H", weight: 2, capacity: 8 },
    // Cạnh phụ
    { source: "C", target: "H", weight: 6, capacity: 4 },
    { source: "F", target: "H", weight: 4, capacity: 5 }
  ]
};

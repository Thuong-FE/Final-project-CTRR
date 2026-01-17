export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 1000;
export const DEFAULT_NODE_RADIUS = 20;

export const SAMPLE_GRAPH_DATA = {
  isDirected: true,   // ⚠️ đồng bộ với GraphCanvas
  nodes: [
    { id: "1", x: 100, y: 100 },
    { id: "2", x: 300, y: 100 },
    { id: "3", x: 500, y: 100 },
    { id: "4", x: 100, y: 300 },
    { id: "5", x: 300, y: 300 },
    { id: "6", x: 500, y: 300 },
    { id: "7", x: 100, y: 500 },
    { id: "8", x: 300, y: 500 },
    { id: "9", x: 500, y: 500 },
    { id: "10", x: 300, y: 650 }
  ],
  links: [
    { source: "1", target: "6", weight: 1, capacity: 1 },
    { source: "1", target: "7", weight: 1, capacity: 1 },

    { source: "2", target: "7", weight: 1, capacity: 1 },
    { source: "2", target: "8", weight: 1, capacity: 1 },

    { source: "3", target: "8", weight: 1, capacity: 1 },
    { source: "3", target: "9", weight: 1, capacity: 1 },

    { source: "4", target: "9", weight: 1, capacity: 1 },
    { source: "4", target: "10", weight: 1, capacity: 1 },

    { source: "5", target: "6", weight: 1, capacity: 1 },
    { source: "5", target: "10", weight: 1, capacity: 1 }
  ]
};


import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { graph } = req.body;

    if (!graph || !graph.nodes || !graph.links) {
      return res.status(400).json({ error: "Dữ liệu đồ thị không hợp lệ" });
    }

    // Khởi tạo Gemini AI (API KEY nằm ở server)
    const ai = new GoogleGenAI({
      apiKey: process.env.API_KEY,
    });

    const prompt = `

Phân tích mạng sau:
- Nodes: ${JSON.stringify(
      graph.nodes.map(n => ({
        id: n.id,
        label: n.label,
        type: n.type,
      }))
    )}
- Links: ${JSON.stringify(
      graph.links.map(l => ({
        from: l.source,
        to: l.target,
        weight: l.weight,
      }))
    )}
- Loại đồ thị: ${graph.isDirected ? "Có hướng" : "Vô hướng"}

Yêu cầu (Markdown):
1. Đánh giá tính liên thông và SPOF.
2. Nhận xét khả năng định tuyến.
3. Đề xuất cải thiện bảo mật mạng.
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const text = response.text || "Không thể phân tích đồ thị.";

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("Analyze API error:", error);
    return res.status(500).json({ error: "Lỗi server khi phân tích AI" });
  }
}

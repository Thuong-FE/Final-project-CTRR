
export const analyzeGraphSecurity = async (graph) => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ graph }),
      });
  
      if (!response.ok) {
        throw new Error("Không thể gọi API phân tích");
      }
  
      const data = await response.json();
      return data.result;
  
    } catch (error) {
      console.error("Client analyze error:", error);
      return "Không thể kết nối đến hệ thống phân tích AI.";
    }
  };
  
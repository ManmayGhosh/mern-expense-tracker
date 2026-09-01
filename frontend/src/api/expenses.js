import client from "./client";

export const ExpensesAPI = {
  list: (params) => client.get("/expenses", { params }).then((r) => r.data),
  create: (payload) => client.post("/expenses", payload).then((r) => r.data),
  update: (id, payload) => client.put(`/expenses/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/expenses/${id}`).then((r) => r.data),
  summary: (params) => client.get("/expenses/summary", { params }).then((r) => r.data),
  monthly: (params) => client.get("/expenses/monthly", { params }).then((r) => r.data),
  predict: () => client.get("/expenses/predict").then((r) => r.data),
  categorize: (note) => client.post("/expenses/categorize", { note }).then((r) => r.data),
  exportCsv: () => client.get("/expenses/export", { responseType: "blob" }).then((r) => r.data),
};

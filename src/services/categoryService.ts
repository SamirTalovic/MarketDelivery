const API_URL = "http://localhost:7007/api/Category";

export const getCategories = async () => {
  const res = await fetch(API_URL);
  return await res.json();
};

export const createCategory = async (data: { name: string; emoji: string }) => {
  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const updateCategory = async (id: number, data: { name: string; emoji: string }) => {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const deleteCategory = async (id: number) => {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
};

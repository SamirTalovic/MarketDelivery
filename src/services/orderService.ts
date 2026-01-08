import axios from "axios";

const API_URL = "http://localhost:7007/api/Order"; // promeni ako je drugi port

// 🔹 Uzmi sve porudžbine
export const getOrders = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// 🔹 Uzmi jednu
export const getOrderById = async (id: number) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// 🔹 Kreiraj novu
export const createOrder = async (orderData: any) => {
  const res = await axios.post(API_URL, orderData);
  return res.data;
};

// 🔹 Update cele porudžbine
export const updateOrder = async (id: number, data: any) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

// 🔹 Promena statusa (Pending -> Preparing -> Delivering -> Done)
export const updateOrderStatus = async (id: number, status: string) => {
  const res = await axios.patch(`${API_URL}/status/${id}?status=${status}`);
  return res.data;
};

// 🔹 Verifikacija (npr: primljena/odobrena)
export const verifyOrder = async (id: number) => {
  const res = await axios.patch(`${API_URL}/verify/${id}`);
  return res.data;
};

// 🔹 Brisanje porudžbine
export const deleteOrder = async (id: number) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

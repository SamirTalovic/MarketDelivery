// 📌 src/services/orderSocket.ts
import * as signalR from "@microsoft/signalr";

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") 
  || "http://localhost:7007";

const hubUrl = `${API_BASE_URL}/orderHub`;

console.log("Connecting to:", hubUrl);

export const orderHubConnection = new signalR.HubConnectionBuilder()
  .withUrl(hubUrl, {
    withCredentials: false
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

export const startOrderSocket = async () => {
  try {
    await orderHubConnection.start();
    console.log("🔌 Connected to OrderHub!");
  } catch (error) {
    console.warn("❌ Connection failed, retrying in 3s...", error);
    setTimeout(startOrderSocket, 3000);
  }
};

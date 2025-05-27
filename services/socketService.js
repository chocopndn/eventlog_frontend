import io from "socket.io-client";
import { API_URL } from "../config/config";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      const serverUrl = API_URL;

      try {
        this.socket = io(serverUrl, {
          withCredentials: true,
          transports: ["polling", "websocket"],
          timeout: 10000,
          forceNew: true,
        });

        this.socket.on("connect", () => {});
        this.socket.on("disconnect", (reason) => {});
        this.socket.on("connect_error", (error) => {});
        this.socket.onAny((event, ...args) => {});
      } catch (error) {}
    }
  }

  disconnect() {
    if (this.socket) {
      try {
        this.socket.disconnect();
        this.socket = null;
      } catch (error) {}
    }
  }

  joinRoom(room) {
    if (this.socket && this.socket.connected) {
      try {
        this.socket.emit("join-room", room);
      } catch (error) {}
    }
  }

  leaveRoom(room) {
    if (this.socket && this.socket.connected) {
      try {
        this.socket.emit("leave-room", room);
      } catch (error) {}
    }
  }
}

const socketService = new SocketService();
export default socketService;

import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "@/config/api";

const HUB_BASE_URL = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL;
const NOTIFICATION_HUB_URL = `${HUB_BASE_URL}/hubs/notification`;

class NotificationHubService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.connectionPromise = null;
  }

  async startConnection() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return Promise.reject(new Error("Missing access token"));
    }

    if (this.connection && this.isConnected) {
      return this.connection;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(NOTIFICATION_HUB_URL, {
        accessTokenFactory: () => localStorage.getItem("accessToken") || "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.onreconnecting(() => {
      this.isConnected = false;
    });

    this.connection.onreconnected(() => {
      this.isConnected = true;
    });

    this.connection.onclose(() => {
      this.isConnected = false;
    });

    this.connectionPromise = this.connection
      .start()
      .then(() => {
        this.isConnected = true;
        this.connectionPromise = null;
        return this.connection;
      })
      .catch((error) => {
        this.isConnected = false;
        this.connectionPromise = null;
        throw error;
      });

    return this.connectionPromise;
  }

  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
      } finally {
        this.connection = null;
        this.isConnected = false;
        this.connectionPromise = null;
      }
    }
  }

  onNotificationReceived(callback) {
    if (this.connection && typeof callback === "function") {
      this.connection.off("ReceiveNotification");
      this.connection.on("ReceiveNotification", callback);
    }
  }

  offNotificationReceived(callback) {
    if (this.connection) {
      if (callback) {
        this.connection.off("ReceiveNotification", callback);
      } else {
        this.connection.off("ReceiveNotification");
      }
    }
  }
}

const notificationHubService = new NotificationHubService();
export default notificationHubService;

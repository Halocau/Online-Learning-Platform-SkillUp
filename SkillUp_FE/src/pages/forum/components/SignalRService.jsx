import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async startConnection() {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    
    if (!token) {
      console.warn("No authentication token found for SignalR connection");
      return;
    }

    try {
      // Build the connection with proper CORS configuration
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5120/commentHub", {
          accessTokenFactory: () => token,
          // Try different transport methods if WebSockets fail
          transport: signalR.HttpTransportType.WebSockets | 
                    signalR.HttpTransportType.ServerSentEvents | 
                    signalR.HttpTransportType.LongPolling,
          // Include credentials for CORS
          withCredentials: true,
          // Headers for CORS
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry intervals
        .configureLogging(signalR.LogLevel.Warning) // Reduce log verbosity
        .build();

      // Connection event handlers
      this.connection.onreconnecting(() => {
        console.log("🔄 SignalR reconnecting...");
        this.isConnected = false;
      });

      this.connection.onreconnected(() => {
        console.log("✅ SignalR reconnected");
        this.isConnected = true;
      });

      this.connection.onclose(() => {
        console.log("❌ SignalR connection closed");
        this.isConnected = false;
      });

      // Start connection
      await this.connection.start();
      this.isConnected = true;
      console.log("✅ SignalR connected successfully");
    } catch (error) {
      console.error("❌ SignalR connection failed:", error);
      this.isConnected = false;
      throw error;
    }
  }

  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.isConnected = false;
        console.log("SignalR connection stopped");
      } catch (error) {
        console.error("Error stopping SignalR connection:", error);
      }
    }
  }

  // Join a post's comment room
  async joinPostRoom(postId) {
    if (!this.isConnected) {
      await this.startConnection();
    }
    
    try {
      await this.connection.invoke("JoinPostRoom", postId);
      console.log(`Joined room for post ${postId}`);
    } catch (error) {
      console.error("Error joining post room:", error);
    }
  }

  // Leave a post's comment room
  async leavePostRoom(postId) {
    if (this.isConnected) {
      try {
        await this.connection.invoke("LeavePostRoom", postId);
        console.log(`Left room for post ${postId}`);
      } catch (error) {
        console.error("Error leaving post room:", error);
      }
    }
  }

  // Register event handlers for real-time updates
  onCommentCreated(callback) {
    if (this.connection) {
      this.connection.on("CommentCreated", callback);
    }
  }

  onCommentUpdated(callback) {
    if (this.connection) {
      this.connection.on("CommentUpdated", callback);
    }
  }

  onCommentDeleted(callback) {
    if (this.connection) {
      this.connection.on("CommentDeleted", callback);
    }
  }

  onCommentLiked(callback) {
    if (this.connection) {
      this.connection.on("CommentLiked", callback);
    }
  }

  // Remove event handlers
  offCommentCreated() {
    if (this.connection) {
      this.connection.off("CommentCreated");
    }
  }

  offCommentUpdated() {
    if (this.connection) {
      this.connection.off("CommentUpdated");
    }
  }

  offCommentDeleted() {
    if (this.connection) {
      this.connection.off("CommentDeleted");
    }
  }

  offCommentLiked() {
    if (this.connection) {
      this.connection.off("CommentLiked");
    }
  }
}

// Create singleton instance
const signalRService = new SignalRService();
export default signalRService;
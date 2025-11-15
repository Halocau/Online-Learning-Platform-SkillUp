// Đường dẫn: src/pages/forum/components/SignalRService.jsx
// (Hãy copy và dán toàn bộ code này để thay thế file cũ)

import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.connectionPromise = null; // Để tránh gọi .start() nhiều lần
  }

  startConnection() {
    // Nếu đã kết nối, trả về promise đã hoàn thành
    if (this.connection && this.isConnected) {
      return Promise.resolve(this.connection);
    }

    // Nếu đang kết nối, trả về promise đang chờ
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.warn("Chưa đăng nhập, không thể kết nối SignalR.");
      return Promise.reject("Không có token");
    }

    this.connection = new signalR.HubConnectionBuilder()
      // SỬA URL NÀY NẾU CẦN (port 5120 là port backend của bạn)
      .withUrl("http://localhost:5120/commentHub", { 
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // Tự động kết nối lại
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Các hàm lắng nghe trạng thái kết nối
    this.connection.onreconnecting(() => {
      console.log("🔄 SignalR đang kết nối lại...");
      this.isConnected = false;
    });

    this.connection.onreconnected(() => {
      console.log("✅ SignalR đã kết nối lại");
      this.isConnected = true;
    });

    this.connection.onclose(() => {
      console.log("❌ SignalR đã đóng kết nối");
      this.isConnected = false;
    });

    // Bắt đầu kết nối
    this.connectionPromise = this.connection
      .start()
      .then(() => {
        this.isConnected = true;
        console.log("✅ SignalR đã kết nối thành công");
        this.connectionPromise = null; // Reset promise khi thành công
        return this.connection;
      })
      .catch((error) => {
        console.error("❌ Lỗi kết nối SignalR:", error);
        this.isConnected = false;
        this.connectionPromise = null; // Reset promise khi thất bại
        throw error;
      });
    
    return this.connectionPromise;
  }

  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.isConnected = false;
        console.log("SignalR đã dừng kết nối");
      } catch (error) {
        console.error("Lỗi khi dừng SignalR:", error);
      }
    }
  }

  // === CÁC HÀM TƯƠNG TÁC VỚI HUB ===

  // Tên hàm phải khớp với CommentHub.cs
  async joinPostGroup(postId) {
    if (!this.isConnected) {
      // Sẽ đợi startConnection() hoàn thành nếu nó đang chạy
      await this.startConnection(); 
    }
    try {
      await this.connection.invoke("JoinPostGroup", postId);
      console.log(`Đã tham gia group ${postId}`);
    } catch (error) {
      console.error("Lỗi khi tham gia group:", error);
    }
  }

  // Tên hàm phải khớp với CommentHub.cs
  async leavePostGroup(postId) {
    if (this.isConnected) {
      try {
        await this.connection.invoke("LeavePostGroup", postId);
        console.log(`Đã rời group ${postId}`);
      } catch (error) {
        console.error("Lỗi khi rời group:", error);
      }
    }
  }

  // --- CÁC HÀM LẮNG NGHE (Tên khớp với Controller) ---

  onCommentReceived(callback) {
    if (this.connection) {
      this.connection.on("ReceiveComment", callback);
    }
  }

  onCommentUpdated(callback) {
    if (this.connection) {
      this.connection.on("UpdateComment", callback);
    }
  }

  onCommentDeleted(callback) {
    if (this.connection) {
      this.connection.on("DeleteComment", callback);
    }
  }

  // --- CÁC HÀM GỠ LẮNG NGHE ---

  offCommentReceived() {
    if (this.connection) {
      this.connection.off("ReceiveComment");
    }
  }

  offCommentUpdated() {
    if (this.connection) {
      this.connection.off("UpdateComment");
    }
  }

  offCommentDeleted() {
    if (this.connection) {
      this.connection.off("DeleteComment");
    }
  }
}

// Xuất đi một đối tượng duy nhất (singleton)
const signalRService = new SignalRService();
export default signalRService;
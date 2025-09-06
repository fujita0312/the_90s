import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(): Socket {
    if (!this.socket) {
      // Connect to the server - adjust URL based on your setup
      const serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5003';
      this.socket = io(serverUrl + '/chat', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('Connected to chat server');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.isConnected = false;
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Chat specific methods
  joinChatroom(userId: string, username: string): void {
    if (this.socket) {
      this.socket.emit('join_chatroom', { userId, username });
    }
  }

  sendMessage(message: string, roomId: string): void {
    if (this.socket) {
      console.log('Emitting send_message:', { message, roomId });
      this.socket.emit('send_message', {
        message,
        roomId,
      });
    } else {
      console.error('Socket not connected');
    }
  }

  selectUser(userId: string | null): void {
    if (this.socket) {
      this.socket.emit('select_user', { userId });
    }
  }

  markMessagesAsRead(messageIds: string[]): void {
    if (this.socket) {
      this.socket.emit('mark_messages_read', { messageIds });
    }
  }

  onMessageReceived(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('message_received', callback);
    }
  }

  onUserJoined(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user_joined', callback);
    }
  }

  onUserLeft(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user_left', callback);
    }
  }

  // Remove listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  removeListener(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;

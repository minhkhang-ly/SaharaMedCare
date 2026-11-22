/**
 * SaharaMedCare - Realtime Socket.IO Client Service
 * Listens for live lab order status updates: RECEIVED -> PROCESSING -> COMPLETED
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Khởi tạo kết nối Socket.IO
 */
export function initSocketConnection() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log(`[Socket.IO Client] Đã kết nối với LIS Realtime Server: ${socket.id}`);
    });

    socket.on('connect_error', (error) => {
      console.warn(`[Socket.IO Client] Lỗi kết nối socket: ${error.message}`);
    });
  }
  return socket;
}

/**
 * Đăng ký lắng nghe cập nhật tiến trình của phiếu chỉ định (orderId)
 */
export function subscribeOrderStatus(orderId, onStatusUpdate) {
  const sk = initSocketConnection();
  if (!sk || !orderId) return () => {};

  sk.emit('subscribe_order_status', orderId);

  const handleUpdate = (data) => {
    console.log(`[Socket.IO Client] Nhận cập nhật trạng thái mới cho ${orderId}:`, data);
    if (typeof onStatusUpdate === 'function') {
      onStatusUpdate(data);
    }
  };

  sk.on('order_status_updated', handleUpdate);

  // Trả về hàm hủy đăng ký (cleanup)
  return () => {
    sk.emit('unsubscribe_order_status', orderId);
    sk.off('order_status_updated', handleUpdate);
  };
}

/**
 * Lấy instance socket hiện tại
 */
export function getSocket() {
  return socket || initSocketConnection();
}

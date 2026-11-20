/**
 * Socket.IO handler for real-time sample processing and result status updates
 */
export function initLabStatusSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for a specific patient or lab order
    socket.on('subscribe_order_status', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`[Socket.IO] Client ${socket.id} subscribed to order_${orderId}`);
    });

    // Handle unsubscribe
    socket.on('unsubscribe_order_status', (orderId) => {
      socket.leave(`order_${orderId}`);
      console.log(`[Socket.IO] Client ${socket.id} unsubscribed from order_${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}

export function broadcastOrderStatus(io, orderId, statusData) {
  io.to(`order_${orderId}`).emit('order_status_updated', statusData);
}

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import labResultRoutes from './routes/labResultRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import { initLabStatusSocket } from './sockets/labStatusSocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO configuration for realtime updates (sample status, lab ready alerts)
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/lab-results', labResultRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/patients', patientRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'SaharaMedCare API Server',
    timestamp: new Date().toISOString()
  });
});

// Initialize Socket.IO handlers
initLabStatusSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SaharaMedCare Server] Running on http://localhost:${PORT}`);
});

export { app, io };

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import labResultRoutes from './routes/labResultRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { initLabStatusSocket } from './sockets/labStatusSocket.js';
import { checkDbConnection } from './config/db.js';

import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO configuration for realtime updates
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/lab-results', labResultRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'SaharaMedCare API Server',
    phase: 'Phase 1 - Core LIS RESTful API & Medical Database',
    developer: 'Nguyễn Thế Ngọc (Backend Developer)',
    branch: 'feat/backend-ai',
    timestamp: new Date().toISOString()
  });
});

// API Root summary
app.get('/api', (req, res) => {
  res.json({
    name: 'SaharaMedCare API Documentation',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      lookup: 'POST /api/patients/lookup',
      patients: {
        list: 'GET /api/patients',
        detail: 'GET /api/patients/:patientId',
        create: 'POST /api/patients',
        update: 'PUT /api/patients/:patientId',
        delete: 'DELETE /api/patients/:patientId'
      },
      labResults: {
        byPatient: 'GET /api/lab-results/patient/:patientId (or /api/lab-results/:patientId)',
        ordersList: 'GET /api/lab-results/orders',
        orderDetail: 'GET /api/lab-results/orders/:orderId',
        createOrder: 'POST /api/lab-results/orders',
        updateStatus: 'PATCH /api/lab-results/orders/:orderId/status',
        addResults: 'POST /api/lab-results/orders/:orderId/results',
        addImages: 'POST /api/lab-results/orders/:orderId/images'
      },
      doctors: {
        list: 'GET /api/doctors',
        detail: 'GET /api/doctors/:doctorId',
        create: 'POST /api/doctors',
        update: 'PUT /api/doctors/:doctorId'
      },
      catalog: {
        tests: 'GET /api/catalog/tests',
        categories: 'GET /api/catalog/categories',
        guidelines: 'GET /api/catalog/guidelines'
      },
      chatbot: 'POST /api/chatbot/chat'
    }
  });
});

// Initialize Socket.IO handlers
initLabStatusSocket(io);

const PORT = process.env.PORT || 5000;

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  checkDbConnection().then(() => {
    server.listen(PORT, () => {
      console.log(`==================================================================`);
      console.log(`🏥 [SaharaMedCare Server] Running on http://localhost:${PORT}`);
      console.log(`📡 [API Health Check]    http://localhost:${PORT}/api/health`);
      console.log(`📚 [API Endpoints List]  http://localhost:${PORT}/api`);
      console.log(`==================================================================`);
    });
  });
}

export { app, io, server };

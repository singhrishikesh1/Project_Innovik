import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-name']
}));

app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Root health & status
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'VajraShield Enterprise Disaster Operations Backend',
    engine: 'VajraWatch Risk & Spatial Intelligence Engine',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint Not Found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error] Unhandled exception:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err?.message || 'An unexpected error occurred in the command subsystem.',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(` VAJRASHIELD DISASTER OPERATIONS COMMAND BACKEND ONLINE `);
  console.log(` Port: http://localhost:${PORT}                           `);
  console.log(` Health: http://localhost:${PORT}/health                  `);
  console.log(` REST APIs: http://localhost:${PORT}/api                  `);
  console.log(`========================================================`);
});

export default app;

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { Sandbox } from '@e2b/sdk';
import { startPoller } from './workers/telemetryPoller';

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }
});

const prisma = new PrismaClient();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// --- SANDBOX ENDPOINTS ---

// 1. Manually add an existing Sandbox by ID
app.post('/api/sandboxes', async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'ID and name required' });
    const sandbox = await prisma.sandbox.create({ data: { id, name } });
    res.json(sandbox);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sandbox or ID already exists.' });
  }
});

// 2. Spawn a brand new Sandbox in the E2B Cloud
app.post('/api/sandboxes/spawn', async (req, res) => {
  try {
    console.log("Spawning new E2B Sandbox in the cloud...");
    
    // Grab the key from the environment, OR use the hardcoded string if the .env fails
    const apiKey = process.env.E2B_API_KEY || "e2b_1070f69b9bbb0c7a7cbc4a1c0edb00c99021d84e";
    
    // Explicitly pass the key, just like we did in the spike test
    const sandbox = await Sandbox.create({ apiKey });
    
    const newSandboxId = sandbox.sandboxId; 
    
    console.log(`Successfully created Sandbox! ID: ${newSandboxId}`);

    // Register the new sandbox in our local database
    const dbRecord = await prisma.sandbox.create({ 
      data: { 
        id: newSandboxId, 
        name: `Cloud Agent - ${newSandboxId.substring(0, 5)}` 
      } 
    });

    res.json(dbRecord);
  } catch (error) {
    console.error("Failed to spawn sandbox:", error);
    res.status(500).json({ error: 'Failed to communicate with E2B servers.' });
  }
});

// 3. List all registered Sandboxes
app.get('/api/sandboxes', async (req, res) => {
  try {
    const sandboxes = await prisma.sandbox.findMany({ 
      include: { _count: { select: { alerts: { where: { dismissed: false } } } } } 
    });
    res.json(sandboxes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sandboxes.' });
  }
});

// 4. Get a specific Sandbox by ID
app.get('/api/sandboxes/:id', async (req, res) => {
  try {
    const sandbox = await prisma.sandbox.findUnique({ where: { id: req.params.id } });
    if (!sandbox) return res.status(404).json({ error: 'Not found' });
    res.json(sandbox);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sandbox.' });
  }
});

// 5. Delete/Stop Monitoring a Sandbox
app.delete('/api/sandboxes/:id', async (req, res) => {
  try {
    await prisma.sandbox.delete({ where: { id: req.params.id } });
    
    // Optionally: If you want to actually KILL the sandbox in E2B when deleting it from the UI,
    // you would add: `await Sandbox.kill(req.params.id);` here.
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sandbox.' });
  }
});

// --- ALERT ENDPOINTS ---

app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { timestamp: 'desc' },
      include: { sandbox: { select: { name: true } } }
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts.' });
  }
});

app.patch('/api/alerts/:id/dismiss', async (req, res) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { dismissed: true }
    });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to dismiss alert.' });
  }
});

// --- WEBSOCKETS ---

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe_sandbox', (sandboxId) => {
    socket.join(`sandbox_${sandboxId}`);
  });

  socket.on('unsubscribe_sandbox', (sandboxId) => {
    socket.leave(`sandbox_${sandboxId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// --- SERVER STARTUP ---

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startPoller();
});
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { BotEngine } from "./services/botEngine";
import { AlgorithmEngine } from "./services/algorithmEngine";
import { insertAlgorithmConfigSchema } from "@shared/schema";

const botEngine = new BotEngine();
const algorithmEngine = new AlgorithmEngine();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Start real-time broadcasting
  setInterval(async () => {
    try {
      const posts = await storage.getPosts(10);
      const stats = await storage.getSimulationStats();
      const config = await storage.getAlgorithmConfig();
      const bots = await storage.getBots();

      // Add bot info to posts
      const postsWithBots = await Promise.all(posts.map(async (post) => {
        const bot = await storage.getBot(post.botId);
        return { ...post, bot };
      }));

      broadcast({
        type: 'simulation_update',
        data: {
          posts: postsWithBots,
          stats,
          config,
          botStatus: botEngine.getStatus(),
          algorithmStatus: algorithmEngine.getStatus(),
          activeBots: bots.filter(bot => bot.isActive === 1).length
        }
      });
    } catch (error) {
      console.error('Broadcast error:', error);
    }
  }, 1000);

  // API Routes
  app.get("/api/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPosts(limit, offset);
      
      // Add bot information to each post
      const postsWithBots = await Promise.all(posts.map(async (post) => {
        const bot = await storage.getBot(post.botId);
        return { ...post, bot };
      }));
      
      res.json(postsWithBots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/bots", async (req, res) => {
    try {
      const bots = await storage.getBots();
      res.json(bots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bots" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getSimulationStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/algorithm-config", async (req, res) => {
    try {
      const config = await storage.getAlgorithmConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch algorithm config" });
    }
  });

  app.post("/api/algorithm-config", async (req, res) => {
    try {
      const validatedData = insertAlgorithmConfigSchema.parse(req.body);
      
      await algorithmEngine.updateWeights(
        parseFloat(validatedData.engagementWeight || "0.4"),
        parseFloat(validatedData.recencyWeight || "0.3"),
        parseFloat(validatedData.relevanceWeight || "0.3")
      );
      
      const config = await storage.getAlgorithmConfig();
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: "Invalid algorithm config data" });
    }
  });

  app.patch("/api/bots/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedBot = await storage.updateBot(id, updates);
      if (!updatedBot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      
      res.json(updatedBot);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot" });
    }
  });

  app.post("/api/simulation/control", async (req, res) => {
    try {
      const { action, speed } = req.body;
      
      switch (action) {
        case 'start':
          botEngine.start();
          algorithmEngine.start();
          break;
        case 'pause':
          botEngine.pause();
          algorithmEngine.pause();
          break;
        case 'reset':
          botEngine.pause();
          algorithmEngine.pause();
          // Reset could clear all data if needed
          break;
        case 'speed':
          if (typeof speed === 'number') {
            botEngine.setSpeed(speed);
          }
          break;
      }
      
      res.json({ 
        success: true, 
        botStatus: botEngine.getStatus(),
        algorithmStatus: algorithmEngine.getStatus()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to control simulation" });
    }
  });

  return httpServer;
}
